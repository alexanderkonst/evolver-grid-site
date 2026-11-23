-- 2026-11-22: Feed of real deeds on the Quest Board (issue #394, spec row A16, GoBY §24 #23).
--
-- ALL the database work for A16 is in this one file:
--   1. public.can_see_player_deeds(uuid)  : who may see a player's deeds (profile gate)
--   2. public.get_village_feed(int)       : the finite, newest-first list of real events
--   3. public.deed_seen                   : "I see you" (one tap + optional line)
--
-- Why a migration at all: the sources are private to their owner (game_profiles,
-- journey_victories and user_business_artifacts are owner-readable only), so another
-- player's deed cannot be read with the client and RLS as they are. The feed is read through
-- one narrow SECURITY DEFINER function that applies the profile gate inside the database,
-- the same way get_public_profile_by_username and can_message_player do. No existing
-- table, policy or function is changed. Additive only.
--
-- Deploy: held for Sasha's yes (goes through Lovable). The UI degrades gracefully while
-- this is missing: the Quest Board shows its open quests and no "What happened" section.
--
-- Depends on (all earlier migrations):
--   game_profiles.visibility / show_mission / show_offer / mission_statement / last_zog_snapshot_id
--   game_profiles.profile_visibility / visible_community_ids  (20260716120000_*)
--   match_intros (20260516235413_*), community_members (20260720192702_*)
--   journey_victories (20261028050000_game_tables.sql), zog_snapshots, user_business_artifacts
--
-- Privacy contract:
--   * 'hidden' never appears: game_profiles.visibility = 'hidden' removes every event of
--     that player for everyone else (the owner still sees their own).
--   * the audience gate (profile_visibility: public | friends | communities) is the same as
--     the profile page's: you see a player's deeds only if you could open their profile.
--   * an event that carries content (top talent, mission, tagline) shows it ONLY when the
--     same content would be public on the profile; otherwise the event is the fact alone.
--     A uniqueness phrase has no public surface today, so it is always the fact alone.
--   * "I see you": the doer reads who tapped (and any line); the one who tapped reads their
--     own tap; nobody else reads anything. There is no count anywhere (no aggregate is
--     exposed by any function or policy).
--
-- Event types (v1, only data that already exists):
--   resident        a new resident entered the village   game_profiles.created_at
--   top_talent      found their top talent               journey_victories 'find-top-talent'
--   mission         named their mission                  journey_victories 'discover-mission'
--   uniqueness      named their uniqueness in a phrase   journey_victories 'uniqueness-phrase'
--   stall           unique business: tagline, stall open journey_victories 'tagline'
--   first_price     named a price for the first time     journey_victories 'first-price'
--   first_sale      first sale                           journey_victories 'first-sale'
-- Extension points (NOT built here, they plug in when quests #21 and Circles #384 land):
--   quest_closed    confirmed by the one who posted the quest
--   circle_happened host confirmed who came
-- To add one: add a UNION ALL branch to get_village_feed() and a branch to
-- deed_seen_fill() below (key shape  '<kind>:<doer uuid>[:<ref>]' ), nothing else moves.

-- 1. Profile gate for deeds. Mirrors can_message_player() without the reply exception.
CREATE OR REPLACE FUNCTION public.can_see_player_deeds(p_target UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select
    auth.uid() is not null
    and p_target is not null
    and (
      p_target = auth.uid()
      or exists (
        select 1 from public.game_profiles gp
        where gp.user_id = p_target
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

REVOKE ALL ON FUNCTION public.can_see_player_deeds(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_see_player_deeds(UUID) TO authenticated;

-- A usable first word of a name: not empty, not an email, not a placeholder.
CREATE OR REPLACE FUNCTION public.deed_first_name(p_name TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  select case
    when w is null or w = '' then null
    when position('@' in w) > 0 then null
    when lower(w) in ('guest', 'invitado', 'invitada', 'гость', 'player', 'user', 'anonymous') then null
    else left(w, 40)
  end
  from (select split_part(btrim(coalesce(p_name, '')), ' ', 1) as w) s;
$$;

-- 2. The feed. One chronological, finite list, newest first. No ranking, no counts.
--    Own events are included (is_own) so the doer can read who tapped in their own view.
--    Bounded by the last 90 days and by p_limit (default 40, at most 100).
CREATE OR REPLACE FUNCTION public.get_village_feed(p_limit INT DEFAULT 40)
RETURNS TABLE (
  event_key   TEXT,
  kind        TEXT,
  doer_id     UUID,
  doer_name   TEXT,
  occurred_at TIMESTAMPTZ,
  detail      TEXT,
  is_own      BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  with raw as (
    -- a new resident entered the village (one row per player: the oldest profile)
    select distinct on (gp.user_id)
           'resident:' || gp.user_id::text as event_key,
           'resident'::text as kind,
           gp.user_id as doer_id,
           public.deed_first_name(gp.first_name) as doer_name,
           gp.created_at as occurred_at,
           null::text as detail,
           gp.visibility, gp.show_mission, gp.show_offer, gp.mission_statement,
           gp.last_zog_snapshot_id
    from public.game_profiles gp
    where gp.created_at > now() - interval '90 days'
    order by gp.user_id, gp.created_at asc
  ),
  victories as (
    select 'victory:' || jv.user_id::text || ':' || jv.step_id as event_key,
           case jv.step_id
             when 'find-top-talent'   then 'top_talent'
             when 'discover-mission'  then 'mission'
             when 'uniqueness-phrase' then 'uniqueness'
             when 'tagline'           then 'stall'
             when 'first-price'       then 'first_price'
             when 'first-sale'        then 'first_sale'
           end as kind,
           jv.user_id as doer_id,
           jv.created_at as occurred_at,
           jv.step_id
    from public.journey_victories jv
    where jv.created_at > now() - interval '90 days'
      and jv.step_id in ('find-top-talent', 'discover-mission', 'uniqueness-phrase',
                         'tagline', 'first-price', 'first-sale')
  ),
  profile as (
    select distinct on (gp.user_id)
           gp.user_id,
           public.deed_first_name(gp.first_name) as first_name,
           coalesce(gp.visibility, 'full') as visibility,
           gp.show_mission, gp.show_offer, gp.mission_statement,
           gp.last_zog_snapshot_id
    from public.game_profiles gp
    order by gp.user_id, gp.created_at asc
  ),
  events as (
    select r.event_key, r.kind, r.doer_id, r.doer_name, r.occurred_at, r.detail
    from raw r
    where r.doer_name is not null
    union all
    select v.event_key, v.kind, v.doer_id, p.first_name, v.occurred_at,
           case v.kind
             -- content only when the same content is public on the profile page
             when 'top_talent' then
               case when p.visibility <> 'hidden' then
                 (select nullif(btrim(coalesce(zs.appleseed_data #>> '{vibrationalKey,name}', zs.archetype_title)), '')
                    from public.zog_snapshots zs where zs.id = p.last_zog_snapshot_id)
               end
             when 'mission' then
               case when p.visibility not in ('minimal', 'hidden') and coalesce(p.show_mission, true)
                 then nullif(btrim(p.mission_statement), '')
               end
             when 'stall' then
               case when p.visibility = 'full' and coalesce(p.show_offer, true) then
                 (select nullif(btrim(uba.content_json ->> 'promise_sentence'), '')
                    from public.user_business_artifacts uba
                   where uba.user_id = v.doer_id and uba.artifact_key = 'promise'
                   order by uba.created_at desc limit 1)
               end
             else null
           end
    from victories v
    join profile p on p.user_id = v.doer_id
    where p.first_name is not null
  )
  select e.event_key, e.kind, e.doer_id, e.doer_name, e.occurred_at,
         left(e.detail, 280) as detail,
         (e.doer_id = auth.uid()) as is_own
  from events e
  where auth.uid() is not null
    and public.can_see_player_deeds(e.doer_id)
  order by e.occurred_at desc, e.event_key
  limit greatest(1, least(coalesce(p_limit, 40), 100));
$$;

REVOKE ALL ON FUNCTION public.get_village_feed(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_village_feed(INT) TO authenticated;

-- 3. "I see you": one tap, optional line. The doer reads who tapped; there is no count.
CREATE TABLE IF NOT EXISTS public.deed_seen (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key  TEXT NOT NULL CHECK (char_length(event_key) BETWEEN 10 AND 120),
  doer_id    UUID NOT NULL,
  seer_id    UUID NOT NULL DEFAULT auth.uid(),
  seer_name  TEXT,
  line       TEXT CHECK (line IS NULL OR char_length(btrim(line)) BETWEEN 1 AND 140),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (seer_id <> doer_id),
  UNIQUE (event_key, seer_id)
);

-- "Who tapped on my deeds" and "what did I tap".
CREATE INDEX IF NOT EXISTS deed_seen_doer_idx ON public.deed_seen (doer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS deed_seen_seer_idx ON public.deed_seen (seer_id, event_key);

-- Fills doer_id (from the key) and seer_name (from the profile) and refuses a key that
-- names no real event. Key shapes: 'resident:<uuid>' and 'victory:<uuid>:<step_id>'.
CREATE OR REPLACE FUNCTION public.deed_seen_fill()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  v_kind text := split_part(new.event_key, ':', 1);
  v_doer uuid;
  v_step text := split_part(new.event_key, ':', 3);
begin
  begin
    v_doer := split_part(new.event_key, ':', 2)::uuid;
  exception when invalid_text_representation then
    raise exception 'deed_unknown_event' using errcode = 'P0001';
  end;

  if v_kind = 'resident' then
    if not exists (select 1 from public.game_profiles gp where gp.user_id = v_doer) then
      raise exception 'deed_unknown_event' using errcode = 'P0001';
    end if;
  elsif v_kind = 'victory' then
    if v_step not in ('find-top-talent', 'discover-mission', 'uniqueness-phrase',
                      'tagline', 'first-price', 'first-sale')
       or not exists (select 1 from public.journey_victories jv
                       where jv.user_id = v_doer and jv.step_id = v_step) then
      raise exception 'deed_unknown_event' using errcode = 'P0001';
    end if;
  else
    -- extension point: 'quest' and 'circle' keys are accepted here once they exist
    raise exception 'deed_unknown_event' using errcode = 'P0001';
  end if;

  new.doer_id := v_doer;
  new.seer_name := (
    select public.deed_first_name(gp.first_name)
      from public.game_profiles gp
     where gp.user_id = new.seer_id
     order by gp.created_at asc limit 1
  );
  return new;
end;
$$;

DROP TRIGGER IF EXISTS deed_seen_fill ON public.deed_seen;
CREATE TRIGGER deed_seen_fill BEFORE INSERT ON public.deed_seen
  FOR EACH ROW EXECUTE FUNCTION public.deed_seen_fill();

ALTER TABLE public.deed_seen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deed_seen_select_doer_or_seer" ON public.deed_seen;
DROP POLICY IF EXISTS "deed_seen_insert_seer"         ON public.deed_seen;
DROP POLICY IF EXISTS "deed_seen_update_seer"         ON public.deed_seen;

-- The doer reads who tapped; the one who tapped reads their own tap. Nobody else.
CREATE POLICY "deed_seen_select_doer_or_seer"
  ON public.deed_seen FOR SELECT TO authenticated
  USING (auth.uid() = doer_id OR auth.uid() = seer_id);

-- Tap as yourself, on a deed you are allowed to see.
CREATE POLICY "deed_seen_insert_seer"
  ON public.deed_seen FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = seer_id AND public.can_see_player_deeds(doer_id));

-- The one who tapped may add or change their line afterwards (column grant below).
CREATE POLICY "deed_seen_update_seer"
  ON public.deed_seen FOR UPDATE TO authenticated
  USING (auth.uid() = seer_id)
  WITH CHECK (auth.uid() = seer_id);

REVOKE ALL ON public.deed_seen FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.deed_seen TO authenticated;
GRANT INSERT (event_key, line) ON public.deed_seen TO authenticated;
GRANT UPDATE (line) ON public.deed_seen TO authenticated;
GRANT ALL ON public.deed_seen TO service_role;

COMMENT ON TABLE public.deed_seen IS
  'I see you (spec A16): one tap + optional line on a real deed. RLS: only the doer and the one who tapped can read a row. No counts are exposed anywhere.';
COMMENT ON FUNCTION public.get_village_feed(INT) IS
  'Quest Board feed (spec A16): real events, newest first, finite, filtered by the doers'' profile visibility. Content only where the profile itself shows it.';
