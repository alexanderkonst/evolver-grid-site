# Task: Events Space (Full Feature)

**Assigned to:** Claude CLI  
**Priority:** High  
**Created:** 2026-01-10

---

## Context

Build the complete Events Space: database schema + frontend UI. This is a full feature task.

---

## What to Build

### 1. Create migration file

Create `supabase/migrations/20260110_create_events.sql`

### 2. `events` table

```sql
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id),
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
```

### 3. `event_rsvps` table

```sql
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
```

### 4. RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Events: Anyone can read
CREATE POLICY "Events are viewable by everyone" 
  ON public.events FOR SELECT 
  USING (true);

-- Events: Only creator can update
CREATE POLICY "Users can update own events" 
  ON public.events FOR UPDATE 
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
```

---

## Part 2: Frontend UI

### 5. Create `src/pages/spaces/EventsSpace.tsx`

List view showing all events as cards with: photo, title, date/time, location.

### 6. Create `src/pages/EventDetail.tsx`

Single event page with:
- Large photo
- Title, date, time, location, full description
- RSVP button (saves to event_rsvps)
- Add to Calendar (Google Calendar URL)
- Count of people going

### 7. Modify `src/components/game/GameShell.tsx`

Add Events to GAME_SPACES array (after matchmaking, before coop):

```tsx
{
    id: "events",
    label: "Events",
    icon: <CalendarDays className="w-5 h-5" />,
    path: "/game/events",
    description: "Community gatherings"
}
```

### 8. Modify `src/App.tsx`

Add routes:
```tsx
<Route path="/game/events" element={<EventsSpace />} />
<Route path="/events/:id" element={<EventDetail />} />
```

---

## Success Criteria

- [ ] Migration file created with both tables
- [ ] RLS policies in place
- [ ] EventsSpace shows list of upcoming events
- [ ] Clicking event navigates to detail page
- [ ] RSVP button works
- [ ] Events appears in sidebar navigation
- [ ] No TypeScript or SQL errors

---

## When Done

Rename this file to `DONE_events_space.md`
