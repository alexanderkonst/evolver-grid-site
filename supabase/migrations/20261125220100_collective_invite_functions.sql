-- Collective WP2 · migration 2 of 2: redeem_collective_invite() and check_collective_invite().
-- Spec: docs/specs/collective/build_spec.md (v0.2) → "Wave 1" (WP2).
-- Requires 20261125220000_collective_invites.sql (and WP1's role + members migrations).
--
-- Both return one word and nothing else: no ids, no emails, no row data.
--   ok | used | expired | invalid | already_member   (check_ never returns already_member)
--
-- redeem_collective_invite(code)  authenticated only. One transaction, one row lock:
--   invalid        → no such code
--   already_member → the caller already holds the role or has a member row (the code is NOT
--                    spent, so a member who reloads the page or opens a stray link loses nothing)
--   used           → the code was redeemed already (second use fails)
--   expired        → past expires_at
--   ok             → code marked used_by / used_at, caller gets the `collective_member` role in
--                    user_roles and a collective_members row with invited_by = the invite's creator
--
-- check_collective_invite(code)   anon + authenticated. Read-only status, so the landing can say
--   «this link has expired» before sign-up. It does not know who is asking.

CREATE OR REPLACE FUNCTION public.redeem_collective_invite(p_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_invite public.collective_invites%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RETURN 'invalid';
  END IF;

  -- Lock the invite row so two simultaneous redeems of one code cannot both pass.
  SELECT * INTO v_invite
    FROM public.collective_invites
   WHERE code = p_code
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'invalid';
  END IF;

  IF EXISTS (SELECT 1 FROM public.collective_members WHERE user_id = v_uid)
     OR EXISTS (
       SELECT 1 FROM public.user_roles
        WHERE user_id = v_uid AND role = 'collective_member'::public.app_role
     ) THEN
    RETURN 'already_member';
  END IF;

  IF v_invite.used_by IS NOT NULL OR v_invite.used_at IS NOT NULL THEN
    RETURN 'used';
  END IF;

  IF v_invite.expires_at <= now() THEN
    RETURN 'expired';
  END IF;

  UPDATE public.collective_invites
     SET used_by = v_uid,
         used_at = now()
   WHERE code = v_invite.code;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_uid, 'collective_member'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.collective_members (user_id, invited_by)
  VALUES (v_uid, v_invite.created_by)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN 'ok';
END;
$$;

CREATE OR REPLACE FUNCTION public.check_collective_invite(p_code text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT CASE
              WHEN i.used_by IS NOT NULL OR i.used_at IS NOT NULL THEN 'used'
              WHEN i.expires_at <= now() THEN 'expired'
              ELSE 'ok'
            END
       FROM public.collective_invites i
      WHERE i.code = p_code),
    'invalid'
  );
$$;

-- redeem: signed-in players only. check: also callable before sign-up.
REVOKE ALL ON FUNCTION public.redeem_collective_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_collective_invite(text) TO authenticated;

REVOKE ALL ON FUNCTION public.check_collective_invite(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_collective_invite(text) TO anon, authenticated;

COMMENT ON FUNCTION public.redeem_collective_invite(text) IS
  'Collective WP2: spend an invite code for auth.uid(). Returns ok | used | expired | invalid | already_member.';
COMMENT ON FUNCTION public.check_collective_invite(text) IS
  'Collective WP2: status of an invite code (ok | used | expired | invalid), callable without sign-in. Returns the word only.';
