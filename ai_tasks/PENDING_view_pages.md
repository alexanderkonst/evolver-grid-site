# Task: Appleseed/Excalibur View Pages

**Assigned to:** Claude CLI  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

After saving Appleseed/Excalibur, users need to be able to view them again.
Currently there's no dedicated route for viewing saved Appleseed/Excalibur.

---

## What to Build

### 1. AppleseedViewPage

**File:** `src/pages/AppleseedView.tsx`

- Load appleseed_data from zog_snapshots
- Display using AppleseedDisplay component
- Back button to profile

**Route:** `/zone-of-genius/appleseed`

### 2. ExcaliburViewPage

**File:** `src/pages/ExcaliburView.tsx`

- Load excalibur_data from zog_snapshots
- Display using ExcaliburDisplay component
- Back button to profile

**Route:** `/zone-of-genius/excalibur`

### 3. Add routes

In `App.tsx`:
```tsx
<Route path="/zone-of-genius/appleseed" element={<AppleseedView />} />
<Route path="/zone-of-genius/excalibur" element={<ExcaliburView />} />
```

### 4. Update summary card links

In `AppleseedSummaryCard` and `ExcaliburSummaryCard`, link to these pages.

---

## Success Criteria

- [ ] /zone-of-genius/appleseed shows saved Appleseed
- [ ] /zone-of-genius/excalibur shows saved Excalibur
- [ ] Summary cards link correctly
- [ ] 404 or redirect if no data exists

---

## When Done

Rename to `DONE_view_pages.md`
