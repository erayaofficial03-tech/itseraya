
CREATE TABLE public.homepage_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  visible_mobile BOOLEAN NOT NULL DEFAULT true,
  visible_desktop BOOLEAN NOT NULL DEFAULT true,
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read homepage sections"
  ON public.homepage_sections FOR SELECT USING (true);

CREATE POLICY "staff manage homepage sections"
  ON public.homepage_sections FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE TRIGGER homepage_sections_touch
  BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_homepage_sections_order ON public.homepage_sections(display_order);

-- Seed current homepage layout
INSERT INTO public.homepage_sections (type, display_order, props) VALUES
  ('hero_slider',     10, '{}'::jsonb),
  ('trust_strip',     20, '{}'::jsonb),
  ('category_row',    30, '{}'::jsonb),
  ('product_row',     40, '{"eyebrow":"Just in","title":"New Arrivals","source":"new","view_all":"/catalogue?filter=new"}'::jsonb),
  ('product_row',     50, '{"eyebrow":"Loved most","title":"Trending Now","source":"bestseller","view_all":"/catalogue?filter=bestseller"}'::jsonb),
  ('emotional_strip', 60, '{"text":"Jewellery that feels like you."}'::jsonb),
  ('product_row',     70, '{"eyebrow":"Sweet steals","title":"On Sale","source":"sale","view_all":"/catalogue?filter=sale"}'::jsonb),
  ('product_row',     80, '{"eyebrow":"Editor''s pick","title":"Hot Selling","source":"featured","view_all":"/catalogue?filter=featured"}'::jsonb),
  ('eraya_girls',     90, '{}'::jsonb),
  ('reviews',        100, '{}'::jsonb);
