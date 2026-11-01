-- Light a Window: village_windows + RLS + light_window / claim_window / lit_windows_count /
-- window_public, and the state-D backfill.
-- Source: docs/specs/cult/cult_spec.md §4.6 (table verbatim, except user_id gets
-- ON DELETE SET NULL so deleting an account never fails on its window; the window then
-- reads like a guest light).
-- Founder rule (Sasha): alexanderkonst@gmail.com is window #1; everyone else follows by the
-- date of their first saved zog snapshot.

create table public.village_windows (
  n            bigint generated always as identity primary key,  -- the window number
  token        uuid not null default gen_random_uuid() unique,  -- ref + device claim
  user_id      uuid references auth.users(id) on delete set null, -- null for a guest light
  display_name text check (char_length(display_name) <= 40),
  top_talent   text check (char_length(top_talent) <= 120),
  lit_at       timestamptz not null default now(),
  moon_phase   text not null check (moon_phase in ('new','waxing','full','waning')),
  released     boolean not null default false
);

create index village_windows_user_idx on public.village_windows (user_id) where user_id is not null;

-- No direct access; functions only.
revoke all on public.village_windows from anon, authenticated;
grant all on public.village_windows to service_role;
alter table public.village_windows enable row level security;

-- Rate-limit ledger for light_window (3 new lights per IP hash per day). Only a hash is kept.
create table public.village_window_lights (
  id      bigint generated always as identity primary key,
  ip_hash text not null,
  lit_at  timestamptz not null default now()
);
create index village_window_lights_ip_idx on public.village_window_lights (ip_hash, lit_at desc);
revoke all on public.village_window_lights from anon, authenticated;
grant all on public.village_window_lights to service_role;
alter table public.village_window_lights enable row level security;

-- light_window: idempotent per token and per user (state E); a new light costs one slot of
-- the IP-hash rate limit.
create or replace function public.light_window(p_top_talent text, p_phase text, p_token uuid default null)
returns table (n bigint, token uuid, lit_at timestamptz, moon_phase text)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_uid uuid := auth.uid();
  v_row public.village_windows%rowtype;
  v_talent text := nullif(left(btrim(coalesce(p_top_talent, '')), 120), '');
  v_ip text;
  v_hash text;
begin
  if p_phase is null or p_phase not in ('new', 'waxing', 'full', 'waning') then
    raise exception 'window_bad_phase' using errcode = 'P0001';
  end if;

  if v_uid is not null then
    select * into v_row from public.village_windows w
     where w.user_id = v_uid and not w.released order by w.n asc limit 1;
    if found then
      return query select v_row.n, v_row.token, v_row.lit_at, v_row.moon_phase;
      return;
    end if;
  end if;

  if p_token is not null then
    select * into v_row from public.village_windows w
     where w.token = p_token and not w.released
       and (w.user_id is null or w.user_id = v_uid);
    if found then
      return query select v_row.n, v_row.token, v_row.lit_at, v_row.moon_phase;
      return;
    end if;
  end if;

  begin
    v_ip := nullif(btrim(split_part(
      coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1)), '');
  exception when others then
    v_ip := null;
  end;
  if v_ip is not null then
    v_hash := encode(sha256(convert_to('village-window:' || v_ip, 'UTF8')), 'hex');
    if (select count(*) from public.village_window_lights l
         where l.ip_hash = v_hash and l.lit_at > now() - interval '1 day') >= 3 then
      raise exception 'window_rate_limited' using errcode = 'P0001';
    end if;
    insert into public.village_window_lights (ip_hash) values (v_hash);
  end if;

  insert into public.village_windows (user_id, top_talent, moon_phase)
  values (v_uid, v_talent, p_phase)
  returning * into v_row;

  return query select v_row.n, v_row.token, v_row.lit_at, v_row.moon_phase;
end $$;

-- claim_window: on sign-in, attach the device's window to the player, keep the lowest number,
-- release the others (state F).
create or replace function public.claim_window(p_token uuid)
returns table (n bigint, token uuid, lit_at timestamptz, moon_phase text)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_uid uuid := auth.uid();
  v_row public.village_windows%rowtype;
