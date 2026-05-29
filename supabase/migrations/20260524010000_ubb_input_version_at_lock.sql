-- Day 78 (Sasha 2026-05-21) — Phase 4 of the UBB deep-context expansion.
-- See docs/specs/ubb-deep-context/.
--
-- Adds the THIRD staleness axis to user_business_artifacts: input-version.
-- Phase 1 (parent_relocked) and Phase 2 (prompt_changed) already shipped via
-- the 20260522222511 migration. This migration adds Phase 3
-- (input_changed) — the row's stamped `input_version_at_lock` is a hash of
-- the founder's context (deep ZoG + mission + filtered assets) AS IT EXISTED
-- WHEN THE ROW WAS LOCKED. The frontend staleness compute reads this column
-- and, when it differs from the current hash (mission edited, assets added,
-- ZoG resnapshot), flags the row as "input-stale" with copy distinct from
-- Phase 1 and Phase 2.
--
-- NULL = unknown (legacy rows from before this migration). The frontend
-- treats NULL as "do not flag input-stale" so legacy data produces zero
-- false positives during transition.
--
-- No index added — staleness is computed per-user from already-fetched
-- rows; no query joins on this column.

ALTER TABLE public.user_business_artifacts
  ADD COLUMN IF NOT EXISTS input_version_at_lock TEXT NULL;

COMMENT ON COLUMN public.user_business_artifacts.input_version_at_lock IS
  'Day 78 (Phase 4 staleness UX): 12-char FNV-1a 64-bit hash of the founder-context slices VISIBLE to this artifact at insert time (deep ZoG + mission + filtered assets via ARTIFACT_INPUTS). Compared against the current input-version hash in the frontend to detect "your mission/assets/ZoG changed since you locked this — re-Improve to refresh." NULL = legacy row from before this column existed; treated as unknown (no flag) to avoid false positives during transition.';
