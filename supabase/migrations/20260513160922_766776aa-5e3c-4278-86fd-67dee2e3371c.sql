ALTER TABLE public.settings
  DROP COLUMN IF EXISTS announcement_visible,
  DROP COLUMN IF EXISTS announcement_text,
  DROP COLUMN IF EXISTS announcement_bg_color,
  DROP COLUMN IF EXISTS announcement_text_color,
  DROP COLUMN IF EXISTS announcement_dismissible,
  DROP COLUMN IF EXISTS instagram_username,
  DROP COLUMN IF EXISTS instagram_connected_at,
  DROP COLUMN IF EXISTS facebook_page_name,
  DROP COLUMN IF EXISTS facebook_connected_at;