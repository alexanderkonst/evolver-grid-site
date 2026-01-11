---
priority: medium
agent: claude-cli
estimated_time: 30min
---

# Implement Onboarding Progress Banner

## Context
Per the implementation plan, users in onboarding should see a top banner showing their progress through the 8-step journey.

## Design
```
┌─────────────────────────────────────────────────────────┐
│ ⚡ Step 3 of 8: Complete Quality of Life Assessment     │
│ ████████████░░░░░░░░░░                    [Continue →] │
└─────────────────────────────────────────────────────────┘
```

## Requirements

### 1. Create OnboardingBanner Component
- Shows current step number and name
- Progress bar visualization
- CTA button to continue

### 2. Show Based on onboarding_stage
Map stages to steps:
- `new` → Step 1
- `zog_started` → Step 2
- `zog_complete` → Step 3
- `qol_started` → Step 4
- `qol_complete` → Step 5
- etc.

### 3. Integration Points
- Show in GameShellV2 above content area
- Or show as fixed top banner

## Files to Create/Modify
- `src/components/game/OnboardingBanner.tsx` - new component
- `src/components/game/GameShellV2.tsx` - integrate banner

## Acceptance Criteria
1. Banner shows for users in onboarding stages
2. Progress bar reflects current stage
3. CTA navigates to correct next step
4. Dismissable (optional)
5. Doesn't show for completed users
