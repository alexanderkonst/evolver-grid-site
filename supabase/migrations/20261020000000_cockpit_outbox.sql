-- 2026-10-20: Founder Cockpit Outbox (issue #89).
--
-- Every outbound item (LinkedIn message, email, post) lives here as a draft
-- until the founder presses Send. Send only sets status = 'approved'; the
-- actual sending is done outside the site by Hark, which reads approved rows
-- and reports back with outbox_mark_sent. Nothing sends itself and the site
-- never holds third-party API keys.
--
-- Status flow: draft -> approved -> sent. 'deleted' is a soft delete so the
-- audit trail survives. Agent writes go through the equilibrium-agent-write
-- edge function (service role, ops outbox_add_draft / outbox_list /
-- outbox_mark_sent); the Cockpit UI reads and edits through the owner-only
-- RLS below.
--
-- Not deployed with the code: apply this migration separately, before the
-- function ops are used.

CREATE TABLE public.cockpit_outbox (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel        TEXT NOT NULL CHECK (channel IN ('linkedin', 'email', 'post')),
  recipient_name TEXT,          -- null for a post
  recipient_ref  TEXT,          -- profile URL, email address, CRM id
  body           TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 8000),
  status         TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'approved', 'sent', 'deleted')),
  created_by     TEXT NOT NULL DEFAULT 'human' CHECK (created_by IN ('human', 'ai')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at    TIMESTAMPTZ,
  sent_at        TIMESTAMPTZ,
  sent_result    TEXT           -- what the sender reported, e.g. "sent via LinkedIn 17:42" or an error
);

CREATE INDEX idx_cockpit_outbox_user_status
  ON public.cockpit_outbox (user_id, status, created_at DESC);

ALTER TABLE public.cockpit_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cockpit_outbox_select" ON public.cockpit_outbox FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "cockpit_outbox_insert" ON public.cockpit_outbox FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "cockpit_outbox_update" ON public.cockpit_outbox FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "cockpit_outbox_delete" ON public.cockpit_outbox FOR DELETE USING (user_id = auth.uid());

COMMENT ON TABLE public.cockpit_outbox IS
  'Founder Cockpit Outbox: outbound drafts awaiting a human press. Send = status approved; the external sender (Hark) reads approved rows and calls outbox_mark_sent. Nothing sends from the site.';
