-- Remove publicly-exposed customer_email column from reviews to eliminate PII leak via public SELECT policy.
ALTER TABLE public.reviews DROP COLUMN IF EXISTS customer_email;