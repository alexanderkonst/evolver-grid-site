# Fix Onboarding Flow Routing

**Agent:** Codex  
**Priority:** 🔴 HIGH  
**Status:** PENDING

## Problem

On `/game` and `/start`:
- Clicking "Begin" or "Skip" loops back to `/start`
- Users get trapped in broken loop
- Onboarding never completes

## Expected Flow

```
/start → "Start" → /zone-of-genius/entry
/zone-of-genius/entry → Complete ZoG → /quality-of-life-map/assessment
/quality-of-life-map → Complete QoL → /game (with sidebar)
```

## Files to Check

- `src/pages/OnboardingStart.tsx` - Where does "Start" button go?
- `src/modules/onboarding/OnboardingFlow.tsx` - Step navigation logic
- `src/components/game/GameShell.tsx` - Redirect logic (lines 182-188)

## Fix Required

1. **"Start" button** should navigate to `/zone-of-genius/entry`
2. **After ZoG complete** → navigate to `/quality-of-life-map/assessment`
3. **After QoL complete** → navigate to `/game`

## Success Criteria
- [ ] "Start" on `/start` leads to ZoG entry
- [ ] Completing ZoG leads to QoL
- [ ] Completing QoL leads to game with sidebar

## When Done
Rename to `DONE_fix_onboarding_routing.md`
