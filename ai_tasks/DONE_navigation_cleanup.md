# Task: Navigation Cleanup — Remove Old Profile, Add Dodecahedron

**Assigned to:** Codex  
**Priority:** High  
**Created:** 2026-01-11

---

## Problem

1. **Three profile pages exist** — confusing navigation
2. **"Game of Life" link** goes to outdated page
3. **Dodecahedron visual** is nice but not on main pages

---

## What to Do

### 1. Fix "Game of Life" dropdown link

In the user dropdown menu, change "Game of Life" link:

**Before:** Goes to old profile page with dodecahedron
**After:** Goes to `/game/next-move` (My Next Move)

### 2. Remove or Deprecate old profile page

The page showing:
- Dodecahedron drawing
- "Welcome Aleksandr, Level 3"
- Generic info box

This should be **removed** or **consolidated into CharacterHub**.

### 3. Add Dodecahedron to Key Pages

Take the dodecahedron visual element and add it to:
- **My Next Move** — as a subtle background or hero element
- **Profile Space (CharacterHub)** — as a visual accent

The dodecahedron represents the 12 dimensions of genius and adds mystical feel.

---

## Files Likely Involved

- User dropdown component (find the "Game of Life" link)
- `src/pages/GameHome.tsx` or similar old profile page
- `src/pages/CharacterHub.tsx`
- `src/components/game/MyNextMoveSection.tsx`

---

## UX Goal

**One profile location.** User should never be confused about where their profile is.

- **CharacterHub** = Full profile with all data
- **My Next Move** = Daily action focus (with player summary card)
- **No third profile page**

---

## Success Criteria

- [ ] "Game of Life" → My Next Move
- [ ] Old profile page removed/redirected
- [ ] Dodecahedron added to My Next Move hero
- [ ] Dodecahedron added to CharacterHub header
- [ ] Navigation is clear and simple

---

## When Done

Rename to `DONE_navigation_cleanup.md`
