# Onboarding Stage Transitions

> **Status**: PENDING  
> **Agent**: CLAUDE  
> **Priority**: Medium

## Objective
Automatically update onboarding_stage in game_profiles after key actions.

## Stage Progression
- `new` → `zog_started` (when ZoG begins)
- `zog_started` → `zog_complete` (when Appleseed saved)
- `zog_complete` → `qol_started` (when QoL begins)
- `qol_started` → `qol_complete` (when QoL saved)
- `qol_complete` → `offer_complete` (when Excalibur saved)

## Files to Modify
- `/src/modules/zone-of-genius/saveToDatabase.ts` - Update stage on save
- `/src/pages/QualityOfLifeMapResults.tsx` - Update stage on save

## Acceptance Criteria
- [ ] Stage updates automatically
- [ ] Panel unlock logic reflects new stages
- [ ] Build passes
