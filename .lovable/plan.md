

# Apply Marketing Playbook to All Modules — Workflow + Execution

## Understanding

You're absolutely right. The sequence is:

1. **Product Playbook Phase 1** (per module) -- define Master Result, Sub-Results, transformation (Point A to Point B)
2. **Marketing Playbook** (per module) -- using the Master Result as input, generate Core Belief, Packaging, ICP, Customer Forces, and Landing Page content

Without the Master Result and its sub-results, we can't write a landing page -- we wouldn't know what transformation to promise.

## What Already Exists

Good news: the taxonomy (v2.2) already has Master Results for every module. For example:
- ZoG: "Who am I?" to "I know my genius and how to use it"
- QoL: "Fog about my life" to "Clear map of where I stand"
- Men's Circle: "Alone in my journey" to "Held by brothers"

But these are one-liners. To build a proper landing page, we need the full depth from both playbooks.

---

## Plan: Create a Reusable Workflow + Execute for Priority 1 Modules

### Part 1: Create the Workflow SOP

**File:** `docs/04-workflows/module_landing_page_workflow.md`

A step-by-step SOP that can be applied to ANY module. It chains two playbooks:

```text
STEP 1: PRODUCT PLAYBOOK (Phase 1 only -- just the result layer)
  1.1  Define Master Result (Point A to Point B -- one sentence)
  1.2  List Sub-Results (3-7 intermediate wins)
  1.3  Define Artifacts (what user walks away with)
  1.4  Define Bridges (what comes before/after this module)

STEP 2: MARKETING PLAYBOOK (Phases 0-4)
  2.0  Core Belief (what we fundamentally believe about this domain)
  2.1  Packaging (free/paid, format, value ladder position)
  2.2  Frictionless Purchase (price, CTA, one-click readiness)
  2.3  Core Message Stack (one-liner, resonance hook, anti-messages)
  2.4  Messaging Ladder (hook, resonance, proof, action)
  2.5  ICP Deep Dive -- Heart, Mind, Gut (Three Dan Tians)

STEP 3: CUSTOMER FORCES ANALYSIS
  3.1  PUSH (what drives them away from status quo)
  3.2  PULL (what attracts them to this solution)
  3.3  ANXIETY (what stops them from starting)
  3.4  INERTIA (what keeps them stuck)
  3.5  ENEMY (the status quo to fight)

STEP 4: LANDING PAGE CONTENT
  4.1  Hero (headline + subheadline + CTA)
  4.2  For Whom section
  4.3  Pain section (from Customer Forces PUSH)
  4.4  Solution section (from Sub-Results)
  4.5  Outcomes section (from Artifacts)
  4.6  How It Works (from Sub-Results sequence)
  4.7  Story/Origin (from Core Belief)
  4.8  Final CTA

OUTPUT: One markdown file per module at:
  docs/06-modules/[module-slug]/landing_page_content.md
```

### Part 2: Execute for Priority 1 Modules

Priority 1 modules are the free acquisition funnels:

| Module | Why Priority 1 |
|--------|---------------|
| Zone of Genius | Free entry point, highest traffic, main acquisition funnel |
| Quality of Life | Free entry point, second acquisition funnel |

For each of these two modules, we will:
1. Run through the workflow above
2. Output a complete `landing_page_content.md` with all marketing data filled in
3. This content can later drive a universal `ModuleLandingTemplate` component

### Part 3: Create Module Content Directory Structure

```text
docs/06-modules/
  zone-of-genius/
    landing_page_content.md    -- marketing data for ZoG landing
  quality-of-life/
    landing_page_content.md    -- marketing data for QoL landing
```

This structure scales: as we apply the workflow to more modules, each gets its own folder.

---

## Technical Deliverables

| # | File | Description |
|---|------|-------------|
| 1 | `docs/04-workflows/module_landing_page_workflow.md` | Reusable SOP chaining Product Playbook to Marketing Playbook to Landing Page |
| 2 | `docs/06-modules/zone-of-genius/landing_page_content.md` | Full marketing content for ZoG landing page |
| 3 | `docs/06-modules/quality-of-life/landing_page_content.md` | Full marketing content for QoL landing page |

No code changes in this step -- this is content/strategy work. The code implementation (ModuleLandingTemplate component, routes) comes after the content is approved.

---

## Execution Sequence

1. Write the workflow SOP (the reusable template)
2. Apply it to Zone of Genius (using existing landing page content + taxonomy Master Result as input)
3. Apply it to Quality of Life (same process)
4. Review output -- these become the data source for future landing page components

