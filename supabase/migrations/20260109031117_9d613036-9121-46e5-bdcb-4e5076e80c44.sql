-- Create mission discovery hierarchy tables

-- Pillars table
CREATE TABLE IF NOT EXISTS public.mission_pillars (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Focus Areas table
CREATE TABLE IF NOT EXISTS public.mission_focus_areas (
  id TEXT PRIMARY KEY,
  pillar_id TEXT NOT NULL REFERENCES public.mission_pillars(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Challenges table
CREATE TABLE IF NOT EXISTS public.mission_challenges (
  id TEXT PRIMARY KEY,
  focus_area_id TEXT NOT NULL REFERENCES public.mission_focus_areas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Outcomes table
CREATE TABLE IF NOT EXISTS public.mission_outcomes (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES public.mission_challenges(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints to mission_search
ALTER TABLE public.mission_search
  ADD CONSTRAINT fk_mission_search_pillar FOREIGN KEY (pillar_id) REFERENCES public.mission_pillars(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_mission_search_focus_area FOREIGN KEY (focus_area_id) REFERENCES public.mission_focus_areas(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_mission_search_challenge FOREIGN KEY (challenge_id) REFERENCES public.mission_challenges(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_mission_search_outcome FOREIGN KEY (outcome_id) REFERENCES public.mission_outcomes(id) ON DELETE SET NULL;

-- Add existing_projects column to mission_search
ALTER TABLE public.mission_search ADD COLUMN IF NOT EXISTS existing_projects JSONB DEFAULT '[]'::jsonb;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_mission_focus_areas_pillar ON public.mission_focus_areas(pillar_id);
CREATE INDEX IF NOT EXISTS idx_mission_challenges_focus_area ON public.mission_challenges(focus_area_id);
CREATE INDEX IF NOT EXISTS idx_mission_outcomes_challenge ON public.mission_outcomes(challenge_id);
CREATE INDEX IF NOT EXISTS idx_mission_search_pillar ON public.mission_search(pillar_id);
CREATE INDEX IF NOT EXISTS idx_mission_search_focus_area ON public.mission_search(focus_area_id);
CREATE INDEX IF NOT EXISTS idx_mission_search_challenge ON public.mission_search(challenge_id);
CREATE INDEX IF NOT EXISTS idx_mission_search_outcome ON public.mission_search(outcome_id);

-- Enable RLS on new tables
ALTER TABLE public.mission_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_focus_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_outcomes ENABLE ROW LEVEL SECURITY;

-- Create read-only policies for all users
CREATE POLICY "Anyone can read pillars" ON public.mission_pillars FOR SELECT USING (true);
CREATE POLICY "Anyone can read focus areas" ON public.mission_focus_areas FOR SELECT USING (true);
CREATE POLICY "Anyone can read challenges" ON public.mission_challenges FOR SELECT USING (true);
CREATE POLICY "Anyone can read outcomes" ON public.mission_outcomes FOR SELECT USING (true);