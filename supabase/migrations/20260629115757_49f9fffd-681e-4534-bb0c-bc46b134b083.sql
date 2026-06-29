
DROP POLICY IF EXISTS "staff read banners bucket" ON storage.objects;
CREATE POLICY "staff read banners bucket"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'banners'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
);

DROP POLICY IF EXISTS "public insert enquiry items" ON public.enquiry_items;
CREATE POLICY "public insert enquiry items"
ON public.enquiry_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.enquiry_sessions s
    WHERE s.id = enquiry_items.session_id
      AND s.created_at > now() - interval '2 hours'
      AND (
        (auth.uid() IS NOT NULL AND s.user_id = auth.uid())
        OR (auth.uid() IS NULL AND s.user_id IS NULL)
      )
  )
);
