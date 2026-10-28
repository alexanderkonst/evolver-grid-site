> Synthesized into docs/templates/roasting.md (2026-10-27). This file is kept as a source.

# Daily Loop UI Roast

> **Roast Gate #3: UI Playbook**
> Following the Roasting Protocol with Gestalt Check
> Date: 2026-01-27

---

## 🎨 GESTALT CHECK (First Impression)

### First Impression Test

**Question:** If a user opened `/game` for the first time, what would they feel?

**Target feeling:** "I'm home. This is calm. I know what to do."

**Assessment:**
- ✅ Three clear sections: ME, MY LIFE, MY NEXT MOVE
- ✅ Single CTA dominates (START button)
- ✅ Soft pastel palette — not overwhelming
- ⚠️ Need to verify visual weight of each section

### Premium Feel Test

**Question:** Does this look like a $1000/year app or a free hobby project?

**Assessment:**
- ✅ Gradient button (premium feel)
- ✅ Rounded corners, shadows (modern)
- ✅ Whitespace planned
- ⚠️ Need to see actual implementation — specs can look premium, execution matters

### Consistency Test

**Question:** Same patterns everywhere?

| Pattern | Consistent? |
|---------|-------------|
| Button styles | ✅ START = primary, others = secondary |
| Card styles | ✅ White + rounded-2xl + shadow-sm |
| Link styles | ✅ Violet + hover:underline |
| Spacing | ✅ space-y-6 between cards |

### Breathing Room Test

**Question:** Enough whitespace?

- Container: `px-4 py-6 space-y-6` → ✅ Good
- Card padding: `p-6` → ✅ Good
- Between sections: `space-y-6` (24px) → ✅ Good

---

## 🔥 ROAST CYCLE 1: Visual Hierarchy

### Critical Path

1. User sees Home → Eye should go: **Next Move card first**
2. START button should be the most prominent element
3. ME and MY LIFE are context, not action

**Assessment:**
- ⚠️ **Issue:** ME section is at TOP. User sees "who I am" first, not "what to do"
- **Options:**
  - A) Keep order: ME → MY LIFE → MY NEXT MOVE (identity-first)
  - B) Flip order: MY NEXT MOVE → MY LIFE → ME (action-first)
  
**Recommendation:** Keep identity-first order. The Master Result is "clarity" not "speed". User needs grounding before action.

---

## 🔥 ROAST CYCLE 2: Component Critique

### MeSummary

| Aspect | Status | Notes |
|--------|--------|-------|
| Information | ✅ Minimal | Archetype, level, XP only |
| Emotion | ✅ | "I feel seen" |
| Action | ✅ | View Profile link |
| Risk | ⚠️ | Icon placeholder — needs real archetype icons |

### MyLifeSummary

| Aspect | Status | Notes |
|--------|--------|-------|
| Information | ⚠️ Dense | 8 domains in small space |
| Emotion | ⚠️ | Could feel like a report card (bad) |
| Action | ✅ | See Details link |
| Risk | ⚠️ | Without good visualization, could feel clinical |

**Refinement needed:** Make it feel like a "snapshot" not a "score". Consider:
- Gentle color coding (no red/green = judgey)
- Circular dots instead of numbers
- Or: Show only TOP domain + FOCUS domain (simpler)

### NextMoveCard

| Aspect | Status | Notes |
|--------|--------|-------|
| Information | ✅ | Action, vector, time, XP, why |
| Emotion | ✅ | "I know what to do" |
| Action | ✅ | Big START button |
| Risk | ✅ | Design is clear |

**This is the hero component.** Looks good.

### EmptyStateCard

| Aspect | Status | Notes |
|--------|--------|-------|
| Information | ✅ | Clear message + CTA |
| Emotion | ⚠️ | Could feel like "you're behind" |
| Risk | ⚠️ | Wording matters — "discover" not "you're missing" |

**Refinement:** Verify copy is inviting, not guilt-inducing.

### CelebrationModal

| Aspect | Status | Notes |
|--------|--------|-------|
| Information | ✅ | XP, path, progress |
| Emotion | ✅ | Celebration, momentum |
| Risk | ⚠️ | Animation quality matters — subtle, not Vegas |

---

## 🔥 ROAST CYCLE 3: Meta-Roast

### What Did Cycles 1-2 Miss?

1. **Mobile scroll length:** Three sections + bottom nav = will it fit?
   - ME: ~120px, MY LIFE: ~150px, NEXT MOVE: ~250px = ~520px + nav
   - Standard mobile viewport: 667px
   - ✅ Should fit without scroll on most devices

2. **Loading states:** What does user see while data loads?
   - Need skeleton loaders
   - ⚠️ Not in current spec — add to implementation

3. **Error states:** What if data fetch fails?
   - Need error message component
   - ⚠️ Not in current spec — add to implementation

4. **Archetype icons:** No icon library mentioned
   - Need to source or create archetype icons
   - ⚠️ Dependency — may block implementation

---

## ✅ SYNTHESIS: UI Roast Results

### Must Add to Implementation

| Item | Reason |
|------|--------|
| Skeleton loaders | Loading UX |
| Error states | Resilience |
| Archetype icon fallback | If icons not ready |
| Color-coded domains | Gentler than numbers |

### Design Refinements

| Component | Refinement |
|-----------|------------|
| MyLifeSummary | Simplify to: Focus domain + overall sentiment |
| EmptyStateCard | Verify inviting copy |
| CelebrationModal | Subtle animation (not flashy) |

### Verdict

**✅ Pass UI Roast Gate with refinements noted**

The spec is solid. Refinements will be handled during implementation.

---

*UI Roast completed. Ready for implementation.*
