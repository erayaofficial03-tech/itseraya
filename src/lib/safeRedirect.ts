/**
 * Validates a `?redirect=` query value to prevent open-redirect attacks.
 *
 * Rules:
 *  - Must be a string starting with a single "/" (no "//", no "/\")
 *  - No protocol (http:, https:, javascript:, data:, etc.)
 *  - No backslashes, no whitespace, no control chars
 *  - Path segment must match an allow-list of route prefixes
 *  - Falls back to "/" when invalid
 */

import { ALLOWED_REDIRECT_PREFIXES } from "./routes";

export function safeRedirect(raw: string | null | undefined, fallback = "/"): string {
  if (!raw || typeof raw !== "string") return fallback;

  // Reject anything that looks like an absolute URL or protocol-relative path
  if (raw.length > 512) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  if (/[\s\\]/.test(raw)) return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(raw)) return fallback;
  if (/^\/?[a-z][a-z0-9+.-]*:/i.test(raw)) return fallback; // protocol like javascript:

  // Parse against a dummy origin to normalize and strip any sneaky pieces
  let pathname: string;
  let search: string;
  let hash: string;
  try {
    const u = new URL(raw, "https://eraya.local");
    if (u.origin !== "https://eraya.local") return fallback;
    pathname = u.pathname;
    search = u.search;
    hash = u.hash;
  } catch {
    return fallback;
  }

  const ok = ALLOWED_PREFIXES.some((p) =>
    p.endsWith("/") ? pathname.startsWith(p) : pathname === p || pathname.startsWith(p + "/"),
  );
  if (!ok) return fallback;

  return `${pathname}${search}${hash}`;
}
