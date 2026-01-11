---
priority: low
agent: codex
---

# Apply Color Gradient to Navigation Panels

## Context
The three-panel navigation should have a visual gradient from dark (left) to light (right):
- Panel 1 (SpacesRail): `slate-900` (darkest)
- Panel 2 (SectionsPanel): `slate-800` (medium)
- Panel 3 (Content): `slate-50` or `#f0f8ff` (lightest/alice blue)

## Current State
Colors are already close but may need fine-tuning.

## Files to Check
- `src/components/game/SpacesRail.tsx` - line with `bg-slate-900`
- `src/components/game/SectionsPanel.tsx` - line with `bg-slate-800`
- `src/components/game/GameShellV2.tsx` - content area

## Potential Enhancements
1. Add subtle gradient within Panel 2 (from `slate-800` to `slate-700`)
2. Ensure border colors align with gradient (`slate-700` between panels)
3. Consider hover states that work with gradient

## Acceptance Criteria
1. Visual gradient left-to-right is clear
2. Borders between panels are subtle but visible
3. Text contrast meets accessibility (WCAG AA)
