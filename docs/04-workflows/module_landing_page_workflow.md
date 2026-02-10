# Module Landing Page Workflow (SOP)

> **Version:** 1.0
> **Created:** 2026-02-10
> **Purpose:** Reusable step-by-step process to generate landing page content for ANY module
> **Inputs:** Module Taxonomy entry (Master Result) + Product Playbook + Marketing Playbook + Customer Forces Framework
> **Output:** `docs/06-modules/[module-slug]/landing_page_content.md`

---

## Prerequisites

Before starting this workflow for a module, you need:

1. **Module exists in taxonomy** (`docs/02-strategy/module_taxonomy.md`) with Master Result defined
2. Access to **Product Playbook** (`docs/03-playbooks/product_playbook.md`)
3. Access to **Marketing Playbook** (`docs/03-playbooks/marketing_playbook.md`)
4. Access to **Landing Page Copywriting Framework** (`docs/02-strategy/landing_page_copywriting_framework.md`)

---

## STEP 1: PRODUCT LAYER (Result Definition)

> **Source:** Product Playbook, Phase 1-2
> **Goal:** Define the transformation this module delivers, with enough depth for marketing.

### 1.1 Master Result

Define the one-sentence transformation:

```
FROM: [Point A — what the user's life/work looks like BEFORE]
TO:   [Point B — what the user's life/work looks like AFTER]
```

**Quality check:** Can someone who's never heard of this module understand the transformation from this sentence alone?

### 1.2 Sub-Results (3-7 intermediate wins)

List the stepping stones from Point A to Point B. Each is a felt win the user experiences along the way.

| # | Sub-Result | What user gains |
|---|------------|-----------------|
| 1 | | |
| 2 | | |
| 3 | | |

**Quality check:** If a user completes sub-results 1-N, do they inevitably arrive at Point B?

### 1.3 Artifacts (what user walks away with)

Tangible outputs the user receives:

| Artifact | Format | When received |
|----------|--------|---------------|
| | | |

**Quality check:** Can the user show/share these artifacts with someone else?

### 1.4 Bridges (what comes before/after)

| Direction | Module | Connection |
|-----------|--------|------------|
| **Before** (recommended prerequisite) | | |
| **After** (natural next step) | | |

---

## STEP 2: MARKETING LAYER (Messaging Strategy)

> **Source:** Marketing Playbook, Phases 0-4
> **Goal:** Create the belief system and messaging that makes the right person say "that's for me."

### 2.0 Core Belief

```
We believe that [fundamental truth about this domain].
```

**Filter test:** Does every piece of copy on this landing page align with this belief?

### 2.1 Packaging

| Field | Value |
|-------|-------|
| **Price** | Free / $X / Revenue share |
| **Format** | Assessment / Course / Session / Tool / Community |
| **Value ladder position** | Entry (free) → Low-ticket → Mid-ticket → High-ticket |
| **What they get for free** | |
| **What's behind paywall** | |

### 2.2 Frictionless Purchase

| Field | Value |
|-------|-------|
| **CTA action** | Start free / Pay $X / Book session |
| **One-click ready?** | Yes/No — what's needed? |
| **Objections pre-answered** | List top 3 objections and how copy addresses them |

### 2.3 Core Message Stack

```
1. CORE BELIEF: "We believe..."
2. ONE-LINER: "[Module] helps [who] [do what] so they can [transformation]."
3. RESONANCE HOOK: "For people who [specific situation they'll recognize]..."
4. ANTI-MESSAGES (what we NEVER say):
   - NOT: [feature-speak]
   - NOT: [hype-speak]
   - NOT: [comparison-speak]
```

### 2.4 Messaging Ladder

```
L1 — HOOK (stops scroll):
   "[question or statement that creates instant recognition]"

L2 — RESONANCE (creates connection):
   "[values-based statement they identify with]"

L3 — PROOF (builds trust):
   "[evidence, testimonials, credentials, or specificity]"

L4 — ACTION (converts):
   "[clear next step with low friction]"
```

