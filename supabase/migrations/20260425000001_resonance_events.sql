-- Day 51 (Sasha 2026-04-25): unified resonance_events table.
--
-- Until now, resonance ratings were either saved to two columns on
-- zog_snapshots (appleseed + excalibur) or kept in React Context only
-- (the four product-builder ratings: icp, pain, tp, landing).
--
-- This table unifies all of them so any future reveal-with-rating in
-- the funnel — including per-founder UBB artifact ratings — writes to
-- the same place. New artifact_kinds add zero schema work.
--
-- Schema invariants:
--   - Append-only telemetry. Never UPDATE; never DELETE except by retention policy.
--   - Anonymous visitors allowed (profile_id and user_id both nullable).
--   - The actual rendered message (`message_seen`) is captured because
--     per-founder matrices differ from MASTER_MATRIX — without this we
--     can't reconstruct what the user saw at the moment of the rating.

create table if not exists public.resonance_events (
  id              uuid primary key default gen_random_uuid(),

  -- Identity (both nullable — anonymous visitors are first-class)
  profile_id      uuid,
  user_id         uuid,
  client_session_id text,

  -- What was rated
  artifact_kind   text not null,           -- 'appleseed' | 'excalibur' | 'icp' | 'pain' | 'tp' | 'landing' | any UBB ArtifactKey
  artifact_id     uuid,                    -- optional FK-by-convention to source row (zog_snapshots.id, user_business_artifacts.id, etc.)

  -- The rating itself
  rating          smallint not null check (rating between 1 and 10),
  tier            text not null check (tier in ('resonant', 'partial', 'off')),

  -- The reveal that was shown back (Specificity Loop matrix output)
  message_seen    text,                    -- the actual matrix message rendered to the user
  matrix_source   text not null default 'master'
                  check (matrix_source in ('master', 'founder_override', 'explicit_override')),
  matrix_version  text,                    -- e.g. 'master_v2', 'founder_v1.3'

  -- Free-form context (optional; never required for inserts)
  context_json    jsonb,

  created_at      timestamptz not null default now()
);

-- Indexes for the common access patterns
create index if not exists idx_resonance_events_profile_kind_created
  on public.resonance_events (profile_id, artifact_kind, created_at desc);

create index if not exists idx_resonance_events_user_created
  on public.resonance_events (user_id, created_at desc);

create index if not exists idx_resonance_events_kind_tier
  on public.resonance_events (artifact_kind, tier);

create index if not exists idx_resonance_events_created
  on public.resonance_events (created_at desc);

-- Row-level security
alter table public.resonance_events enable row level security;

-- Anyone (including anonymous) can insert. The client picks
-- `client_session_id` itself; profile_id / user_id are populated
-- when available. We do NOT enforce ownership on insert because the
-- table is write-only telemetry from the user's POV.
create policy resonance_events_insert_any
  on public.resonance_events
  for insert
  with check (true);

-- A user can read only their own events. service_role bypasses RLS
-- as usual and is the canonical reader for analytics.
create policy resonance_events_select_own
  on public.resonance_events
  for select
  using (
    auth.uid() is not null
    and (user_id = auth.uid() or profile_id = auth.uid())
  );

comment on table public.resonance_events is
  'Day 51 (2026-04-25): unified telemetry for the Specificity Loop. Every reveal-with-rating in the funnel (ZoG, product-builder, UBB artifacts, future surfaces) writes one row here. Append-only.';
