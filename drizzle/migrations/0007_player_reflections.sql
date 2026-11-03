-- Share card, part (b) only: player_reflections + RLS + leave_reflection RPC.
-- Source: docs/specs/share-card/share_card.proposed.sql, section (b), verbatim below.
-- Part (a) (gift_line on get_public_profile_by_username) is NOT applied here; it stays proposed.

-- (b) Reflections.
create table if not exists public.player_reflections (
  id uuid primary key default gen_random_uuid(),
  player_user_id uuid not null references auth.users (id) on delete cascade,
  visitor_user_id uuid references auth.users (id) on delete set null,
  visitor_name text not null,
  answer text not null,
  line text,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint player_reflections_answer_check check (answer in ('yes', 'partly', 'differently')),
  constraint player_reflections_name_length check (char_length(visitor_name) between 1 and 60),
  constraint player_reflections_line_length check (line is null or char_length(line) between 3 and 140)
);

create index if not exists player_reflections_player_idx
  on public.player_reflections (player_user_id, created_at desc);

alter table public.player_reflections enable row level security;

-- The player reads and marks read their own reflections. Nobody else reads them. No direct insert.
create policy player_reflections_owner_select on public.player_reflections
  for select using (player_user_id = auth.uid());
create policy player_reflections_owner_update on public.player_reflections
  for update using (player_user_id = auth.uid()) with check (player_user_id = auth.uid());

-- Defense in depth: no direct insert/delete for clients; the owner may only change read_at.
revoke insert, update, delete on public.player_reflections from anon, authenticated;
revoke select on public.player_reflections from anon;
grant update (read_at) on public.player_reflections to authenticated;

-- Visitors (guest or signed in) write only through this function, which checks the page is public.
create or replace function public.leave_reflection(
  p_username text, p_answer text, p_line text, p_visitor_name text
) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_player uuid;
  v_name text;
begin
  select gp.user_id into v_player
    from public.game_profiles gp
   where lower(gp.username) = lower(public.normalize_profile_username(p_username))
     and coalesce(gp.visibility, 'full') <> 'hidden'
     and coalesce(gp.profile_visibility, 'public') = 'public'
   limit 1;
  if v_player is null then raise exception 'reflection_profile_not_public' using errcode = 'P0001'; end if;
  if v_player = auth.uid() then raise exception 'reflection_own_page' using errcode = 'P0001'; end if;

  if auth.uid() is not null then
    select nullif(btrim(concat_ws(' ', gp.first_name, gp.last_name)), '') into v_name
      from public.game_profiles gp where gp.user_id = auth.uid() order by gp.created_at asc limit 1;
  end if;
  v_name := coalesce(v_name, nullif(btrim(p_visitor_name), ''));
  if v_name is null then raise exception 'reflection_needs_name' using errcode = 'P0001'; end if;
  if p_answer is null or p_answer not in ('yes', 'partly', 'differently') then
    raise exception 'reflection_bad_answer' using errcode = 'P0001';
  end if;

  -- One answer per signed-in visitor per player per day (guests: client guard + rate limit later).
  if auth.uid() is not null and exists (
    select 1 from public.player_reflections r
     where r.player_user_id = v_player and r.visitor_user_id = auth.uid()
       and r.created_at > now() - interval '1 day'
  ) then raise exception 'reflection_already_today' using errcode = 'P0001'; end if;

  insert into public.player_reflections (player_user_id, visitor_user_id, visitor_name, answer, line)
  values (v_player, auth.uid(), left(v_name, 60), p_answer, nullif(btrim(p_line), ''));
end $$;

revoke all on function public.leave_reflection(text, text, text, text) from public;
grant execute on function public.leave_reflection(text, text, text, text) to anon, authenticated;

-- Explicit grants (this project also has default grants; these keep the migration correct on a
-- plain Supabase project, where public-schema tables get no default privileges).
grant select on public.player_reflections to authenticated;
grant all on public.player_reflections to service_role;