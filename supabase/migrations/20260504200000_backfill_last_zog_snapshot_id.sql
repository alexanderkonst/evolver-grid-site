-- Day 61 (Sasha 2026-05-04 16:45) — BACKFILL game_profiles.last_zog_snapshot_id
--
-- Root cause of the platform-side "Loading..." spinner-of-doom and the
-- "Take the assessment" empty state on /game/me/zone-of-genius/* pages:
-- ~20 platform read sites trust `game_profiles.last_zog_snapshot_id` as
-- the single source of truth for "does this user have a snapshot?".
-- When that pointer is NULL — even when the user DOES have one or more
-- rows in `zog_snapshots` tied to their profile_id — every one of those
-- read sites incorrectly concludes "no snapshot" and shows the wrong UI.
--
-- The pointer can be NULL for users whose snapshot was created via a
-- code path that never wrote it back (legacy import paths, manual data
-- moves, abandoned writes from races, the silent save-zog-result
-- created profile that didn't get the link update, etc.).
--
-- This backfill: for every game_profile whose pointer is NULL but where
-- at least one zog_snapshot exists for the profile_id, set the pointer
-- to the MOST RECENT snapshot's id. Leaves profiles with no snapshots
-- alone (correctly NULL).
--
-- Idempotent — re-running is safe (the WHERE filters out rows already
-- pointing at something).
--
-- Paired with code defensiveness in:
--   • src/pages/spaces/profile/ZoneOfGeniusOverview.tsx
--   • src/pages/spaces/profile/ZoGPerspectiveView.tsx
-- so that even if a user lands here in the same broken state again
-- (new write paths, future regressions), the pages fall back to the
-- most-recent snapshot on the fly instead of showing empty/loading.

UPDATE public.game_profiles gp
SET last_zog_snapshot_id = latest.id
FROM (
  SELECT DISTINCT ON (profile_id)
    profile_id,
    id,
    created_at
  FROM public.zog_snapshots
  ORDER BY profile_id, created_at DESC
) AS latest
WHERE gp.id = latest.profile_id
  AND gp.last_zog_snapshot_id IS NULL;
