---
description: Working agreements for AI agents on this project
---

# Working Agreements

## Language Rules
- **Conversation**: Russian (разговор ведётся на русском)
- **Code**: English only (код только на английском)
- **Documentation**: English only (docs/ и ai_tasks/ на английском)
- **Commit messages**: English

## Agent Assignments
- **Codex**: Routine UI, simple features, low-risk changes
- **Claude (Antigravity)**: Complex logic, architecture, debugging, browser audits
- **Lovable**: Database changes ONLY (apply migrations from PENDING_MIGRATIONS.md)

## Task File Conventions
- Location: `ai_tasks/`
- Format: `PENDING_[task_name].md` → `DONE_[task_name].md`
- Must include: Agent, Priority, Status, Success Criteria

## Database Migrations
- All migrations → `supabase/migrations/` 
- Track in `ai_tasks/PENDING_MIGRATIONS.md`
- Lovable applies them in batch

## Core Principles
1. **Customer Journey First**: All UX decisions must align with `docs/customer_journey_map.md`
2. **Absurd Simplicity**: If it's not simple, simplify it
3. **Progressive Unlock**: Nothing visible until earned
4. **Plain Language UI**: No "Appleseed" or "Excalibur" in user-facing text

## Current Product State
- URL: https://evolver-grid-site.vercel.app
- Branding: "Evolver" (not "Game of Life")
- Stage: MVP polish

## 🚀 AUTONOMOUS OPERATIONS (CRITICAL)

### // turbo-all — AUTO-RUN ALL SAFE COMMANDS
This project uses **autonomous execution mode**. AI agents should:

1. **Commands**: Set `SafeToAutoRun: true` for ALL safe terminal commands:
   - ✅ `npm run dev`, `npm run build`, `git status`, `git diff`, `git log`
   - ✅ `grep`, `find`, `cat`, `ls`, file reads
   - ⚠️ Use judgment for: `git push`, `npm install`, file writes
   - ❌ Never auto-run: destructive commands, `rm -rf`, system changes

2. **Browser Automation**: When giving browser subagent tasks, ALWAYS include:
   ```
   Use SafeToAutoRun: true for all JavaScript operations including:
   - Button clicks, link navigation, form interactions
   - DOM queries, screenshot captures
   - Page scrolling, element inspection
   ```

3. **Workflow Files**: All workflows in `.agent/workflows/` include:
   ```
   // turbo-all
   ```
   This annotation means ALL command steps auto-execute without confirmation.

### Why This Matters
- Eliminates constant "Confirm/Deny" interruptions
- Enables truly autonomous task completion
- Respects the developer's time and flow state

### Example Browser Subagent Task
```
Navigate to https://evolver-grid-site.vercel.app/game/teams.
Use SafeToAutoRun: true for all JavaScript operations.
Take screenshots and report what you see.
```

---

## 🔴 SCREEN LAYER MANDATE (NON-NEGOTIABLE)

**Between User Journey and UI, there MUST exist an explicit Screen Layer governed by the Product Playbook.**

If this layer is skipped or improvised → chaos: endless backtracking, constant rework, misaligned screens.
If this layer is followed rigorously → methodical, predictable, massively faster development.

### The Mandatory Stack

```
User Journey (logical sequence of modules/results)
    ↓
Product Playbook → SCREENS (the mandatory bridge)
    ↓
Architecture Playbook → Modules, Routes, Data, Shell, State
    ↓  
UI Playbook → Components, Tokens, Patterns
    ↓
Code Implementation
```

### How the Playbook Is Applied

1. **Start from Master Result** — define first screen and last screen
2. **Decompose into Sub-Results** — for each, define first and last screen
3. **Continue holonically** — repeat recursively until all results → screens
4. **Screen Construction** — each screen explicitly defines:
   - Communication intent
   - User input/output
   - Actions and decisions
   - Transitions
5. **Only then** → UI components are implemented

### The Playbooks
- `product_playbook.md` — Results → Screens
- `software_architecture_playbook.md` — Screens → Working Architecture
- `ux_ui_playbook.md` — Architecture → UI Components

### Standing Rules
- Playbooks exist to AUTOMATE decision-making
- Follow the Playbook at EVERY level of nesting and modularity
- If Playbook doesn't cover a case → flag explicitly, decide whether to extend
- Until extended: execute exactly, without deviation
- This is the mechanism that removes HITL bottlenecks and prevents architectural drift

---

## Agent Hierarchy & Characteristics

| Agent | Role | Task Type | Capacity |
|-------|------|-----------|----------|
| **Antigravity** | CTO/Architect | Architecture, coordination, playbook application | Unlimited |
| **Claude CLI** | Senior Dev | Complex but SHORT tasks (5-10 min max) | ~40 min/week |
| **Codex** | Junior/Intern | Simple, unambiguous tasks | Unlimited |
| **Lovable** | DB Specialist | Migrations only | As needed |

### Agent Characteristics (Critical)

**Claude CLI:**
- Extremely intelligent and fast
- Token-limited and "fatigues" — must be given well-scoped, non-open-ended, non-long-running tasks
- Ideal for: sharp problem solving, architectural refinements, concise but difficult tasks

**Codex:**
- Tireless, effectively unlimited runtime
- Performs POORLY on ambiguity or complexity
- Must be given: crystal-clear, deterministic, step-by-step tasks
- Ideal for: mechanical implementation, refactors with explicit instructions, repetitive/large-volume work

**Antigravity (this chat):**
- CTO/Architect level — translates Product Playbook + intent into agent-specific task specs
- Decides which agent does what
- Orchestration, planning, complex debugging

### Task Execution Workflow
1. Tasks are written in `ai_tasks/` section
2. Each task has: clear owner (CLI or Codex), status = pending, wording tailored to that agent
3. **Absolute requirement:** Extreme clarity and precision in task definition — mistakes multiply downstream

### Current Codebase Reality
- Modules exist in partially detached/floating state
- Required: locate modules → understand connections → re-anchor onto explicit screens → assemble into intended user journey
- This restructuring MUST follow the Product Playbook, not ad-hoc decisions

---

## Key Documents
- `docs/product_playbook.md` - **META**: First principles + 9-phase Execution Workflow
- `docs/ux_ui_playbook.md` - UX/UI as product, taxonomy, mobile-first, performance
- `docs/marketing_playbook.md` - Marketing as product, 8-phase workflow
- `docs/distribution_playbook.md` - Distribution as product, 8-phase workflow
- `docs/customer_journey_map.md` - Source of truth for UX
- `docs/onboarding_spec.md` - Onboarding flow specification
- `ai_tasks/README.md` - Task system overview
- `ai_tasks/PENDING_MIGRATIONS.md` - Database tasks for Lovable

