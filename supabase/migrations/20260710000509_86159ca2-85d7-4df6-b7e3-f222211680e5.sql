-- 2026-07-09 — Founder Pulse briefs (Day 119, Sasha).
CREATE TABLE IF NOT EXISTS public.pulse_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('daily', 'weekly')),
  title TEXT,
  bottom_line TEXT,
  content JSONB NOT NULL,
  markdown TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pulse_briefs_kind_created_idx
  ON public.pulse_briefs (kind, created_at DESC);

ALTER TABLE public.pulse_briefs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can read pulse briefs"
    ON public.pulse_briefs FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.game_profiles
  ADD COLUMN IF NOT EXISTS pulse_email_opt_out BOOLEAN NOT NULL DEFAULT false;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$ BEGIN PERFORM cron.unschedule('founder-pulse-daily-am'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('founder-pulse-daily-pm'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('founder-pulse-weekly'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'founder-pulse-daily-am',
  '0 14 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets
            WHERE name = 'supabase_url_public') || '/functions/v1/generate-pulse-brief',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
                                     WHERE name = 'supabase_service_role_key')
    ),
    body := '{"kind":"daily"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'founder-pulse-daily-pm',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets
            WHERE name = 'supabase_url_public') || '/functions/v1/generate-pulse-brief',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
                                     WHERE name = 'supabase_service_role_key')
    ),
    body := '{"kind":"daily"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'founder-pulse-weekly',
  '0 14 * * 1',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets
            WHERE name = 'supabase_url_public') || '/functions/v1/generate-pulse-brief',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
                                     WHERE name = 'supabase_service_role_key')
    ),
    body := '{"kind":"weekly"}'::jsonb
  );
  $$
);