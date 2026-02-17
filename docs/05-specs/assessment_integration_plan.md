# Platform Assessment Integration Plan

> Recreating external assessments inside the 3-panel navigation system

---

## Problem Statement

We have two major assessments currently implemented as standalone pages with their own Navigation:

1. **Quality of Life Map Assessment** (`QualityOfLifeMapAssessment.tsx`)
   - 10-domain wizard for rating life areas
   - Currently opens with `/quality-of-life/assessment`
   - Uses `Navigation` component (old header)
   - Back button goes to `/` (homepage)
   - After completion → Results page

2. **Unique Gift Assessment** (`ZoneOfGeniusAssessmentLayout.tsx`)
   - 5-step wizard for talent discovery
   - Currently opens with `/zone-of-genius/assessment/step-0`
   - Uses `Navigation` + `Footer` (old layout)
   - "Exit" goes to `/zone-of-genius` overview

**The Problem:**
- Both break the 3-panel `GameShellV2` navigation
- Users lose context of where they are in the platform
- Navigation buttons lead to wrong places
- Visual design is inconsistent with new game shell

---

## Proposed Solution

### Option A: Embed Inside GameShellV2 (Recommended)

Wrap assessment pages in GameShellV2:

```
/game/transformation/qol-assessment → QoL Assessment inside GameShell
/game/transformation/genius-assessment → ZoG Assessment inside GameShell
```

**Benefits:**
- Consistent 3-panel navigation
- SpacesRail and SectionsPanel remain visible
- Progress visible in content panel (Panel 3)
- Natural back/forward navigation

**Implementation:**
1. Create new route components that wrap assessments in GameShellV2
2. Modify QoL/ZoG assessment to render only the content (no Navigation)
3. Update all navigation links to use new routes
4. Add breadcrumb or progress indicator in Panel 2

---

### Option B: Assessment Mode (Alternative)

Create a special "focused assessment mode" where:
- GameShell collapses to show only content
- Minimal distraction
- Clear "Exit Assessment" button
- Progress bar at top

**Benefits:**
- Less distraction during assessment
- Focus on the task

**Drawbacks:**
- Additional state management
- Could confuse users about where they are

---

## Recommended Implementation

### Phase 1: QoL Assessment Integration

**Tasks:**
1. Create `TransformationQolAssessment.tsx` that wraps existing assessment logic
2. Add route `/game/transformation/qol-assessment` in App.tsx
3. Add "Quality of Life Map" as a section in SectionsPanel for Transformation space
4. Modify `QualityOfLifeMapAssessment` to accept optional `renderMode` prop:
   - `"standalone"` = current behavior with Navigation
   - `"embedded"` = content only, no Navigation/Footer
5. Update completion flow to navigate to `/game/transformation/qol-results`
6. Create Results page inside GameShell

**Files to modify:**
- `src/pages/spaces/transformation/TransformationSpace.tsx`
- `src/components/game/SectionsPanel.tsx` (add section)
- `src/App.tsx` (add route)
- `src/pages/QualityOfLifeMapAssessment.tsx` (add renderMode prop)

---

### Phase 2: Unique Gift Assessment Integration

**Tasks:**
1. Create `TransformationGeniusAssessment.tsx` wrapper
2. Add route `/game/transformation/genius-assessment/*` for all steps
3. Add "Unique Gift" as a section in SectionsPanel
4. Modify `ZoneOfGeniusAssessmentLayout` to support embedded mode
5. Update completion flow to navigate to results inside GameShell

**Files to modify:**
- Similar to Phase 1

---

### Phase 3: Micro-Module Content Pages

Once assessments are integrated, create micro-module content pages:

**UI Design (Kajabi-style):**
```
┌─────────────────────────────────────────────────────┐
│ Panel 3: Content                                    │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Module Title: Conscious Breath               S4 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │                                                 │ │
│ │              [VIDEO PLAYER]                    │ │
│ │              YouTube Embed                      │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Key Takeaway:                                   │ │
│ │ Nose breathing, belly out, 5.5s, heart center  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Experience (2 min)                              │ │
│ │ [Collapsible instructions...]                   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Integration (7 days)                            │ │
│ │ [Collapsible game rules...]                     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Resources                                       │ │
│ │ • PDF Worksheet                                 │ │
│ │ • Audio guided practice                         │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [✓ Mark Complete]           [→ Next Module]    │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Data Model:**
```typescript
interface MicroModule {
  id: string;             // "S4"
  path: string;           // "spirit"
  title: string;          // "Conscious Breath"
  sequence: number;       // 4
  videoUrl?: string;      // YouTube embed URL
  keyTakeaway: string;
  experience: {
    duration: string;     // "2 min"
    instructions: string; // markdown
  };
  integration: {
    duration: string;     // "7 days"
    instructions: string; // markdown
  };
  resources?: {
    title: string;
    url: string;
    type: 'pdf' | 'audio' | 'link';
  }[];
  prerequisites?: string[];  // ["S3"]
  unlocks?: string[];        // ["S5"]
  xp: number;
}
```

---

## Codex Tasks to Create

### Task 1: Create QoL Assessment Wrapper (PENDING)
```
File: ai_tasks/PENDING_qol_assessment_wrapper.md

Create TransformationQolAssessment.tsx that:
1. Wraps QualityOfLifeMapAssessment in GameShellV2
2. Renders assessment content without standalone Navigation
3. Handles completion flow to stay in GameShell
```

### Task 2: Create ZoG Assessment Wrapper (PENDING)
```
File: ai_tasks/PENDING_zog_assessment_wrapper.md

Create TransformationGeniusAssessment.tsx that:
1. Wraps ZoneOfGeniusAssessmentLayout in GameShellV2
2. Uses nested routes for 5 steps
3. Handles completion flow
```

### Task 3: Create MicroModulePage Component (PENDING)
```
File: ai_tasks/PENDING_micro_module_page.md

Create reusable MicroModulePage.tsx that:
1. Renders video, key takeaway, experience, integration, resources
2. Has "Mark Complete" and "Next Module" buttons
3. Tracks completion in user progress
4. Works inside GameShellV2
```

### Task 4: Add Assessment Routes (PENDING)
```
File: ai_tasks/PENDING_assessment_routes.md

Update App.tsx with:
1. /game/transformation/qol-assessment
2. /game/transformation/genius-assessment/*
3. /game/transformation/module/:moduleId
```

---

## Priority Order

1. **Task 3: MicroModulePage** — Enables NotebookLM video deployment
2. **Task 4: Assessment Routes** — Enables navigation
3. **Task 1: QoL Wrapper** — Most used assessment
4. **Task 2: ZoG Wrapper** — Secondary assessment

---

*Implementation Plan v1.0*
