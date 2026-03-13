-- Canvas Snapshots Schema Migration
CREATE TABLE IF NOT EXISTS canvas_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES game_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  version TEXT DEFAULT 'v0.1',
  session_number INTEGER DEFAULT 1,
  uniqueness JSONB,
  myth JSONB,
  tribe JSONB,
  pain JSONB,
  promise JSONB,
  lead_magnet JSONB,
  value_ladder JSONB,
  tagline TEXT,
  facilitator TEXT,
  session_date TIMESTAMPTZ,
  notes TEXT,
  artifact_status JSONB DEFAULT '{"uniqueness":"draft","myth":"draft","tribe":"draft","pain":"draft","promise":"draft","lead_magnet":"draft","value_ladder":"draft"}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE game_profiles
  ADD COLUMN IF NOT EXISTS last_canvas_snapshot_id UUID REFERENCES canvas_snapshots(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_canvas_snapshots_profile_id ON canvas_snapshots(profile_id);
CREATE INDEX IF NOT EXISTS idx_canvas_snapshots_user_id ON canvas_snapshots(user_id);

ALTER TABLE canvas_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own canvas snapshots"
  ON canvas_snapshots FOR SELECT
  USING (auth.uid() = user_id OR profile_id IN (SELECT id FROM game_profiles WHERE user_id = auth.uid()) OR user_id IS NULL);

CREATE POLICY "Users can insert own canvas snapshots"
  ON canvas_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id OR profile_id IN (SELECT id FROM game_profiles WHERE user_id = auth.uid()) OR user_id IS NULL);

CREATE POLICY "Users can update own canvas snapshots"
  ON canvas_snapshots FOR UPDATE
  USING (auth.uid() = user_id OR profile_id IN (SELECT id FROM game_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own canvas snapshots"
  ON canvas_snapshots FOR DELETE
  USING (auth.uid() = user_id OR profile_id IN (SELECT id FROM game_profiles WHERE user_id = auth.uid()));

CREATE TRIGGER canvas_snapshots_updated_at
  BEFORE UPDATE ON canvas_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_product_builder_updated_at();