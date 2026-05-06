-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  founder_state_v1 — Day 62 (2026-05-05) admin-signals extension  ║
-- ║                                                                   ║
-- ║  Adds non-UBB lifecycle signals so /admin can answer:            ║
-- ║   • Did this person take Top Talent? Did it resonate?            ║
-- ║   • Have they paid? How fast?                                    ║
-- ║   • Where are they in the nurture sequence?                      ║
-- ║   • When did they join? (cohort grouping)                        ║
-- ║                                                                   ║
-- ║  UBB-related columns (artifacts/landing/dossier/specificity)     ║
-- ║  are intentionally OUT OF SCOPE for this wave (Sasha 2026-05-05: ║
-- ║  "UBB is for the future, let's not touch that"). When UBB is     ║
-- ║  back on the table, extend this view rather than create a sibling.║
-- ╚═══════════════════════════════════════════════════════════════════╝
--
-- DESIGN NOTES:
--
-- (1) Funnel events are NOT joined here. `funnel_events.session_id` is
--     anonymous text (not user_id), so per-user funnel telemetry would
--     require mining `metadata` jsonb — out of scope for this migration.
--     If we need it later, the join key is most likely `metadata->>'user_id'`.
--
-- (2) `has_paid` REPLACES the brittle `has_ignition` heuristic (which
--     derives from `onboarding_stage`, a UI flag the client sets). The
--     existing `has_ignition` column STAYS for back-compat (it's read by
--     the existing /admin Action List). The new `has_paid` column is the
--     authoritative payment signal — currently derived from
--     entitlement_grants only (admin gifted access, Founders 50,
--     Ignition).
--
--     STRIPE LEDGER NOTE: an earlier repo migration (20260424000001)
--     creates a `premium_subscriptions` table for Stripe webhook writes,
--     but Lovable confirmed that table doesn't exist in the live DB
--     (repo↔prod drift, separate ticket). Until it lands AND a webhook
--     is wired to populate it, has_paid is entitlement-grant-only. When
--     the Stripe ledger surface is confirmed, extend the first_paid CTE
--     below to UNION ALL the table — single-line change.
--
-- (3) `nurture_status` is a denormalized aggregate so the admin UI doesn't
--     need to do the N+1 client-side join. Five values:
--       'opted_out'   — email present in nurture_opt_outs (terminal)
--       'all_sent'    — 3/3 nurture rows have status='sent'
--       'partial'     — at least 1 sent, but not all 3
--       'queued'      — rows exist but none sent yet (waiting on cron)
--       'never_queued'— no rows in nurture_email_queue (pre-Day-47 users
--                       and any user who never completed ZoG)
--
-- (4) DROP + CREATE pattern matches the original founder_state_view
--     migration. CREATE OR REPLACE VIEW would work for column appends,
--     but the explicit drop is more legible and lets us reorder/rename
--     in future passes without surprise.

-- ── Prerequisite (Day 62 follow-up): land the resonance column ──────
--
-- Lovable confirmed during the first apply attempt that
-- `zog_snapshots.resonance_rating` doesn't exist in the live DB,
-- despite the repo carrying migration 20260419193206 that adds it.
-- Either that migration was tracked-but-not-executed, or it was
-- rolled back at some point. Idempotent ALTER below is safe to run
-- whether or not the column exists. Same shape as the original (1-10
-- check, nullable for back-compat). Once any user submits a resonance
-- rating via the existing ResonanceRating component, this column
-- starts populating immediately.

ALTER TABLE public.zog_snapshots
  ADD COLUMN IF NOT EXISTS resonance_rating INTEGER
    CHECK (resonance_rating IS NULL OR (resonance_rating >= 1 AND resonance_rating <= 10));

COMMENT ON COLUMN public.zog_snapshots.resonance_rating IS
  '1-10 self-reported resonance after Top Talent reveal. Captured via ResonanceRating component. Nullable (skipped or pre-Day-44 row).';

