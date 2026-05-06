-- 1. Ensure resonance_rating exists on zog_snapshots
ALTER TABLE public.zog_snapshots
  ADD COLUMN IF NOT EXISTS resonance_rating smallint
  CHECK (resonance_rating IS NULL OR (resonance_rating BETWEEN 1 AND 10));

-- 2. Rebuild founder_state_v1
DROP VIEW IF EXISTS public.founder_state_v1;

CREATE VIEW public.founder_state_v1
WITH (security_invoker = false) AS
WITH latest_zog AS (
  SELECT DISTINCT ON (gp.user_id)
    gp.user_id,
    z.archetype_title,
    z.resonance_rating,
    z.created_at
  FROM public.game_profiles gp
  JOIN public.zog_snapshots z ON z.profile_id = gp.id
  WHERE gp.user_id IS NOT NULL
  ORDER BY gp.user_id, z.created_at DESC
),
latest_qol AS (
  SELECT DISTINCT ON (gp.user_id)
    gp.user_id,
    q.created_at
  FROM public.game_profiles gp
  JOIN public.qol_snapshots q ON q.profile_id = gp.id
  WHERE gp.user_id IS NOT NULL
  ORDER BY gp.user_id, q.created_at DESC
),
first_paid AS (
  SELECT gp.user_id, MIN(eg.created_at) AS first_paid_at
  FROM public.entitlement_grants eg
  JOIN public.game_profiles gp ON gp.id = eg.profile_id
  WHERE gp.user_id IS NOT NULL
  GROUP BY gp.user_id
),
nurture_per_profile AS (
  SELECT
    profile_id,
    COUNT(*) FILTER (WHERE status = 'sent')    AS sent_count,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
    COUNT(*)                                   AS total_count
  FROM public.nurture_email_queue
  GROUP BY profile_id
)
SELECT
  gp.user_id,
  COALESCE(
    NULLIF(
      regexp_replace(
        lower(trim(COALESCE(gp.first_name, '') || ' ' || COALESCE(gp.last_name, ''))),
        '[^a-z0-9]+', '-', 'g'
      ),
      '-'
    ),
    regexp_replace(lower(split_part(u.email, '@', 1)), '[^a-z0-9]+', '-', 'g'),
    gp.user_id::text
  ) AS slug,
  COALESCE(
    NULLIF(trim(COALESCE(gp.first_name, '') || ' ' || COALESCE(gp.last_name, '')), ''),
    split_part(u.email, '@', 1)
  ) AS display_name,
  u.email,
  gp.onboarding_stage,
  CASE gp.onboarding_stage
    WHEN 'new'             THEN 1
    WHEN 'started'         THEN 1
    WHEN 'zog_started'     THEN 1
    WHEN 'tour_complete'   THEN 1
    WHEN 'zog_complete'    THEN 2
    WHEN 'qol_started'     THEN 2
    WHEN 'qol_complete'    THEN 2
    WHEN 'offer_complete'  THEN 4
    WHEN 'recipe_complete' THEN 4
    WHEN 'unlocked'        THEN 4
    WHEN 'complete'        THEN 4
    ELSE 1
  END AS current_step,
  lz.created_at        AS latest_zog_snapshot_at,
  lz.archetype_title   AS latest_zog_top_talent,
  lq.created_at        AS latest_qol_snapshot_at,
  (gp.onboarding_stage IN ('offer_complete', 'recipe_complete', 'unlocked', 'complete'))
    AS has_ignition,
  (gp.onboarding_stage IN ('build_complete', 'complete'))
    AS has_build,
  0::numeric AS revenue_total_usd,
  GREATEST(
    gp.updated_at,
    COALESCE(lz.created_at, '-infinity'::timestamptz),
    COALESCE(lq.created_at, '-infinity'::timestamptz)
  ) AS last_touch_at,
  (lz.created_at IS NOT NULL) AS has_top_talent,
  lz.resonance_rating AS top_talent_resonance,
  gp.created_at AS joined_at,
  (fp.first_paid_at IS NOT NULL) AS has_paid,
  CASE
    WHEN fp.first_paid_at IS NULL THEN NULL
    ELSE EXTRACT(EPOCH FROM (fp.first_paid_at - gp.created_at))::int / 86400
  END AS days_to_first_paid,
  CASE
    WHEN noo.email IS NOT NULL THEN 'opted_out'
    WHEN npp.profile_id IS NULL THEN 'never_queued'
    WHEN npp.sent_count = npp.total_count AND npp.total_count > 0 THEN 'all_sent'
    WHEN npp.sent_count > 0 THEN 'partial'
    ELSE 'queued'
  END AS nurture_status
FROM public.game_profiles gp
JOIN auth.users u ON u.id = gp.user_id
LEFT JOIN latest_zog lz          ON lz.user_id    = gp.user_id
LEFT JOIN latest_qol lq          ON lq.user_id    = gp.user_id
LEFT JOIN first_paid fp          ON fp.user_id    = gp.user_id
LEFT JOIN nurture_per_profile npp ON npp.profile_id = gp.id
LEFT JOIN public.nurture_opt_outs noo ON noo.email = u.email
WHERE gp.user_id IS NOT NULL;

COMMENT ON VIEW public.founder_state_v1 IS
  'Canonical founder state. Day 62 v2: + has_top_talent, top_talent_resonance, joined_at, has_paid (entitlement_grants only), days_to_first_paid, nurture_status.';

REVOKE ALL ON public.founder_state_v1 FROM anon;
GRANT SELECT ON public.founder_state_v1 TO authenticated;
GRANT SELECT ON public.founder_state_v1 TO service_role;

-- 3. Admin read policy on email_send_log
DO $$ BEGIN
  CREATE POLICY "Admins can read send log"
    ON public.email_send_log FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::public.app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
