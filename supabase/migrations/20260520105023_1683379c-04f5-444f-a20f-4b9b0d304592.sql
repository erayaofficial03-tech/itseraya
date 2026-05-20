-- Harden and normalize SKU generation privileges for product saves.
-- The generator remains protected from public/anonymous access while authenticated staff flows can execute it.

CREATE OR REPLACE FUNCTION public.next_product_sku(_for timestamp with time zone DEFAULT now())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  yy text;
  next_n int;
BEGIN
  yy := to_char(_for AT TIME ZONE 'Asia/Kolkata', 'YY');

  LOCK TABLE public.products IN SHARE ROW EXCLUSIVE MODE;

  SELECT COALESCE(MAX((regexp_replace(sku, '^ERY/' || yy || '/', ''))::int), 0) + 1
    INTO next_n
  FROM public.products
  WHERE sku ~ ('^ERY/' || yy || '/[0-9]+$');

  RETURN 'ERY/' || yy || '/' || LPAD(next_n::text, 3, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_product_sku()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku := public.next_product_sku(COALESCE(NEW.created_at, now()));
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.next_product_sku(timestamp with time zone) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_product_sku() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.next_product_sku(timestamp with time zone) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_product_sku() TO authenticated, service_role;

DROP TRIGGER IF EXISTS trg_set_product_sku ON public.products;
CREATE TRIGGER trg_set_product_sku
BEFORE INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_product_sku();