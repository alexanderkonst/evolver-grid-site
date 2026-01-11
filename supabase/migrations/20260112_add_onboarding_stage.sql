-- Add onboarding stage tracking for progressive unlocks
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS onboarding_stage TEXT NOT NULL DEFAULT 'new';

UPDATE public.game_profiles
SET onboarding_stage = CASE
  WHEN last_qol_snapshot_id IS NOT NULL THEN 'qol_complete'
  WHEN last_zog_snapshot_id IS NOT NULL THEN 'zog_complete'
  ELSE 'new'
END
WHERE onboarding_stage IS NULL OR onboarding_stage = 'new';
