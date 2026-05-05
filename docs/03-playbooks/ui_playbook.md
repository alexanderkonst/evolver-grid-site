# UI Playbook
## Product Playbook Applied to Visual Design

*"The ultimate goal of every interface is to become invisible."*

> **Meta-note:** This Playbook treats UI as a product.
> Input: Software architecture. Output: Beautiful, usable interface that looks and feels right.

---

# Part I: Philosophy — First Principles

## UX vs UI

| Aspect | UX (User Experience) | UI (User Interface) |
|--------|---------------------|---------------------|
| **Definition** | The journey through the system | The visual surface of the system |
| **Question** | "Does this make sense?" | "Does this look/feel right?" |
| **Order** | First (skeleton) | Second (skin) |
| **Product Playbook** | Applies to journey structure | Applies to visual elements |

**Key insight:** UX and UI are two nested products:
- UX = Product that creates "user knows what to do"
- UI = Product that creates "user trusts and enjoys"

---

## UX/UI Taxonomy

```
UX/UI
├── UX (User Experience) — HOW user moves through system
│   │
│   ├── User Journey — full path from A to Z
│   │   │
│   │   ├── ONBOARDING (first touch)
│   │   │   ├── Welcome
│   │   │   ├── Unique Gift
│   │   │   ├── Quality of Life
│   │   │   ├── Tour
│   │   │   └── Home (first landing)
│   │   │
│   │   ├── DAILY LOOP (regular use)
│   │   │   ├── Return to Home
│   │   │   ├── My Next Move
│   │   │   ├── Action completion
│   │   │   └── XP/Progress
│   │   │
│   │   ├── EXPLORATION (expansion)
│   │   │   ├── Discover spaces
│   │   │   ├── Try new modules
│   │   │   └── Deep dives
│   │   │
│   │   └── MONETIZATION (value path)
│   │       ├── Unique Business
│   │       ├── Marketplace
│   │       └── Incubator
│   │
│   ├── User Flows — specific tasks
│   │   ├── Complete ZoG flow
│   │   ├── Complete Quest flow
│   │   └── Match with someone flow
│   │
│   └── Navigation — how to move around
│       ├── Information architecture
│       ├── Menu structure
│       └── Breadcrumbs
│
└── UI (User Interface) — HOW it looks
    │
    ├── Design Tokens (atoms)
    │   ├── Colors
    │   ├── Typography
    │   ├── Spacing
    │   └── Shadows
    │
    ├── Components (molecules)
    │   ├── Buttons
    │   ├── Cards
    │   ├── Inputs
    │   └── Modals
    │
    ├── Patterns (organisms)
    │   ├── Navigation pattern
    │   ├── Form pattern
    │   └── Card grid pattern
    │
    └── Pages (templates)
        ├── Landing page
        ├── Dashboard page
        └── Form page
```

**Key distinctions:**
- **User Journey** = entire user path (from first contact to retention)
- **Onboarding** = first part of journey (signup → ready to use)
- **User Flow** = specific task within journey (e.g., "complete ZoG")



## Through Three Lenses

### UX — 🫀 Essence
**UX IS** the felt sense of navigating a system. Not what you see, but what you experience.

### UX — 🧠 Significance  
**UX MEANS** reduced cognitive load. The interface disappears; user focuses on their goal.

### UX — 🔥 Implications
**UX CREATES** flow state or frustration. Good UX = effortless action. Bad UX = abandonment.

---

### UI — 🫀 Essence
**UI IS** visual communication. Every pixel speaks.

### UI — 🧠 Significance
**UI MEANS** hierarchy and harmony. What to look at first, what's clickable, what's related.

### UI — 🔥 Implications
**UI CREATES** trust or doubt. Good UI = "I want to use this." Bad UI = "This feels cheap."

---

## The Five Pillars of UI

> These five pillars come first — CSS and components built without them tend to feel cheap or break trust on first impression.

### Master Result

> **From** "Software architecture exists (modules, routes, data)"
> **To** "Software architecture LOOKS and FEELS right, works for humans"

**Point A (Before UI):**
- Routes work
- Data flows
- No visual design
- Looks like developer tool

**Point B (After UI):**
- Beautiful, trustworthy interface
- Consistent look & feel
- User knows what to do intuitively
- Transformational experience FELT

---

### The Five Pillars (Through Three Lenses)

| Pillar | Суть (Essence) | Значимость (Significance) | Следствие (Consequence) |
|--------|---------------|--------------------------|------------------------|
| **1. Visual Rules** | Single source: colors, fonts, spacing | Without = inconsistent look | Change once → everywhere |
| **2. Building Blocks** | Reusable components (buttons, cards) | Without = rewriting code | Speed + consistency |
| **3. Layout Templates** | Page assembly patterns | Without = reinvent each page | Faster screen creation |
| **4. Brandbook Integration** | Visual identity, voice, energy | Without = functional but soulless | Emotional connection |
| **5. Emotional Flow** | How UI guides feelings through journey | Without = no transformation | User FEELS the journey |

---

### Pillar 5: Emotional Flow (Deep Dive)

**Why it matters:**

The other four pillars make UI **functional** and **beautiful**.
Emotional Flow makes UI **transformational**.

| Screen Type | Emotional Goal | UI Treatment |
|-------------|----------------|---------------|
| **Welcome** | Excitement, belonging | Warm colors, personal addressing |
| **Assessment** | Focus, introspection | Minimal distractions, calm palette |
| **Result reveal** | Celebration, validation | Animation, confetti, achievement |
| **Daily return** | Motivation, clarity | Progress visible, clear next action |
| **Deep work** | Flow state | Immersive, no navigation |

**Question for each screen:**
> "How should the user FEEL right now, and does the UI honor that?"

---

## Core Principles (Non-Negotiable)

### 1. Mobile-First

**Design for mobile, then expand to desktop. Never the reverse.**

Why:
- 60%+ traffic is mobile
- Mobile constraints force clarity
- Desktop-first = rebuild later

**The Discord Pattern:**

```
MOBILE (<768px):      [Panel 1]  ← toggle → [Panel 2]
                      One panel visible, others slide in from edge

TABLET (768-1023px):  [Panel 1] [Panel 2]
                      Two panels visible, third slides

DESKTOP (≥1024px):    [Panel 1] [Panel 2] [Panel 3]
                      All panels visible
```

**Formula:**
| Screen | Orientation | Panels Visible | Navigation |
|--------|-------------|----------------|------------|
| Mobile | Vertical | 1 | Hamburger in top-left |
| Tablet | Horizontal | 2 | Sidebar toggle |
| Desktop | Horizontal | 3 | All visible |

**Implementation:**
- Start with mobile layout
- At 768px breakpoint: add second panel
- At 1024px breakpoint: add third panel
- Navigation always accessible from top-left corner

---

### 2. Performance Budgets

**Speed is UX. Slow = bad UX, no matter how beautiful.**

**Budgets:**

