# Task: My Next Move UI Polish

**Assigned to:** Claude CLI  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

Several UI improvements needed for the My Next Move page based on user feedback.

---

## What to Build

### 1. Move QoL section to Profile

The Quality of Life indicators should NOT be on My Next Move page.
Move the QoL box to Profile/CharacterHub page.

### 2. XP Progress Bar contrast

Current XP bar is same color throughout with gradient.
Add visual distinction:
- Filled portion: solid/bright color
- Remaining portion: lighter/gray color

Example:
```
[███████████░░░░░░░░░] 750 / 1000 XP
 ↑ filled     ↑ remaining
```

### 3. Profile picture in hero box

When profile picture is implemented, replace the current icon in the hero box with the user's avatar.

### 4. Add user's name to hero box

Show the user's first name in the archetype/level box:
```
┌─────────────────────────────┐
│ [Avatar]                    │
│ Aleksandr                   │
│ ✦ Architect of Integration  │
│ Level 5 · 750/1000 XP       │
└─────────────────────────────┘
```

### 5. Explain the 4 circles at bottom

The 4 colored circles (green, green, green, yellow) are likely QoL domain indicators.
Either:
- Remove if redundant with QoL in Profile
- Add tooltips/labels explaining what each means
- Or document what they represent

---

## Success Criteria

- [ ] QoL moved from My Next Move to Profile
- [ ] XP bar has clear filled/unfilled contrast
- [ ] User name displayed in hero box
- [ ] Ready for profile picture integration
- [ ] 4 circles explained or removed

---

## When Done

Rename to `DONE_next_move_polish.md`
