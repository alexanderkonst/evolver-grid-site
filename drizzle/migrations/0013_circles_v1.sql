-- lovable-cron-fallback-reviewed: 15-minute cadence is required so 1-hour-before circle reminders land on time; 96 runs/day accepted by owner.
-- 2026-11-22: Circles v1, player-hosted gatherings in the village Café (issue #384).
-- Spec: issue #384 (§7 data, S7 weekly circle, §5 reminders); Care of a place: PR #388.
--
-- Extends `events` and `event_rsvps`; adds circle_handoffs, circle_lines, circle_steps,
-- circle_notices, and SECURITY DEFINER functions. Nothing is dropped except two creator-only
-- policies on `events`, replaced below by host-aware ones (the original creator keeps access
-- until a hand-off, because host_id starts as created_by).
--
-- Deploy: held for Sasha's yes (goes through Lovable). The UI degrades while this is missing:
-- the Café still lists events, and circle actions report "Circles are not available yet".
--
-- Differences from the attached draft (each one closes a hole the draft left open):
--   * a player could mark THEMSELVES came through "Users can update own RSVP" and then write
--     a line; now a trigger lets only the host or co-host change came / came_marked_at.
--   * a player could set their own status to going on an Ask-to-join or full circle;
--     now the same trigger refuses it.
--   * a step's owner could confirm their own step through the shared UPDATE policy;
--     now only the witness can set confirmed_at / witness_note.
--   * the recipient could rewrite any column of a hand-off; now the only way to accept is
--     accept_circle_handoff().
--   * the old creator-only UPDATE policy on events would keep letting the first host edit
--     after a hand-off; replaced by host / co-host policies.
--   * event_rsvps is owner-readable only (20260610200315), so faces of people going / came
--     come from circle_people(), which returns names and avatars of people on one circle only,
--     and only for profiles that are public.
--   * inbox notes go through circle_notify() so a host's note reaches a guest whose profile
--     audience would refuse a plain player_messages insert.

-- ============================================================================
-- events
-- ============================================================================
-- `visibility` stays as it is (public | community | private | team). The Host form writes
-- Village → 'public' and Link only → 'private'.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'gathering',
  ADD COLUMN IF NOT EXISTS end_time time,
  ADD COLUMN IF NOT EXISTS capacity int,
  ADD COLUMN IF NOT EXISTS requires_approval boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS online_url text,
  ADD COLUMN IF NOT EXISTS series_id uuid,
  ADD COLUMN IF NOT EXISTS repeat_rule text NOT NULL DEFAULT 'never',
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS host_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS cohost_id uuid REFERENCES auth.users(id),
  -- Care of a place: the one "after" photo, set on Who came. Public URL in the app's existing
  -- image bucket (avatars); no new table. Only host / co-host can write it (the update policy
  -- below), and only on kind 'care' (events_care_check).
  ADD COLUMN IF NOT EXISTS after_photo_url text;

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_kind_check;
ALTER TABLE public.events ADD CONSTRAINT events_kind_check
  CHECK (kind IN ('weekly_circle','mastermind','practice','dinner','gathering','care'));
-- Care of a place is a real place (no Online, no call link), and only it carries an after photo.
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_care_check;
ALTER TABLE public.events ADD CONSTRAINT events_care_check
  CHECK (
    (kind = 'care' AND nullif(btrim(location), '') IS NOT NULL
      AND lower(btrim(location)) <> 'online' AND online_url IS NULL)
    OR (kind <> 'care' AND after_photo_url IS NULL)
  );
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_capacity_check;
ALTER TABLE public.events ADD CONSTRAINT events_capacity_check
  CHECK (capacity IS NULL OR capacity > 0);
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_repeat_rule_check;
ALTER TABLE public.events ADD CONSTRAINT events_repeat_rule_check
  CHECK (repeat_rule IN ('never','weekly','biweekly','monthly','new_moon','full_moon'));

UPDATE public.events SET host_id = created_by WHERE host_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_series ON public.events(series_id);
CREATE INDEX IF NOT EXISTS idx_events_host ON public.events(host_id);

-- The creator is the signed-in caller and starts as the host, so older clients and old events
-- keep working and nobody can create a circle that names another player as its host.
CREATE OR REPLACE FUNCTION public.events_default_host()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.created_by := auth.uid();
    NEW.host_id := auth.uid();
  ELSIF NEW.host_id IS NULL THEN
    NEW.host_id := NEW.created_by; -- service role / migrations
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS events_default_host ON public.events;
CREATE TRIGGER events_default_host BEFORE INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.events_default_host();

-- Who may change what on an event:
--   host_id moves only inside accept_circle_handoff(); cancelling and handing off are the host's.
CREATE OR REPLACE FUNCTION public.events_guard_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN NEW; -- service role / migrations
  END IF;
  IF NEW.host_id IS DISTINCT FROM OLD.host_id
     AND coalesce(current_setting('circles.handoff', true), '') <> 'on' THEN
    RAISE EXCEPTION 'host_id changes only through accept_circle_handoff()';
  END IF;
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'created_by is fixed';
  END IF;
  IF NEW.cancelled_at IS DISTINCT FROM OLD.cancelled_at
     AND uid IS DISTINCT FROM OLD.host_id THEN
    RAISE EXCEPTION 'only the host cancels a circle';
  END IF;
  IF NEW.cohost_id IS DISTINCT FROM OLD.cohost_id
     AND uid IS DISTINCT FROM OLD.host_id
     AND coalesce(current_setting('circles.handoff', true), '') <> 'on' THEN
    RAISE EXCEPTION 'only the host changes the co-host';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS events_guard_update ON public.events;
CREATE TRIGGER events_guard_update BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.events_guard_update();

-- Replace the creator-only policies with host-aware ones.
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
DROP POLICY IF EXISTS "host or cohost update event" ON public.events;
DROP POLICY IF EXISTS "host deletes event" ON public.events;
CREATE POLICY "host or cohost update event" ON public.events FOR UPDATE
  USING (auth.uid() = coalesce(host_id, created_by) OR auth.uid() = cohost_id)
  WITH CHECK (true);
CREATE POLICY "host deletes event" ON public.events FOR DELETE
  USING (auth.uid() = coalesce(host_id, created_by));

-- ============================================================================
-- event_rsvps
-- ============================================================================
ALTER TABLE public.event_rsvps DROP CONSTRAINT IF EXISTS event_rsvps_status_check;
ALTER TABLE public.event_rsvps ADD CONSTRAINT event_rsvps_status_check
  CHECK (status IN ('going','maybe','not_going','asked','declined'));
ALTER TABLE public.event_rsvps
  ADD COLUMN IF NOT EXISTS came boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS came_marked_at timestamptz,
  ADD COLUMN IF NOT EXISTS note text CHECK (note IS NULL OR char_length(note) <= 200);

-- A guest may add the host as a line "for the host" on Ask to join; the host may also add a
-- person who came without joining (a row with status going and came = true).
CREATE OR REPLACE FUNCTION public.event_rsvps_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  ev public.events%ROWTYPE;
  is_host boolean;
  taken int;
BEGIN
  IF uid IS NULL THEN
    RETURN NEW; -- service role / migrations
  END IF;
  SELECT * INTO ev FROM public.events WHERE id = NEW.event_id;
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  is_host := uid = coalesce(ev.host_id, ev.created_by) OR uid = ev.cohost_id;

  IF NOT is_host THEN
    -- only the host marks came
    IF TG_OP = 'INSERT' AND (NEW.came OR NEW.came_marked_at IS NOT NULL) THEN
      RAISE EXCEPTION 'only the host marks who came';
    END IF;
    IF TG_OP = 'UPDATE' AND (NEW.came IS DISTINCT FROM OLD.came
                             OR NEW.came_marked_at IS DISTINCT FROM OLD.came_marked_at) THEN
      RAISE EXCEPTION 'only the host marks who came';
    END IF;
    -- declined is the host's answer
    IF NEW.status = 'declined' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'declined') THEN
      RAISE EXCEPTION 'only the host declines a request';
    END IF;
    IF TG_OP = 'UPDATE' AND OLD.status = 'declined' AND NEW.status IS DISTINCT FROM 'declined' THEN
      RAISE EXCEPTION 'the host said not this time';
    END IF;
    -- Ask to join: a guest cannot let themselves in
    IF NEW.status = 'going' AND ev.requires_approval
       AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'going') THEN
      RAISE EXCEPTION 'ask_to_join';
    END IF;
  END IF;

  -- capacity: joining closes when the circle is full (the host may still add people)
  IF NEW.status = 'going' AND ev.capacity IS NOT NULL AND NOT is_host
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'going') THEN
    SELECT count(*) INTO taken FROM public.event_rsvps
      WHERE event_id = NEW.event_id AND status = 'going'
        AND user_id IS DISTINCT FROM NEW.user_id
        AND user_id IS DISTINCT FROM coalesce(ev.host_id, ev.created_by); -- the host holds the circle, takes no seat
    IF taken >= ev.capacity THEN
      RAISE EXCEPTION 'circle_full';
    END IF;
  END IF;

  -- came needs a seat at the circle
  IF NEW.came AND NEW.status NOT IN ('going') AND is_host THEN
    NEW.status := 'going';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS event_rsvps_guard ON public.event_rsvps;
