ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS about_title text DEFAULT 'Our Story',
  ADD COLUMN IF NOT EXISTS about_body text DEFAULT 'Eraya was born from a love of beautiful, wearable jewellery crafted for every woman.',
  ADD COLUMN IF NOT EXISTS about_image_url text;