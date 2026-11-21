-- 2026-11-21: Player-to-player messages (issue #356, spec row A6).
--
-- Simple 1:1 messages between two players. One row per message; a "thread" is
-- the set of rows between two user ids (either direction).
--
-- Additive only: one new table, one helper function, nothing dropped or rewritten.
--
-- Depends on (all earlier migrations):
--   game_profiles.visibility / profile_visibility / visible_community_ids
--     (20260716120000_add_profile_audience_visibility.sql)
--   match_intros (20260516235413_*.sql), community_members (20260720192702_*.sql)
--
-- Deploy: held for Sasha's yes (goes through Lovable). The UI degrades
-- gracefully while the table is missing: the Write button still shows, the
-- inbox shows an empty state, and sending reports "Messages are not available yet".
--
-- Privacy contract (mirrors the profile audience gate in PublicProfile.tsx and
-- get_public_profile_by_username):
--   * you can write to a player only if you could open their profile:
--       visibility <> 'hidden' AND
--       (profile_visibility = 'public'
--        OR 'friends'     and you share a match_intros row
--        OR 'communities' and you are in one of their visible communities)
--   * exception: you can always reply to someone who already wrote to you,
--     so a thread never dead-ends on one side.
--   * only the two people in a message can read it; nobody can edit the text
--     or delete a message; only the recipient can set read_at.

CREATE TABLE IF NOT EXISTS public.player_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body         TEXT NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at      TIMESTAMPTZ,
  CHECK (sender_id <> recipient_id)
);

-- Inbox: my messages, newest first, by either side of the thread.
CREATE INDEX IF NOT EXISTS player_messages_recipient_idx
  ON public.player_messages (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS player_messages_sender_idx
  ON public.player_messages (sender_id, created_at DESC);
-- Unread badge: only the unread rows.
CREATE INDEX IF NOT EXISTS player_messages_unread_idx
  ON public.player_messages (recipient_id) WHERE read_at IS NULL;

-- Privacy gate. SECURITY DEFINER because game_profiles is owner-readable only,
-- so the policy itself cannot look at the recipient's settings.
CREATE OR REPLACE FUNCTION public.can_message_player(p_recipient UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select
    auth.uid() is not null
    and p_recipient is not null
    and p_recipient <> auth.uid()
    and (
      -- they already wrote to me: I can always answer
      exists (
        select 1 from public.player_messages m
        where m.sender_id = p_recipient and m.recipient_id = auth.uid()
      )
      or exists (
        select 1 from public.game_profiles gp
        where gp.user_id = p_recipient
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
      )
    );
$$;

REVOKE ALL ON FUNCTION public.can_message_player(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_message_player(UUID) TO authenticated;

ALTER TABLE public.player_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "player_messages_select_participants" ON public.player_messages;
DROP POLICY IF EXISTS "player_messages_insert_sender"       ON public.player_messages;
DROP POLICY IF EXISTS "player_messages_update_recipient"    ON public.player_messages;

-- Only the two people in a message can read it. A third account sees nothing.
CREATE POLICY "player_messages_select_participants"
  ON public.player_messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Send as yourself, to someone whose settings allow it.
CREATE POLICY "player_messages_insert_sender"
  ON public.player_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.can_message_player(recipient_id));

-- The recipient marks their own incoming messages read (column grant below
-- limits the update to read_at).
CREATE POLICY "player_messages_update_recipient"
  ON public.player_messages FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Column-level grants: no edits to text/sender/recipient/time, no deletes, no anon.
REVOKE ALL ON public.player_messages FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.player_messages TO authenticated;
GRANT INSERT (sender_id, recipient_id, body) ON public.player_messages TO authenticated;
GRANT UPDATE (read_at) ON public.player_messages TO authenticated;
GRANT ALL ON public.player_messages TO service_role;

COMMENT ON TABLE public.player_messages IS
  'Simple 1:1 messages between players (spec A6). A thread = rows between two user ids. RLS: only the two participants read; insert gated by can_message_player() (profile audience settings).';
