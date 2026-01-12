---
priority: low
agent: codex
estimated_time: 1h
---

# Remove Custom Letter-Spacing (tracking-) Unless Requested

## Context

Per UI Skills guidelines (`docs/ui_skills.md`):
> NEVER modify `letter-spacing` (`tracking-`) unless explicitly requested

Found 25+ files using `tracking-` classes.

## Task

Review each `tracking-` usage:
1. If in typography heading styles → May keep for brand
2. If arbitrary spacing → Remove
3. If in UI components → Remove

## Files to Audit

```bash
grep -r "tracking-" src --include="*.tsx"
```

Key files:
- `src/pages/CharacterSnapshot.tsx`
- `src/pages/GameHome.tsx`
- `src/pages/GeniusOffer.tsx`
- `src/pages/MensCircle.tsx`
- `src/modules/zone-of-genius/*.tsx`
- `src/components/ui/*.tsx` (may be from shadcn defaults - check)

## Decision Guide

**Keep if:**
- Part of heading typography system (H1, H2) per brand
- In a component that explicitly defines typography

**Remove if:**
- Arbitrary inline tracking
- No clear typography purpose

## Acceptance Criteria

1. Review all `tracking-` usages
2. Remove unnecessary ones
3. Document any kept and why
