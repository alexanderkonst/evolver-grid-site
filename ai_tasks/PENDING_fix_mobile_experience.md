# Fix Mobile Experience

## Goal
Ensure all key flows work smoothly on mobile (iPhone/Android).

## Priority Screens
1. Landing page (`/`)
2. Onboarding start (`/start`)
3. Zone of Genius entry (`/zone-of-genius/entry`)
4. QoL Assessment (`/quality-of-life-map/assessment`)
5. Game home (`/game`)
6. Profile (`/game/profile`)

## Common Issues to Fix

### Navigation
- Hamburger menu accessibility
- Touch targets min 44x44px
- Swipe gestures where appropriate

### Layout
- No horizontal scroll
- Text readable without zoom
- Buttons full-width on mobile
- Cards stack vertically

### Forms
- Input fields appropriately sized
- Keyboard doesn't cover inputs
- Submit buttons visible above keyboard

## Testing
```bash
# Use Chrome DevTools mobile emulation
# Test on iPhone SE, iPhone 12, Pixel 5
```

## Files
- All page components in `src/pages/`
- Layout components (`GameShellV2`, etc.)

## Acceptance
- All 6 priority screens usable on mobile
- No horizontal scroll
- Touch targets adequate
