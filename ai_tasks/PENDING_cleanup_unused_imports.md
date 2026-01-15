# CODEX: Remove unused imports across codebase

## Objective
Find and remove unused imports to clean up the codebase.

## Scope
All `.tsx` and `.ts` files in `src/` directory

## Method
Run TypeScript compiler or eslint to find unused imports and remove them.

## Command to identify
```bash
npx eslint --rule '{"@typescript-eslint/no-unused-vars": "error"}' src/**/*.tsx --format compact
```

## Acceptance criteria
- [ ] No unused import warnings
- [ ] Build passes with no errors
- [ ] Commit with message: "Cleanup: remove unused imports"