-- ── View ────────────────────────────────────────────────────────────

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
-- Earliest paid signal per user. Day 62: derives from entitlement_grants
-- only (admin gifts, Founders 50, Ignition). Stripe-side detection via
-- premium_subscriptions deferred until that table is confirmed in the
-- live DB and a webhook is wired — see header note (2). When that
-- lands, UNION ALL the Stripe rows here in one place.
first_paid AS (
  SELECT
    gp.user_id,
    MIN(eg.created_at) AS first_paid_at
  FROM public.entitlement_grants eg
  JOIN public.game_profiles gp ON gp.id = eg.profile_id
  WHERE gp.user_id IS NOT NULL
  GROUP BY gp.user_id
),
-- Nurture aggregate per profile_id. Five-state classification matches
-- the (4) note above. Reads `nurture_email_queue` once per user to
-- avoid the client-side N+1.
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
  -- slug: kebab-case from display_name, else email local-part (unchanged)
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
  -- display_name: "First Last" | "First" | email local-part (unchanged)
  COALESCE(
    NULLIF(trim(COALESCE(gp.first_name, '') || ' ' || COALESCE(gp.last_name, '')), ''),
    split_part(u.email, '@', 1)
  ) AS display_name,
  u.email,
  gp.onboarding_stage,
  -- current_step: mirrors stageToStep() in src/hooks/useJourneyProgression.ts
  -- (unchanged from v1)
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
  -- has_ignition / has_build derive from onboarding_stage (unchanged from v1).
  -- These are KEPT for back-compat with the existing /admin Action List.
  -- New code should prefer `has_paid` below for actual payment state.
  (gp.onboarding_stage IN ('offer_complete', 'recipe_complete', 'unlocked', 'complete'))
    AS has_ignition,
  (gp.onboarding_stage IN ('build_complete', 'complete'))
    AS has_build,
  0::numeric AS revenue_total_usd,  -- TODO(phase-2): wire from stripe_events table once it lands
  GREATEST(
    gp.updated_at,
    COALESCE(lz.created_at, '-infinity'::timestamptz),
    COALESCE(lq.created_at, '-infinity'::timestamptz)
  ) AS last_touch_at,

  -- ─── NEW Day 62 columns ──────────────────────────────────────────

  -- Did they take Top Talent? Trivial derivation but cleaner than checking
  -- latest_zog_snapshot_at IS NOT NULL on every admin row.
  (lz.created_at IS NOT NULL) AS has_top_talent,

  -- Self-reported 1-10 resonance from the post-reveal rating widget.
  -- NULL = user skipped the rating OR snapshot is pre-Day-44 (column added
  -- 2026-04-19). The most signal-rich field on this row: tells us which
  -- founders' reveals LANDED.
  lz.resonance_rating AS top_talent_resonance,

  -- When the user's game_profile row was created. Stable cohort key.
  -- We use game_profiles.created_at (not auth.users.created_at) because
  -- profile creation is the meaningful "joined the platform" moment —
  -- some users have an auth row but never created a profile.
  gp.created_at AS joined_at,

  -- Authoritative payment signal: real DB state, not UI heuristic.
  (fp.first_paid_at IS NOT NULL) AS has_paid,

  -- Days from join to first paid moment. Funnel-velocity signal.
  -- NULL when not yet paid.
  CASE
    WHEN fp.first_paid_at IS NULL THEN NULL
    ELSE EXTRACT(EPOCH FROM (fp.first_paid_at - gp.created_at))::int / 86400
  END AS days_to_first_paid,

  -- Nurture lifecycle status. Five-state enum in TEXT (no custom type
  -- to avoid migration coupling). See note (3) above for semantics.
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
  'Canonical founder state. Day 62 v2 extension: + has_top_talent, top_talent_resonance, joined_at, has_paid, days_to_first_paid, nurture_status. UBB columns intentionally NOT present (out of scope per Sasha 2026-05-05). funnel_events not joined (session-anonymous; needs metadata mining).';

-- ── Permissions (unchanged from v1) ─────────────────────────────────

REVOKE ALL ON public.founder_state_v1 FROM anon;
GRANT SELECT ON public.founder_state_v1 TO authenticated;
GRANT SELECT ON public.founder_state_v1 TO service_role;
