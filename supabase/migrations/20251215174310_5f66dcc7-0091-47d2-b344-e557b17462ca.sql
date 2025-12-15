-- Rename XP columns in game_profiles
ALTER TABLE game_profiles RENAME COLUMN xp_heart TO xp_emotions;
ALTER TABLE game_profiles RENAME COLUMN xp_uniqueness_work TO xp_uniqueness;

-- Update upgrade_catalog.path_slug to use new canonical slugs
UPDATE upgrade_catalog SET path_slug = 'spirit' WHERE path_slug = 'waking-up';
UPDATE upgrade_catalog SET path_slug = 'mind' WHERE path_slug = 'growing-up';
UPDATE upgrade_catalog SET path_slug = 'emotions' WHERE path_slug = 'cleaning-up';
UPDATE upgrade_catalog SET path_slug = 'uniqueness' WHERE path_slug = 'showing-up';
UPDATE upgrade_catalog SET path_slug = 'body' WHERE path_slug = 'grounding';

-- Update quests.path to use new canonical slugs
UPDATE quests SET path = 'spirit' WHERE path = 'waking-up';
UPDATE quests SET path = 'mind' WHERE path = 'growing-up';
UPDATE quests SET path = 'emotions' WHERE path IN ('cleaning-up', 'heart');
UPDATE quests SET path = 'uniqueness' WHERE path IN ('showing-up', 'uniqueness_work');
UPDATE quests SET path = 'body' WHERE path = 'grounding';