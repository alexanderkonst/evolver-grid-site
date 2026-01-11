# Fix Sidebar Visibility During Onboarding

**Agent:** Codex  
**Priority:** 🔴 CRITICAL  
**Status:** PENDING

## Problem

Sidebar is visible on `/start`, `/zone-of-genius/entry`, and during ZoG/QoL flows. 
Per customer journey, sidebar should be **hidden** until QoL is complete.

## Root Cause

The `showSidebar` logic in `GameShell.tsx` checks `onboarding_stage`, but:
1. For anonymous users, `onboarding_stage` may be `null`
2. Pages like `/zone-of-genius/entry` may not use GameShell at all

## Fix Required

### 1. Update GameShell.tsx (lines 180-196)

Current:
```typescript
const showSidebar = !profile?.onboarding_stage || ["qol_complete", "unlocked"].includes(profile.onboarding_stage);
```

Should be:
```typescript
const showSidebar = profile?.onboarding_stage && ["qol_complete", "unlocked"].includes(profile.onboarding_stage);
```

### 2. Ensure ZoG/QoL routes DON'T use GameShell

Check these routes:
- `/zone-of-genius/entry` 
- `/zone-of-genius/assessment/*`
- `/quality-of-life-map/*`
- `/start`

They should use `OnboardingShell` (no sidebar) instead of `GameShell`.

## Files to Modify
- `src/components/game/GameShell.tsx`
- `src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx` (check wrapper)
- `src/pages/OnboardingStart.tsx` (check wrapper)

## Success Criteria
- [ ] Anonymous user on `/start` sees NO sidebar
- [ ] User on `/zone-of-genius/entry` sees NO sidebar
- [ ] After QoL complete, sidebar appears on `/game`

## When Done
Rename to `DONE_fix_sidebar_visibility.md`
