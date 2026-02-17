# Module Landing Page Infrastructure

> **Date:** 2026-02-10
> **Based on:** Marketing Playbook + Landing Page Copywriting Framework + Module Taxonomy v2.1
> **Purpose:** Define the modular landing page system for all platform modules

---

## Architecture: Holonic Landing Pages

> "Each module gets its own landing page. People find THEIR module, not the whole system."
> — Marketing Playbook, Part III

```
Platform (Evolver)
├── /modules/:slug          → Universal Landing Page Component
├── /zone-of-genius         → ZoG Landing
├── /quality-of-life-map    → QoL Landing
├── /mission-discovery      → Mission Discovery Landing
├── /library                → Library Landing
├── /matchmaking            → Matchmaking Landing
├── /product-builder        → Product Builder Landing
├── /events                 → Events Landing
├── /mens-circle            → Men's Circle Landing (already v1.0)
└── ...
```

---

## Universal Landing Page Template

Every module landing page follows the **same structure**, derived from Marketing Playbook + Customer Forces Framework:

### Section Structure

| # | Section | Content Source | Marketing Playbook Phase |
|---|---------|---------------|--------------------------|
| 1 | **Hero** | Headline + Subheadline + CTA | Phase 3: Core Message Stack |
| 2 | **For Whom** | Target audience resonance | Phase 4: ICP Deep Dive |
| 3 | **Pain Section** | Customer Forces → PUSH | Phase 4: Heart (Pain Point A) |
| 4 | **Solution Section** | Transformation steps | Phase 0: Core Belief → Phase 1: Packaging |
| 5 | **Outcomes** | What you get | Phase 1: Artifacts |
| 6 | **Structure/How It Works** | Format + sequence | Phase 1: Format Ladder |
| 7 | **Story/Origin** | Why this exists | Phase 0: Core Belief |
| 8 | **Final CTA** | Action + what they get | Phase 2: Frictionless Purchase |

### Data Model per Module Landing

```typescript
interface ModuleLandingData {
  // Hero
  forAudience: string;        // "For [specific ICP]"
  headline: string;           // 8-15 words, sharp positioning
  subheadline: string;        // 15-25 words, benefit + "without..." clause
  ctaButtonText: string;      // 3-5 words
  ctaButtonLink: string;      // Route to module entry

  // Customer Forces
  painSectionHeader: string;  // "When your [situation]..." style
  painBullets: string[];      // 4 items: pain + consequence

  // Solution
  solutionSectionHeader: string;  // "A clear system to..." style
  solutionSteps: string[];        // 5 steps with verbs

  // Core Message Stack (from Marketing Playbook)
  coreMessage: {
    belief: string;           // "We believe..."
    oneLiner: string;         // "[Product] helps [who] [do what]..."
    resonanceHook: string;    // "For people who..."
    antiMessages: string[];   // What we NEVER say
  };

  // Messaging Ladder
  messagingLadder: {
    hook: string;             // L1: stops scroll
    resonance: string;        // L2: values connection
    proof: string;            // L3: trust building
    action: string;           // L4: conversion
  };

  // ICP (Three Dan Tians)
  icp: {
    heart: { desire: string; emotionalNeed: string; painPointA: string; };
    mind: { beliefs: string; objections: string; awarenessStage: 1|2|3|4|5; };
    gut: { currentBehavior: string; trigger: string; barrier: string; };
  };

  // Final CTA
  finalCtaHeadline: string;
  finalCtaSubheadline: string;
}
```

---

## Module Marketing Cards (To Be Filled)

### Priority 1: Live & Free (Acquisition Funnels)

| Module | Space | Needs Landing | Marketing Priority |
|--------|-------|---------------|-------------------|
| Unique Gift | ME | ✅ Create | 🔴 Highest — free entry point |
| Quality of Life | ME | ✅ Create | 🔴 Highest — free entry point |
| Multiple Intelligences | ME | ✅ Create | 🟡 Medium — supports ZoG |
| Library | LEARN | ✅ Create | 🟡 Medium — free practice content |

### Priority 2: Paid Services (Revenue)

| Module | Space | Needs Landing | Marketing Priority |
|--------|-------|---------------|-------------------|
| Destiny (Unique Business) | BUILD | ✅ Update | 🔴 High — primary revenue |
| Genius Offer Snapshot | Service | ✅ Update | 🔴 High — $111 product |
| AI Intelligence Boost | Service | ✅ Update | 🟡 Medium — $33 product |
| Men's Circle | MEET | ✅ Already v1.0 | ✅ Done |
| Genius-Layer Matching | Service | ✅ Update | 🟡 Medium — B2B service |

### Priority 3: Platform Modules (Engagement)

| Module | Space | Needs Landing | Marketing Priority |
|--------|-------|---------------|-------------------|
| Mission Discovery | ME | 🟡 Optional | 🟢 Low — in-app discovery |
| Growth Paths | LEARN | 🟡 Optional | 🟢 Low — in-app |
| Events | MEET | 🟡 Optional | 🟢 Low — in-app |
| Matchmaking | COLLABORATE | 🟡 Optional | 🟢 Low — in-app |
| Product Builder | BUILD | 🟡 Optional | 🟢 Low — in-app |

### Priority 4: Future (Not Yet Built)

| Module | Space | Status |
|--------|-------|--------|
| Business Incubator | BUILD | Concept only |
| Marketplace | BUY & SELL | Prototype |
| Heartcraft | — | Not in taxonomy |
| Integral Mystery School | — | Not in taxonomy |

---

## Implementation Plan

### Phase 1: Data Layer

1. **Update `ModuleCategory`** type to align with Spaces
2. **Expand `src/data/modules.ts`** with all taxonomy modules
3. **Add `ModuleLandingData`** type for marketing content
4. **Create `src/data/moduleLandings.ts`** with per-module marketing data

### Phase 2: Component Layer

1. **Create `ModuleLandingTemplate`** — universal landing page component
   - Sections: Hero, ForWhom, Pain, Solution, Outcomes, Structure, Story, FinalCTA
   - Driven entirely by data (no per-module custom components)
2. **Route each module** through `/modules/:slug` → `ModuleLandingTemplate`

### Phase 3: Content Generation

For each Priority 1 & 2 module:
1. Run through Marketing Playbook Phase 0-4
2. Apply Customer Forces Framework (PUSH/PULL/ANXIETY/INERTIA)
3. Generate 3 angle options → pick best
4. Fill `ModuleLandingData` structure
5. Optionally use `generate-landing` edge function for AI-assisted copy

### Phase 4: Polish & Launch

1. SEO metadata per page
2. OG images per module
3. Analytics tracking
4. A/B testing hooks

---

## Customer Forces Template (Per Module)

```markdown
## [Module Name] — Customer Forces

### PUSH (What's pushing them away from status quo?)
- 

### PULL (What's pulling them toward the solution?)
- 

### ANXIETY (What stops them from buying/starting?)
- 

### INERTIA (What keeps them stuck?)
- 

### ENEMY (The status quo to fight against)
- 
```

---

## Next Steps

1. ☐ Get approval on this infrastructure
2. ☐ Update `src/types/module.ts` with new categories + landing data type
3. ☐ Expand `src/data/modules.ts` to cover all taxonomy modules
4. ☐ Create `ModuleLandingTemplate` component
5. ☐ Fill marketing data for Priority 1 modules (ZoG, QoL)
6. ☐ Fill marketing data for Priority 2 modules (Destiny, Genius Offer, AI Boost)

---

*Infrastructure spec, 2026-02-10*
*Based on: Marketing Playbook + Customer Forces Framework + Module Taxonomy v2.1*
