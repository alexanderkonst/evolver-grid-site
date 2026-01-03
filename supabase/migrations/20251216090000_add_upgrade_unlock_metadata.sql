-- Add prereqs and unlock_effects columns to upgrade_catalog
-- prereqs: array of upgrade codes required before this upgrade unlocks
-- unlock_effects: JSON with unlock_next_upgrades, unlock_practice_tags, capability_flags

ALTER TABLE upgrade_catalog
ADD COLUMN IF NOT EXISTS prereqs TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS unlock_effects JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN upgrade_catalog.prereqs IS 'Array of upgrade codes that must be completed before this upgrade unlocks';
COMMENT ON COLUMN upgrade_catalog.unlock_effects IS 'JSON: {unlock_next_upgrades: string[], unlock_practice_tags: string[], capability_flags: string[]}';

-- Create index for faster prereq lookups
CREATE INDEX IF NOT EXISTS idx_upgrade_catalog_prereqs ON upgrade_catalog USING GIN (prereqs);
