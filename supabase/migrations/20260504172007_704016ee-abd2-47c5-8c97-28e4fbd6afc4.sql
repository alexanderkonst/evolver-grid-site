-- 1. Cleanup duplicate game_profiles rows sharing a user_id
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY
        (last_zog_snapshot_id IS NULL),  -- false (has snapshot) sorts first
        created_at ASC
    ) AS rn
  FROM public.game_profiles
  WHERE user_id IS NOT NULL
)
DELETE FROM public.game_profiles gp
USING ranked r
WHERE gp.id = r.id
  AND r.rn > 1;

-- 2. Add UNIQUE constraint on user_id
ALTER TABLE public.game_profiles
  ADD CONSTRAINT game_profiles_user_id_key UNIQUE (user_id);