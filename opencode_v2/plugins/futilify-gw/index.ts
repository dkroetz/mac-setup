// Type-only import: the runtime erases it, so the plugin needs no node_modules
// on other machines. `Plugin.define` is identity; the runtime decodes the
// default export as `{ id, setup }` anyway.
import type { Plugin } from "@opencode/plugin";

const PROVIDER_ID = "futilify-gw";
const DEFAULT_CATALOG_URL = "https://gw-v3.futilify.com/v1/futilify-gw-models";
// Claude models are served only through the gateway's Anthropic /v1/messages
// route, so they run on the Anthropic runtime package (x-api-key +
// anthropic-version) while every other model keeps the provider-level
// OpenAI-compatible package declared in opencode.json.
const ANTHROPIC_PACKAGE = "aisdk:@ai-sdk/anthropic";
const CATALOG_TIMEOUT_MS = 15_000;
const DEFAULT_REFRESH_MS = 300_000;
const MIN_REFRESH_MS = 10_000;

type GatewayList = {
  data?: Array<
    {
      id: string;
      created?: number;
      object?: string;
      owned_by?: string;
    } & Record<string, unknown>
  >;
};

function catalogURL(): string {
  return process.env.FUTILIFY_GATEWAY_CATALOG_URL?.trim() || DEFAULT_CATALOG_URL;
}

function refreshIntervalMs(): number {
  const raw = process.env.FUTILIFY_GATEWAY_REFRESH_MS?.trim();
  if (!raw) return DEFAULT_REFRESH_MS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < MIN_REFRESH_MS) return DEFAULT_REFRESH_MS;
  return Math.floor(parsed);
}

// FNV-1a 32-bit: cheap change detection so unchanged polls skip reload()
// (reload replays every model transform and nudges the frontend).
function digestText(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

// Mutable source of truth for the registered transform below. Refresh
// replaces it wholesale, then model.reload() replays the transform.
let discovered: Record<string, Record<string, unknown>> = {};
let discoveredDigest = "";

async function fetchCatalog(): Promise<{
  digest: string;
  models: Record<string, Record<string, unknown>>;
} | null> {
  const apiKey = process.env.FUTILIFY_GW_V2_API_KEY?.trim();
  if (!apiKey) {
    process.stderr.write(
      "[futilify-gateway-models] FUTILIFY_GW_V2_API_KEY is not set; skipping catalog fetch\n",
    );
    return null;
  }

  let text: string;
  try {
    const response = await fetch(catalogURL(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS),
    });
    if (!response.ok) {
      process.stderr.write(
        `[futilify-gateway-models] catalog request failed: HTTP ${response.status}\n`,
      );
      return null;
    }
    text = await response.text();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(
      `[futilify-gateway-models] unable to fetch catalog: ${message}\n`,
    );
    return null;
  }

  let parsed: GatewayList;
  try {
    parsed = JSON.parse(text) as GatewayList;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(
      `[futilify-gateway-models] invalid catalog response: ${message}\n`,
    );
    return null;
  }

  if (!Array.isArray(parsed.data)) {
    process.stderr.write(
      "[futilify-gateway-models] invalid catalog response: expected a data array\n",
    );
    return null;
  }

  const models: Record<string, Record<string, unknown>> = {};

  for (const entry of parsed.data) {
    const {
      created: _c,
      id,
      object: _o,
      // `owned_by` is intentionally left in `spec` so model routing can tell
      // Anthropic-backed entries (owned_by: "anthropic") from the rest.
      // V1 treats this field as a boolean feature flag, whereas the gateway
      // catalog uses it for an object of per-model mode metadata. Neither the
      // V1 nor V2 plugin path consumes those modes, so do not inject it.
      experimental: _experimental,
      ...spec
    } = entry;
    if (!id) continue;
    models[id] = spec as Record<string, unknown>;
  }

  return { digest: digestText(text), models };
}

async function refreshCatalog(ctx: Plugin.Context): Promise<void> {
  const next = await fetchCatalog();
  // null = transient failure: keep serving the last good snapshot.
  if (!next || next.digest === discoveredDigest) return;
  discoveredDigest = next.digest;
  discovered = next.models;
  await ctx.model.reload();
}

