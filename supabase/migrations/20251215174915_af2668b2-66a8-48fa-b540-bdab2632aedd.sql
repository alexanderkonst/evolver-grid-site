-- Add main quest tracking columns to game_profiles
ALTER TABLE public.game_profiles
  ADD COLUMN main_quest_stage text NOT NULL DEFAULT 'mq_0_gateway',
  ADD COLUMN main_quest_status text NOT NULL DEFAULT 'active',
  ADD COLUMN main_quest_updated_at timestamptz NOT NULL DEFAULT now();