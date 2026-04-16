-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  ANONYMOUS GENIUS RESULTS — bridge between anonymous ZoG run      ║
-- ║  and the authenticated account created via magic-link claim.     ║
-- ║  Created: April 16, 2026                                         ║
-- ╚═══════════════════════════════════════════════════════════════════╝

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

-- Fast lookup by (lowercased) email for the unclaimed rows the claim flow reads.
create index if not exists anonymous_genius_results_email_lower_idx
  on public.anonymous_genius_results (lower(email))
  where claimed_at is null;

-- RLS on, no policies = no direct client access. All I/O flows through
-- the save-anonymous-zog / claim-anonymous-zog edge functions (service role).
alter table public.anonymous_genius_results enable row level security;

-- updated_at auto-bump trigger. set_updated_at() may already exist from other
-- migrations — create it only if missing to stay idempotent.
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

-- Rate-limit bucket table for save-anonymous-zog (simple per-email window).
-- Kept minimal — one row per (lowercased email, window start).
create table if not exists public.anonymous_genius_rate_limits (
  email_lower text not null,
  window_start timestamptz not null,
  hit_count integer not null default 1,
  primary key (email_lower, window_start)
);

create index if not exists anonymous_genius_rate_limits_window_idx
  on public.anonymous_genius_rate_limits (window_start);

alter table public.anonymous_genius_rate_limits enable row level security;
