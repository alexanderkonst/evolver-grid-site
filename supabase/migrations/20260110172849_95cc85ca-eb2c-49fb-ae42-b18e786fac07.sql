-- Add onboarding tracking fields to game_profiles
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step integer NOT NULL DEFAULT 0;