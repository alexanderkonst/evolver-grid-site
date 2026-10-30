-- PROPOSED, NOT APPLIED (issue #241, Sasha 2026-10-30). Review before moving to supabase/migrations/.
--
-- One generic monthly record per player metric: (profile, metric key, month, value).
-- Level (mean of the 8 QoL domains) is the first metric; new metrics are new metric_key values,
-- with no schema or UI change. Today the game derives the monthly level from qol_snapshots
-- (src/lib/playerMetrics.ts); once this table exists only loadMetricRows changes.
--
-- Private to the player: RLS lets a user read and write only their own rows. No public view,
-- no cross-player reads, nothing to rank by.

create table if not exists public.player_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.game_profiles(id) on delete cascade,
  metric_key text not null check (metric_key ~ '^[a-z][a-z0-9_]{1,40}$'),
  month date not null check (extract(day from month) = 1), -- first day of the calendar month
  value numeric not null,
  source text,                       -- e.g. 'qol_snapshots:<id>'
  measured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (profile_id, metric_key, month)  -- one value per metric per month; re-measuring updates it
);

create index if not exists player_metric_snapshots_profile_metric_month
  on public.player_metric_snapshots (profile_id, metric_key, month desc);

alter table public.player_metric_snapshots enable row level security;

create policy "own metric snapshots: read" on public.player_metric_snapshots
  for select using (profile_id in (select id from public.game_profiles where user_id = auth.uid()));
create policy "own metric snapshots: insert" on public.player_metric_snapshots
  for insert with check (profile_id in (select id from public.game_profiles where user_id = auth.uid()));
create policy "own metric snapshots: update" on public.player_metric_snapshots
  for update using (profile_id in (select id from public.game_profiles where user_id = auth.uid()));

-- Backfill level from existing QoL snapshots (newest per month):
-- insert into public.player_metric_snapshots (profile_id, metric_key, month, value, source, measured_at)
-- select distinct on (profile_id, date_trunc('month', created_at))
--   profile_id, 'level', date_trunc('month', created_at)::date,
--   round(((wealth_stage + health_stage + happiness_stage + love_relationships_stage + impact_stage
--          + growth_stage + social_ties_stage + home_stage) / 8.0)::numeric, 1),
--   'qol_snapshots:' || id, created_at
-- from public.qol_snapshots
-- where wealth_stage is not null and health_stage is not null and happiness_stage is not null
--   and love_relationships_stage is not null and impact_stage is not null and growth_stage is not null
--   and social_ties_stage is not null and home_stage is not null
-- order by profile_id, date_trunc('month', created_at), created_at desc
-- on conflict (profile_id, metric_key, month) do nothing;
