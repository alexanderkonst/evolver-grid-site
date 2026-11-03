-- Reconstructed from the live schema 2026-11-02: player_reflections (share_card part b),
-- village_windows (cult §4.6), Your AI harness (player_cards, player_traces, daily cap),
-- pgvector knowledge notes (public knowledge-graph subset). Already applied; idempotent-ish.
create extension if not exists vector with schema extensions;

create table if not exists public.knowledge_note_chunks (
  id uuid not null default gen_random_uuid(),
  note_id uuid not null,
  chunk_index integer not null,
  content text not null,
  embedding extensions.vector not null
);
create table if not exists public.knowledge_note_links (
  from_note_id uuid not null,
  to_title_key text not null
);
create table if not exists public.knowledge_notes (
  id uuid not null default gen_random_uuid(),
  path text not null,
  title text not null,
  title_key text not null,
  body text not null,
  content_hash text not null,
  is_public boolean not null default true,
  source text not null default 'knowledgegraph'::text,
  synced_at timestamp with time zone not null default now()
);
create table if not exists public.player_cards (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  card_version integer not null,
  card jsonb not null,
  content_hash text not null,
  created_at timestamp with time zone not null default now()
);
create table if not exists public.player_reflections (
  id uuid not null default gen_random_uuid(),
  player_user_id uuid not null,
  visitor_user_id uuid,
  visitor_name text not null,
  answer text not null,
  line text,
  created_at timestamp with time zone not null default now(),
  read_at timestamp with time zone
);
create table if not exists public.player_traces (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  at timestamp with time zone not null default now(),
  kind text not null,
  payload_id text not null,
  outcome text not null default 'tapped'::text,
  surface text not null default 'your-ai'::text
);
create table if not exists public.village_window_lights (
  id bigint not null,
  ip_hash text not null,
  lit_at timestamp with time zone not null default now()
);
create table if not exists public.village_windows (
  n bigint not null,
  token uuid not null default gen_random_uuid(),
  user_id uuid,
  display_name text,
  top_talent text,
  lit_at timestamp with time zone not null default now(),
  moon_phase text not null,
  released boolean not null default false
);
create table if not exists public.your_ai_daily_usage (
  user_id uuid not null,
  day date not null,
  turns integer not null default 0
);
alter table public.knowledge_note_chunks add constraint knowledge_note_chunks_note_id_fkey FOREIGN KEY (note_id) REFERENCES knowledge_notes(id) ON DELETE CASCADE;
alter table public.knowledge_note_chunks add constraint knowledge_note_chunks_note_id_chunk_index_key UNIQUE (note_id, chunk_index);
alter table public.knowledge_note_chunks add constraint knowledge_note_chunks_pkey PRIMARY KEY (id);
alter table public.knowledge_note_chunks add constraint knowledge_note_chunks_chunk_index_check CHECK ((chunk_index >= 0));
alter table public.knowledge_note_links add constraint knowledge_note_links_pkey PRIMARY KEY (from_note_id, to_title_key);
alter table public.knowledge_note_links add constraint knowledge_note_links_from_note_id_fkey FOREIGN KEY (from_note_id) REFERENCES knowledge_notes(id) ON DELETE CASCADE;
alter table public.knowledge_notes add constraint knowledge_notes_path_key UNIQUE (path);
alter table public.knowledge_notes add constraint knowledge_notes_is_public_check CHECK (is_public);
alter table public.knowledge_notes add constraint knowledge_notes_pkey PRIMARY KEY (id);
alter table public.knowledge_notes add constraint knowledge_notes_path_check CHECK (((char_length(path) >= 1) AND (char_length(path) <= 400)));
alter table public.knowledge_notes add constraint knowledge_notes_title_check CHECK (((char_length(title) >= 1) AND (char_length(title) <= 300)));
alter table public.player_cards add constraint player_cards_card_version_check CHECK ((card_version >= 1));
alter table public.player_cards add constraint player_cards_pkey PRIMARY KEY (id);
alter table public.player_cards add constraint player_cards_user_id_card_version_key UNIQUE (user_id, card_version);
alter table public.player_reflections add constraint player_reflections_line_length CHECK (((line IS NULL) OR ((char_length(line) >= 3) AND (char_length(line) <= 140))));
alter table public.player_reflections add constraint player_reflections_visitor_user_id_fkey FOREIGN KEY (visitor_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.player_reflections add constraint player_reflections_answer_check CHECK ((answer = ANY (ARRAY['yes'::text, 'partly'::text, 'differently'::text])));
alter table public.player_reflections add constraint player_reflections_name_length CHECK (((char_length(visitor_name) >= 1) AND (char_length(visitor_name) <= 60)));
alter table public.player_reflections add constraint player_reflections_player_user_id_fkey FOREIGN KEY (player_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.player_reflections add constraint player_reflections_pkey PRIMARY KEY (id);
alter table public.player_traces add constraint player_traces_surface_check CHECK (((char_length(surface) >= 1) AND (char_length(surface) <= 40)));
alter table public.player_traces add constraint player_traces_kind_check CHECK ((kind = ANY (ARRAY['action'::text, 'route'::text, 'practice'::text, 'technology'::text, 'answer'::text])));
alter table public.player_traces add constraint player_traces_payload_id_check CHECK (((char_length(payload_id) >= 1) AND (char_length(payload_id) <= 80)));
alter table public.player_traces add constraint player_traces_outcome_check CHECK (((char_length(outcome) >= 1) AND (char_length(outcome) <= 40)));
alter table public.player_traces add constraint player_traces_pkey PRIMARY KEY (id);
alter table public.village_window_lights add constraint village_window_lights_pkey PRIMARY KEY (id);
alter table public.village_windows add constraint village_windows_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.village_windows add constraint village_windows_display_name_check CHECK ((char_length(display_name) <= 40));
alter table public.village_windows add constraint village_windows_pkey PRIMARY KEY (n);
alter table public.village_windows add constraint village_windows_moon_phase_check CHECK ((moon_phase = ANY (ARRAY['new'::text, 'waxing'::text, 'full'::text, 'waning'::text])));
alter table public.village_windows add constraint village_windows_top_talent_check CHECK ((char_length(top_talent) <= 120));
alter table public.village_windows add constraint village_windows_token_key UNIQUE (token);
alter table public.your_ai_daily_usage add constraint your_ai_daily_usage_turns_check CHECK ((turns >= 0));
alter table public.your_ai_daily_usage add constraint your_ai_daily_usage_pkey PRIMARY KEY (user_id, day);
CREATE INDEX knowledge_note_chunks_embedding_idx ON public.knowledge_note_chunks USING hnsw (((embedding)::extensions.halfvec(3072)) extensions.halfvec_cosine_ops);
CREATE INDEX knowledge_note_links_to_idx ON public.knowledge_note_links USING btree (to_title_key);
CREATE INDEX knowledge_notes_title_key_idx ON public.knowledge_notes USING btree (title_key);
CREATE INDEX player_cards_user_latest_idx ON public.player_cards USING btree (user_id, card_version DESC);
CREATE INDEX player_reflections_player_idx ON public.player_reflections USING btree (player_user_id, created_at DESC);
CREATE INDEX player_traces_user_at_idx ON public.player_traces USING btree (user_id, at DESC);
CREATE INDEX village_window_lights_ip_idx ON public.village_window_lights USING btree (ip_hash, lit_at DESC);
CREATE INDEX village_windows_user_idx ON public.village_windows USING btree (user_id) WHERE (user_id IS NOT NULL);
alter table public.knowledge_note_chunks enable row level security;
alter table public.knowledge_note_links enable row level security;
alter table public.knowledge_notes enable row level security;
alter table public.player_cards enable row level security;
alter table public.player_reflections enable row level security;
alter table public.player_traces enable row level security;
alter table public.village_window_lights enable row level security;
alter table public.village_windows enable row level security;
alter table public.your_ai_daily_usage enable row level security;
create policy player_cards_owner_delete on public.player_cards as PERMISSIVE for DELETE to authenticated using ((user_id = auth.uid()));
create policy player_cards_owner_select on public.player_cards as PERMISSIVE for SELECT to authenticated using ((user_id = auth.uid()));
create policy player_reflections_owner_select on public.player_reflections as PERMISSIVE for SELECT to public using ((player_user_id = auth.uid()));
create policy player_reflections_owner_update on public.player_reflections as PERMISSIVE for UPDATE to public using ((player_user_id = auth.uid())) with check ((player_user_id = auth.uid()));
create policy player_traces_owner_select on public.player_traces as PERMISSIVE for SELECT to authenticated using ((user_id = auth.uid()));
create policy player_traces_owner_delete on public.player_traces as PERMISSIVE for DELETE to authenticated using ((user_id = auth.uid()));
create policy player_traces_owner_insert on public.player_traces as PERMISSIVE for INSERT to authenticated with check ((user_id = auth.uid()));
CREATE OR REPLACE FUNCTION public.claim_window(p_token uuid)
 RETURNS TABLE(n bigint, token uuid, lit_at timestamp with time zone, moon_phase text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
end $function$
;
CREATE OR REPLACE FUNCTION public.knowledge_retrieve(p_query extensions.vector, p_k integer DEFAULT 5, p_neighbours integer DEFAULT 5)
 RETURNS TABLE(note_id uuid, path text, title text, excerpt text, distance double precision, hop integer)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
  with top_chunks as (
    select c.note_id, c.content,
           (c.embedding::extensions.halfvec(3072) <=> p_query::extensions.halfvec(3072))::double precision as d
      from public.knowledge_note_chunks c
     order by c.embedding::extensions.halfvec(3072) <=> p_query::extensions.halfvec(3072)
     limit greatest(least(p_k, 10) * 4, 20)
  ),
  best as (
    select distinct on (t.note_id) t.note_id, t.content, t.d
      from top_chunks t
     order by t.note_id, t.d
  ),
  seeds as (
    select b.* from best b order by b.d limit greatest(least(p_k, 10), 1)
  ),
  neighbour_ids as (
    select n.id as nid
      from seeds s
      join public.knowledge_note_links l on l.from_note_id = s.note_id
      join public.knowledge_notes n on n.title_key = l.to_title_key
    union
    select l.from_note_id as nid
      from seeds s
      join public.knowledge_notes sn on sn.id = s.note_id
      join public.knowledge_note_links l on l.to_title_key = sn.title_key
  ),
  neighbours as (
    select ni.nid from neighbour_ids ni
     where ni.nid not in (select s.note_id from seeds s)
     limit greatest(least(p_neighbours, 10), 0)
  )
  select s.note_id, n.path, n.title, left(s.content, 700), s.d, 0
    from seeds s join public.knowledge_notes n on n.id = s.note_id
  union all
  select n.id, n.path, n.title, left(n.body, 400), null::double precision, 1
    from neighbours nb join public.knowledge_notes n on n.id = nb.nid;
$function$
;
CREATE OR REPLACE FUNCTION public.leave_reflection(p_username text, p_answer text, p_line text, p_visitor_name text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
end $function$
;
CREATE OR REPLACE FUNCTION public.light_window(p_top_talent text, p_phase text, p_token uuid DEFAULT NULL::uuid)
 RETURNS TABLE(n bigint, token uuid, lit_at timestamp with time zone, moon_phase text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
end $function$
;
CREATE OR REPLACE FUNCTION public.lit_windows_count()
 RETURNS bigint
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select count(*) from public.village_windows where not released;
$function$
;
CREATE OR REPLACE FUNCTION public.window_public(p_n bigint)
 RETURNS TABLE(n bigint, display_name text, top_talent text, lit_at timestamp with time zone, moon_phase text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select w.n, w.display_name, w.top_talent, w.lit_at, w.moon_phase
    from public.village_windows w
   where w.n = p_n and not w.released;
$function$
;
CREATE OR REPLACE FUNCTION public.your_ai_take_turn(p_user uuid, p_cap integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_turns integer;
begin
  insert into public.your_ai_daily_usage as u (user_id, day, turns)
  values (p_user, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day) do update set turns = u.turns + 1
    where u.turns < p_cap
  returning u.turns into v_turns;
  return coalesce(v_turns, -1);
end $function$
;
revoke all on function claim_window(uuid) from public; grant execute on function claim_window(uuid) to authenticated; grant execute on function claim_window(uuid) to service_role;
revoke all on function knowledge_retrieve(extensions.vector,integer,integer) from public; grant execute on function knowledge_retrieve(extensions.vector,integer,integer) to service_role;
revoke all on function leave_reflection(text,text,text,text) from public; grant execute on function leave_reflection(text,text,text,text) to anon; grant execute on function leave_reflection(text,text,text,text) to authenticated; grant execute on function leave_reflection(text,text,text,text) to service_role;
revoke all on function light_window(text,text,uuid) from public; grant execute on function light_window(text,text,uuid) to anon; grant execute on function light_window(text,text,uuid) to authenticated; grant execute on function light_window(text,text,uuid) to service_role;
revoke all on function lit_windows_count() from public; grant execute on function lit_windows_count() to anon; grant execute on function lit_windows_count() to authenticated; grant execute on function lit_windows_count() to service_role;
revoke all on function window_public(bigint) from public; grant execute on function window_public(bigint) to anon; grant execute on function window_public(bigint) to authenticated; grant execute on function window_public(bigint) to service_role;
revoke all on function your_ai_take_turn(uuid,integer) from public; grant execute on function your_ai_take_turn(uuid,integer) to service_role;
