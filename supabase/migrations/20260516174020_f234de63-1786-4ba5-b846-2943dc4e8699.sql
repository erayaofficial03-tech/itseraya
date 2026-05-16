-- Catalog of product micro-labels that admins can manage
CREATE TABLE public.product_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'ink' CHECK (tone IN ('ink', 'champagne', 'blush')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER product_labels_touch_updated
BEFORE UPDATE ON public.product_labels
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.product_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active labels"
ON public.product_labels FOR SELECT
USING (is_active OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins manage labels"
ON public.product_labels FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed with the existing micro-labels so today's tags keep rendering
INSERT INTO public.product_labels (slug, name, tone, display_order, is_active) VALUES
  ('bestseller',     'Bestseller',          'champagne', 1, true),
  ('new',            'New',                 'ink',       2, true),
  ('waterproof',     'Waterproof',          'blush',     3, true),
  ('anti-tarnish',   'Anti-Tarnish',        'blush',     4, true),
  ('hypoallergenic', 'Hypoallergenic',      'blush',     5, true),
  ('everyday',       'Everyday Favorite',   'ink',       6, true)
ON CONFLICT (slug) DO NOTHING;