-- Mission Statement column (Day 66 wave M — Sasha 2026-05-16)
--
-- Adds a free-form text column to `game_profiles` so the streamlined
-- Mission Discovery flow can save the user's one-sentence mission
-- (extracted from their external AI's response to the Mission
-- Discovery prompt) directly on the profile row.
--
-- Why a new column and not reusing `mission_id`:
--   `game_profiles.mission_id` is a TEXT slug pointing into the
--   static 583-mission MISSIONS array. That whole matching layer
--   is being retired in favor of free-form sentences the user's
--   own AI produces. `mission_id` stays for legacy users whose
--   missions are matched against the array; new flow writes
--   `mission_statement` instead. Both can coexist — future
--   surfaces should prefer `mission_statement` when present,
--   falling back to `mission_id`-derived lookups when not.
--
-- Read side: useJourneyProgress.ts already drives JOURNEY item #8
-- strikethrough from `mission_discovered_at` (existing column);
-- this new column just stores the sentence content for display.
-- No read-hook changes needed for the strikethrough to fire.

ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS mission_statement TEXT;

COMMENT ON COLUMN public.game_profiles.mission_statement IS
  'Day 66 (Sasha 2026-05-16): user''s one-sentence mission, saved verbatim from the synthesis line of their external AI''s response to MISSION_DISCOVERY_PROMPT. Free-form text — does NOT reference the static MISSIONS array. NULL = mission not yet discovered. Companion to mission_discovered_at (timestamp of first save) and the legacy mission_id (slug into static MISSIONS, kept for back-compat).';
