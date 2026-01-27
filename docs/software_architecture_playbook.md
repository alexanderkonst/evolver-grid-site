# Software Architecture Playbook

## First Principles of Software Architecture

*"The ultimate goal of every architecture is to become invisible."*

> **Meta-note:** This Playbook is itself a product — the **One-Button Architecture Builder**.
> When you have screens designed, this playbook turns them into working software architecture.

---

## The Meta-Stack

```
L1: Transformational Promise (A → B)
        ↓
L2: Product Playbook → Results, Screens, Elements
        ↓
L3: Architecture Playbook → Modules, Routes, Data, State (YOU ARE HERE)
        ↓
L4: UI Playbook → Components, Tokens, Patterns
        ↓
L5: Code → Implementation
```

---

# Part I: Philosophy — First Principles

## The Chain of Definitions

| Term | Definition |
|------|------------|
| **Screen** | A single view the user sees |
| **Module** | A self-contained unit that delivers one result |
| **Route** | The URL path that loads a screen or module |
| **Shell** | The persistent layout wrapper (nav, panels) |
| **State** | Data that persists across screens |
| **Schema** | The structure of stored data |

**Simplification:**
```
Architecture = How screens become working software
Architecture = Modules + Routes + Data + Shell + State
```

---

## The Anatomy of a Module

Every module is a **mini-product** with:

| Dimension | Description |
|-----------|-------------|
| **Entry Point** | How user enters (route, button, redirect) |
| **Screens** | Internal flow of screens |
| **Data In** | What data the module needs |
| **Data Out** | What data the module produces |
| **Exit Point** | Where user goes after (return URL, next route) |
| **Boundary** | What's inside vs outside this module |

---

## The Master Parameter — Simplicity

**Simplicity** = How easy it is to understand and modify the architecture.

| More | → Less Simplicity |
|------|-------------------|
| Routes | → Harder to understand |
| Nested layouts | → Harder to debug |
| Shared state | → More bugs |
| Cross-module dependencies | → Harder to change |

| Fewer | → Higher Simplicity |
|-------|---------------------|
| Routes | → Easier to understand |
| Clear boundaries | → Easier to maintain |
| Isolated state | → Fewer bugs |

---

# Part II: The Three Pillars of Software Architecture

> **CRITICAL:** These three pillars must be established BEFORE writing any code.

## The Three Pillars (Through Three Lenses)

| Pillar | Суть (Essence) | Значимость (Significance) | Следствие (Consequence) |
|--------|---------------|--------------------------|------------------------|
| **1. Module Boundaries** | Where each module starts and ends | Without boundaries = dependency chaos | Clean interfaces, easy to change |
| **2. Route + Data Contract** | How URL, screens, and data connect | Without this = broken links, lost state | User always lands where they should |
| **3. Shell + State Logic** | When to show what, where to store what | Without this = UX breaks on refresh/back | Seamless experience |

---

## Master Result

> **From** "screens exist in Product Playbook"
> **To** "screens work together as coherent, navigable software"

**Point A (Before Architecture):**
- Screens designed
- No routes defined
- No data flow
- No persistence
- Refresh = lost state

**Point B (After Architecture):**
- All screens reachable via routes
- Data flows correctly between modules
- State persists appropriately
- User can resume from any point
- Deep links work

---

## Pillar 1: Module Boundaries (Deep Dive)

### Суть (Essence)
A **module** is a self-contained unit that delivers ONE result. It has clear entry/exit points and explicit data dependencies.

### Значимость (Significance)
Without explicit boundaries:
- Code becomes spaghetti
- Changes break unrelated features
- Testing is impossible
- AI cannot reason about the codebase

### Следствие (Consequence)
With clean boundaries:
- Each module can be developed independently
- Modules can be replaced without breaking others
- AI can modify one module without understanding all
- Team can parallelize work

---

## Pillar 2: Route + Data Contract (Deep Dive)

### Суть (Essence)
**Route** = URL path that loads a screen
**Data Contract** = What data must exist for that screen to work

### Значимость (Significance)
Without explicit contracts:
- "Page not found" errors
- Blank screens (missing data)
- Broken back button
- Deep links fail

### Следствие (Consequence)
With clear contracts:
- Any URL is shareable and works
- Data is always available when needed
- Navigation is predictable
- SEO and analytics work correctly

---

## Pillar 3: Shell + State Logic (Deep Dive)

### Суть (Essence)
**Shell** = Persistent UI wrapper (nav, panels)
**State Logic** = What persists, where, and how to resume

### Значимость (Significance)
Without explicit logic:
- User refreshes → lost progress
- Back button → unexpected behavior
- Multi-tab → conflicting state
- User leaves and returns → starts from scratch

### Следствие (Consequence)
With clear logic:
- Seamless experience across sessions
- User can resume from any point
- Focus modes (no shell) work correctly
- Multi-device sync possible

---

# Part III: Execution Workflow

*Follow this sequence. Don't skip.*

```
PHASE 1: MODULE BOUNDARIES
1. List all modules (from Product Playbook screens)
2. Define entry/exit points for each
3. Mark data in/out for each

PHASE 2: ROUTING
4. Map routes to modules
5. Define route hierarchy (nested vs flat)
6. Identify redirects and guards

PHASE 3: DATA SCHEMA
7. Define auth/identity schema first
8. Map module data to tables
9. Define relationships

PHASE 4: SHELL & LAYOUT
10. Define when shell is shown
11. Map routes to shell states
12. Handle focus modes (no shell)

PHASE 5: STATE MANAGEMENT
13. Define what persists across screens
14. Where state lives (URL, localStorage, DB)
15. Resume logic (how to continue interrupted flow)

PHASE 6: ROAST & VERIFY
16. Check all transitions work
17. Verify data flows correctly
18. Test edge cases (refresh, back, deep link)
```

