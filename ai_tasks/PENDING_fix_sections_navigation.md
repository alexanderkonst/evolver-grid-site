---
priority: high
agent: codex
estimated_time: 20min
---

# Fix SectionsPanel Navigation - Click Should Navigate

## Problem
Clicking section items in SectionsPanel calls `onSectionSelect(path)` but this only works on mobile (triggers content view). On desktop, clicking sections should navigate to the actual route.

## Current Behavior
- Desktop: Clicking section does nothing (content doesn't change)
- Mobile: Clicking section switches to content view (but URL doesn't change)

## Required Change
In `GameShellV2.tsx`, update `handleSectionSelect`:

```tsx
const handleSectionSelect = (path: string) => {
    navigate(path);  // Add navigation
    setMobileView("content");
};
```

## Files to Modify
- `src/components/game/GameShellV2.tsx` - `handleSectionSelect` function

## Acceptance Criteria
1. Clicking section navigates to path
2. URL updates correctly
3. Content area shows correct page
4. Mobile behavior preserved (back button still works)
