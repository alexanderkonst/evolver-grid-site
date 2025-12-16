-- Migration: Create quest_runs table for Side Quest completions
-- Date: 2024-12-16

-- Create quest_runs table
CREATE TABLE IF NOT EXISTS public.quest_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.game_profiles(id) ON DELETE CASCADE,
  practice_id text NOT NULL,
  practice_title text NOT NULL,
  practice_type text,
  domain text CHECK (domain IN ('spirit', 'mind', 'uniqueness', 'emotions', 'body')),
  duration_min integer,
  xp_awarded integer NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quest_runs_profile_id ON public.quest_runs(profile_id);
CREATE INDEX IF NOT EXISTS idx_quest_runs_completed_at ON public.quest_runs(completed_at DESC);

-- Enable RLS
ALTER TABLE public.quest_runs ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only see/modify their own quest runs
CREATE POLICY "Users can view own quest runs" ON public.quest_runs
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM public.game_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own quest runs" ON public.quest_runs
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM public.game_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own quest runs" ON public.quest_runs
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM public.game_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own quest runs" ON public.quest_runs
  FOR DELETE USING (
    profile_id IN (
      SELECT id FROM public.game_profiles WHERE user_id = auth.uid()
    )
  );
