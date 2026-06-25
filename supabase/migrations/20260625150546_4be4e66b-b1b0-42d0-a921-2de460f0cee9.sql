
-- 1) pricing_components: drop public select
DROP POLICY IF EXISTS "public read pricing components" ON public.pricing_components;
CREATE POLICY "staff read pricing components" ON public.pricing_components
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- 2) settings: drop public read; restrict to authenticated; create safe public view
DROP POLICY IF EXISTS "public read settings" ON public.settings;
CREATE POLICY "authenticated read settings" ON public.settings
  FOR SELECT TO authenticated
  USING (true);

DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(format('s.%I', column_name), ', ')
  INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'settings'
    AND column_name NOT IN (
      'upi_id','upi_qr_url','upi_name',
      'google_reviews_api_key','domain_verification_token'
    );
  EXECUTE format(
    'CREATE OR REPLACE VIEW public.public_settings WITH (security_invoker = false) AS SELECT %s FROM public.settings s',
    cols
  );
END $$;

GRANT SELECT ON public.public_settings TO anon, authenticated;
