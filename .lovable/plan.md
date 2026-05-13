# ERAYA Phase 1 Improvements

A large, multi-area enhancement. Here's the proposed plan, grouped by feature. Approve to proceed.

## 1. Database (single migration)

**New tables**
- `enquiry_sessions` (session_id, customer_email/name, status, enquiry_ref UNIQUE, notes, timestamps) + RLS public-all
- `enquiry_items` (session_id FK CASCADE, product_id FK SET NULL, name, price, size, colour, qty) + RLS public-all
- `announcements` (title, message, cta_text/url, colors, is_active, display_order, starts_at, expires_at, is_marquee) + public read; admin manage via `has_role('admin')`

**Schema additions**
- `enquiries`: add `status`, `enquiry_ref`, `admin_notes`, `priority`, `followed_up_at`
- `settings`: add `enquiry_mode text default 'cart'`
- `products`: add optional `sizes text[]`, `colours text[]` for variant selector (nullable, safe default `{}`)

Indexes: `enquiry_sessions(enquiry_ref)`, `enquiry_items(session_id)`, `announcements(is_active, display_order)`.

**Seed**: migrate current single-row `settings.announcement_*` into `announcements` table on first load (one-time insert if table empty and announcement_visible=true).

## 2. Enquiry Cart (customer)

- `src/hooks/useEnquiryCart.ts` — localStorage `eraya_enquiry_cart`, functions: add/remove/update qty/clear/getCount, plus a tiny pub-sub so header badge updates.
- `src/lib/enquiryRef.ts` — `ENQ-XXXX` generator (4–5 char base36, collision retry against DB).
- `src/components/EnquiryCartDrawer.tsx` — right-side `Sheet`; list items (image, name, variant, qty, remove), customer note textarea, "Send WhatsApp Enquiry" button. On submit:
  1. Insert `enquiry_sessions` row (with ref) + `enquiry_items` rows
  2. Also insert one summary row in legacy `enquiries` (back-compat)
  3. Build WhatsApp message → open `wa.me`
  4. Clear cart, toast success, link to `/track?ref=…`
- Header: add cart icon next to wishlist with gold badge.
- `ProductCard` "+" button → "Add to Enquiry" (opens variant mini-sheet if product has sizes/colours, else direct add + toast).
- `ProductDetail` "I Love It" → adds to enquiry cart and opens drawer.
- Respect `settings.enquiry_mode`: when `direct`, keep current single-product WhatsApp flow.

## 3. Announcement Bar v2

- `useAnnouncements()` query: active + within schedule + ordered.
- Rewrite `AnnouncementBar.tsx`: rotate every 4s with fade (framer-motion), marquee mode when flagged, per-id dismissal in sessionStorage, hide when all dismissed.
- Falls back to legacy `settings.announcement_*` if table empty.

## 4. Admin: Announcements

- Install `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.
- Expand `AnnouncementAdmin.tsx`: list with drag-reorder (updates `display_order`), inline add/edit dialog with all fields (title, message, CTA, colors, schedule, marquee, active toggle), delete.

## 5. Admin: Enquiries

- Extend `EnquiriesAdmin.tsx`:
  - Status dropdown (Open / Contacted / Interested / Negotiation / Closed Won / Closed Lost / Follow-up Pending) with color-coded badges
  - Admin notes textarea, priority toggle, follow-up date picker
  - Filter tabs (All / Open / Follow-up / Closed Won / Closed Lost)
  - "WhatsApp reply" quick button (uses customer phone if present, else copies)
  - Show enquiry session items when `enquiry_ref` matches a session
- Dashboard widget: "Enquiry Pipeline" — counts by status.

## 6. Navigation additions (non-destructive)

Add structured sections to existing side menu (`Navigation.tsx`) without redesign:
- SHOP: Catalogue, New Arrivals, Bestsellers, On Sale, + DB categories
- COLLECTIONS: Bridal, Daily Wear, Office Wear, Party Wear (link to `/catalogue?collection=…`)
- ACCOUNT: existing
- MORE: Track Enquiry (`/track`), About, Support

New/Bestsellers/Sale/Collections route to existing `/catalogue` with query filters; minimal Catalogue.tsx update to read these.

## 7. Public `/track` page

- `src/pages/TrackEnquiry.tsx` — input for ENQ code, fetches session + items by `enquiry_ref`, shows status badge, products list, submitted date, "Continue on WhatsApp" button. Pre-fills from `?ref=` query.
- Route added in `App.tsx`.

## Out of scope (untouched)

Admin UI styling system, ProductDetail layout, Wishlist, PDF generation, auth flow, existing Supabase tables' structure (only additive columns).

## Technical notes

- All new RLS uses `true` for public read/write per spec on enquiry tables (so unauthenticated customers can submit). Note: this allows public read of all enquiry sessions — acceptable per spec but flagged.
- Variant selector only appears when product has non-empty `sizes`/`colours` arrays; until admin populates them, behaves as direct add.
- Migration is additive only; no destructive changes to existing tables.

Approve and I'll start with the migration, then ship features in the order above.
