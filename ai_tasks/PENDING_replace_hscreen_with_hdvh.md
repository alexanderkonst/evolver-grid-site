---
priority: medium
agent: codex
estimated_time: 2h
---

# Replace h-screen / min-h-screen with h-dvh / min-h-dvh

## Context

Per UI Skills guidelines (`docs/ui_skills.md`):
> NEVER use `h-screen`, use `h-dvh`

`h-dvh` uses dynamic viewport height which correctly handles mobile browser chrome (URL bar, bottom nav).

## Files to Fix

Found 45+ files using `min-h-screen`. Most common locations:
- `src/pages/*.tsx` (majority)
- `src/components/*.tsx`
- `src/modules/*.tsx`

## Changes Required

Search and replace:
- `h-screen` → `h-dvh`
- `min-h-screen` → `min-h-dvh`

## Command to Find All

```bash
grep -r "h-screen" src --include="*.tsx"
```

## Acceptance Criteria

1. No occurrences of `h-screen` or `min-h-screen` in codebase
2. All replaced with `h-dvh` / `min-h-dvh`
3. App renders correctly on mobile (test with Chrome DevTools mobile view)
