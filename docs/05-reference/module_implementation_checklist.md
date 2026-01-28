# Complete Module Implementation Checklist v3.0

> **Universal template with ALL sub-steps from ALL playbooks.**
> Copy for each module. Check boxes as you go. AI always knows where it is.
> **NEW: Roast Gates after each phase prevent bugs from compounding.**

---

## Module: `[MODULE_NAME]`

| Field | Value |
|-------|-------|
| Master Result | [FROM] → [TO] |
| Screens | [count] |
| Started | [date] |
| Status | ⏳ In Progress / ✅ Complete |

---

# 📋 PRODUCT PLAYBOOK

## Phase 1: Master Result
- [ ] 1.1 Define Point A (user's current state)
- [ ] 1.2 Define Point B (user's transformed state)
- [ ] 1.3 Write one-sentence Master Result

## Phase 2: Sub-Results
- [ ] 2.1 List all sub-results that lead to Master Result
- [ ] 2.2 Sequence them (what comes first?)
- [ ] 2.3 Define Start/End screen for each

## Phase 3: Nested Layers (Screens)
- [ ] 3.1 Break each sub-result into atomic screens
- [ ] 3.2 Name each screen
- [ ] 3.3 Define screen purpose (one sentence)

## Phase 4: Screen Details (Three Dan Tians)
For each screen:
- [ ] 4.1 Heart (🫀): What user feels
- [ ] 4.2 Mind (🧠): What user understands
- [ ] 4.3 Gut (🔥): What user does (CTA)

## Phase 5: Extension Modules
- [ ] 5.1 Artifacts (what does module produce?)
- [ ] 5.2 Emotional states (how user feels at each point)
- [ ] 5.3 Completion criteria (how we know it's done)
- [ ] 5.4 Skip paths (what if user wants to skip?)
- [ ] 5.5 Bridges (how this connects to other modules)

## Phase 6: Wireframes
- [ ] 6.1 ASCII wireframe for each screen
- [ ] 6.2 Mobile-first layout
- [ ] 6.3 Key elements positioned

---

## 🔥 PRODUCT ROAST GATE

> **STOP. Do not proceed to Architecture until this gate passes.**
> Apply the Roasting Protocol (see `roasting_protocol.md`)

### Flow Walkthrough (NO FIXING YET)
- [ ] Walk through user flow verbally, screen by screen
- [ ] Identify all navigation edges (where can user go from each screen?)
- [ ] Check for redundant screens (does any screen duplicate another's purpose?)
- [ ] Check for missing screens (any gaps in the user journey?)

### Screen Roast Cycle 1
- [ ] Usability: Can user complete their task on each screen?
- [ ] Hierarchy: Is the priority clear? What should user see first?
- [ ] CTA clarity: Is there ONE obvious action per screen?

### Screen Roast Cycle 2
- [ ] Edge cases: What if API fails? What if user refreshes?
- [ ] Copy: Does text match brand voice?
- [ ] Emotional flow: Does the sequence feel right?

### Screen Roast Cycle 3 (Meta)
- [ ] What did cycles 1-2 miss?
- [ ] Are there any hidden assumptions?

### NOW FIX
- [ ] Apply all roast findings
- [ ] Re-verify flow makes sense

**Artifact:** `[module]_product_spec.md`

---

# 🏗️ ARCHITECTURE PLAYBOOK

## Phase 1: Module Boundaries
- [ ] 1.1 Define entry points (routes, buttons)
- [ ] 1.2 Define exit points (where user goes after)
- [ ] 1.3 Define data in (what module needs)
- [ ] 1.4 Define data out (what module produces)

## Phase 2: Routing
- [ ] 2.1 Map routes to screens
- [ ] 2.2 Define route hierarchy (flat vs nested)
- [ ] 2.3 Define guards (auth required?)
- [ ] 2.4 Define redirects

## Phase 3: Data Schema
- [ ] 3.1 Identify existing tables to use
- [ ] 3.2 Define new tables if needed
- [ ] 3.3 Define relationships (FK, joins)
- [ ] 3.4 Migration created (if new tables)

## Phase 4: Shell & Layout
- [ ] 4.1 Shell rule: when to show nav
- [ ] 4.2 Focus mode: when to hide nav
- [ ] 4.3 Responsive behavior defined

## Phase 5: State Management
- [ ] 5.1 What persists (DB, localStorage, URL)
- [ ] 5.2 Resume logic (how to continue interrupted flow)
- [ ] 5.3 Sync between tabs/devices

---

## 🔥 ARCHITECTURE ROAST GATE

> **STOP. Do not proceed to UI until this gate passes.**
> The #1 source of integration bugs is untested transitions.

### Navigation Walkthrough (NO FIXING YET)
- [ ] Trace every possible user path through the module
- [ ] For each screen, answer: "What happens if user clicks Back?"
- [ ] For each screen, answer: "What happens if user refreshes?"
- [ ] Check: Does returning from external module land correctly?

### Transition Roast Cycle 1
- [ ] All entry routes work (direct URL, button click, deep link)
- [ ] All exit routes work (completion, skip, back navigation)
- [ ] Step counters are consistent across all screens

### Transition Roast Cycle 2
- [ ] Data flows correctly (what's passed via URL params vs context vs DB?)
- [ ] Auth guards work (what if session expires mid-flow?)
- [ ] Error states handled (what if API fails?)

### Transition Roast Cycle 3 (Meta)
- [ ] What did cycles 1-2 miss?
- [ ] Are there any implicit assumptions about user state?

### NOW FIX
- [ ] Apply all roast findings
- [ ] Add any missing guards/redirects
- [ ] Verify step counters are unified

**Artifact:** `[module]_architecture_spec.md`

---

# 🎨 UI PLAYBOOK

## Phase 1: Visual Rules
- [ ] 1.1 Colors from token palette only
- [ ] 1.2 Typography from defined scale
- [ ] 1.3 Spacing uses tokens (no magic numbers)
- [ ] 1.4 Border radius consistent
- [ ] 1.5 Shadows from defined set

## Phase 2: Building Blocks
- [ ] 2.1 Use standard Button variants
- [ ] 2.2 Use standard Card variants
- [ ] 2.3 Use standard Input styles
- [ ] 2.4 Use standard Modal pattern

## Phase 3: Layout Templates
- [ ] 3.1 Mobile-first design
- [ ] 3.2 Responsive breakpoints applied
- [ ] 3.3 Container widths appropriate

## Phase 4: Brandbook Integration
- [ ] 4.1 Emotional mode matches context (warm/calm/celebration)
- [ ] 4.2 Gradients used appropriately
- [ ] 4.3 Voice/copy matches brand

## Phase 5: Micro-interactions
- [ ] 5.1 Button hover: scale(1.02)
- [ ] 5.2 Button active: scale(0.98)
- [ ] 5.3 Page transitions: fade + slide
- [ ] 5.4 Success states: pulse/confetti

---

## 🔥 UI ROAST GATE

> **STOP. Do not proceed to Verification until this gate passes.**
> Technical compliance ≠ aesthetic excellence.

### Gestalt Check (NO FIXING YET)
- [ ] **First Impression Test:** Screenshot all screens. Look at them as a set.
      Do they feel like part of the same app?
- [ ] **Premium Feel Test:** Would a user say "wow" or "meh"?
- [ ] **Consistency Test:** Same CTA style everywhere? Same card style?
- [ ] **Breathing Room Test:** Is there enough whitespace? Nothing cramped?

### Visual Roast Cycle 1
- [ ] Screen-by-screen: What looks off? What feels clunky?
- [ ] Color harmony: Are colors working together?
- [ ] Text readability: Any text too small or low contrast?

### Visual Roast Cycle 2
- [ ] Compare to best-in-class apps (Linear, Notion, Stripe)
- [ ] What would make each screen feel more premium?
- [ ] Are micro-interactions smooth or jarring?

### Visual Roast Cycle 3 (Meta)
- [ ] What did cycles 1-2 miss?
- [ ] Is there any screen that breaks the visual language?

### NOW FIX
- [ ] Apply all roast findings
- [ ] Run browser walkthrough to capture visual state
- [ ] Screenshot final state for documentation

**Artifact:** Screen components in `src/components/[module]/`

---

# ✅ VERIFICATION

## Phase 1: Build
- [ ] 1.1 `npm run build` passes
- [ ] 1.2 No TypeScript errors
- [ ] 1.3 No console warnings

## Phase 2: AI Self-Test (Before Human)
> Use browser automation to validate before asking human to test.

- [ ] 2.1 Run automated browser walkthrough of complete flow
- [ ] 2.2 Capture recording as proof of work
- [ ] 2.3 Verify all CTAs navigate correctly
- [ ] 2.4 Verify no visual glitches in recording

## Phase 3: Functional Tests
- [ ] 3.1 All routes load
- [ ] 3.2 All CTAs work
- [ ] 3.3 Data saves correctly
- [ ] 3.4 Navigation works (forward/back)

## Phase 4: Edge Cases
- [ ] 4.1 Refresh mid-flow → resumes correctly
- [ ] 4.2 Back button → expected behavior
- [ ] 4.3 Deep link → auth check + correct state
- [ ] 4.4 Error states → graceful fallback

## Phase 5: Human E2E
- [ ] 5.1 Founder walkthrough
- [ ] 5.2 Feedback collected
- [ ] 5.3 Issues fixed

---

# 📊 PROGRESS VISUALIZATION

```
PRODUCT PLAYBOOK
├─ [■] Master Result
├─ [■] Sub-Results  
├─ [■] Screens
├─ [■] Screen Details
├─ [■] Extensions
├─ [■] Wireframes
└─ [■] 🔥 PRODUCT ROAST GATE

ARCHITECTURE PLAYBOOK
├─ [■] Module Boundaries
├─ [■] Routing
├─ [■] Data Schema
├─ [■] Shell & Layout
├─ [■] State Management
└─ [■] 🔥 ARCHITECTURE ROAST GATE

UI PLAYBOOK
├─ [■] Visual Rules
├─ [■] Building Blocks
├─ [■] Layout Templates
├─ [■] Brandbook
├─ [■] Micro-interactions
└─ [■] 🔥 UI ROAST GATE

VERIFICATION
├─ [■] Build
├─ [■] AI Self-Test
├─ [ ] Functional Tests
├─ [ ] Edge Cases
└─ [ ] Human E2E
```

Legend: `[■]` = Done, `[/]` = In Progress, `[ ]` = Not Started

---

# 📁 FILES CREATED

| File | Purpose | Status |
|------|---------|--------|
| `[module]_product_spec.md` | Product spec | [ ] |
| `[module]_architecture_spec.md` | Architecture spec | [ ] |
| `[Component1].tsx` | Screen 1 | [ ] |
| `[Component2].tsx` | Screen 2 | [ ] |
| ... | ... | [ ] |

---

*Template v3.0 — Complete Product Stack Checklist with Roast Gates*
*Copy this file for each new module*
*See `roasting_protocol.md` for roasting technique*
