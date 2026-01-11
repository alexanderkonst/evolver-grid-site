---
priority: medium
agent: claude-cli
estimated_time: 45min
---

# Implement Sub-Section Navigation with Proper Routing

## Context
SectionsPanel has sub-sections defined but they need proper routing integration. Currently sub-sections are UI-only.

## Requirements

### 1. Add Routes for Sub-Sections
Map each sub-section to an actual route. Example for Profile:
- "Zone of Genius" → `/game/profile/zone-of-genius`
- "Quality of Life" → `/game/profile/quality-of-life`
- "Assets & Skills" → `/game/profile/assets`

### 2. Update SPACE_SECTIONS in SectionsPanel.tsx
```tsx
{
    id: "zone-of-genius",
    label: "Zone of Genius",
    path: "/game/profile/zone-of-genius",  // Add path
}
```

### 3. Add Sub-Routes in App.tsx
Create nested routes or add specific routes for sub-sections.

### 4. Create Sub-Page Components (if needed)
Simple wrapper components that render specific content within ProfileSpace.

## Files to Modify
- `src/components/game/SectionsPanel.tsx` - add paths to sub-sections
- `src/App.tsx` - add routes for sub-sections
- `src/pages/spaces/ProfileSpace.tsx` - handle sub-section rendering (optional)

## Acceptance Criteria
1. Clicking sub-section navigates to correct route
2. Back button works correctly
3. Active state shows for both section and sub-section
4. Mobile navigation preserved
