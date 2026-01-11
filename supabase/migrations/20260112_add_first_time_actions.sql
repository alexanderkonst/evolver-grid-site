-- Add first-time action tracking to game profiles
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS first_time_actions JSONB NOT NULL DEFAULT '{}'::jsonb;
