CREATE TABLE IF NOT EXISTS public.banner_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id uuid,
  page_path text,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS banner_impressions_banner_idx ON public.banner_impressions (banner_id, viewed_at);
CREATE INDEX IF NOT EXISTS banner_clicks_banner_idx ON public.banner_clicks (banner_id, clicked_at);

ALTER TABLE public.banner_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public insert banner impressions"
  ON public.banner_impressions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "staff read banner impressions"
  ON public.banner_impressions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));