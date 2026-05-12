-- 1. Add column (nullable for backfill)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;

-- 2. Backfill existing rows: per-IST-year sequence in created_at order
WITH numbered AS (
  SELECT
    id,
    to_char(created_at AT TIME ZONE 'Asia/Kolkata', 'YY') AS yy,
    ROW_NUMBER() OVER (
      PARTITION BY EXTRACT(year FROM created_at AT TIME ZONE 'Asia/Kolkata')
      ORDER BY created_at, id
    ) AS rn
  FROM public.products
  WHERE sku IS NULL OR sku = ''
)
UPDATE public.products p
SET sku = 'ERY/' || n.yy || '/' || LPAD(n.rn::text, 3, '0')
FROM numbered n
WHERE p.id = n.id;

-- 3. Generator function (per-year, IST, with row-locking to avoid races)
CREATE OR REPLACE FUNCTION public.next_product_sku(_for TIMESTAMPTZ DEFAULT now())
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  yy TEXT;
  next_n INT;
BEGIN
  yy := to_char(_for AT TIME ZONE 'Asia/Kolkata', 'YY');

  -- Serialize concurrent inserts so two products can't grab the same number
  LOCK TABLE public.products IN SHARE ROW EXCLUSIVE MODE;

  SELECT COALESCE(MAX( (regexp_replace(sku, '^ERY/' || yy || '/', ''))::int ), 0) + 1
    INTO next_n
  FROM public.products
  WHERE sku ~ ('^ERY/' || yy || '/[0-9]+$');

  RETURN 'ERY/' || yy || '/' || LPAD(next_n::text, 3, '0');
END;
$$;

-- 4. BEFORE INSERT trigger to auto-fill missing SKU based on row's created_at
CREATE OR REPLACE FUNCTION public.set_product_sku()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku := public.next_product_sku(COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_product_sku ON public.products;
CREATE TRIGGER trg_set_product_sku
BEFORE INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_product_sku();

-- 5. Lock down: required + unique
ALTER TABLE public.products ALTER COLUMN sku SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_key ON public.products(sku);