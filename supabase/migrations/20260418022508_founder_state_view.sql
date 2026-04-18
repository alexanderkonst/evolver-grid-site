-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  founder_state_v1 — one row per user, canonical founder state    ║
-- ║  Phase 1 of the Autonomous Navigation Loop                       ║
-- ║  Spec: docs/06-architecture/autonomous-navigation-loop.md        ║
-- ║  Brief: ai_tasks/DONE_founder_state_view.md                      ║
-- ╚═══════════════════════════════════════════════════════════════════╝
--
-- Columns source table (see brief) — reminders:
--   * current_step mirrors stageToStep from src/hooks/useJourneyProgression.ts
--     (do NOT refactor that hook; this view duplicates the logic).
--   * has_ignition / has_build are derived from onboarding_stage, NOT from
--     Stripe priceId joins. Commerce state lives in code; the DB tracks the
--     methodological stage. This is the "one lane of truth per domain"
--     invariant from the autonomous-navigation-loop spec.
--   * revenue_total_usd is 0::numeric for v1 — the repo does not currently
--     persist Stripe charge totals in Supabase. When a stripe_events /
--     charges table lands, update this view.
--
-- The view is defined with security_invoker = false so that the `postgres`
-- owner can read auth.users.email on behalf of privileged callers. Actual
-- Sasha-only gating is enforced at the page level (ADMIN_EMAILS check,
-- mirroring AdminMissionParticipants) and at the edge function level
-- (FOUNDER_STATE_API_KEY bearer token or authenticated admin email).
-- We REVOKE from anon and GRANT to authenticated; the client-side admin
-- check decides who gets to render the pages.

-- ── View ────────────────────────────────────────────────────────────

DROP VIEW IF EXISTS public.founder_state_v1;

CREATE VIEW public.founder_state_v1
WITH (security_invoker = false) AS
WITH latest_zog AS (
  SELECT DISTINCT ON (gp.user_id)
    gp.user_id,
    z.archetype_title,
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
)
SELECT
  gp.user_id,
  -- slug: kebab-case from display_name, else email local-part
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
  -- display_name: "First Last" | "First" | email local-part
  COALESCE(
    NULLIF(trim(COALESCE(gp.first_name, '') || ' ' || COALESCE(gp.last_name, '')), ''),
    split_part(u.email, '@', 1)
  ) AS display_name,
  u.email,
  gp.onboarding_stage,
  -- current_step: mirrors stageToStep() in src/hooks/useJourneyProgression.ts
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
  -- has_ignition / has_build derive from onboarding_stage (not Stripe)
  (gp.onboarding_stage IN ('offer_complete', 'recipe_complete', 'unlocked', 'complete'))
    AS has_ignition,
  (gp.onboarding_stage IN ('build_complete', 'complete'))
    AS has_build,
  0::numeric AS revenue_total_usd,  -- TODO(phase-2): wire from stripe_events table once it lands
  GREATEST(
    gp.updated_at,
    COALESCE(lz.created_at, '-infinity'::timestamptz),
    COALESCE(lq.created_at, '-infinity'::timestamptz)
  ) AS last_touch_at
FROM public.game_profiles gp
JOIN auth.users u ON u.id = gp.user_id
LEFT JOIN latest_zog lz ON lz.user_id = gp.user_id
LEFT JOIN latest_qol lq ON lq.user_id = gp.user_id
WHERE gp.user_id IS NOT NULL;

COMMENT ON VIEW public.founder_state_v1 IS
  'Canonical founder state — Phase 1 of the Autonomous Navigation Loop. Source of truth: game_profiles + zog/qol snapshots. Container flags (has_ignition, has_build) derive from onboarding_stage (not Stripe). revenue_total_usd is 0 until a Stripe ledger lands. See docs/06-architecture/autonomous-navigation-loop.md.';

-- ── Permissions ─────────────────────────────────────────────────────

REVOKE ALL ON public.founder_state_v1 FROM anon;
GRANT SELECT ON public.founder_state_v1 TO authenticated;
GRANT SELECT ON public.founder_state_v1 TO service_role;
