# Mobile SpacesRail Props

> **Status**: PENDING  
> **Agent**: CODEX  
> **Priority**: Medium

## Objective
Pass userLevel and userXp props to the mobile version of SpacesRail in GameShellV2.

## Context
Desktop SpacesRail already receives these props (line 264-273 in GameShellV2.tsx).
Mobile version (line 328+) does not receive them yet.

## Files to Modify
- `/src/components/game/GameShellV2.tsx` - Add props to mobile SpacesRail around line 328

## Acceptance Criteria
- [ ] Mobile SpacesRail shows Level + XP
- [ ] Build passes
