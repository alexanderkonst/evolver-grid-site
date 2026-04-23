-- Unique Business Builder v2.0 — artifact_improvements audit log.
--
-- Captures every Improve attempt (accept / reject / diminishing returns).
-- Feeds analytics: which artifacts hit diminishing returns earliest, which
-- roast quadrants produce the biggest specificity jumps, etc.
--
-- One row per Improve event. Never deleted.

create table if not exists public.artifact_improvements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artifact_key text not null,

  -- Before/after artifact row references. NULL after_id means user rejected
  -- or model returned diminishing_returns (no new version written).
  artifact_before_id uuid references public.user_business_artifacts(id) on delete set null,
  artifact_after_id  uuid references public.user_business_artifacts(id) on delete set null,

  roast_findings jsonb not null,
  what_changed text,
  crystallized_action text,

  specificity_before numeric(3,1),
  specificity_after  numeric(3,1),
  specificity_delta  numeric(3,1),

  accepted boolean not null,
  diminishing_returns boolean not null default false,

  model_used text not null default 'google/gemini-2.5-flash',
  created_at timestamptz not null default now()
);

create index if not exists artifact_improvements_user_idx
  on public.artifact_improvements (user_id, created_at desc);

create index if not exists artifact_improvements_artifact_idx
  on public.artifact_improvements (user_id, artifact_key, created_at desc);

alter table public.artifact_improvements enable row level security;

drop policy if exists "select own improvements" on public.artifact_improvements;
create policy "select own improvements"
  on public.artifact_improvements for select
  using (auth.uid() = user_id);

drop policy if exists "insert own improvements" on public.artifact_improvements;
create policy "insert own improvements"
  on public.artifact_improvements for insert
  with check (auth.uid() = user_id);
-- No UPDATE / DELETE policies. Audit log is immutable.
