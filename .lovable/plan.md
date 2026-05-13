
# Eraya Redesign — Ivory · Black · Gold + Customer Accounts + Bottom Nav

## 1. Theme: Ivory + Black + Gold

Update `src/index.css` semantic tokens (HSL only):

- `--background` → ivory `36 33% 97%` (keep)
- `--foreground` → near-black `0 0% 8%`
- `--primary` → gold `43 55% 52%`, `--primary-foreground` `0 0% 8%`
- `--secondary` / dark surface → `0 0% 8%` with ivory text (used for nav, bottom bar, dark cards)
- `--accent` → gold; remove blush (`--blush`) usage from layout
- `--card` stays white; add a `--surface-dark` token (`0 0% 8%`) and `--surface-dark-foreground` (`36 33% 97%`) for the bottom nav, hero pill, and "dark card" treatments
- `--border` → softer `0 0% 88%`
- Shadow: `--shadow-elegant` tuned to charcoal, `--shadow-gold` for CTAs
- Update `tailwind.config.ts` to expose `surface-dark`, `surface-dark-foreground`

Sweep components for hardcoded colors (`bg-blush`, `text-black`, `bg-white/90` in Header) and replace with tokens.

`CategoryRow` and `ProductRow` layout/columns stay exactly as-is — only colors/typography refresh through tokens.

## 2. Customer accounts

Auth backend already exists (`profiles`, `user_roles` with `customer` default, `handle_new_user` trigger). No schema change needed.

New code:

- `src/hooks/useAuth.ts` — wraps `supabase.auth` with `onAuthStateChange` listener (set up before `getSession`), exposes `{ user, profile, loading, signOut }`.
- `src/pages/Login.tsx` (route `/login`) — email/password sign-in + sign-up tabs, plus "Continue with Google" via `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`. Uses `emailRedirectTo: window.location.origin` on sign-up.
- `src/pages/Profile.tsx` (route `/profile`, public route but redirects to `/login` if no session) — shows avatar, name, email; lets the user update `full_name`/`avatar_url` on `profiles`; has Sign Out button.
- `src/pages/ResetPassword.tsx` (route `/reset-password`) — handles `type=recovery` hash, calls `supabase.auth.updateUser({ password })`.
- Wire all three into `src/App.tsx` (lazy + `Public` wrapper).

`supabase--configure_social_auth` enables Google. Email/password stays enabled. No auto-confirm.

## 3. Side menu (drawer in `Header.tsx`)

Restructure the existing `Sheet` into three sections:

1. Search trigger (unchanged)
2. **Shop** — Catalogue + visible categories (unchanged)
3. **Account** (new)
   - Signed out: `Log in` → `/login`
   - Signed in: avatar + name header, `Profile` → `/profile`, `Log out` (calls `signOut()` then closes drawer)
4. **More** — About + Support (unchanged)

The drawer stays at `lg:hidden` for mobile/tablet. On desktop (`lg+`) the same Account block appears as a small avatar/login button in the right-icons cluster (replaces nothing existing — added next to Search/Cart).

## 4. Mobile bottom navigation

New `src/components/header/BottomNav.tsx`:

- Fixed `bottom-0 inset-x-0 lg:hidden`, `bg-surface-dark text-surface-dark-foreground`, rounded-t-2xl, gold active indicator
- 4 items: **Home** (`/`), **Catalogue** (`/catalogue`), **Wishlist** (`/wishlist` — new placeholder page), **WhatsApp** (calls `openWhatsApp`)
- Uses `NavLink` with active styling; safe-area inset padding (`pb-[env(safe-area-inset-bottom)]`)
- Mounted once in `src/App.tsx` (inside `BrowserRouter`, after `<Routes>`), hidden on admin routes via `useLocation`

Add `pb-20 lg:pb-0` to public page wrappers (Index, Category, Catalogue, ProductDetail, About, Profile, Login) so content clears the bar.

### Wishlist (placeholder)

`src/pages/Wishlist.tsx` — simple "Coming soon — your saved pieces will live here" screen using existing typography. No backend yet. Route added in `App.tsx`.

## 5. Files touched

```
src/index.css                            (tokens)
tailwind.config.ts                       (surface-dark)
src/components/header/Header.tsx         (drawer Account section, color sweep)
src/components/header/BottomNav.tsx      (new)
src/components/eraya/Hero.tsx            (color sweep only)
src/components/eraya/CategoryRow.tsx     (color sweep only — layout untouched)
src/components/eraya/ProductRow.tsx      (color sweep only — layout untouched)
src/components/footer/Footer.tsx         (color sweep)
src/hooks/useAuth.ts                     (new)
src/pages/Login.tsx                      (new)
src/pages/Profile.tsx                    (new)
src/pages/ResetPassword.tsx              (new)
src/pages/Wishlist.tsx                   (new placeholder)
src/App.tsx                              (routes + BottomNav mount)
src/lib/routes.ts                        (login/profile/wishlist/reset routes)
```

## Out of scope (call out before building)

- No real wishlist persistence — just the placeholder page.
- No checkout/order changes.
- Admin panel theme stays as-is.

Reply **approve** to build, or tell me what to adjust.
