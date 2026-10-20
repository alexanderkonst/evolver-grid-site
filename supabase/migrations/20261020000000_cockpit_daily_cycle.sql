-- 2026-10-20: Founder Cockpit daily agent cycle (issue #90).
--
-- cockpit_settings: one row per owner. `agents_paused` is the single Pause
-- switch; agents read it (settings_read / read_state) and stop work while true.
-- cockpit_digests: the morning digest an agent writes once per day
-- (equilibrium-agent-write op digest_write); the cockpit shows today's.
--
-- Not deployed. Apply before deploying the equilibrium-agent-write function:
-- the function tolerates missing tables on reads, but digest_write needs them.
-- Writes from agents go through the edge function (service role); the UI uses
-- the owner-only RLS below.

CREATE TABLE public.cockpit_settings (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agents_paused BOOLEAN NOT NULL DEFAULT false,
  digest_time   TEXT NOT NULL DEFAULT '08:00' CHECK (digest_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  timezone      TEXT NOT NULL DEFAULT 'America/Mexico_City',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cockpit_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cockpit_settings_select" ON public.cockpit_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "cockpit_settings_insert" ON public.cockpit_settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "cockpit_settings_update" ON public.cockpit_settings FOR UPDATE USING (user_id = auth.uid());

CREATE TABLE public.cockpit_digests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- The digest's calendar day in cockpit_settings.timezone.
  date       DATE NOT NULL,
  summary_md TEXT NOT NULL,
  -- [{ "section": "moved" | "waiting" | "outbox", "text": "...", "ref": "url or id (optional)" }]
  items      JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One digest per owner per day: digest_write replaces today's.
  UNIQUE (user_id, date)
);

CREATE INDEX idx_cockpit_digests_user_date ON public.cockpit_digests (user_id, date DESC);

ALTER TABLE public.cockpit_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cockpit_digests_select" ON public.cockpit_digests FOR SELECT USING (user_id = auth.uid());

COMMENT ON TABLE public.cockpit_settings IS
  'Founder Cockpit settings, one row per owner. agents_paused = the Pause switch; digest_time/timezone say when the morning digest is due.';
COMMENT ON TABLE public.cockpit_digests IS
  'Morning digest, one per owner per day, written by agents via equilibrium-agent-write digest_write. items[].section is moved | waiting | outbox.';
