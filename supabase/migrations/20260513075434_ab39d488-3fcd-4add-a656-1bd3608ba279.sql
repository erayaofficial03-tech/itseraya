
-- Banners
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  cta_text text,
  cta_url text DEFAULT '/catalogue',
  image_url text,
  image_mobile_url text,
  overlay_opacity integer DEFAULT 40,
  text_color text DEFAULT '#FFFFFF',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "staff manage banners" ON public.banners FOR ALL
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));

-- Banner clicks
CREATE TABLE IF NOT EXISTS public.banner_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id uuid REFERENCES public.banners(id) ON DELETE CASCADE,
  clicked_at timestamptz DEFAULT now(),
  page_path text
);
ALTER TABLE public.banner_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert banner clicks" ON public.banner_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "staff read banner clicks" ON public.banner_clicks FOR SELECT
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));

-- WhatsApp clicks
CREATE TABLE IF NOT EXISTS public.whatsapp_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  clicked_at timestamptz DEFAULT now()
);
ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert whatsapp clicks" ON public.whatsapp_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "staff read whatsapp clicks" ON public.whatsapp_clicks FOR SELECT
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));

-- Product views
CREATE TABLE IF NOT EXISTS public.product_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now()
);
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert product views" ON public.product_views FOR INSERT WITH CHECK (true);
CREATE POLICY "staff read product views" ON public.product_views FOR SELECT
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));

-- Banners storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read banners bucket" ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');
CREATE POLICY "staff write banners bucket" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'banners' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager')));
CREATE POLICY "staff update banners bucket" ON storage.objects FOR UPDATE
  USING (bucket_id = 'banners' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager')));
CREATE POLICY "staff delete banners bucket" ON storage.objects FOR DELETE
  USING (bucket_id = 'banners' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager')));
