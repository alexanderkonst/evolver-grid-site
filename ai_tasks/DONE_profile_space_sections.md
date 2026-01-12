# Task: Create Profile Section Components

## Context
ProfileSpace.tsx currently renders multiple boxes in Panel 3. 
We need to extract each "box" into a dedicated section component with its own route.

## Dependencies
PENDING_panel2_sections_expansion.md

## Files to Read
- `src/pages/spaces/ProfileSpace.tsx` — current multi-box implementation
- `src/components/game/GameShellV2.tsx` — wrapper pattern

## What to Build

### 1. Create `src/pages/spaces/sections/ProfileMissionSection.tsx`
Extract the "Mission Snapshot" card from ProfileSpace:
- Shows current mission commitment
- Edit button links to `/mission-discovery`
- Wrap in `GameShellV2`

```tsx
import GameShellV2 from "@/components/game/GameShellV2";
// ... copy mission loading logic from ProfileSpace
// ... render only the mission card UI
```

### 2. Create `src/pages/spaces/sections/ProfileAssetsSection.tsx`
Extract the "Saved Assets" expandable section:
- Show asset list
- Button to add more → `/asset-mapping`
- Wrap in `GameShellV2`

### 3. Create `src/pages/spaces/sections/ProfileOverview.tsx`
Simple overview showing:
- Quick profile summary
- Links to each section
- Wrap in `GameShellV2`

### 4. Simplify `ProfileSpace.tsx`
After extracting sections, ProfileSpace becomes the Overview route.
It should NOT render Mission card or Assets list — those are separate routes now.

## Success Criteria
- [ ] Three new files created in `src/pages/spaces/sections/`
- [ ] ProfileSpace.tsx simplified to overview only
- [ ] No duplicate UI between Overview and section components
- [ ] All components wrap properly in GameShellV2
- [ ] Build passes
