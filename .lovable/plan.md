## Goal
Guarantee that signing in with `admin@itseraya.in` (or any user with the `admin` role) always lands on `/admin`, while every other user lands on the storefront home (`/` on `itseraya.in`).

## Why this isn't fully reliable today
`Login.tsx` already branches on `isAdmin`, but `useAuth` resolves `isAdmin` asynchronously after `onAuthStateChange` fires. On a fresh email/password sign-in the sequence is:

1. `signInWithPassword` succeeds → `onAuthStateChange` fires.
2. `user` is set, `isAdmin` is still `false` (role query hasn't returned).
3. `Login`'s `useEffect` runs and navigates to `/` before the role check completes.

Result: an admin can briefly land on `/` instead of `/admin`. We need the redirect to wait for the role check.

## Changes

### 1. `src/hooks/useAuth.ts`
Add a `roleChecked` flag that flips to `true` only after the `user_roles` query resolves (or when there is no user). Expose it alongside `isAdmin`.

```ts
const [roleChecked, setRoleChecked] = useState(false);
// set false when user changes, true once role lookup resolves (or no user)
```

### 2. `src/pages/Login.tsx`
- Pull `roleChecked` from `useAuth`.
- Gate the redirect on `roleChecked` so the navigation always sees the final `isAdmin` value.

```ts
useEffect(() => {
  if (loading || !user || !roleChecked) return;
  navigate(isAdmin ? "/admin" : redirectTo, { replace: true });
}, [user, isAdmin, roleChecked, loading, navigate, redirectTo]);
```

### 3. `src/pages/admin/AdminLogin.tsx`
Apply the same `roleChecked` gate so the existing admin-login page benefits from the same correctness fix.

## Out of scope
- No DB / trigger changes — the existing `handle_new_user` trigger already grants `admin` to `admin@itseraya.in` and `erayaofficial03@gmail.com`.
- No hard-coded email check in client code (role table remains the source of truth, which is the secure pattern). The admin email gets `/admin` because it has the role.
- No changes to `safeRedirect` or `routes.ts`.

## Verification
1. Sign in as `admin@itseraya.in` from `/login` (email + password and Google) → instant landing on `/admin`, no flash of `/`.
2. Sign in as a non-admin user → lands on `/` (or the validated `?redirect=` target).
3. Visit `/admin` while signed-out → redirected to `/login?redirect=/admin`; after admin sign-in, returned to `/admin`.