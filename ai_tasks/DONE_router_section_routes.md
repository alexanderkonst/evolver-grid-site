# Task: Add Section Routes to Router

## Context
New section components need routes in App.tsx.

## Dependencies
- PENDING_panel2_sections_expansion.md
- PENDING_profile_space_sections.md

## Files to Read
- `src/App.tsx` — current routing

## What to Build

Add these routes inside the existing route structure:

```tsx
import ProfileMissionSection from "@/pages/spaces/sections/ProfileMissionSection";
import ProfileAssetsSection from "@/pages/spaces/sections/ProfileAssetsSection";
import ProfileOverview from "@/pages/spaces/sections/ProfileOverview";

// In route config:
<Route path="/game/profile" element={<ProfileOverview />} />
<Route path="/game/profile/mission" element={<ProfileMissionSection />} />
<Route path="/game/profile/assets" element={<ProfileAssetsSection />} />
```

If the components don't exist yet (dependency not completed), skip them with TODO comment.

## Success Criteria
- [ ] New routes added to App.tsx
- [ ] Navigation from SectionsPanel works
- [ ] Build passes
