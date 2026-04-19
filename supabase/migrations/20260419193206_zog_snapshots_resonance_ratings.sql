-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  zog_snapshots: resonance_rating + excalibur_resonance_rating    ║
-- ║  Brief: ai_tasks/DONE_resonance_rating.md                        ║
-- ╚═══════════════════════════════════════════════════════════════════╝
--
-- Users who complete Zone of Genius (Appleseed) and Genius Business
-- (Excalibur) consistently report 10/10 resonance when asked how well
-- the result matches their self-perception. This migration lets us
-- capture that signal as structured data so the `/admin/dashboard`
-- stale-cohort view (Phase 1 of the nav loop) can start reading it.
--
-- Both columns are nullable — the rating is UI-side one-shot, so most
-- historical rows will have NULL forever. That's fine.
--
-- Rollback: ALTER TABLE zog_snapshots DROP COLUMN resonance_rating,
--                                      DROP COLUMN excalibur_resonance_rating;

ALTER TABLE public.zog_snapshots
  ADD COLUMN IF NOT EXISTS resonance_rating INTEGER
    CHECK (resonance_rating IS NULL OR (resonance_rating >= 1 AND resonance_rating <= 10)),
  ADD COLUMN IF NOT EXISTS excalibur_resonance_rating INTEGER
    CHECK (excalibur_resonance_rating IS NULL OR (excalibur_resonance_rating >= 1 AND excalibur_resonance_rating <= 10));

COMMENT ON COLUMN public.zog_snapshots.resonance_rating IS
  '1-10 self-reported resonance after Zone of Genius / Appleseed reveal. Captured via ResonanceRating component. Nullable (user may skip).';

COMMENT ON COLUMN public.zog_snapshots.excalibur_resonance_rating IS
  '1-10 self-reported resonance after Genius Business / Excalibur reveal. Captured via ResonanceRating component. Nullable (user may skip).';
