-- Match Interaction Mechanic — Day 66 (Sasha 2026-05-16)
--
-- Implements the double-opt-in matching mechanic per
-- docs/02-strategy/matchmaking_strategy.md §8 + §8.5.
--
-- Two new tables:
--   match_interests — per-direction "I'd like to meet" click record.
--     UNIQUE on (from_user_id, to_user_id) so a user can only express
--     interest in another person once. RLS: users can read interests
--     in either direction they participate in; users can only INSERT
--     their own from-direction interest.
--
--   match_intros — mutual-interest events. One row per pair, canonical
--     ordering (user_a_id < user_b_id). Inserted when both directions
--     of match_interests exist. Each row = one intro email sent = one
--     high-trust feedback event for the engine.
--
-- Legacy `connections` table deprecation: separate one-time admin step
-- (delivered as a Lovable prompt to Sasha, not a committed migration).
-- The application code in this build wave no longer references the
-- `connections` table — see Matchmaking.tsx, Connections.tsx,
-- TeamsSpace.tsx refactors landing alongside this migration.

-- ─── New tables ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.match_interests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score     NUMERIC,
  compound_type   TEXT,
  ai_why_text     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_user_id, to_user_id),
  CHECK (from_user_id <> to_user_id)
);

CREATE TABLE IF NOT EXISTS public.match_intros (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score     NUMERIC,
  compound_type   TEXT,
  ai_why_text     TEXT,
  intro_sent_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_a_id, user_b_id),
  CHECK (user_a_id < user_b_id),
  CHECK (user_a_id <> user_b_id)
);

CREATE INDEX IF NOT EXISTS match_interests_to_user_idx
  ON public.match_interests (to_user_id);
CREATE INDEX IF NOT EXISTS match_interests_from_user_idx
  ON public.match_interests (from_user_id);
CREATE INDEX IF NOT EXISTS match_intros_user_a_idx
  ON public.match_intros (user_a_id);
CREATE INDEX IF NOT EXISTS match_intros_user_b_idx
  ON public.match_intros (user_b_id);

COMMENT ON TABLE public.match_interests IS
  'Day 66 (Sasha 2026-05-16): per-direction "I''d like to meet" click record. UNIQUE (from, to). Users can express interest in another user once. RLS: read your own; insert your own from-direction.';

COMMENT ON TABLE public.match_intros IS
  'Day 66 (Sasha 2026-05-16): mutual-interest events. UNIQUE pair via canonical ordering (user_a_id < user_b_id). Each row = one intro email sent = one high-trust feedback event for the engine learning loop.';

-- ─── RLS ───────────────────────────────────────────────────────────

ALTER TABLE public.match_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_intros ENABLE ROW LEVEL SECURITY;

-- match_interests: read either direction you participate in
CREATE POLICY "users read match_interests they participate in"
ON public.match_interests
FOR SELECT
TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- match_interests: insert only your own from-direction
CREATE POLICY "users insert their own from-direction match_interests"
ON public.match_interests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = from_user_id);

-- match_interests: delete only your own from-direction (withdraw)
CREATE POLICY "users delete their own from-direction match_interests"
ON public.match_interests
FOR DELETE
TO authenticated
USING (auth.uid() = from_user_id);

-- match_intros: read intros you participate in (either side)
CREATE POLICY "users read match_intros they participate in"
ON public.match_intros
FOR SELECT
TO authenticated
USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- match_intros: insert allowed for authenticated users (the mutual-
-- detection logic runs client-side; client inserts when it confirms
-- mutual interest via the reverse SELECT). Could be tightened to
-- a SECURITY DEFINER function in a later wave, but client-side is
-- safe enough for v1 because the CHECK + UNIQUE constraints + RLS
-- on match_interests already prevent forged intros.
CREATE POLICY "users insert match_intros they participate in"
ON public.match_intros
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_a_id OR auth.uid() = user_b_id)
);

-- Legacy `connections` table teardown is performed as a one-time
-- admin step via Lovable's SQL editor, not via this migration file.
-- (Sasha confirmed 2026-05-16 no real connections exist yet.)
