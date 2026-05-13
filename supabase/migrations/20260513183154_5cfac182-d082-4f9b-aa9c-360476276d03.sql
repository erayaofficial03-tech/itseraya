CREATE TABLE public.install_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  platform TEXT,
  page_path TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.install_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public insert install events"
  ON public.install_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "staff read install events"
  ON public.install_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE INDEX idx_install_events_occurred_at ON public.install_events (occurred_at DESC);
CREATE INDEX idx_install_events_event_type ON public.install_events (event_type);