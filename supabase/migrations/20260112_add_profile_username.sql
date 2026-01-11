-- Add username to game_profiles for public profiles
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
