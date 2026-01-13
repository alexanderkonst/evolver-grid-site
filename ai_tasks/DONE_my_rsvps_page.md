# Task: Create My RSVPs Page

## Context
Users need to see events they've RSVP'd to. Currently no page for this.

## Files to Read
- `src/pages/spaces/EventsSpace.tsx` — for event display pattern
- `src/components/events/EventCard.tsx` — for card component
- Database schema for event_rsvps table

## What to Build

1. Create new page:
```tsx
// src/pages/events/MyRsvps.tsx
```

2. Query user's RSVPs:
```tsx
const { data: rsvps } = useQuery({
  queryKey: ['my-rsvps', userId],
  queryFn: async () => {
    const { data } = await supabase
      .from('event_rsvps')
      .select('*, events(*)')
      .eq('user_id', userId);
    return data;
  }
});
```

3. Display as grid of EventCards with RSVP status

4. Add route in App.tsx:
```tsx
<Route path="/game/events/my-rsvps" element={<MyRsvps />} />
```

5. Wrap in GameShellV2

## Success Criteria
- [ ] MyRsvps page created
- [ ] Shows user's RSVP'd events
- [ ] Route added to App.tsx
- [ ] Accessible from SectionsPanel
- [ ] Build passes
