ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS mission_statement TEXT;

COMMENT ON COLUMN public.game_profiles.mission_statement IS
  'Day 66: user''s one-sentence mission, saved verbatim from the synthesis line of the external AI''s response to MISSION_DISCOVERY_PROMPT. Free-form text. NULL = mission not yet discovered.';