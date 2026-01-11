-- Add onboarding_stage column for progressive unlock
-- Stages: 'new', 'zog_started', 'zog_complete', 'qol_complete', 'unlocked'

ALTER TABLE game_profiles 
ADD COLUMN IF NOT EXISTS onboarding_stage TEXT DEFAULT 'new';

-- Set existing users with onboarding_completed = true to 'unlocked'
UPDATE game_profiles 
SET onboarding_stage = 'unlocked' 
WHERE onboarding_completed = true;

-- Set existing users with appleseed data to at least 'zog_complete'
-- This will be handled by the ZoG flow going forward
