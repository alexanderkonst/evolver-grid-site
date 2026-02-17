# Product Compiler Flow Spec
## The Complete User Journey from Genius to Published Product

> *"Six steps from 'who am I?' to 'here's my offer, buy it.'"*

---

## Overview

The Product Compiler is a 6-step flow that transforms a person's Unique Gift into a published, purchasable product on the marketplace.

**Total steps:** 6
**Estimated time:** 30-60 minutes (with AI acceleration)
**Output:** Live landing page on marketplace

---

## The Flow (Visual)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRODUCT COMPILER FLOW                            │
│                                                                     │
│   User enters with nothing. Exits with published product.          │
└─────────────────────────────────────────────────────────────────────┘

    ┌───────────┐     ┌───────────┐     ┌───────────┐
    │    1      │     │    2      │     │    3      │
    │ APPLESEED │ ──▶ │ EXCALIBUR │ ──▶ │   ICP     │
    │           │     │           │     │ DEEPENING │
    └───────────┘     └───────────┘     └───────────┘
                                              │
                                              ▼
    ┌───────────┐     ┌───────────┐     ┌───────────┐
    │    6      │     │    5      │     │    4      │
    │  PUBLISH  │ ◀── │  LANDING  │ ◀── │    TP     │
    │           │     │   PAGE    │     │ DEEPENING │
    └───────────┘     └───────────┘     └───────────┘
```

---

## Step-by-Step Specification

### STEP 1: APPLESEED (Unique Gift Discovery)
**Status:** ✅ Already implemented

| Aspect | Details |
|--------|---------|
| **Screen** | `/appleseed` |
| **Input** | 12 personality questions |
| **Processing** | AI synthesis + 3x Roasting (invisible) |
| **Output** | Unique Gift card with Vibrational Key, Bullseye Sentence, Three Lenses |
| **Duration** | ~5 minutes |
| **Validation** | Resonance Rating (1-10) |

**User sees:**
- Beautiful introduction
- 12 one-at-a-time questions
- Magical loading experience
- Revelation moment with epic hero card

---

### STEP 2: EXCALIBUR (Unique Business Generation)
**Status:** ✅ Already implemented

| Aspect | Details |
|--------|---------|
| **Screen** | `/excalibur` or inline after Appleseed |
| **Input** | Unique Gift data |
| **Processing** | AI generation of business identity, offer, ICP v1, TP v1 |
| **Output** | Unique Business card with USP, Who This Is For, Transformational Promise |
| **Duration** | ~2 minutes |
| **Validation** | Resonance Rating (1-10) |

**User sees:**
- "Reveal My Unique Business" button
- Magical loading
- Compact business card with key elements

---

### STEP 3: ICP DEEPENING (Ideal Client Mastery)
**Status:** 🔲 Template ready, needs implementation

| Aspect | Details |
|--------|---------|
| **Screen** | New: `/product-builder/icp` |
| **Input** | Excalibur data (esp. idealClient) |
| **Processing** | Pain Theory projection + 3x Roasting cycles (invisible) |
| **Output** | Deep ICP with pain mapping, pressure points, awareness stage |
| **Duration** | ~3 minutes (AI does heavy lifting) |
| **Validation** | "Does this describe your ideal client?" (Yes/Refine) |

**User sees:**
- "Let's deepen your understanding of your ideal client"
- Brief optional input (or skip with "Use AI to figure it out")
- Loading with progress indicators
- Rich portrait of their ideal client

**Template:** `docs/icp_deepening_template.md`

---

### STEP 4: TP DEEPENING (Transformational Promise Crystallization)
**Status:** 🔲 Template ready, needs implementation

| Aspect | Details |
|--------|---------|
| **Screen** | New: `/product-builder/promise` |
| **Input** | Deep ICP + Excalibur TP v1 |
| **Processing** | Pain Theory projection + 3x Roasting cycles (invisible) |
| **Output** | Vivid Point A → Point B with emotional resonance |
| **Duration** | ~3 minutes |
| **Validation** | "Does this capture the transformation you create?" |

**User sees:**
- "Now let's crystallize your transformational promise"
- Immersive A→B reveal
- Sensory language, metaphors, stakes

**Template:** `docs/tp_deepening_template.md`

---

### STEP 5: LANDING PAGE GENERATION
**Status:** 🔲 Needs spec and implementation

| Aspect | Details |
|--------|---------|
| **Screen** | New: `/product-builder/landing` |
| **Input** | Deep ICP + Deep TP + Excalibur |
| **Processing** | AI generates landing page copy + layout |
| **Output** | Complete landing page (preview + editable) |
| **Duration** | ~5 minutes |
| **Validation** | Visual preview, edit capability |

**User sees:**
- "Generating your landing page..."
- Live preview of the page
- Edit capabilities (optional)
- "This looks good" → proceed

**Page structure:**
1. Hero (Promise headline, subheadline)
2. Pain section (Point A, what they're experiencing)
3. Vision section (Point B, what becomes possible)
4. About (Genius-based credibility)
5. Offer (What they get)
6. CTA (Clear next step)

---

### STEP 6: PUBLISH TO MARKETPLACE
**Status:** 🔲 Needs implementation

| Aspect | Details |
|--------|---------|
| **Screen** | New: `/product-builder/publish` |
| **Input** | Complete landing page |
| **Processing** | Save to database, generate public URL |
| **Output** | Live page on marketplace |
| **Duration** | ~1 minute |
| **Validation** | "Your product is live!" celebration |

**User sees:**
- Final preview
- "Publish" button
- Celebration confetti
- Shareable link
- "View on Marketplace" CTA

---

## Data Flow

```
User Input (12 questions)
        │
        ▼
