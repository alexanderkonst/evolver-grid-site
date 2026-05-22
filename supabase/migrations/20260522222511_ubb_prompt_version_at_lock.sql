-- Day 74 (Sasha 2026-05-22) — Phase 2 of UBB staleness UX.
--
-- Adds the prompt-version axis to user_business_artifacts. Every newly
-- inserted row will carry the content-hash of the prompt that produced
-- it (computed at insert time on the client from PROMPT_VERSION in
-- supabase/functions/_shared/ubb-prompts.ts). The frontend staleness
-- compute reads this column and, when it differs from the current
-- PROMPT_VERSION for that artifact_key, flags the row as "prompt-stale"
-- with copy distinct from "parent-relocked" Phase 1 staleness.
--
-- NULL = unknown (legacy rows from before this migration). The frontend
-- treats NULL as "do not flag prompt-stale" so legacy data produces zero
-- false positives during transition.
--
-- No index added — staleness is computed per-user from already-fetched
-- rows; no query joins on this column.

ALTER TABLE public.user_business_artifacts
  ADD COLUMN IF NOT EXISTS prompt_version_at_lock TEXT NULL;

COMMENT ON COLUMN public.user_business_artifacts.prompt_version_at_lock IS
  'Day 74 (Phase 2 staleness UX): 12-char FNV-1a 64-bit hash of the prompt fields (generationGuidance + outputSchema + specificityCriteria) at the moment this row was inserted. Compared against the current PROMPT_VERSION[artifact_key] in the frontend to detect "prompt was updated since you locked this — re-Improve for the new ceiling." NULL = legacy row from before this column existed; treated as unknown (no flag) to avoid false positives during transition.';
