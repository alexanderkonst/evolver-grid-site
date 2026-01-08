-- Create mission_participants table
CREATE TABLE public.mission_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  mission_title TEXT NOT NULL,
  outcome_id TEXT,
  challenge_id TEXT,
  focus_area_id TEXT,
  pillar_id TEXT,
  email TEXT NOT NULL,
  first_name TEXT,
  intro_text TEXT,
  share_consent BOOLEAN NOT NULL DEFAULT false,
  wants_to_lead BOOLEAN NOT NULL DEFAULT false,
  wants_to_integrate BOOLEAN NOT NULL DEFAULT false,
  notify_level TEXT NOT NULL DEFAULT 'mission',
  email_frequency TEXT NOT NULL DEFAULT 'weekly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ
);

-- Create indexes for query optimization
CREATE INDEX idx_mission_participants_notification_job 
  ON public.mission_participants(created_at, notified_at, share_consent);

CREATE INDEX idx_mission_participants_by_mission 
  ON public.mission_participants(mission_id, share_consent);

CREATE INDEX idx_mission_participants_by_focus_area 
  ON public.mission_participants(focus_area_id, share_consent);

-- Enable RLS
ALTER TABLE public.mission_participants ENABLE ROW LEVEL SECURITY;

-- Users can insert their own row
CREATE POLICY "Users can insert own participation"
  ON public.mission_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can select shared rows or their own
CREATE POLICY "Users can select shared or own participation"
  ON public.mission_participants
  FOR SELECT
  USING (share_consent = true OR auth.uid() = user_id);

-- Users can update their own row
CREATE POLICY "Users can update own participation"
  ON public.mission_participants
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own row
CREATE POLICY "Users can delete own participation"
  ON public.mission_participants
  FOR DELETE
  USING (auth.uid() = user_id);