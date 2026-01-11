---
priority: low
agent: codex
---

# Regenerate Supabase TypeScript Types

## Goal
Update the auto-generated Supabase types to match the current database schema.

## Steps
1. Run: `npx supabase gen types typescript --project-id rjoqbmxbthlppobslyha > src/integrations/supabase/types.ts`
2. Fix any TypeScript errors that arise from the type changes
3. Ensure build passes

## Notes
- This may reveal that some columns referenced in code don't exist in the database
- If type errors appear, they indicate code/db schema mismatch that needs fixing
