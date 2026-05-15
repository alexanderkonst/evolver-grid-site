-- Journey Visit Columns (Day 65 wave 4, Sasha 2026-05-15)
--
-- Sasha wants strikethrough on JOURNEY items #2/#3/#4 to survive
-- device switches — same persistence guarantee as the four
-- server-side-tracked items (Top Talent, Assets, QoL, Mission).
--
-- This migration adds three timestamp columns to game_profiles,
-- one per content-page JOURNEY item. The page-mount useEffect on
-- each route writes the timestamp via an UPDATE with an
-- `IS NULL` filter, so only the FIRST visit lands — subsequent
-- visits are no-ops on the DB side (the .is(col, null) clause
-- causes 0 rows to match once the column is populated). This
-- gives us "earliest visit time" semantics without an upsert.
--
-- Columns are nullable on purpose: NULL = not yet visited.
-- IF NOT EXISTS guards make the migration safe to re-run.
--
-- Read side: useJourneyProgress already merges localStorage flags
-- with game_profiles signals; this migration adds the three new
-- columns to its single fetch and OR's them with the localStorage
-- flags. Either source (browser-local OR server-side) marks the
-- item complete, so:
--   - Pre-auth visitor on device A → localStorage on device A only
--   - Authed visitor on device A → localStorage AND DB → device B
--     sign-in still shows strikethrough (DB-backed)
--
-- Pages that write: PlaybookPage (#2), PathPage (#3),
-- VentureDashboard (#4). All three call markJourneyVisited() from
-- src/lib/journeyVisits.ts on mount.

ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS playbook_visited_at TIMESTAMPTZ;

ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS path_visited_at TIMESTAMPTZ;

ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS dashboard_visited_at TIMESTAMPTZ;

COMMENT ON COLUMN public.game_profiles.playbook_visited_at IS
  'Day 65 (Sasha 2026-05-15): first-visit timestamp for /playbook. '
  'Drives JOURNEY item #2 strikethrough across devices. '
  'NULL = not yet visited.';

COMMENT ON COLUMN public.game_profiles.path_visited_at IS
  'Day 65 (Sasha 2026-05-15): first-visit timestamp for /path. '
  'Drives JOURNEY item #3 strikethrough across devices. '
  'NULL = not yet visited.';

COMMENT ON COLUMN public.game_profiles.dashboard_visited_at IS
  'Day 65 (Sasha 2026-05-15): first-visit timestamp for /dashboard. '
  'Drives JOURNEY item #4 strikethrough across devices. '
  'NULL = not yet visited.';
