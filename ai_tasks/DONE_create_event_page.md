# Task: Create Event Page

## Context
Users should be able to create new events. Currently no create event UI.

## Files to Read
- `src/pages/events/EventDetail.tsx` — for event data structure
- Database schema for events table
- `src/pages/spaces/EventsSpace.tsx` — for context

## What to Build

1. Create new page:
```tsx
// src/pages/events/CreateEvent.tsx
```

2. Form fields:
- Title (required)
- Description (textarea)
- Date & Time (datetime picker)
- Location (text)
- Community (dropdown, optional)
- Image URL (optional)

3. Protected route — require authentication

4. On submit:
- Insert to events table
- Show success toast
- Redirect to event detail

5. Add route:
```tsx
<Route path="/game/events/create" element={<CreateEvent />} />
```

6. Wrap in GameShellV2

## Success Criteria
- [ ] CreateEvent page with form
- [ ] Validation for required fields
- [ ] Protected route (auth required)
- [ ] Saves to database
- [ ] Redirects on success
- [ ] Build passes
