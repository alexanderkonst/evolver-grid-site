-- Unique Business Builder v2.0 — published Dossiers + Landing Pages.
--
-- A Dossier is the composed view of all 18 artifacts at a publish moment.
-- A Landing Page is one artifact (artifact_key='landing_page') cached at publish.
-- Both live in this one table — the lifecycle is one publish event per row.
--
-- Public routes serve from here:
--   /ubd/{slug}                    — the Dossier view
--   /ubl/{slug}-v{landing_page_version}  — the Landing Page public render

create table if not exists public.unique_business_dossiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  title text not null,

  -- Frozen snapshot: { artifact_key: { version, content, specificity } } for all 18
  artifact_snapshot jsonb not null,

  specificity_avg numeric(3,1) not null,

  -- Landing Page caching (per-publish)
  landing_page_version text,
  landing_page_rendered_html text,

  -- Full Dossier render (computed on publish, cached)
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

-- Auto-touch updated_at
drop trigger if exists set_timestamp on public.unique_business_dossiers;
create trigger set_timestamp
  before update on public.unique_business_dossiers
  for each row execute function public.touch_updated_at();

alter table public.unique_business_dossiers enable row level security;

-- Public: anyone can read live dossiers by slug
drop policy if exists "public view live dossiers" on public.unique_business_dossiers;
create policy "public view live dossiers"
  on public.unique_business_dossiers for select
  using (is_live = true);

-- Users: full CRUD on own dossiers
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
