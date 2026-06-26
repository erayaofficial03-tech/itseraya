-- Fix D: Lock down the settings table so only staff can read it directly.
-- The public_settings view must act as the security boundary (bypass RLS, expose only safe columns).

-- 1. Make public_settings a true security boundary (bypasses RLS on the underlying table)
ALTER VIEW public.public_settings SET (security_invoker = false);

-- 2. Drop legacy and public-facing policies on the raw settings table
DROP POLICY IF EXISTS "Settings readable by all" ON public.settings;
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
DROP POLICY IF EXISTS "public read settings via view" ON public.settings;

-- 3. Ensure staff-only read policy exists (uses has_role() to avoid RLS recursion)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'settings'
      AND policyname = 'Staff read full settings'
  ) THEN
    CREATE POLICY "Staff read full settings" ON public.settings
      FOR SELECT TO authenticated
      USING (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'manager'::public.app_role)
      );
  END IF;
END $$;
