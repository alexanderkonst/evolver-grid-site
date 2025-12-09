-- Add personality_tests JSONB column to game_profiles for storing uploaded test results
ALTER TABLE public.game_profiles 
ADD COLUMN personality_tests JSONB DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.game_profiles.personality_tests IS 'Stores uploaded personality test results (enneagram, 16personalities, human_design)';