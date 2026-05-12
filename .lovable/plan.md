# Eraya — Build Plan

Rebrand the existing LINEA structure into **Eraya**, a women's artificial jewellery store with WhatsApp-based enquiries (no cart, no checkout), a full admin panel, and a printable catalogue. Existing component layouts are reused; colors, fonts, copy, logo, and data sources are swapped.

---

## 1. Brand & design system

- **Colors** (HSL tokens in `index.css` + `tailwind.config.ts`):
  - Blush pink `#F2C4CE`, Gold `#C9A84C`, Ivory `#FAF7F2` (background), Charcoal `#2C2C2C` (foreground)
  - Update semantic tokens: `--background`, `--foreground`, `--primary` (gold), `--secondary` (blush), `--accent` (gold)
- **Fonts**: Playfair Display (headings) + Inter (body) via Google Fonts in `index.html`. Replace DM Sans in tailwind config.
- **Logo**: copy `user-uploads://Eraya_LOGO_New.png` → `public/eraya-logo.png` and `src/assets/eraya-logo.png`. Replace LINEA SVGs in Header/Footer/CheckoutHeader. Set as favicon in `index.html`.
- **Copy sweep**: replace "LINEA" everywhere with "Eraya" + tagline "Adorn Your Story" (pulled from settings table when available).

---

## 2. Lovable Cloud (backend)

Enable Lovable Cloud, then create:

**Tables**
- `categories` — id, name, image_url, display_order, is_visible
- `products` — id, name, category_id (fk), description, original_price (numeric ₹), discounted_price (numeric, nullable), tags (text[]), is_featured (bool), is_visible (bool), created_at
- `product_images` — id, product_id (fk), image_url, sort_order
- `settings` — singleton row: store_name, tagline, logo_url, whatsapp_number, hero_image_url, hero_headline, hero_subtext, hero_cta_label
- `social_links` — id, platform, url, is_visible, display_order
- `user_roles` — (id, user_id, role enum 'admin'|'user') with `has_role()` security-definer function (per the user-roles standard)

**RLS**
- Public SELECT on visible products/categories/settings/social_links
- Admin-only INSERT/UPDATE/DELETE everywhere via `has_role(auth.uid(), 'admin')`

**Storage buckets** (public): `product-images`, `category-images`, `branding`

**Seed data**
- 6 categories: Rings, Earrings, Necklaces, Bangles, Pendants, Bracelets (Unsplash images)
- ~12 products spread across categories with original/discounted prices, tags (`new`, `bestseller`, `sale`), Unsplash images
- Default settings row with tagline "Adorn Your Story"
- Admin role auto-granted on first signup of `admin@itseraya.in` (handled in `handle_new_user` trigger checking email)

---

## 3. "I Love It" WhatsApp enquiry

- Shared `LoveItButton` component replaces every "Add to Bag"/"Buy Now" in `ProductInfo`, `ReviewProduct`, product cards, etc.
- Reads `whatsapp_number` from settings (cached via React Query).
- Builds URL: `https://wa.me/{number}?text=...` with the exact pre-filled message from the spec (product name, price, current page URL, properly `encodeURIComponent`-ed).
- If number empty → sonner toast "Enquiry setup coming soon!"
- Style: gold background, charcoal text, heart icon.

---

## 4. Public pages (rebuild on existing structure)

- **Homepage (`/`)**: hero (settings-driven) → Shop by Category (horizontal scroll mobile / grid desktop) → New Arrivals (`new` tag) → Trending Now (`bestseller`) → On Sale (has discounted_price). Product card shows image, name, struck-through original price, discounted price, gold "X% OFF" badge.
- **Category page (`/category/:slug`)**: existing `ProductGrid` wired to live data filtered by category.
- **Product page (`/product/:id`)**: gallery (swipeable), name, tags, price block with discount badge, description, three buttons: 💛 I Love It • 📤 Share (Web Share API + clipboard fallback) • 📄 Save as PDF (jsPDF single product).
- **Catalogue page (`/catalogue`)** — NEW: printable grid of all visible products + "Download Full Catalogue as PDF" button (multi-page jsPDF, Eraya logo + store name header on each page). Each card has a small WhatsApp share icon.
- **Footer**: logo, tagline, dynamic social icons from `social_links`, WhatsApp click-to-chat, copyright.
- Remove/repurpose Checkout page (no checkout in enquiry-only model) — keep route as redirect to home or delete.

---

## 5. Admin panel (`/admin/*`)

- Supabase email+password auth. Sign-in page at `/admin/login`. Protected routes via `RequireAdmin` wrapper that checks `has_role`.
- Layout: shadcn Sidebar with Dashboard / Products / Categories / Banner & Homepage / Profile & Settings.
- **Dashboard**: counts of products, categories (enquiries count shown as "—" since not tracked).
- **Products**: data table + add/edit drawer with multi-image upload (drag-reorder via dnd-kit), auto-computed discount %, tag chips, visibility/featured toggles.
- **Categories**: table + add/edit dialog with image upload + display order.
- **Banner & Homepage**: form for hero image/headline/subtext/CTA + featured toggles.
- **Profile & Settings**: store name, tagline, logo upload, WhatsApp number (with country code validation), social links manager (add/remove rows: platform select + url + show/hide).

All forms use react-hook-form + zod (length limits, URL validation, phone format `^\d{10,15}$`).

---

## 6. Technical details

- **PDF**: `jspdf` + `jspdf-autotable`. Helper `src/lib/pdf.ts` with `generateProductPdf(product, settings)` and `generateCatalogPdf(products, settings)`. Images loaded as base64 via fetch.
- **Data fetching**: TanStack Query (already present) with a `src/integrations/supabase/queries.ts` module.
- **Routing**: extend `App.tsx` with `/catalogue`, `/admin/login`, `/admin/*` nested routes.
- **Validation**: zod schemas shared between forms and edge cases.
- **Image fallbacks**: Unsplash URLs for seed; admin-uploaded images take over once present.

---

## 7. Out of scope (explicitly)

- No stock/inventory fields
- No cart, checkout, or payments
- No order history / customer accounts (only admin auth)
- No analytics on enquiries (toast only)

---

## 8. Post-build checklist (shown to user)

1. Sign up at `/admin/login` with `admin@itseraya.in` → auto-promoted to admin
2. Settings → upload logo, set WhatsApp number, add social links
3. Banner & Homepage → set hero
4. Categories & Products → review seeded data, add real items