---

## Phase 1: Module Boundaries

### Step 1: List All Modules

From your Product Playbook screens, identify atomic modules:

| Module | Master Result | Screens Count |
|--------|---------------|---------------|
| [Module name] | [What it delivers] | [#] |

### Step 2: Entry/Exit Points

For each module:

| Module | Entry Points | Exit Points |
|--------|--------------|-------------|
| [Name] | [Routes, buttons] | [Where it goes after] |

### Step 3: Data In/Out

| Module | Data In (requires) | Data Out (produces) |
|--------|-------------------|---------------------|
| [Name] | [What it needs] | [What it creates] |

---

## Phase 2: Routing

### Step 4: Route Map

```
/                   → LandingPage (public)
/auth               → Auth (public)
/start              → OnboardingFlow (auth required)
/game               → GameHome (auth required, shell)
/game/profile       → ProfileOverview (shell)
/zone-of-genius/*   → ZoG module (no shell)
...
```

### Step 5: Route Hierarchy

| Pattern | When to Use |
|---------|-------------|
| **Flat** `/module/step-1` | Simple linear flows |
| **Nested** `/module/submodule` | Hierarchical content |
| **Query** `/module?return=/x` | Pass context without nesting |

### Step 6: Guards & Redirects

| Route | Guard | Redirect If Fail |
|-------|-------|------------------|
| `/game/*` | Auth required | → `/auth?redirect=...` |
| `/start` | Auth required | → `/auth?redirect=/start` |

---

## Phase 3: Data Schema

### Step 7: Auth Schema First

```sql
-- Always start here
users (id, email, created_at)
profiles (id, user_id, username, avatar_url)
```

### Step 8: Module Data

For each module, define its table:

| Module | Table | Key Fields |
|--------|-------|------------|
| ZoG | `zog_snapshots` | id, profile_id, archetype, talents |
| QoL | `qol_snapshots` | id, profile_id, domains, scores |

### Step 9: Relationships

```
profiles
    ├── zog_snapshots (1:many)
    ├── qol_snapshots (1:many)
    └── game_profiles (1:1)
         ├── onboarding_step
         ├── last_zog_snapshot_id → zog_snapshots
         └── last_qol_snapshot_id → qol_snapshots
```

---

## Phase 4: Shell & Layout

### Step 10: Shell Definition

| Shell | Components | Purpose |
|-------|------------|---------|
| **None** | Just content | Onboarding, external modules |
| **Game Shell** | 3 panels, nav | Main app experience |
| **Focus Shell** | Minimal nav | Single-task focus |

### Step 11: Route → Shell Mapping

| Route Pattern | Shell |
|---------------|-------|
| `/` | None |
| `/auth` | None |
| `/start`, `/onboarding` | None (immersive) |
| `/game/*` | Game Shell |
| `/zone-of-genius/*` | None (focus) |
| `/quality-of-life-map/*` | None (focus) |

### Step 12: Focus Modes

When user needs to focus (assessments, wizards):
- Hide navigation
- Full-screen content
- Single exit point (complete or cancel)

---

## Phase 5: State Management

### Step 13: What Persists

| Data Type | Persistence | Location |
|-----------|-------------|----------|
| Auth session | Long-term | Supabase Auth |
| User profile | Long-term | Database |
| Onboarding step | Long-term | Database |
| Current tab | Session | URL |
| Form draft | Temporary | localStorage |

### Step 14: State Location

| Location | When to Use |
|----------|-------------|
| **URL params** | Shareable state (tab, filter) |
| **URL query** | Temporary context (?return=) |
| **localStorage** | Draft data, preferences |
| **Database** | Permanent user data |
| **React state** | UI-only, ephemeral |

### Step 15: Resume Logic

When user returns after interruption:

```
1. Check auth → if not, redirect to /auth
2. Check onboarding_completed → if not, resume onboarding
3. Check last step → resume from there
4. Default → go to /game
```

---

## Phase 6: Roast & Verify

### Step 16: Transition Check

For each module transition:
- [ ] Entry works from all entry points
- [ ] Exit goes to correct destination
- [ ] Data passes correctly

### Step 17: Data Flow Check

- [ ] All required data exists before screen loads
- [ ] All produced data saves correctly
- [ ] Errors handled gracefully

### Step 18: Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Refresh mid-flow | Resume from saved step |
| Back button | Go to previous screen |
| Deep link | Auth check → load correct state |
| Timeout | Save progress, allow resume |

---

# Part IV: Quick Reference

## AI Prompt Template

When using AI to build architecture, provide:

```
MODULES:
1. [Module name] - [Master result]
   Entry: [How user enters]
   Exit: [Where user goes after]
   Data: [In/Out]

ROUTES:
/path → Component (shell/no shell)

DATA SCHEMA:
table_name (key fields)

SHELL RULES:
When to show/hide

STATE:
What persists, where
```

---

## The Recursive Insight

**This Playbook is a product.**

The Architecture Playbook can create any architecture...
The Architecture Playbook has Input → Process → Output...
Therefore: You can run Product Playbook on Architecture Playbook.

---

## Related Documents

- [product_playbook.md](./product_playbook.md) — Source playbook
- [ui_playbook.md](./ui_playbook.md) — UI layer
- [software_architecture.md](./software_architecture.md) — Current architecture state

---

*Codified: January 2026*
*The ultimate goal of every architecture is to become invisible.*
