## Changes

### 1. `index.html` — aggressive SW eviction script
Replace lines 18–53 (current conditional script) with an inline synchronous script placed as the first child of `<head>` (move it above charset is not necessary — keep after charset/viewport for parser sanity, but before all other scripts; it's already the only script in head).

The replacement script:
- If `'serviceWorker' in navigator` is false, do nothing.
- Unconditionally call `navigator.serviceWorker.getRegistrations()` → unregister every registration.
- Unconditionally call `caches.keys()` → delete every cache.
- After `Promise.all` resolves: if `localStorage.getItem('eraya_cache_cleared_v3')` is missing, set it and call `location.reload()` (the boolean arg to `reload` is non-standard/ignored — omit it; cache-busting comes from no-store headers + hashed filenames). If the key exists, do nothing.
- Wrapped in try/catch.

Add three cache-prevention meta tags right after the viewport meta (currently absent — the comment on line 7 will be removed):
```
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

### 2. `vite.config.ts` — hashed filenames
Inside `build.rollupOptions.output` (lines 25–39), add alongside `manualChunks`:
```
chunkFileNames: 'assets/[name]-[hash].js',
entryFileNames: 'assets/[name]-[hash].js',
```

### 3. `src/components/header/BottomNav.tsx` — verify
Already the correct 5-tab version: Home, Shop (Catalogue), Search, Saved (Wishlist), Account. No changes needed. Will confirm in the report.

### 4. Verification
Run `npx tsc --noEmit` and confirm 0 errors.

## Report at the end
- Files changed: `index.html`, `vite.config.ts`
- Files verified unchanged: `src/components/header/BottomNav.tsx` (already 5-tab Home/Shop/Search/Saved/Account)
- TypeScript: 0 errors
