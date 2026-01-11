---
priority: high
agent: codex
---

# One-Click RSVP for Events

## Goal
Change event subscription button to one-click RSVP behavior.

## Current Behavior
- User clicks "Subscribe" button
- Some intermediate step or redirect

## Desired Behavior
- User clicks **RSVP** button
- Immediately registers/subscribes to the event (one click)
- Shows confirmation toast
- Button changes to "Attending" or similar

## Files to Check
- `src/pages/spaces/EventsSpace.tsx`
- `src/pages/EventDetail.tsx`
- Any event-related components in `src/components/`

## Implementation
1. Find the current subscribe/register button
2. Rename to "RSVP"
3. Implement one-click action that:
   - Calls supabase to register user for event
   - Shows success toast
   - Updates button state to "Attending"

## Acceptance Criteria
1. Single click to RSVP
2. Button text changes after RSVP
3. User can see they're registered
