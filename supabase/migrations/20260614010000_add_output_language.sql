-- Day 101 (Sasha 2026-06-14): per-artifact output language for i18n
-- Layer 3 (AI-generated content). Stamps which language a generated
-- artifact was produced in, so a Russian/Spanish-UI user is not served
-- cached English content, and the Improve loop regenerates in the
-- artifact's own language rather than flipping back to English.
-- Values: 'en' | 'ru' | 'es'. NULL = legacy rows (treat as 'en').
ALTER TABLE public.zog_snapshots
  ADD COLUMN IF NOT EXISTS output_language text;
ALTER TABLE public.user_business_artifacts
  ADD COLUMN IF NOT EXISTS output_language text;

COMMENT ON COLUMN public.zog_snapshots.output_language IS
  'Language the AI-generated snapshot/appleseed/excalibur was produced in (en|ru|es). NULL = legacy/en.';
COMMENT ON COLUMN public.user_business_artifacts.output_language IS
  'Language the AI-generated UBB artifact was produced in (en|ru|es). NULL = legacy/en.';
