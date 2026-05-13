
-- Enquiry sessions
CREATE TABLE IF NOT EXISTS public.enquiry_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  customer_email text,
  customer_name text,
  customer_phone text,
  status text NOT NULL DEFAULT 'open',
  enquiry_ref text UNIQUE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enquiry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.enquiry_sessions(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_price numeric,
  product_image text,
  selected_size text,
  selected_colour text,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.enquiry_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read enquiry sessions" ON public.enquiry_sessions FOR SELECT USING (true);
CREATE POLICY "public insert enquiry sessions" ON public.enquiry_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "staff manage enquiry sessions" ON public.enquiry_sessions FOR UPDATE USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));
CREATE POLICY "staff delete enquiry sessions" ON public.enquiry_sessions FOR DELETE USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));

CREATE POLICY "public read enquiry items" ON public.enquiry_items FOR SELECT USING (true);
CREATE POLICY "public insert enquiry items" ON public.enquiry_items FOR INSERT WITH CHECK (true);
CREATE POLICY "staff manage enquiry items" ON public.enquiry_items FOR UPDATE USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));
CREATE POLICY "staff delete enquiry items" ON public.enquiry_items FOR DELETE USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));

CREATE INDEX IF NOT EXISTS idx_enquiry_sessions_ref ON public.enquiry_sessions(enquiry_ref);
CREATE INDEX IF NOT EXISTS idx_enquiry_items_session ON public.enquiry_items(session_id);

-- Extend enquiries
ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS enquiry_ref text,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS followed_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS follow_up_at timestamptz;

-- Allow staff to update enquiries
DROP POLICY IF EXISTS "staff update enquiries" ON public.enquiries;
CREATE POLICY "staff update enquiries" ON public.enquiries
  FOR UPDATE USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'));

-- Settings: enquiry_mode
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enquiry_mode text NOT NULL DEFAULT 'cart';

-- Products: variants
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS colours text[] NOT NULL DEFAULT '{}';

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  message text NOT NULL,
  cta_text text,
  cta_url text,
  bg_color text DEFAULT '#1C1C1C',
  text_color text DEFAULT '#C9A84C',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_marquee boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "admins manage announcements" ON public.announcements FOR ALL
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE INDEX IF NOT EXISTS idx_announcements_active_order ON public.announcements(is_active, display_order);

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_enquiry_sessions_updated ON public.enquiry_sessions;
CREATE TRIGGER trg_enquiry_sessions_updated BEFORE UPDATE ON public.enquiry_sessions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_announcements_updated ON public.announcements;
CREATE TRIGGER trg_announcements_updated BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
