# Admin panel — align with customer view

Bring the admin into the same soft-luxury editorial aesthetic as the storefront: dark ink chrome (matching the new header/footer), warm ivory content surfaces, Cormorant Garamond serif headings, champagne accents, and the same hairline dividers and soft card shadows.

## Visual direction

- **Sidebar (desktop) & mobile top bar** — dark `--ink` background, ivory text, champagne hover/active states, champagne hairline divider under the brand mark. Mirrors the new site header.
- **Main content** — warm ivory `--background`, Cormorant page titles with a small eyebrow label (uppercase, tracking-[0.3em], champagne) — same pattern as homepage section heads.
- **Cards & surfaces** — white `--card` on ivory, `shadow-card`, 14px radius, `border-border` hairlines. Section bands separated by `.section-divider`.
- **Buttons** — primary = champagne fill on ink text; secondary = ink outline; ghost stays subtle. Destructive keeps red.
- **Tables** — ivory header row with champagne uppercase column labels, ink rows on white, hover = `bg-muted/40`, hairline row borders.
- **Forms** — labels in uppercase tracking, inputs with ivory-warm fill, champagne focus ring.
- **Badges/chips** — reuse the micro-label tones from product cards (champagne / blush / ink) so admin status pills match storefront vibe.
- **Dialogs / sheets / dropdowns** — ivory surface, serif title, champagne accent line.

## Files to change

```text
Shell
  src/pages/admin/AdminLayout.tsx       — dark ink sidebar, ivory champagne active, mobile header retone
  src/components/BrandLogo.tsx          — verify onDark variant used in sidebar (no change if already supports)

Shared admin primitives (new)
  src/components/admin/PageHeader.tsx   — eyebrow + serif title + optional actions slot
  src/components/admin/AdminCard.tsx    — thin wrapper around Card with shadow-card + ivory tone
  src/components/admin/AdminTable.tsx   — styled <table> wrapper (or class presets) for consistent rows

Pages (apply PageHeader + AdminCard + table/form classes)
  src/pages/admin/Dashboard.tsx + dashboard-widgets.tsx
  src/pages/admin/ProductsAdmin.tsx
  src/pages/admin/CategoriesAdmin.tsx
  src/pages/admin/ProductTagsAdmin.tsx
  src/pages/admin/AnnouncementAdmin.tsx
  src/pages/admin/BannerAdmin.tsx
  src/pages/admin/BannersAdmin.tsx
  src/pages/admin/UspsAdmin.tsx
  src/pages/admin/BrandAdmin.tsx
  src/pages/admin/LabelsAdmin.tsx
  src/pages/admin/SeoAdmin.tsx
  src/pages/admin/PoliciesAdmin.tsx
  src/pages/admin/EnquiriesAdmin.tsx
  src/pages/admin/CustomersAdmin.tsx
  src/pages/admin/AdminsAdmin.tsx
  src/pages/admin/SettingsAdmin.tsx
  src/pages/admin/AdminProfile.tsx

Tokens
  src/index.css                         — add admin-scoped utilities if needed
                                          (.admin-eyebrow, .admin-th, .admin-card already
                                          composable from existing tokens — only add if reused)
```

## Build order

1. **Shell** — restyle `AdminLayout` sidebar + mobile header to dark ink / champagne. Verify logo legible.
2. **Primitives** — add `PageHeader` and `AdminCard` so every page uses the same heading and surface.
3. **Pages, in passes** — apply primitives + table/form classes page by page, starting with Dashboard, Products, Categories, ProductTags (highest-traffic), then the rest.
4. **QA** — walk every admin route at desktop + mobile widths via preview, confirm contrast, active states, focus rings, dialog tones.

## Out of scope

- No changes to admin functionality, queries, or routes.
- No changes to storefront pages.
- No new admin features.
