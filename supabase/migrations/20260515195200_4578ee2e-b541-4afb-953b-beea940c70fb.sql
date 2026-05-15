CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    (
      _role = 'admin'::app_role
      AND EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = _user_id
          AND lower(email) = ANY (ARRAY[
            'alexanderkonst@gmail.com',
            'konst@alum.mit.edu',
            'me@sloan.mit.edu'
          ])
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    );
$$;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE lower(email) = ANY (ARRAY[
  'alexanderkonst@gmail.com',
  'konst@alum.mit.edu',
  'me@sloan.mit.edu'
])
ON CONFLICT (user_id, role) DO NOTHING;

CREATE OR REPLACE FUNCTION public.grant_admin_on_magic_email_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = ANY (ARRAY[
    'alexanderkonst@gmail.com',
    'konst@alum.mit.edu',
    'me@sloan.mit.edu'
  ]) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_on_magic_email_signup();

COMMENT ON FUNCTION public.has_role(uuid, app_role) IS
  'Day 64 (Sasha, 2026-05-07): admin role derives from auth.users.email when in the magic allowlist (alexanderkonst@gmail.com, konst@alum.mit.edu, me@sloan.mit.edu), OR from a user_roles row. The email path survives any data deletion — admin status cannot be revoked from these accounts by wiping rows. To revoke, the email must be removed from the allowlist via a new migration.';