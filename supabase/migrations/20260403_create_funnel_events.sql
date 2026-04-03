-- ╔═══════════════════════════════════════════════════════════════════╗
-- ║  FUNNEL ANALYTICS — Events table for ZoG→Quiz→Ignite→Booking   ║
-- ║  Created: April 3, 2026                                         ║
-- ╚═══════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.funnel_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  step text NOT NULL,
  source text,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz NOT NULL DEFAULT now(),
  page_url text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- Index for querying by session (funnel visualization)
CREATE INDEX IF NOT EXISTS idx_funnel_events_session 
  ON public.funnel_events (session_id, timestamp);

-- Index for querying by step (conversion analysis)
CREATE INDEX IF NOT EXISTS idx_funnel_events_step 
  ON public.funnel_events (step, timestamp);

-- RLS: Allow anonymous inserts (analytics are anonymous)
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous tracking)
CREATE POLICY "Anyone can insert funnel events"
  ON public.funnel_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can read (admin dashboard)
CREATE POLICY "Authenticated users can read funnel events"
  ON public.funnel_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Comment for documentation
COMMENT ON TABLE public.funnel_events IS 
  'Lightweight funnel analytics: tracks ZoG → Quiz → Ignite → Booking conversion pipeline. Anonymous session IDs, no PII.';
