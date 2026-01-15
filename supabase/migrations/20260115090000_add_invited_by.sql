ALTER TABLE game_profiles
ADD COLUMN invited_by UUID REFERENCES game_profiles(id);
