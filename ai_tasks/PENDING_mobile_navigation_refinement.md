---
priority: high  
agent: claude-cli
---

# Implement Mobile Navigation with Back Button

## Context
GameShellV2 has basic mobile navigation but needs refinement for Discord-style behavior:
- Default: Panel 1 (icons) + Panel 2 (sections) visible
- On section select: Full-screen content with back button
- Back button returns to sections view

## Current Implementation
See `src/components/game/GameShellV2.tsx` lines 172-216.

## Requirements

### 1. Mobile State Machine
The current `mobileView` state has 3 values: `"spaces" | "sections" | "content"`.
However the default should show BOTH spaces+sections together (like Discord mobile).

Update to:
- `"navigation"` - shows Panel 1 + Panel 2 together
- `"content"` - shows fullscreen content with back button

### 2. Swipe Gestures (Optional Enhancement)
Consider adding swipe-right to go back from content to navigation.

### 3. Smooth Transitions
Add CSS transitions for panel sliding:
- Content slides in from right
- Navigation slides out to left

### 4. Safe Area Handling
Ensure proper `safe-area-inset-*` for iOS notch devices.

## Files to Modify
- `src/components/game/GameShellV2.tsx`

## Acceptance Criteria
1. Mobile navigation feels like Discord
2. Back button always visible in content view
3. Transitions are smooth (200-300ms)
4. Works on iOS Safari with notch
