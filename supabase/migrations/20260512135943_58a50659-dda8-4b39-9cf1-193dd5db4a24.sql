
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for these buckets
CREATE POLICY "public read product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "public read category-images" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');
CREATE POLICY "public read branding" ON storage.objects FOR SELECT USING (bucket_id = 'branding');

-- Admins can write
CREATE POLICY "admins write product-images" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write category-images" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'category-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'category-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write branding" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));
