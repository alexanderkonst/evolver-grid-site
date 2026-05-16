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

CREATE INDEX IF NOT EXISTS match_interests_to_user_idx ON public.match_interests (to_user_id);
CREATE INDEX IF NOT EXISTS match_interests_from_user_idx ON public.match_interests (from_user_id);
CREATE INDEX IF NOT EXISTS match_intros_user_a_idx ON public.match_intros (user_a_id);
CREATE INDEX IF NOT EXISTS match_intros_user_b_idx ON public.match_intros (user_b_id);

COMMENT ON TABLE public.match_interests IS 'Day 66 (Sasha 2026-05-16): per-direction "I''d like to meet" click record. UNIQUE (from, to). Users can express interest in another user once. RLS: read your own; insert your own from-direction.';
COMMENT ON TABLE public.match_intros IS 'Day 66 (Sasha 2026-05-16): mutual-interest events. UNIQUE pair via canonical ordering (user_a_id < user_b_id). Each row = one intro email sent = one high-trust feedback event for the engine learning loop.';

ALTER TABLE public.match_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_intros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read match_interests they participate in" ON public.match_interests;
CREATE POLICY "users read match_interests they participate in"
ON public.match_interests FOR SELECT TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

DROP POLICY IF EXISTS "users insert their own from-direction match_interests" ON public.match_interests;
CREATE POLICY "users insert their own from-direction match_interests"
ON public.match_interests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "users delete their own from-direction match_interests" ON public.match_interests;
CREATE POLICY "users delete their own from-direction match_interests"
ON public.match_interests FOR DELETE TO authenticated
USING (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "users read match_intros they participate in" ON public.match_intros;
CREATE POLICY "users read match_intros they participate in"
ON public.match_intros FOR SELECT TO authenticated
USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

DROP POLICY IF EXISTS "users insert match_intros they participate in" ON public.match_intros;
CREATE POLICY "users insert match_intros they participate in"
ON public.match_intros FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

DELETE FROM public.connections;
DROP TABLE IF EXISTS public.connections CASCADE;