| Metric | Target | Critical |
|--------|--------|----------|
| First Contentful Paint (FCP) | < 1.5s | < 2.5s |
| Largest Contentful Paint (LCP) | < 2.5s | < 4.0s |
| Time to Interactive (TTI) | < 3.5s | < 5.0s |
| Total Page Weight | < 500KB | < 1MB |
| JavaScript Bundle | < 200KB | < 400KB |
| Images | Lazy load + WebP | Always |

**Rules:**
1. Every image is lazy-loaded
2. Every image is WebP (with fallback)
3. No blocking JavaScript in head
4. CSS is inlined critical + async rest
5. Measure before/after every change

**Validation:**
- Run Lighthouse before deploy
- All pages score ≥ 90 performance
- If fails budget → fix before ship

---

### 3. Micro-Interactions (Delight Layer)

**Small animations that make the interface feel alive.**

| Interaction | Animation | Duration |
|-------------|-----------|----------|
| Button hover | Scale 1.02 + shadow | 150ms |
| Button click | Scale 0.98 | 100ms |
| Page transition | Fade + slide | 200ms |
| Modal open | Fade in + scale | 200ms |
| Toast appear | Slide in from edge | 300ms |
| Success | Subtle bounce/pulse | 400ms |

**Rule:** If no animation, feels dead. If too much, feels distracting.

---



# Part II: Execution Workflow

*Follow this sequence. Don't skip.*

```
PHASE 1: MASTER RESULT
1. State the Master Result of UX/UI
2. Define Point A (current state) and Point B (desired state)
3. Define what "done" looks like

PHASE 2: SUB-RESULTS
4. List Sub-Results that lead to Master Result
5. Sequence them (UX before UI)
6. Define Start/End for each

PHASE 3: NESTED LAYERS
7. Go deeper into each Sub-Result
8. Repeat until atomic
9. Stop when no more nesting needed

PHASE 4: DETAILS
10. For each sub-result: Data Output, Data Input, Magic Button

PHASE 5: ROAST & ITERATE
11-13. Critique, test with users, fix, repeat

PHASE 6: EXTENSION MODULES
14-17. Artifacts, Emotional States, Completion, Skip Paths

PHASE 7: EXECUTION PLAN
18-20. First actions, metrics, timeline

PHASE 8: BUILD & VERIFY
21-23. Implement, test, iterate
```

---

## Phase 1: Define the Master Result

### Step 1: State the Master Result

**Master Result of UX:**
> "From 'user doesn't know what to do' to 'user completes their goal effortlessly.'"

**Master Result of UI:**
> "From 'visual chaos' to 'harmonious, trustworthy interface.'"

**Combined:**
> "From 'confused, distrusting user' to 'user in flow state, trusting the system.'"

### Step 2: Point A → Point B

**Point A (Before):**
- User confused about next step
- Visual inconsistency
- Cognitive overload
- Doubt about legitimacy

**Point B (After):**
- Clear path at every screen
- Visual harmony
- Minimal cognitive load
- Trust and delight

### Step 3: Define "Done"

UX/UI is DONE when:
- [ ] User completes key flows without asking "what now?"
- [ ] All screens follow consistent patterns
- [ ] Usability score ≥ 8/10
- [ ] Visual harmony confirmed against brandbook
- [ ] Test users say "this feels good to use"

---

## Phase 2: Break into Sub-Results

### Step 4: List Sub-Results

| # | Sub-Result | Focus | Artifact |
|---|------------|-------|----------|
| 1 | **Flows Mapped** | UX | User Flow Map |
| 2 | **Screens Inventoried** | UX | Screen Inventory |
| 3 | **Patterns Standardized** | UX/UI | Pattern Library |
| 4 | **Tokens Defined** | UI | Design Tokens |
| 5 | **Hierarchy Established** | UI | Visual Hierarchy Guide |
| 6 | **Harmony Applied** | UI | Harmony Checklist |
| 7 | **Tested & Validated** | Both | Test Results |

### Step 5: Sequence

```
1. Flows → 2. Screens → 3. Patterns → 4. Tokens → 5. Hierarchy → 6. Harmony → 7. Test
```

UX (1-3) before UI (4-6). Test (7) validates both.

---

## Phase 3: Nested Layers

### Sub-Result 1: Flows Mapped

**Nested into:**
- 1.1 Onboarding flow
- 1.2 Daily loop flow
- 1.3 Quest flow
- 1.4 Upgrade flow
- 1.5 Settings/Profile flow

### Sub-Result 2: Screens Inventoried

**Nested into:**
- 2.1 Page types catalog
- 2.2 Screen count per flow
- 2.3 Critical screens identified

### Sub-Result 3: Patterns Standardized

**Nested into:**
- 3.1 Navigation patterns
- 3.2 Form patterns
- 3.3 Card patterns
- 3.4 Modal patterns
- 3.5 Feedback patterns

### Sub-Result 4: Tokens Defined

**Nested into:**
- 4.1 Color tokens
- 4.2 Typography tokens
- 4.3 Spacing tokens
- 4.4 Border/Shadow tokens
- 4.5 Animation tokens

### Sub-Result 5: Hierarchy Established

**Nested by page type** (Landing, Dashboard, Form, etc.)

### Sub-Result 6: Harmony Applied

**Atomic** — checklist against each screen.

### Sub-Result 7: Tested

**Nested into:**
- 7.1 Self-test (walk through)
- 7.2 User test (observe)
- 7.3 Fix issues
- 7.4 Retest

---

## Phase 4: Details (For Each Sub-Result)

### Sub-Result 1: Flows Mapped

| Aspect | Details |
|--------|---------|
| **Data Output** | User Flow Map |
| **Data Input** | Current app structure, key journeys |
| **Magic Button** | "Map All Flows" |
| **Validation** | "Can I trace every user journey from start to goal?" |

**Output Template:**
```
FLOW: [Flow Name]
Entry: [Where user starts]
Steps: 
1. [Screen] → [Action] → 
2. [Screen] → [Action] → 
3. ...
Exit: [Where user ends / goal achieved]
Friction points: [Where users might get stuck]
```

---

### Sub-Result 2: Screens Inventoried

| Aspect | Details |
|--------|---------|
| **Data Output** | Screen Inventory |
| **Data Input** | All existing screens |
| **Magic Button** | "Inventory Screens" |
| **Validation** | "Do I have a complete list of every screen?" |

**Output Template:**
```
SCREEN INVENTORY:

| # | Screen Name | Flow | Page Type | Priority |
|---|-------------|------|-----------|----------|
| 1 | | | | |
| 2 | | | | |

TOTALS:
- Total screens: [#]
- Critical screens: [#]
- Needs work: [#]
```

---

### Sub-Result 3: Patterns Standardized

| Aspect | Details |
|--------|---------|
| **Data Output** | Pattern Library |
| **Data Input** | Common UI patterns in use |
| **Magic Button** | "Standardize Patterns" |
| **Validation** | "Does every pattern have one canonical implementation?" |