┌─────────────────────────────────────────┐
│           APPLESEED ENGINE              │
│  Questions → AI → Roast 3x → ZoG Card   │
└─────────────────────────────────────────┘
        │
        ▼
    ZoG Data (stored in zog_snapshots)
        │
        ▼
┌─────────────────────────────────────────┐
│          EXCALIBUR ENGINE               │
│  ZoG → AI → Roast 3x → Unique Business  │
└─────────────────────────────────────────┘
        │
        ▼
    Excalibur Data (stored in zog_snapshots)
        │
        ▼
┌─────────────────────────────────────────┐
│         ICP DEEPENING ENGINE            │
│  Excalibur → Pain Theory → Roast 3x     │
│  → Deep ICP                             │
└─────────────────────────────────────────┘
        │
        ▼
    Deep ICP (stored)
        │
        ▼
┌─────────────────────────────────────────┐
│         TP DEEPENING ENGINE             │
│  Deep ICP + TP v1 → Pain Theory         │
│  → Roast 3x → Deep TP                   │
└─────────────────────────────────────────┘
        │
        ▼
    Deep TP (stored)
        │
        ▼
┌─────────────────────────────────────────┐
│       LANDING PAGE ENGINE               │
│  Deep ICP + Deep TP + Excalibur         │
│  → Page structure → Copy generation     │
│  → Roast 3x → Final page                │
└─────────────────────────────────────────┘
        │
        ▼
    Landing Page (stored)
        │
        ▼
┌─────────────────────────────────────────┐
│         PUBLISH ENGINE                  │
│  Landing → Public URL → Marketplace     │
└─────────────────────────────────────────┘
        │
        ▼
    LIVE PRODUCT ON MARKETPLACE 🎉
```

---

## UI/UX Principles

1. **One screen = One focus** — never overwhelm
2. **AI does the heavy lifting** — user provides essence, AI expands
3. **Magic happens invisibly** — roasting cycles never shown
4. **Celebrate every step** — dopamine for progress
5. **Always skippable** — "Use AI to figure it out" option
6. **Always editable** — nothing is locked

---

## Technical Implementation

### New Routes Required

```
/product-builder              → Overview/Start
/product-builder/icp          → ICP Deepening
/product-builder/promise      → TP Deepening
/product-builder/landing      → Landing Page Gen
/product-builder/publish      → Publish to Marketplace
```

### New Components Required

```
ProductBuilderLayout.tsx      → Wrapper with progress
ICPDeepeningScreen.tsx        → Step 3
TPDeepeningScreen.tsx         → Step 4
LandingPageGenerator.tsx      → Step 5
PublishScreen.tsx             → Step 6
```

### New Edge Functions Required

```
deepen-icp                    → ICP Deepening with roasting
deepen-tp                     → TP Deepening with roasting
generate-landing-page         → Landing page generation
```

---

## Priority Order for Implementation

1. **ICPDeepeningScreen** — builds on existing Excalibur
2. **TPDeepeningScreen** — builds on ICP
3. **LandingPageGenerator** — pulls everything together
4. **PublishScreen** — final step, simpler

---

*Document created: January 24, 2026*
*This is the master blueprint for the Product Compiler*
