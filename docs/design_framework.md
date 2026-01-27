# Design Framework — Fast Design for Planetary OS

> How to make & develop design for the OS fast?

*Last updated: 2026-01-27*

---

## The Core Insight

**Design is a product.**

Like any product, design has:
- **Input** → Current state (screenshots, user feedback)
- **Process** → Framework application
- **Output** → Improved design
- **Transformation** → From chaos to harmony

Therefore: Product Playbook applies to design itself.

---

## Workflow: Screenshot → AI → Improvement

```
1. Walk through a flow manually
2. Screenshot each step
3. Send screenshots to AI  
4. AI applies this framework
5. Get structured improvement recommendations
6. Implement changes
7. Repeat
```

This bypasses slow browser automation while maintaining systematic approach.

---

# Part I: Philosophy — Through Three Lenses

## UX vs UI: Should We Separate?

**Answer: Separate but integrated.**

| Aspect | UX (User Experience) | UI (User Interface) |
|--------|---------------------|---------------------|
| **Focus** | Journey, flow, logic | Appearance, aesthetics |
| **Question** | "Does this make sense?" | "Does this look/feel right?" |
| **Holonic level** | Structure (skeleton) | Surface (skin) |
| **Analogy** | Architecture of a building | Interior design |
| **When to work on** | First (structure before surface) | Second (skin on skeleton) |

**Integration point:** UI expresses UX. Bad UX cannot be saved by good UI. Good UX can survive mediocre UI.

---

## UX Through Three Lenses

### 🫀 ESSENCE (Heart) — What UX IS

**UX is the felt sense of using a product.**

It's the experience of moving through a system. Not what you see, but what you feel while navigating.

Core question: *"How does this feel to use?"*

### 🧠 SIGNIFICANCE (Mind) — What UX Means

**UX means reduced cognitive load.**

Good UX = user doesn't think about the interface. They think about their goal.

Key principle: *"The best interface is invisible."*

Metrics:
- Time to complete task
- Number of clicks/steps
- Error rate
- "I knew what to do next" feeling

### 🔥 IMPLICATIONS (Gut) — What UX Creates

**Good UX creates flow state.**

User enters the zone. Actions feel effortless. Time disappears.

Bad UX creates:
- Frustration
- Confusion  
- Abandonment
- Distrust

---

## UI Through Three Lenses

### 🫀 ESSENCE (Heart) — What UI IS

**UI is visual/sensory communication.**

Every pixel communicates. Colors, shapes, spacing, typography — all speak to the user.

Core question: *"What does this communicate visually?"*

### 🧠 SIGNIFICANCE (Mind) — What UI Means

**UI means visual hierarchy and harmony.**

UI tells the user:
- What to look at first
- What's clickable
- What's related
- What's important

Key principle: *"Design is a system of relationships."*

### 🔥 IMPLICATIONS (Gut) — What UI Creates

**Good UI creates trust and delight.**

User feels:
- "This is professional"
- "This is beautiful"  
- "I want to use this"
- "I trust this"

Bad UI creates:
- Doubt
- Cheap feeling
- Distrust
- Desire to leave

---

# Part II: Standardization — Design Tokens

## What Standardization Means

Standardization = **consistent design decisions** so every element looks like it belongs to the same family.

### Token Categories

| Category | What It Defines | Examples |
|----------|-----------------|----------|
| **Colors** | Palette, semantic colors | Primary, secondary, success, error |
| **Typography** | Font families, sizes, weights | H1, H2, body, caption |
| **Spacing** | Margins, padding, gaps | 4px, 8px, 16px, 24px, 32px |
| **Borders** | Radii, widths, styles | radius-sm, radius-md, radius-lg |
| **Shadows** | Elevation levels | shadow-sm, shadow-md, shadow-lg |
| **Animations** | Transitions, durations | ease-in, ease-out, 150ms, 300ms |

### Button Example (Standardized)

```
BUTTON TOKEN:

Size variants:
- sm: h-8, px-3, text-sm
- md: h-10, px-4, text-base
- lg: h-12, px-6, text-lg

Color variants:
- primary: brand gradient
- secondary: outline
- ghost: transparent bg
- danger: red tones

States:
- default → hover → active → disabled
- focus ring for accessibility

Radius: consistent with system (rounded-lg)
```

---

# Part III: Taxonomy — Nested Element Hierarchy

## Level 1: Page Types

| Page Type | Purpose | Example |
|-----------|---------|---------|
| **Landing** | Attract, convert | Module landing pages |
| **Dashboard** | Overview, navigate | Game home, profile |
| **Form** | Collect input | Onboarding steps, assessments |
| **List** | Browse items | Library, events, matches |
| **Detail** | Deep dive single item | Quest detail, person profile |
| **Result** | Show outcome | ZoG result, QoL result |
| **Empty State** | No content yet | First-time views |
| **Error** | Something went wrong | 404, permission denied |

---

## Level 2: Section Types (within pages)

| Section Type | Purpose |
|--------------|---------|
| **Hero** | Main message, CTA |
| **Header** | Navigation, branding |
| **Card Grid** | Multiple related items |
| **Form Section** | Input collection |
| **Results Display** | Outcome presentation |
| **Stats/Metrics** | Numbers, progress |
| **Navigation** | Move between areas |
| **Footer** | Secondary links, info |

