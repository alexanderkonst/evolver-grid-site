# Task: Add Resonance Rating After ZoG & Genius Business

## Context

Users who complete Zone of Genius (Appleseed) and Genius Business (Excalibur) report **10/10 resonance** when asked how well it matches their self-perception. This is a critical validation metric we should capture.

## Requirements

### 1. After Appleseed Generation

After displaying the Zone of Genius result, show a rating question:

```
"From 1 to 10, how well does this match how you see yourself 
at your brightest — expressing your strongest talents?"

[1] [2] [3] [4] [5] [6] [7] [8] [9] [10]
```

**Implementation:**
- Show after `AppleseedDisplay` renders
- Store in `zog_snapshots` table: add column `resonance_rating` (integer 1-10)
- Show before the Save/Share buttons

### 2. After Genius Business Generation

After displaying Excalibur result, show similar question:

```
"From 1 to 10, how clearly does this describe the value 
you can bring to others?"

[1] [2] [3] [4] [5] [6] [7] [8] [9] [10]
```

**Implementation:**
- Show after `ExcaliburDisplay` renders
- Store in `zog_snapshots` table: add column `excalibur_resonance_rating` (integer 1-10)
- Show before Save/Share buttons

## UI Design

Simple horizontal button row, styled consistently with existing UI:
- Unselected: slate border, white bg
- Selected: filled with accent color
- After selection: brief celebration ("✨ Thank you!")

## Database Migration

```sql
ALTER TABLE zog_snapshots 
ADD COLUMN resonance_rating INTEGER CHECK (resonance_rating >= 1 AND resonance_rating <= 10),
ADD COLUMN excalibur_resonance_rating INTEGER CHECK (excalibur_resonance_rating >= 1 AND excalibur_resonance_rating <= 10);
```

## Priority

P1 — Important for validation metrics

## Files to Modify

- `src/components/zog/AppleseedDisplay.tsx`
- `src/components/zog/ExcaliburDisplay.tsx`
- `supabase/migrations/` — new migration file
- `src/integrations/supabase/types.ts` — regenerate after migration

---

*Task created: January 24, 2026 (Hackathon)*

---

## Notes from execution (2026-04-18 · Day 44)

### State at start

Partial. The `ResonanceRating` component itself was already built (`src/components/ui/ResonanceRating.tsx`, 71 lines, 1-10 buttons + "Thank you!" confirmation). Both display components had `onResonanceRating` as an optional prop and rendered the rating block when the prop was supplied:

- `src/modules/zone-of-genius/AppleseedDisplay.tsx` — lines 213-219
- `src/modules/zone-of-genius/ExcaliburDisplay.tsx` — lines 114-120

But **no caller passed the prop**, so the rating UI never rendered. And the `zog_snapshots` table had no columns for the rating, so even if the prop had been wired, there was nowhere to store the value.

### What shipped

| File | Change |
|---|---|
| `supabase/migrations/20260419193206_zog_snapshots_resonance_ratings.sql` | New migration. Adds `resonance_rating` and `excalibur_resonance_rating` INT columns to `zog_snapshots` with `CHECK (x BETWEEN 1 AND 10)` guards. Both nullable. Rollback is a simple `DROP COLUMN` pair. |
| `src/lib/saveResonanceRating.ts` | New helper. `saveResonanceRating(profileId, kind, rating)` resolves the latest snapshot via `game_profiles.last_zog_snapshot_id` (fallback: newest by `created_at`), clamps the rating to 1-10, updates the column. Never throws into the UI. |
| `src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx` | Wire `onResonanceRating` on both Appleseed (post-Appleseed-reveal step) and Excalibur (post-Excalibur-reveal step) so the rating UI finally renders during the live flow. |
| `src/pages/AppleseedView.tsx` | Wire `onResonanceRating` on the revisit view. Also track `profileId` (was only `profileUrl` before) so the rating can be persisted. |
| `src/pages/ExcaliburView.tsx` | Same pattern as AppleseedView — add `profileId` state + wire `onResonanceRating`. |

### What I did NOT touch

- `src/components/ui/ResonanceRating.tsx` — already correct; one-shot `hasRated` guard prevents double-submission.
- `src/integrations/supabase/types.ts` — generated file. The migration adds two columns; the types file will be regenerated on the next Supabase type sync. `saveResonanceRating` casts at the `.update()` boundary only, so TS doesn't complain in the meantime.
- `supabase/functions/save-zog-result/index.ts` — not modified. Ratings land via a post-save client update, not via the save-zog-result edge function. The rating is captured AFTER the reveal (which implies the snapshot already exists), so a separate write is correct here.

### Acceptance

| Requirement | Verified |
|---|---|
| After Appleseed reveal, 1-10 rating appears before Save/Share | ✅ — renders via `{onResonanceRating && ...}` now that callers pass the prop |
| After Excalibur reveal, 1-10 rating appears before Save | ✅ — same pattern |
| Rating persists to `zog_snapshots.resonance_rating` / `excalibur_resonance_rating` | ✅ — migration + helper |
| Rating UI uses consistent styling | ✅ — unchanged from the shared component |
| After-selection confirmation ("✨ Thank you!") | ✅ — unchanged from the shared component |
| Build passes | ✅ |
| Tests pass | ✅ 73/73 |
| Corpus drift | ✅ GREEN |

### Migration deploy step

Run `supabase db push` (or equivalent) once to apply `20260419193206_zog_snapshots_resonance_ratings.sql`. Rollback: `ALTER TABLE public.zog_snapshots DROP COLUMN resonance_rating, DROP COLUMN excalibur_resonance_rating;`