**Output Template:**
```
PATTERN: [Pattern Name]
Use case: [When to use]
Structure: [Elements included]
Variants: [sm/md/lg or other]
Example: [Screenshot or ASCII]
Anti-pattern: [What NOT to do]
```

---

### Sub-Result 4: Tokens Defined

| Aspect | Details |
|--------|---------|
| **Data Output** | Design Tokens |
| **Data Input** | Brandbook, current styles |
| **Magic Button** | "Define Tokens" |
| **Validation** | "Is every style decision a token, not a magic number?" |

**Output Template:**
```
TOKENS:

Colors:
- primary: #XXX
- secondary: #XXX
- ...

Typography:
- h1: [size, weight, line-height]
- body: [size, weight, line-height]
- ...

Spacing:
- xs: 4px
- sm: 8px
- ...
```

---

### Sub-Result 5-7: Similar structure...

---

## Phase 5: Roast & Iterate

### Step 11: Roast the Spec

| Category | Questions |
|----------|-----------|
| **Flow clarity** | Is next step obvious on every screen? |
| **Consistency** | Same patterns throughout? |
| **Cognitive load** | Too much on any screen? |
| **Hierarchy** | Clear what's most important? |
| **Harmony** | Elements feel like a family? |

### Step 12: Test with Users

1. Give user a task
2. Watch silently
3. Note where they hesitate
4. Ask "what were you thinking?"

### Step 13: Fix & Repeat

Minimum 2-3 test cycles.

---

## Phase 6: Extension Modules

### Artifacts

| Sub-Result | Artifact |
|------------|----------|
| Flows | User Flow Map |
| Screens | Screen Inventory |
| Patterns | Pattern Library |
| Tokens | Design Tokens |
| Hierarchy | Visual Hierarchy Guide |
| Harmony | Harmony Checklist |
| Testing | Test Results + Issue List |

### Completion

| Sub-Result | ✅ Done When |
|------------|-------------|
| Flows | All key flows mapped |
| Screens | 100% inventory |
| Patterns | All patterns have canonical form |
| Tokens | No magic numbers in CSS |
| Hierarchy | Every page has clear focus |
| Harmony | Passes checklist |
| Testing | Users complete tasks without confusion |

---

## Phase 7: Execution Plan

### First Actions (Today)

```
1. [ ] Map onboarding flow (highest priority)
2. [ ] Identify top 5 friction points
3. [ ] Walk through onboarding, screenshot each step
```

### Metrics

| Metric | Target |
|--------|--------|
| Task completion rate | ≥90% |
| Time to complete (onboarding) | <5 min |
| User confusion points | 0 |
| Visual consistency score | 100% |

### Timeline

| Day | Milestone |
|-----|-----------|
| Today | Onboarding flow mapped + friction points |
| Tomorrow | Patterns + tokens standardized |
| Day 3 | User testing |
| Day 4+ | Iterate based on tests |

---

## Phase 8: Build & Verify

### Step 21: Implement

Apply fixes to highest-priority friction points first.

### Step 22: Test

After each fix:
- Self-test the flow
- Quick user test if possible

### Step 23: Iterate

Continue until test users complete flows without confusion.

---

## Quick Start: Screenshot Workflow

For rapid iteration:

```
1. Walk through flow
2. Screenshot each screen
3. Send to AI with prompt:

"Analyze these screenshots using UX/UI Playbook:
- Flow clarity: is next step obvious?
- Patterns: are they consistent?
- Hierarchy: is focus clear?
- Harmony: do elements belong together?
- Issues: prioritized list
- Fixes: specific recommendations"

4. Implement top 3 fixes
5. Repeat
```

---

# Part III: Premium UI Enhancement

> **Purpose:** Transform functional UI into premium Planetary OS experience that matches the brandbook vision.

## The Premium Standard

| Element | ❌ Avoid | ✅ Premium |
|---------|---------|-----------|
| Text color | Pure `black` or `#000` | `#2c3150` (charcoal) or `rgba(44,49,80,0.7)` |
| Buttons | Plain white/gray, flat | `PremiumButton` with gradient + glow |
| Cards | Plain white `bg-white` | `PremiumCard` with glass effect |
| Loading | `Loader2` from lucide | `PremiumLoader` or `premium-spinner` |
| Headings | System sans-serif | `font-display` (Cormorant Garamond) |
| Body text | Default styles | `font-sans` (DM Sans), tight letter-spacing |

---

## Premium Components (Required)

### 1. PremiumCard

```tsx
import { PremiumCard } from "@/components/ui/PremiumCard";

// Variants: "glass" (default), "glass-strong", "solid"
<PremiumCard variant="glass-strong" className="p-4">
  {/* Content */}
</PremiumCard>
```

**Use for:** Choice cards, result displays, content boxes, modal bodies

### 2. PremiumButton

```tsx
import { PremiumButton } from "@/components/ui/PremiumButton";

<PremiumButton size="lg" loading={isLoading}>
  Continue
</PremiumButton>
```

**Use for:** Primary CTAs, important actions, form submissions

### 3. HeroIcon

```tsx
import { HeroIcon } from "@/components/ui/HeroIcon";
import { Sparkles } from "lucide-react";

<HeroIcon icon={Sparkles} size="lg" variant="gradient" />
```

**Use for:** Page headers, result reveals, celebration moments

### 4. PremiumLoader

```tsx
import { PremiumLoader, FullPageLoader } from "@/components/ui/PremiumLoader";

// Component-level loading
<PremiumLoader size="lg" />

// Full page with message
<FullPageLoader text="Preparing your journey..." />
```

**Use for:** All loading states. Never use `Loader2` directly.

### 5. premium-spinner (CSS class)

```tsx
// For inline/button loading states
<span className="premium-spinner w-4 h-4" />
```

### 6. prompt-barely-visible (CSS class)

For prompts users should **copy, not read**. Intentionally low contrast to discourage reading.

```tsx
// Prompt text that users copy to their AI
<pre className="prompt-barely-visible">
    {PROMPT_TEXT}
</pre>
```

**CSS Definition:**
```css
.prompt-barely-visible {
    color: rgba(44, 49, 80, 0.15) !important;
    transition: color 0.2s ease;
}

.prompt-barely-visible:hover {
    color: rgba(44, 49, 80, 0.3) !important;
}
```

**Used in:**
- Unique Gift flow
- Asset Mapping
- Mission Discovery  
- Genius Offer intake

**Rationale:** Users don't need to read AI prompts — they just need to copy them. Visible text distracts users and makes them start reading. Barely visible text signals "just copy this."

### 7. Breathing UI Effects (CSS classes)

From the "UI as Transmission" vision. Makes interfaces feel alive.

```tsx
// Subtle breathing on cards
<PremiumCard className="breathing-card">...</PremiumCard>

// Full alive effect (breathing + glow)
<PremiumCard className="alive-card">...</PremiumCard>

// Aurora gradient background (cosmic flow)
<div className="aurora-gradient">...</div>

// Animated gradient text
<h1 className="aurora-text">Your Title</h1>

// Gentle glow pulse
<div className="glowing-card">...</div>
```

