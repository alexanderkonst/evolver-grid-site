# Task: Fix GameShellV2 Space Detection

## Priority: HIGH

## Description
GameShellV2 needs to correctly detect which space is active based on URL, so that Panel 2 shows the correct menu items even when on sub-pages.

## File to Modify
`src/components/game/GameShellV2.tsx`

## Current Problem
When user is on `/game/transformation/path/body`, the shell may not correctly identify "transformation" as the active space, causing Panel 2 to show wrong content or disappear.

## Required Changes

1. **Improve space detection logic**:

```tsx
// Add helper to detect space from URL
const getSpaceFromPath = (pathname: string): string | undefined => {
    // Match /game/{space}/* pattern
    const match = pathname.match(/^\/game\/([^\/]+)/);
    if (match) {
        const space = match[1];
        // Map space aliases if needed
        const spaceMap: Record<string, string> = {
            "transformation": "transformation",
            "profile": "profile",
            "marketplace": "marketplace",
            "teams": "teams",
            "events": "events",
            "coop": "coop",
            "next-move": "next-move",
        };
        return spaceMap[space] || space;
    }
    return undefined;
};

// Use in component
const currentSpace = getSpaceFromPath(location.pathname);
```

2. **Pass spaceId to SectionsPanel**:
```tsx
<SectionsPanel 
    spaceId={currentSpace || "next-move"}
    // ... other props
/>
```

3. **Ensure SectionsPanel shows even when space detected**:
If `currentSpace` is found, always show SectionsPanel.

## Acceptance Criteria
- [ ] `/game/transformation/path/body` shows Transformation menu in Panel 2
- [ ] `/game/profile/mission` shows Profile menu in Panel 2
- [ ] All `/game/*` routes show correct Panel 2 menu
- [ ] Panel 2 never disappears unexpectedly

## Test
1. Navigate to `/game/transformation/path/body`
2. Verify Panel 2 shows "Transformation" title
3. Verify Growth Paths is expanded with Body highlighted
