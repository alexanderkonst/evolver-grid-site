-- Mission Participants Table
-- Stores participants who opt-in to connect with others on the same mission

CREATE TABLE IF NOT EXISTS mission_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Mission context (for filtering notifications)
  mission_id TEXT NOT NULL,
  mission_title TEXT NOT NULL,
  outcome_id TEXT,
  challenge_id TEXT,
  focus_area_id TEXT,
  pillar_id TEXT,
  
  -- Contact info
  email TEXT NOT NULL,
  first_name TEXT,
  
  -- Auto-generated intro from profile
  intro_text TEXT,
  
  -- Consent flags
  share_consent BOOLEAN DEFAULT false,
  wants_to_lead BOOLEAN DEFAULT false,
  wants_to_integrate BOOLEAN DEFAULT false,
  
  -- Notification preferences
  notify_level TEXT DEFAULT 'mission', -- mission|outcome|challenge|focus
  email_frequency TEXT DEFAULT 'weekly', -- daily|weekly|monthly
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  notified_at TIMESTAMPTZ -- when they were last included in an email
);

-- Index for nightly job: find new participants who need to be notified
CREATE INDEX IF NOT EXISTS idx_mission_participants_pending 
ON mission_participants(created_at, notified_at, share_consent);

-- Index for filtering by mission context
CREATE INDEX IF NOT EXISTS idx_mission_participants_mission 
ON mission_participants(mission_id, share_consent);

CREATE INDEX IF NOT EXISTS idx_mission_participants_focus 
ON mission_participants(focus_area_id, share_consent);

-- RLS: Users can only see participants who opted in
ALTER TABLE mission_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own participation"
ON mission_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view opted-in participants"
ON mission_participants FOR SELECT
USING (share_consent = true OR auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
ON mission_participants FOR UPDATE
USING (auth.uid() = user_id);
