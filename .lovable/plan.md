
# Eraya — Full Admin CMS Overhaul

## What's already done (skipping)

- Google-only OAuth, `/auth/callback`, redirect rules → done in earlier turns
- Role system: admin / manager / customer + Users page → done last turn
- Install prompt (gold-themed, gated on product visit + 30s + 30-day reject backoff) → done

I will leave those as-is and not redo them.

## What I'll build in this pass

### 1. Database (one migration)

Add every column listed in your prompt to `public.settings` with the defaults you specified, plus:

- `enquiries` table: `id, product_id, product_name, product_price, customer_email, customer_name, created_at`
  - RLS: anyone (incl. anon) can `INSERT`; only admin/manager can `SELECT`.
- `profiles.is_blocked boolean DEFAULT false` + `AuthCallback` checks it and signs the user out with a toast if true.
- Storage: reuse existing `branding` bucket for logo/favicon/OG/hero uploads.

### 2. Settings infrastructure

- `useSettings()` hook (React Query, `staleTime: 5min`) — single source of truth.
- `SettingsProvider` mounted in `App.tsx` that:
  - Applies `color_*` values to CSS variables on `:root` via `style.setProperty`.
  - Applies favicon dynamically.
  - Updates `<title>` + meta tags via `react-helmet-async` (added).
- Every component reads via `useSettings()` with the schema-level default as fallback.

### 3. Frontend wiring (no hardcoded strings)

- **Header**: nav labels, logo, search visibility from settings.
- **AnnouncementBar** (new) — above header, dismissible with `localStorage` session flag.
- **Hero**: 6 fields + overlay opacity slider value.
- **Homepage sections**: Categories / New Arrivals / Trending / On Sale / Featured — each with title + visibility toggle.
- **ProductCard / ProductDetail**: enquiry/share/PDF labels, description heading, related heading, tag visibility, enquiry button color, WhatsApp template with `{product_name}/{price}/{url}` substitution.
- **Catalogue / Category** pages: heading, subtext, download label, empty msg, pieces label.
- **Footer**: tagline, copyright with `{year}`, all visibility toggles.
- **PDF generation**: store name, tagline, footer text (`{whatsapp}` substitution), primary color from settings.
- **InstallPrompt**: text, button label, visibility from settings.

### 4. Admin pages (new + restructured sidebar)

Sidebar order: Dashboard · Products · Categories · Announcement · Homepage & Banner · Brand & Colors · Labels & Text · SEO & Meta · Enquiries · Users · Store Settings.

New pages:
- `/admin/announcement` — toggle, text, bg/text color pickers, dismissible toggle, live preview.
- `/admin/brand` — logo + favicon upload, store name/tagline, 6 color pickers, live preview card, applied immediately.
- `/admin/labels` — accordion grouped by area (Navigation, Product, Catalogue, Category, Footer, PDF, Install, Admin). One Save All button.
- `/admin/seo` — title (60-char counter), description (160-char counter), OG image upload, Google + WhatsApp share preview.
- `/admin/enquiries` — table with thumb/name/price/customer/time, count badge, "Export to Excel" via SheetJS (`xlsx`).

Restructured pages:
- `/admin/banner` — expanded with hero overlay slider + section toggles/titles.
- `/admin/settings` — add WhatsApp template field (with variable hints), store address/email/phone/city, PWA fields. Keep social links manager.

### 5. Enquiry logging

- `ProductDetail` "I Love It" click → insert into `enquiries` (anon-allowed) before opening WhatsApp.
- Captures `customer_email/customer_name` from session if signed in, else `null` (shown as "Guest" in admin).

### 6. Performance polish (no PWA plugin)

- `React.lazy` + `Suspense` for all route components (already partial — finish it).
- `staleTime: 5 * 60 * 1000` on every React Query hook.
- `React.memo` on `ProductCard` + `CategoryCard`.
- All product/category `<img>` get `loading="lazy"` and `decoding="async"`.
- Supabase image transform query params on thumbnails (`?width=400&quality=80`) and detail (`?width=900&quality=85`).

## What I am NOT doing, and why

1. **`vite-plugin-pwa` / service worker / offline fallback page** — Lovable's platform guidance explicitly tells me not to ship a service worker. It breaks the preview iframe (stale shell, navigation interference, persistent cache pollution) and OAuth callbacks. The PWA-style "install to home screen" experience already works via the existing `manifest.json` + InstallPrompt component without a service worker. I'll wire the manifest fields (`pwa_*`) to settings via a runtime-injected `<link rel="manifest">` blob URL so admins can edit them, but no SW. If you want true offline support and accept the preview tradeoffs, say the word and I'll add it as a separate step.

2. **Auth & roles section of your prompt** — already implemented in prior turns; I'll only add the `is_blocked` gate.

## Technical details

- New deps: `react-helmet-async`, `xlsx` (SheetJS).
- CSS-variable application: `BrandProvider` runs once on settings load + on every save mutation success.
- Color storage format: hex strings in DB (your defaults), converted to HSL at apply time so they slot into the existing `--gold`, `--background`, etc. tokens — no Tailwind config changes needed.
- WhatsApp template: simple `String.replaceAll` with the three placeholders.
- All admin save buttons use `supabase.from('settings').update({...}).eq('id', 1)` and invalidate the `['settings']` query.
- Admin pages restricted via existing `RoleGuard require="admin"`. Enquiries view also allows `manager` (small RoleGuard tweak).

## Scope confirmation

This is roughly **6–8 new files + edits to ~25 existing files + 1 large migration**. I'll do it in one pass as you asked, but I want to confirm two things before I start:

1. **OK to skip `vite-plugin-pwa`** and keep the manifest-only install path?
2. **OK with hex-in-DB → runtime HSL conversion** for the colors (vs. forcing admins to enter HSL)?

If yes to both, I'll execute the full plan. If you'd rather phase it (e.g. ship DB + Brand/Labels/Announcement first, then Banner/SEO/Enquiries), tell me which slice to start with.
