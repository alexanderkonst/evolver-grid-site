---
priority: high
agent: codex
estimated_time: 30min
---

# Fix SpacesRail Navigation - Click Should Navigate

## Problem
Currently clicking icons in SpacesRail only updates the `activeSpaceId` state and shows corresponding sections in SectionsPanel, but does NOT navigate to the actual page.

## Expected Behavior
When user clicks an icon (e.g., Events calendar icon), the app should:
1. Navigate to `/game/events` (or corresponding route)
2. Update activeSpaceId
3. Show correct sections in SectionsPanel

## Current Code
In `SpacesRail.tsx`, the `onSpaceSelect` only calls:
```tsx
onSpaceSelect(space.id);
```

## Required Change
Update to also navigate:
```tsx
import { useNavigate } from "react-router-dom";

// In SpacesRail component:
const navigate = useNavigate();

// In click handler:
const handleSpaceClick = (space: Space) => {
    if (isLocked) return;
    onSpaceSelect(space.id);
    navigate(space.path);
};
```

## Files to Modify
- `src/components/game/SpacesRail.tsx`

## Acceptance Criteria
1. Clicking unlocked space icon navigates to that space
2. URL updates to match the space (e.g., `/game/events`)
3. SectionsPanel updates to show correct sections
4. Build passes
