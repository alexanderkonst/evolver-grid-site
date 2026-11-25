-- Collective WP1 · migration 3 of 3: collective_public_counts().
-- Spec: docs/specs/collective/build_spec.md (v0.2) → "Data model" (live counts).
--
-- RLS stops a browser from counting other players' rows, so the public circles page reads
-- these four numbers through one security-definer function. It returns integers only:
-- no row data, no ids, no emails.
--
-- Source columns (verified in migrations, 2026-11-25):
--   players_started   → public.game_profiles, rows with user_id IS NOT NULL
--                       (profiles are created for signed-in players by getOrCreateGameProfileId;
--                       the early device-only rows have user_id NULL and are not counted)
--   top_talent_found  → distinct public.zog_snapshots.profile_id that still joins to a
--                       game_profiles row with a user_id. One player = one count, however
--                       many snapshots. Same definition as the admin segment "Took Top Talent"
--                       (at least one zog_snapshot).
--   mission_found     → public.game_profiles with mission_discovered_at IS NOT NULL
--                       OR a non-blank mission_statement OR a legacy mission_id.
--                       (mission_discovered_at is the column the Journey strike-through reads;
--                       the other two cover rows saved before it was set.)
--   core_members      → public.collective_members, all rows

CREATE OR REPLACE FUNCTION public.collective_public_counts()
RETURNS TABLE (
  players_started  integer,
  top_talent_found integer,
  mission_found    integer,
  core_members     integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*)::integer
       FROM public.game_profiles gp
      WHERE gp.user_id IS NOT NULL),
    (SELECT count(DISTINCT zs.profile_id)::integer
       FROM public.zog_snapshots zs
       JOIN public.game_profiles gp ON gp.id = zs.profile_id
      WHERE gp.user_id IS NOT NULL),
    (SELECT count(*)::integer
       FROM public.game_profiles gp
      WHERE gp.user_id IS NOT NULL
        AND (
          gp.mission_discovered_at IS NOT NULL
          OR nullif(btrim(gp.mission_statement), '') IS NOT NULL
          OR gp.mission_id IS NOT NULL
        )),
    (SELECT count(*)::integer
       FROM public.collective_members);
$$;

REVOKE ALL ON FUNCTION public.collective_public_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.collective_public_counts() TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.collective_public_counts() IS
  'Collective WP1 (2026-11-25): four public counters, integers only. Callable without sign-in. See migration header for the source columns.';
