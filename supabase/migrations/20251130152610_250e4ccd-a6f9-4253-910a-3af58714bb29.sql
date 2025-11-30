-- Add ai_upgrade_access column to game_profiles for secure access tracking
ALTER TABLE game_profiles ADD COLUMN IF NOT EXISTS ai_upgrade_access BOOLEAN DEFAULT FALSE;

-- Add index for faster access checks
CREATE INDEX IF NOT EXISTS idx_game_profiles_ai_upgrade_access ON game_profiles(id, ai_upgrade_access);

-- Update RLS policies to be more restrictive
-- For now, we'll keep the permissive policies but add comments for future improvement
COMMENT ON POLICY "Allow all access to game_profiles" ON game_profiles IS 
  'SECURITY NOTE: This policy is permissive for device-based anonymous access. Consider implementing authentication for better security.';

COMMENT ON POLICY "Allow all access to zog_snapshots" ON zog_snapshots IS 
  'SECURITY NOTE: This policy is permissive for device-based anonymous access. Consider implementing authentication for better security.';

COMMENT ON POLICY "Allow all access to qol_snapshots" ON qol_snapshots IS 
  'SECURITY NOTE: This policy is permissive for device-based anonymous access. Consider implementing authentication for better security.';