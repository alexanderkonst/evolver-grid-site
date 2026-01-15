# CODEX: Card Components Wabi-sabi Styling

## Priority: 🟡 MEDIUM

## Goal
Update all card components with Wabi-sabi styling: softer borders, gradient backgrounds, bokeh-inspired shadows.

## Implementation Plan

### Color Reference (from index.css)
```css
--wabi-pearl: #e7e9e5
--wabi-mist: #dcdde2
--wabi-lavender: #a4a3d0
--wabi-violet: #8460ea
--wabi-royal: #29549f
--wabi-charcoal: #2c3150
```

### Card Styling Pattern
```css
.wabi-card {
  background: linear-gradient(135deg, var(--wabi-pearl), var(--wabi-mist));
  border: 1px solid rgba(164, 163, 208, 0.3);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(164, 163, 208, 0.1);
}
```

### Files to Update
1. `src/components/matchmaking/MatchCard.tsx`
2. `src/components/events/EventCard.tsx`
3. `src/components/game/CharacterTile.tsx`
4. `src/components/ui/card.tsx` - add wabi-card variant

### Acceptance Criteria
- [ ] All cards use Wabi-sabi color palette
- [ ] Borders are subtle lavender
- [ ] Shadows are soft and bokeh-like
- [ ] Hover states use violet accent

## Assignee: CODEX
