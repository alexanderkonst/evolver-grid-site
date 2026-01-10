-- Events Space: events and event_rsvps tables

-- =============================================================================
-- EVENTS TABLE
-- =============================================================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID, -- FK to communities can be added when that table exists
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for listing events by date
CREATE INDEX idx_events_date ON public.events(event_date);

-- Index for community filtering
CREATE INDEX idx_events_community ON public.events(community_id);

-- =============================================================================
-- EVENT RSVPS TABLE
-- =============================================================================
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Index for counting RSVPs per event
CREATE INDEX idx_rsvps_event ON public.event_rsvps(event_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Events: Anyone can read
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

-- Events: Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Events: Only creator can update
CREATE POLICY "Users can update own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = created_by);

-- Events: Only creator can delete
CREATE POLICY "Users can delete own events"
  ON public.events FOR DELETE
  USING (auth.uid() = created_by);

-- RSVPs: Anyone authenticated can create
CREATE POLICY "Users can RSVP"
  ON public.event_rsvps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RSVPs: Users can read all RSVPs
CREATE POLICY "RSVPs are viewable by everyone"
  ON public.event_rsvps FOR SELECT
  USING (true);

-- RSVPs: Users can update own RSVP
CREATE POLICY "Users can update own RSVP"
  ON public.event_rsvps FOR UPDATE
  USING (auth.uid() = user_id);

-- RSVPs: Users can delete own RSVP
CREATE POLICY "Users can delete own RSVP"
  ON public.event_rsvps FOR DELETE
  USING (auth.uid() = user_id);