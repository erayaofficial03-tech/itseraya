## Goals

1. Stop showing the native browser confirm popup (which leaks the preview URL like in your screenshot) anywhere in the admin.
2. Make sure every published build is delivered to installed PWA users automatically, no manual reload.

---

## 1. Replace native `confirm()` with branded dialogs

Native `window.confirm()` is what causes the ugly *"An embedded page at id-preview--…lovable.app says"* popup. It always shows the host URL and you cannot style it.

Five places still use it:

- `src/pages/admin/ProductsAdmin.tsx` — Delete this product
- `src/pages/admin/BannersAdmin.tsx` — Delete this banner
- `src/pages/admin/AnnouncementAdmin.tsx` — Delete this announcement
- `src/pages/admin/CategoriesAdmin.tsx` — Delete this category
- `src/components/admin/ReviewsManager.tsx` — Delete this review

Fix: swap each for the existing shadcn `AlertDialog` component (already in `src/components/ui/alert-dialog.tsx`). Pattern per page:

- Track a `pendingDeleteId` in state.
- Trash button sets the id (opens dialog) instead of calling `confirm` + delete inline.
- A single `<AlertDialog open={!!pendingDeleteId}>` at the bottom of the page with title, description, Cancel, and Delete actions; Delete runs the existing delete handler, closes the dialog, toasts.

Visual: destructive red Delete button, brand cancel button, copy matches current strings. No URL is ever shown.

---

## 2. Auto-update PWA on every publish

The current `src/main.tsx` already polls `registration.update()` every 60s and on focus, and `onNeedRefresh` wipes caches and calls `updateSW(true)`. That's most of the way there, but two things are blocking reliable auto-refresh for installed users:

a. **`registerType: "autoUpdate"` + manual `onNeedRefresh`** — these fight each other. With `autoUpdate`, the workbox runtime auto-activates the new SW and reloads. The manual `onNeedRefresh` callback only fires in `prompt` mode. So today the cache-wipe code never runs, and users sometimes stay on the old shell because old caches survive.

b. **HTML `NetworkFirst` with `maxAgeSeconds: 60`** — fine, but the `images` and `supabase-api` caches have no version key, so after an SW swap stale entries can linger.

Fix in `vite.config.ts` + `src/main.tsx`:

- Switch to `registerType: "prompt"` so `onNeedRefresh` actually fires.
- In `onNeedRefresh`: delete all caches → call `updateSW(true)` → on the next `controllerchange`, `location.reload()`. This guarantees the user is on the freshly published build within ~60s of publish (or instantly on tab focus), with no popup.
- Add a `controllerchange` listener that reloads once when a new SW takes control, as a belt-and-braces fallback.
- Keep the existing iframe / preview-host guard so nothing changes inside the Lovable editor.

Result: publish → within ≤60s (or immediately when the user re-focuses the tab) the installed PWA silently swaps to the new build with fresh caches. No "update available" prompt, no manual refresh.

---

## Technical notes

- No DB / RLS / edge-function changes. Pure frontend.
- No new dependencies — `AlertDialog` and `vite-plugin-pwa` are already installed.
- Manifest fields (`start_url`, `scope`, `display`) stay untouched — those are pinned at install time on iOS/Android and changing them wouldn't help existing installs anyway.
- The 5 admin pages keep their existing delete logic; only the confirmation UI changes.
