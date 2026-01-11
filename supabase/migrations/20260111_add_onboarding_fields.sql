-- Add onboarding state tracking to game_profiles
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

COMMENT ON COLUMN public.game_profiles.onboarding_completed IS 'Whether the user has completed onboarding';
COMMENT ON COLUMN public.game_profiles.onboarding_step IS 'Current onboarding step (0-based)';
