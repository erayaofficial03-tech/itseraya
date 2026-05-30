-- Unify shipping settings: copy any old values into canonical columns, then drop duplicates
UPDATE public.settings
SET
  shipping_free_above = COALESCE(shipping_free_above, shipping_free_min_order, 999),
  shipping_charge     = COALESCE(shipping_charge,     shipping_flat_cost,      99)
WHERE id = 1;

ALTER TABLE public.settings DROP COLUMN IF EXISTS shipping_free_min_order;
ALTER TABLE public.settings DROP COLUMN IF EXISTS shipping_flat_cost;

ALTER TABLE public.settings ALTER COLUMN shipping_free_above SET DEFAULT 999;
ALTER TABLE public.settings ALTER COLUMN shipping_charge     SET DEFAULT 99;