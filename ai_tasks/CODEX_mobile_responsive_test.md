# CODEX: Mobile Responsive Testing

## Priority: 🟡 MEDIUM

## Goal
Test all new components on mobile and fix any responsive issues.

## Components to Test

### Recently Modified
1. `ShareZoG.tsx` - dropdown should work on mobile
2. `AppleseedDisplay.tsx` - one-screen layout
3. `ExcaliburDisplay.tsx` - one-screen layout
4. `GameShellV2.tsx` - hideNavigation on mobile

### Common Mobile Issues
1. Dropdown menus going off-screen
2. Buttons too small for touch (min 44px)
3. Text too small (min 16px for body)
4. Padding/margin too tight

### Testing Viewport Sizes
- iPhone SE: 375x667
- iPhone 14: 390x844
- Android: 360x800

### Files to Check
1. `src/components/sharing/ShareZoG.tsx`
2. `src/modules/zone-of-genius/AppleseedDisplay.tsx`
3. `src/modules/zone-of-genius/ExcaliburDisplay.tsx`
4. `src/components/game/GameShellV2.tsx`

### Acceptance Criteria
- [ ] Share dropdown positions correctly on mobile
- [ ] All buttons have min-height 44px
- [ ] Text is readable without zoom
- [ ] Cards fit on single screen

## Assignee: CODEX
