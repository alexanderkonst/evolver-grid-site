# Task: Save Appleseed + Excalibur to Database

**Assigned to:** Claude CLI / Lovable  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

Appleseed and Excalibur are generated but NOT saved to DB.
Current code has `// TODO: Save to database` comments.

---

## What to Build

### 1. Update `zog_snapshots` table schema (if needed)

Current table likely has basic ZoG fields. Need to add:
- `appleseed_data` (JSONB) — full Appleseed object
- `excalibur_data` (JSONB) — full Excalibur object
- `appleseed_generated_at` (TIMESTAMPTZ)
- `excalibur_generated_at` (TIMESTAMPTZ)

### 2. Create save functions

**File:** `src/modules/zone-of-genius/saveToDatabase.ts`

```typescript
export const saveAppleseed = async (userId: string, appleseed: AppleseedData) => {
  // Upsert into zog_snapshots
};

export const saveExcalibur = async (userId: string, excalibur: ExcaliburData) => {
  // Update existing snapshot with excalibur_data
};
```

### 3. Wire into ZoneOfGeniusEntry.tsx

Update `handleSaveAppleseed` and `handleSaveExcalibur` to call the save functions.

### 4. Load saved data

When user returns to ZoG page, load existing Appleseed/Excalibur if exists.

---

## Success Criteria

- [ ] Appleseed saves to zog_snapshots.appleseed_data
- [ ] Excalibur saves to zog_snapshots.excalibur_data
- [ ] User can reload page and see saved data
- [ ] TypeScript compiles

---

## When Done

Rename to `DONE_save_to_database.md`
