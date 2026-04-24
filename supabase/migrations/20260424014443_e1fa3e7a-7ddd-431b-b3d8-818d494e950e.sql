-- =====================================================================
-- Migration 1: Extend user_business_artifacts for UBB v2.0 versioning
-- =====================================================================

alter table public.user_business_artifacts
  drop constraint if exists user_business_artifacts_artifact_key_check;

alter table public.user_business_artifacts
  drop constraint if exists user_business_artifacts_step_number_check;
alter table public.user_business_artifacts
  add constraint user_business_artifacts_step_number_check
    check (step_number between 1 and 18);

alter table public.user_business_artifacts
  add column if not exists content_json jsonb;

alter table public.user_business_artifacts
  add column if not exists specificity_score numeric(3,1)
    check (specificity_score is null or (specificity_score >= 0 and specificity_score <= 10));

update public.user_business_artifacts
  set specificity_score = precision_score
  where specificity_score is null and precision_score is not null;

alter table public.user_business_artifacts
  add column if not exists parent_version_id uuid
    references public.user_business_artifacts(id) on delete set null,
  add column if not exists roast_findings jsonb,
  add column if not exists what_changed text,
  add column if not exists is_locked boolean not null default false;

create index if not exists user_business_artifacts_latest_idx
  on public.user_business_artifacts (user_id, artifact_key, created_at desc);

create index if not exists user_business_artifacts_parent_idx
  on public.user_business_artifacts (parent_version_id)
  where parent_version_id is not null;

create index if not exists user_business_artifacts_locked_idx
  on public.user_business_artifacts (user_id, artifact_key, is_locked)
  where is_locked = true;

-- =====================================================================
-- Migration 2: artifact_improvements (append-only audit log)
-- =====================================================================

create table if not exists public.artifact_improvements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artifact_key text not null,
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
  model_used text not null default 'openai/gpt-5.2',
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

-- =====================================================================
-- Migration 3: unique_business_dossiers (published Dossiers + Landing Pages)
-- =====================================================================

create table if not exists public.unique_business_dossiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  title text not null,
  artifact_snapshot jsonb not null,
  specificity_avg numeric(3,1) not null,
  landing_page_version text,
  landing_page_rendered_html text,
  dossier_rendered_html text,
  is_live boolean not null default true,
  views integer not null default 0,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug)
);

create index if not exists unique_business_dossiers_user_idx
  on public.unique_business_dossiers (user_id, published_at desc);

create index if not exists unique_business_dossiers_live_slug_idx
  on public.unique_business_dossiers (slug)
  where is_live = true;

drop trigger if exists set_timestamp on public.unique_business_dossiers;
create trigger set_timestamp
  before update on public.unique_business_dossiers
  for each row execute function public.touch_updated_at();

alter table public.unique_business_dossiers enable row level security;

drop policy if exists "public view live dossiers" on public.unique_business_dossiers;
create policy "public view live dossiers"
  on public.unique_business_dossiers for select
  using (is_live = true);

drop policy if exists "users insert own dossiers" on public.unique_business_dossiers;
create policy "users insert own dossiers"
  on public.unique_business_dossiers for insert
  with check (auth.uid() = user_id);

drop policy if exists "users update own dossiers" on public.unique_business_dossiers;
create policy "users update own dossiers"
  on public.unique_business_dossiers for update
  using (auth.uid() = user_id);

drop policy if exists "users delete own dossiers" on public.unique_business_dossiers;
create policy "users delete own dossiers"
  on public.unique_business_dossiers for delete
  using (auth.uid() = user_id);

drop policy if exists "users see own dossiers" on public.unique_business_dossiers;
create policy "users see own dossiers"
  on public.unique_business_dossiers for select
  using (auth.uid() = user_id);