# Task: Complete Events Space UI

**Assigned to:** Claude CLI  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

Events DB is ready (`supabase/migrations/20260110_create_events.sql`):
- `events` table: id, title, description, photo_url, event_date, event_time, location, created_by
- `event_rsvps` table: id, event_id, user_id, status (going/maybe/not_going)

**Current state:** EventsSpace.tsx shows "Coming Soon" placeholder.

---

## What to Build

### 1. Events hooks

**File:** `src/hooks/useEvents.ts`

```typescript
// Fetch all upcoming events
export const useEvents = () => { ... }

// Fetch single event by ID
export const useEvent = (eventId: string) => { ... }

// RSVP actions
export const useEventRsvp = (eventId: string) => { ... }
```

### 2. EventsSpace.tsx — List view

Replace placeholder with:
- List of upcoming events (cards)
- Each card: title, date, time, location, RSVP count
- Click → navigate to `/events/:id`
- "Create Event" button (for authenticated users)

### 3. EventDetail.tsx — Detail view  

Replace placeholder with:
- Event header (title, photo)
- Date, time, location
- Description
- RSVP button (Going / Maybe / Not Going)
- List of attendees (avatars)
- Back button

### 4. CreateEventForm component

- Title, description, date, time, location, photo upload
- Submit → creates event in DB
- Success → navigate to event detail

---

## DB Schema (Reference)

```sql
events: id, community_id, title, description, photo_url, 
        event_date, event_time, location, created_by, created_at

event_rsvps: id, event_id, user_id, 
             status ('going'|'maybe'|'not_going'), created_at
```

---

## Success Criteria

- [ ] EventsSpace shows list of events from DB
- [ ] EventDetail shows full event info
- [ ] RSVP works (going/maybe/not_going)
- [ ] Create event form works
- [ ] Mobile responsive
- [ ] TypeScript compiles

---

## When Done

Rename to `DONE_events_ui.md`