**Available classes:**
| Class | Effect |
|-------|--------|
| `breathing-card` | Subtle scale + opacity pulse (6s) |
| `aurora-gradient` | Shifting violet→aqua→royal background (15s) |
| `aurora-text` | Animated gradient text (12s) |
| `glowing-card` | Pulsing violet shadow (4s) |
| `alive-card` | Combined breathing + glow |

**Used in:**
- ExcaliburDisplay (alive-card)
- GameHome onboarding hero (alive-card)
- Unique Gift entry header (aurora-text)
- Asset Mapping header (aurora-text)
- Mission Discovery header (aurora-text)
- RevelatoryHero (breathing-card)
- NextMoveCard (breathing-card)
- MeSummary (breathing-card)
- MyLifeSummary (breathing-card)

---

## Color System

### Primary Text Colors

| Variable | Value | Use |
|----------|-------|-----|
| `--wabi-text-primary` | `#2c3150` | Headings, important text |
| `--wabi-text-secondary` | `rgba(44,49,80,0.7)` | Body text, descriptions |
| `--wabi-text-muted` | `rgba(44,49,80,0.5)` | Hints, subtle labels |

### Accent Colors

| Variable | Value | Use |
|----------|-------|-----|
| `--depth-violet` | `#8460ea` | Primary accent, CTAs |
| `--depth-royal` | `#29549f` | Secondary accent |
| `--wabi-lavender` | `#a4a3d0` | Soft accent, icons |
| `--wabi-aqua` | `#a7cbd4` | Secondary options |

### Glassmorphism Tokens (Light-Surface)

For glass effects on **light/pearl backgrounds** (platform app pages within GameShell):

```css
--glass-bg: rgba(255, 255, 255, 0.85);
--glass-bg-strong: rgba(255, 255, 255, 0.95);
--glass-border: rgba(255, 255, 255, 0.3);
```

### Liquid Glass Morphism (Dark-Surface)

For glass effects on **dark backgrounds** (landing pages, marketing pages, video backgrounds).
This is the system used on `/ignite` and `/quiz` result pages.

**Two tiers:**

| Class | Blur | Use case |
|-------|------|----------|
| `.liquid-glass` | 4px (subtle) | Cards, sections, pills, option buttons |
| `.liquid-glass-strong` | 50px (heavy) | CTAs, pricing panels, hero buttons |

**CSS definitions** (already in `src/index.css`):

```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}
/* ::before pseudo-element creates luminous edge gradient */

.liquid-glass-strong {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  box-shadow: 4px 4px 4px rgba(0,0,0,0.05),
              inset 0 1px 1px rgba(255,255,255,0.15);
  position: relative;
  overflow: hidden;
}
```

**What makes it work:** The `::before` pseudo-element on both classes creates a luminous edge gradient — a soft light-to-transparent border that makes the glass feel dimensional, not flat. The difference between `.liquid-glass` (4px blur, subtle) and `.liquid-glass-strong` (50px blur, heavy) creates depth hierarchy.

**Dark-surface layout pattern:**

```tsx
{/* 1. Full-bleed background (video or gradient) */}
<div className="relative min-h-screen bg-black text-white overflow-hidden">
  <video ... className="fixed inset-0 w-full h-full object-cover z-0" />
  
  {/* 2. Dark overlay for readability */}
  <div className="fixed inset-0 bg-black/45 z-[1]" />
  
  {/* 3. Content layer — all sections float above */}
  <div className="relative z-10 max-w-2xl mx-auto px-4 py-16 space-y-14">
    {/* Glass cards and CTAs go here */}
    <a className="liquid-glass-strong rounded-xl px-6 py-4 ..." />
  </div>
</div>
```

**Text hierarchy on dark surfaces:**
- `text-white` — headlines, key phrases
- `text-white/80` — body paragraphs
- `text-white/50` — secondary text, subheadings
- `text-white/20` — hints, micro-labels

**Headline glow (hero moments only):**
```css
text-shadow: 0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.1);
```

**Portable blueprint:** See `docs/03-playbooks/glassmorphism_blueprint.md` for a copy-paste instruction you can hand to any AI agent.

---

## Typography Scale

Based on 1.25 modular scale for clear visual hierarchy.

| Role | Size | Tailwind | Where |
|------|------|----------|-------|
| Hero (h1) | 30px | `text-3xl` | Page titles, reveals |
| Section (h2) | 24px | `text-2xl` | Section headers |
| Subsection (h3) | 20px | `text-xl` | Card headers, labels |
| Body Large | 18px | `text-lg` | Lead paragraphs |
| Body | 16px | `text-base` | Default body text |
| **Button** | **14px** | **`text-sm`** | All buttons |
| Caption | 12px | `text-xs` | Labels, meta |

### Button Sizes (PremiumButton)

```tsx
sm: "text-xs"  // 12px
md: "text-sm"  // 14px
lg: "text-base" // 16px
```

### Key Principle

**Buttons are always smaller than the header they serve.**
- h2 (24px) + button (14px) = clear hierarchy
- h3 (20px) + button (14px) = clear hierarchy

❌ **Wrong:** Button text same size as header
✅ **Correct:** Button text at least 1 step smaller

---

## Typography

### Font Stack

| Role | Font | Class |
|------|------|-------|
| Headings | Cormorant Garamond | `font-display` |
| Body | DM Sans | `font-sans` |
| Code | JetBrains Mono | `font-mono` |

### Heading Styles

```tsx
// H1 - Page title
<h1 className="text-2xl font-semibold text-[#2c3150] font-display">
  Who are you, really?
</h1>

// Subtitle
<p className="text-[var(--wabi-text-secondary)] mt-1">
  In 5 minutes, get words for your unique genius
</p>

// Section label
<p className="text-[9px] text-[#8460ea] font-medium uppercase tracking-wide">
  My Unique Offer
</p>
```

---

## Choice Button Pattern

For screens with 2-3 options (like the screenshot):

```tsx
<button
  onClick={handleChoice}
  className="w-full p-4 rounded-xl border-2 border-[var(--wabi-lavender)]/30 
             hover:border-[#8460ea] hover:shadow-md bg-white/80 backdrop-blur-sm
             transition-all text-left flex items-start gap-4 group"
>
  <div className="flex items-center gap-4">
    <div className="p-2 rounded-full bg-[var(--wabi-lavender)]/20 shrink-0
                    group-hover:bg-[#8460ea]/20 transition-colors">
      <Bot className="w-5 h-5 text-[#8460ea]" />
    </div>
    <p className="font-semibold text-[#2c3150]">Yes, my AI knows me</p>
  </div>
</button>
```

**Key properties:**
- `bg-white/80 backdrop-blur-sm` — glassmorphic
- `border-[var(--wabi-lavender)]/30` — soft border
- `hover:border-[#8460ea]` — accent on hover
- `text-[#2c3150]` — never pure black

