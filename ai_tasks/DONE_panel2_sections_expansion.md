# Task: Expand SectionsPanel SPACE_SECTIONS Config

## Context
The three-panel navigation currently shows too few items in Panel 2 (SectionsPanel). 
Each space should list ALL its content items in the left sidebar, not just 1-2 entries.

## Files to Read
- `src/components/game/SectionsPanel.tsx` — current SPACE_SECTIONS config
- `src/pages/spaces/ProfileSpace.tsx` — see what boxes exist
- `src/pages/spaces/TransformationSpace.tsx` — see what boxes exist
- `src/pages/spaces/MarketplaceSpace.tsx` — see what boxes exist

## What to Build
Update `SPACE_SECTIONS` in `SectionsPanel.tsx`:

```typescript
profile: {
  title: "Profile",
  sections: [
    { id: "overview", label: "Overview", path: "/game/profile" },
    { id: "mission", label: "My Mission", path: "/game/profile/mission" },
    {
      id: "zog",
      label: "Zone of Genius",
      path: "/zone-of-genius/entry",
      subSections: [
        { id: "appleseed", label: "Appleseed", path: "/zone-of-genius/appleseed" },
        { id: "excalibur", label: "Excalibur", path: "/zone-of-genius/excalibur" },
      ],
    },
    {
      id: "qol",
      label: "Quality of Life",
      path: "/quality-of-life-map/assessment",
      subSections: [
        { id: "assessment", label: "Assessment", path: "/quality-of-life-map/assessment" },
        { id: "results", label: "Results", path: "/quality-of-life-map/results" },
      ],
    },
    { id: "assets", label: "Assets", path: "/game/profile/assets" },
  ],
},
transformation: {
  title: "Transformation",
  sections: [
    { id: "overview", label: "Overview", path: "/game/transformation" },
    { id: "library", label: "Practice Library", path: "/library" },
    {
      id: "paths",
      label: "Growth Paths",
      path: "/growth-paths",
      subSections: [
        { id: "body", label: "Body", path: "/game/path/body" },
        { id: "mind", label: "Mind", path: "/game/path/mind" },
        { id: "emotions", label: "Emotions", path: "/game/path/emotions" },
        { id: "spirit", label: "Spirit", path: "/game/path/spirit" },
        { id: "genius", label: "Uniqueness", path: "/game/path/genius" },
      ],
    },
    { id: "tests", label: "Personality Tests", path: "/resources/personality-tests" },
  ],
},
marketplace: {
  title: "Marketplace",
  sections: [
    { id: "genius-offer", label: "Genius Offer", path: "/genius-offer" },
    { id: "public-page", label: "My Public Page", path: "/marketplace/create-page" },
    { id: "browse", label: "Browse Guides", path: "/game/marketplace/browse" },
  ],
},
events: {
  title: "Events",
  sections: [
    { id: "browse", label: "Browse Events", path: "/game/events" },
    { id: "my-rsvps", label: "My RSVPs", path: "/game/events/my-rsvps" },
    { id: "create", label: "Create Event", path: "/game/events/create" },
  ],
},
```

Keep existing `teams` and `coop` sections unchanged.

## Success Criteria
- [ ] SectionsPanel shows expanded items for Profile, Transformation, Marketplace, Events
- [ ] No TypeScript errors
- [ ] Build passes: `npm run build`
