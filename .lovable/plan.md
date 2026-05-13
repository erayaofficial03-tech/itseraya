## Goal

Bring the storefront closer to the SPIRIT reference: a clean minimal product card, a List/Grid view toggle on listing pages, and the missing supporting pages (Search, FAQ, Care Guide, Contact).

---

## 1. Product Card — restyle to match reference

`src/components/eraya/ProductCard.tsx` (replace markup, keep all logic — wishlist, enquiry, links):

- Square image (already), white background, no border (reference is borderless). Heart icon top-right (kept), remove gold "+" button on the card — enquiry add stays accessible from product page (reference cards are CTA-free in grid).
- Below image, left-aligned:
  - Brand/category: `text-[10px] tracking-[0.2em] uppercase text-muted-foreground` — small caps "TIFFANY AND CO." style.
  - Product name: `font-serif text-[13px] md:text-[14px] text-foreground leading-tight line-clamp-2` (lowercase as authored — no transform).
  - Price row: gold price first `text-gold text-[13px] font-medium`, strikethrough original after with `text-muted-foreground text-[11px] line-through`. Use `flex items-baseline gap-2 flex-wrap` so they never overlap.
- Discount badge stays top-left but smaller and lighter weight.
- Remove min-heights that caused overlap; rely on `mt-auto` + `gap` only.

## 2. List view variant

New file `src/components/eraya/ProductListItem.tsx` — horizontal row:

```text
[ 96x96 image ]  BRAND (tiny caps)
                 Product name (serif)
                 ★ 4.8 Ratings  (only if reviews exist; otherwise omit)
                 ₹price   ₹original̶
                                              ♡ (top-right of row)
```

Full row is a `<Link>` to product. Heart toggles wishlist. No inline enquiry CTA (per user choice "Simpler row").

## 3. View toggle on listing pages

Add a small reusable control `src/components/eraya/ViewToggle.tsx` with two icon buttons (Grid3x3 / List from lucide). State stored in `localStorage` key `eraya:view-mode` so it persists across pages, default `grid`.

Wire into:

- `src/pages/Catalogue.tsx` — place toggle in the filter pills row (right-aligned). When `list`, render a `flex flex-col divide-y divide-border` of `ProductListItem`. When `grid`, keep existing grid.
- `src/pages/Category.tsx` — same toggle right of the title; same conditional render.

Mobile keeps 3-col grid by default; switching to list shows the row layout (matches reference image 2 middle frame).

## 4. New pages

All public, lazy-loaded in `App.tsx`, linked from Footer (desktop) and mobile menu INFO section in `Header.tsx`.

### a) `/search` — `src/pages/Search.tsx`
- Header + search input (large, underlined, like reference image 1 left).
- "Recent search" chips from `localStorage` (key `eraya:recent-search`, max 6, dismissible).
- "Popular search terms" — pulled from `settings.popular_search_terms` (new optional text column, falls back to a default list: Necklace, Earrings, Rings, Bracelets, Anklets, Sets).
- Live filter against `useProducts()`; results render as `ProductListItem` rows.

### b) `/faq` — `src/pages/Faq.tsx`
- Uses `Accordion` from `src/components/ui/accordion.tsx`.
- Default questions hard-coded for jewellery store: shipping time, returns, ring sizing, gold purity, care, warranty, payment, customisation, bulk/wedding orders. (Editable later via admin if needed; not in this pass.)

### c) `/care` — `src/pages/CareGuide.tsx`
- `PolicyPage`-style layout with sections: Daily wear tips, Cleaning gold/silver/diamond, Storage, What to avoid (perfume, chlorine), When to bring it in for service.

### d) `/contact` — `src/pages/Contact.tsx`
- Three contact tiles: WhatsApp (`settings.whatsapp_number`), Email (`settings.contact_email`), Phone (if set), plus address from `settings.store_address`.
- Simple form (name, email, message) that opens prefilled WhatsApp on submit (no backend writes — keeps "do not touch" rule).

### e) Routing & navigation
- Add 4 lazy imports + 4 `<Route>` entries in `App.tsx`.
- Footer "Shop" column gets `Search`; new "Help" column gets FAQ, Care Guide, Contact.
- Mobile menu INFO section (`Header.tsx`): add Search, FAQ, Care Guide, Contact above existing Track Order.

## 5. No DB / no backend changes

- Reuses existing `settings` columns; no migration required.
- Wishlist, enquiry cart, PDF, product detail untouched.
- Admin UI untouched.

---

## Files

**Created**
- `src/components/eraya/ProductListItem.tsx`
- `src/components/eraya/ViewToggle.tsx`
- `src/pages/Search.tsx`
- `src/pages/Faq.tsx`
- `src/pages/CareGuide.tsx`
- `src/pages/Contact.tsx`

**Edited**
- `src/components/eraya/ProductCard.tsx` (restyle)
- `src/pages/Catalogue.tsx` (toggle + list render)
- `src/pages/Category.tsx` (toggle + list render)
- `src/App.tsx` (4 new routes)
- `src/components/footer/Footer.tsx` (new Help column + Search link)
- `src/components/header/Header.tsx` (mobile INFO links)

No database migration. No changes to admin, auth, enquiry cart, wishlist logic, PDF, or product detail page.