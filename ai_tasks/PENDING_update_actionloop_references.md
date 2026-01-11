---
priority: medium
agent: codex
---

# Update ActionLoop Type References

## Goal
The `ActionLoop` type was updated: `matchmaking` → `teams`. Update any remaining references.

## Files to Check
- `src/lib/actionEngine.ts` (already done)
- `src/types/actions.ts` (already done)
- `src/lib/__tests__/actionEngine.test.ts`
- Any files using `loop: "matchmaking"`

## Changes
Replace all instances of:
```typescript
loop: "matchmaking"
```
with:
```typescript
loop: "teams"
```

## Acceptance Criteria
1. `npm run build` passes
2. `npm test` passes (if tests exist for this)
3. No remaining `matchmaking` string literals in action/loop contexts
