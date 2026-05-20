-- §8.6 Active Introduction Layer — Day 67
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

DO $$ BEGIN
  ALTER TABLE public.game_profiles ADD COLUMN match_headsup_opt_out BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.game_profiles ADD COLUMN match_explainer_seen_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

COMMENT ON COLUMN public.game_profiles.match_headsup_opt_out IS
  'Day 67 §8.6: per-user opt-out for match heads-up emails.';
COMMENT ON COLUMN public.game_profiles.match_explainer_seen_at IS
  'Day 67 §8.6: timestamp of when user dismissed the MatchExplainer accordion.';

UPDATE public.match_interests
SET consent_response = 'expired',
    consent_responded_at = now()
WHERE consent_response IS NULL;

CREATE OR REPLACE VIEW public.match_active_declines AS
SELECT from_user_id, to_user_id, consent_responded_at
FROM public.match_interests
WHERE consent_response = 'declined'
  AND consent_responded_at > now() - INTERVAL '15 days';

GRANT SELECT ON public.match_active_declines TO authenticated;

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

REVOKE ALL ON public.match_consent_funnel FROM PUBLIC;
GRANT SELECT ON public.match_consent_funnel TO service_role;