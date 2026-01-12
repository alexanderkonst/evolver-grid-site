---
priority: low
agent: claude-cli
estimated_time: 2h
---

# Audit Gradients and Remove Unless Explicitly Needed

## Context

Per UI Skills guidelines (`docs/ui_skills.md`):
> NEVER use gradients unless explicitly requested
> NEVER use purple or multicolor gradients
> NEVER use glow effects as primary affordances

Found 29+ files using gradients.

## Task

Review each gradient usage and:
1. If decorative/unnecessary → Remove
2. If functional/explicitly designed → Keep, document why
3. If purple/multicolor → Replace with solid colors or brand-appropriate

## Files to Audit

Key files with gradients:
- `src/components/AnimatedBackground.tsx`
- `src/components/SoulDodecahedron.tsx`
- `src/components/GameDodecahedron.tsx`
- `src/components/game/SpacesRail.tsx`
- `src/components/game/SectionsPanel.tsx`
- `src/modules/zone-of-genius/*.tsx`
- `src/pages/Today.tsx`
- `src/pages/Destiny.tsx`

## Decision Guide

**Keep if:**
- Explicitly part of brand/design system
- Creates meaningful visual hierarchy
- User explicitly requested

**Remove if:**
- Just decoration
- Purple/multicolor
- Creates visual noise

## Acceptance Criteria

1. All non-essential gradients removed
2. No purple or multicolor gradients
3. Visual consistency maintained
4. Document any kept gradients and why in PR description
