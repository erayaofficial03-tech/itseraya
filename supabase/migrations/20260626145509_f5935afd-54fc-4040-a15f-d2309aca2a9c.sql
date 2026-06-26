ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS care_guide_title text DEFAULT 'Jewellery Care Guide',
  ADD COLUMN IF NOT EXISTS care_guide_body  text DEFAULT 'Daily Wear
Put your jewellery on last — after perfume, lotion and hairspray have dried. Take it off before sleeping, swimming, exercising or showering.

Cleaning Gold & Diamond
Soak in warm water with a few drops of mild dish soap for 10 minutes, gently brush with a soft toothbrush, rinse and pat dry with a lint-free cloth.

Cleaning Silver
Polish with a dedicated silver cloth. For deeper tarnish, a non-abrasive silver dip or a paste of baking soda and water works well. Always rinse and dry thoroughly.

Storage
Store each piece separately in its original pouch or a soft-lined box to prevent scratches and tangles. Keep silver in airtight bags to slow tarnishing.

What to Avoid
Chlorine, saltwater, perfume, sanitiser, lotions and household cleaners can dull plating and damage stones. Remove jewellery before contact.

Professional Care
We offer complimentary lifetime polishing and inspection at our store. Bring your pieces in once a year to keep prongs tight and shine intact.';

GRANT SELECT (care_guide_title, care_guide_body) ON public.settings TO anon, authenticated;

CREATE OR REPLACE VIEW public.public_settings
WITH (security_invoker = true)
AS
SELECT
    id, store_name, tagline, logo_url, favicon_url, app_icon_url,
    color_primary, color_background, color_text, color_accent,
    font_heading, font_body, font_heading_url, font_body_url,
    font_size_base, radius_base, section_spacing,
    card_border_radius, card_shadow, btn_border_radius,
    product_grid_cols_mobile, product_grid_cols_desktop,
    nav_show_search, nav_home_label, nav_catalogue_label, footer_show_logo,
    whatsapp_number, whatsapp_float_visible, whatsapp_message_template, catalogue_whatsapp_message_template,
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
    trust_4_label, trust_4_icon,
    care_guide_title, care_guide_body
FROM public.settings
WHERE id = 1;

GRANT SELECT ON public.public_settings TO anon, authenticated;
