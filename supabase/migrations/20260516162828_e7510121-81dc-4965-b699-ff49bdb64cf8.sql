-- 1. Revoke EXECUTE from trigger-only functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_master_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_role_limits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_product_sku() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_product_slug() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- 2. Document intentional public-insert policies
COMMENT ON POLICY "anyone can log enquiry" ON public.enquiries IS
  'Intentional: anonymous visitors must be able to submit enquiries without login.';
COMMENT ON POLICY "public insert enquiry sessions" ON public.enquiry_sessions IS
  'Intentional: anonymous enquiry cart creation required for guest users.';
COMMENT ON POLICY "public insert enquiry items" ON public.enquiry_items IS
  'Intentional: anonymous enquiry cart items required for guest users.';
COMMENT ON POLICY "public insert banner clicks" ON public.banner_clicks IS
  'Intentional: anonymous banner click analytics tracking.';
COMMENT ON POLICY "public insert banner impressions" ON public.banner_impressions IS
  'Intentional: anonymous banner impression analytics tracking.';
COMMENT ON POLICY "public insert product views" ON public.product_views IS
  'Intentional: anonymous product view tracking for analytics.';
COMMENT ON POLICY "public insert whatsapp clicks" ON public.whatsapp_clicks IS
  'Intentional: anonymous WhatsApp click tracking for conversion analytics.';
COMMENT ON POLICY "public insert install events" ON public.install_events IS
  'Intentional: anonymous PWA install event tracking for analytics.';