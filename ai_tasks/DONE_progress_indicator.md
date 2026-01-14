# Add Progress Indicator to Onboarding

## Goal
Show users where they are in multi-step flows: "Step 3 of 5"

## Where to Add
- `/start` onboarding flow
- Zone of Genius assessment (`/zone-of-genius/assessment/*`)
- Quality of Life assessment (`/quality-of-life-map/assessment`)
- Any wizard with multiple steps

## Implementation
1. Create a `ProgressIndicator` component:
   - Props: `current: number`, `total: number`
   - Display: "Step {current} of {total}" or dots/progress bar
   
2. Add to relevant pages at top of content area

## Files to Check
- `src/pages/OnboardingStart.tsx`
- `src/modules/zone-of-genius/ZoneOfGeniusAssessmentLayout.tsx`
- `src/modules/quality-of-life-map/QolLayout.tsx`

## Acceptance
- User always knows their position in any multi-step flow
- Consistent visual across all wizards
