# Add Streaks and XP Visibility

## Goal
Make XP and streaks prominent so users want to return daily.

## Where to Add
- Main game screen (`/game`) — hero area
- Profile overview (`/game/profile`)
- Header or persistent UI element

## Implementation
1. Fetch from `game_profiles`: `xp_total`, `level`, `current_streak_days`
2. Display: "Day 5 🔥" for streaks, "Level 3 • 450 XP" for progress
3. Add celebration micro-animation on streak milestone (7, 30, etc.)

## Files to Check
- `src/pages/GameHome.tsx`
- `src/pages/spaces/sections/ProfileOverview.tsx`
- `src/components/game/GameShellV2.tsx` (header area)

## Acceptance
- User sees their streak and XP immediately upon login
- Visual is prominent but not intrusive
- Streak emoji or icon draws attention
