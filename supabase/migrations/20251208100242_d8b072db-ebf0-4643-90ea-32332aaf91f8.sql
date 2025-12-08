-- Fix qol_snapshots: Drop overly permissive policy and create proper owner-scoped policy
DROP POLICY IF EXISTS "Allow all access to qol_snapshots" ON qol_snapshots;

CREATE POLICY "Users can view own QoL snapshots"
ON qol_snapshots FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  )
  OR
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id IS NULL
  )
);

CREATE POLICY "Users can insert own QoL snapshots"
ON qol_snapshots FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  )
  OR
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id IS NULL
  )
);

CREATE POLICY "Users can update own QoL snapshots"
ON qol_snapshots FOR UPDATE
USING (
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own QoL snapshots"
ON qol_snapshots FOR DELETE
USING (
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  )
);

-- Fix zog_snapshots: Drop overly permissive policy and create proper owner-scoped policy
DROP POLICY IF EXISTS "Allow all access to zog_snapshots" ON zog_snapshots;

CREATE POLICY "Users can view own ZoG snapshots"
ON zog_snapshots FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  )
  OR
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id IS NULL
  )
);

CREATE POLICY "Users can insert own ZoG snapshots"
ON zog_snapshots FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  )
  OR
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id IS NULL
  )
);

CREATE POLICY "Users can update own ZoG snapshots"
ON zog_snapshots FOR UPDATE
USING (
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own ZoG snapshots"
ON zog_snapshots FOR DELETE
USING (
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  )
);

-- Fix player_upgrades: Drop overly permissive policy and create proper owner-scoped policy
DROP POLICY IF EXISTS "Allow all access to player_upgrades" ON player_upgrades;

CREATE POLICY "Users can view own upgrades"
ON player_upgrades FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  )
  OR
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id IS NULL
  )
);

CREATE POLICY "Users can insert own upgrades"
ON player_upgrades FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  )
  OR
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id IS NULL
  )
);

CREATE POLICY "Users can update own upgrades"
ON player_upgrades FOR UPDATE
USING (
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own upgrades"
ON player_upgrades FOR DELETE
USING (
  profile_id IN (
    SELECT id FROM game_profiles WHERE user_id = auth.uid()
  )
);

-- Fix genius_offer_requests: Replace dangerous UPDATE policy with proper owner-scoped policy
DROP POLICY IF EXISTS "Allow updating genius offer requests" ON genius_offer_requests;

CREATE POLICY "Users can update own genius offer requests"
ON genius_offer_requests FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);