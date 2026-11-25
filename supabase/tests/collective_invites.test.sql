-- Collective WP2: scenario test for collective_invites + redeem/check functions.
-- Run on a database where WP1 and WP2 migrations are applied (a Supabase branch or local stack):
--     psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/collective_invites.test.sql
-- Everything happens in one transaction and ends in ROLLBACK: no data is kept. Any failed
-- assertion raises an exception and stops the script. Fixture people are «member 1», «member 2»
-- and «admin 1»; the ids are made up and the emails are example.invalid.

BEGIN;

CREATE TEMP TABLE _ids (who text PRIMARY KEY, id uuid NOT NULL);
INSERT INTO _ids VALUES
  ('admin 1',  '00000000-0000-4000-8000-0000000000a1'),
  ('member 1', '00000000-0000-4000-8000-0000000000b1'),
  ('member 2', '00000000-0000-4000-8000-0000000000b2');
GRANT SELECT ON _ids TO PUBLIC;

INSERT INTO auth.users (id, email)
SELECT id, replace(who, ' ', '-') || '@example.invalid' FROM _ids;
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM _ids WHERE who = 'admin 1';

-- Act as a signed-in user (what PostgREST does from the JWT).
CREATE FUNCTION pg_temp.act_as(p_who text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE v uuid := (SELECT id FROM _ids WHERE who = p_who);
BEGIN
  PERFORM set_config('request.jwt.claim.sub', v::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v, 'role', 'authenticated')::text, true);
END $$;
GRANT EXECUTE ON FUNCTION pg_temp.act_as(text) TO PUBLIC;

CREATE FUNCTION pg_temp.expect(p_label text, p_got anyelement, p_want anyelement) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF p_got IS DISTINCT FROM p_want THEN
    RAISE EXCEPTION 'FAIL %: got %, want %', p_label, p_got, p_want;
  END IF;
  RAISE NOTICE 'ok   %', p_label;
END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(text, anyelement, anyelement) TO PUBLIC;

-- Fixtures: one good code, one already past its date, made as «admin 1».
INSERT INTO public.collective_invites (code, created_by) VALUES
  ('GoodCode_0001-xx', (SELECT id FROM _ids WHERE who = 'admin 1'));
INSERT INTO public.collective_invites (code, created_by, created_at, expires_at) VALUES
  ('OldCode_0002-xxx', (SELECT id FROM _ids WHERE who = 'admin 1'), now() - interval '31 days', now() - interval '1 day');

-- Defaults: 30 days.
SELECT pg_temp.expect('default expiry is 30 days',
  (SELECT expires_at - created_at FROM public.collective_invites WHERE code = 'GoodCode_0001-xx'),
  interval '30 days');

-- Code shape: short or non-URL-safe codes are refused by the table.
DO $$ BEGIN
  BEGIN
    INSERT INTO public.collective_invites (code, created_by) VALUES ('short', (SELECT id FROM _ids WHERE who='admin 1'));
    RAISE EXCEPTION 'FAIL short code was accepted';
  EXCEPTION WHEN check_violation THEN RAISE NOTICE 'ok   short code refused'; END;
  BEGIN
    INSERT INTO public.collective_invites (code, created_by) VALUES ('has space in it!!', (SELECT id FROM _ids WHERE who='admin 1'));
    RAISE EXCEPTION 'FAIL unsafe code was accepted';
  EXCEPTION WHEN check_violation THEN RAISE NOTICE 'ok   non-URL-safe code refused'; END;
END $$;

-- check_collective_invite (callable without sign-in)
SELECT pg_temp.expect('check: good code', public.check_collective_invite('GoodCode_0001-xx'), 'ok');
SELECT pg_temp.expect('check: expired code', public.check_collective_invite('OldCode_0002-xxx'), 'expired');
SELECT pg_temp.expect('check: unknown code', public.check_collective_invite('NoSuchCode_000000'), 'invalid');

-- Redeem: expired and invalid fail and grant nothing.
SELECT pg_temp.act_as('member 2');
SELECT pg_temp.expect('redeem: expired code fails', public.redeem_collective_invite('OldCode_0002-xxx'), 'expired');
SELECT pg_temp.expect('redeem: invalid code fails', public.redeem_collective_invite('NoSuchCode_000000'), 'invalid');
SELECT pg_temp.expect('expired redeem grants no role',
  (SELECT count(*) FROM public.user_roles WHERE user_id = (SELECT id FROM _ids WHERE who='member 2') AND role = 'collective_member'), 0::bigint);
SELECT pg_temp.expect('expired redeem creates no member row',
  (SELECT count(*) FROM public.collective_members WHERE user_id = (SELECT id FROM _ids WHERE who='member 2')), 0::bigint);

