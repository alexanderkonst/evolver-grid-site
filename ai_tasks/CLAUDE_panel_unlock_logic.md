# CLAUDE: Panel Unlock Logic After ZoG Save

## Priority: 🔴 HIGH

## Goal
After user saves Zone of Genius, reveal Panel 1 & 2 with only "Profile" tab unlocked. Other tabs show locked icons.

## Implementation Plan

### 1. Update GameShellV2.tsx
Add logic to check `onboarding_stage`:
- `"new"` or `"zog_started"` → hideNavigation (current)
- `"zog_complete"` → show panels, only Profile unlocked
- `"qol_complete"` → unlock more tabs

### 2. Update SpacesRail.tsx
Add locked state for tabs:
- Profile: always unlocked
- World: locked until `qol_complete`
- Next Move: locked until `qol_complete`

### 3. Update SectionsPanel.tsx
Add locked state for sections:
- Zone of Genius: unlocked after `zog_complete`
- Genius Business: locked until excalibur saved

### 4. Database Check
Ensure `onboarding_stage` enum includes:
- `new`, `zog_started`, `zog_complete`, `qol_started`, `qol_complete`

### Files to Modify
1. `src/components/game/GameShellV2.tsx`
2. `src/components/game/SpacesRail.tsx`
3. `src/components/game/SectionsPanel.tsx`

### Visual Design
- Locked tabs: grayscale + lock icon
- Unlock animation: subtle fade-in on first reveal

### Acceptance Criteria
- [ ] After ZoG save, panels appear
- [ ] Only Profile tab is unlocked
- [ ] Other tabs show lock icons
- [ ] Clicking locked tab shows tooltip: "Complete Quality of Life to unlock"

## Assignee: CLAUDE
