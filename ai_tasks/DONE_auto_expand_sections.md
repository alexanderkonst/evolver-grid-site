# Task: Auto-Expand Active Parent Section

## Priority: HIGH

## Description
When navigating to a sub-section (e.g., `/game/path/body`), the parent section ("Growth Paths") should auto-expand to show the active item.

## File to Modify
`src/components/game/SectionsPanel.tsx`

## Current Problem
- `expandedSections` state starts empty: `useState<Record<string, boolean>>({})`
- When user lands on `/game/path/body`, the "Growth Paths" section stays collapsed
- User can't see which sub-item is active

## Required Changes

1. **Add useEffect to auto-expand**: On component mount and route change, check if current path matches any subSection path. If yes, expand the parent.

```tsx
useEffect(() => {
    // Find which sections have active sub-items
    const newExpanded: Record<string, boolean> = {};
    
    spaceData.sections.forEach(section => {
        if (section.subSections) {
            const hasActiveChild = section.subSections.some(
                sub => isActive(sub.path)
            );
            if (hasActiveChild) {
                newExpanded[section.id] = true;
            }
        }
    });
    
    setExpandedSections(prev => ({ ...prev, ...newExpanded }));
}, [location.pathname]);
```

2. **import useEffect** from React

## Acceptance Criteria
- [ ] When navigating to `/game/path/body`, "Growth Paths" auto-expands
- [ ] "Body" appears highlighted as active
- [ ] User can still manually collapse/expand sections
- [ ] Works for all spaces with subSections (Profile, Transformation)

## Test
1. Go directly to `/game/path/body` (type URL)
2. Verify Panel 2 shows "Growth Paths" expanded with "Body" highlighted
