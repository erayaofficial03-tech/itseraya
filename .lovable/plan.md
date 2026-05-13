# Remove Duplicate Settings Across Admin

After scanning every admin page, three real duplicates remain. The visible "Announcements" duplicate you spotted is the **legacy single‑announcement fields baked into the `settings` row** that the announcement bar still falls back to when the managed `announcements` table is empty.

## Duplicates found

### 1. Announcements (the one you flagged)
- Source of truth: `/admin/announcement` (table `announcements`, multi‑item, scheduling, marquee).
- Hidden duplicate: 5 legacy columns on `settings` — `announcement_visible`, `announcement_text`, `announcement_bg_color`, `announcement_text_color`, `announcement_dismissible`. Used as a fallback inside `src/components/AnnouncementBar.tsx`. They aren't shown in any admin form anymore but they still drive content if the admin table is empty, so editing one place doesn't reflect the other.

### 2. Social presence (inside Settings → Profile & Settings)
- "Social links" card → `social_links` table (platform + URL, supports many).
- "Social connections" card → `settings.instagram_username` + `settings.facebook_page_name` (just handles, no URL, no toggle, "live posting coming soon" — never wired up).
- Both express the same intent. Keep `social_links` (richer), drop the handles card and the two columns.

### 3. Confusing twin admin pages (not data duplicates, naming duplicates)
- `Banners` → `/admin/banners` → hero slider images (`banners` table).
- `Homepage & Banner` → `/admin/banner` → homepage section titles + visibility (Categories, New Arrivals, etc.).
The word "Banner" in the second label is misleading. Rename it to **Homepage Sections**.

## Changes

### Frontend
- `src/components/AnnouncementBar.tsx` — remove the legacy fallback block; render only from the `useAnnouncements()` query.
- `src/pages/admin/SettingsAdmin.tsx` — delete the "Social connections" card; remove `instagram_username` / `facebook_page_name` from `useState`, `useEffect`, and the `update` payload.
- `src/lib/queries.ts` + `src/lib/settingsDefaults.ts` — drop the 5 announcement_* and 2 social handle keys from the `Settings` type and defaults.
- `src/pages/admin/AdminLayout.tsx` — relabel "Homepage & Banner" → "Homepage Sections" (route `/admin/banner` unchanged for back‑compat).

### Database (migration)
Drop now‑unused columns from `settings`:
- `announcement_visible`, `announcement_text`, `announcement_bg_color`, `announcement_text_color`, `announcement_dismissible`
- `instagram_username`, `instagram_connected_at`, `facebook_page_name`, `facebook_connected_at`

No data preservation needed — the managed `announcements` table and `social_links` table already cover both use cases.

## Out of scope
- BannerAdmin vs BannersAdmin code stays as‑is; only the sidebar label changes.
- All other admin pages were checked (Brand, USPs, SEO, Policies, Categories, Products, Banners, Customers, Enquiries, Labels, Admins, Profile) — no field overlaps with Settings.
