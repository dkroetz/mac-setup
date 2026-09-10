import { Plugin } from "@opencode-ai/plugin";

const PROVIDER_ID = "futilify-gw";
const DEFAULT_CATALOG_URL = "https://v2.futilify.com/v1/futilify-gw-models";
const CATALOG_TIMEOUT_MS = 15_000;

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

async function modelsFromGatewayCatalog(): Promise<
  Record<string, Record<string, unknown>>
> {
  const apiKey = process.env.FUTILIFY_GW_V2_API_KEY?.trim();
  if (!apiKey) {
    process.stderr.write(
      "[futilify-gateway-models] FUTILIFY_GW_V2_API_KEY is not set; skipping catalog fetch\n",
    );
    return {};
  }

  let response: Response;
  try {
    response = await fetch(catalogURL(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(CATALOG_TIMEOUT_MS),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(
      `[futilify-gateway-models] unable to fetch catalog: ${message}\n`,
    );
    return {};
  }

  if (!response.ok) {
    process.stderr.write(
      `[futilify-gateway-models] catalog request failed: HTTP ${response.status}\n`,
    );
    return {};
  }

  let parsed: GatewayList;
  try {
    parsed = (await response.json()) as GatewayList;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(
      `[futilify-gateway-models] invalid catalog response: ${message}\n`,
    );
    return {};
  }

  if (!Array.isArray(parsed.data)) {
    process.stderr.write(
      "[futilify-gateway-models] invalid catalog response: expected a data array\n",
    );
    return {};
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

  return models;
}

function mergeV1ProviderModels(cfg: {
  provider?: Record<string, Record<string, unknown>>;
}, discovered: Record<string, Record<string, unknown>>) {
  if (Object.keys(discovered).length === 0) return;

  cfg.provider ??= {};
  const provider = (cfg.provider[PROVIDER_ID] ?? {}) as Record<string, unknown>;
  const existingModels = (provider.models ?? {}) as Record<string, unknown>;

  cfg.provider[PROVIDER_ID] = {
    ...provider,
    models: {
      ...discovered,
      ...existingModels,
    },
  };
}

function applyV2Model(
  model: Record<string, unknown>,
  spec: Record<string, unknown>,
  modelID: string,
) {
  if (!model.id) model.id = modelID;
  model.modelID = modelID;
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
    ).map(([id, settings]) => ({ id, settings }));
  } else if (!Array.isArray(model.variants)) {
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
    const over = cost.context_over_200k as Record<string, number> | undefined;
    if (
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

  const interleaved = spec.interleaved as { field?: string } | undefined;
  if (interleaved?.field) {
    const compatibility =
      model.compatibility && typeof model.compatibility === "object"
        ? { ...(model.compatibility as Record<string, unknown>) }
        : {};
    compatibility.reasoningField = interleaved.field;
    model.compatibility = compatibility;
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
 * Dual export: V1 (1.18.29+) calls server(); V2 reads id + setup().
 */
export default {
  ...Plugin.define({
    id: "futilify.gw",
    async setup(ctx) {
      const discovered = await modelsFromGatewayCatalog();
      if (Object.keys(discovered).length === 0) return;

      await ctx.catalog.transform((catalog) => {
        for (const [modelID, spec] of Object.entries(discovered)) {
          if (catalog.model.get(PROVIDER_ID, modelID)) continue;
          catalog.model.update(PROVIDER_ID, modelID, (model) => {
            applyV2Model(model, spec, modelID);
          });
        }
      });
    },
  }),
  async server() {
    const discovered = await modelsFromGatewayCatalog();
    return {
      config: async (cfg: {
        provider?: Record<string, Record<string, unknown>>;
      }) => {
        mergeV1ProviderModels(cfg, discovered);
      },
    };
  },
};
