# Task: Add Routes for Single Path Section

## Priority: HIGH

## Description
Add route for the new PathSection component and update SPACE_SECTIONS to use consistent paths.

## Files to Modify

### 1. `src/App.tsx`

Add import:
```tsx
import PathSection from "./pages/spaces/transformation/PathSection";
```

Add route (near other /game/transformation routes):
```tsx
<Route path="/game/transformation/path/:pathId" element={<PathSection />} />
```

### 2. `src/components/game/SectionsPanel.tsx`

Update paths in transformation section (lines ~60-78):

```tsx
transformation: {
    title: "Transformation",
    sections: [
        { id: "today", label: "Today's Practice", path: "/game/transformation/today" },
        {
            id: "paths",
            label: "Growth Paths",
            path: "/game/transformation/paths",
            subSections: [
                { id: "body", label: "Body", path: "/game/transformation/path/body" },
                { id: "emotions", label: "Emotions", path: "/game/transformation/path/emotions" },
                { id: "mind", label: "Mind", path: "/game/transformation/path/mind" },
                { id: "genius", label: "Genius", path: "/game/transformation/path/genius" },
                { id: "spirit", label: "Spirit", path: "/game/transformation/path/spirit" },
            ],
        },
        { id: "library", label: "Practice Library", path: "/game/transformation/library" },
        { id: "tests", label: "Personality Tests", path: "/game/transformation/tests" },
    ],
},
```

Note: Changed from `/game/path/body` to `/game/transformation/path/body` for consistency.

## Acceptance Criteria
- [ ] Route `/game/transformation/path/body` works
- [ ] SectionsPanel sub-items link to new routes
- [ ] Clicking "Body" in Panel 2 shows single path in Panel 3
- [ ] Panel 2 stays visible with correct menu

## Test
1. Open `/game/transformation`
2. Expand "Growth Paths"
3. Click "Body"
4. Verify URL is `/game/transformation/path/body`
5. Verify Panel 3 shows only Body content
6. Verify Panel 2 still shows Transformation menu
