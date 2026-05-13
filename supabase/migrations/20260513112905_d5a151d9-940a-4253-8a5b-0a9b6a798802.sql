ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS usp_1 text DEFAULT 'Handcrafted with love',
  ADD COLUMN IF NOT EXISTS usp_2 text DEFAULT 'Free shipping on orders over ₹999',
  ADD COLUMN IF NOT EXISTS usp_3 text DEFAULT 'Easy WhatsApp enquiries';