# Plan — Stabilise & Reconnect

You confirmed: **keep portals separate**, but when admin signs in they should land in the admin panel and have a clean way to *view the storefront as a customer* (preview), without losing admin context. Plus 4 cross-cutting fixes.

---

## 1. Admin ↔ Customer view (separate, with preview)

Current state: `useAuth` already exposes `currentMode` + `switchMode` (writes `profiles.current_mode`). Header shows a switcher; AdminLayout has a "View store" button. The bug is that the storefront still shows customer-only widgets (wishlist heart, cart, WhatsApp float, bottom nav cart/saved) to a logged-in admin — so admins see clutter and the role feels merged.

Fix:
- Add `isAdminPreview = isStaff && currentMode === "customer"` flag.
- When true, render a **slim top banner** on storefront: *"Previewing as customer · Exit preview"* → calls `switchMode("admin")` and routes to `/admin`.
- While in preview, hide on the storefront: WhatsApp float, BottomNav "Saved" badge updates, Cart drawer write actions (read-only), wishlist heart actions (toast "preview mode"). Header keeps only Search + Exit preview.
- Admin landing: `/admin` always = Dashboard. Remove the "Profile / Settings" customer-style entries from the admin sidebar (admin already has `AdminProfile`).
- Auto-redirect rule in `RoleGuard`: if `isStaff && currentMode==="admin"` and URL is a storefront route → bounce to `/admin` (already implemented, verify it actually runs after login).

No DB changes. No new pages.

## 2. WhatsApp float "not visible after refresh"

Root cause in `WhatsAppFloat.tsx`:
```ts
if (!/^91[6-9]\d{9}$/.test(wa)) return null;
```
The regex requires exactly `91` + 10-digit Indian mobile starting 6–9. Any number stored as `+91…`, with spaces, or without country code gets stripped and fails. After a fresh load `useSettings` returns the trimmed view value and the float silently disappears.

Fix:
- Normalise: strip non-digits, if length === 10 and starts with 6–9 → prefix `91`; accept any E.164 with ≥ 10 digits.
- Show the float whenever a non-empty number exists; only hide if truly blank or `whatsapp_float_visible === false`.
- Surface the *actual* parsed number in `SettingsAdmin` with a live preview + validation hint so the admin sees why it would hide.

## 3. Mobile dialog/sheet overflow audit

Sweep every `DialogContent` / `SheetContent` / drawer for:
- Missing `max-w-[calc(100vw-2rem)]` and `max-h-[90vh] overflow-y-auto`.
- Fixed widths (`w-[500px]`, `max-w-2xl` without responsive cap).
- Long URLs not wrapping (e.g. `WhatsAppFallbackDialog` line 76 — `truncate` on a 320px viewport hides the link entirely; switch to `break-all` + `text-xs`).
- Footers using `sm:justify-between` that overflow on 360px — stack vertically by default.
- iOS safe-area: add `pb-[env(safe-area-inset-bottom)]` to bottom-anchored sheets.

Files to patch: `WhatsAppFallbackDialog`, `CartDrawer`, `EnquiryCartDrawer`, `IOSInstallGuide`, `InstallTroubleshootSheet`, `ShareMenu`, `ImageZoom`, all `admin/*Admin.tsx` sheets (OrdersAdmin detail, CustomersAdmin profile, ProductsAdmin editor, BannersAdmin editor). Also fix the two console warnings: `DialogContent` missing `DialogTitle`/`DialogDescription` (a11y).

## 4. Analytics — visitors not showing

Two separate things:

a) **Lovable platform analytics** (sidebar in lovable.dev). These only populate on the **published** domain after GA/GTM tags are injected. I'll verify:
- `BrandProvider` injects `get_public_tracking_ids()` → confirm IDs are saved in `SeoAdmin` and the `<script>` actually renders on `itseraya.in` (test via `view-source`).
- Add a small "Tracking status" badge in `SeoAdmin` that pings the public URL and confirms the gtag/GTM snippet is live.

b) **In-app `/admin/analytics`**. Currently reads `product_views` + `enquiry_sessions` but has no unique-visitor counter. I'll add:
- Daily unique sessions (distinct `session_id` from `product_views`).
- Top referrers (needs a new `referrer text` column on `product_views`; logged from `document.referrer` in `ProductDetail`).
- Visitor trend chart + today/7d/30d KPIs at the top of Analytics tab.

## 5. "Not safe" warning on itseraya.in

Most likely cause on a Lovable custom domain: **mixed content** (some asset/image loaded over `http://`) or a stale/invalid SSL cert during the post-DNS-change reissue window. Action:
- I'll grep the codebase for any `http://` literals in `<img>`, `<script>`, CSS `url()`, settings rows (logo, banners, payment-screenshots), and `BrandProvider` injected scripts.
- Check `index.html` for hard-coded `http://` social/OG URLs.
- Have you click ⓘ next to the URL in Chrome and paste the exact wording — "Not secure" (no padlock = mixed content / no cert) vs. "Dangerous" (Safe Browsing flag — different remediation path).
- Verify domain status via Lovable's Domain admin (`/admin/domain`). If status ≠ Active or SSL reissue is pending, the fix is in Project Settings → Domains.

## 6. Console a11y warnings

Add `DialogTitle` + `DialogDescription` (or `VisuallyHidden` wrappers) to every Dialog flagged in the console — currently several `command`/`sheet` instances.

---

## Technical execution order
1. WhatsApp float regex + admin live preview (10 min, isolated).
2. Admin-preview banner + storefront widget gating (uses existing `useAuth`).
3. Mobile dialog sweep (mechanical; one PR).
4. Mixed-content scan + report on "not safe" warning (need your Chrome ⓘ wording to finalise).
5. Analytics: add session/referrer tracking + KPI cards.
6. A11y dialog titles.

## Out of scope (will not touch)
- Merging admin & customer accounts into a single role.
- Removing the storefront UI for admins entirely (you asked to keep separate).
- Schema rewrites; only one additive column (`product_views.referrer`).

## Need from you before step 4
Exact Chrome warning text on `itseraya.in` (screenshot of the ⓘ panel is ideal) — determines whether it's mixed content, expired cert, or Safe Browsing.
