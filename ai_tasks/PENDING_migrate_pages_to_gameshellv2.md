---
priority: high
agent: codex
---

# Migrate Space Pages to GameShellV2

## Goal
Replace `GameShell` with `GameShellV2` in all space pages to enable the new three-panel navigation.

## Files to Update
1. `src/pages/spaces/TransformationSpace.tsx`
2. `src/pages/spaces/MarketplaceSpace.tsx`
3. `src/pages/spaces/TeamsSpace.tsx`
4. `src/pages/spaces/EventsSpace.tsx`
5. `src/pages/spaces/CoopSpace.tsx`

## Changes per File
1. Change import:
   ```tsx
   // FROM:
   import GameShell from "@/components/game/GameShell";
   
   // TO:
   import GameShellV2 from "@/components/game/GameShellV2";
   ```

2. Replace wrapper component:
   ```tsx
   // FROM:
   <GameShell>
     ...
   </GameShell>
   
   // TO:
   <GameShellV2>
     ...
   </GameShellV2>
   ```

## Acceptance Criteria
1. All 5 space pages use GameShellV2
2. Build passes (`npm run build`)
3. No TypeScript errors
