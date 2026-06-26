
-- Trust strip columns
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS trust_1_label text DEFAULT 'Waterproof',
  ADD COLUMN IF NOT EXISTS trust_1_icon  text DEFAULT 'Droplets',
  ADD COLUMN IF NOT EXISTS trust_2_label text DEFAULT 'Tarnish Resistant',
  ADD COLUMN IF NOT EXISTS trust_2_icon  text DEFAULT 'Sparkles',
  ADD COLUMN IF NOT EXISTS trust_3_label text DEFAULT 'Hypoallergenic',
  ADD COLUMN IF NOT EXISTS trust_3_icon  text DEFAULT 'Leaf',
  ADD COLUMN IF NOT EXISTS trust_4_label text DEFAULT 'PAN India Shipping',
  ADD COLUMN IF NOT EXISTS trust_4_icon  text DEFAULT 'Truck';

-- Grant column-level SELECT on the new public-safe trust columns
GRANT SELECT (
  trust_1_label, trust_1_icon,
  trust_2_label, trust_2_icon,
  trust_3_label, trust_3_icon,
  trust_4_label, trust_4_icon
) ON public.settings TO anon, authenticated;

-- Recreate the public_settings view to include trust strip columns
CREATE OR REPLACE VIEW public.public_settings
WITH (security_invoker = true) AS
SELECT id, store_name, tagline, logo_url, favicon_url, app_icon_url,
  color_primary, color_background, color_text, color_accent,
  font_heading, font_body, font_heading_url, font_body_url,
  font_size_base, radius_base, section_spacing,
  card_border_radius, card_shadow, btn_border_radius,
  product_grid_cols_mobile, product_grid_cols_desktop,
  nav_show_search, nav_home_label, nav_catalogue_label,
  footer_show_logo, whatsapp_number, whatsapp_float_visible,
  whatsapp_message_template, catalogue_whatsapp_message_template,
  enquiry_mode, enquiry_requires_login,
  seo_title, seo_description, seo_og_image_url, seo_keywords, seo_brand_keywords, seo_auto_generate,
  shipping_free_above, shipping_charge, checkout_enabled, order_confirmation_message,
  install_prompt_visible, install_prompt_text, install_prompt_button_label,
  about_title, about_body, about_image_url,
  policy_return_title, policy_return_body,
  policy_shipping_title, policy_shipping_body,
  policy_cancellation_title, policy_cancellation_body,
  policy_privacy_title, policy_privacy_body,
  policy_terms_title, policy_terms_body,
  usp_1, usp_2, usp_3, usp_interval_ms,
  pdf_store_name, pdf_tagline,
  google_reviews_visible, google_place_id,
  trust_1_label, trust_1_icon,
  trust_2_label, trust_2_icon,
  trust_3_label, trust_3_icon,
  trust_4_label, trust_4_icon
FROM public.settings
WHERE id = 1;

GRANT SELECT ON public.public_settings TO anon, authenticated;

-- FAQs table
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read visible faqs" ON public.faqs
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Staff read all faqs" ON public.faqs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Staff manage faqs" ON public.faqs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE TRIGGER faqs_touch_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.faqs (question, answer, display_order) VALUES
  ('How long does shipping take?', 'Most orders are dispatched within 2 business days and delivered within 4–7 business days across India.', 1),
  ('Do you offer returns or exchanges?', 'Yes — we accept returns within 7 days of delivery on unused items in their original packaging. Custom pieces are non-returnable.', 2),
  ('How do I find my ring size?', 'Visit our Care Guide for a quick at-home sizing method, or contact us on WhatsApp and we''ll send you a printable size chart.', 3),
  ('What metals and stones do you use?', 'We work with high-quality artificial materials including zinc alloy, copper, and resin stones. Details are listed on every product page.', 4),
  ('How do I care for my jewellery?', 'Avoid contact with perfume, water and lotions. Store each piece separately in a soft pouch. See our Care Guide for cleaning tips.', 5),
  ('Is there a warranty?', 'Every Eraya piece carries a 6-month warranty against manufacturing defects.', 6),
  ('Which payment methods are accepted?', 'We accept UPI payment (PhonePe, GPay, Paytm). Pay via QR code or UPI ID at checkout.', 7),
  ('Do you make custom or bridal pieces?', 'Absolutely. Reach out on WhatsApp with your inspiration — we typically deliver custom pieces in 3–5 weeks.', 8),
  ('Do you ship internationally?', 'Currently we ship across India. Contact us on WhatsApp for international orders.', 9);
