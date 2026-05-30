ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS color_muted text DEFAULT '#9A8F85';