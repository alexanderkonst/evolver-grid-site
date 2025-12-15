-- Migration: Add Main Quest columns to game_profiles
-- Date: 2024-12-16

-- Add main quest tracking columns
ALTER TABLE game_profiles ADD COLUMN IF NOT EXISTS main_quest_stage TEXT DEFAULT 'mq_0_gateway';
ALTER TABLE game_profiles ADD COLUMN IF NOT EXISTS main_quest_status TEXT DEFAULT 'not_started';
ALTER TABLE game_profiles ADD COLUMN IF NOT EXISTS main_quest_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add check constraint for valid stages
ALTER TABLE game_profiles ADD CONSTRAINT check_main_quest_stage 
  CHECK (main_quest_stage IN (
    'mq_0_gateway',
    'mq_1_discover_genius',
    'mq_2_map_life',
    'mq_3_daily_practice',
    'mq_4_first_upgrade',
    'mq_5_share_or_build'
  ));

-- Add check constraint for valid statuses
ALTER TABLE game_profiles ADD CONSTRAINT check_main_quest_status 
  CHECK (main_quest_status IN ('not_started', 'in_progress', 'completed'));

-- Create index for quick lookup
CREATE INDEX IF NOT EXISTS idx_game_profiles_main_quest_stage ON game_profiles(main_quest_stage);
