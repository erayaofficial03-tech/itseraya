
-- Revert previous attempt
DROP VIEW IF EXISTS public.public_settings;
DROP POLICY IF EXISTS "authenticated read settings" ON public.settings;

-- Create payment_settings table to hold UPI info (signed-in users can read; admins manage)
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id integer PRIMARY KEY DEFAULT 1,
  upi_id text,
  upi_name text,
  upi_qr_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_settings_singleton CHECK (id = 1)
);

-- Copy existing UPI data over from settings (if present)
INSERT INTO public.payment_settings (id, upi_id, upi_name, upi_qr_url)
SELECT 1, upi_id, upi_name, upi_qr_url FROM public.settings WHERE id = 1
ON CONFLICT (id) DO UPDATE
  SET upi_id = EXCLUDED.upi_id,
      upi_name = EXCLUDED.upi_name,
      upi_qr_url = EXCLUDED.upi_qr_url;

GRANT SELECT ON public.payment_settings TO authenticated;
GRANT ALL ON public.payment_settings TO service_role;

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read payment settings"
  ON public.payment_settings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "admins manage payment settings"
  ON public.payment_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Drop sensitive columns from the publicly readable settings table
ALTER TABLE public.settings
  DROP COLUMN IF EXISTS upi_id,
  DROP COLUMN IF EXISTS upi_name,
  DROP COLUMN IF EXISTS upi_qr_url,
  DROP COLUMN IF EXISTS google_reviews_api_key,
  DROP COLUMN IF EXISTS domain_verification_token;

-- Restore public read on settings (now safe — no sensitive cols remain)
CREATE POLICY "public read settings"
  ON public.settings FOR SELECT
  USING (true);
