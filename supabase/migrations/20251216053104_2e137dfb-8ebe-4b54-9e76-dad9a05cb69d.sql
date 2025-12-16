-- Add main_quest_progress column to game_profiles for tracking detailed progress
ALTER TABLE public.game_profiles 
ADD COLUMN IF NOT EXISTS main_quest_progress JSONB DEFAULT '{}'::jsonb;