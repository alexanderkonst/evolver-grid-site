-- Add onboarding_stage column to game_profiles for progressive unlock tracking
ALTER TABLE public.game_profiles 
ADD COLUMN IF NOT EXISTS onboarding_stage text DEFAULT 'welcome';