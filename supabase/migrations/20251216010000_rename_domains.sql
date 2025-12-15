-- Migration: Rename XP columns and update path slugs to canonical domain names
-- Date: 2024-12-16

-- Step 1: Rename XP columns in game_profiles
ALTER TABLE game_profiles RENAME COLUMN xp_heart TO xp_emotions;
ALTER TABLE game_profiles RENAME COLUMN xp_uniqueness_work TO xp_uniqueness;

-- Step 2: Update upgrade_catalog.path_slug from legacy to canonical
UPDATE upgrade_catalog SET path_slug = 'spirit' WHERE path_slug = 'waking-up';
UPDATE upgrade_catalog SET path_slug = 'mind' WHERE path_slug = 'growing-up';
UPDATE upgrade_catalog SET path_slug = 'emotions' WHERE path_slug = 'cleaning-up';
UPDATE upgrade_catalog SET path_slug = 'uniqueness' WHERE path_slug = 'showing-up';
UPDATE upgrade_catalog SET path_slug = 'body' WHERE path_slug = 'grounding';

-- Step 3: Update quests.path from legacy to canonical (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quests') THEN
        UPDATE quests SET path = 'spirit' WHERE path = 'waking-up';
        UPDATE quests SET path = 'mind' WHERE path = 'growing-up';
        UPDATE quests SET path = 'emotions' WHERE path = 'cleaning-up';
        UPDATE quests SET path = 'uniqueness' WHERE path = 'showing-up';
        UPDATE quests SET path = 'body' WHERE path = 'grounding';
    END IF;
END $$;

-- Note: After running this migration, update src/integrations/supabase/types.ts
-- to reflect the new column names: xp_heart -> xp_emotions, xp_uniqueness_work -> xp_uniqueness