---

## AI Step-by-Step Checklist

When working on ANY screen, verify:

### 1. Colors
- [ ] No pure black text (`#000` or `black`) — use `#2c3150`
- [ ] Body text uses `rgba(44,49,80,0.7)`
- [ ] Muted text uses `rgba(44,49,80,0.5)`
- [ ] Accent colors from design system (not arbitrary)

### 2. Typography
- [ ] Headings use `font-display` class
- [ ] Body uses `font-sans` class
- [ ] Proper hierarchy (h1 > h2 > p)

### 3. Components
- [ ] Primary actions use `PremiumButton` (not plain `Button`)
- [ ] Cards use `PremiumCard` (not `bg-white rounded-xl`)
- [ ] Icons in hero positions use `HeroIcon`
- [ ] Loading states use `PremiumLoader` or `premium-spinner`

### 4. ⚠️ CSS Variable Override Trap (Inside GameShell)

> **Critical.** Any component inside `/game/*` routes inherits dark CSS variables from the GameShell theme. Components from shadcn/ui (`Card`, `Button`, `CardContent`) use these variables and will render as dark/invisible.

- [ ] No bare `<Card>` usage — replace with `<div className="bg-white rounded-xl border border-[#a4a3d0]/20">`
- [ ] No bare `<Button>` for primary CTAs — add `className="bg-[#8460ea] hover:bg-[#7350d0] text-white"`
- [ ] No bare `<Button variant="outline">` — add `className="border-[#a4a3d0]/40 text-[#2c3150] hover:bg-[#8460ea]/5"`
- [ ] No `text-muted-foreground` — use `text-[#2c3150]/50` instead
- [ ] No `bg-card` — use explicit `bg-white`
- [ ] No `text-card-foreground` — use explicit `text-[#2c3150]`
- [ ] Disabled states use `disabled:opacity-40` (not inherited disabled styles)

**Why this happens:** `index.css` defines dark-mode CSS variables (`:root` / `.dark`). The `GameShellV2` layout applies the `.dark` class or equivalent theming. All shadcn/ui primitives reference `--primary`, `--card`, `--input` etc. which resolve to dark navy colors. Content areas render on a light pearl background but inherit dark variables from the shell.

**Where this applies:** Any component rendered inside:
- `GameShellV2` (all game spaces)
- `ProductBuilderLayout` (all builder steps)
- `MarketplaceProductPage` (published pages)
- Any page under `/game/*` routes

### 5. Interactivity
- [ ] Hover states defined (`hover:`)
- [ ] Focus states for accessibility
- [ ] Transitions smooth (`transition-all`)

### 6. Layout
- [ ] Proper spacing (not cramped)
- [ ] Max-width containers for readability
- [ ] Responsive considerations

---

## Quick Audit Command

Run this to find remaining issues:

```bash
# Find pure black text
grep -r "text-black\|#000000\|black;" --include="*.tsx" src/

# Find non-premium loaders
grep -r "Loader2" --include="*.tsx" src/

# Find plain white cards (may need premium treatment)
grep -r 'bg-white rounded' --include="*.tsx" src/

# ⚠️ Find dangerous bare Card usage in game routes (CSS variable trap)
grep -r '<Card' --include="*.tsx" src/modules/ src/pages/spaces/

# ⚠️ Find buttons missing explicit colors in product builder
grep -r '<Button' --include="*.tsx" src/modules/product-builder/

# ⚠️ Find CSS variable references that will break in dark context
grep -rn 'bg-card\|text-card-foreground\|bg-primary\b\|text-primary-foreground\|border-input' --include="*.tsx" src/modules/ src/pages/spaces/
```

---

## Premium UI Execution Workflow

> **Follow this phased approach when applying premium UI to any screen or module.**

### Phase 1: Foundation Setup
*Do once per project, skip if already done.*

- [ ] **1.1** — Verify premium tokens in `index.css` (wabi colors, glassmorphism, gradients)
- [ ] **1.2** — Verify fonts loaded in `index.html` (Cormorant Garamond, DM Sans)
- [ ] **1.3** — Confirm premium components exist:
  - `PremiumCard.tsx`
  - `PremiumButton.tsx`
  - `HeroIcon.tsx`
  - `PremiumLoader.tsx`
- [ ] **1.4** — Confirm `premium-spinner` class defined in CSS

---

### Phase 2: Audit Target Screen
*For each screen you're upgrading:*

- [ ] **2.1** — Screenshot current state
- [ ] **2.2** — Check for pure black text (`#000`, `black`, `text-black`)
- [ ] **2.3** — Check for `Loader2` imports
- [ ] **2.4** — Check for plain `bg-white rounded` cards
- [ ] **2.5** — Check for plain `Button` on primary CTAs
- [ ] **2.6** — Check headings for missing `font-display`

---

### Phase 3: Typography Updates
- [ ] **3.1** — Add `font-display` to all `<h1>`, `<h2>` headings
- [ ] **3.2** — Change black text to `text-[#2c3150]`
- [ ] **3.3** — Change gray text to `text-[var(--wabi-text-secondary)]`
- [ ] **3.4** — Change muted text to `text-[var(--wabi-text-muted)]`

---

### Phase 4: Component Upgrades

#### 4A: Buttons
- [ ] **4A.1** — Replace primary `Button` → `PremiumButton`
- [ ] **4A.2** — Add `loading` prop where applicable
- [ ] **4A.3** — Keep `Button` for secondary/outline actions only

#### 4B: Cards
- [ ] **4B.1** — Replace `bg-white rounded-xl` → `PremiumCard`
- [ ] **4B.2** — Choose variant: `glass`, `glass-strong`, or `solid`
- [ ] **4B.3** — For choice cards, use the Choice Button Pattern (glassmorphic)

#### 4C: Loading States
- [ ] **4C.1** — Replace `Loader2` with `PremiumLoader` (component-level)
- [ ] **4C.2** — Replace inline `Loader2` with `<span className="premium-spinner" />`
- [ ] **4C.3** — Use `FullPageLoader` for full-page loading

#### 4D: Icons
- [ ] **4D.1** — Hero/header icons → `HeroIcon` with `variant="gradient"`
- [ ] **4D.2** — Standard icons → keep Lucide with proper colors

---

### Phase 5: Interactivity Polish
- [ ] **5.1** — Add `hover:` states to interactive elements
- [ ] **5.2** — Add `transition-all` or `transition-colors`
- [ ] **5.3** — Add `group` class for parent containers, `group-hover:` for children
- [ ] **5.4** — Add hover shadows where appropriate: `hover:shadow-lg hover:shadow-[color]/10`

---

### Phase 6: Verification
- [ ] **6.1** — Run `npm run build` — must pass
- [ ] **6.2** — Visual check in browser
- [ ] **6.3** — Test hover states
- [ ] **6.4** — Test loading states
- [ ] **6.5** — Compare against brandbook aesthetic

---

