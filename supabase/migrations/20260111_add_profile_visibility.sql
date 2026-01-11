-- Profile visibility settings
-- Created: 2026-01-11

ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'full'
  CHECK (visibility IN ('hidden', 'minimal', 'medium', 'full')),
ADD COLUMN IF NOT EXISTS show_location BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_mission BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_offer BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.game_profiles.visibility IS
  'Profile visibility level: hidden (invisible), minimal (name+archetype), medium (+mission), full (all details)';
COMMENT ON COLUMN public.game_profiles.show_location IS 'Show location in public profile';
COMMENT ON COLUMN public.game_profiles.show_mission IS 'Show mission in public profile';
COMMENT ON COLUMN public.game_profiles.show_offer IS 'Show unique offer in public profile';
