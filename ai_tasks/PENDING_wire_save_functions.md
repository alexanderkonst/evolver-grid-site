# Task: Wire Save Functions in ZoneOfGeniusEntry

**Assigned to:** Claude CLI  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

`saveToDatabase.ts` was created but needs to be wired into `ZoneOfGeniusEntry.tsx`.

Currently `handleSaveAppleseed` and `handleSaveExcalibur` have TODO comments.

---

## What to Build

### 1. Import save functions

In `ZoneOfGeniusEntry.tsx`:
```typescript
import { saveAppleseed, saveExcalibur } from "./saveToDatabase";
```

### 2. Update handleSaveAppleseed

```typescript
const handleSaveAppleseed = async () => {
  if (!appleseed) return;
  
  try {
    await saveAppleseed(userId, appleseed);
    toast({ title: "Appleseed saved!" });
  } catch (err) {
    toast({ title: "Error saving", variant: "destructive" });
  }
};
```

### 3. Update handleSaveExcalibur

```typescript
const handleSaveExcalibur = async () => {
  if (!excalibur) return;
  
  try {
    await saveExcalibur(userId, excalibur);
    toast({ title: "Excalibur saved!" });
    navigate(returnPath);
  } catch (err) {
    toast({ title: "Error saving", variant: "destructive" });
  }
};
```

### 4. Get user ID

Use Supabase auth to get current user ID.

---

## Success Criteria

- [ ] Appleseed saves to DB on button click
- [ ] Excalibur saves to DB on button click
- [ ] Toast notifications work
- [ ] TypeScript compiles

---

## When Done

Rename to `DONE_wire_save_functions.md`
