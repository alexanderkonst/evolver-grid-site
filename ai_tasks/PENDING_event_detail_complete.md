# Task: Complete Event Detail Page

**Assigned to:** Claude CLI  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

Event detail page exists but may need to be completed with full functionality.

---

## What to Build

### 1. Verify EventDetail.tsx is complete

Check if page shows:
- Event photo (if exists)
- Title
- Date & Time (formatted nicely)
- Location
- Description
- RSVP buttons (Going/Maybe/Can't Go)
- Attendee count
- Back to events link

### 2. Format date/time nicely

```typescript
// Format: "Saturday, January 11, 2026 at 7:00 PM"
const formattedDate = new Date(`${event.event_date}T${event.event_time}`)
  .toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
```

### 3. Add attendee avatars

Show list of people who RSVP'd "Going":
- Small avatars in a row
- "+5 more" if many

### 4. Ensure route exists

```tsx
<Route path="/events/:id" element={<EventDetail />} />
```

---

## Success Criteria

- [ ] Full event details display
- [ ] Date/time formatted nicely
- [ ] RSVP works
- [ ] Attendees shown
- [ ] Mobile responsive

---

## When Done

Rename to `DONE_event_detail_complete.md`
