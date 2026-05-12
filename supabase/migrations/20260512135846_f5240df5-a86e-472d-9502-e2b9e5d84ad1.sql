
-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-grant admin to admin@itseraya.in
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email = 'admin@itseraya.in' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read visible categories" ON public.categories FOR SELECT USING (is_visible OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT,
  original_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  discounted_price NUMERIC(10,2),
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read visible products" ON public.products FOR SELECT USING (is_visible OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- product_images
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "admins manage product images" ON public.product_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- settings (singleton)
CREATE TABLE public.settings (
  id INT PRIMARY KEY DEFAULT 1,
  store_name TEXT NOT NULL DEFAULT 'Eraya',
  tagline TEXT NOT NULL DEFAULT 'Adorn Your Story',
  logo_url TEXT,
  whatsapp_number TEXT,
  hero_image_url TEXT,
  hero_headline TEXT DEFAULT 'Adorn Your Story',
  hero_subtext TEXT DEFAULT 'Discover handcrafted artificial jewellery designed to celebrate every woman.',
  hero_cta_label TEXT DEFAULT 'Shop the Collection',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "admins manage settings" ON public.settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.settings (id) VALUES (1);

-- social_links
CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read visible social" ON public.social_links FOR SELECT USING (is_visible OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage social" ON public.social_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed categories
INSERT INTO public.categories (name, slug, image_url, display_order) VALUES
  ('Rings', 'rings', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80', 1),
  ('Earrings', 'earrings', 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&q=80', 2),
  ('Necklaces', 'necklaces', 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80', 3),
  ('Bangles', 'bangles', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', 4),
  ('Pendants', 'pendants', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80', 5),
  ('Bracelets', 'bracelets', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80', 6);

-- Seed products
WITH cats AS (SELECT id, slug FROM public.categories)
INSERT INTO public.products (name, category_id, description, original_price, discounted_price, tags, is_featured)
SELECT * FROM (VALUES
  ('Royal Blush Ring', (SELECT id FROM cats WHERE slug='rings'), 'Elegant gold-plated ring with blush stone accent.', 1499::numeric, 999::numeric, ARRAY['new','bestseller'], true),
  ('Heritage Gold Ring', (SELECT id FROM cats WHERE slug='rings'), 'Classic gold-tone band inspired by heritage motifs.', 1299::numeric, NULL::numeric, ARRAY['new'], false),
  ('Pearl Drop Earrings', (SELECT id FROM cats WHERE slug='earrings'), 'Delicate pearl drops perfect for any occasion.', 999::numeric, 749::numeric, ARRAY['bestseller','sale'], true),
  ('Chandelier Earrings', (SELECT id FROM cats WHERE slug='earrings'), 'Statement chandelier earrings in antique gold finish.', 1799::numeric, NULL::numeric, ARRAY['new'], false),
  ('Pink Lotus Necklace', (SELECT id FROM cats WHERE slug='necklaces'), 'Lotus pendant necklace with blush enamel detail.', 2299::numeric, 1899::numeric, ARRAY['bestseller','sale'], true),
  ('Layered Gold Necklace', (SELECT id FROM cats WHERE slug='necklaces'), 'Three-layer gold-tone necklace for a modern look.', 1999::numeric, NULL::numeric, ARRAY['new'], false),
  ('Ivory Stone Bangle', (SELECT id FROM cats WHERE slug='bangles'), 'Ivory-stone studded bangle with gold rim.', 1599::numeric, 1199::numeric, ARRAY['sale'], false),
  ('Traditional Kada', (SELECT id FROM cats WHERE slug='bangles'), 'Hand-finished traditional kada bangle.', 1899::numeric, NULL::numeric, ARRAY['bestseller'], true),
  ('Heart Charm Pendant', (SELECT id FROM cats WHERE slug='pendants'), 'Sweet heart charm pendant with delicate chain.', 899::numeric, 699::numeric, ARRAY['new','sale'], false),
  ('Evil Eye Pendant', (SELECT id FROM cats WHERE slug='pendants'), 'Protective evil eye pendant in blush and gold.', 1099::numeric, NULL::numeric, ARRAY['bestseller'], true),
  ('Charm Bracelet', (SELECT id FROM cats WHERE slug='bracelets'), 'Adjustable charm bracelet with floral motifs.', 1399::numeric, 1099::numeric, ARRAY['new','sale'], false),
  ('Tennis Bracelet', (SELECT id FROM cats WHERE slug='bracelets'), 'Sparkling tennis bracelet with crystal stones.', 1799::numeric, NULL::numeric, ARRAY['bestseller'], true)
) AS t(name, category_id, description, original_price, discounted_price, tags, is_featured);

-- Seed product images (1 per product using Unsplash)
INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id,
  CASE c.slug
    WHEN 'rings' THEN 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80'
    WHEN 'earrings' THEN 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=1200&q=80'
    WHEN 'necklaces' THEN 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1200&q=80'
    WHEN 'bangles' THEN 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80'
    WHEN 'pendants' THEN 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1200&q=80'
    WHEN 'bracelets' THEN 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1200&q=80'
  END, 0
FROM public.products p JOIN public.categories c ON c.id = p.category_id;

-- Update settings with hero
UPDATE public.settings SET
  hero_image_url = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80'
WHERE id = 1;
