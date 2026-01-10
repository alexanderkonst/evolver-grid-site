# Task: EventDetail Page

**Assigned to:** Claude CLI  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

EventDetail.tsx currently shows placeholder.
Components exist but not wired:
- RsvpButton.tsx
- EventCard.tsx
- useEvent hook

---

## What to Build

### 1. Update EventDetail.tsx

Replace placeholder with full event view:

```typescript
import { useParams, Link } from "react-router-dom";
import { useEvent, useEventRsvp } from "@/hooks/useEvents";
import RsvpButton from "@/components/events/RsvpButton";

const EventDetail = () => {
  const { id } = useParams();
  const { event, attendees, loading, error } = useEvent(id);
  const rsvp = useEventRsvp(id);
  
  // Show:
  // - Event header (title, photo)
  // - Date, time, location
  // - Description
  // - RSVP button
  // - Attendee list
  // - Back to events link
};
```

### 2. Ensure route exists

In App.tsx:
```tsx
<Route path="/events/:id" element={<EventDetail />} />
```

### 3. Link from EventCard

EventCard should navigate to `/events/{id}` on click.

---

## UI Layout

```
┌─────────────────────────────────┐
│ [← Back]                        │
│                                 │
│ [Event Photo]                   │
│                                 │
│ Event Title                     │
│ 📅 Saturday, Jan 11, 2026       │
│ 🕐 7:00 PM                      │
│ 📍 Mexico City                  │
│                                 │
│ Description text here...        │
│                                 │
│ [Going ✓] [Maybe] [Not Going]   │
│                                 │
│ Attendees (3)                   │
│ [Avatar] [Avatar] [Avatar]      │
└─────────────────────────────────┘
```

---

## Success Criteria

- [ ] Event details display correctly
- [ ] RSVP buttons work
- [ ] Attendee list shows
- [ ] Mobile responsive

---

## When Done

Rename to `DONE_event_detail.md`