CREATE TRIGGER event_rsvps_guard BEFORE INSERT OR UPDATE ON public.event_rsvps
  FOR EACH ROW EXECUTE FUNCTION public.event_rsvps_guard();

-- Host / co-host read the guest list and update rows (approve, mark came).
-- Own-row SELECT/UPDATE/DELETE policies stay as they are.
DROP POLICY IF EXISTS "host or cohost mark came" ON public.event_rsvps;
DROP POLICY IF EXISTS "host or cohost read rsvps" ON public.event_rsvps;
DROP POLICY IF EXISTS "host or cohost add rsvps" ON public.event_rsvps;
CREATE POLICY "host or cohost read rsvps" ON public.event_rsvps FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_rsvps.event_id
    AND auth.uid() IN (coalesce(e.host_id, e.created_by), e.cohost_id)));
CREATE POLICY "host or cohost mark came" ON public.event_rsvps FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_rsvps.event_id
    AND auth.uid() IN (coalesce(e.host_id, e.created_by), e.cohost_id)));
-- "Add someone who came": the host inserts a row for a villager who never joined.
CREATE POLICY "host or cohost add rsvps" ON public.event_rsvps FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_rsvps.event_id
    AND auth.uid() IN (coalesce(e.host_id, e.created_by), e.cohost_id)));

