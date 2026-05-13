## 1. Defensive role-banner guard

There are no role banners left in the admin UI today (already removed from `Dashboard.tsx`), but to make sure none can ever render again without a real role match, add a small wrapper component and use it everywhere a role-gated message would appear.

- Create `src/components/admin/RoleBanner.tsx`:
  - Props: `role: "admin" | "manager"`, `children`.
  - Internally calls `useAuth()` and renders `null` unless `(role === "admin" && isAdmin) || (role === "manager" && isManager && !isAdmin)`.
  - Also returns `null` while `loading` is true so a banner never flashes before the role resolves.
- Export it for future use; no banners are added back right now. This guarantees any future "You are logged in as …" message is gated by the actual auth state, not just a local prop.

## 2. Mobile admin header — true logo centering

In `src/pages/admin/AdminLayout.tsx` the mobile header uses `grid-cols-[auto_1fr_auto]` with a 40 px menu button on the left and an empty `<div />` on the right. The empty div has no width, so the centered column is pushed right.

- Give the right placeholder a fixed size matching the menu button (`<div className="w-10 h-10" />` or `aria-hidden`).
- Result: the `BrandLogo` + "ADMIN" caption sit perfectly centered between the two equal-width side slots on every viewport.

## 3. Remove duplicated settings from Store Settings

`UspsAdmin` (`/admin/usps`, "USPs & Reviews") already owns:
- `usp_1`, `usp_2`, `usp_3`
- `usp_interval_ms`, `usp_fade_speed_ms`

`SettingsAdmin` (`/admin/settings`) currently re-renders the same five fields (lines 177–221). Remove that block and the matching state/save keys from `SettingsAdmin` so each setting has exactly one place to live:

- Delete the `grid grid-cols-2 gap-4` block with USP interval / fade speed inputs.
- Delete the `space-y-3 rounded-md border border-border p-4` block with the three USP inputs.
- Remove `usp_interval_ms`, `usp_fade_speed_ms`, `usp_1`, `usp_2`, `usp_3` from the initial `useState` object, the `useEffect` hydration block, and the `update({ ...form })` payload (rely on `UspsAdmin` to write them).
- Leave a single short note under the WhatsApp section pointing admins to **USPs & Reviews** for the rotating top-bar messages.

No DB schema changes — the columns stay; only the duplicated UI is removed.

## Files touched
- `src/components/admin/RoleBanner.tsx` (new)
- `src/pages/admin/AdminLayout.tsx` (mobile header right slot width)
- `src/pages/admin/SettingsAdmin.tsx` (drop USP duplicates from form/state/save)
