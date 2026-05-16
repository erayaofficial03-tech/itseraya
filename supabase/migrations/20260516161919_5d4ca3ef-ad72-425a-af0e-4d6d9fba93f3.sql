CREATE OR REPLACE FUNCTION public.next_product_sku(_for timestamp with time zone DEFAULT now())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
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

GRANT EXECUTE ON FUNCTION public.next_product_sku(timestamp with time zone) TO authenticated, anon, service_role;