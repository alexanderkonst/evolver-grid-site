-- Day 101 (Sasha 2026-06-14): person-level locale persistence.
-- The UI language (English default; Russian, then Spanish) persists
-- per-device via localStorage; this column makes the choice follow the
-- PERSON: the client syncs the choice here on language switch and
-- reconciles from here on sign-in, so a user who picked Russian on their
-- Mac opens Russian on their iPad. Mirrors preferred_skin (Day 91).
-- Values: 'en' | 'ru' | 'es'. NULL = no explicit choice yet (English
-- default applies).
ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS preferred_language text;

COMMENT ON COLUMN public.game_profiles.preferred_language IS
  'UI locale choice (en | ru | es), synced from the client language switcher. NULL = no explicit choice.';
