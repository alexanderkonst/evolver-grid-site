-- WP-17: village particles.
--
-- After a module's Outro a signed-in player may leave one short line at that
-- place for whoever comes next (docs/02-strategy/game_of_being_you.md §15.4).
-- Not a review, not a feed: no reactions, no replies, no counts.
--
-- Moderation v0 lives in two places: the client guard (src/lib/particleGuard.ts)
-- and the constraints below (length, one particle per player per place).
-- To hide a particle for now, run in SQL:
--   update public.village_particles set status = 'hidden' where id = '<id>';
--
-- The UI degrades gracefully while this table does not exist, so this file can
-- be applied after the UI merges.

create table if not exists public.village_particles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  place_key text not null,
  text text not null,
  first_name text,
  status text not null default 'visible',
  created_at timestamptz not null default now(),
  constraint village_particles_text_length check (char_length(text) between 3 and 140),
  constraint village_particles_place_key_length check (char_length(place_key) between 1 and 40),
  constraint village_particles_first_name_length check (first_name is null or char_length(first_name) between 1 and 40),
  constraint village_particles_status_check check (status in ('visible', 'hidden')),
  constraint village_particles_one_per_place unique (user_id, place_key)
);

create index if not exists village_particles_place_visible_idx
  on public.village_particles (place_key, created_at desc)
  where status = 'visible';

alter table public.village_particles enable row level security;

-- Guests and players read only what is visible.
create policy "Visible particles are readable by everyone"
  on public.village_particles
  for select
  to anon, authenticated
  using (status = 'visible');

-- A player may leave a particle only as themselves, and only visible ones.
create policy "Players leave their own particle"
  on public.village_particles
  for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'visible');

-- No update/delete policies: a particle stays until an admin hides it in SQL.
-- Column-level insert grant so a client can never set id, status or created_at.
revoke all on public.village_particles from anon, authenticated;
grant select on public.village_particles to anon, authenticated;
grant insert (user_id, place_key, text, first_name) on public.village_particles to authenticated;
