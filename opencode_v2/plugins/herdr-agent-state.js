// installed by herdr
// managed by herdr; reinstalling or updating the integration overwrites this file.
// add custom hooks/plugins beside this file instead of editing it.
// HERDR_INTEGRATION_ID=opencode
// HERDR_INTEGRATION_VERSION=10
//
// Supports both OpenCode V1 (named HerdrAgentStatePlugin export with
// `chat.message`/`event` hooks) and OpenCode V2 (`export default` plugin
// definition with `ctx.session.hook`/`ctx.tool.hook`/`ctx.event.subscribe`).
// V2 intentionally changed the plugin API ("V1 plugins will not work in V2"),
// the event envelope (`event.data` instead of `event.properties`), the
// session.status shape ({type: idle|busy|retry}), and replaced
// question.* with form.* and tool.execute.* with session.tool.* events.

import net from "node:net";

const SOURCE = "herdr:opencode";
const AGENT = "opencode";
let reportSeq = Date.now() * 1000;
let requestChain = Promise.resolve();
let reportedRootSessionID;

// Track child sessions so their events cannot replace the pane's root session.
// Their user prompts still project state without attaching the child session id.
const childSessions = new Set();
const CHILD_EVENT_STATES = new Map([
  ["permission.asked", "blocked"],
  ["question.asked", "blocked"],
  ["form.created", "blocked"],
  ["permission.replied", "working"],
  ["question.replied", "working"],
  ["question.rejected", "working"],
  ["form.replied", "working"],
  ["form.cancelled", "working"],
]);

function nextReportSeq() {
  reportSeq += 1;
  return reportSeq;
}

function sessionIDFromProperties(properties) {
  return typeof properties?.sessionID === "string" && properties.sessionID
    ? properties.sessionID
    : undefined;
}

// V2 events carry `data` (V1 used `properties`). form.created nests the
// session id under data.form.sessionID.
function sessionIDFromEvent(event) {
  const data = event?.data;
  if (data) {
    if (typeof data.sessionID === "string" && data.sessionID) {
      return data.sessionID;
    }
    const formSessionID = data.form?.sessionID;
    if (typeof formSessionID === "string" && formSessionID) {
      return formSessionID;
    }
  }
  return sessionIDFromProperties(event?.properties);
}

function parentIDFromEvent(event) {
  const parentID = event?.data?.parentID;
  if (typeof parentID === "string" && parentID) {
    return parentID;
  }
  const info = event?.properties?.info;
  if (info && typeof info.parentID === "string" && info.parentID) {
    return info.parentID;
  }
  return undefined;
}

const SESSION_STATE_BY_STATUS = new Map([
  ["idle", "idle"],
  ["active", "working"],
  ["busy", "working"],
  ["pending", "working"],
  ["retry", "working"],
  ["running", "working"],
  ["streaming", "working"],
  ["working", "working"],
]);

function stateFromSessionStatus(status) {
  const kind = typeof status === "string" ? status : status?.type;
  return typeof kind === "string"
    ? SESSION_STATE_BY_STATUS.get(kind.toLowerCase())
    : undefined;
}

function request(method, params) {
  const pending = requestChain.then(() => requestOnce(method, params));
  requestChain = pending.catch(() => {});
  return pending;
}

function requestOnce(method, params) {
  const paneId = process.env.HERDR_PANE_ID;
  const socketPath = process.env.HERDR_SOCKET_PATH;

  if (!paneId || !socketPath) {
    return Promise.resolve();
  }

  const socketEndpoint =
    process.platform === "win32" ? `\\\\.\\pipe\\${socketPath}` : socketPath;

  const requestId = `${SOURCE}:${Date.now()}:${Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0")}`;
  const request = {
    id: requestId,
    method,
    params: {
      pane_id: paneId,
      source: SOURCE,
      agent: AGENT,
      seq: nextReportSeq(),
      ...params,
    },
  };

  return new Promise((resolve) => {
    const client = net.createConnection(socketEndpoint, () => {
      client.write(`${JSON.stringify(request)}\n`);
    });

    const finish = () => {
      client.destroy();
      resolve();
    };

    client.setTimeout(500, finish);
    client.on("data", finish);
    client.on("error", finish);
    client.on("end", finish);
    client.on("close", resolve);
  });
}

function reportSession(sessionID) {
  if (!sessionID) {
    return Promise.resolve();
  }
  return request("pane.report_agent_session", { agent_session_id: sessionID });
}

function reportState(state, sessionID) {
  const params = { state };
  if (sessionID) {
    reportedRootSessionID = sessionID;
    params.agent_session_id = sessionID;
  }
  return request("pane.report_agent", params);
}

