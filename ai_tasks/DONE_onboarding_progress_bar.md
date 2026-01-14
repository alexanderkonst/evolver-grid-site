# Task: Add Onboarding Progress Bar

## Priority: Medium
## Complexity: Medium

## Description
Add visual progress indicator to onboarding flow showing current step / total steps.

## Files to Modify
- `src/pages/OnboardingStart.tsx`
- `src/modules/zone-of-genius/ZoneOfGeniusAssessmentLayout.tsx`
- `src/modules/quality-of-life-map/QolLayout.tsx`

## Implementation

### Progress Bar Component
Use pattern from GeniusSpark:
```tsx
const OnboardingProgress = ({ current, total }: { current: number; total: number }) => {
  const progress = (current / total) * 100;
  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex justify-between text-sm text-slate-500 mb-2">
        <span>Step {current} of {total}</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#8460ea] to-[#a4a3d0] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
```

### Step Counts
- OnboardingStart: Show overall journey progress
- ZoG Assessment: 5 steps (Step 0-4)
- QoL Assessment: 4 steps (assessment, results, priorities, recipe)

## Acceptance Criteria
- [ ] Progress bar visible on all onboarding pages
- [ ] Gradient matches wabi-sabi palette
- [ ] Step count updates correctly
- [ ] Smooth transition animation