function applyV2Model(
  model: Record<string, unknown>,
  spec: Record<string, unknown>,
  modelID: string,
) {
  if (!model.id) model.id = modelID;
  model.providerID = PROVIDER_ID;
  model.name =
    typeof spec.name === "string"
      ? spec.name
      : typeof model.name === "string"
        ? model.name
        : modelID;

  if (typeof spec.family === "string") model.family = spec.family;

  // Claude (and any other Anthropic-backed) models must go through the
  // gateway's Anthropic /v1/messages route, so override the provider-level
  // OpenAI-compatible package for those entries.
  if (spec.owned_by === "anthropic" || modelID.startsWith("claude/")) {
    model.package = ANTHROPIC_PACKAGE;
  }

  if (spec.limit && typeof spec.limit === "object") {
    model.limit = spec.limit;
  }

  const modalities = spec.modalities as
    | { input?: string[]; output?: string[] }
    | undefined;
  model.capabilities = {
    tools: spec.tool_call !== false,
    input: modalities?.input ?? ["text"],
    output: modalities?.output ?? ["text"],
  };

  const variants = spec.variants;
  if (variants && typeof variants === "object" && !Array.isArray(variants)) {
    // Catalog payloads use AI SDK option names (`reasoningEffort`, ...), which
    // V2 routes through `settings`; writing them to `body` would send raw
    // camelCase keys the upstreams do not read.
    model.variants = Object.entries(
      variants as Record<string, Record<string, unknown>>,
    ).map(([id, settings]) => ({ id, settings }));
  } else {
    // Gateway-authoritative record: a replay without variants clears
    // variants set by an earlier catalog revision.
    model.variants = [];
  }

  const cost = spec.cost as Record<string, unknown> | undefined;
  if (cost) {
    const tiers: Record<string, unknown>[] = [
      {
        input: cost.input ?? 0,
        output: cost.output ?? 0,
        cache: {
          read: cost.cache_read ?? 0,
          write: cost.cache_write ?? 0,
        },
      },
    ];
    // Native tiers (flat cache_read/cache_write) take precedence; map to
    // V2 cache:{read,write} shape.
    const nativeTiers = cost.tiers;
    let nativeTierCount = 0;
    if (Array.isArray(nativeTiers)) {
      for (const entry of nativeTiers as Record<string, unknown>[]) {
        if (!entry || typeof entry !== "object") continue;
        const tier = entry.tier as { type?: unknown; size?: unknown } | undefined;
        if (tier?.type !== "context" || typeof tier.size !== "number") continue;
        const nestedCache = entry.cache as
          | { read?: unknown; write?: unknown }
          | undefined;
        tiers.push({
          tier: { type: "context", size: tier.size },
          input: entry.input ?? 0,
          output: entry.output ?? 0,
          cache: {
            read: entry.cache_read ?? nestedCache?.read ?? 0,
            write: entry.cache_write ?? nestedCache?.write ?? 0,
          },
        });
        nativeTierCount++;
      }
    }
    // Legacy alias: the gateway sends context_over_200k alongside the native
    // tiers with the same prices but an outdated threshold (200k vs 272k).
    // Prefer the native tier and fall back to the alias only when none exists.
    // All-zero alias objects are noise and are skipped either way.
    const over = cost.context_over_200k as Record<string, number> | undefined;
    if (
      nativeTierCount === 0 &&
      over &&
      (over.input || over.output || over.cache_read || over.cache_write)
    ) {
      tiers.push({
        tier: { type: "context", size: 200_000 },
        input: over.input ?? 0,
        output: over.output ?? 0,
        cache: {
          read: over.cache_read ?? 0,
          write: over.cache_write ?? 0,
        },
      });
    }
    model.cost = tiers;
  }

  // Models whose upstream streams reasoning outside the default field (e.g.
  // `reasoning_content`) need V2's compatibility.reasoningField so multi-turn
  // replay sends it back the way the upstream expects.
  const reasoningField = (spec.interleaved as { field?: unknown } | undefined)
    ?.field;
  if (typeof reasoningField === "string") {
    model.compatibility = { reasoningField };
  } else if (model.compatibility) {
    // Gateway-authoritative record: drop stale compatibility on replay.
    delete model.compatibility;
  }

  if (typeof spec.release_date === "string") {
    const released = Date.parse(spec.release_date);
    if (!Number.isNaN(released)) model.time = { released };
  } else if (!model.time) {
    model.time = { released: 0 };
  }

  if (spec.status === "deprecated") {
    model.status = "deprecated";
    model.enabled = false;
  } else {
    if (!model.status) model.status = "active";
    if (model.enabled === undefined) model.enabled = true;
  }
}

/**
 * Fetches model metadata from the Futilify gateway into provider futilify-gw
 * so opencode.json can stay small. Entries already present in config still win.
 * The endpoint can be overridden with FUTILIFY_GATEWAY_CATALOG_URL.
 *
 * V2 API (2.0.x): the old ctx.catalog domain was split; models under an
 * available provider are contributed through ctx.model.transform, whose
 * editor.update seeds drafts with full schema defaults.
 */
export default {
  id: "futilify.gw",
  async setup(ctx: Plugin.Context) {
    // Tolerate gateway downtime at startup: the transform below reads the
    // live `discovered` snapshot, so a later refresh still populates models.
    const initial = await fetchCatalog();
    if (initial) {
      discoveredDigest = initial.digest;
      discovered = initial.models;
    }

    await ctx.model.transform((editor) => {
      // The provider itself stays declared in opencode.json (package,
      // baseURL, apiKey); models can only be added under an available one.
      if (!editor.provider.get(PROVIDER_ID)) return;
      for (const [modelID, spec] of Object.entries(discovered)) {
        if (editor.get(PROVIDER_ID, modelID)) continue;
        editor.update(PROVIDER_ID, modelID, (model) => {
          applyV2Model(model as unknown as Record<string, unknown>, spec, modelID);
        });
      }
    });

    // Poll for new/changed gateway models; reload() replays the transform
    // above (and every other model transform) so sessions pick them up
    // without an opencode restart. Unchanged snapshots skip the reload.
    const timer = setInterval(() => {
      refreshCatalog(ctx).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(
          `[futilify-gateway-models] refresh failed: ${message}\n`,
        );
      });
    }, refreshIntervalMs());
    // Never pin the process open for one-shot runs (`opencode run`).
    const maybeUnref = timer as unknown as { unref?: () => void };
    if (typeof maybeUnref.unref === "function") maybeUnref.unref();

    return () => clearInterval(timer);
  },
} satisfies Plugin.Plugin;
