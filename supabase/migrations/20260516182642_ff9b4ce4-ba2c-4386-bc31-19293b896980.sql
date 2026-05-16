
-- Theme presets: curated + custom theme combinations
CREATE TABLE public.theme_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tokens JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_builtin BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.theme_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read theme presets"
  ON public.theme_presets FOR SELECT USING (true);

CREATE POLICY "admins manage theme presets"
  ON public.theme_presets FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER theme_presets_touch
  BEFORE UPDATE ON public.theme_presets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Extend settings with global typography + sizing controls + active theme
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS active_theme_id UUID REFERENCES public.theme_presets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS font_heading TEXT DEFAULT 'Cormorant Garamond',
  ADD COLUMN IF NOT EXISTS font_body TEXT DEFAULT 'Inter',
  ADD COLUMN IF NOT EXISTS font_heading_url TEXT,
  ADD COLUMN IF NOT EXISTS font_body_url TEXT,
  ADD COLUMN IF NOT EXISTS radius_base NUMERIC DEFAULT 0.875,
  ADD COLUMN IF NOT EXISTS container_max INT DEFAULT 1280,
  ADD COLUMN IF NOT EXISTS section_spacing INT DEFAULT 80,
  ADD COLUMN IF NOT EXISTS font_size_base INT DEFAULT 16;

-- Seed curated theme presets
INSERT INTO public.theme_presets (name, description, is_builtin, display_order, tokens) VALUES
('Ivory & Champagne', 'Current Eraya — warm ivory background with champagne gold and warm charcoal ink', true, 0,
  '{"background":"#FAF7F2","foreground":"#2C2C2C","primary":"#C9A84C","accent":"#F2C4CE","ink":"#2C2C2C","ivory":"#FAF7F2","champagne":"#C9A84C","destructive":"#D63B3B"}'::jsonb),
('Noir & Gold', 'Black backdrop with luxurious gold — high-contrast editorial', true, 1,
  '{"background":"#0D0D0D","foreground":"#F5F0E0","primary":"#C9A84C","accent":"#F0D78C","ink":"#F5F0E0","ivory":"#1A1A1A","champagne":"#C9A84C","destructive":"#FF6B6B"}'::jsonb),
('Blush & Sage', 'Soft blush with calm sage green — feminine and modern', true, 2,
  '{"background":"#FBF4F1","foreground":"#3D3A36","primary":"#A8B89C","accent":"#E8C5D0","ink":"#3D3A36","ivory":"#FBF4F1","champagne":"#A8B89C","destructive":"#C44569"}'::jsonb),
('Midnight Indigo', 'Deep navy with electric indigo — sophisticated tech vibe', true, 3,
  '{"background":"#0A0A1A","foreground":"#E8ECF8","primary":"#818CF8","accent":"#A78BFA","ink":"#E8ECF8","ivory":"#141432","champagne":"#818CF8","destructive":"#F87171"}'::jsonb),
('Cloud White', 'Crisp whites with cool blue — airy SaaS aesthetic', true, 4,
  '{"background":"#FAFBFC","foreground":"#1E293B","primary":"#3B82F6","accent":"#94A3B8","ink":"#1E293B","ivory":"#E8ECF1","champagne":"#3B82F6","destructive":"#EF4444"}'::jsonb),
('Terracotta & Sage', 'Earthy terracotta with sage — natural and grounded', true, 5,
  '{"background":"#FAF5F0","foreground":"#3D2E26","primary":"#C4654A","accent":"#87A878","ink":"#3D2E26","ivory":"#F5EBE0","champagne":"#C4654A","destructive":"#A03A2A"}'::jsonb);
