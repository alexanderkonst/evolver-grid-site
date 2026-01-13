# Task: Audit All Space Pages Use GameShellV2

## Priority: MEDIUM

## Description
Ensure all space pages wrap their content in GameShellV2 component so the three-panel navigation works consistently.

## Files to Check

1. `src/pages/spaces/ProfileSpace.tsx`
2. `src/pages/spaces/TransformationSpace.tsx`
3. `src/pages/spaces/MarketplaceSpace.tsx`
4. `src/pages/spaces/TeamsSpace.tsx`
5. `src/pages/spaces/EventsSpace.tsx`
6. `src/pages/spaces/CoopSpace.tsx`
7. `src/pages/spaces/sections/*` (all files)
8. `src/pages/spaces/transformation/*` (all files)

## Check For Each File

1. **Imports GameShellV2**:
```tsx
import GameShellV2 from "@/components/game/GameShellV2";
```

2. **Wraps content**:
```tsx
const SomePage = () => {
    return (
        <GameShellV2>
            {/* Page content here */}
        </GameShellV2>
    );
};
```

3. **Does NOT nest multiple GameShellV2** (only one per page)

## Expected Findings

Files that likely need fixing:
- ProfileSpace.tsx (may be a redirect, needs to use GameShellV2)
- Any files that were created before the new navigation structure

## Acceptance Criteria
- [ ] All 6 space pages use GameShellV2
- [ ] All section pages use GameShellV2
- [ ] No GameShellV2 nesting issues
- [ ] Pages render correctly with all 3 panels

## Test
Navigate to each space and verify:
1. Panel 1 (SpacesRail) visible
2. Panel 2 (SectionsPanel) visible with correct menu
3. Panel 3 shows page content
