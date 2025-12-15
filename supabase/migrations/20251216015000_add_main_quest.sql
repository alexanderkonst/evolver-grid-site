-- Migration: Add Main Quest fields to game_profiles
-- Date: 2024-12-16

-- Add main quest tracking columns (exact spec)
ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS main_quest_stage text NOT NULL DEFAULT 'mq_0_gateway',
  ADD COLUMN IF NOT EXISTS main_quest_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS main_quest_progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS main_quest_updated_at timestamptz NOT NULL DEFAULT now();

-- Drop old constraints if they exist (for re-running migration)
ALTER TABLE public.game_profiles DROP CONSTRAINT IF EXISTS check_main_quest_stage;
ALTER TABLE public.game_profiles DROP CONSTRAINT IF EXISTS check_main_quest_status;

-- Add check constraint for valid stages (v0)
ALTER TABLE public.game_profiles ADD CONSTRAINT check_main_quest_stage 
  CHECK (main_quest_stage IN (
    'mq_0_gateway',
    'mq_1_profile_clarity',
    'mq_2_first_side_quest',
    'mq_3_first_upgrade',
    'mq_4_three_day_rhythm',
    'mq_5_real_world_output'
  ));

-- Add check constraint for valid statuses
ALTER TABLE public.game_profiles ADD CONSTRAINT check_main_quest_status 
  CHECK (main_quest_status IN ('active', 'completed', 'skipped'));

-- Create index for quick lookup
CREATE INDEX IF NOT EXISTS idx_game_profiles_main_quest_stage 
  ON public.game_profiles (main_quest_stage);
