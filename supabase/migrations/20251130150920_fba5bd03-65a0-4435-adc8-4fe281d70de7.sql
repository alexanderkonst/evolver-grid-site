-- Create game_profiles table
CREATE TABLE public.game_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_zog_snapshot_id UUID,
  last_qol_snapshot_id UUID,
  total_quests_completed INTEGER NOT NULL DEFAULT 0,
  last_quest_title TEXT,
  last_quest_completed_at TIMESTAMPTZ
);

-- Create zog_snapshots table
CREATE TABLE public.zog_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archetype_title TEXT NOT NULL,
  core_pattern TEXT NOT NULL,
  top_three_talents JSONB NOT NULL,
  top_ten_talents JSONB NOT NULL
);

-- Create qol_snapshots table
CREATE TABLE public.qol_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  wealth_stage SMALLINT NOT NULL,
  health_stage SMALLINT NOT NULL,
  happiness_stage SMALLINT NOT NULL,
  love_relationships_stage SMALLINT NOT NULL,
  impact_stage SMALLINT NOT NULL,
  growth_stage SMALLINT NOT NULL,
  social_ties_stage SMALLINT NOT NULL,
  home_stage SMALLINT NOT NULL
);

-- Add foreign key constraints
ALTER TABLE public.game_profiles
  ADD CONSTRAINT fk_last_zog_snapshot 
  FOREIGN KEY (last_zog_snapshot_id) 
  REFERENCES public.zog_snapshots(id) 
  ON DELETE SET NULL;

ALTER TABLE public.game_profiles
  ADD CONSTRAINT fk_last_qol_snapshot 
  FOREIGN KEY (last_qol_snapshot_id) 
  REFERENCES public.qol_snapshots(id) 
  ON DELETE SET NULL;

ALTER TABLE public.zog_snapshots
  ADD CONSTRAINT fk_profile
  FOREIGN KEY (profile_id)
  REFERENCES public.game_profiles(id)
  ON DELETE SET NULL;

ALTER TABLE public.qol_snapshots
  ADD CONSTRAINT fk_profile
  FOREIGN KEY (profile_id)
  REFERENCES public.game_profiles(id)
  ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.game_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zog_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qol_snapshots ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for anonymous device-based access
CREATE POLICY "Allow all access to game_profiles"
  ON public.game_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to zog_snapshots"
  ON public.zog_snapshots
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to qol_snapshots"
  ON public.qol_snapshots
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at on game_profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_game_profiles_updated_at
  BEFORE UPDATE ON public.game_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();