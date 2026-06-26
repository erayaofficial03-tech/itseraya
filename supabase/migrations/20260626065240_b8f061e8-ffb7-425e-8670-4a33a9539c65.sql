
-- 1. Drop broad authenticated read on payment_settings if it still exists
DROP POLICY IF EXISTS "authenticated read payment settings" ON public.payment_settings;

-- 2. Recreate public_settings view as security_invoker so it doesn't bypass RLS
DROP VIEW IF EXISTS public.public_settings;
CREATE VIEW public.public_settings
WITH (security_invoker = true) AS
SELECT id, store_name, tagline, logo_url, favicon_url, app_icon_url,
  color_primary, color_background, color_text, color_accent,
  font_heading, font_body, font_heading_url, font_body_url, font_size_base,
  radius_base, section_spacing, card_border_radius, card_shadow, btn_border_radius,
  product_grid_cols_mobile, product_grid_cols_desktop,
  nav_show_search, nav_home_label, nav_catalogue_label, footer_show_logo,
  whatsapp_number, whatsapp_float_visible, whatsapp_message_template,
  catalogue_whatsapp_message_template, enquiry_mode, enquiry_requires_login,
  seo_title, seo_description, seo_og_image_url, seo_keywords, seo_brand_keywords, seo_auto_generate,
  shipping_free_above, shipping_charge, checkout_enabled, order_confirmation_message,
  install_prompt_visible, install_prompt_text, install_prompt_button_label,
  about_title, about_body, about_image_url,
  policy_return_title, policy_return_body, policy_shipping_title, policy_shipping_body,
  policy_cancellation_title, policy_cancellation_body, policy_privacy_title, policy_privacy_body,
  policy_terms_title, policy_terms_body,
  usp_1, usp_2, usp_3, usp_interval_ms,
  pdf_store_name, pdf_tagline,
  google_reviews_visible, google_place_id
FROM public.settings
WHERE id = 1;

GRANT SELECT ON public.public_settings TO anon, authenticated;

-- 3. Add SELECT policy on settings allowing public reads (column-level GRANTs restrict columns)
CREATE POLICY "Public read safe settings columns"
ON public.settings
FOR SELECT
TO anon, authenticated
USING (id = 1);

-- 4. Revoke broad table-level SELECT, then grant only the safe columns
REVOKE SELECT ON public.settings FROM anon, authenticated;

GRANT SELECT (
  id, store_name, tagline, logo_url, favicon_url, app_icon_url,
  color_primary, color_background, color_text, color_accent,
  font_heading, font_body, font_heading_url, font_body_url, font_size_base,
  radius_base, section_spacing, card_border_radius, card_shadow, btn_border_radius,
  product_grid_cols_mobile, product_grid_cols_desktop,
  nav_show_search, nav_home_label, nav_catalogue_label, footer_show_logo,
  whatsapp_number, whatsapp_float_visible, whatsapp_message_template,
  catalogue_whatsapp_message_template, enquiry_mode, enquiry_requires_login,
  seo_title, seo_description, seo_og_image_url, seo_keywords, seo_brand_keywords, seo_auto_generate,
  shipping_free_above, shipping_charge, checkout_enabled, order_confirmation_message,
  install_prompt_visible, install_prompt_text, install_prompt_button_label,
  about_title, about_body, about_image_url,
  policy_return_title, policy_return_body, policy_shipping_title, policy_shipping_body,
  policy_cancellation_title, policy_cancellation_body, policy_privacy_title, policy_privacy_body,
  policy_terms_title, policy_terms_body,
  usp_1, usp_2, usp_3, usp_interval_ms,
  pdf_store_name, pdf_tagline,
  google_reviews_visible, google_place_id
) ON public.settings TO anon, authenticated;

-- Staff retain full access via existing "Staff read full settings" / "admins manage settings" policies.
GRANT SELECT ON public.settings TO service_role;
