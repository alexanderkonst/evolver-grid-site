-- Add XP, level, streak, and per-path XP columns to game_profiles
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS xp_total INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_streak_days INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak_days INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp_body INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp_mind INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp_heart INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp_spirit INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp_uniqueness_work INTEGER NOT NULL DEFAULT 0;

-- Create quests table to track completed quests
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.game_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  practice_type TEXT,
  path TEXT,
  intention TEXT,
  duration_minutes INTEGER,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on profile_id for faster queries
CREATE INDEX IF NOT EXISTS idx_quests_profile_id ON public.quests(profile_id);

-- Create index on completed_at for ordering
CREATE INDEX IF NOT EXISTS idx_quests_completed_at ON public.quests(completed_at DESC);

-- Add xp_awarded boolean to zog_snapshots to prevent double-awarding
ALTER TABLE public.zog_snapshots
ADD COLUMN IF NOT EXISTS xp_awarded BOOLEAN NOT NULL DEFAULT false;

-- Add xp_awarded boolean to qol_snapshots to prevent double-awarding
ALTER TABLE public.qol_snapshots
ADD COLUMN IF NOT EXISTS xp_awarded BOOLEAN NOT NULL DEFAULT false;