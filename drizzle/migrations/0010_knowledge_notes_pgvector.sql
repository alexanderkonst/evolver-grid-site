-- Your AI knowledge graph retrieval (docs/specs/ai-familiar/ai-familiar_tracker.md §20.2 b, §20.4 step 3).
-- PUBLIC subset only (§20.5 decision 2): the sync function rejects private notes, people and
-- ledger before anything is stored; is_public is pinned to true so nothing else can land here.
-- Read only by server code (service role); no client access.

create extension if not exists vector with schema extensions;

create table public.knowledge_notes (
  id           uuid primary key default gen_random_uuid(),
  path         text not null unique check (char_length(path) between 1 and 400),
  title        text not null check (char_length(title) between 1 and 300),
  title_key    text not null,
  body         text not null,
  content_hash text not null,
  is_public    boolean not null default true check (is_public),
  source       text not null default 'knowledgegraph',
  synced_at    timestamptz not null default now()
);
create index knowledge_notes_title_key_idx on public.knowledge_notes (title_key);

create table public.knowledge_note_chunks (
  id          uuid primary key default gen_random_uuid(),
  note_id     uuid not null references public.knowledge_notes (id) on delete cascade,
  chunk_index integer not null check (chunk_index >= 0),
  content     text not null,
  embedding   extensions.vector(3072) not null,
  unique (note_id, chunk_index)
);
-- HNSW caps plain vector at 2000 dims, so the 3072-dim column is indexed through a halfvec cast.
create index knowledge_note_chunks_embedding_idx
  on public.knowledge_note_chunks
  using hnsw ((embedding::extensions.halfvec(3072)) extensions.halfvec_cosine_ops);

-- Wikilinks: [[Target]] from a note, matched to notes by normalised title (1-hop graph).
create table public.knowledge_note_links (
  from_note_id uuid not null references public.knowledge_notes (id) on delete cascade,
  to_title_key text not null,
  primary key (from_note_id, to_title_key)
);
create index knowledge_note_links_to_idx on public.knowledge_note_links (to_title_key);

revoke all on public.knowledge_notes, public.knowledge_note_chunks, public.knowledge_note_links from anon, authenticated;
grant all on public.knowledge_notes, public.knowledge_note_chunks, public.knowledge_note_links to service_role;
alter table public.knowledge_notes enable row level security;
alter table public.knowledge_note_chunks enable row level security;
alter table public.knowledge_note_links enable row level security;

-- Top-k notes by cosine distance (best chunk per note) + their 1-hop neighbours via wikilinks
-- in both directions. hop = 0 for direct hits, 1 for neighbours.
create or replace function public.knowledge_retrieve(
  p_query extensions.vector(3072),
  p_k integer default 5,
  p_neighbours integer default 5
)
returns table (note_id uuid, path text, title text, excerpt text, distance double precision, hop integer)
language sql stable set search_path = public, extensions, pg_temp as $$
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
$$;

revoke all on function public.knowledge_retrieve(extensions.vector, integer, integer) from public, anon, authenticated;
grant execute on function public.knowledge_retrieve(extensions.vector, integer, integer) to service_role;