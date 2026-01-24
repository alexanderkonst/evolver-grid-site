# Product Builder Development Tasks

> Generated from UX Playbook Phase 9 (Build)
> Date: January 24, 2026

---

## Overview

Build the Product Builder module that takes users from Genius Business → Published Product on Marketplace.

**Entry point:** After Excalibur completion
**Output:** Live landing page with blueprint on marketplace

---

## Task Breakdown

### TIER 1: Foundation (Do First)

#### T1.1: Create ProductBuilder Route & Layout
- [ ] Create `/product-builder` route
- [ ] Create `ProductBuilderLayout.tsx` wrapper component
- [ ] Add progress indicator (7 steps)
- [ ] Add navigation (back button)
- [ ] Connect to existing navigation

**Dependencies:** None
**Estimated:** 2 hours

---

#### T1.2: Create Loading Component
- [ ] Create `ProductBuilderLoading.tsx`
- [ ] Add animated progress bar
- [ ] Add dynamic message prop ("Generating...", "Mapping...", etc.)
- [ ] Style consistent with platform

**Dependencies:** None
**Estimated:** 1 hour

---

#### T1.3: Create Database Schema
- [ ] Add `product_builder_snapshots` table
  - user_id
  - deep_icp (jsonb)
  - deep_pain (jsonb)
  - deep_tp (jsonb)
  - landing_content (jsonb)
  - blueprint_content (jsonb)
  - cta_config (jsonb)
  - resonance_ratings (jsonb)
  - created_at, updated_at
- [ ] Add `marketplace_products` table (if not exists)
  - user_id
  - product_snapshot_id
  - slug
  - published_at
  - is_live
- [ ] Create Supabase migration

**Dependencies:** None
**Estimated:** 2 hours

---

### TIER 2: Screens (Do Second)

#### T2.1: Entry Screen
- [ ] Create `ProductBuilderEntry.tsx`
- [ ] Promise copy
- [ ] "BUILD MY PRODUCT" magic button
- [ ] Pull Excalibur data check (redirect if not available)

**Dependencies:** T1.1
**Estimated:** 1 hour

---

#### T2.2: Deep ICP Screen
- [ ] Create `DeepICPScreen.tsx`
- [ ] Integrate with AI edge function (deepen-icp)
- [ ] Loading state
- [ ] ICP card display
- [ ] ResonanceRating integration
- [ ] "Deepen Pain" button

**Dependencies:** T1.1, T1.2, T2.5
**Estimated:** 3 hours

---

#### T2.3: Deep Pain Screen
- [ ] Create `DeepPainScreen.tsx`
- [ ] Integrate with AI edge function (deepen-pain)
- [ ] Display: Pressure, Consequences, Cost, Stakes
- [ ] ResonanceRating integration
- [ ] "Crystallize Promise" button

**Dependencies:** T2.2
**Estimated:** 2 hours

---

#### T2.4: Deep TP Screen
- [ ] Create `DeepTPScreen.tsx`
- [ ] Point A → Point B visualization
- [ ] AI-generated promise statement
- [ ] ResonanceRating integration
- [ ] "Build Landing Page" button

**Dependencies:** T2.3
**Estimated:** 2 hours

---

#### T2.5: AI Edge Functions
- [ ] Create `deepen-icp` edge function
  - Input: Excalibur ICP
  - Process: Pain Theory + 3x Roasting (invisible)
  - Output: Deep ICP
- [ ] Create `deepen-pain` edge function
- [ ] Create `deepen-tp` edge function
- [ ] Create `generate-landing` edge function
- [ ] Create `generate-blueprint` edge function

**Dependencies:** T1.3
**Estimated:** 6 hours

---

#### T2.6: Landing Page Screen
- [ ] Create `LandingPageScreen.tsx`
- [ ] Live preview component
- [ ] Hero, Pain, Promise, CTA sections
- [ ] ResonanceRating integration
- [ ] "Add Blueprint" button

**Dependencies:** T2.4, T2.5
**Estimated:** 4 hours

---

#### T2.7: Blueprint Screen
- [ ] Create `BlueprintScreen.tsx`
- [ ] Methodology preview
- [ ] Skip option (default blueprint)
- [ ] "Set CTA" button

**Dependencies:** T2.6
**Estimated:** 2 hours

---

#### T2.8: CTA Options Screen
- [ ] Create `CTAOptionsScreen.tsx`
- [ ] Session / Software toggle
- [ ] Skip option (default: session)
- [ ] "Publish" button

**Dependencies:** T2.7
**Estimated:** 1 hour

---

#### T2.9: Published Screen (EPIC)
- [ ] Create `PublishedScreen.tsx`
- [ ] Confetti animation
- [ ] Heart/Mind/Gut messaging
- [ ] Copy link functionality
- [ ] View on Marketplace button
- [ ] Share functionality
- [ ] Edit button

**Dependencies:** T2.8
**Estimated:** 3 hours

---

### TIER 3: Integration (Do Third)

#### T3.1: Marketplace Integration
- [ ] Product listing on marketplace
- [ ] Public product URL generation
- [ ] Landing page rendering
- [ ] Blueprint download

**Dependencies:** T2.9, T1.3
**Estimated:** 4 hours

---

#### T3.2: Bridge from Excalibur
- [ ] Add "Launch Product Builder" button after Excalibur
- [ ] Pass data to Product Builder
- [ ] Handle edge case: no Excalibur data

**Dependencies:** T2.1
**Estimated:** 1 hour

---

### TIER 4: Polish (Do Last)

#### T4.1: Emotional Journey Polish
- [ ] Microcopy refinement
- [ ] Transition animations
- [ ] Loading message variety

**Dependencies:** All T2
**Estimated:** 2 hours

---

#### T4.2: Testing
- [ ] End-to-end flow test
- [ ] Edge cases (missing data, AI errors)
- [ ] Mobile responsiveness

**Dependencies:** All
**Estimated:** 2 hours

---

## Total Estimated Time

| Tier | Hours |
|------|-------|
| T1: Foundation | 5 |
| T2: Screens | 18 |
| T3: Integration | 5 |
| T4: Polish | 4 |
| **TOTAL** | **32 hours** |

---

## Priority Order (Critical Path)

```
T1.1 → T1.2 → T1.3 → T2.1 → T2.5 → T2.2 → T2.3 → T2.4 → T2.6 → T2.7 → T2.8 → T2.9 → T3.1 → T3.2 → T4.1 → T4.2
```

---

## MVP Scope (If Time-Limited)

For hackathon demo, prioritize:
1. T1.1, T1.2 — Layout + Loading
2. T2.1 — Entry
3. T2.5 (partial) — 1 edge function
4. T2.2 — Deep ICP demo
5. T2.9 — Published celebration (mock)

**MVP = 8 hours**

---

*Generated: January 24, 2026*
*Part of Genius Venture Studio Product Compiler*
