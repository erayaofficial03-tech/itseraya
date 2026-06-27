
# Manifest-Only PWA — Remove Service Worker, Keep Install

Goal: customers can still install Eraya to their home screen, but there is no service worker, no Workbox caching, no offline mode, and therefore no stale-content problems.

## Files to edit

### 1. `vite.config.ts`
- Remove `import { VitePWA } from "vite-plugin-pwa"`.
- Remove the entire `VitePWA({...})` entry from the `plugins` array.
- Remove the `define.__APP_BUILD__` block (it only existed for SW versioning).
- Keep everything else (react plugin, componentTagger, aliases, manualChunks).

### 2. `src/App.tsx`
- Remove the `PwaUpdateHandler` import and its `<PwaUpdateHandler />` render.

### 3. `src/main.tsx`
- Remove the `import("virtual:pwa-register")` block (no longer resolvable once the plugin is gone).
- Keep the iframe/preview detection and the `navigator.serviceWorker.getRegistrations().unregister()` cleanup — this still helps users who already installed the old SW.
- Remove the `controllerchange` reload listener (no controller to change).

### 4. `index.html`
- Keep `<link rel="manifest" href="/manifest.webmanifest">`, theme-color, apple-touch-icon, apple-mobile-web-app-* meta tags, splash links.
- Add a small inline cleanup script in `<head>` that, on load, unregisters any existing service workers and deletes all caches. This evicts the old PWA for returning customers.

### 5. `public/manifest.webmanifest`
Replace with the exact spec:
```json
{
  "name": "Eraya",
  "short_name": "Eraya",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FAF8F5",
  "theme_color": "#C9A84C",
  "categories": ["shopping"],
  "screenshots": [],
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "lang": "en-IN"
}
```

## Files to delete

- `src/components/PwaUpdateHandler.tsx`
- `dev-dist/` folder (stale SW artifacts: `sw.js`, `workbox-*.js`, `registerSW.js`, `manifest`)

## Files to keep untouched

- `src/components/IOSInstallGuide.tsx` — iOS manual install instructions.
- `src/components/InstallTroubleshootSheet.tsx` — install help UI.
- `src/hooks/useInstallPrompt.ts` — Android `beforeinstallprompt` capture.
- `src/lib/installAnalytics.ts` — install event logging.
- Install button in mobile menu header.
- Install prompt settings in admin Store Settings.

## Packages to uninstall

```
bun remove vite-plugin-pwa workbox-core workbox-precaching workbox-routing workbox-strategies workbox-window
```

(Will use `bun remove` since this project uses bun; equivalent to the requested `npm uninstall`.)

## TypeScript fix

`src/vite-env.d.ts` may reference `vite-plugin-pwa/client` types via the virtual module. If a triple-slash reference exists, remove it so `tsgo` stays at 0 errors after the plugin is gone.

## Verification

1. `bun run build` completes without errors.
2. No `sw.js` or `workbox-*.js` in `dist/`.
3. `dist/manifest.webmanifest` is present and matches spec.
4. `index.html` still has the manifest link and the SW-cleanup inline script.
5. Mobile menu install button still renders.
6. `tsgo` → 0 errors.

## Report

At the end I will list every file changed/deleted and confirm icon files (`/icon-192.png`, `/icon-512.png`, `/maskable-192.png`, `/maskable-512.png`) exist in `public/` — flagging any that are missing.
