-- Day 47 late pass (Sasha): Nurture email sequence infrastructure.
--
-- Post-save flow adds 3 scheduled emails per user:
--   • day1 — "Your Top Talent has a deeper layer" + Productize Yourself CTA
--   • day2 — "What's shifted since you read it?" (pure minimalist check-in)
--   • day8 — "Your Top Talent is the unhinged raw YOU" + last-reminder CTA
--
-- save-zog-result enqueues rows here on save. A pg_cron job invokes
-- process-nurture-emails every 10 min to dispatch due rows via Resend.

-- ── Queue table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.nurture_email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  profile_id UUID REFERENCES public.game_profiles(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('day1', 'day2', 'day8')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  -- Snapshot of appleseed data at enqueue time, so template rendering
  -- doesn't re-read (and risk missing) the snapshot at send time.
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup of pending rows that are due now.
CREATE INDEX IF NOT EXISTS idx_nurture_queue_due
  ON public.nurture_email_queue (scheduled_for)
  WHERE status = 'pending';

-- One row per (profile, email_type) — prevents double-enqueue.
CREATE UNIQUE INDEX IF NOT EXISTS idx_nurture_queue_profile_type
  ON public.nurture_email_queue (profile_id, email_type);

-- updated_at auto-touch
CREATE OR REPLACE FUNCTION public.touch_nurture_email_queue_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS nurture_email_queue_touch_updated_at ON public.nurture_email_queue;
CREATE TRIGGER nurture_email_queue_touch_updated_at
  BEFORE UPDATE ON public.nurture_email_queue
  FOR EACH ROW EXECUTE FUNCTION public.touch_nurture_email_queue_updated_at();

-- ── Opt-out table (unsubscribe) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.nurture_opt_outs (
  email TEXT PRIMARY KEY,
  opted_out_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT
);

-- ── RLS ─────────────────────────────────────────────────────────────
-- Only the service role needs access; app users never read these tables.
ALTER TABLE public.nurture_email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurture_opt_outs ENABLE ROW LEVEL SECURITY;
-- (No policies = only service_role + admin can touch rows — desired default.)

-- ── Cron: invoke process-nurture-emails every 10 minutes ────────────
-- Requires pg_cron + pg_net extensions (standard on Supabase).
-- The edge function URL + service-role key live in Vault secrets that the
-- job reads at invoke time.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule any prior version of this job first (idempotent redeploy).
DO $$
BEGIN
  PERFORM cron.unschedule('nurture-emails-dispatch');
EXCEPTION
  WHEN OTHERS THEN NULL; -- job didn't exist yet
END $$;

-- Every 10 minutes: fire an HTTP POST at the edge function. The function
-- itself reads the queue and dispatches due rows. We pass no body; the
-- function queries its own data.
SELECT cron.schedule(
  'nurture-emails-dispatch',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets
            WHERE name = 'supabase_url_public') || '/functions/v1/process-nurture-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
                                     WHERE name = 'supabase_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
