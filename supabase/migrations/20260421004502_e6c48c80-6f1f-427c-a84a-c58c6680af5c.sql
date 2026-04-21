create table if not exists public.user_business_artifacts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  artifact_key     text not null check (artifact_key in (
                     'talent_sentence', 'myth', 'tribe', 'promise', 'pain',
                     'journey', 'value_ladder', 'unique_product'
                   )),
  step_number      integer not null check (step_number between 1 and 7),
  content          text,
  version          text not null default 'v1',
  precision_score  numeric(3,1) check (precision_score >= 0 and precision_score <= 10),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, artifact_key, version)
);

create index if not exists user_business_artifacts_user_step_idx
  on public.user_business_artifacts (user_id, step_number, artifact_key);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_timestamp on public.user_business_artifacts;
create trigger set_timestamp
before update on public.user_business_artifacts
for each row execute function public.touch_updated_at();

alter table public.user_business_artifacts enable row level security;

drop policy if exists "select own artifacts" on public.user_business_artifacts;
create policy "select own artifacts"
  on public.user_business_artifacts for select
  using (auth.uid() = user_id);

drop policy if exists "insert own artifacts" on public.user_business_artifacts;
create policy "insert own artifacts"
  on public.user_business_artifacts for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own artifacts" on public.user_business_artifacts;
create policy "update own artifacts"
  on public.user_business_artifacts for update
  using (auth.uid() = user_id);

drop policy if exists "delete own artifacts" on public.user_business_artifacts;
create policy "delete own artifacts"
  on public.user_business_artifacts for delete
  using (auth.uid() = user_id);

do $$
declare
  sasha_id uuid;
begin
  select id into sasha_id from auth.users
    where email = 'alexanderkonst@gmail.com' limit 1;
  if sasha_id is null then
    raise notice 'Sasha user not found by email; skipping seed.';
    return;
  end if;

  insert into public.user_business_artifacts
    (user_id, artifact_key, step_number, version, precision_score, content)
  values
    (sasha_id, 'talent_sentence', 1, 'v2.0', 9.9,
     'I help people see their brightest talents and turn them into a business.'),
    (sasha_id, 'myth',            3, 'v1.0', 9.5,
     'You are the product-market fit. Self-knowledge is the bottleneck.'),
    (sasha_id, 'tribe',           3, 'v1.0', 9.5,
     'People whose work is real — but doesn''t translate into income yet.'),
    (sasha_id, 'promise',         3, 'v1.0', 9.5,
     'From "I can''t explain what I do" to early product-market fit in 6–8 weeks.'),
    (sasha_id, 'unique_product',  4, 'v1.0', 9.5,
     'The Ignition Session — a 2-hour workshop that produces a founder''s unique business on one page.')
  on conflict (user_id, artifact_key, version) do update
    set content         = excluded.content,
        precision_score = excluded.precision_score,
        step_number     = excluded.step_number;
end $$;