-- Canvas Snapshots Schema Migration
-- Created: March 12, 2026
-- Purpose: Store Unique Business Canvas session outputs as structured data

-- Table for storing canvas session snapshots (7 artifacts)
CREATE TABLE IF NOT EXISTS canvas_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES game_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Version tracking
  version TEXT DEFAULT 'v0.1',
  session_number INTEGER DEFAULT 1,

  -- The 7 Canvas artifacts (each as structured JSONB)
  uniqueness JSONB,      -- { distillation, archetype, tagline, fullText }
  myth JSONB,            -- { lie, truth, line, fullText }
  tribe JSONB,           -- { name, description, traits, fullText }
  pain JSONB,            -- { layers: [], fullText }
  promise JSONB,         -- { statement, fullText }
  lead_magnet JSONB,     -- { type, description, fullText }
  value_ladder JSONB,    -- { tiers: [{ name, price, description }] }

  -- Canvas-level metadata
  tagline TEXT,
  facilitator TEXT,
  session_date TIMESTAMPTZ,
  notes TEXT,

  -- Status tracking per artifact
  artifact_status JSONB DEFAULT '{"uniqueness":"draft","myth":"draft","tribe":"draft","pain":"draft","promise":"draft","lead_magnet":"draft","value_ladder":"draft"}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add last_canvas_snapshot_id to game_profiles
ALTER TABLE game_profiles
  ADD COLUMN IF NOT EXISTS last_canvas_snapshot_id UUID REFERENCES canvas_snapshots(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_canvas_snapshots_profile_id
  ON canvas_snapshots(profile_id);

CREATE INDEX IF NOT EXISTS idx_canvas_snapshots_user_id
  ON canvas_snapshots(user_id);

-- Enable RLS
ALTER TABLE canvas_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own canvas snapshots"
  ON canvas_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own canvas snapshots"
  ON canvas_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own canvas snapshots"
  ON canvas_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own canvas snapshots"
  ON canvas_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- Also allow profile-based access (for device-auth users without auth.uid)
CREATE POLICY "Allow profile-based access to canvas snapshots"
  ON canvas_snapshots FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER canvas_snapshots_updated_at
  BEFORE UPDATE ON canvas_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_product_builder_updated_at();
