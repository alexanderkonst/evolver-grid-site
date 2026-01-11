# Task: Add to Calendar Button

**Assigned to:** Claude CLI  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

After RSVP, user should be able to add event to their calendar.

---

## What to Build

### 1. Add to Calendar component

**File:** `src/components/events/AddToCalendarButton.tsx`

Props:
```typescript
interface AddToCalendarProps {
  title: string;
  description?: string;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM:SS
  location?: string;
  durationMinutes?: number;
}
```

### 2. Generate calendar links

**Google Calendar:**
```
https://calendar.google.com/calendar/render?action=TEMPLATE
  &text={title}
  &dates={startDateTime}/{endDateTime}
  &details={description}
  &location={location}
```

**iCal (.ics file):**
Generate .ics file download

### 3. Add to EventDetail page

Show button after RSVP:
```tsx
{hasRsvp && <AddToCalendarButton event={event} />}
```

---

## UI

```
[📅 Add to Calendar ▼]
  → Google Calendar
  → Apple Calendar
  → Outlook
  → Download .ics
```

---

## Success Criteria

- [ ] Add to Calendar button appears
- [ ] Google Calendar link works
- [ ] .ics download works
- [ ] Shows after user RSVPs

---

## When Done

Rename to `DONE_add_to_calendar.md`
