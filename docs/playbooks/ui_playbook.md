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
│   │   │   ├── Zone of Genius
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
│   │       ├── Genius Business
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

> **CRITICAL:** These five pillars must be established BEFORE writing any CSS/components.

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

### Glassmorphism

```css
--glass-bg: rgba(255, 255, 255, 0.85);
--glass-bg-strong: rgba(255, 255, 255, 0.95);
--glass-border: rgba(255, 255, 255, 0.3);
```

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

### 4. Interactivity
- [ ] Hover states defined (`hover:`)
- [ ] Focus states for accessibility
- [ ] Transitions smooth (`transition-all`)

### 5. Layout
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
```

---

## Related Documents

- [product_playbook.md](./product_playbook.md) — Source methodology
- [design_framework.md](./design_framework.md) — Taxonomy and principles
- [brandbook.md](./brandbook.md) — Visual identity

---

*UX before UI. Test as you go. Invisible interface is the goal.*
