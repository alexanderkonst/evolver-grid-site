-- 2026-11-22: People Directory read function (issue #390, spec row A6).
--
-- WHY A MIGRATION: game_profiles is owner-readable only (RLS "Users can view own
-- game profile"), and it holds email / entitlements / tokens, so the directory page
-- cannot SELECT other players from it. Today it therefore lists nobody but yourself.
-- This adds one narrow SECURITY DEFINER read function, the list twin of
-- get_public_profile_by_username (20260722090000_public_profile_usernames.sql).
--
-- Additive only: one new function. No table, column, policy or existing function is
-- touched. Safe to re-run (CREATE OR REPLACE).
--
-- Deploy: held for Sasha's yes (goes through Lovable). Until it is applied the
-- directory page shows "not available yet" instead of an empty list.
--
-- Who appears for the signed-in viewer (same audience gate as the profile page and
-- can_message_player, in one place):
--   * never the viewer themselves
--   * never visibility = 'hidden'
--   * profile_visibility 'public' (or unset)            -> everyone
--   * profile_visibility 'friends'                      -> only with a match_intros row
--   * profile_visibility 'communities'                  -> only with a shared visible community
-- Content depth follows the profile's own dial: location only when show_location and
-- visibility is not 'minimal'; archetype / top talent only when not hidden (already
-- guaranteed by the filter above).
-- can_write mirrors can_message_player(); the insert policy on player_messages still
-- decides, this only avoids offering a button that would be refused.

CREATE OR REPLACE FUNCTION public.list_directory_players(p_limit INTEGER DEFAULT 500)
RETURNS TABLE (
  user_id       UUID,
  username      TEXT,
  first_name    TEXT,
  last_name     TEXT,
  avatar_url    TEXT,
  location      TEXT,
  visibility    TEXT,
  show_location BOOLEAN,
  show_mission  BOOLEAN,
  archetype     TEXT,
  tagline       TEXT,
  top_talent    TEXT,
  can_write     BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select
    gp.user_id,
    gp.username,
    gp.first_name,
    gp.last_name,
    gp.avatar_url,
    case
      when coalesce(gp.show_location, true) and coalesce(gp.visibility, 'full') <> 'minimal'
        then gp.location
      else null
    end,
    coalesce(gp.visibility, 'full'),
    gp.show_location,
    gp.show_mission,
    zs.appleseed_data -> 'vibrationalKey' ->> 'name',
    zs.appleseed_data -> 'vibrationalKey' ->> 'tagline',
    zs.top_three_talents ->> 0,
    public.can_message_player(gp.user_id)
  from public.game_profiles gp
  left join public.zog_snapshots zs on zs.id = gp.last_zog_snapshot_id
  where auth.uid() is not null
    and gp.user_id is not null
    and gp.user_id <> auth.uid()
    and coalesce(gp.visibility, 'full') <> 'hidden'
    and (
      coalesce(gp.profile_visibility, 'public') = 'public'
      or (
        gp.profile_visibility = 'friends'
        and exists (
          select 1 from public.match_intros mi
          where (mi.user_a_id = auth.uid() and mi.user_b_id = gp.user_id)
             or (mi.user_b_id = auth.uid() and mi.user_a_id = gp.user_id)
        )
      )
      or (
        gp.profile_visibility = 'communities'
        and exists (
          select 1 from public.community_members cm
          where cm.user_id = auth.uid()
            and cm.community_id = any(gp.visible_community_ids)
        )
      )
    )
  order by gp.updated_at desc nulls last
  limit least(greatest(coalesce(p_limit, 500), 1), 1000);
$$;

REVOKE ALL ON FUNCTION public.list_directory_players(INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_directory_players(INTEGER) TO authenticated;

COMMENT ON FUNCTION public.list_directory_players(INTEGER) IS
  'People Directory (spec A6): players visible to the signed-in viewer under profile_visibility / visibility, with a narrow public projection and a can_write flag. Never returns email, entitlements or tokens.';
