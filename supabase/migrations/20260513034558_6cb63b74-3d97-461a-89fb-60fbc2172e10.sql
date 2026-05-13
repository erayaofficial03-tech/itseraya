DROP TABLE IF EXISTS public.audit_logs CASCADE;

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS instagram_username text,
  ADD COLUMN IF NOT EXISTS instagram_connected_at timestamptz,
  ADD COLUMN IF NOT EXISTS facebook_page_name text,
  ADD COLUMN IF NOT EXISTS facebook_connected_at timestamptz;