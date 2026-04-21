-- Day 47 nurture email infrastructure
CREATE TABLE IF NOT EXISTS public.nurture_email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  profile_id UUID REFERENCES public.game_profiles(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('day1', 'day2', 'day8')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nurture_queue_due
  ON public.nurture_email_queue (scheduled_for)
  WHERE status = 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS idx_nurture_queue_profile_type
  ON public.nurture_email_queue (profile_id, email_type);

CREATE OR REPLACE FUNCTION public.touch_nurture_email_queue_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS nurture_email_queue_touch_updated_at ON public.nurture_email_queue;
CREATE TRIGGER nurture_email_queue_touch_updated_at
  BEFORE UPDATE ON public.nurture_email_queue
  FOR EACH ROW EXECUTE FUNCTION public.touch_nurture_email_queue_updated_at();

CREATE TABLE IF NOT EXISTS public.nurture_opt_outs (
  email TEXT PRIMARY KEY,
  opted_out_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT
);

ALTER TABLE public.nurture_email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurture_opt_outs ENABLE ROW LEVEL SECURITY;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  PERFORM cron.unschedule('nurture-emails-dispatch');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'nurture-emails-dispatch',
  '*/10 * * * *',
  $cron$
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
  $cron$
);