---

## Level 3: Component Types (within sections)

| Component Type | Example Components |
|----------------|-------------------|
| **Input** | Text field, textarea, select, checkbox, radio, slider |
| **Button** | Primary, secondary, ghost, icon button, link button |
| **Card** | Content card, stat card, person card, action card |
| **Navigation** | Tab, sidebar item, breadcrumb, menu |
| **Feedback** | Toast, alert, modal, tooltip, badge |
| **Display** | Avatar, icon, progress bar, chart, image |
| **Layout** | Container, grid, flex, spacer, divider |
| **Typography** | Heading, paragraph, list, label, caption |

---

## Level 4: Atomic Elements (within components)

| Element | Description |
|---------|-------------|
| **Text** | Raw text content |
| **Icon** | Symbolic representation |
| **Color** | Fill or stroke |
| **Shape** | Rectangle, circle, line |
| **Space** | Margin, padding, gap |
| **Border** | Edge styling |
| **Shadow** | Depth indication |

---

# Part IV: Harmony — Visual Relationships

## What Harmony Means

**Harmony = elements feel like they belong together.**

It's achieved through:

### 1. Consistent Spacing (Rhythm)

Use a spacing scale. Everything is a multiple of base unit.

```
Base: 4px

Scale:
- 4px (xs)
- 8px (sm)
- 16px (md)
- 24px (lg)
- 32px (xl)
- 48px (2xl)
- 64px (3xl)
```

### 2. Consistent Sizing (Proportion)

Elements relate to each other proportionally.

```
Typography scale:
- 12px (caption)
- 14px (small)
- 16px (body)
- 18px (lead)
- 24px (h3)
- 32px (h2)
- 48px (h1)
```

### 3. Visual Weight Balance

Heavy elements balanced by light elements.
Busy areas balanced by whitespace.

### 4. Color Harmony

Following brandbook palette.
Consistent use of semantic colors.
60-30-10 rule (dominant-secondary-accent).

### 5. Alignment Grid

8px or 4px grid for alignment.
All elements snap to grid.

### 6. Quantity Control

Maximum elements per screen.
Cognitive load management.

---

# Part V: Minimalism — Less is More

## What Minimalism Means

**Minimalism = only what serves the result.**

Three Lenses on Minimalism:

### 🫀 ESSENCE — What Minimalism IS

Minimalism is the removal of everything that doesn't serve the core purpose.

Every element must justify its existence by serving the user's goal.

### 🧠 SIGNIFICANCE — What Minimalism Means

It means:
- Faster loading
- Lower cognitive load
- Clearer hierarchy
- Higher usability
- Less maintenance

### 🔥 IMPLICATIONS — What Minimalism Creates

Creates:
- Focus on what matters
- Calm user experience
- Trust (fewer distractions)
- Speed (to result)

### Minimalism Checklist

For every element, ask:
- [ ] Does this serve the user's goal?
- [ ] Can the page exist without this?
- [ ] Is this the simplest way to achieve this?
- [ ] Am I adding or removing cognitive load?

**Rule:** If unsure, remove it. Add back only if users ask.

---

# Part VI: Execution Workflow

## Step-by-Step: From Screenshots to Improvements

### Phase 1: Capture
1. Walk through flow manually
2. Screenshot each screen
3. Note any friction points felt

### Phase 2: Analyze
Send to AI with this prompt:

```
Using the Design Framework, analyze these screenshots.

For each screen, evaluate:

UX:
- Flow clarity (is next step obvious?)
- Cognitive load (too much? too little?)
- Step count (can we reduce?)

UI:
- Harmony (do elements belong together?)
- Hierarchy (clear what's important?)
- Minimalism (anything to remove?)
- Brandbook alignment (colors, typography)

TAXONOMY CHECK:
- Page type: [landing/dashboard/form/list/detail/result]
- Missing components?
- Unnecessary components?

OUTPUT:
1. Issues found (prioritized)
2. Specific fixes
3. Mockup suggestions if needed
```

### Phase 3: Implement
Apply fixes, one at a time.

### Phase 4: Verify
Screenshot again. Compare. Repeat if needed.

---

## Quick Reference: Design Quality Check

| Dimension | Question | ✅ Good | ❌ Bad |
|-----------|----------|---------|--------|
| **UX** | Is next step obvious? | User knows what to do | User is lost |
| **UI** | Does it feel professional? | Trust, delight | Doubt, cheap |
| **Harmony** | Do elements belong? | Unified family | Visual chaos |
| **Minimalism** | Is there unnecessary stuff? | Only essentials | Clutter |
| **Brandbook** | Matches Evolver identity? | On-brand | Off-brand |

---

## Related Documents

- [brandbook.md](./brandbook.md) — Visual identity, colors, typography
- [design_system.md](./design_system.md) — Design tokens
- [product_playbook.md](./product_playbook.md) — Product design first principles

---

*This framework enables rapid design iteration.*
*When in doubt: simplify, align, harmonize.*
