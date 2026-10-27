-- WP-17: village particles.
--
-- After a module's Outro a signed-in player may leave one short line at that
-- place for whoever comes next (docs/02-strategy/game_of_being_you.md §15.4).
-- Not a review, not a feed: no reactions, no replies, no counts.
--
-- Sasha, 2026-10-27: NO anonymity. Every particle carries the player's real
-- name, real profile photo and uniqueness, and is visible to everyone, guests
-- included. The three identity fields are copied from the player's own profile
-- by a trigger at insert time, never taken from the client, so a particle can
-- neither be anonymous nor wear someone else's face. A player without a name
-- or a photo is refused (the app asks them to add one before posting).
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
  -- Filled from game_profiles by village_particles_fill_identity() on insert.
  display_name text not null,
  avatar_url text not null,
  uniqueness text,
  status text not null default 'visible',
  created_at timestamptz not null default now(),
  constraint village_particles_text_length check (char_length(text) between 3 and 140),
  constraint village_particles_place_key_length check (char_length(place_key) between 1 and 40),
  constraint village_particles_display_name_length check (char_length(display_name) between 1 and 120),
  constraint village_particles_avatar_url_check check (avatar_url ~ '^https://'),
  constraint village_particles_status_check check (status in ('visible', 'hidden')),
  constraint village_particles_one_per_place unique (user_id, place_key)
);

create index if not exists village_particles_place_visible_idx
  on public.village_particles (place_key, created_at desc)
  where status = 'visible';

-- Copy the player's real identity onto the particle. Raises when the profile
-- has no name or no photo yet; the app reads these two messages.
create or replace function public.village_particles_fill_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p record;
  v_name text;
  v_unique text;
begin
  select gp.first_name, gp.last_name, gp.avatar_url, gp.last_zog_snapshot_id
    into p
    from public.game_profiles gp
   where gp.user_id = new.user_id
   order by gp.created_at asc
   limit 1;

  v_name := nullif(btrim(concat_ws(' ', p.first_name, p.last_name)), '');
  if v_name is null then
    raise exception 'particle_needs_name' using errcode = 'P0001';
  end if;
  if p.avatar_url is null or btrim(p.avatar_url) = '' then
    raise exception 'particle_needs_photo' using errcode = 'P0001';
  end if;

  if p.last_zog_snapshot_id is not null then
    select nullif(btrim(coalesce(z.appleseed_data #>> '{vibrationalKey,name}', z.archetype_title)), '')
      into v_unique
      from public.zog_snapshots z
     where z.id = p.last_zog_snapshot_id;
  end if;

  new.display_name := left(v_name, 120);
  new.avatar_url := btrim(p.avatar_url);
  new.uniqueness := left(v_unique, 120);
  return new;
end;
$$;

drop trigger if exists village_particles_fill_identity on public.village_particles;
create trigger village_particles_fill_identity
  before insert on public.village_particles
  for each row execute function public.village_particles_fill_identity();

alter table public.village_particles enable row level security;

-- Everyone, guests included, reads what is visible.
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
-- Column-level insert grant: a client sends only who, where and what. Name,
-- photo and uniqueness come from the trigger; id, status and created_at from
-- the defaults.
revoke all on public.village_particles from anon, authenticated;
grant select on public.village_particles to anon, authenticated;
grant insert (user_id, place_key, text) on public.village_particles to authenticated;
