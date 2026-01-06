-- Vector progress table
CREATE TABLE IF NOT EXISTS public.vector_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.game_profiles(id) ON DELETE CASCADE,
  vector text NOT NULL,
  step_index integer NOT NULL DEFAULT 0,
  version text NOT NULL DEFAULT 'v1',
  draft_skipped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vector_progress_profile_vector_version
  ON public.vector_progress(profile_id, vector, version);

CREATE INDEX IF NOT EXISTS idx_vector_progress_profile
  ON public.vector_progress(profile_id);

-- Action events table
CREATE TABLE IF NOT EXISTS public.action_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id text NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.game_profiles(id) ON DELETE CASCADE,
  source text,
  vector text,
  qol_domain text,
  selected_at timestamptz,
  completed_at timestamptz,
  duration integer,
  mode text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_action_events_profile_vector
  ON public.action_events(profile_id, vector);

CREATE INDEX IF NOT EXISTS idx_action_events_completed_at
  ON public.action_events(completed_at DESC);

-- Updated at trigger for vector_progress
DROP TRIGGER IF EXISTS trg_vector_progress_updated_at ON public.vector_progress;
CREATE TRIGGER trg_vector_progress_updated_at
BEFORE UPDATE ON public.vector_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.vector_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_events ENABLE ROW LEVEL SECURITY;

-- Vector progress policies
CREATE POLICY "Users select own vector progress" ON public.vector_progress
  FOR SELECT USING (
    profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users insert own vector progress" ON public.vector_progress
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users update own vector progress" ON public.vector_progress
  FOR UPDATE USING (
    profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid())
  );

-- Action events policies
CREATE POLICY "Users select own action events" ON public.action_events
  FOR SELECT USING (
    profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users insert own action events" ON public.action_events
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid())
  );