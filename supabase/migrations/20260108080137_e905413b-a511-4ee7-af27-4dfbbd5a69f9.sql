-- Create mission_search table for storing mission data
CREATE TABLE IF NOT EXISTS public.mission_search (
  mission_id text PRIMARY KEY,
  mission_title text NOT NULL,
  mission_statement text NOT NULL,
  outcome_id text,
  challenge_id text,
  focus_area_id text,
  pillar_id text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mission_search ENABLE ROW LEVEL SECURITY;

-- Allow public read access for matching
CREATE POLICY "Anyone can read missions" ON public.mission_search
  FOR SELECT USING (true);

-- Add index for text search
CREATE INDEX idx_mission_search_title ON public.mission_search USING gin(to_tsvector('english', mission_title));
CREATE INDEX idx_mission_search_statement ON public.mission_search USING gin(to_tsvector('english', mission_statement));