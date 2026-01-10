# Task: Integrate Events UI Components

**Assigned to:** Claude CLI  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

Events components were created but not wired into the pages:
- `src/components/events/CreateEventForm.tsx`
- `src/components/events/EventCard.tsx`
- `src/components/events/RsvpButton.tsx`
- `src/hooks/useEvents.ts`

The pages still show "Coming Soon" placeholders:
- `src/pages/spaces/EventsSpace.tsx`
- `src/pages/EventDetail.tsx`

---

## What to Build

### 1. Update EventsSpace.tsx

Replace "Coming Soon" with:
```tsx
import { useEvents } from "@/hooks/useEvents";
import EventCard from "@/components/events/EventCard";
import CreateEventForm from "@/components/events/CreateEventForm";

// Show list of upcoming events
// Show CreateEventForm for authenticated users
// Empty state if no events
```

### 2. Update EventDetail.tsx

Replace placeholder with:
```tsx
import { useEvent } from "@/hooks/useEvents";
import RsvpButton from "@/components/events/RsvpButton";

// Get event by ID from URL params
// Show full event details
// Show RSVP button
// Show attendee list
```

### 3. Add route for event detail

In App.tsx, ensure route exists:
```tsx
<Route path="/events/:id" element={<EventDetail />} />
```

---

## Success Criteria

- [ ] EventsSpace shows list of events from DB
- [ ] EventDetail shows single event with RSVP
- [ ] Create event form works
- [ ] Navigation works between list and detail
- [ ] Mobile responsive

---

## When Done

Rename to `DONE_events_integration.md`
