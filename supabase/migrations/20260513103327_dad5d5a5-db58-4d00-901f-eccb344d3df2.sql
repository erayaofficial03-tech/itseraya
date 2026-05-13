ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS policy_return_title text DEFAULT 'Return Policy',
  ADD COLUMN IF NOT EXISTS policy_return_body text DEFAULT 'We accept returns within 7 days of delivery. Items must be unused and in original packaging. Contact us on WhatsApp to initiate a return.',
  ADD COLUMN IF NOT EXISTS policy_shipping_title text DEFAULT 'Shipping Policy',
  ADD COLUMN IF NOT EXISTS policy_shipping_body text DEFAULT 'We ship across India within 5-7 business days. Free shipping on orders above ₹999. Express delivery available on request.',
  ADD COLUMN IF NOT EXISTS policy_cancellation_title text DEFAULT 'Cancellation Policy',
  ADD COLUMN IF NOT EXISTS policy_cancellation_body text DEFAULT 'Orders can be cancelled within 24 hours of placing the enquiry. Contact us immediately on WhatsApp to cancel.',
  ADD COLUMN IF NOT EXISTS policy_font_size text DEFAULT '16',
  ADD COLUMN IF NOT EXISTS policy_font_family text DEFAULT 'Inter',
  ADD COLUMN IF NOT EXISTS policy_text_color text DEFAULT '#2C2C2C',
  ADD COLUMN IF NOT EXISTS policy_heading_color text DEFAULT '#C9A84C',
  ADD COLUMN IF NOT EXISTS policy_bg_color text DEFAULT '#FAF8F5';