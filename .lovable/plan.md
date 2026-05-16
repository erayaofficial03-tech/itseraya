## Product image experience — premium mobile overhaul

### 1. Square image container (ProductDetail.tsx)
- Wrap mobile image in `pt-[env(safe-area-inset-top)]` container so it sits below iPhone notch / Android status bar in standalone PWA mode.
- Keep `aspect-square` + `overflow-hidden`, add `rounded-b-2xl` on mobile for a softer luxury feel (rounded bottom corners only — top stays flush with safe area).
- Wrap `<SafeImage>` in a centered flex container with `object-cover object-center` to guarantee no stretch.
- Add explicit `width={900} height={900}` on the image to prevent CLS.
- Request a smaller variant on mobile (`withImageParams(url, 640, 80)` under `lg`) via `<picture>` srcset for faster loading.

### 2. Top safe-area / spacing fix
- Add `pt-[max(env(safe-area-inset-top),0.75rem)]` to the mobile image wrapper.
- Move mobile overlay buttons (back, wishlist) down by the same safe-area offset (`top-[calc(env(safe-area-inset-top)+0.75rem)]`) so they don't clip behind the status bar.
- Add `mb-4` rhythm between image and product info block.

### 3. Premium lightbox (rewrite `ImageZoom.tsx`)
Replace the current scroll-list modal with a proper single-image lightbox:
- Uses shadcn `Dialog` (Radix) — gives ESC close, focus trap, outside-click close, body-scroll lock for free.
- Centered single image at `max-h-[100dvh] max-w-[100vw] object-contain`.
- Horizontal swipe (touch) + arrow keys to move between images; dots indicator at bottom.
- Pinch-zoom: rely on native browser pinch on the `<img>` (set `touch-action: pinch-zoom`).
- Backdrop: `bg-black/95 backdrop-blur-sm`, fade-in 200ms, image scale-in from 0.96 → 1.
- Close button: top-right, circular, `bg-white/10 backdrop-blur-md`, ring on focus, sits above safe-area inset top.
- Prev / Next arrows on tablet+ only; hidden on mobile (swipe instead).
- Counter `2 / 5` bottom-center, subtle.

### 4. Performance
- `loading="eager"` only for `activeImg`; thumbs remain `lazy`.
- Preload next/prev hi-res inside lightbox using `<link rel="preload" as="image">` injected on open.
- Memoize image URL list to avoid recompute.
- Drop the existing scrollIntoView effect (replaced by indexed display).

### 5. Files touched
- `src/pages/ProductDetail.tsx` — safe-area, square wrapper, srcset, button offsets.
- `src/components/product/ImageZoom.tsx` — full rewrite to Dialog-based premium lightbox.
- `src/index.css` — add `.safe-top { padding-top: env(safe-area-inset-top); }` utility if not present.

### 6. Out of scope / remaining UX notes
- The PDP already uses real product images from Supabase; the legacy demo `ProductImageGallery.tsx` is unused on this route and is left untouched.
- True pinch-zoom-and-pan inside the lightbox (à la Instagram) would require a gesture lib (e.g. `react-zoom-pan-pinch`) — flagging for a follow-up.
- Bottom nav still overlaps long pages; not in this scope.
