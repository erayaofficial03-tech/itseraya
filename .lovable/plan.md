## Security Fix 1 — Lock down `payment_settings`

Restrict direct table access to staff only, and expose safe UPI display fields to authenticated customers via an Edge Function.

### 1. Database migration

- Drop existing permissive SELECT policies on `payment_settings` (`Auth read`, `Authenticated users can read payment settings`, `Anyone can read payment settings`).
- Add policy `Staff read payment settings`: SELECT allowed only when `user_roles.role IN ('admin','manager')`.
- Drop `Admin write` and recreate `Admin write payment settings`: FOR ALL allowed only when `user_roles.role = 'admin'`.
- RLS already enabled; service role bypasses RLS so the Edge Function still works.

### 2. New Edge Function — `supabase/functions/get-payment-info/index.ts`

- Requires `Authorization` header (401 otherwise).
- Uses service-role client to read `payment_settings` row `id = 1`.
- Returns ONLY `upi_id`, `upi_name`, `upi_qr_url` (no cost/internal fields).
- CORS headers + `Cache-Control: private, max-age=300`.
- Deploys automatically (no `config.toml` edit needed — default `verify_jwt = false` is fine since we check the header in code).

### 3. Update `src/pages/Checkout.tsx`

- Replace the direct `supabase.from('payment_settings').select(...)` call with `supabase.functions.invoke('get-payment-info')`.
- Map the returned `{ upi_id, upi_name, upi_qr_url }` into existing `setPayment` state. Leave shipping/other settings reads untouched (those come from `settings`, not `payment_settings`).

### 4. Verification

- Run `supabase--linter` after migration.
- `tsgo --noEmit` for type safety.
- Confirm no other client code reads `payment_settings` directly (quick `rg` check); if found, route through the Edge Function or restrict to admin pages where staff RLS allows it.

### Notes / risks

- `OrdersAdmin` and `SettingsAdmin` already operate under admin auth, so staff-only RLS keeps working for them.
- Guests on Checkout: existing flow already requires login before checkout, so an auth-gated function is consistent. If a guest path exists, we'll surface a clear "Sign in to view payment details" message instead of widening the policy.
