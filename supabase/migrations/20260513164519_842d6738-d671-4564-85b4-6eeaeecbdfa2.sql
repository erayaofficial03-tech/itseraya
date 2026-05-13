
CREATE OR REPLACE FUNCTION public.enforce_role_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  master_id uuid;
  admin_count int;
  manager_count int;
BEGIN
  SELECT id INTO master_id FROM auth.users WHERE email = 'admin@itseraya.in';

  IF TG_OP = 'DELETE' THEN
    IF OLD.role = 'admin' AND OLD.user_id = master_id THEN
      RAISE EXCEPTION 'The master admin (admin@itseraya.in) is permanent and cannot be removed.';
    END IF;
    RETURN OLD;
  END IF;

  IF NEW.user_id = master_id AND NEW.role <> 'admin' THEN
    RAISE EXCEPTION 'The master admin (admin@itseraya.in) must keep the admin role.';
  END IF;

  IF NEW.role = 'admin' THEN
    SELECT COUNT(*) INTO admin_count
    FROM public.user_roles
    WHERE role = 'admin' AND user_id <> NEW.user_id;
    IF admin_count >= 2 THEN
      RAISE EXCEPTION 'Only 2 admins are allowed (the master plus one).';
    END IF;
  END IF;

  IF NEW.role = 'manager' THEN
    SELECT COUNT(*) INTO manager_count
    FROM public.user_roles
    WHERE role = 'manager' AND user_id <> NEW.user_id;
    IF manager_count >= 1 THEN
      RAISE EXCEPTION 'Only 1 manager is allowed at a time. Demote the existing manager first.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_role_limits_trigger ON public.user_roles;
CREATE TRIGGER enforce_role_limits_trigger
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_role_limits();

CREATE OR REPLACE FUNCTION public.protect_master_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  master_id uuid;
BEGIN
  SELECT id INTO master_id FROM auth.users WHERE email = 'admin@itseraya.in';

  IF TG_OP = 'DELETE' THEN
    IF OLD.id = master_id THEN
      RAISE EXCEPTION 'The master admin profile (admin@itseraya.in) cannot be deleted.';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.id = master_id THEN
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'The master admin email cannot be changed.';
    END IF;
    IF COALESCE(NEW.is_blocked, false) = true THEN
      RAISE EXCEPTION 'The master admin cannot be blocked.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_master_profile_trigger ON public.profiles;
CREATE TRIGGER protect_master_profile_trigger
BEFORE UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_master_profile();
