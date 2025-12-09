-- Add personality_tests column to game_profiles for storing test results
ALTER TABLE game_profiles 
ADD COLUMN IF NOT EXISTS personality_tests JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN game_profiles.personality_tests IS 'AI-analyzed personality test results (enneagram, 16personalities, human_design, etc.)';
