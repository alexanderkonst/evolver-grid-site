# Complete Module Implementation Checklist

> **Universal template with ALL sub-steps from ALL playbooks.**
> Copy for each module. Check boxes as you go. AI always knows where it is.

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

## Phase 5: Roast & Iterate
- [ ] 5.1 Usability roast (can user complete task?)
- [ ] 5.2 Hierarchy roast (is priority clear?)
- [ ] 5.3 Edge case roast (what if X fails?)

## Phase 6: Extension Modules
- [ ] 6.1 Artifacts (what does module produce?)
- [ ] 6.2 Emotional states (how user feels at each point)
- [ ] 6.3 Completion criteria (how we know it's done)
- [ ] 6.4 Skip paths (what if user wants to skip?)
- [ ] 6.5 Bridges (how this connects to other modules)

## Phase 7: Wireframes
- [ ] 7.1 ASCII wireframe for each screen
- [ ] 7.2 Mobile-first layout
- [ ] 7.3 Key elements positioned

## Phase 8: Wireframe Roast (3 cycles)
- [ ] 8.1 Cycle 1: Usability (can user see what to do?)
- [ ] 8.2 Cycle 2: Visual hierarchy (eye flow correct?)
- [ ] 8.3 Cycle 3: Edge cases (empty states, errors?)

## Phase 9: Build Screen Components
- [ ] 9.1 Create component files
- [ ] 9.2 Basic JSX structure
- [ ] 9.3 Props interface defined
- [ ] 9.4 Export from module

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

## Phase 6: Architecture Roast
- [ ] 6.1 All transitions work (entry → screen → exit)
- [ ] 6.2 Data flows correctly
- [ ] 6.3 Edge cases: refresh, back button, deep link, timeout

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

**Artifact:** Screen components in `src/components/[module]/`

---

# ✅ VERIFICATION

## Phase 1: Build
- [ ] 1.1 `npm run build` passes
- [ ] 1.2 No TypeScript errors
- [ ] 1.3 No console warnings

## Phase 2: Functional Tests
- [ ] 2.1 All routes load
- [ ] 2.2 All CTAs work
- [ ] 2.3 Data saves correctly
- [ ] 2.4 Navigation works (forward/back)

## Phase 3: Edge Cases
- [ ] 3.1 Refresh mid-flow → resumes correctly
- [ ] 3.2 Back button → expected behavior
- [ ] 3.3 Deep link → auth check + correct state
- [ ] 3.4 Error states → graceful fallback

## Phase 4: Human E2E
- [ ] 4.1 Founder walkthrough
- [ ] 4.2 Feedback collected
- [ ] 4.3 Issues fixed

---

# 📊 PROGRESS VISUALIZATION

```
PRODUCT PLAYBOOK
├─ [■] Master Result
├─ [■] Sub-Results  
├─ [■] Screens
├─ [■] Screen Details
├─ [■] Roast
├─ [■] Extensions
├─ [■] Wireframes
├─ [■] Wireframe Roast
└─ [■] Build Components

ARCHITECTURE PLAYBOOK
├─ [■] Module Boundaries
├─ [■] Routing
├─ [■] Data Schema
├─ [■] Shell & Layout
├─ [■] State Management
└─ [■] Architecture Roast

UI PLAYBOOK
├─ [■] Visual Rules
├─ [■] Building Blocks
├─ [■] Layout Templates
├─ [■] Brandbook
└─ [■] Micro-interactions

VERIFICATION
├─ [■] Build
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

*Template v2.0 — Complete Product Stack Checklist*
*Copy this file for each new module*
