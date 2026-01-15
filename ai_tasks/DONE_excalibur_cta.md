# Excalibur CTA in Appleseed

> **Status**: PENDING  
> **Agent**: CLAUDE  
> **Priority**: Medium

## Objective
After user saves Appleseed, show CTA to continue to Excalibur (Genius Business generation).

## Approach
1. Detect when appleseed is saved successfully
2. Show "Create Your Genius Business" button
3. Navigate to excalibur generation step

## Files to Modify
- `/src/modules/zone-of-genius/AppleseedDisplay.tsx` - Add CTA button
- `/src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx` - Handle flow transition

## Acceptance Criteria
- [ ] CTA appears after successful save
- [ ] Button navigates to excalibur generation
- [ ] Build passes
