ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS policy_privacy_title text DEFAULT 'Privacy Policy',
  ADD COLUMN IF NOT EXISTS policy_privacy_body text DEFAULT 'We respect your privacy. Your personal information is never shared with third parties.',
  ADD COLUMN IF NOT EXISTS policy_terms_title text DEFAULT 'Terms of Service',
  ADD COLUMN IF NOT EXISTS policy_terms_body text DEFAULT 'By using Eraya, you agree to our terms of service.';