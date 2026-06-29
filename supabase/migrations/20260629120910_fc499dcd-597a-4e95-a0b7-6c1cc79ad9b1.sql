
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_sessions_user_id ON public.enquiry_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_sessions_created_at ON public.enquiry_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_visible_created ON public.products(is_visible, created_at DESC);

REVOKE EXECUTE ON FUNCTION public.set_product_sku() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.next_product_sku(timestamptz) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Anyone can insert view" ON public.product_views;
