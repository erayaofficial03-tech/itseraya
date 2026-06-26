
CREATE OR REPLACE FUNCTION public.get_public_tracking_ids()
RETURNS TABLE (
  google_analytics_id text,
  google_tag_manager_id text,
  google_site_verification text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    google_analytics_id,
    google_tag_manager_id,
    google_site_verification
  FROM public.settings
  WHERE id = 1
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_tracking_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_tracking_ids() TO anon, authenticated;
