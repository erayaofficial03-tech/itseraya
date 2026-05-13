-- Defense-in-depth: RESTRICTIVE policy on user_roles writes.
-- Only admins may INSERT/UPDATE/DELETE role assignments from client/API calls.
-- The handle_new_user() trigger is SECURITY DEFINER so it bypasses RLS and
-- continues to assign the default 'customer' role on signup.
CREATE POLICY "restrict role writes to admins"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));