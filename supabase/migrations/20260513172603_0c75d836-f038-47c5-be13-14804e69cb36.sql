-- Add slug column to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug text;

-- Generate slugs for existing products
UPDATE public.products
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(TRIM(name), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Disambiguate duplicate slugs by appending a short id fragment
UPDATE public.products p1
SET slug = p1.slug || '-' || SUBSTRING(p1.id::text, 1, 6)
WHERE EXISTS (
  SELECT 1 FROM public.products p2
  WHERE p2.slug = p1.slug AND p2.id <> p1.id
);

-- Backfill any missing category slugs
UPDATE public.categories
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(TRIM(name), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Unique indexes for fast slug lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Add unique constraint to products.slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_key'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE USING INDEX idx_products_slug;
  END IF;
END $$;

-- Trigger to auto-generate slug if not provided on insert
CREATE OR REPLACE FUNCTION public.set_product_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  base_slug text;
  candidate text;
  n int := 1;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(TRIM(COALESCE(NEW.name, '')), '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      )
    );
    IF base_slug = '' THEN
      base_slug := 'product';
    END IF;
    candidate := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = candidate AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      n := n + 1;
      candidate := base_slug || '-' || n;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_product_slug ON public.products;
CREATE TRIGGER trg_set_product_slug
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_product_slug();