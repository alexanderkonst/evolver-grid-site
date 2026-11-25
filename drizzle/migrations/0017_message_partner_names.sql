-- 2026-11-24: Names and avatars of message partners (issue #421, spec row A6).
--
-- WHY A MIGRATION: Messages.tsx read game_profiles directly, but game_profiles is
-- owner-readable only (RLS "Users can view own game profile", 20260610200315), so
-- every partner but yourself came back empty and the inbox / thread header fell
-- back to "Community Member". This adds one narrow SECURITY DEFINER read function,
-- the messages twin of list_directory_players (20261122230000_people_directory.sql)
-- and get_public_profile_by_username (20260722090000_public_profile_usernames.sql).
--
-- Additive only: one new function. No table, column, policy or existing function is
-- touched. Safe to re-run (CREATE OR REPLACE).
--
-- Deploy: held for Sasha's yes (goes through Lovable). Until it is applied the
-- inbox keeps showing the fallback name (the client degrades, it does not break).
--
-- Who is returned, for the signed-in viewer, out of the ids asked for:
--   * never visibility = 'hidden' (same wall as the profile page and the directory)
--   * only someone the viewer can already write to (can_message_player(): audience
--     gate, or they wrote first) OR already shares a thread with the viewer
--   * never the viewer (the client already knows their own profile)
-- Fields: user_id, username, first_name, last_name, avatar_url. Nothing else:
-- never email, entitlements, tokens, location, or any profile content.
-- At most 200 ids per call.

CREATE OR REPLACE FUNCTION public.get_message_partners(p_user_ids UUID[])
RETURNS TABLE (
  user_id    UUID,
  username   TEXT,
  first_name TEXT,
  last_name  TEXT,
  avatar_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select distinct on (gp.user_id)
    gp.user_id,
    gp.username,
    gp.first_name,
    gp.last_name,
    gp.avatar_url
  from public.game_profiles gp
  where auth.uid() is not null
    and gp.user_id is not null
    and gp.user_id = any (p_user_ids[1:200])
    and gp.user_id <> auth.uid()
    and coalesce(gp.visibility, 'full') <> 'hidden'
    and (
      public.can_message_player(gp.user_id)
      or exists (
        select 1 from public.player_messages m
        where (m.sender_id = auth.uid() and m.recipient_id = gp.user_id)
           or (m.recipient_id = auth.uid() and m.sender_id = gp.user_id)
      )
    )
  order by gp.user_id, gp.created_at asc;
$$;

REVOKE ALL ON FUNCTION public.get_message_partners(UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_message_partners(UUID[]) TO authenticated;

COMMENT ON FUNCTION public.get_message_partners(UUID[]) IS
  'Messages (spec A6): public name / avatar / username of players the viewer can write to or already has a thread with. Hidden profiles excluded. Never returns email, entitlements or tokens.';
