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

### TIER 1: Foundation (Do First) ✅ COMPLETE

#### T1.1: Create ProductBuilder Route & Layout
- [x] Create `/product-builder` route
- [x] Create `ProductBuilderLayout.tsx` wrapper component
- [x] Add progress indicator (7 steps)
- [x] Add navigation (back button)
- [x] Connect to existing navigation

**Dependencies:** None
**Estimated:** 2 hours ✅

---

#### T1.2: Create Loading Component
- [x] Create `ProductBuilderLoading.tsx`
- [x] Add animated progress bar
- [x] Add dynamic message prop ("Generating...", "Mapping...", etc.)
- [x] Style consistent with platform

**Dependencies:** None
**Estimated:** 1 hour ✅

---

#### T1.3: Create Database Schema
- [x] Add `product_builder_snapshots` table
  - user_id
  - deep_icp (jsonb)
  - deep_pain (jsonb)
  - deep_tp (jsonb)
  - landing_content (jsonb)
  - blueprint_content (jsonb)
  - cta_config (jsonb)
  - resonance_ratings (jsonb)
  - created_at, updated_at
- [x] Add `marketplace_products` table (if not exists)
  - user_id
  - product_snapshot_id
  - slug
  - published_at
  - is_live
- [x] Create Supabase migration

**Dependencies:** None
**Estimated:** 2 hours ✅

---

### TIER 2: Screens (Do Second) ✅ COMPLETE

#### T2.1: Entry Screen
- [x] Create `ProductBuilderEntry.tsx`
- [x] Promise copy
- [x] "BUILD MY PRODUCT" magic button
- [x] Pull Excalibur data check (redirect if not available)

**Dependencies:** T1.1
**Estimated:** 1 hour ✅

---

#### T2.2: Deep ICP Screen
- [x] Create `DeepICPScreen.tsx`
- [x] Integrate with AI edge function (deepen-icp) - mock for demo
- [x] Loading state
- [x] ICP card display
- [x] ResonanceRating integration
- [x] "Deepen Pain" button

**Dependencies:** T1.1, T1.2, T2.5
**Estimated:** 3 hours ✅

---

#### T2.3: Deep Pain Screen
- [x] Create `DeepPainScreen.tsx`
- [x] Integrate with AI edge function (deepen-pain) - mock for demo
- [x] Display: Pressure, Consequences, Cost, Stakes
- [x] ResonanceRating integration
- [x] "Crystallize Promise" button

**Dependencies:** T2.2
**Estimated:** 2 hours ✅

---

#### T2.4: Deep TP Screen
- [x] Create `DeepTPScreen.tsx`
- [x] Point A → Point B visualization
- [x] AI-generated promise statement
- [x] ResonanceRating integration
- [x] "Build Landing Page" button

**Dependencies:** T2.3
**Estimated:** 2 hours ✅

---

#### T2.5: AI Edge Functions
- [ ] Create `deepen-icp` edge function *(deferred - using mock)*
- [ ] Create `deepen-pain` edge function *(deferred - using mock)*
- [ ] Create `deepen-tp` edge function *(deferred - using mock)*
- [ ] Create `generate-landing` edge function *(deferred - using mock)*
- [ ] Create `generate-blueprint` edge function *(deferred - using mock)*

**Dependencies:** T1.3
**Estimated:** 6 hours (deferred to post-hackathon)

---

#### T2.6: Landing Page Screen
- [x] Create `LandingPageScreen.tsx`
- [x] Live preview component
- [x] Hero, Pain, Promise, CTA sections
- [x] ResonanceRating integration
- [x] "Add Blueprint" button

**Dependencies:** T2.4, T2.5
**Estimated:** 4 hours ✅

---

#### T2.7: Blueprint Screen
- [x] Create `BlueprintScreen.tsx`
- [x] Methodology preview
- [x] Skip option (default blueprint)
- [x] "Set CTA" button

**Dependencies:** T2.6
**Estimated:** 2 hours ✅

---

#### T2.8: CTA Options Screen
- [x] Create `CTAOptionsScreen.tsx`
- [x] Session / Software toggle
- [x] Skip option (default: session)
- [x] "Publish" button

**Dependencies:** T2.7
**Estimated:** 1 hour ✅

---

#### T2.9: Published Screen (EPIC)
- [x] Create `PublishedScreen.tsx`
- [x] Confetti animation
- [x] Heart/Mind/Gut messaging
- [x] Copy link functionality
- [x] View on Marketplace button
- [x] Share functionality
- [x] Edit button

**Dependencies:** T2.8
**Estimated:** 3 hours ✅

---

### TIER 3: Integration (Do Third) ✅ COMPLETE

#### T3.1: Marketplace Integration
- [x] Product listing on marketplace
- [x] Public product URL generation (/mp/:slug)
- [x] Landing page rendering (mock)
- [x] Blueprint download (mock)

**Dependencies:** T2.9, T1.3
**Estimated:** 4 hours ✅

---

#### T3.2: Bridge from Excalibur
- [x] Add "Launch Product Builder" button after Excalibur
- [x] Pass data to Product Builder
- [x] Handle edge case: no Excalibur data

**Dependencies:** T2.1
**Estimated:** 1 hour ✅

---

### TIER 4: Polish (Do Last) ⏳ PARTIAL

#### T4.1: Emotional Journey Polish
- [x] Microcopy refinement
- [x] Loading message variety
- [ ] Transition animations (deferred)

**Dependencies:** All T2
**Estimated:** 2 hours ⏳

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