-- ============================================================================
-- circle_handoffs: the host offers, the recipient takes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.circle_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  series_id uuid,
  from_user uuid NOT NULL REFERENCES auth.users(id),
  to_user uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  CHECK (from_user <> to_user)
);
CREATE INDEX IF NOT EXISTS idx_circle_handoffs_event ON public.circle_handoffs(event_id);
CREATE INDEX IF NOT EXISTS idx_circle_handoffs_to ON public.circle_handoffs(to_user) WHERE accepted_at IS NULL;
ALTER TABLE public.circle_handoffs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "handoffs parties read" ON public.circle_handoffs;
DROP POLICY IF EXISTS "handoffs host creates" ON public.circle_handoffs;
DROP POLICY IF EXISTS "handoffs host withdraws" ON public.circle_handoffs;
CREATE POLICY "handoffs parties read" ON public.circle_handoffs FOR SELECT
  USING (auth.uid() IN (from_user, to_user));
CREATE POLICY "handoffs host creates" ON public.circle_handoffs FOR INSERT WITH CHECK (
  auth.uid() = from_user AND accepted_at IS NULL AND EXISTS (SELECT 1 FROM public.events e
    WHERE e.id = circle_handoffs.event_id
      AND coalesce(e.host_id, e.created_by) = auth.uid()
      AND e.series_id IS NOT DISTINCT FROM circle_handoffs.series_id));
-- The host can take back an offer nobody has taken yet.
CREATE POLICY "handoffs host withdraws" ON public.circle_handoffs FOR DELETE
  USING (auth.uid() = from_user AND accepted_at IS NULL);
-- No UPDATE policy: accepting is accept_circle_handoff() only.

