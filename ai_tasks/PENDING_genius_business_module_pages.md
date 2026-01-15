# CLAUDE: Genius Business Navigation & Module Pages

## Priority: 🟠 MEDIUM-HIGH

## Goal
Add "Genius Business" section to Panel 2 under Profile with 5 sub-pages for modular content display.

## Implementation Plan

### 1. Update SectionsPanel.tsx
Add new section under Profile:
```tsx
{
  id: "genius-business",
  label: "Genius Business",
  icon: Briefcase,
  locked: !profile?.excalibur_data,
  subsections: [
    { id: "overview", label: "Overview" },
    { id: "audience", label: "Ideal Client" },
    { id: "promise", label: "Promise" },
    { id: "channels", label: "Channels" },
    { id: "vision", label: "Vision" },
  ]
}
```

### 2. Create Module Pages
```
src/pages/spaces/profile/GeniusBusiness.tsx       (overview)
src/pages/spaces/profile/GeniusBusinessAudience.tsx
src/pages/spaces/profile/GeniusBusinessPromise.tsx
src/pages/spaces/profile/GeniusBusinessChannels.tsx
src/pages/spaces/profile/GeniusBusinessVision.tsx
```

### 3. Add Routes in App.tsx
```tsx
<Route path="/game/profile/genius-business" element={<GeniusBusiness />} />
<Route path="/game/profile/genius-business/audience" element={<GeniusBusinessAudience />} />
// etc.
```

### 4. Module Page Template
Each page shows one section of ExcaliburData:
- Overview: businessIdentity (name + tagline) + essenceAnchor + offer
- Audience: idealClient
- Promise: transformationalPromise
- Channels: channels
- Vision: biggerArc

### Files to Create
1. `src/pages/spaces/profile/GeniusBusiness.tsx` [NEW]
2. `src/pages/spaces/profile/GeniusBusinessAudience.tsx` [NEW]
3. `src/pages/spaces/profile/GeniusBusinessPromise.tsx` [NEW]
4. `src/pages/spaces/profile/GeniusBusinessChannels.tsx` [NEW]
5. `src/pages/spaces/profile/GeniusBusinessVision.tsx` [NEW]

### Files to Modify
1. `src/App.tsx` - add routes
2. `src/components/game/SectionsPanel.tsx` - add section

### Acceptance Criteria
- [ ] "Genius Business" appears in Panel 2 under Profile
- [ ] Shows locked if no excalibur data
- [ ] Clicking opens Overview page
- [ ] Sub-navigation works for all 5 pages

## Assignee: CLAUDE
