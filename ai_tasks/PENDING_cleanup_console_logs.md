---
priority: low
agent: codex
---

# Remove Console.log Statements from Production Code

## Goal
Clean up all console.log, console.error, console.warn statements from production code to reduce noise and improve performance.

## Scope
- `src/**/*.tsx`
- `src/**/*.ts`
- Exclude: `supabase/functions/**` (edge functions may need logging)

## Acceptance Criteria
1. No `console.log` statements in src/ directory
2. Keep error-handling `console.error` only in catch blocks
3. Build passes without errors

## Command to verify
```bash
grep -r "console.log" src/ --include="*.tsx" --include="*.ts" | wc -l
# Should return 0
```
