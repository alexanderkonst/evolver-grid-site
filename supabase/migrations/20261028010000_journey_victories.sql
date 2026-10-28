-- WP-5: journey victories.
--
-- Every Journey module ends in an Outro (docs/02-strategy/game_of_being_you.md
-- §14.4). The Outro awards the step's badge (§14.12) and asks one question:
-- «How much did this resonate, 1–10?». The answer is stored here: one row per
-- player per step. Private: a player reads and writes only their own rows.
--
-- The badge itself is not stored. It is derived from the step's own saved
-- result (zog_snapshots, mission, qol_snapshots, user_assets), so nothing is
-- typed twice. This row records that the player reached the Outro and how it
-- landed.
--
-- step_id is a Journey step id (src/data/journeySequence.ts: find-top-talent,
-- discover-mission, assess-qol, map-assets, and later steps). It is not an
-- enum in the database, so new steps (WP-9, WP-11) need no migration.
--
-- Consent: Sasha approved new tables for particles and choices (2026-10-27
-- 16:00). This table is covered by inference and is being confirmed with him.
-- Do not apply until he confirms.
--
-- The UI degrades gracefully while this table does not exist: the Outro shows
-- the same screen without the rating row.

create table if not exists public.journey_victories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  step_id text not null,
  rating smallint not null,
  created_at timestamptz not null default now(),
  constraint journey_victories_rating_range check (rating between 1 and 10),
  constraint journey_victories_step_id_length check (char_length(step_id) between 1 and 40),
  constraint journey_victories_one_per_step unique (user_id, step_id)
);

alter table public.journey_victories enable row level security;

create policy "Players read their own victories"
  on public.journey_victories
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Players record their own victories"
  on public.journey_victories
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- No update/delete policies: the first answer stands. Guests have no row.
-- Column-level insert grant: a client sends who, which step and the rating;
-- id and created_at come from the defaults.
revoke all on public.journey_victories from anon, authenticated;
grant select on public.journey_victories to authenticated;
grant insert (user_id, step_id, rating) on public.journey_victories to authenticated;
