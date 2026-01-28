# My Next Move — UI Spec

> **Phase 3: UI Playbook**
> **Based on:** Existing CoreLoopHome.tsx analysis

---

## 3.1 VISUAL RULES ✅

### Current Status
- ✅ Uses design tokens (Tailwind classes)
- ✅ Consistent color scheme (slate, amber, indigo)
- ✅ Typography from scale
- ✅ Consistent spacing

### Required Fixes
- None — visual foundation is solid

---

## 3.2 BUILDING BLOCKS ✅

### Existing Components Used

| Component | Source | Status |
|-----------|--------|--------|
| `GameShellV2` | @/components/game | ✅ |
| `MeSection` | @/components/game | ✅ |
| `MyNextMoveSection` | Internal | ✅ |
| `NextActionsPanel` | @/components/game | ✅ |
| `Button` | @/components/ui | ✅ |
| `PremiumLoader` | @/components/ui | ✅ |

### Missing Components (to add)

| Component | Purpose | Priority |
|-----------|---------|----------|
| `MyLifeSection` | QoL domain cards | HIGH |
| Improved `CelebrationModal` | Full-screen celebration | MEDIUM |

---

## 3.3 LAYOUT TEMPLATES ✅

### Current Layout
```
┌─────────────────────────────────┐
│ [SpacesRail] │ [Content Area]  │
│              │                  │
│  - My Next   │  - Me Section   │
│    Move      │  - Stats Header │
│  - GROW      │  - Next Actions │
│  - LEARN     │                  │
│  - ...       │                  │
└─────────────────────────────────┘
```

### Mobile-First
- ✅ SpacesRail collapses to icons
- ✅ Content area full width
- ✅ max-w-2xl container

---

## 3.4 BRANDBOOK INTEGRATION ❌ NEEDS WORK

### Current Issues

1. **Missing "My Life" section** — QoL scores should be visible
2. **Recommendation logic outdated** — Uses old geniusStage, not new GROW → LEARN → Nudges

### Required Emotional Updates

| Screen State | Emotion | Current | Target |
|--------------|---------|---------|--------|
| Onboarding (ZoG) | Excitement | ✅ | ✅ |
| Onboarding (QoL) | Motivation | ✅ | ✅ |
| Main Hub | Clarity | ⚠️ | Add "My Life" QoL cards |
| Celebration | Joy | ⚠️ Toast only | Full modal with confetti |

---

## 3.5 MICRO-INTERACTIONS

### Current
- ✅ Button hover states
- ✅ Celebration toast animation (animate-bounce)

### To Add
- [ ] QoL card hover: slight lift
- [ ] CelebrationModal: confetti effect
- [ ] Progress bar animation

---

## 🔥 ROAST GATE 3: UI

### Gestalt Check

| Test | Result |
|------|--------|
| First Impression | ⚠️ Missing "My Life" QoL overview |
| Premium Feel | ✅ Solid visual design |
| Consistency | ✅ Consistent with rest of app |
| Breathing Room | ✅ Good whitespace |

### Roast Findings

**Cycle 1: What Looks Off**
- ❌ No QoL scores visible in main hub
- ❌ Recommendation logic is old (geniusStage-based, not GROW → LEARN → Nudges)
- ⚠️ Celebration is just a toast, not a full modal

**Cycle 2: Compare to Linear/Notion/Stripe**
- ✅ Clean and minimal
- ⚠️ Could benefit from more prominent "My Next Move" card

**Cycle 3: What Was Missed**
- ❌ The whole GROW → LEARN → Nudges logic from module_taxonomy.md is NOT implemented!

---

## ACTION ITEMS FOR PHASE 4

### HIGH PRIORITY

1. **Add MyLifeSection** — Show QoL domain scores
2. **Implement new recommendation logic:**
   ```typescript
   // GROW first
   if (!hasZoG) return { action: 'Complete Zone of Genius', path: '/zone-of-genius/entry' };
   if (!hasQoL) return { action: 'Complete Quality of Life', path: '/quality-of-life-map/assessment' };
   if (!hasResources) return { action: 'Map Your Resources', path: '/asset-mapping' };
   if (!hasMission) return { action: 'Discover Your Mission', path: '/mission-discovery' };
   
   // LEARN forever (default)
   return { action: 'Explore Practice Library', path: '/game/learn/library' };
   ```
3. **Remove old geniusStage logic** — Replace with new GROW → LEARN flow

### MEDIUM PRIORITY

4. **Upgrade CelebrationModal** — Use existing component from `@/components/game/CelebrationModal`
5. **Add badge nudges** — Badge on COLLABORATE when Resources done, BUILD when ZoG done

---

**✓ PHASE 3 COMPLETE — Proceed to PHASE 4: VIBE-CODING**
