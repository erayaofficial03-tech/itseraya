-- Profiles table (mirrors auth.users so admins can list users without auth admin API)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users view own profile" ON public.profiles;
CREATE POLICY "users view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage profiles" ON public.profiles;
CREATE POLICY "admins manage profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated handle_new_user: assigns roles + creates profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

  IF NEW.email = 'admin@itseraya.in' THEN
    assigned_role := 'admin';
  ELSIF NEW.email = 'erayaofficial03@gmail.com' THEN
    assigned_role := 'manager';
  ELSE
    assigned_role := 'customer';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Make sure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Lock down the admin role: only admin@itseraya.in may hold it
CREATE OR REPLACE FUNCTION public.enforce_single_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.role = 'admin' THEN
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
    IF user_email IS DISTINCT FROM 'admin@itseraya.in' THEN
      RAISE EXCEPTION 'Only admin@itseraya.in can hold the admin role';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' AND OLD.role = 'admin' THEN
    SELECT email INTO user_email FROM auth.users WHERE id = OLD.user_id;
    IF user_email = 'admin@itseraya.in' THEN
      RAISE EXCEPTION 'Cannot remove admin role from admin@itseraya.in';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS enforce_single_admin_trg ON public.user_roles;
CREATE TRIGGER enforce_single_admin_trg
  BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_single_admin();

-- Backfill profiles for existing users
INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url',
  u.created_at
FROM auth.users u
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

-- Convert any legacy 'user' rows to 'customer'
UPDATE public.user_roles SET role = 'customer' WHERE role::text = 'user';

-- Ensure admin@itseraya.in has admin
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role FROM auth.users u
WHERE u.email = 'admin@itseraya.in'
ON CONFLICT DO NOTHING;

-- Ensure erayaofficial03@gmail.com has manager
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'manager'::public.app_role FROM auth.users u
WHERE u.email = 'erayaofficial03@gmail.com'
ON CONFLICT DO NOTHING;

-- Anyone with no role at all becomes a customer
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'customer'::public.app_role
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id)
ON CONFLICT DO NOTHING;