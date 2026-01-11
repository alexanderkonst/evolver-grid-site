# Task: Events UX Improvements

**Assigned to:** Claude CLI  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

Multiple Events improvements needed for better UX.

---

## What to Build

### 1. Rename subtitle

In `EventsSpace.tsx`:
- Change "Community Gatherings" → "Gatherings and Experiences"

### 2. Filter events by location/community

Add filter UI at top of EventsSpace:
```tsx
<select onChange={...}>
  <option value="all">All Events</option>
  <option value="location">By Location</option>
  <option value="community">By Community</option>
</select>
```

When filtered:
- By location: group by location field
- By community: filter by community_id

### 3. Sorting by date

Events should already be sorted by date (ascending).
Verify this is working in `useEvents.ts`:
```typescript
.order("event_date", { ascending: true })
```

### 4. Community-specific event pages

Create route: `/events/community/:communityId`
- Shows only events for that community
- Header with community name

---

## Success Criteria

- [ ] Subtitle says "Gatherings and Experiences"
- [ ] Can filter events by location
- [ ] Can filter events by community
- [ ] Events sorted by date (nearest first)
- [ ] Community event pages work

---

## When Done

Rename to `DONE_events_ux.md`
