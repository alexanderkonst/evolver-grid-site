-- 2026-11-21: Forgiving streak on Your House (spec row A13, issue #368).
--
-- One row per real act a player names ("Day 12: wrote to a client"): today's 5-minute practice,
-- a Journey step, or the reveal's micro-quest. The streak and the freezes are NOT stored: they
-- are derived from these rows by the pure function in src/lib/streak.ts.
--
-- Additive only: one new table, nothing dropped or rewritten.
-- Owner-only: the player reads, writes and removes only their own rows. No public read.
-- Deploy: Hark applies this after Sasha's yes. Until then the UI degrades quietly: the
-- "Name today's act" input and the streak card stay hidden (a missing table counts as "no streak").
--
-- act_date is the player's local calendar day (sent by the client). One named act per player per
-- day: a second act on the same day does not extend the streak further, so it is not stored.

create table if not exists public.streak_acts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  act_date   date not null,
  source     text not null,
  text       text not null,
  created_at timestamptz not null default now(),
  constraint streak_acts_source_check check (source in ('practice', 'journey', 'micro_quest')),
  constraint streak_acts_text_length check (char_length(btrim(text)) between 1 and 140),
  constraint streak_acts_one_per_day unique (user_id, act_date)
);

create index if not exists streak_acts_user_date_idx on public.streak_acts (user_id, act_date desc);

alter table public.streak_acts enable row level security;

drop policy if exists "streak_acts_select_own" on public.streak_acts;
create policy "streak_acts_select_own" on public.streak_acts
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "streak_acts_insert_own" on public.streak_acts;
create policy "streak_acts_insert_own" on public.streak_acts
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "streak_acts_delete_own" on public.streak_acts;
create policy "streak_acts_delete_own" on public.streak_acts
  for delete to authenticated using (user_id = auth.uid());
