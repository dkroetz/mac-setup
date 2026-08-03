import type { Plugin } from "@opencode-ai/plugin";

function stripTokenQuery(url: string): string {
  const q = url.indexOf("?");
  const base = q === -1 ? url : url.slice(0, q);
  return base.replace(/\/$/, "");
}

/** Recover token even when it contains unencoded `&`. */
function tokenFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const q = url.indexOf("?");
  if (q === -1) return undefined;
  const query = url.slice(q + 1);
  if (!query.startsWith("token=") && !query.includes("&token=")) {
    // only support token as a query param we own
  }
  const idx = query.startsWith("token=") ? 0 : query.indexOf("&token=");
  if (idx === -1 && !query.startsWith("token=")) return undefined;
  const start = query.startsWith("token=") ? "token=".length : idx + "&token=".length;
  const rest = query.slice(start);
  // Token is the remainder when it's the sole/last param, or until a known other param.
  // Our tokens may contain `&`; other browserless params use `=`.
  const nextParam = rest.search(/&[a-zA-Z_][a-zA-Z0-9_]*=/);
  const raw = nextParam === -1 ? rest : rest.slice(0, nextParam);
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function buildBrowserlessUrl(): void {
  const token =
    process.env.BROWSERLESS_TOKEN?.trim() ||
    tokenFromUrl(process.env.BROWSERLESS_URL) ||
    process.env.BROWSERLESS_API_KEY?.trim();

  if (!token) return;

  const base =
    process.env.BROWSERLESS_BASE_URL?.trim() ||
    (process.env.BROWSERLESS_URL ? stripTokenQuery(process.env.BROWSERLESS_URL) : "");

  if (!base) return;

  process.env.BROWSERLESS_URL = `${base.replace(/\/$/, "")}?token=${encodeURIComponent(token)}`;
}

buildBrowserlessUrl();

export default (async () => {
  buildBrowserlessUrl();
  return {};
}) satisfies Plugin;
