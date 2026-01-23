# Pending Migrations

*Tasks for Lovable/Supabase - database migrations and edge functions*

---

## 1. Missions Table

```sql
-- missions: personal mission statements
create table if not exists missions (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references game_profiles(id) on delete cascade,
  statement text,
  categories text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS
alter table missions enable row level security;

create policy "Users can view own mission"
  on missions for select
  using (profile_id in (
    select id from game_profiles where user_id = auth.uid()
  ));

create policy "Users can insert own mission"
  on missions for insert
  with check (profile_id in (
    select id from game_profiles where user_id = auth.uid()
  ));

create policy "Users can update own mission"
  on missions for update
  using (profile_id in (
    select id from game_profiles where user_id = auth.uid()
  ));
```

---

## 2. Connections Table

```sql
-- connections: user-to-user connections for Discover
create table if not exists connections (
  id uuid default gen_random_uuid() primary key,
  from_profile_id uuid references game_profiles(id) on delete cascade,
  to_profile_id uuid references game_profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  match_type text check (match_type in ('similar_genius', 'complementary_genius', 'similar_mission')),
  created_at timestamp with time zone default now(),
  unique(from_profile_id, to_profile_id)
);

-- RLS
alter table connections enable row level security;

create policy "Users can view own connections"
  on connections for select
  using (
    from_profile_id in (select id from game_profiles where user_id = auth.uid())
    or to_profile_id in (select id from game_profiles where user_id = auth.uid())
  );

create policy "Users can insert connections"
  on connections for insert
  with check (from_profile_id in (
    select id from game_profiles where user_id = auth.uid()
  ));

create policy "Users can update received connections"
  on connections for update
  using (to_profile_id in (
    select id from game_profiles where user_id = auth.uid()
  ));
```

---

## 3. Game Profiles - Add mission_id

```sql
alter table game_profiles 
add column if not exists mission_id uuid references missions(id);
```

---

## Notes

After applying, regenerate Supabase types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```
