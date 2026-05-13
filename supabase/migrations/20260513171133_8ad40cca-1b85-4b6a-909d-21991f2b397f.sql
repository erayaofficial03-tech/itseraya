
-- ============================================
-- 1. Restrict enquiry_sessions SELECT to staff
-- ============================================
DROP POLICY IF EXISTS "public read enquiry sessions" ON public.enquiry_sessions;

CREATE POLICY "staff read enquiry sessions"
  ON public.enquiry_sessions
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
  );

-- ============================================
-- 2. Restrict enquiry_items SELECT to staff
-- ============================================
DROP POLICY IF EXISTS "public read enquiry items" ON public.enquiry_items;

CREATE POLICY "staff read enquiry items"
  ON public.enquiry_items
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
  );

-- ============================================
-- 3. Secure RPC for anonymous tracking by ref
-- ============================================
CREATE OR REPLACE FUNCTION public.lookup_enquiry_by_ref(_ref text)
RETURNS TABLE (
  id uuid,
  enquiry_ref text,
  status text,
  customer_name text,
  notes text,
  created_at timestamptz,
  items jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.enquiry_ref,
    s.status,
    s.customer_name,
    s.notes,
    s.created_at,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id', i.id,
        'product_name', i.product_name,
        'product_price', i.product_price,
        'product_image', i.product_image,
        'selected_size', i.selected_size,
        'selected_colour', i.selected_colour,
        'quantity', i.quantity
      ))
       FROM public.enquiry_items i
       WHERE i.session_id = s.id),
      '[]'::jsonb
    ) AS items
  FROM public.enquiry_sessions s
  WHERE s.enquiry_ref = upper(trim(_ref))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.lookup_enquiry_by_ref(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_enquiry_by_ref(text) TO anon, authenticated;

-- ============================================
-- 4. Remove public listing policies on storage
--    (public buckets serve files via CDN URL
--     without needing a SELECT policy)
-- ============================================
DROP POLICY IF EXISTS "public read product-images" ON storage.objects;
DROP POLICY IF EXISTS "public read category-images" ON storage.objects;
DROP POLICY IF EXISTS "public read branding" ON storage.objects;
DROP POLICY IF EXISTS "public read banners bucket" ON storage.objects;

-- ============================================
-- 5. Lock down SECURITY DEFINER helper/trigger
--    functions from direct API execution
-- ============================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_role_limits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_master_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_product_sku() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.next_product_sku(timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- has_role is intentionally callable (used by RLS); keep grants.

-- ============================================
-- 6. Performance indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_enquiry_sessions_created   ON public.enquiry_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiry_sessions_ref       ON public.enquiry_sessions(enquiry_ref);
CREATE INDEX IF NOT EXISTS idx_enquiries_created          ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_email            ON public.enquiries(customer_email);
CREATE INDEX IF NOT EXISTS idx_product_views_created      ON public.product_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_created    ON public.whatsapp_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_visible           ON public.products(is_visible) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_products_category          ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email             ON public.profiles(email);
