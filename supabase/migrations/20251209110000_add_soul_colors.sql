-- Add soul_colors column to game_profiles for storing AI-generated color palette
ALTER TABLE game_profiles 
ADD COLUMN IF NOT EXISTS soul_colors TEXT[] DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN game_profiles.soul_colors IS 'AI-generated color palette representing the player''s unique soul essence, derived from Zone of Genius assessment';
