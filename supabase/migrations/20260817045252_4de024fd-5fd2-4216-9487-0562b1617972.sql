CREATE TABLE public.funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  step TEXT NOT NULL,
  source TEXT,
  metadata JSONB,
  "timestamp" TIMESTAMPTZ,
  page_url TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.funnel_events TO anon;
GRANT INSERT, SELECT ON public.funnel_events TO authenticated;
GRANT ALL ON public.funnel_events TO service_role;

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a funnel event"
  ON public.funnel_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read funnel events"
  ON public.funnel_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX funnel_events_step_idx ON public.funnel_events (step);
CREATE INDEX funnel_events_created_at_idx ON public.funnel_events (created_at DESC);
CREATE INDEX funnel_events_session_idx ON public.funnel_events (session_id);