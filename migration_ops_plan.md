# Migration & Ops Plan

> Safe rollout plan for Supabase changes that track vector sequence progress and action logs

## Scope
- Add vector-level progress tracking for each profile
- Log user actions across vectors and QoL domains with timing metadata
- Provide rollout, rollback, backfill, and verification steps

## Proposed Supabase Changes

### Table: `public.vector_progress`
Tracks how far a profile has progressed through a vector sequence.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK default `gen_random_uuid()` | Surrogate key |
| `profile_id` | `uuid` NOT NULL | References `public.game_profiles(id)` on delete cascade |
| `vector` | `text` NOT NULL | e.g., `genius`, `spirit`, `mind`, `emotions`, `body` |
| `step_index` | `integer` NOT NULL DEFAULT 0 | 0-based index of current step |
| `version` | `text` NOT NULL DEFAULT 'v1' | Sequence version (for future schema changes) |
| `draft_skipped_at` | `timestamptz` | Nullable timestamp when draft sequence was skipped |
| `created_at` | `timestamptz` NOT NULL DEFAULT `now()` | Creation timestamp |
| `updated_at` | `timestamptz` NOT NULL DEFAULT `now()` | Maintained via trigger |

Indexes and constraints:
- Unique (`profile_id`, `vector`, `version`) to prevent duplicates per version
- Index on `profile_id` for filtering
- Row Level Security mirroring `game_profiles` ownership (select/insert/update for owning user)

### Table: `public.action_events`
Logs user actions across vectors and QoL domains.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK default `gen_random_uuid()` | Surrogate key |
| `action_id` | `text` NOT NULL | Stable identifier for the action (e.g., `apply_genius`, `breathwork_intro`) |
| `profile_id` | `uuid` NOT NULL | References `public.game_profiles(id)` on delete cascade |
| `source` | `text` | UI origin (e.g., `dashboard`, `feed`, `mission_control`) |
| `vector` | `text` | Vector where the action belongs |
| `qol_domain` | `text` | Quality-of-life domain tag if applicable |
| `selected_at` | `timestamptz` | When the user selected the action |
| `completed_at` | `timestamptz` | When the user completed the action |
| `duration` | `integer` | Optional duration in seconds |
| `mode` | `text` | e.g., `self_guided`, `mentor_led`, `ai_assist` |
| `metadata` | `jsonb` NOT NULL DEFAULT '{}'::jsonb | Additional structured context |
| `created_at` | `timestamptz` NOT NULL DEFAULT `now()` | Creation timestamp |

Indexes and constraints:
- Index on (`profile_id`, `vector`) for analytics
- Index on `completed_at` (DESC) for recent activity feeds
- RLS aligned with `game_profiles` ownership

## Migration SQL (Forward)
```sql
-- Vector progress table
CREATE TABLE IF NOT EXISTS public.vector_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.game_profiles(id) ON DELETE CASCADE,
  vector text NOT NULL,
  step_index integer NOT NULL DEFAULT 0,
  version text NOT NULL DEFAULT 'v1',
  draft_skipped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vector_progress_profile_vector_version
  ON public.vector_progress(profile_id, vector, version);

CREATE INDEX IF NOT EXISTS idx_vector_progress_profile
  ON public.vector_progress(profile_id);

-- Action events table
CREATE TABLE IF NOT EXISTS public.action_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id text NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.game_profiles(id) ON DELETE CASCADE,
  source text,
  vector text,
  qol_domain text,
  selected_at timestamptz,
  completed_at timestamptz,
  duration integer,
  mode text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_action_events_profile_vector
  ON public.action_events(profile_id, vector);

CREATE INDEX IF NOT EXISTS idx_action_events_completed_at
  ON public.action_events(completed_at DESC);

-- Updated at trigger for vector_progress
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vector_progress_updated_at ON public.vector_progress;
CREATE TRIGGER trg_vector_progress_updated_at
BEFORE UPDATE ON public.vector_progress
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### RLS Policies (after tables exist)
```sql
ALTER TABLE public.vector_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_events ENABLE ROW LEVEL SECURITY;

-- Vector progress policies
CREATE POLICY "Users select own vector progress" ON public.vector_progress
  FOR SELECT USING (
    profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users upsert own vector progress" ON public.vector_progress
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users update own vector progress" ON public.vector_progress
  FOR UPDATE USING (
    profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid())
  );

-- Action events policies
CREATE POLICY "Users select own action events" ON public.action_events
  FOR SELECT USING (
    profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users insert own action events" ON public.action_events
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM public.game_profiles WHERE user_id = auth.uid())
  );
```

## Rollback SQL
```sql
DROP TABLE IF EXISTS public.action_events CASCADE;
DROP TABLE IF EXISTS public.vector_progress CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at();
```

## Backfill Steps for Existing Profiles
1. **Seed baseline rows** for all existing profiles so client code can rely on defaults:
   ```sql
   INSERT INTO public.vector_progress (profile_id, vector, step_index, version)
   SELECT gp.id, vec.vector, 0, 'v1'
   FROM public.game_profiles gp
   CROSS JOIN (VALUES ('genius'), ('spirit'), ('mind'), ('emotions'), ('body')) AS vec(vector)
   ON CONFLICT (profile_id, vector, version) DO NOTHING;
   ```
2. **Mark known completions** if historical data exists (e.g., from legacy tables) by updating `step_index` and `draft_skipped_at` accordingly.
3. **Optional: import legacy action logs** by inserting into `action_events` with `selected_at`/`completed_at` sourced from previous audit tables.

## Verification Queries
- **Row counts per table**
  ```sql
  SELECT count(*) AS vector_progress_rows FROM public.vector_progress;
  SELECT count(*) AS action_event_rows FROM public.action_events;
  ```
- **Uniqueness & null checks**
  ```sql
  -- Detect duplicate keys if unique constraint failed to apply
  SELECT profile_id, vector, version, count(*)
  FROM public.vector_progress
  GROUP BY profile_id, vector, version
  HAVING count(*) > 1;

  -- Ensure required fields are populated
  SELECT * FROM public.vector_progress WHERE profile_id IS NULL OR vector IS NULL;
  SELECT * FROM public.action_events WHERE action_id IS NULL OR profile_id IS NULL;
  ```
- **Backfill validation**
  ```sql
  -- Confirm every profile has five vector rows
  SELECT profile_id, count(*)
  FROM public.vector_progress
  GROUP BY profile_id
  HAVING count(*) < 5;

  -- Spot-check recent action timestamps
  SELECT id, action_id, completed_at
  FROM public.action_events
  ORDER BY completed_at DESC
  LIMIT 20;
  ```

## Rollout Checklist
1. Apply forward migration SQL in a change set.
2. Apply RLS policies.
3. Run backfill to seed `vector_progress` per profile.
4. Deploy application changes that write to the new tables.
5. Execute verification queries and confirm no null/duplicate anomalies.
6. Monitor error logs; if issues arise, run rollback SQL and redeploy previous app build.

“Add migration & ops plan for Supabase,”