### Phase 7: Cleanup
- [ ] **7.1** — Remove unused imports (e.g., `Loader2` if replaced)
- [ ] **7.2** — Run final build verification
- [ ] **7.3** — Mark screen as complete in task tracking

---

## Quick Reference: Common Replacements

| Before | After |
|--------|-------|
| `text-black` | `text-[#2c3150]` |
| `text-gray-500` | `text-[var(--wabi-text-muted)]` |
| `text-slate-600` | `text-[var(--wabi-text-secondary)]` |
| `bg-white rounded-xl` | `<PremiumCard>` |
| `<Button>` (primary CTA) | `<PremiumButton>` |
| `<Loader2 />` | `<PremiumLoader />` or `<span className="premium-spinner" />` |
| `font-bold` (heading) | `font-semibold font-display` |
| **⚠️ `<Card>`** (in GameShell) | **`<div className="bg-white rounded-xl border border-[#a4a3d0]/20">`** |
| **⚠️ `<Button>`** (in GameShell) | **Add `className="bg-[#8460ea] hover:bg-[#7350d0] text-white"`** |
| **⚠️ `<Button variant="outline">`** (in GameShell) | **Add `className="border-[#a4a3d0]/40 text-[#2c3150]"`** |
| **⚠️ `bg-card`** | **`bg-white`** |
| **⚠️ `text-muted-foreground`** | **`text-[#2c3150]/50`** |

---

## Related Documents

- [product_playbook.md](./product_playbook.md) — Source methodology
- [design_framework.md](./design_framework.md) — Taxonomy and principles
- [brandbook.md](../05-reference/brandbook.md) — Visual identity (includes CSS Variable Override Trap)
- [glassmorphism_blueprint.md](./glassmorphism_blueprint.md) — Portable liquid glass instruction for external AI agents

---

# Part IV: Accessibility Standards (WCAG 2.2 AA)

> *Informed by Apple Accessibility Specialist audit methodology. March 26, 2026.*
>
> **Rule:** Accessibility is not a feature — it's a floor. Every screen must pass before shipping.

## Perceivable

| Check | Standard | How to verify |
|-------|----------|---------------|
| **Color contrast** | Text ≥ 4.5:1 ratio (AA), large text ≥ 3:1 | Use Chrome DevTools contrast checker or axe extension |
| **Non-text contrast** | UI components & borders ≥ 3:1 against adjacent colors | Check PremiumButton, PremiumCard borders |
| **Color not sole indicator** | Never use color alone to convey info | Error states need icons + text, not just red |
| **Text resize** | Readable at 200% zoom | Test every page at `ctrl +` × 4 |
| **Alt text** | All images have descriptive alt (or `alt=""` for decorative) | `grep -r '<img' --include="*.tsx" src/ | grep -v 'alt='` |
| **Captions** | Video/audio content has captions | All NotebookLM videos, YouTube embeds |

## Operable

| Check | Standard | How to verify |
|-------|----------|---------------|
| **Keyboard navigation** | All interactive elements reachable via Tab | Tab through every flow start-to-finish |
| **Focus visible** | Focus ring visible on all interactive elements | Check for `focus:ring` or `focus-visible:outline` |
| **Focus order** | Tab order matches visual order | No `tabindex` values > 0 |
| **Skip to content** | Skip link on pages with nav | First focusable element should be skip link |
| **No keyboard traps** | Can always Tab out of any component | Test modals, dropdowns, accordions |
| **Touch targets** | Minimum 44×44px on mobile | All buttons, links, interactive elements |
| **Motion control** | Respect `prefers-reduced-motion` | All breathing/aurora animations must check this |

### Motion Safety Rule

```css
@media (prefers-reduced-motion: reduce) {
  .breathing-card,
  .alive-card,
  .aurora-gradient,
  .aurora-text,
  .glowing-card {
    animation: none !important;
  }
}
```

## Understandable

| Check | Standard |
|-------|----------|
| **Language declared** | `<html lang="en">` set |
| **Error identification** | Form errors identified with specific text, not just color |
| **Labels** | All form inputs have associated `<label>` or `aria-label` |
| **Consistent navigation** | Same nav pattern on every page |
| **Help text** | Complex inputs have help text or placeholder guidance |

## Robust

| Check | Standard |
|-------|----------|
| **Valid HTML** | No duplicate IDs, proper nesting |
| **ARIA when needed** | Use semantic HTML first, ARIA only when semantics can't express it |
| **Name, Role, Value** | All custom components expose correct role and state |

## Mobile-Specific

| Check | Standard |
|-------|----------|
| **Orientation** | Works in both portrait and landscape |
| **Input method** | Works with touch, keyboard, and assistive tech |
| **Reachable zones** | Critical CTAs in thumb-friendly zones (bottom 40% of screen) |

## Pre-Ship Audit Command

```bash
# Install axe for automated checks
npx @axe-core/cli http://localhost:5173

# Manual checks
# 1. Tab through entire flow — can you reach everything?
# 2. Use VoiceOver (Mac: Cmd+F5) — does it make sense?
# 3. Zoom to 200% — does layout hold?
# 4. Check prefers-reduced-motion — do animations stop?
```

---

# Part V: Component States & Anatomy

> *Every component must define all visual states — not just the default.*

## Required States per Component

| State | Description | Required for |
|-------|-------------|-------------|
| **Default** | Resting state | All components |
| **Hover** | Mouse over (desktop) | Buttons, cards, links |
| **Focus** | Keyboard focus ring | All interactive elements |
| **Active/Pressed** | Being clicked/tapped | Buttons, cards |
| **Disabled** | Not available | Buttons, inputs |
| **Loading** | Async operation in progress | Buttons, cards, pages |
| **Error** | Validation or system error | Inputs, forms, pages |
| **Empty** | No data available | Lists, grids, dashboards |
| **Skeleton** | Content loading placeholder | Cards, text blocks |

## Component Anatomy Template

When documenting a new component:

```
COMPONENT: [Name]
├── Anatomy: [visual parts — icon, label, container, border]
├── Variants: [glass, solid, outline, etc.]
├── Sizes: [sm, md, lg]
├── States: [default, hover, focus, active, disabled, loading, error]
├── Spacing: [internal padding, margins between elements]
├── Accessibility: [role, aria-label, keyboard behavior]
├── Do's: [correct usage examples]
└── Don'ts: [anti-patterns to avoid]
```

## Do's and Don'ts (Universal)

| ✅ Do | ❌ Don't |
|-------|---------|
| Use `PremiumButton` for primary CTAs | Use plain `<button>` or shadcn `Button` without overrides |
| Use semantic HTML (`<nav>`, `<main>`, `<section>`) | Use only `<div>` for everything |
| Show empty states with illustration + action | Show a blank page or "No data" |
| Show loading skeletons shaped like content | Show a spinner in an empty page |
| Use `transition-all duration-200` on interactive elements | Use instant state changes with no transition |
| Apply `cursor-pointer` to all clickable elements | Leave default cursor on interactive elements |
| Use `focus-visible:` for keyboard-only focus styles | Show focus ring on every click |

