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

CREATE INDEX IF NOT EXISTS match_interests_to_user_idx   ON public.match_interests (to_user_id);
CREATE INDEX IF NOT EXISTS match_interests_from_user_idx ON public.match_interests (from_user_id);
CREATE INDEX IF NOT EXISTS match_intros_user_a_idx       ON public.match_intros (user_a_id);
CREATE INDEX IF NOT EXISTS match_intros_user_b_idx       ON public.match_intros (user_b_id);

ALTER TABLE public.match_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_intros    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read match_interests they participate in"        ON public.match_interests;
DROP POLICY IF EXISTS "users insert their own from-direction match_interests" ON public.match_interests;
DROP POLICY IF EXISTS "users delete their own from-direction match_interests" ON public.match_interests;
DROP POLICY IF EXISTS "users read match_intros they participate in"           ON public.match_intros;
DROP POLICY IF EXISTS "users insert match_intros they participate in"         ON public.match_intros;

CREATE POLICY "users read match_interests they participate in"
ON public.match_interests FOR SELECT TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "users insert their own from-direction match_interests"
ON public.match_interests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "users delete their own from-direction match_interests"
ON public.match_interests FOR DELETE TO authenticated
USING (auth.uid() = from_user_id);

CREATE POLICY "users read match_intros they participate in"
ON public.match_intros FOR SELECT TO authenticated
USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "users insert match_intros they participate in"
ON public.match_intros FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'connections'
  ) THEN
    DELETE FROM public.connections;
    DROP TABLE public.connections CASCADE;
  END IF;
END $$;