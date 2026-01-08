-- Add genius_stage column to game_profiles for tracking Genius Discovery progression
-- Stages: entry → articulate → useful → monetize → complete

ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS genius_stage TEXT DEFAULT 'entry';

-- Add check constraint for valid values
ALTER TABLE public.game_profiles DROP CONSTRAINT IF EXISTS check_genius_stage;
ALTER TABLE public.game_profiles ADD CONSTRAINT check_genius_stage 
CHECK (genius_stage IN ('entry', 'articulate', 'useful', 'monetize', 'complete'));

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_game_profiles_genius_stage 
  ON public.game_profiles (genius_stage);

-- Comment on column
COMMENT ON COLUMN public.game_profiles.genius_stage IS 'Current stage in Genius Discovery flow: entry, articulate, useful, monetize, complete';