---

# Part VI: Design Tokens (JSON Format)

> *Machine-readable design tokens for consistency across AI agents, design tools, and code.*

```json
{
  "color": {
    "primary": { "value": "#8460ea", "description": "Electric Violet — CTAs, highlights, energy" },
    "primary-hover": { "value": "#7350d8", "description": "Darkened primary for hover states" },
    "text": {
      "primary": { "value": "#2c3150", "description": "Charcoal Indigo — headings, important text" },
      "secondary": { "value": "rgba(44,49,80,0.7)", "description": "Body text, descriptions" },
      "muted": { "value": "rgba(44,49,80,0.5)", "description": "Hints, subtle labels" },
      "on-dark": { "value": "#ffffff", "description": "Text on dark backgrounds" }
    },
    "accent": {
      "lavender": { "value": "#a4a3d0", "description": "Soft accent, icons, borders" },
      "aqua": { "value": "#a7cbd4", "description": "Secondary options, clarity" },
      "royal": { "value": "#29549f", "description": "Trust, depth, authority" }
    },
    "semantic": {
      "success": { "value": "#22c55e", "description": "Positive outcomes, completed states" },
      "warning": { "value": "#f59e0b", "description": "Caution, requires attention" },
      "error": { "value": "#ef4444", "description": "Errors, destructive actions" },
      "info": { "value": "#6894d0", "description": "Informational, neutral" }
    },
    "surface": {
      "page": { "value": "#faf9f7", "description": "Light mode page background" },
      "card": { "value": "rgba(255,255,255,0.85)", "description": "Glass card background" },
      "card-strong": { "value": "rgba(255,255,255,0.95)", "description": "Strong glass card" },
      "dark-page": { "value": "#0f1019", "description": "Dark mode page background" },
      "dark-card": { "value": "#1a1d2e", "description": "Dark mode card background" }
    }
  },
  "typography": {
    "font-display": { "value": "'Cormorant Garamond', serif", "description": "Headings, hero text" },
    "font-sans": { "value": "'DM Sans', sans-serif", "description": "Body, UI elements" },
    "font-mono": { "value": "'JetBrains Mono', monospace", "description": "Code, prompts" },
    "scale": {
      "hero": { "size": "30px", "line-height": "1.2", "weight": "600", "class": "text-3xl" },
      "h1": { "size": "24px", "line-height": "1.3", "weight": "600", "class": "text-2xl" },
      "h2": { "size": "20px", "line-height": "1.4", "weight": "600", "class": "text-xl" },
      "h3": { "size": "18px", "line-height": "1.5", "weight": "500", "class": "text-lg" },
      "body": { "size": "16px", "line-height": "1.6", "weight": "400", "class": "text-base" },
      "body-sm": { "size": "14px", "line-height": "1.5", "weight": "400", "class": "text-sm" },
      "caption": { "size": "12px", "line-height": "1.4", "weight": "400", "class": "text-xs" },
      "label": { "size": "10px", "line-height": "1.3", "weight": "500", "class": "text-[10px]" },
      "micro": { "size": "9px", "line-height": "1.2", "weight": "500", "class": "text-[9px]" }
    }
  },
  "spacing": {
    "unit": "8px",
    "scale": {
      "0": "0px", "1": "4px", "2": "8px", "3": "12px", "4": "16px",
      "5": "20px", "6": "24px", "8": "32px", "10": "40px", "12": "48px",
      "16": "64px", "20": "80px", "24": "96px"
    }
  },
  "radius": {
    "sm": "6px", "md": "8px", "lg": "12px", "xl": "16px", "2xl": "20px", "full": "9999px"
  },
  "shadow": {
    "sm": "0 1px 2px rgba(44,49,80,0.05)",
    "md": "0 4px 6px rgba(44,49,80,0.07)",
    "lg": "0 10px 15px rgba(44,49,80,0.1)",
    "xl": "0 20px 25px rgba(44,49,80,0.1)",
    "glow": "0 0 20px rgba(132,96,234,0.2)"
  },
  "animation": {
    "duration": {
      "instant": "100ms", "fast": "150ms", "normal": "200ms",
      "slow": "300ms", "gentle": "400ms"
    },
    "easing": {
      "default": "cubic-bezier(0.4, 0, 0.2, 1)",
      "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)"
    },
    "breathing": { "duration": "6s", "easing": "ease-in-out" },
    "aurora": { "duration": "15s", "easing": "ease-in-out" }
  }
}
```

---

# Part VII: Design Critique Framework

> *Adapted from Nielsen's 10 usability heuristics for the Evolver context (March 26, 2026).*

## The 10 Heuristics (Applied)

| # | Heuristic | Evolver application | Score 1–5 |
|---|-----------|---------------------|-----------|
| 1 | **System status visibility** | Does the user always know where they are in the journey? Progress bars, breadcrumbs, space indicators | |
| 2 | **Match real world** | Does copy use the user's language, not internal terms? "Uniqueness" vs "Zone of Genius extraction" | |
| 3 | **User control & freedom** | Can user go back, undo, skip? No dead ends? | |
| 4 | **Consistency & standards** | Same patterns everywhere? PremiumButton consistent across all modules? | |
| 5 | **Error prevention** | Are destructive actions confirmed? Form inputs validated before submit? | |
| 6 | **Recognition over recall** | Can user recognizes options rather than remembering? Labels visible, not hidden? | |
| 7 | **Flexibility & efficiency** | Power users have shortcuts? Common tasks are fast? | |
| 8 | **Aesthetic & minimalist** | Every element carries signal? No noise? (The "Not-Decoration" Rule) | |
| 9 | **Help users with errors** | Errors are specific, constructive, and suggest a fix? | |
| 10 | **Help & documentation** | FAQ visible? Tooltips on complex elements? Clarity call accessible? | |

## Critique Workflow

```
1. Walk through key flow — screenshot every screen
2. Score each heuristic 1–5
3. Identify issues: Critical (blocks user) → Important (degrades experience) → Polish (nice-to-have)
4. Propose fixes with specific file:line references
5. Implement top-priority fixes first
6. Re-score after fix
```

## Quick Critique Checklist

Before shipping any screen to production:

- [ ] **Visual hierarchy clear?** — Can you identify the #1 most important element in < 1 second?
- [ ] **Typography consistent?** — All headings `font-display`, body `font-sans`?
- [ ] **Color carries meaning?** — Is Electric Violet only used for primary actions?
- [ ] **Empty states designed?** — What does this page look like with zero data?
- [ ] **Error states designed?** — What happens when the API fails?
- [ ] **Loading states designed?** — What does the user see during async operations?
- [ ] **Cognitive load minimal?** — Could you remove any element and the page still works?
- [ ] **Accessible?** — Passes keyboard nav, contrast, and focus checks?
- [ ] **Differentiated?** — Does this feel like Evolver, not like a generic SaaS?

---

