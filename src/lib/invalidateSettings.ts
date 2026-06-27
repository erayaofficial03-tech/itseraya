import type { QueryClient } from "@tanstack/react-query";

/**
 * Invalidate both the public `["settings"]` and admin `["settings", "admin"]`
 * query caches so admin edits show up immediately on both customer and admin
 * surfaces.
 */
export const invalidateSettings = (qc: QueryClient) => {
  qc.invalidateQueries({ queryKey: ["settings"] });
  qc.invalidateQueries({ queryKey: ["settings", "admin"] });
};
