
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  product_name text,
  reviewer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_city text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  is_approved boolean NOT NULL DEFAULT false,
  is_hidden boolean NOT NULL DEFAULT false,
  hidden_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  hidden_at timestamptz,
  hide_reason text,
  is_featured boolean NOT NULL DEFAULT false,
  is_fake boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_approved_visible ON public.reviews(is_approved, is_hidden) WHERE is_approved = true AND is_hidden = false;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read approved visible reviews"
  ON public.reviews FOR SELECT
  USING (
    (is_approved = true AND is_hidden = false)
    OR reviewer_user_id = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "anyone can submit review"
  ON public.reviews FOR INSERT
  WITH CHECK (
    -- Guests can submit (reviewer_user_id null) or signed-in users submit as themselves
    (reviewer_user_id IS NULL AND auth.uid() IS NULL)
    OR reviewer_user_id = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "staff update reviews"
  ON public.reviews FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "staff delete reviews"
  ON public.reviews FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE TRIGGER reviews_touch_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
