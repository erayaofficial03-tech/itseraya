
-- 1. Drop the broad public read policy that exposed every column
DROP POLICY IF EXISTS "public read settings" ON public.settings;

-- 2. Staff (admin + manager) full read
DROP POLICY IF EXISTS "Staff read settings" ON public.settings;
CREATE POLICY "Staff read settings"
  ON public.settings
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
  );

-- 3. Public can SELECT the row, but only safe columns via column grants below
DROP POLICY IF EXISTS "public read settings via view" ON public.settings;
CREATE POLICY "public read settings via view"
  ON public.settings
  FOR SELECT
  TO anon, authenticated
  USING (id = 1);

-- 4. Column-level grants: only safe columns are readable for anon/authenticated
REVOKE SELECT ON public.settings FROM anon;
REVOKE SELECT ON public.settings FROM authenticated;

GRANT SELECT (
  id,
  store_name, tagline, logo_url, favicon_url, app_icon_url,
  color_primary, color_background, color_text, color_accent,
  font_heading, font_body, font_heading_url, font_body_url,
  font_size_base, radius_base, section_spacing,
  card_border_radius, card_shadow, btn_border_radius,
  product_grid_cols_mobile, product_grid_cols_desktop,
  nav_show_search, nav_home_label, nav_catalogue_label,
  footer_show_logo, footer_tagline, footer_copyright,
  footer_show_social, footer_show_whatsapp, footer_whatsapp_label,
  footer_links_visible,
  whatsapp_number, whatsapp_float_visible, whatsapp_message_template,
  catalogue_whatsapp_message_template,
  enquiry_mode, enquiry_requires_login,
  seo_title, seo_description, seo_og_image_url,
  seo_keywords, seo_brand_keywords, seo_auto_generate,
  shipping_free_above, shipping_charge,
  checkout_enabled, order_confirmation_message,
  install_prompt_visible, install_prompt_text, install_prompt_button_label,
  about_title, about_body, about_image_url,
  policy_return_title, policy_return_body,
  policy_shipping_title, policy_shipping_body,
  policy_cancellation_title, policy_cancellation_body,
  policy_privacy_title, policy_privacy_body,
  policy_terms_title, policy_terms_body,
  usp_1, usp_2, usp_3, usp_interval_ms,
  google_reviews_visible, google_place_id,
  hero_image_url, hero_headline, hero_subtext,
  hero_cta_label, hero_cta_url, hero_overlay_opacity,
  section_categories_title, section_categories_visible,
  section_new_arrivals_title, section_new_arrivals_visible,
  section_trending_title, section_trending_visible,
  section_sale_title, section_sale_visible,
  section_featured_title, section_featured_visible,
  catalogue_heading, catalogue_subtext, catalogue_download_label,
  category_empty_message, category_pieces_label,
  product_enquiry_button_label, product_share_button_label,
  product_pdf_button_label, product_description_label,
  product_related_title, product_tag_visible,
  pdf_store_name, pdf_tagline, pdf_footer_text, pdf_primary_color,
  store_address, store_email, store_phone, store_city,
  pwa_name, pwa_short_name, pwa_description,
  pwa_theme_color, pwa_background_color
) ON public.settings TO anon, authenticated;

GRANT ALL ON public.settings TO service_role;

-- 5. Create the public-safe view (matches granted columns)
CREATE OR REPLACE VIEW public.public_settings
WITH (security_invoker = true)
AS
SELECT
  id,
  store_name, tagline, logo_url, favicon_url, app_icon_url,
  color_primary, color_background, color_text, color_accent,
  font_heading, font_body, font_heading_url, font_body_url,
  font_size_base, radius_base, section_spacing,
  card_border_radius, card_shadow, btn_border_radius,
  product_grid_cols_mobile, product_grid_cols_desktop,
  nav_show_search, nav_home_label, nav_catalogue_label,
  footer_show_logo,
  whatsapp_number, whatsapp_float_visible, whatsapp_message_template,
  catalogue_whatsapp_message_template,
  enquiry_mode, enquiry_requires_login,
  seo_title, seo_description, seo_og_image_url,
  seo_keywords, seo_brand_keywords, seo_auto_generate,
  shipping_free_above, shipping_charge,
  checkout_enabled, order_confirmation_message,
  install_prompt_visible, install_prompt_text, install_prompt_button_label,
  about_title, about_body, about_image_url,
  policy_return_title, policy_return_body,
  policy_shipping_title, policy_shipping_body,
  policy_cancellation_title, policy_cancellation_body,
  policy_privacy_title, policy_privacy_body,
  policy_terms_title, policy_terms_body,
  usp_1, usp_2, usp_3, usp_interval_ms,
  pdf_store_name, pdf_tagline,
  google_reviews_visible, google_place_id
FROM public.settings
WHERE id = 1;

GRANT SELECT ON public.public_settings TO anon, authenticated;
