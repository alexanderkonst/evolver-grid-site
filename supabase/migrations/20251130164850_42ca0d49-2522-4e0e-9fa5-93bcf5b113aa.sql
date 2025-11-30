-- Extend game_profiles table to track practice activity
ALTER TABLE game_profiles
ADD COLUMN practice_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN last_practice_at TIMESTAMPTZ NULL;