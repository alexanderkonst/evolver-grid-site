-- Weekly Matches Digest cron — Day 80 (Sasha 2026-05-23)
--
-- Schedules the send-weekly-matches-digest edge function to fire every
-- Monday at 14:00 UTC (≈ 7am Pacific, 10am Eastern, 4pm Central Europe).
-- Implements Loop 2 (re-engagement) from
-- docs/02-strategy/matchmaking_strategy.md §8.7.
--
-- Notes on choices:
--   - 14:00 UTC was chosen as the time most likely to land in working
--     hours for both Americas and Europe. The mexico-city / la / nyc
--     trio (Sasha's primary audience) all see it on Monday morning;
--     Europe sees it Monday afternoon. Asia is the compromise.
--   - Monday because behavior data on cohort-based products (Lunchclub,
--     OnDeck, Polywork) consistently shows Mon morning as the weekly
--     re-engagement peak.
--
-- Prerequisites:
--   - pg_cron extension must be enabled (Supabase ships it).
--   - pg_net extension must be enabled (also default on Supabase).
--   - SUPABASE_URL and SUPABASE_ANON_KEY must be available; we use
--     the service-role JWT for the http call.
--
-- To disable: `SELECT cron.unschedule('weekly-matches-digest');`
-- To run once on demand:
--   `SELECT net.http_post(url := '<edge-fn-url>', headers := jsonb_build_object('Authorization', 'Bearer <service-role-key>', 'Content-Type', 'application/json'), body := '{}'::jsonb);`

-- Ensure required extensions are present.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the digest. The function URL pattern is the standard
-- Supabase edge-function endpoint; replace <project-ref> at deploy
-- time if Lovable manages this differently. Service-role auth lets
-- the function bypass RLS to read every eligible profile.
--
-- Idempotency: cron.schedule returns the same job_id if a job with the
-- same name already exists; re-running this migration won't create
-- duplicates.
SELECT cron.schedule(
    'weekly-matches-digest',
    '0 14 * * 1', -- Mondays at 14:00 UTC
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/send-weekly-matches-digest',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 60000
    ) AS request_id;
    $$
);

-- Operator note: app.settings.supabase_url and app.settings.service_role_key
-- need to be set at the database level via:
--   ALTER DATABASE postgres SET app.settings.supabase_url = 'https://<project-ref>.supabase.co';
--   ALTER DATABASE postgres SET app.settings.service_role_key = '<service-role-key>';
-- Lovable typically wires these automatically; if the cron job fails
-- with "unrecognized configuration parameter", run those two ALTERs
-- manually in the SQL editor with the correct values.
