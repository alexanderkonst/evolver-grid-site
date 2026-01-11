# Remove Duplicate Mission Items

**Agent:** Codex  
**Priority:** 🟡 MEDIUM  
**Status:** PENDING

## Problem

Profile section in sidebar has TWO mission items:
- "Mission Selection" → `/game/mission`
- "Mission Discovery" → `/mission-discovery`

This is confusing and redundant.

## Solution

Keep only ONE: "My Mission" or "Mission" → `/game/mission`

## File to Modify

`src/components/game/GameShell.tsx` - SPACES array (lines 52-58)

Remove:
```typescript
{ id: "mission", label: "Mission Discovery", path: "/mission-discovery" }
```

Keep:
```typescript
{ id: "mission-selection", label: "My Mission", path: "/game/mission" }
```

## Success Criteria
- [ ] Only one Mission item in Profile submenu
- [ ] Mission item links to `/game/mission`

## When Done
Rename to `DONE_remove_duplicate_mission.md`
