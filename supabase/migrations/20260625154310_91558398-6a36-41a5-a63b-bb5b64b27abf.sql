CREATE TABLE IF NOT EXISTS public.secure_settings (
  id int PRIMARY KEY DEFAULT 1,
  google_reviews_api_key text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT secure_settings_singleton CHECK (id = 1)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.secure_settings TO authenticated;
GRANT ALL ON public.secure_settings TO service_role;

ALTER TABLE public.secure_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage secure_settings" ON public.secure_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.secure_settings (id) VALUES (1) ON CONFLICT DO NOTHING;