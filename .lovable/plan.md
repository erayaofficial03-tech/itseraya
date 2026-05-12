## Goal
When a user signs in with admin credentials (via `/login`, Google, or any auth flow), automatically route them to `/admin` instead of the storefront home.

## Current behavior
- `src/pages/Login.tsx` redirects signed-in users to `redirectTo` (defaults to `/`) — admins land on the storefront.
- `src/pages/admin/AdminLogin.tsx` already redirects admins to `/admin` (works only if they used that page).
- `useAuth()` exposes `isAdmin` (checked against `user_roles` table).

## Change
Update `src/pages/Login.tsx` so the post-login redirect chooses the destination based on role:

```ts
useEffect(() => {
  if (loading || !user) return;
  if (isAdmin) navigate("/admin", { replace: true });
  else navigate(redirectTo, { replace: true });
}, [user, isAdmin, loading, navigate, redirectTo]);
```

- Pull `isAdmin` and `loading` from `useAuth()` (already provided).
- Wait for `loading` to finish so we don't redirect to `/` before the role check resolves.
- An explicit `?redirect=` query param still wins for non-admins; admins always go to `/admin`.

## Out of scope (keep as-is)
- `AdminLogin.tsx` already handles its own redirect.
- Account dropdown / header behavior unchanged.
- No DB / role schema changes.

## Verification
- Sign in with `admin@itseraya.in` on `/login` → lands on `/admin`.
- Sign in with a normal user → lands on `/` (or `?redirect=` target).
- Google sign-in for an admin → also lands on `/admin` once the session resolves.