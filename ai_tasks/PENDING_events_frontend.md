# Task: Create Events Frontend UI

**Assigned to:** Codex  
**Priority:** High  
**Created:** 2026-01-10

---

## Context

We're adding an Events Space to the platform. This task creates the frontend components.

---

## Files to Read First

1. `src/pages/spaces/ProfileSpace.tsx` — Example space page structure
2. `src/components/game/GameShell.tsx` — Where to add nav item
3. `src/App.tsx` — Where to add routes

---

## What to Build

### 1. Create `src/pages/spaces/EventsSpace.tsx`

List view showing all events as cards.

```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import GameShell from "@/components/game/GameShell";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  photo_url: string;
  event_date: string;
  event_time: string;
  location: string;
}

const EventsSpace = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true });
    
    if (data) setEvents(data);
    setLoading(false);
  };

  return (
    <GameShell>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Events</h1>
        
        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-slate-500">No upcoming events</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map(event => (
              <div 
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-300 transition-colors"
              >
                {event.photo_url && (
                  <img src={event.photo_url} alt={event.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <div className="flex items-center gap-2 text-slate-600 text-sm mt-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{event.event_time}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-slate-600 text-sm mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GameShell>
  );
};

export default EventsSpace;
```

### 2. Create `src/pages/EventDetail.tsx`

Single event page with RSVP.

Include:
- Large photo
- Title, date, time, location
- Full description
- RSVP button (toggles going/not going)
- Add to Calendar link (Google Calendar URL)
- Count of people going

### 3. Modify `src/components/game/GameShell.tsx`

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

Import CalendarDays from lucide-react.

### 4. Modify `src/App.tsx`

Add routes:

```tsx
<Route path="/game/events" element={<EventsSpace />} />
<Route path="/events/:id" element={<EventDetail />} />
```

---

## Success Criteria

- [ ] EventsSpace shows list of upcoming events
- [ ] Clicking event navigates to detail page
- [ ] EventDetail shows full event info
- [ ] RSVP button works (saves to event_rsvps table)
- [ ] Add to Calendar generates Google Calendar URL
- [ ] Events appears in sidebar navigation
- [ ] No TypeScript errors

---

## When Done

Rename this file to `DONE_events_frontend.md`
