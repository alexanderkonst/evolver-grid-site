-- Add first_time_actions as jsonb column on game_profiles (code expects this format)
ALTER TABLE public.game_profiles 
ADD COLUMN IF NOT EXISTS first_time_actions jsonb DEFAULT '{}'::jsonb;