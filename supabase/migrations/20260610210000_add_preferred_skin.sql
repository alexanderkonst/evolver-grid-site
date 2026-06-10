-- Day 91 (Sasha 2026-06-10): person-level theme persistence.
-- The Lapis/Aurum toggle persists per-device via localStorage; this
-- column makes the choice follow the PERSON: the client syncs the
-- choice here on toggle, and reconciles from here on sign-in, so a
-- user who picked Aurum on their Mac opens Aurum on their iPad.
-- Values: 'lapis' | 'aurum' (first-class themes only; white-label
-- demo skins are route-scoped and never persisted). NULL = no
-- explicit choice yet (default Lapis applies).
ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS preferred_skin text;

COMMENT ON COLUMN public.game_profiles.preferred_skin IS
  'First-class theme choice (lapis | aurum), synced from the client theme toggle. NULL = no explicit choice.';
