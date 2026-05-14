# Goal

Make every published build show up immediately for returning visitors — no manual hard-refresh, no stuck old UI. Build on the SW auto-update we already added in `src/main.tsx` and close the remaining cache gaps.

## What's already in place

- `src/main.tsx` registers the PWA service worker, polls `registration.update()` every 60s + on tab focus, and on `onNeedRefresh` wipes all `caches` and reloads silently.

## Gaps to close

1. **HTML can still be cached by the browser.** `index.html` has no cache-control meta. If a CDN/browser holds it, the SW update never even gets a chance to run.
2. **Workbox runtime caches** (configured in `vite.config.ts`) use cache-first style strategies for navigations/images/Supabase. These survive SW updates unless explicitly purged — which our `onNeedRefresh` handler now does, but only *after* the new SW activates.
3. **Build asset filenames** — Vite already content-hashes JS/CSS, so those are safe. No change needed.
4. **React Query cache / localStorage** — fine to keep (intentionally persistent for UX).

## Plan

### 1. `index.html` — prevent stale HTML
Add inside `<head>`:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```
Ensures the browser always revalidates the entry HTML, so it picks up the new bundle hashes on the next navigation.

### 2. `vite.config.ts` — switch navigation strategy to NetworkFirst with short timeout
Change the `request.mode === "navigate"` runtime cache to `NetworkFirst` with `networkTimeoutSeconds: 3` and a small `expiration` (e.g. maxAgeSeconds: 60). Image cache stays as-is. This means: online users always get the freshest HTML; offline users still get the cached shell.

### 3. `src/main.tsx` — make update detection more aggressive
- Keep the 60s poll + focus/visibility checks.
- Also call `registration.update()` once immediately on registration (not just on interval).
- On `onNeedRefresh`, in addition to wiping `caches`, also call `registration.unregister()` *before* `updateSW(true)` only as a fallback if `updateSW` rejects — guarantees no zombie SW.

### 4. Add a `/version.json` build stamp (optional but bulletproof)
- Vite plugin or simple build script writes `public/version.json` with the build timestamp.
- App fetches `/version.json` (no-store) on focus; if it differs from the embedded build constant, force `location.reload()`. This is a belt-and-suspenders fallback for the rare case the SW itself is broken on a device.

### Files to change

- `index.html` — add cache-control metas
- `vite.config.ts` — NetworkFirst for navigations
- `src/main.tsx` — minor SW handler tweaks
- (Optional) `vite.config.ts` + `src/main.tsx` — version.json stamp + check

### What the user will experience

- First publish after this ships: returning visitors get the new build within ~60s of opening the tab (or instantly on next focus/navigation).
- Every publish after that: same — fully automatic, no toast, no manual refresh.
- Offline still works (cached shell).

## Out of scope

- React Query / localStorage wipes (would log users out / lose enquiry cart — not what "cache clear" means here).
- Server-side CDN cache headers (handled by Lovable hosting).

Approve and I'll implement steps 1–3. Step 4 (version.json) only if you want the extra safety net.