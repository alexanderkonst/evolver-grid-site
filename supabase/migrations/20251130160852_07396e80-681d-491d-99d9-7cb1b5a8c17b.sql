-- Add user_id to game_profiles to link to auth.users
ALTER TABLE public.game_profiles
ADD COLUMN user_id UUID NULL REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create unique index to ensure one profile per user
CREATE UNIQUE INDEX idx_game_profiles_user_id ON public.game_profiles(user_id) WHERE user_id IS NOT NULL;

-- Create index for faster lookups
CREATE INDEX idx_game_profiles_user_id_lookup ON public.game_profiles(user_id);