-- Redeem: first use works, grants the role and the member row with invited_by.
SELECT pg_temp.act_as('member 1');
SELECT pg_temp.expect('redeem: first use ok', public.redeem_collective_invite('GoodCode_0001-xx'), 'ok');
SELECT pg_temp.expect('redeem grants the collective_member role',
  (SELECT count(*) FROM public.user_roles WHERE user_id = (SELECT id FROM _ids WHERE who='member 1') AND role = 'collective_member'), 1::bigint);
SELECT pg_temp.expect('redeem creates the member row with invited_by = invite creator',
  (SELECT invited_by FROM public.collective_members WHERE user_id = (SELECT id FROM _ids WHERE who='member 1')),
  (SELECT id FROM _ids WHERE who='admin 1'));
SELECT pg_temp.expect('invite records used_by',
  (SELECT used_by FROM public.collective_invites WHERE code = 'GoodCode_0001-xx'),
  (SELECT id FROM _ids WHERE who='member 1'));
SELECT pg_temp.expect('invite records used_at', (SELECT used_at IS NOT NULL FROM public.collective_invites WHERE code = 'GoodCode_0001-xx'), true);

-- The same code a second time fails, for anyone else.
SELECT pg_temp.act_as('member 2');
SELECT pg_temp.expect('redeem: second use fails', public.redeem_collective_invite('GoodCode_0001-xx'), 'used');
SELECT pg_temp.expect('check: spent code reads used', public.check_collective_invite('GoodCode_0001-xx'), 'used');
SELECT pg_temp.expect('second use grants nothing',
  (SELECT count(*) FROM public.user_roles WHERE user_id = (SELECT id FROM _ids WHERE who='member 2') AND role = 'collective_member'), 0::bigint);

-- An existing member reloading the page: already_member, and a fresh code is not spent.
INSERT INTO public.collective_invites (code, created_by) VALUES ('Fresh_Code_0003-x', (SELECT id FROM _ids WHERE who='admin 1'));
SELECT pg_temp.act_as('member 1');
SELECT pg_temp.expect('redeem: member again → already_member', public.redeem_collective_invite('Fresh_Code_0003-x'), 'already_member');
SELECT pg_temp.expect('already_member does not spend the code',
  (SELECT used_by IS NULL FROM public.collective_invites WHERE code = 'Fresh_Code_0003-x'), true);

-- RLS and grants (real roles).
SET LOCAL ROLE authenticated;
SELECT pg_temp.act_as('member 2');
SELECT pg_temp.expect('RLS: a non-admin reads no invites', (SELECT count(*) FROM public.collective_invites), 0::bigint);
DO $$ BEGIN
  BEGIN
    INSERT INTO public.collective_invites (code, created_by) VALUES ('Sneaky_Code_000-x', auth.uid());
    RAISE EXCEPTION 'FAIL non-admin created an invite';
  EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok   RLS: a non-admin cannot create an invite'; END;
END $$;
SELECT pg_temp.expect('RLS: a non-admin deletes nothing',
  (WITH d AS (DELETE FROM public.collective_invites RETURNING 1) SELECT count(*) FROM d), 0::bigint);

SELECT pg_temp.act_as('admin 1');
SELECT pg_temp.expect('RLS: an admin lists invites', (SELECT count(*) >= 3 FROM public.collective_invites), true);
INSERT INTO public.collective_invites (code, created_by) VALUES ('Admin_Code_0004-x', auth.uid());
DO $$ BEGIN
  BEGIN
    INSERT INTO public.collective_invites (code, created_by) VALUES ('Forged_Code_0005-', (SELECT id FROM _ids WHERE who='member 1'));
    RAISE EXCEPTION 'FAIL admin created an invite in someone else''s name';
  EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok   RLS: created_by must be the admin'; END;
END $$;
DELETE FROM public.collective_invites WHERE code = 'Admin_Code_0004-x';
SELECT pg_temp.expect('RLS: an admin deletes an invite', (SELECT count(*) FROM public.collective_invites WHERE code = 'Admin_Code_0004-x'), 0::bigint);

-- anon: no table access; check yes, redeem no.
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN
  BEGIN
    PERFORM count(*) FROM public.collective_invites;
    RAISE EXCEPTION 'FAIL anon read the invites table';
  EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok   anon cannot read collective_invites'; END;
  BEGIN
    PERFORM public.redeem_collective_invite('Fresh_Code_0003-x');
    RAISE EXCEPTION 'FAIL anon could call redeem';
  EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok   anon cannot call redeem_collective_invite'; END;
END $$;
SELECT pg_temp.expect('anon can check a link', public.check_collective_invite('Fresh_Code_0003-x'), 'ok');

ROLLBACK;
