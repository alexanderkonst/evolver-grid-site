-- Game tables (Hark, 2026-10-27, under Sasha's delegation): particles, victories with 1–10 ratings,
-- module choices, sales events, and multiplayer presence settings.
-- Design: docs/02-strategy/game_of_being_you.md §14.8, §15. Consent for ratings, victories and sales: treated as given (2026-10-27).

-- 1. Particles (WP-17): never anonymous; identity copied from the player's profile by trigger.
create table if not exists public.village_particles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  place_key text not null,
  text text not null,
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
  on public.village_particles (place_key, created_at desc) where status = 'visible';

create or replace function public.village_particles_fill_identity()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  p record;
  v_name text;
  v_unique text;
begin
  select gp.first_name, gp.last_name, gp.avatar_url, gp.last_zog_snapshot_id
    into p from public.game_profiles gp
   where gp.user_id = new.user_id order by gp.created_at asc limit 1;
  v_name := nullif(btrim(concat_ws(' ', p.first_name, p.last_name)), '');
  if v_name is null then
    raise exception 'particle_needs_name' using errcode = 'P0001';
  end if;
  if p.avatar_url is null or btrim(p.avatar_url) = '' then
    raise exception 'particle_needs_photo' using errcode = 'P0001';
  end if;
  if p.last_zog_snapshot_id is not null then
    select nullif(btrim(coalesce(z.appleseed_data #>> '{vibrationalKey,name}', z.archetype_title)), '')
      into v_unique from public.zog_snapshots z where z.id = p.last_zog_snapshot_id;
  end if;
  new.display_name := left(v_name, 120);
  new.avatar_url := btrim(p.avatar_url);
  new.uniqueness := left(v_unique, 120);
  return new;
end;
$$;
drop trigger if exists village_particles_fill_identity on public.village_particles;
create trigger village_particles_fill_identity before insert on public.village_particles
  for each row execute function public.village_particles_fill_identity();

alter table public.village_particles enable row level security;
drop policy if exists "Visible particles are readable by everyone" on public.village_particles;
create policy "Visible particles are readable by everyone" on public.village_particles
  for select to anon, authenticated using (status = 'visible');
drop policy if exists "Players leave their own particle" on public.village_particles;
create policy "Players leave their own particle" on public.village_particles
  for insert to authenticated with check (auth.uid() = user_id and status = 'visible');
revoke all on public.village_particles from anon, authenticated;
grant select on public.village_particles to anon, authenticated;
grant insert (user_id, place_key, text) on public.village_particles to authenticated;

-- 2. Victories with the 1–10 rating (WP-5 Outro, WP-11 real-world victories). Private.
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
drop policy if exists "Players read their own victories" on public.journey_victories;
create policy "Players read their own victories" on public.journey_victories
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Players record their own victories" on public.journey_victories;
create policy "Players record their own victories" on public.journey_victories
  for insert to authenticated with check (auth.uid() = user_id);
revoke all on public.journey_victories from anon, authenticated;
grant select on public.journey_victories to authenticated;
grant insert (user_id, step_id, rating) on public.journey_victories to authenticated;

-- 3. Module choices (WP-19 real-choice ending). Private; the follow-up answer may be updated.
create table if not exists public.module_choices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  step_id text not null,
  choice_text text not null,
  followup text,
  followup_at timestamptz,
  created_at timestamptz not null default now(),
  constraint module_choices_text_length check (char_length(choice_text) between 1 and 280),
  constraint module_choices_step_id_length check (char_length(step_id) between 1 and 40),
  constraint module_choices_followup_check check (followup is null or followup in ('yes', 'partly', 'not_yet')),
  constraint module_choices_one_per_step unique (user_id, step_id)
);
alter table public.module_choices enable row level security;
drop policy if exists "Players read their own choices" on public.module_choices;
create policy "Players read their own choices" on public.module_choices
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Players record their own choices" on public.module_choices;
create policy "Players record their own choices" on public.module_choices
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players answer their own follow-up" on public.module_choices;
create policy "Players answer their own follow-up" on public.module_choices
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
revoke all on public.module_choices from anon, authenticated;
grant select on public.module_choices to authenticated;
grant insert (user_id, step_id, choice_text) on public.module_choices to authenticated;
grant update (followup, followup_at) on public.module_choices to authenticated;

-- 4. Sales events (WP-11 / WP-12: first sale, Town Hall). Written only by the service role
-- (Stripe webhook / edge function); the seller reads their own rows.
create table if not exists public.sales_events (
  id uuid primary key default gen_random_uuid(),
  seller_user_id uuid not null references auth.users (id) on delete cascade,
  source text not null,
  amount_cents integer,
  currency text,
  buyer_first_name text,
  offer_ref text,
  external_ref text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint sales_events_source_check check (source in ('stripe', 'self_report', 'local')),
  constraint sales_events_amount_check check (amount_cents is null or amount_cents >= 0),
  constraint sales_events_currency_check check (currency is null or char_length(currency) = 3),
  constraint sales_events_external_ref_unique unique (source, external_ref)
);
create index if not exists sales_events_seller_idx on public.sales_events (seller_user_id, occurred_at desc);
alter table public.sales_events enable row level security;
drop policy if exists "Sellers read their own sales" on public.sales_events;
create policy "Sellers read their own sales" on public.sales_events
  for select to authenticated using (auth.uid() = seller_user_id);
revoke all on public.sales_events from anon, authenticated;
grant select on public.sales_events to authenticated;
grant all on public.sales_events to service_role;

-- 5. Multiplayer presence settings (WP-21): presence on by default, name only by opt-in.
alter table public.game_profiles add column if not exists village_presence_on boolean not null default true;
alter table public.game_profiles add column if not exists village_show_name boolean not null default false;
