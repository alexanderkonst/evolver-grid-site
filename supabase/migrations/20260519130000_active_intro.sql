-- Active Introduction Layer — Day 67 (Sasha 2026-05-19)
--
-- Implements docs/02-strategy/matchmaking_strategy.md §8.6 + the
-- product spec at docs/specs/match-mechanic/active-intro_product_spec.md.
--
-- Layered on top of §8 (Day 66): the existing match_interests +
-- match_intros tables stay. This migration ADDS columns + one-time
-- state reset for §8 in-flight rows.
--
-- The new mechanic:
--   - A clicks "I'd like to meet" → match_interests row (existing §8)
--   - send-match-headsup-email fires → records timestamp + status
--   - B clicks magic-link button in the email
--   - match-consent edge function verifies HMAC token + updates
--     match_interests.consent_response
--   - On 'consented': inserts match_intros + fires send-mutual-intro-email
--   - On 'declined': suppresses A from B's deck for 15 days
--   - On 30-day timeout: row marked 'expired'

-- ─── match_interests column additions ──────────────────────────────

DO $$ BEGIN
  ALTER TABLE public.match_interests ADD COLUMN headsup_email_sent_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.match_interests ADD COLUMN consent_response TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.match_interests
    ADD CONSTRAINT match_interests_consent_response_check
    CHECK (consent_response IS NULL OR consent_response IN ('pending', 'consented', 'declined', 'expired'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.match_interests ADD COLUMN consent_responded_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.match_interests ADD COLUMN headsup_email_status TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.match_interests
    ADD CONSTRAINT match_interests_headsup_status_check
    CHECK (headsup_email_status IS NULL OR headsup_email_status IN (
      'sent', 'bounced', 'failed', 'no_email',
      'opted_out', 'globally_suppressed', 'already_connected'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.match_interests ADD COLUMN headsup_sent_count INTEGER NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS match_interests_consent_response_idx
  ON public.match_interests (consent_response);
CREATE INDEX IF NOT EXISTS match_interests_headsup_sent_at_idx
  ON public.match_interests (headsup_email_sent_at);

-- ─── game_profiles column additions ────────────────────────────────

DO $$ BEGIN
  ALTER TABLE public.game_profiles ADD COLUMN match_headsup_opt_out BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.game_profiles ADD COLUMN match_explainer_seen_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

COMMENT ON COLUMN public.game_profiles.match_headsup_opt_out IS
  'Day 67 §8.6: per-user opt-out for match heads-up emails. When true, heads-up emails are not sent (interest is still recorded silently).';

COMMENT ON COLUMN public.game_profiles.match_explainer_seen_at IS
  'Day 67 §8.6: timestamp of when user dismissed the MatchExplainer accordion on /game/collaborate/matches. NULL = first visit, accordion auto-expands.';

-- ─── One-time state reset for §8 in-flight rows ────────────────────
--
-- Any match_interests row created before §8.6 deploys has no concept of
-- consent_response — it was a §8 row where mutual was detected client-side
-- on the other person's next visit. With §8.6 active, those rows become
-- orphaned (the new flow expects either heads-up sent + response, or
-- explicit pending state). Mark them all expired so the new flow starts
-- fresh.
--
-- This is safe because Sasha confirmed no real matches happened yet
-- under §8 (Day 66 ship → Day 67 §8.6, ~3 days of test traffic only).
--
-- Future re-invites (A re-expresses interest in same B after expiry) work
-- naturally — UNIQUE(from, to) on match_interests means the row already
-- exists; the client UPDATE on re-click would need to RESET the response.
-- For v1 we leave that as a follow-up.

UPDATE public.match_interests
SET consent_response = 'expired',
    consent_responded_at = now()
WHERE consent_response IS NULL;

-- ─── New RLS policies (allowing service role to manage new columns) ──
-- The existing §8 policies already cover read/insert/delete by participant.
-- service_role implicitly bypasses RLS for the heads-up + consent edge
-- functions. No new user-facing policies needed; only the service role
-- writes consent_response and headsup_* columns.

-- ─── Suppression check helper ──────────────────────────────────────
--
-- Used by Matchmaking.tsx + TeamsSpace.tsx to exclude B from A's deck
-- when B declined A within the last 15 days.
--
-- Note: this is a SQL view, not a function — Postgres handles it as a
-- regular SELECT, fast with the new index on (consent_response).

CREATE OR REPLACE VIEW public.match_active_declines AS
SELECT
  from_user_id,
  to_user_id,
  consent_responded_at
FROM public.match_interests
WHERE consent_response = 'declined'
  AND consent_responded_at > now() - INTERVAL '15 days';

COMMENT ON VIEW public.match_active_declines IS
  'Day 67 §8.6: 15-day suppression window for declined interests. Excludes A from B''s deck after B clicked "Not now".';

GRANT SELECT ON public.match_active_declines TO authenticated;

-- ─── Analytics view: §8.6 funnel ───────────────────────────────────
--
-- Sasha can query this to see how the heads-up funnel is performing.
-- Per-day rollup: how many heads-ups went out, how many became Yes /
-- Not now / expired, what the conversion rates look like.

CREATE OR REPLACE VIEW public.match_consent_funnel AS
SELECT
  DATE_TRUNC('day', created_at) AS day,
  COUNT(*) FILTER (WHERE headsup_email_sent_at IS NOT NULL)            AS headsups_sent,
  COUNT(*) FILTER (WHERE consent_response = 'consented')               AS consented,
  COUNT(*) FILTER (WHERE consent_response = 'declined')                AS declined,
  COUNT(*) FILTER (WHERE consent_response = 'expired')                 AS expired,
  COUNT(*) FILTER (WHERE consent_response IS NULL)                     AS pending,
  COUNT(*) FILTER (WHERE headsup_email_status = 'bounced')             AS bounced,
  COUNT(*) FILTER (WHERE headsup_email_status = 'opted_out')           AS opted_out_skips
FROM public.match_interests
GROUP BY 1
ORDER BY 1 DESC;

COMMENT ON VIEW public.match_consent_funnel IS
  'Day 67 §8.6: per-day funnel rollup for the heads-up → consent flow. Admin-only query.';

-- Restrict the funnel view to service_role only (contains aggregate
-- engagement signals; not for end users).
REVOKE ALL ON public.match_consent_funnel FROM PUBLIC;
GRANT SELECT ON public.match_consent_funnel TO service_role;
