-- PROPOSED ONLY (2026-10-30). Not in supabase/migrations. Sasha reviews before anything is applied.
-- Design: docs/02-strategy/game_of_being_you.md §14.12a (Share card: «Do you see me this way too?»).
--
-- (a) The public projection returns the player's own gift sentence, so the visitor sees the line the player sent.
-- (b) player_reflections: a visitor's answer to the card's question, readable only by the player.
-- The UI degrades while (a) and (b) are missing: the public card falls back to the Top Talent archetype and shows no answer buttons.

-- (a) Add gift_line to get_public_profile_by_username.
-- Return type changes, so the function is dropped and recreated with the SAME body as
-- 20260722224112_*.sql plus one column. Copy that body verbatim when applying; only the
-- added column is shown here:
--
--   returns table ( ...existing columns..., gift_line text )
--   ...
--   case when coalesce(gp.visibility, 'full') <> 'hidden' then (
--     -- J6 `uniqueness` artifact -> content_json->>'sentence'; J7 `promise` -> content_json->>'promise_sentence'
--     -- (field map: src/modules/unique-business-builder/journeySlices.ts)
--     select nullif(btrim(case a.artifact_key when 'uniqueness' then a.content_json->>'sentence'
--                                             else a.content_json->>'promise_sentence' end), '')
--       from public.user_business_artifacts a
--      where a.user_id = gp.user_id
--        and a.artifact_key in ('uniqueness', 'promise')
--      order by (a.artifact_key = 'uniqueness') desc, a.updated_at desc
--      limit 1
--   ) else null end as gift_line
--
-- Keep the existing grants: execute to anon, authenticated.

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

-- Visitors (guest or signed in) write only through this function, which checks the page is public.
create or replace function public.leave_reflection(
  p_username text, p_answer text, p_line text, p_visitor_name text
) returns void
language plpgsql security definer set search_path = public as $$
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