-- Accepting moves the host for this meeting and every later, uncancelled meeting of the
-- series; the old host becomes a guest (going) of this meeting.
CREATE OR REPLACE FUNCTION public.accept_circle_handoff(p_handoff_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h public.circle_handoffs%ROWTYPE;
  ev public.events%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'sign in first';
  END IF;
  SELECT * INTO h FROM public.circle_handoffs WHERE id = p_handoff_id FOR UPDATE;
  IF NOT FOUND OR h.to_user <> auth.uid() THEN
    RAISE EXCEPTION 'this offer is not yours';
  END IF;
  IF h.accepted_at IS NOT NULL THEN
    RETURN; -- already taken, nothing to do
  END IF;
  SELECT * INTO ev FROM public.events WHERE id = h.event_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'this circle is gone';
  END IF;
  IF coalesce(ev.host_id, ev.created_by) <> h.from_user THEN
    RAISE EXCEPTION 'this offer is out of date';
  END IF;

  PERFORM set_config('circles.handoff', 'on', true);

  UPDATE public.events
     SET host_id = h.to_user,
         cohost_id = CASE WHEN cohost_id = h.to_user THEN NULL ELSE cohost_id END
    WHERE cancelled_at IS NULL
     AND (id = ev.id
          OR (ev.series_id IS NOT NULL AND series_id = ev.series_id
              AND (event_date, event_time) >= (ev.event_date, ev.event_time)
              AND coalesce(host_id, created_by) = h.from_user));

  -- you become a guest
  INSERT INTO public.event_rsvps (event_id, user_id, status)
  VALUES (ev.id, h.from_user, 'going')
  ON CONFLICT (event_id, user_id) DO UPDATE SET status = 'going';

  UPDATE public.circle_handoffs SET accepted_at = now() WHERE id = h.id;
END $$;
REVOKE ALL ON FUNCTION public.accept_circle_handoff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_circle_handoff(uuid) TO authenticated;

-- ============================================================================
-- circle_lines: one line per person per meeting, only for people marked came
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.circle_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 200),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
ALTER TABLE public.circle_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lines readable" ON public.circle_lines;
DROP POLICY IF EXISTS "lines own write if came" ON public.circle_lines;
DROP POLICY IF EXISTS "lines own edit" ON public.circle_lines;
DROP POLICY IF EXISTS "lines own delete" ON public.circle_lines;
-- Everyone who can see the circle sees its lines (spec §9.3): they prove a circle is alive.
CREATE POLICY "lines readable" ON public.circle_lines FOR SELECT USING (true);
CREATE POLICY "lines own write if came" ON public.circle_lines FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.event_rsvps r
    WHERE r.event_id = circle_lines.event_id AND r.user_id = auth.uid() AND r.came));
CREATE POLICY "lines own edit" ON public.circle_lines FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lines own delete" ON public.circle_lines FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- circle_steps: Monday step, "done when", a witness who confirms (S7)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.circle_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_of date NOT NULL,               -- the Monday
  step text NOT NULL CHECK (char_length(step) BETWEEN 1 AND 200),
  done_when text NOT NULL CHECK (char_length(done_when) BETWEEN 1 AND 200),
  witness_id uuid REFERENCES auth.users(id),
  claimed_done_at timestamptz,         -- the owner says it is done; the witness is told
  confirmed_at timestamptz,
  witness_note text CHECK (witness_note IS NULL OR char_length(witness_note) <= 200),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (series_id, user_id, week_of),
  CHECK (witness_id IS NULL OR witness_id <> user_id)
);
CREATE INDEX IF NOT EXISTS idx_circle_steps_series ON public.circle_steps(series_id, week_of);
ALTER TABLE public.circle_steps ENABLE ROW LEVEL SECURITY;

-- Is this person on the circle (going or came at any meeting of the series, or its host)?
CREATE OR REPLACE FUNCTION public.is_circle_member(p_series uuid, p_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.series_id = p_series
      AND (coalesce(e.host_id, e.created_by) = p_user OR e.cohost_id = p_user
           OR EXISTS (SELECT 1 FROM public.event_rsvps r
                      WHERE r.event_id = e.id AND r.user_id = p_user
                        AND (r.status = 'going' OR r.came)))
  );
$$;
REVOKE ALL ON FUNCTION public.is_circle_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_circle_member(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "steps owner or witness read" ON public.circle_steps;
DROP POLICY IF EXISTS "steps owner insert" ON public.circle_steps;
DROP POLICY IF EXISTS "steps owner or witness update" ON public.circle_steps;
CREATE POLICY "steps owner or witness read" ON public.circle_steps FOR SELECT
  USING (auth.uid() IN (user_id, witness_id));
CREATE POLICY "steps owner insert" ON public.circle_steps FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND confirmed_at IS NULL AND claimed_done_at IS NULL AND witness_note IS NULL
  AND public.is_circle_member(series_id, auth.uid())
  AND (witness_id IS NULL OR public.is_circle_member(series_id, witness_id)));
CREATE POLICY "steps owner or witness update" ON public.circle_steps FOR UPDATE
  USING (auth.uid() IN (user_id, witness_id));

