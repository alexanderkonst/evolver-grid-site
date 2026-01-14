# Fix Broken Links and Error Pages

## Goal
Audit all navigation paths and fix any broken links, 404s, or error states.

## Tasks

### 1. Audit Routes
Grep for all `<Link>` and `navigate()` calls:
```bash
grep -rn "to=\"/" src/ --include="*.tsx"
grep -rn "navigate(" src/ --include="*.tsx"
```
Compare against routes in `src/App.tsx`.

### 2. Fix Known Issues
- `/genius-offer` → should redirect to `/zone-of-genius/entry` (may already be fixed)
- Any `/marketplace/*` routes → verify they render

### 3. Add Missing Routes
If any Link targets don't have matching Routes, either:
- Add the Route
- Or remove the Link

### 4. Error Boundaries
Ensure `ErrorBoundary` component catches and displays friendly errors.

## Files
- `src/App.tsx` (routes)
- All files with `<Link>` or `navigate()`

## Acceptance
- No 404s when clicking any link in the app
- Error states show friendly message, not blank screen
