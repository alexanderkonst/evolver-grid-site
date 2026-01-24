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
