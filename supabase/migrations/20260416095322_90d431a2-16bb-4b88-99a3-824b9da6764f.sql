create table if not exists public.anonymous_genius_results (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  result_payload jsonb not null,
  assessment_version text not null default 'v1',
  claimed_user_id uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists anonymous_genius_results_email_lower_idx
  on public.anonymous_genius_results (lower(email))
  where claimed_at is null;

alter table public.anonymous_genius_results enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists anonymous_genius_results_set_updated_at
  on public.anonymous_genius_results;

create trigger anonymous_genius_results_set_updated_at
  before update on public.anonymous_genius_results
  for each row execute function public.set_updated_at();

create table if not exists public.anonymous_genius_rate_limits (
  email_lower text not null,
  window_start timestamptz not null,
  hit_count integer not null default 1,
  primary key (email_lower, window_start)
);

create index if not exists anonymous_genius_rate_limits_window_idx
  on public.anonymous_genius_rate_limits (window_start);

alter table public.anonymous_genius_rate_limits enable row level security;