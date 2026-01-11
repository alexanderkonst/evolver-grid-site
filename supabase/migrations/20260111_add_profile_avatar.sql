-- Add avatar URL to game profiles
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
