-- Your AI server harness (docs/specs/ai-familiar/ai-familiar_tracker.md §20.2 a, d, g; §20.4 step 2).
-- player_cards: the compact profile that rides in every turn, versioned (each change = new row).
-- player_traces: one row per Act (button tap / answer); the next turn's memory.
-- your_ai_daily_usage: per-player daily turn counter behind the server-side cap.
-- Privacy (§20.2 g): the player can read and delete their own card history and traces.

create table public.player_cards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null,
  card_version integer not null check (card_version >= 1),
  card         jsonb not null,
  content_hash text not null,
  created_at   timestamptz not null default now(),
  unique (user_id, card_version)
);
create index player_cards_user_latest_idx on public.player_cards (user_id, card_version desc);

grant select, delete on public.player_cards to authenticated;
grant all on public.player_cards to service_role;
revoke all on public.player_cards from anon;
revoke insert, update on public.player_cards from authenticated;
alter table public.player_cards enable row level security;

create policy player_cards_owner_select on public.player_cards
  for select to authenticated using (user_id = auth.uid());
create policy player_cards_owner_delete on public.player_cards
  for delete to authenticated using (user_id = auth.uid());

create table public.player_traces (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  at         timestamptz not null default now(),
  kind       text not null check (kind in ('action', 'route', 'practice', 'technology', 'answer')),
  payload_id text not null check (char_length(payload_id) between 1 and 80),
  outcome    text not null default 'tapped' check (char_length(outcome) between 1 and 40),
  surface    text not null default 'your-ai' check (char_length(surface) between 1 and 40)
);
create index player_traces_user_at_idx on public.player_traces (user_id, at desc);

grant select, insert, delete on public.player_traces to authenticated;
grant all on public.player_traces to service_role;
revoke all on public.player_traces from anon;
revoke update on public.player_traces from authenticated;
alter table public.player_traces enable row level security;

create policy player_traces_owner_select on public.player_traces
  for select to authenticated using (user_id = auth.uid());
create policy player_traces_owner_insert on public.player_traces
  for insert to authenticated with check (user_id = auth.uid());
create policy player_traces_owner_delete on public.player_traces
  for delete to authenticated using (user_id = auth.uid());

create table public.your_ai_daily_usage (
  user_id uuid not null,
  day     date not null,
  turns   integer not null default 0 check (turns >= 0),
  primary key (user_id, day)
);
revoke all on public.your_ai_daily_usage from anon, authenticated;
grant all on public.your_ai_daily_usage to service_role;
alter table public.your_ai_daily_usage enable row level security;

-- Atomically take one turn of today's (UTC) cap. Returns the new count, or -1 when the cap is
-- already used up. Called only by the your-ai-turn edge function (service role).
create or replace function public.your_ai_take_turn(p_user uuid, p_cap integer)
returns integer
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_turns integer;
begin
  insert into public.your_ai_daily_usage as u (user_id, day, turns)
  values (p_user, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day) do update set turns = u.turns + 1
    where u.turns < p_cap
  returning u.turns into v_turns;
  return coalesce(v_turns, -1);
end $$;

revoke all on function public.your_ai_take_turn(uuid, integer) from public, anon, authenticated;
grant execute on function public.your_ai_take_turn(uuid, integer) to service_role;