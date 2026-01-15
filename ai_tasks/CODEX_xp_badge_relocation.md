# CODEX: XP Badge Relocation to Panel 1

## Priority: 🟡 MEDIUM

## Goal
Move Level/XP badge from Panel 3 top-right to Panel 1, next to Guest/Member name.

## Implementation Plan

### 1. Find Current XP Badge Location
Search for XP display in:
- `src/components/game/GameShellV2.tsx`
- `src/components/game/SpacesRail.tsx`

### 2. Move to SpacesRail.tsx
Add XP badge below profile name:
```tsx
<div className="flex items-center gap-2 mt-1">
  <span className="text-xs text-[#a4a3d0]">Level {profile?.level || 1}</span>
  <span className="text-xs text-[#8460ea]">{profile?.xp || 0} XP</span>
</div>
```

### 3. Remove from Old Location
Remove XP display from Panel 3 header.

### Files to Modify
1. `src/components/game/SpacesRail.tsx` - add XP badge
2. `src/components/game/GameShellV2.tsx` - remove from Panel 3 (if there)

### Acceptance Criteria
- [ ] XP badge visible next to profile name in Panel 1
- [ ] No duplicate XP display
- [ ] Wabi-sabi styling (lavender/violet colors)

## Assignee: CODEX
