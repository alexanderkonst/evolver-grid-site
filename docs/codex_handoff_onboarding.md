# Codex Handoff: Onboarding & NextActionsPanel Completion

## Context

The `NextActionsPanel` component has been created but needs wiring to the database. This document provides everything Codex needs to complete the implementation.

---

## Files to Read

| File | Purpose |
|------|---------|
| `src/components/game/NextActionsPanel.tsx` | The component to wire up |
| `src/pages/CoreLoopHome.tsx` | Where it's integrated |
| `supabase/migrations/20260108220000_add_genius_stage.sql` | DB column for stage tracking |
| `docs/customer_journey_progression.md` | Business logic for unlocks |

---

## Task 1: Wire Up genius_stage Persistence

### Current State
- `genius_stage` column exists in migration (needs to be run)
- `CoreLoopHome` loads the stage but doesn't save changes

### Implementation

```tsx
// In CoreLoopHome.tsx - add this function
const updateGeniusStage = async (newStage: GeniusStage) => {
  const profileId = await getOrCreateGameProfileId();
  await supabase
    .from('game_profiles')
    .update({ genius_stage: newStage })
    .eq('id', profileId);
  setGeniusStage(newStage);
};
```

### When to Progress Stage

| Current Stage | User Action | New Stage |
|---------------|-------------|-----------|
| entry | Completes ZoG | articulate |
| articulate | Creates Genius Offer | useful |
| useful | First sale or monetization setup | monetize |
| monetize | Premium coaching enrolled | complete |

---

## Task 2: Add NextActionsPanel to "explore" Stage

Currently, `explore` stage uses old `MyNextMoveSection`. Replace with:

```tsx
// In CoreLoopHome.tsx, in the explore stage render
{onboardingStage === 'explore' && (
  <NextActionsPanel
    completedSteps={completedSteps}
    nextActions={[/* same logic as complete stage */]}
  />
)}
```

---

## Task 3: Create Welcome Popup

First-time user popup when entering "explore" stage:

```tsx
// New component: src/components/game/WelcomeModal.tsx
const WelcomeModal = ({ onClose }) => (
  <Dialog open onOpenChange={onClose}>
    <DialogContent>
      <h2>Welcome to Your Journey!</h2>
      <p>You've completed the foundation. Here are your two paths forward...</p>
      <Button onClick={onClose}>Let's Go!</Button>
    </DialogContent>
  </Dialog>
);
```

---

## Testing

1. Run migration in Lovable
2. Complete ZoG → verify stage changes to "articulate"
3. Check NextActionsPanel shows correct actions per stage
4. Verify completed steps show with green checkmarks

---

## Success Criteria

- [ ] genius_stage persists to database on progression
- [ ] NextActionsPanel appears in both explore and complete stages
- [ ] Welcome modal shows once for first-time users
- [ ] Stage progression follows unlock sequence
