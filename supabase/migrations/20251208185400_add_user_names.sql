-- Add first_name and last_name columns to game_profiles
-- This enables personalized user experience and profile page display

ALTER TABLE game_profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Create index for faster name lookups when displaying in header
CREATE INDEX IF NOT EXISTS idx_game_profiles_user_id_names 
ON game_profiles(user_id, first_name, last_name);

-- Comment for documentation
COMMENT ON COLUMN game_profiles.first_name IS 'User first name, synced from auth metadata on signup';
COMMENT ON COLUMN game_profiles.last_name IS 'User last name, synced from auth metadata on signup';
