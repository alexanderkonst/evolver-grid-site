# Task: Event Timezone Handling

**Assigned to:** Claude CLI  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

Events need timezone support. User should see event time in their local timezone by default, but be able to switch.

---

## What to Build

### 1. Add timezone to events table

```sql
ALTER TABLE events ADD COLUMN timezone TEXT DEFAULT 'UTC';
```

Store original event timezone (e.g., 'Asia/Singapore', 'America/New_York').

### 2. Event creation: timezone picker

In CreateEventForm:
- Add timezone dropdown
- Default to user's browser timezone
- Common timezones list

### 3. Event display: local time conversion

Convert event time to user's local timezone:
```typescript
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const localTime = new Date(`${event.event_date}T${event.event_time}`)
  .toLocaleString('en-US', { timeZone: userTimezone });
```

### 4. Toggle to show original timezone

Add UI toggle:
```
🕐 7:00 PM (Your time)  [Show original ▼]
   → 9:00 PM Singapore Time
```

---

## Success Criteria

- [ ] Events store original timezone
- [ ] Display time in user's local timezone by default
- [ ] Can view original event timezone
- [ ] Creator can set event timezone

---

## When Done

Rename to `DONE_event_timezone.md`
