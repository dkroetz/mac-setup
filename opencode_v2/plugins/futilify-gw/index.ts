import { define } from "@opencode-ai/plugin/v2/promise";
import type { PluginContext } from "@opencode-ai/plugin/v2/promise";

const PROVIDER_ID = "futilify-gw";
const DEFAULT_CATALOG_URL = "https://v2.futilify.com/v1/futilify-gw-models";
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
// (reload replays every catalog transform and nudges the frontend).
function digestText(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

// Mutable source of truth for the registered transform below. Refresh
// replaces it wholesale, then catalog.reload() replays the transform.
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
      owned_by: _ob,
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

async function refreshCatalog(ctx: PluginContext): Promise<void> {
  const next = await fetchCatalog();
  // null = transient failure: keep serving the last good snapshot.
  if (!next || next.digest === discoveredDigest) return;
  discoveredDigest = next.digest;
  discovered = next.models;
  await ctx.catalog.reload();
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
    model.variants = Object.entries(
      variants as Record<string, Record<string, unknown>>,
    ).map(([id, body]) => ({ id, headers: {}, body }));
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
    // V2 cache:{read,write} shape. Gateway serves these alongside the legacy
    // context_over_200k alias, so dedupe by tier size below.
    const nativeTiers = cost.tiers;
    const seenSizes = new Set<number>();
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
        seenSizes.add(tier.size);
      }
    }
    // Legacy alias: only synthesize the 200k tier when nonzero and not
    // already covered by a native tier of the same size. All-zero objects
    // (26/41 in the current catalog) are noise and skipped.
    const over = cost.context_over_200k as Record<string, number> | undefined;
    if (
      over &&
      (over.input || over.output || over.cache_read || over.cache_write) &&
      !seenSizes.has(200_000)
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

  // Note: gateway interleaved ({field}) has no V2 counterpart (ModelV2Info
  // carries no compatibility/interleaved field), so it is intentionally
  // dropped here rather than stamped as compatibility.reasoningField.

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
 * V2 API (1.18.x): imported via @opencode-ai/plugin/v2/promise.
 */
export default define({
  id: "futilify.gw",
  async setup(ctx) {
    // Tolerate gateway downtime at startup: the transform below reads the
    // live `discovered` snapshot, so a later refresh still populates models.
    const initial = await fetchCatalog();
    if (initial) {
      discoveredDigest = initial.digest;
      discovered = initial.models;
    }

    await ctx.catalog.transform((catalog) => {
      for (const [modelID, spec] of Object.entries(discovered)) {
        if (catalog.model.get(PROVIDER_ID, modelID)) continue;
        catalog.model.update(PROVIDER_ID, modelID, (model) => {
          applyV2Model(
            model as unknown as Record<string, unknown>,
            spec,
            modelID,
          );
        });
      }
    });

    // Poll for new/changed gateway models; reload() replays the transform
    // above (and every other catalog transform) so sessions pick them up
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
  },
});
