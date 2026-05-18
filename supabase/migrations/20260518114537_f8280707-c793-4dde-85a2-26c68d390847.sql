-- Pricing components (editable rows per section)
CREATE TABLE public.pricing_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL CHECK (section IN ('packing_bom','buffer_margin','shipping_charge')),
  label text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read pricing components"
  ON public.pricing_components FOR SELECT
  USING (true);

CREATE POLICY "staff manage pricing components"
  ON public.pricing_components FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE TRIGGER pricing_components_touch
  BEFORE UPDATE ON public.pricing_components
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed with reference rows
INSERT INTO public.pricing_components (section, label, amount, sort_order) VALUES
  ('packing_bom', 'Jewellery Card', 5, 1),
  ('packing_bom', 'Zip Pouch / Box', 10, 2),
  ('packing_bom', 'Thank You Card', 4, 3),
  ('buffer_margin', 'RTO / Return Risk %', 10, 1),
  ('buffer_margin', 'Gateway Fees %', 3, 2),
  ('buffer_margin', 'Marketing Cost %', 5, 3),
  ('shipping_charge', 'Courier Box', 20, 1),
  ('shipping_charge', 'Outer Courier Pack', 10, 2),
  ('shipping_charge', 'Average Shipping', 65, 3);

-- Add pricing settings columns to existing settings table
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS pricing_sell_multiplier numeric NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS pricing_mrp_multiplier numeric NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS shipping_free_min_order numeric NOT NULL DEFAULT 999,
  ADD COLUMN IF NOT EXISTS shipping_flat_cost numeric NOT NULL DEFAULT 95;