-- Owner writes the step and says it is done; only the witness confirms or says "not yet".
CREATE OR REPLACE FUNCTION public.circle_steps_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.series_id <> OLD.series_id OR NEW.user_id <> OLD.user_id OR NEW.week_of <> OLD.week_of THEN
    RAISE EXCEPTION 'a step stays in its week';
  END IF;
  IF uid = OLD.witness_id THEN
    IF NEW.step <> OLD.step OR NEW.done_when <> OLD.done_when OR NEW.witness_id IS DISTINCT FROM OLD.witness_id THEN
      RAISE EXCEPTION 'the witness does not edit the step';
    END IF;
    IF NEW.confirmed_at IS NOT NULL AND OLD.confirmed_at IS NULL THEN
      NEW.confirmed_at := now();
    END IF;
    IF OLD.confirmed_at IS NOT NULL AND NEW.confirmed_at IS DISTINCT FROM OLD.confirmed_at THEN
      RAISE EXCEPTION 'a confirmed step stays confirmed';
    END IF;
    RETURN NEW;
  END IF;
  -- the owner
  IF NEW.confirmed_at IS DISTINCT FROM OLD.confirmed_at OR NEW.witness_note IS DISTINCT FROM OLD.witness_note THEN
    RAISE EXCEPTION 'only the witness confirms a step';
  END IF;
  IF OLD.confirmed_at IS NOT NULL THEN
    RAISE EXCEPTION 'a confirmed step is fixed';
  END IF;
  IF NEW.witness_id IS NOT NULL AND NEW.witness_id IS DISTINCT FROM OLD.witness_id
     AND NOT public.is_circle_member(NEW.series_id, NEW.witness_id) THEN
    RAISE EXCEPTION 'the witness is on the circle';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS circle_steps_guard ON public.circle_steps;
CREATE TRIGGER circle_steps_guard BEFORE UPDATE ON public.circle_steps
  FOR EACH ROW EXECUTE FUNCTION public.circle_steps_guard();

-- ============================================================================
-- circle_notices: the log the host sees on Manage ("Reminder · To: Going · Sent Nov 23")
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.circle_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  series_id uuid,
  kind text NOT NULL CHECK (kind IN ('reminder_day','reminder_hour','monday_step','message')),
  audience text NOT NULL DEFAULT 'going',
  week_of date,
  sent_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS circle_notices_once
  ON public.circle_notices (coalesce(event_id, series_id), kind, coalesce(week_of, '1970-01-01'::date))
  WHERE kind <> 'message';
ALTER TABLE public.circle_notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notices host reads" ON public.circle_notices;
CREATE POLICY "notices host reads" ON public.circle_notices FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = circle_notices.event_id
    AND auth.uid() IN (coalesce(e.host_id, e.created_by), e.cohost_id)));
-- No client INSERT: circle_notify() and circle_send_notices() write it.