### 2.5 ICP Deep Dive — Three Dan Tians

#### 🫀 Heart (What They Truly Want)

| Field | Value |
|-------|-------|
| Deep desire | |
| Emotional need | |
| Pain Point A (where they are now) | |

#### 🧠 Mind (What They Think)

| Field | Value |
|-------|-------|
| Beliefs about the problem | |
| Beliefs about solutions | |
| Key objections | |
| Awareness stage (1-5) | |

#### 🔥 Gut (What They'll Do)

| Field | Value |
|-------|-------|
| Current behavior | |
| Trigger for action | |
| Barrier to action | |

---

## STEP 3: CUSTOMER FORCES ANALYSIS

> **Source:** Landing Page Copywriting Framework
> **Goal:** Map the psychological forces that drive or block the purchase/signup decision.

### 3.1 PUSH (What's pushing them AWAY from status quo?)

- External pressures they experience daily
- What's NOT working anymore
- The quiet dread they don't talk about

### 3.2 PULL (What's pulling them TOWARD this solution?)

- The dream outcome
- What they're drawn to
- The promise they can't ignore

### 3.3 ANXIETY (What stops them from starting?)

- Fears about the solution itself
- Past failures with similar things
- Identity concerns ("Am I the kind of person who...")

### 3.4 INERTIA (What keeps them stuck?)

- Default behaviors that feel safe
- Sunk costs in current approach
- Familiar moves that work "well enough"

### 3.5 ENEMY (The status quo to fight against)

One sentence: "The enemy is [specific force/pattern/system] that keeps people stuck in [Point A]."

---

## STEP 4: LANDING PAGE CONTENT

> **Goal:** Map all of the above into concrete landing page sections.
> **Template:** Follows the Universal Landing Page Template from `docs/05-reference/module_landing_page_infrastructure.md`

### 4.1 Hero

| Field | Value |
|-------|-------|
| **For audience** | "For [specific ICP]" |
| **Headline** (8-15 words) | |
| **Subheadline** (15-25 words, includes "without..." clause) | |
| **CTA button text** (3-5 words) | |
| **CTA button link** | Route to module entry |

### 4.2 For Whom Section

3-5 bullets describing who this is for, using "You..." or "For people who..." format.

### 4.3 Pain Section (from Customer Forces PUSH)

| Field | Value |
|-------|-------|
| **Section header** | "When your [situation]..." style |
| **Pain bullets** (4 items) | Each: pain point + consequence |

### 4.4 Solution Section (from Sub-Results)

| Field | Value |
|-------|-------|
| **Section header** | "A clear system to..." style |
| **Solution steps** (3-5 items) | Each: verb + what happens |

### 4.5 Outcomes Section (from Artifacts)

What you walk away with — concrete, tangible list.

### 4.6 How It Works

Simple 3-step flow showing the user journey.

### 4.7 Story/Origin (from Core Belief)

Brief paragraph: Why does this exist? What belief drove its creation?

### 4.8 Final CTA

| Field | Value |
|-------|-------|
| **Headline** | Punchy, action-oriented |
| **Subheadline** | What they get |
| **Button text** | Same as hero CTA |

---

## OUTPUT

Save the completed content to:

```
docs/06-modules/[module-slug]/landing_page_content.md
```

This file becomes the **data source** for the `ModuleLandingTemplate` component. No code changes needed until content is approved.

---

## Checklist

- [ ] Step 1 complete: Master Result, Sub-Results, Artifacts, Bridges
- [ ] Step 2 complete: Core Belief, Packaging, Message Stack, ICP
- [ ] Step 3 complete: All 5 Customer Forces defined
- [ ] Step 4 complete: All 8 landing page sections filled
- [ ] Output saved to `docs/06-modules/[module-slug]/landing_page_content.md`
- [ ] Content reviewed and approved

---

*SOP v1.0 — 2026-02-10*
*Chains: Product Playbook → Marketing Playbook → Customer Forces → Landing Page*
