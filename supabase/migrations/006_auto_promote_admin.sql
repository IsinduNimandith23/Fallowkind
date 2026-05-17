-- Auto-promote every new auth.users row to admin.
-- Email verification is left untouched so invited users must click the
-- invitation link before they can sign in (which is what marks the email
-- confirmed). Safe only while this Supabase project is admin-only — if
-- customer accounts are ever added to auth.users, drop this trigger first.

CREATE OR REPLACE FUNCTION public.auto_promote_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.raw_app_meta_data :=
    COALESCE(NEW.raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_set_admin ON auth.users;

CREATE TRIGGER on_auth_user_created_set_admin
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_promote_admin();
