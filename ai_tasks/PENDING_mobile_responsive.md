# Task: Mobile Responsive Polish

**Assigned to:** Claude CLI  
**Priority:** Medium  
**Created:** 2026-01-11

---

## Context

Many users access from mobile. Need to ensure all key pages work well.

---

## Pages to Audit

1. **GameHome / Today** — Main dashboard
2. **My Next Move** — Action card
3. **Profile / CharacterHub** — Profile page
4. **Zone of Genius Entry** — ZoG flow
5. **Appleseed/Excalibur Display** — Results
6. **Events Space** — Event list
7. **Matchmaking** — Match cards
8. **Sidebar/Navigation** — Mobile menu

---

## Common Issues to Check

- [ ] Text not overflowing
- [ ] Buttons large enough to tap (min 44px)
- [ ] Cards not too wide
- [ ] Sidebar collapses properly on mobile
- [ ] Forms usable with mobile keyboard
- [ ] Images responsive
- [ ] Scrolling smooth

---

## Breakpoints

```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
```

---

## Priority Fixes

1. Sidebar: Hamburger menu on mobile
2. Match cards: Full width on mobile
3. Forms: Stack vertically on mobile
4. Results: Scrollable sections

---

## Success Criteria

- [ ] All pages usable on 375px width (iPhone SE)
- [ ] All pages usable on 414px width (iPhone 11)
- [ ] No horizontal scroll
- [ ] Touch targets adequate
- [ ] Navigation accessible

---

## When Done

Rename to `DONE_mobile_responsive.md`
