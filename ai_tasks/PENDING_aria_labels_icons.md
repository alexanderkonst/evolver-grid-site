# CODEX: Add aria-labels to icon-only buttons

## Objective
Audit and add missing aria-labels to icon-only buttons for accessibility.

## Files to check
- `src/components/game/SpacesRail.tsx`
- `src/components/game/SectionsPanel.tsx`
- `src/components/sharing/ShareZoG.tsx`
- `src/components/sharing/ShareQol.tsx`

## Changes required
Find any `<Button>` that contains only an icon (no text) and add `aria-label` attribute:
```tsx
// Bad:
<Button><X /></Button>

// Good:
<Button aria-label="Close"><X /></Button>
```

## Acceptance criteria
- [ ] All icon-only buttons have aria-label
- [ ] Build passes with no errors
