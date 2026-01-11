-- Migration: Add username to game_profiles for public profiles
ALTER TABLE public.game_profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Create index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_game_profiles_username ON public.game_profiles(username);

-- Migration: Add first_time_actions tracking for bonus XP
CREATE TABLE IF NOT EXISTS public.first_time_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.game_profiles(id) ON DELETE CASCADE,
  action_id text NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  xp_bonus_awarded integer NOT NULL DEFAULT 0,
  UNIQUE(profile_id, action_id)
);

-- Enable RLS on first_time_actions
ALTER TABLE public.first_time_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies for first_time_actions
CREATE POLICY "Users can view own first-time actions" 
ON public.first_time_actions 
FOR SELECT 
USING (profile_id IN (
  SELECT id FROM game_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert own first-time actions" 
ON public.first_time_actions 
FOR INSERT 
WITH CHECK (profile_id IN (
  SELECT id FROM game_profiles WHERE user_id = auth.uid()
));

-- Migration: Add QoL priority ordering to game_profiles
ALTER TABLE public.game_profiles 
ADD COLUMN IF NOT EXISTS qol_priority_order jsonb DEFAULT '[]'::jsonb;