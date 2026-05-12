-- Step 1: Add new role values to app_role enum.
-- New values must be committed before they can be referenced, so this is a separate migration.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';