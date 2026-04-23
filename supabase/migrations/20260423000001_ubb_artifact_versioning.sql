-- Unique Business Builder v2.0 — extend user_business_artifacts for the 18-artifact flow.
--
-- Paramount invariant: append-only. Each accepted Improve creates a NEW row.
-- Previous versions are never updated in place, never deleted.
--
-- Changes:
--   1. Drop the old CHECK constraint on artifact_key (v1.0 had 8 keys, v2.0 has 18 + legacy overlap).
--   2. Add content_json (JSONB) — structured artifact content. Existing content TEXT column kept for v1.0 rows.
--   3. Add specificity_score — v2.0 terminology. Backfill from precision_score where present.
--   4. Add version lineage columns: parent_version_id, roast_findings, what_changed, is_locked.
--   5. Add indexes to support the 'latest per key' and 'version chain' queries.
--   6. Adjust step_number CHECK to accept 1..18 (v2.0 has 18 phases, v1.0 had 7).

-- 1. Drop old artifact_key CHECK (v2.0 introduces many new keys; application layer enforces now)
alter table public.user_business_artifacts
  drop constraint if exists user_business_artifacts_artifact_key_check;

-- 2. Broaden step_number range
alter table public.user_business_artifacts
  drop constraint if exists user_business_artifacts_step_number_check;
alter table public.user_business_artifacts
  add constraint user_business_artifacts_step_number_check
    check (step_number between 1 and 18);

-- 3. Add content_json (structured content for v2.0)
alter table public.user_business_artifacts
  add column if not exists content_json jsonb;

-- 4. Add specificity_score (v2.0 terminology) — backfill from legacy precision_score
alter table public.user_business_artifacts
  add column if not exists specificity_score numeric(3,1)
    check (specificity_score is null or (specificity_score >= 0 and specificity_score <= 10));

update public.user_business_artifacts
  set specificity_score = precision_score
  where specificity_score is null and precision_score is not null;

-- 5. Versioning lineage
alter table public.user_business_artifacts
  add column if not exists parent_version_id uuid
    references public.user_business_artifacts(id) on delete set null,
  add column if not exists roast_findings jsonb,
  add column if not exists what_changed text,
  add column if not exists is_locked boolean not null default false;

-- 6. Indexes for the common queries
create index if not exists user_business_artifacts_latest_idx
  on public.user_business_artifacts (user_id, artifact_key, created_at desc);

create index if not exists user_business_artifacts_parent_idx
  on public.user_business_artifacts (parent_version_id)
  where parent_version_id is not null;

create index if not exists user_business_artifacts_locked_idx
  on public.user_business_artifacts (user_id, artifact_key, is_locked)
  where is_locked = true;