-- ============================================================================
-- circle_people(): faces for one circle (names and avatars of its own people only)
-- ============================================================================
-- event_rsvps and game_profiles are owner-readable only, so the circle page cannot show
-- faces with plain selects. A face shows only when the person's profile is public
-- (visibility <> hidden and profile_visibility = public, the same gate as the public profile)
-- or is the viewer's own; anyone else is returned without name, avatar or username and the
-- page shows "A villager" with no link.
CREATE OR REPLACE FUNCTION public.circle_face_visible(p_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p_user = auth.uid() OR EXISTS (
    SELECT 1 FROM public.game_profiles g
    WHERE g.user_id = p_user
      AND coalesce(g.visibility, 'full') <> 'hidden'
      AND coalesce(g.profile_visibility, 'public') = 'public');
$$;
REVOKE ALL ON FUNCTION public.circle_face_visible(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.circle_face_visible(uuid) TO anon, authenticated;

-- One row per person; role is host | cohost | guest. A person who is both guest and host is the host.
CREATE OR REPLACE FUNCTION public.circle_people(p_event_id uuid)
RETURNS TABLE (
  user_id uuid, role text, status text, came boolean,
  first_name text, last_name text, avatar_url text, username text, face_visible boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH ev AS (SELECT * FROM public.events WHERE id = p_event_id),
  viewer_runs AS (
    SELECT EXISTS (SELECT 1 FROM ev e
      WHERE auth.uid() IN (coalesce(e.host_id, e.created_by), e.cohost_id)) AS yes
  ),
  guests AS (
    SELECT r.user_id, r.status, r.came FROM public.event_rsvps r
    WHERE r.event_id = p_event_id AND (r.status IN ('going','asked','declined') OR r.came)
  ),
  roles AS (
    SELECT coalesce(e.host_id, e.created_by) AS user_id, 'host'::text AS role FROM ev e
    UNION ALL
    SELECT e.cohost_id, 'cohost' FROM ev e WHERE e.cohost_id IS NOT NULL
  ),
  everyone AS (
    SELECT ro.user_id, ro.role, coalesce(g.status, 'going') AS status, coalesce(g.came, false) AS came
    FROM roles ro LEFT JOIN guests g ON g.user_id = ro.user_id
    UNION ALL
    SELECT g.user_id, 'guest', g.status, g.came FROM guests g
    WHERE g.user_id NOT IN (SELECT user_id FROM roles WHERE user_id IS NOT NULL)
  )
  SELECT x.user_id, x.role, x.status, x.came,
         CASE WHEN f.v THEN g.first_name END,
         CASE WHEN f.v THEN g.last_name END,
         CASE WHEN f.v THEN g.avatar_url END,
         CASE WHEN f.v THEN g.username END,
         f.v
  FROM everyone x
  CROSS JOIN LATERAL (SELECT public.circle_face_visible(x.user_id) AS v) f
  LEFT JOIN public.game_profiles g ON g.user_id = x.user_id
  WHERE x.user_id IS NOT NULL
    AND (
      -- 'asked' and 'declined' rows are the host's business and the person's own
      x.status IN ('going') OR x.came OR x.role <> 'guest'
      OR x.user_id = auth.uid()
      OR (SELECT yes FROM viewer_runs)
    );
$$;
REVOKE ALL ON FUNCTION public.circle_people(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.circle_people(uuid) TO anon, authenticated;

-- Faces for the Café list: the first people going to each of many circles, and how many go
-- (the host sees "3 going"; guests see faces only, never a count, on the client).
CREATE OR REPLACE FUNCTION public.circle_going_faces(p_event_ids uuid[])
RETURNS TABLE (event_id uuid, user_id uuid, avatar_url text, first_name text, going_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH going AS (
    SELECT r.event_id, r.user_id,
           row_number() OVER (PARTITION BY r.event_id ORDER BY r.created_at) AS rn,
           count(*) OVER (PARTITION BY r.event_id) AS total
    FROM public.event_rsvps r
    WHERE r.event_id = ANY (p_event_ids) AND r.status = 'going'
  )
  SELECT g.event_id, g.user_id,
         CASE WHEN public.circle_face_visible(g.user_id) THEN p.avatar_url END,
         CASE WHEN public.circle_face_visible(g.user_id) THEN p.first_name END,
         g.total
  FROM going g LEFT JOIN public.game_profiles p ON p.user_id = g.user_id
  WHERE g.rn <= 4;
$$;
REVOKE ALL ON FUNCTION public.circle_going_faces(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.circle_going_faces(uuid[]) TO anon, authenticated;

-- Search villagers by name (for "Add co-host" / "Add someone who came"). Public profiles only.
CREATE OR REPLACE FUNCTION public.circle_search_villagers(p_query text)
RETURNS TABLE (user_id uuid, first_name text, last_name text, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT g.user_id, g.first_name, g.last_name, g.avatar_url
  FROM public.game_profiles g
  WHERE auth.uid() IS NOT NULL
    AND g.user_id IS NOT NULL AND g.user_id <> auth.uid()
    AND public.circle_face_visible(g.user_id)
    AND char_length(btrim(p_query)) >= 2
    AND (coalesce(g.first_name,'') || ' ' || coalesce(g.last_name,'')) ILIKE '%' || btrim(p_query) || '%'
  ORDER BY g.first_name NULLS LAST
  LIMIT 8;
$$;
REVOKE ALL ON FUNCTION public.circle_search_villagers(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.circle_search_villagers(text) TO authenticated;

-- ============================================================================
-- circle_notify(): an inbox note about one circle
-- ============================================================================
-- Plain player_messages inserts are gated by each recipient's profile audience, which would
-- swallow a host's "You're in" for a guest with a private profile. A circle note is different:
-- the sender runs the circle (or answers one), and the recipient is on it. Rules:
--   * the sender is host / co-host of the event, OR the recipient is host / co-host
--     (a guest writing to the host), OR the sender is the handoff recipient answering;
--   * every recipient has an rsvp row on the event, or is its co-host, or holds a pending hand-off.
CREATE OR REPLACE FUNCTION public.circle_notify(
  p_event_id uuid, p_recipients uuid[], p_body text, p_kind text DEFAULT 'message', p_audience text DEFAULT 'going'
)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  ev public.events%ROWTYPE;
  sender_is_host boolean;
  r uuid;
  sent int := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'sign in first'; END IF;
  IF char_length(btrim(coalesce(p_body,''))) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'empty note'; END IF;
  SELECT * INTO ev FROM public.events WHERE id = p_event_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'no such circle'; END IF;
  sender_is_host := uid = coalesce(ev.host_id, ev.created_by) OR uid = ev.cohost_id;

  FOREACH r IN ARRAY coalesce(p_recipients, ARRAY[]::uuid[]) LOOP
    CONTINUE WHEN r IS NULL OR r = uid;
    -- IS DISTINCT FROM, never NOT IN: with no co-host, `x NOT IN (host, NULL)` is never true.
    IF NOT sender_is_host
       AND r IS DISTINCT FROM coalesce(ev.host_id, ev.created_by)
       AND r IS DISTINCT FROM ev.cohost_id THEN
      -- a guest may write only to the host or co-host through this function
      CONTINUE;
    END IF;
    IF sender_is_host AND NOT (
         EXISTS (SELECT 1 FROM public.event_rsvps x WHERE x.event_id = ev.id AND x.user_id = r)
         OR r = ev.cohost_id
         OR EXISTS (SELECT 1 FROM public.circle_handoffs h WHERE h.event_id = ev.id AND h.to_user = r AND h.accepted_at IS NULL)
       ) THEN
      CONTINUE;
    END IF;
    INSERT INTO public.player_messages (sender_id, recipient_id, body) VALUES (uid, r, p_body);
    sent := sent + 1;
  END LOOP;

  IF sent > 0 AND sender_is_host AND p_kind = 'message' THEN
    INSERT INTO public.circle_notices (event_id, series_id, kind, audience)
    VALUES (ev.id, ev.series_id, 'message', p_audience);
  END IF;
  RETURN sent;
END $$;
REVOKE ALL ON FUNCTION public.circle_notify(uuid, uuid[], text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.circle_notify(uuid, uuid[], text, text, text) TO authenticated;

-- A step note: owner → witness ("{Name} says their step is done…") and witness → owner.
CREATE OR REPLACE FUNCTION public.circle_step_notify(p_step_id uuid, p_to_witness boolean, p_body text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s public.circle_steps%ROWTYPE;
  uid uuid := auth.uid();
BEGIN
  SELECT * INTO s FROM public.circle_steps WHERE id = p_step_id;
  IF NOT FOUND OR s.witness_id IS NULL THEN RAISE EXCEPTION 'no such step'; END IF;
  IF p_to_witness AND uid = s.user_id THEN
    INSERT INTO public.player_messages (sender_id, recipient_id, body) VALUES (uid, s.witness_id, p_body);
  ELSIF NOT p_to_witness AND uid = s.witness_id THEN
    INSERT INTO public.player_messages (sender_id, recipient_id, body) VALUES (uid, s.user_id, p_body);
  ELSE
    RAISE EXCEPTION 'not your step';
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.circle_step_notify(uuid, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.circle_step_notify(uuid, boolean, text) TO authenticated;

-- ============================================================================
-- circle_send_notices(): reminders (1 day, 1 hour) and the Monday step note (S7)
-- ============================================================================
-- Run every 10–15 minutes. Idempotent through circle_notices_once. The sender of each note
-- is the circle's host (a note to the host themself is not written: the host sees
-- "Mark who came" on Manage and in the Café row instead).
CREATE OR REPLACE FUNCTION public.circle_send_notices()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ev record;
  starts timestamptz;
  host uuid;
  n int := 0;
  r uuid;
  wk date;
  logged int;
BEGIN
  FOR ev IN
    SELECT e.* FROM public.events e
    WHERE e.cancelled_at IS NULL
      AND e.event_date BETWEEN (current_date - 1) AND (current_date + 2)
  LOOP
    starts := (ev.event_date + ev.event_time) AT TIME ZONE coalesce(ev.timezone, 'UTC');
    host := coalesce(ev.host_id, ev.created_by);
    CONTINUE WHEN host IS NULL;

    -- 1 day before (between 24h and 23h before start)
    IF now() >= starts - interval '1 day' AND now() < starts - interval '23 hours' THEN
      INSERT INTO public.circle_notices (event_id, series_id, kind) VALUES (ev.id, ev.series_id, 'reminder_day')
        ON CONFLICT DO NOTHING;
      GET DIAGNOSTICS logged = ROW_COUNT;
      IF logged = 1 THEN
        FOR r IN SELECT user_id FROM public.event_rsvps WHERE event_id = ev.id AND status = 'going' AND user_id <> host LOOP
          INSERT INTO public.player_messages (sender_id, recipient_id, body)
          VALUES (host, r, ev.title || ' is tomorrow at ' || to_char(ev.event_date + ev.event_time, 'FMHH12:MI AM')
                           || coalesce(', ' || coalesce(ev.location, CASE WHEN ev.online_url IS NOT NULL THEN 'online' END), '')
                           || '. /game/meet/' || ev.id);
          n := n + 1;
        END LOOP;
      END IF;
    END IF;

    -- 1 hour before
    IF now() >= starts - interval '1 hour' AND now() < starts THEN
      INSERT INTO public.circle_notices (event_id, series_id, kind) VALUES (ev.id, ev.series_id, 'reminder_hour')
        ON CONFLICT DO NOTHING;
      GET DIAGNOSTICS logged = ROW_COUNT;
      IF logged = 1 THEN
        FOR r IN SELECT user_id FROM public.event_rsvps WHERE event_id = ev.id AND status = 'going' AND user_id <> host LOOP
          INSERT INTO public.player_messages (sender_id, recipient_id, body)
          VALUES (host, r, ev.title || ' starts in an hour, '
                           || to_char(ev.event_date + ev.event_time, 'FMHH12:MI AM')
                           || coalesce(', ' || coalesce(ev.location, CASE WHEN ev.online_url IS NOT NULL THEN 'online' END), '')
                           || '. /game/meet/' || ev.id);
          n := n + 1;
        END LOOP;
      END IF;
    END IF;
  END LOOP;

  -- Monday note to each member of a weekly circle: once per series per week.
  FOR ev IN
    SELECT DISTINCT ON (e.series_id) e.* FROM public.events e
    WHERE e.kind = 'weekly_circle' AND e.series_id IS NOT NULL AND e.cancelled_at IS NULL
      AND e.event_date >= current_date - 1
    ORDER BY e.series_id, e.event_date
  LOOP
    wk := date_trunc('week', (now() AT TIME ZONE coalesce(ev.timezone, 'UTC')))::date; -- the Monday
    CONTINUE WHEN extract(isodow FROM (now() AT TIME ZONE coalesce(ev.timezone, 'UTC'))) <> 1
               OR extract(hour FROM (now() AT TIME ZONE coalesce(ev.timezone, 'UTC'))) < 8;
    host := coalesce(ev.host_id, ev.created_by);
    INSERT INTO public.circle_notices (event_id, series_id, kind, week_of) VALUES (ev.id, ev.series_id, 'monday_step', wk)
      ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS logged = ROW_COUNT;
    IF logged = 1 THEN
      FOR r IN
        SELECT DISTINCT x.user_id FROM public.event_rsvps x
        JOIN public.events e2 ON e2.id = x.event_id
        WHERE e2.series_id = ev.series_id AND (x.status = 'going' OR x.came) AND x.user_id <> host
      LOOP
        INSERT INTO public.player_messages (sender_id, recipient_id, body)
        VALUES (host, r, 'New week in ' || ev.title || '. What is your one step? /game/meet/' || ev.id);
        n := n + 1;
      END LOOP;
    END IF;
  END LOOP;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.circle_send_notices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.circle_send_notices() TO service_role;

-- Schedule it every 15 minutes when pg_cron is installed; otherwise call it from any scheduler.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule('circle-send-notices', '*/15 * * * *', 'select public.circle_send_notices()');
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'circle_send_notices not scheduled: %', SQLERRM;
END $$;

COMMENT ON TABLE public.circle_lines IS 'One line per person per meeting, only after the host marked them came (circles spec S6).';
COMMENT ON TABLE public.circle_steps IS 'Weekly circle: Monday step, done-when, and the witness who confirms it (circles spec S7). Never scored or ranked.';
COMMENT ON TABLE public.circle_handoffs IS 'Host hand-off: the host offers, the recipient takes via accept_circle_handoff() (circles spec S4).';
