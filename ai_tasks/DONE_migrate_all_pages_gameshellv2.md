---
priority: high
agent: codex
estimated_time: 1h
---

# Migrate All Pages from GameShell to GameShellV2

## Context

The new three-panel navigation (GameShellV2) is only active on a few pages. Most pages still use the old single-sidebar navigation (GameShell).

## Current State

### Already using GameShellV2 (7 pages) ✅
- `src/pages/spaces/EventsSpace.tsx`
- `src/pages/spaces/TransformationSpace.tsx`
- `src/pages/spaces/ProfileSpace.tsx`
- `src/pages/spaces/TeamsSpace.tsx`
- `src/pages/spaces/MarketplaceSpace.tsx`
- `src/pages/spaces/CoopSpace.tsx`
- `src/pages/TestNavigation.tsx`

### Still using old GameShell (12 files) ❌
- `src/pages/GameHome.tsx`
- `src/pages/CoreLoopHome.tsx`
- `src/pages/Matchmaking.tsx`
- `src/pages/Connections.tsx`
- `src/pages/PeopleDirectory.tsx`
- `src/pages/CommunityEvents.tsx`
- `src/pages/GrowthPathsPage.tsx`
- `src/pages/ExcaliburView.tsx`
- `src/pages/AppleseedView.tsx`
- `src/pages/MissionSelection.tsx`
- `src/pages/PublicPageEditor.tsx`
- `src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx`

## Task

For each file that still uses GameShell:

1. Change the import:
```tsx
// FROM:
import GameShell from "@/components/game/GameShell";

// TO:
import GameShellV2 from "@/components/game/GameShellV2";
```

2. Replace all `<GameShell>` tags with `<GameShellV2>`:
```tsx
// FROM:
<GameShell>
  {content}
</GameShell>

// TO:
<GameShellV2>
  {content}
</GameShellV2>
```

## Command to Find All

```bash
grep -r "GameShell" src --include="*.tsx" | grep -v "GameShellV2"
```

## Acceptance Criteria

1. No files import `GameShell` (only `GameShellV2`)
2. No `<GameShell>` tags in codebase (only `<GameShellV2>`)
3. All pages show the new three-panel navigation
4. App builds without errors
5. Navigation works correctly on all pages