begin
  if v_uid is null then
    raise exception 'window_needs_sign_in' using errcode = 'P0001';
  end if;

  select * into v_row from public.village_windows w where w.token = p_token and not w.released;
  if found then
    if v_row.user_id is not null and v_row.user_id <> v_uid then
      raise exception 'window_taken' using errcode = 'P0001';
    end if;
    update public.village_windows w set user_id = v_uid where w.n = v_row.n;
  end if;

  select * into v_row from public.village_windows w
   where w.user_id = v_uid and not w.released order by w.n asc limit 1;
  if not found then
    raise exception 'window_not_found' using errcode = 'P0001';
  end if;

  update public.village_windows w set released = true
   where w.user_id = v_uid and not w.released and w.n <> v_row.n;

  return query select v_row.n, v_row.token, v_row.lit_at, v_row.moon_phase;
end $$;

-- lit_windows_count: public, counts windows not released.
create or replace function public.lit_windows_count()
returns bigint
language sql stable security definer set search_path = public, pg_temp as $$
  select count(*) from public.village_windows where not released;
$$;

-- window_public: the public projection for /w/n. Never user_id, token, email or level.
create or replace function public.window_public(p_n bigint)
returns table (n bigint, display_name text, top_talent text, lit_at timestamptz, moon_phase text)
language sql stable security definer set search_path = public, pg_temp as $$
  select w.n, w.display_name, w.top_talent, w.lit_at, w.moon_phase
    from public.village_windows w
   where w.n = p_n and not w.released;
$$;

revoke all on function public.light_window(text, text, uuid) from public, anon, authenticated;
revoke all on function public.claim_window(uuid) from public, anon, authenticated;
revoke all on function public.lit_windows_count() from public, anon, authenticated;
revoke all on function public.window_public(bigint) from public, anon, authenticated;
grant execute on function public.light_window(text, text, uuid) to anon, authenticated;
grant execute on function public.claim_window(uuid) to authenticated;
grant execute on function public.lit_windows_count() to anon, authenticated;
grant execute on function public.window_public(bigint) to anon, authenticated;

-- Backfill (state D): one window per player with a saved top talent. Number = founder first,
-- then by the date of the player's first saved zog snapshot. lit_at and moon_phase come from
-- that first snapshot; top_talent is the player's current one (latest snapshot), falling back
-- to the first. Moon phase: mean synodic month from the 2000-01-06 18:14 UTC new moon, cut
-- into the app's eight 45° windows (0 = new, 1-3 = waxing, 4 = full, 5-7 = waning).
with snaps as (
  select gp.user_id, z.created_at,
         nullif(btrim(coalesce(z.appleseed_data #>> '{vibrationalKey,name}', z.archetype_title)), '') as talent,
         row_number() over (partition by gp.user_id order by z.created_at asc) as rn_first,
         row_number() over (partition by gp.user_id order by z.created_at desc) as rn_last
    from public.zog_snapshots z
    join public.game_profiles gp on gp.id = z.profile_id
   where gp.user_id is not null
),
players as (
  select f.user_id,
         f.created_at as first_at,
         coalesce(l.talent, f.talent) as talent
    from snaps f
    join snaps l on l.user_id = f.user_id and l.rn_last = 1
   where f.rn_first = 1
),
ordered as (
  select p.*,
         row_number() over (
           order by (lower(u.email) = 'alexanderkonst@gmail.com') desc nulls last, p.first_at asc, p.user_id
         ) as num,
         floor(8 * (
           ((extract(epoch from (p.first_at - timestamptz '2000-01-06 18:14:00+00')) / 86400.0)
             / 29.530588853)
           - floor((extract(epoch from (p.first_at - timestamptz '2000-01-06 18:14:00+00')) / 86400.0)
             / 29.530588853)
         ))::int as seg
    from players p
    left join auth.users u on u.id = p.user_id
)
insert into public.village_windows (n, user_id, top_talent, lit_at, moon_phase)
overriding system value
select o.num, o.user_id, left(o.talent, 120), o.first_at,
       case when o.seg = 0 then 'new' when o.seg between 1 and 3 then 'waxing'
            when o.seg = 4 then 'full' else 'waning' end
  from ordered o
 order by o.num;

select setval(
  pg_get_serial_sequence('public.village_windows', 'n'),
  greatest(coalesce((select max(n) from public.village_windows), 0), 1),
  (select count(*) > 0 from public.village_windows)
);