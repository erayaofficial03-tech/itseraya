-- =====================================================
-- 1. Expand settings table
-- =====================================================
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS favicon_url text,

  -- COLORS (hex)
  ADD COLUMN IF NOT EXISTS color_primary text DEFAULT '#C9A84C',
  ADD COLUMN IF NOT EXISTS color_background text DEFAULT '#FAF7F2',
  ADD COLUMN IF NOT EXISTS color_text text DEFAULT '#2C2C2C',
  ADD COLUMN IF NOT EXISTS color_accent text DEFAULT '#F2C4CE',

  -- HERO
  ADD COLUMN IF NOT EXISTS hero_cta_url text DEFAULT '/catalogue',
  ADD COLUMN IF NOT EXISTS hero_overlay_opacity integer DEFAULT 40,

  -- HOMEPAGE SECTIONS
  ADD COLUMN IF NOT EXISTS section_categories_title text DEFAULT 'Shop by Category',
  ADD COLUMN IF NOT EXISTS section_categories_visible boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS section_new_arrivals_title text DEFAULT 'New Arrivals',
  ADD COLUMN IF NOT EXISTS section_new_arrivals_visible boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS section_trending_title text DEFAULT 'Trending Now',
  ADD COLUMN IF NOT EXISTS section_trending_visible boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS section_sale_title text DEFAULT 'On Sale',
  ADD COLUMN IF NOT EXISTS section_sale_visible boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS section_featured_title text DEFAULT 'Featured',
  ADD COLUMN IF NOT EXISTS section_featured_visible boolean DEFAULT true,

  -- NAVIGATION
  ADD COLUMN IF NOT EXISTS nav_home_label text DEFAULT 'Home',
  ADD COLUMN IF NOT EXISTS nav_catalogue_label text DEFAULT 'Catalogue',
  ADD COLUMN IF NOT EXISTS nav_show_search boolean DEFAULT true,

  -- PRODUCT PAGE
  ADD COLUMN IF NOT EXISTS product_enquiry_button_label text DEFAULT 'I Love It',
  ADD COLUMN IF NOT EXISTS product_share_button_label text DEFAULT 'Share',
  ADD COLUMN IF NOT EXISTS product_pdf_button_label text DEFAULT 'Save as PDF',
  ADD COLUMN IF NOT EXISTS product_description_label text DEFAULT 'About this piece',
  ADD COLUMN IF NOT EXISTS product_related_title text DEFAULT 'You may also like',
  ADD COLUMN IF NOT EXISTS product_tag_visible boolean DEFAULT true,

  -- CATALOGUE PAGE
  ADD COLUMN IF NOT EXISTS catalogue_heading text DEFAULT 'Our Catalogue',
  ADD COLUMN IF NOT EXISTS catalogue_subtext text DEFAULT 'Browse the full Eraya collection.',
  ADD COLUMN IF NOT EXISTS catalogue_download_label text DEFAULT 'Download Full Catalogue as PDF',

  -- CATEGORY PAGE
  ADD COLUMN IF NOT EXISTS category_empty_message text DEFAULT 'No products in this category yet.',
  ADD COLUMN IF NOT EXISTS category_pieces_label text DEFAULT 'pieces',

  -- ENQUIRY / WHATSAPP
  ADD COLUMN IF NOT EXISTS whatsapp_message_template text DEFAULT E'Hi Eraya! I love this product and would like to know more 😍\n\n*{product_name}*\nPrice: {price}\n\nProduct Link: {url}',
  ADD COLUMN IF NOT EXISTS enquiry_button_color text DEFAULT '#C9A84C',

  -- FOOTER
  ADD COLUMN IF NOT EXISTS footer_tagline text DEFAULT 'Adorn Your Story',
  ADD COLUMN IF NOT EXISTS footer_copyright text DEFAULT '© {year} Eraya. All rights reserved.',
  ADD COLUMN IF NOT EXISTS footer_show_logo boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS footer_show_social boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS footer_show_whatsapp boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS footer_whatsapp_label text DEFAULT 'Chat with us',
  ADD COLUMN IF NOT EXISTS footer_links_visible boolean DEFAULT true,

  -- ANNOUNCEMENT
  ADD COLUMN IF NOT EXISTS announcement_visible boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS announcement_text text DEFAULT '🎉 Free delivery on orders above ₹999!',
  ADD COLUMN IF NOT EXISTS announcement_bg_color text DEFAULT '#C9A84C',
  ADD COLUMN IF NOT EXISTS announcement_text_color text DEFAULT '#2C2C2C',
  ADD COLUMN IF NOT EXISTS announcement_dismissible boolean DEFAULT true,

  -- PDF
  ADD COLUMN IF NOT EXISTS pdf_store_name text DEFAULT 'Eraya',
  ADD COLUMN IF NOT EXISTS pdf_tagline text DEFAULT 'Adorn Your Story',
  ADD COLUMN IF NOT EXISTS pdf_footer_text text DEFAULT 'For enquiries, WhatsApp us at +{whatsapp}',
  ADD COLUMN IF NOT EXISTS pdf_primary_color text DEFAULT '#C9A84C',

  -- SEO
  ADD COLUMN IF NOT EXISTS seo_title text DEFAULT 'Eraya — Adorn Your Story | Artificial Jewellery for Women',
  ADD COLUMN IF NOT EXISTS seo_description text DEFAULT 'Eraya offers handcrafted artificial jewellery for women — rings, earrings, necklaces, bangles and more.',
  ADD COLUMN IF NOT EXISTS seo_og_image_url text,

  -- CONTACT
  ADD COLUMN IF NOT EXISTS store_address text,
  ADD COLUMN IF NOT EXISTS store_email text,
  ADD COLUMN IF NOT EXISTS store_phone text,
  ADD COLUMN IF NOT EXISTS store_city text DEFAULT 'India',

  -- PWA
  ADD COLUMN IF NOT EXISTS pwa_name text DEFAULT 'Eraya',
  ADD COLUMN IF NOT EXISTS pwa_short_name text DEFAULT 'Eraya',
  ADD COLUMN IF NOT EXISTS pwa_description text DEFAULT 'Adorn Your Story — Artificial Jewellery for Women',
  ADD COLUMN IF NOT EXISTS pwa_theme_color text DEFAULT '#C9A84C',
  ADD COLUMN IF NOT EXISTS pwa_background_color text DEFAULT '#FAF7F2',

  -- INSTALL PROMPT
  ADD COLUMN IF NOT EXISTS install_prompt_visible boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS install_prompt_text text DEFAULT 'Add Eraya to your home screen',
  ADD COLUMN IF NOT EXISTS install_prompt_button_label text DEFAULT 'Install App',

  -- ADMIN
  ADD COLUMN IF NOT EXISTS admin_panel_title text DEFAULT 'Eraya Admin',
  ADD COLUMN IF NOT EXISTS admin_welcome_message text DEFAULT 'Welcome back to Eraya admin.',
  ADD COLUMN IF NOT EXISTS admin_brand_color text DEFAULT '#C9A84C';

-- =====================================================
-- 2. Profiles: is_blocked
-- =====================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;

-- =====================================================
-- 3. Enquiries table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_price numeric,
  customer_email text,
  customer_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone can log enquiry" ON public.enquiries;
CREATE POLICY "anyone can log enquiry" ON public.enquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "staff read enquiries" ON public.enquiries;
CREATE POLICY "staff read enquiries" ON public.enquiries
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "staff delete enquiries" ON public.enquiries;
CREATE POLICY "staff delete enquiries" ON public.enquiries
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries (created_at DESC);