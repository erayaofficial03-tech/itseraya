-- 1. product_views: add user_id + session_id
ALTER TABLE public.product_views
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS session_id text;

CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON public.product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON public.product_views(product_id);

-- 2. enquiry_sessions: add user_id
ALTER TABLE public.enquiry_sessions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_enquiry_sessions_user_id ON public.enquiry_sessions(user_id);

-- 3. wishlist_items: add note
ALTER TABLE public.wishlist_items
  ADD COLUMN IF NOT EXISTS note text;

-- 5. RLS for product_views
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert view" ON public.product_views;
CREATE POLICY "Anyone can insert view" ON public.product_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin reads views" ON public.product_views;
CREATE POLICY "Admin reads views" ON public.product_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','manager'))
  );

GRANT INSERT ON public.product_views TO anon, authenticated;
GRANT SELECT ON public.product_views TO authenticated;
GRANT ALL ON public.product_views TO service_role;