*UX before UI. Test as you go. Invisible interface is the goal.*
*Updated: April 1, 2026 — Added Liquid Glass Morphism (dark-surface) documentation, linked glassmorphism portable blueprint*

---

# Part VIII: Legibility — When Brand Meets Readability

> *Captured Day 62 (May 5, 2026) after recurring "hard to read" feedback (Karime + multiple visitors) on landing hero copy. The fix preserves the editorial italic-Cormorant identity AND meets WCAG 2.2 AA across variable-luminance backgrounds.*

## The principle

**Brand voice and legibility are not opposed.** The cause of "hard to read" is almost never "we used italic Cormorant" — it's that we used italic Cormorant *without compensating for the conditions that make any italic serif harder to read at body sizes on busy backgrounds.* Compensate, and the brand stays.

**Conditions that fight legibility:**

| Condition | Why it fights reading |
|---|---|
| Italic serif at body size (16–20px) | Stroke contrast is high; thin parts can drop to <0.5 device px on retina, blurring during anti-aliasing. |
| Variable-luminance background (gold particles, sun glare, photo overlays) | Contrast ratio shifts across the same paragraph — passes WCAG on dark cream pixels, fails on bright sun-glare pixels. |
| Muted-alpha colors (rgba navy at 0.6–0.85) | Editorial "ethereal" feel costs ~2:1 of contrast budget. Acceptable on uniform bg, hostile on variable bg. |
| Default font weight (400–500) | Anti-aliasing on retina + non-retina renders thicker strokes more reliably than thin ones. |
| White-only halo text-shadow | Lifts text off light bg but adds nothing on bright bg patches where text is already lighter than its surround. |

## The five legibility levers

Apply these on text that fights with its background. Don't apply blindly to every piece of text — apply *where the conditions above hold.*

| Lever | Implementation | Trade-off |
|---|---|---|
| **1. Bump weight 500→600** (or 600→700 for headlines) | `font-weight: 600` (or Tailwind `font-semibold` / `font-bold`) | Aesthetic shift toward "more print-quality." Reads as more editorial, not less. |
| **2. Lift muted-alpha colors** | Use `var(--skin-text-primary)` (full color) instead of `var(--skin-text-muted)` (0.86 alpha) on body text over busy bg | Slight loss of "ethereal" feel. |
| **3. Deep halo (white lift + navy stroke)** | Use `var(--skin-text-halo-deep)` instead of `--skin-text-halo-strong`. White halo lifts off cream; navy under-stroke deepens text on bright spots. | None — stroke is invisible on uniform bg, only kicks in on bright pixels. |
| **4. Letter-spacing +0.005em on italic body** | `letter-spacing: 0.005em` on italic Cormorant at body sizes (16–24px) | None — italic letterforms separate cleanly. |
| **5. Backdrop scrim** *(escalation only)* | Subtle white-to-transparent gradient behind text block when 1–4 don't suffice | Creates "text in a container" feel. Aesthetic compromise. **Use only when the bg is so variable that 1–4 leave failures.** |

## The halo-deep token

Defined in `src/index.css`:

```css
--skin-text-halo-deep:
    0 0 22px rgba(255,255,255,0.7),       /* outer white halo (lift) */
    0 1px 2px rgba(255,255,255,0.9),      /* inner white halo (lift) */
    0 0 1px rgba(11,42,90,0.45),          /* navy stroke (deepen) */
    0 1px 0 rgba(11,42,90,0.25);          /* navy under-shadow (deepen) */
```

The two-direction shadow (lift + deepen) means the same token works against both light bg patches (white halo lifts) and bright sun-glare patches (navy stroke deepens). One token, all backgrounds.

## When to use which halo

| Surface | Halo |
|---|---|
| Pure cream / pearl background, uniform | `--skin-text-halo-soft` or `--skin-text-halo-subtle` |
| Cream-with-mild-image background | `--skin-text-halo-strong` |
| Variable-luminance bg (gold particles, photos, sun glare, video overlays) | **`--skin-text-halo-deep`** |
| Dark surface (Navy+Gold skin) | dark-skin variants of the same tokens (already defined under `.skin-navy-gold`) |

## The legibility cocktail (canonical pattern)

For italic Cormorant body text on variable-luminance background, apply all four:

```tsx
<p
  style={{
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,                              // ← lever 1
    letterSpacing: "0.005em",                     // ← lever 4
    color: "var(--skin-text-primary, #0a1628)",   // ← lever 2 (was --skin-text-muted)
    textShadow: "var(--skin-text-halo-deep)",     // ← lever 3
  }}
  className="text-lg sm:text-xl italic"
>
  …copy…
</p>
```

Headlines: same pattern but bump weight to 700 (`font-bold` in Tailwind) and use `text-3xl` or larger.

## Anti-patterns

| ❌ Don't | ✅ Do |
|---|---|
| Italic Cormorant at weight 400 over a busy bg | Italic Cormorant at weight 600+ with deep halo |
| `text-muted-foreground` on landing/reveal copy | `var(--skin-text-primary)` directly — preserve the brand color, just at full alpha |
| White-only `text-shadow` over photo backgrounds | `--skin-text-halo-deep` (two-direction lift + deepen) |
| Italic Cormorant for paragraph-length body copy on photo bg | Reserve italic for one-line emphasis. Use upright Cormorant or DM Sans for paragraphs. |
| Adding a backdrop scrim to every text block | Only use scrim when levers 1–4 don't suffice. Most cases don't need it. |

## Pre-ship legibility checklist

For every text element on a variable-luminance background:

- [ ] Weight is 600+ (italic body) or 700+ (headline)
- [ ] Color is `--skin-text-primary` (not muted) when contrast matters
- [ ] `text-shadow: var(--skin-text-halo-deep)` (not the lighter halos)
- [ ] Italic body text has `letter-spacing: 0.005em`
- [ ] Tested at 200% zoom — does the page hold?
- [ ] Checked DevTools contrast on at least 3 background luminance points (uniform dark, mid, bright sun-glare)
- [ ] Read the page on mobile in direct sunlight — does it still hold?

## Related

- WCAG 2.2 AA contrast standards — Part IV above
- Anti-AI-slop typography (avoiding "consumer SaaS" feel while staying readable) — `.agent/skills/frontend-design/SKILL.md`

---

# Agent Skills Reference (Optional Enhancements)

> **Note:** The playbook above is the ground truth. These skills are supplementary resources for AI agents — use them for inspiration, not as dogma.

| Skill | Path | When to use |
|-------|------|-------------|
| **frontend-design** | `.agent/skills/frontend-design/SKILL.md` | Before coding a new page — contains anti-"AI slop" aesthetics guidelines and bold design thinking prompts |
| **canvas-design** | `.agent/skills/canvas-design/SKILL.md` | When creating static visual art (posters, PDFs, design philosophy documents) |

*Source: [anthropics/skills](https://github.com/anthropics/skills) · Adapted for Evolver's Bio-Light aesthetic*

