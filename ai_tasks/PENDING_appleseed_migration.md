# Task: Apply Appleseed/Excalibur Migration

**Assigned to:** Lovable  
**Priority:** High  
**Created:** 2026-01-11

---

## Context

Claude created migration file, but it needs to be applied in Supabase.

---

## What to Do

Apply the migration in Supabase:

**File:** `supabase/migrations/20260111_add_appleseed_excalibur.sql`

In Lovable, say:
> "Please apply the migration in `supabase/migrations/20260111_add_appleseed_excalibur.sql`"

Or manually run the SQL in Supabase Dashboard → SQL Editor.

---

## Success Criteria

- [ ] zog_snapshots table has new columns: appleseed_data, excalibur_data
- [ ] No errors when saving Appleseed/Excalibur

---

## When Done

Rename to `DONE_appleseed_excalibur_migration.md`