function trackChildSession(event, sessionID) {
  // V1: properties.info.{id,parentID}; V2: data.{sessionID,parentID}.
  const info = event?.properties?.info;
  if (info?.id && info.parentID) {
    childSessions.add(info.id);
  }
  if (sessionID && parentIDFromEvent(event)) {
    childSessions.add(sessionID);
  }
}

async function handleEvent(event) {
  const type = event?.type;
  if (!type) {
    return;
  }
  const sessionID = sessionIDFromEvent(event);

  trackChildSession(event, sessionID);
  if (sessionID && childSessions.has(sessionID)) {
    const state = CHILD_EVENT_STATES.get(type);
    if (state) {
      await reportState(state);
    }
    return;
  }

  switch (type) {
    case "session.created":
      // Creation is server-global, so an attached client may own it. The
      // TUI plugin separately reports the root selected in this pane.
      reportedRootSessionID = sessionID;
      break;
    case "session.updated":
    case "session.viewed":
    case "tui.session.select":
      if (sessionID && sessionID !== reportedRootSessionID) {
        await reportSession(sessionID);
      }
      break;
    case "session.status": {
      const status = event?.data?.status ?? event?.properties?.status;
      const state = stateFromSessionStatus(status);
      if (state) {
        await reportState(state, sessionID);
      } else {
        await reportSession(sessionID);
      }
      break;
    }
    case "tool.execute.before":
    case "tool.execute.after":
    case "permission.replied":
    case "question.replied":
    case "question.rejected":
    case "form.replied":
    case "form.cancelled":
    case "session.compacted":
    case "session.compaction.started":
    case "session.compaction.ended":
    case "session.execution.started":
    case "session.step.started":
    case "session.step.ended":
    case "session.step.streamed":
    case "session.tool.called":
    case "session.tool.success":
    case "session.tool.failed":
    case "session.tool.progress":
    case "session.inbox.delivered":
    case "session.inbox.enqueued":
    case "command.executed":
      await reportState("working", sessionID);
      break;
    case "permission.asked":
    case "question.asked":
    case "form.created":
    case "session.error":
    case "session.execution.failed":
      await reportState("blocked", sessionID);
      break;
    case "session.idle":
      await reportState("idle", sessionID);
      break;
    case "session.deleted":
      break;
    default:
      break;
  }
}

async function reportWorking(sessionID) {
  if (sessionID && childSessions.has(sessionID)) {
    return;
  }
  await reportState("working", sessionID);
}

function herdrEnabled() {
  return (
    process.env.HERDR_ENV === "1" &&
    !!process.env.HERDR_SOCKET_PATH &&
    !!process.env.HERDR_PANE_ID
  );
}

// V1 (opencode 1.x) entrypoint. Kept so the same file also loads if a V1
// server ever reads this shared plugins directory.
export const HerdrAgentStatePlugin = async () => {
  if (!herdrEnabled()) {
    return {};
  }

  return {
    "chat.message": async ({ sessionID }) => {
      await reportWorking(sessionID);
    },
    event: async ({ event }) => {
      await handleEvent(event);
    },
  };
};

// V2 (opencode2) entrypoint. Plain {id, setup} object on purpose: it satisfies
// the V2 loader ("default definition with an id and an effect or setup
// function") without importing @opencode-ai/plugin, keeping this file
// dependency-free and loadable by both V1 and V2 servers sharing this dir.
export default {
  id: "herdr-agent-state",
  setup: async (ctx) => {
    if (!herdrEnabled()) {
      return;
    }

    const registrations = [];
    registrations.push(
      await ctx.session.hook("prompt", async (event) => {
        await reportWorking(event?.sessionID);
      }),
    );
    registrations.push(
      await ctx.tool.hook("execute.before", async (event) => {
        await reportWorking(event?.sessionID);
      }),
    );
    registrations.push(
      await ctx.tool.hook("execute.after", async (event) => {
        await reportWorking(event?.sessionID);
      }),
    );

    const controller = new AbortController();
    void (async () => {
      try {
        for await (const event of ctx.event.subscribe({
          signal: controller.signal,
        })) {
          try {
            await handleEvent(event);
          } catch {
            // Never let reporting break the agent loop.
          }
        }
      } catch {
        // Aborted on unload; slow-consumer overflow also lands here.
      }
    })();

    return async () => {
      controller.abort();
      for (const registration of registrations) {
        try {
          await registration.dispose();
        } catch {
          // Unload best-effort.
        }
      }
    };
  },
};
