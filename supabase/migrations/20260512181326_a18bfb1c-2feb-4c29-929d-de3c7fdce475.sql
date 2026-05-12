-- Default to '' so client inserts don't have to provide sku; trigger replaces it.
ALTER TABLE public.products ALTER COLUMN sku SET DEFAULT '';

-- Switch helpers to SECURITY INVOKER (trigger runs as the inserter, who is admin per RLS)
CREATE OR REPLACE FUNCTION public.next_product_sku(_for TIMESTAMPTZ DEFAULT now())
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  yy TEXT;
  next_n INT;
BEGIN
  yy := to_char(_for AT TIME ZONE 'Asia/Kolkata', 'YY');
  LOCK TABLE public.products IN SHARE ROW EXCLUSIVE MODE;
  SELECT COALESCE(MAX( (regexp_replace(sku, '^ERY/' || yy || '/', ''))::int ), 0) + 1
    INTO next_n
  FROM public.products
  WHERE sku ~ ('^ERY/' || yy || '/[0-9]+$');
  RETURN 'ERY/' || yy || '/' || LPAD(next_n::text, 3, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.set_product_sku()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku := public.next_product_sku(COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END;
$$;

-- Revoke API access; trigger doesn't need granted EXECUTE
REVOKE ALL ON FUNCTION public.next_product_sku(TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_product_sku() FROM PUBLIC, anon, authenticated;