# Task: Wire Up Genius Stage Persistence

**Assigned to:** Codex  
**Priority:** High  
**Created:** 2026-01-09

---

## Context

The `NextActionsPanel` component exists but clicking the action buttons doesn't save progress to the database.

---

## Files to Read First

1. `src/components/game/NextActionsPanel.tsx` — The component
2. `src/pages/CoreLoopHome.tsx` — Where it's integrated
3. `supabase/migrations/20260108220000_add_genius_stage.sql` — DB schema

---

## What to Build

### 1. Add `updateGeniusStage` function in CoreLoopHome.tsx

```tsx
const updateGeniusStage = async (newStage: GeniusStage) => {
  const profileId = await getOrCreateGameProfileId();
  await supabase
    .from('game_profiles')
    .update({ genius_stage: newStage })
    .eq('id', profileId);
  setGeniusStage(newStage);
};
```

### 2. Pass it to NextActionsPanel

```tsx
<NextActionsPanel
  completedSteps={completedSteps}
  nextActions={nextActions}
  onActionClick={(action) => {
    // Navigate to route
    navigate(action.route);
    // If it's a genius action, advance stage
    if (action.type === 'genius') {
      updateGeniusStage(getNextStage(geniusStage));
    }
  }}
/>
```

### 3. Add `getNextStage` helper

```tsx
const getNextStage = (current: GeniusStage): GeniusStage => {
  const sequence: GeniusStage[] = ['entry', 'articulate', 'useful', 'monetize', 'complete'];
  const currentIndex = sequence.indexOf(current);
  return sequence[Math.min(currentIndex + 1, sequence.length - 1)];
};
```

---

## Success Criteria

- [ ] Clicking "Continue Discovery" on NextActionsPanel updates genius_stage in database
- [ ] Page reload shows correct stage (persisted)
- [ ] No TypeScript errors

---

## When Done

Rename this file to `DONE_wire_genius_stage.md`
