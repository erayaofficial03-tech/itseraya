## Problem

Homepage sections and side-menu shortcuts use mismatched filter slugs, so several "View all" links land on the wrong (or empty) Catalogue view.

| Source | Section | Link | Catalogue handler |
|---|---|---|---|
| Homepage | Trending Now (tag `bestseller`) | `?filter=bestseller` ❌ | only knows `bestsellers` |
| Homepage | Hot Selling (`is_featured`) | `?filter=featured` ❌ | not handled at all |
| Header side menu | Bestsellers | `?filter=bestsellers` ✅ | filters by `is_featured` (wrong field — should be `bestseller` tag to match homepage "Trending Now") |
| Header side menu | New Arrivals | `?filter=new` ✅ | OK |
| Header side menu | On Sale | `?filter=sale` ✅ | OK |

Net result: "View all" under Trending Now and Hot Selling on the homepage are broken, and the side menu's "Bestsellers" link shows featured products instead of bestseller-tagged ones.

## Fix (presentation only — no schema/data changes)

**1. Standardize the filter vocabulary** to match how the homepage defines each section:
- `new` → newest products (unchanged)
- `bestseller` → products with the `bestseller` tag (Trending Now)
- `featured` → `is_featured = true` (Hot Selling)
- `sale` → discounted products (unchanged)

**2. `src/pages/Catalogue.tsx`**
- Update the filter switch to handle: `new`, `bestseller`, `featured`, `sale`.
- Update the heading map: `bestseller` → "Trending Now", `featured` → "Hot Selling".
- Update the comment on `filterParam`.

**3. `src/pages/Index.tsx`**
- Trending Now `viewAllHref` already uses `?filter=bestseller` — keep.
- Hot Selling `viewAllHref` already uses `?filter=featured` — keep.

**4. `src/components/header/Header.tsx`** side-menu quick links
- Change "Bestsellers" entry to `{ label: "Trending Now", to: "/catalogue?filter=bestseller", icon: Crown }` so it matches the homepage section semantically.
- Add a "Hot Selling" entry (`?filter=featured`) so all four homepage sections are reachable from the side menu, matching the user's spec (Best seller / new arrivals / on sale + Hot Selling parity with homepage).
- Keep New Arrivals and On Sale as-is.

## Verification

- Click each side-menu shortcut and each homepage "View all" → Catalogue heading + product list should match the corresponding homepage row.
- Trending Now (homepage) and Trending Now (side menu) should show the same set.
- Hot Selling (homepage) and Hot Selling (side menu) should show the same set.

No backend, RLS, or product data changes.