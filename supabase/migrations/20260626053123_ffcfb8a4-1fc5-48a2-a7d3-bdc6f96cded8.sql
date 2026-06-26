
DROP POLICY IF EXISTS "Auth read" ON public.payment_settings;
DROP POLICY IF EXISTS "Authenticated users can read payment settings" ON public.payment_settings;
DROP POLICY IF EXISTS "Anyone can read payment settings" ON public.payment_settings;
DROP POLICY IF EXISTS "Admin write" ON public.payment_settings;
DROP POLICY IF EXISTS "Admin write payment settings" ON public.payment_settings;
DROP POLICY IF EXISTS "Staff read payment settings" ON public.payment_settings;

CREATE POLICY "Staff read payment settings" ON public.payment_settings
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Admin write payment settings" ON public.payment_settings
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
