import type { Plugin } from "@opencode-ai/plugin";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const PROVIDER_ID = "futilify-gw";

/** OpenCode config directory (this file lives in plugin/). */
const CONFIG_DIR = join(import.meta.dirname!, "..");

const DEFAULT_CATALOG = join(CONFIG_DIR, "plugin/futilify_gw_models.json");

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

function catalogPath(): string {
  const fromEnv = process.env.FUTILIFY_GATEWAY_CATALOG?.trim();
  if (!fromEnv) return DEFAULT_CATALOG;
  if (fromEnv.startsWith("~/")) {
    const home = process.env.HOME ?? "";
    return join(home, fromEnv.slice(2));
  }
  return fromEnv;
}

function modelsFromGatewayCatalog(
  path: string,
): Record<string, Record<string, unknown>> {
  if (!existsSync(path)) {
    process.stderr.write(
      `[futilify-gateway-models] catalog not found: ${path}\n`,
    );
    return {};
  }

  const parsed = JSON.parse(readFileSync(path, "utf-8")) as GatewayList;
  const models: Record<string, Record<string, unknown>> = {};

  for (const entry of parsed.data ?? []) {
    const { created: _c, id, object: _o, owned_by: _ob, ...spec } = entry;
    if (!id) continue;
    models[id] = spec as Record<string, unknown>;
  }

  return models;
}

export default (async () => {
  const catalog = catalogPath();

  return {
    /**
     * Runs before providers initialize. Merges model metadata from
     * futilify_gateway.json into provider.gw-futilify.models so opencode.json
     * can stay small. Entries in opencode.json still override per-model fields.
     */
    config: async (cfg) => {
      const discovered = modelsFromGatewayCatalog(catalog);
      if (Object.keys(discovered).length === 0) return;

      cfg.provider ??= {};
      const provider = (cfg.provider[PROVIDER_ID] ?? {}) as Record<
        string,
        unknown
      >;
      const existingModels = (provider.models ?? {}) as Record<string, unknown>;

      cfg.provider[PROVIDER_ID] = {
        ...provider,
        models: {
          ...discovered,
          ...existingModels,
        },
      };
    },
  };
}) satisfies Plugin;
