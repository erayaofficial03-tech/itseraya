import { lazy, ComponentType } from "react";

/**
 * Wraps React.lazy with automatic retry for transient chunk-load failures
 * (common after deploys or flaky networks). Retries with exponential backoff,
 * then triggers a one-time hard reload as a last resort.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  opts: { retries?: number; baseDelayMs?: number; reloadKey?: string } = {}
) {
  const { retries = 3, baseDelayMs = 400, reloadKey } = opts;

  return lazy(async () => {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await factory();
      } catch (err) {
        lastErr = err;
        const msg = err instanceof Error ? err.message : String(err);
        const isChunkErr =
          /Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed/i.test(
            msg
          );
        if (!isChunkErr || attempt === retries) break;
        await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, attempt)));
      }
    }

    // Last resort: hard reload once per session to pick up new asset hashes.
    if (typeof window !== "undefined" && reloadKey) {
      const key = `lazyRetryReload:${reloadKey}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        // Return a never-resolving promise while reload happens.
        return new Promise(() => {}) as Promise<{ default: T }>;
      }
    }
    throw lastErr;
  });
}
