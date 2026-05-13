## Goal

Confirm the admin user-management workflow at **/admin/users** matches the requested behaviour: admins can **block/unblock**, **change role** (Manager ↔ Customer), and new signups always start as **Customer**. Replace the Delete control with the Block + role-change pair you described.

## Current state (already in place)

- **/admin/users** (`src/pages/admin/AdminsAdmin.tsx`, admin-only route) lists every profile with avatar, role badge, Active/Blocked badge, search, tabs (All / Managers / Customers / Blocked) and pagination.
- **Block / Unblock** — `toggleBlock()` flips `profiles.is_blocked` (Ban / ShieldCheck icon).
- **Role change** — Select dropdown calls `updateRole()` to rewrite `user_roles` for the user.
- **New signups → customer** — DB trigger `handle_new_user` already inserts role `'customer'` for any email other than the two reserved ones (`admin@itseraya.in` → admin, `erayaofficial03@gmail.com` → manager).
- **Admin reserved** — DB trigger `enforce_single_admin` plus the in-code guard restrict the admin role to `admin@itseraya.in`.

## Changes to make

Per your answers (keep single admin; replace Delete with Block + role-change):

1. **`src/pages/admin/AdminsAdmin.tsx`** — UI cleanup only:
   - Remove the **Delete** button, the `confirmDelete` state, the `deleteUser()` function, the `AlertDialog` block, and the now-unused `Trash2` / AlertDialog imports.
   - Keep the row actions as: **Role Select (manager / customer)** + **Block / Unblock** button.
   - Tighten the helper copy under the page title to: *"New signups join as Customer. Promote to Manager or block accounts here. The Admin role is reserved for `admin@itseraya.in`."*
   - Tweak the empty-state line to mention email/password signups too (not just Google).

2. **No database migration needed** — the existing `handle_new_user`, `enforce_single_admin`, and `is_blocked` column already enforce the rules.

3. **No auth-flow change needed** — the block flag is honoured wherever you gate logged-in features against `profiles.is_blocked`. (If you'd like, a follow-up task can add a sign-in-time check that signs blocked users out with a toast — flag this if you want it included.)

## Out of scope

- Hard-deleting `auth.users` entries (you opted for Block instead).
- Allowing multiple admins (you chose to keep the single-admin rule).
