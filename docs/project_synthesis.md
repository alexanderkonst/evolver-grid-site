# Planetary OS — Project Synthesis v2
> **Version**: 2026-01-13 | **Status**: Active Development | **Stage**: MVP+

---

## Who Is This Document For?

| Audience | How to Use |
|----------|------------|
| **AI Agents** | Read fully for context injection. Focus on Architecture + Reference Index. |
| **Human Collaborators** | Skim Executive Summary + Core Beliefs. Dive into sections as needed. |
| **Future Self** | Continuity anchor. Check Status section for current state. |

---

## Executive Summary

> **One-liner**: *"I'm building the coordination layer that unites startup societies, regen communities, and venture studios — citizens discover their value, monetize it, and find collaborators across tribes."*

### The Meta-Ecosystem Play

This is **not just a member portal** — it's the **coordination infrastructure** for a new planetary layer of collaborative innovation.

**What we unite:**
- 🌐 **Network States / Web3 / Crypto** — sovereign digital communities
- 🚀 **Venture Studios** — builders creating new ventures
- 🌱 **Regen Communities** — ecological and social regenerators
- ✨ **Spiritual / New Earth Communities** — conscious evolution pioneers

**One infrastructure. Different tribes. Shared coordination layer.**

### What Each Citizen Gets

1. **Discover** their unique genius (Zone of Genius → Appleseed)
2. **Monetize** their value (Genius Business → Excalibur)
3. **Map** their quality of life (8 domains)
4. **Connect** with complementary people across tribes
5. **Move** forward daily with AI guidance

**Core Promise**: *"There's always a next move. And we'll always tell you what it is."*

### Why This Is Bigger Than Balaji

Balaji's Network State is one channel — crypto-native. Our infrastructure connects **all streams of conscious innovation** into one coordination layer. This is why it's called **Planetary OS**, not just "member portal."

---

## Core Beliefs

These are non-negotiable:

1. **Everyone has genius** — it just needs articulation
2. **Growth creates results** — inner development precedes outer success
3. **AI amplifies, not replaces** — human agency is sacred
4. **Simple beats complex** — "Absurd Simplicity" as design principle
5. **Connection is the product** — the network creates value

---

## The Problem We Solve

### Individual Level
- Unclear purpose
- Untapped potential  
- Scattered effort
- No daily practice

### Collective Level
- Misaligned coordination
- Wasted synergy between complementary people
- Expertise locked in silos

### Why Traditional Solutions Fail
- **Coaching**: Expensive, doesn't scale
- **Self-help**: Generic, no personalization
- **Social platforms**: Optimize for engagement, not growth

### Our Edge
AI-powered personal development that:
- Costs nothing to scale
- Personalizes to each user's genius
- Creates real human connections
- Provides daily actionable guidance

---

## User Journey: The 8 Steps

```
PHASE 1: IDENTITY (Days 1-3)
┌─────────────────────────────────────────┐
│ 1. Discover Genius (Appleseed)          │
│    → "What am I naturally best at?"     │
│                                         │
│ 2. Forge Unique Offer (Excalibur)       │
│    → "How do I create value for others?"│
└─────────────────────────────────────────┘
           ↓
PHASE 2: MAPPING (Days 3-5)
┌─────────────────────────────────────────┐
│ 3. Assess Life (Quality of Life Map)    │
│    → "Where am I now?" (8 domains)      │
│                                         │
│ 4. Set Priorities                       │
│    → "Where do I want to go?"           │
│                                         │
│ 5. Generate Growth Recipe               │
│    → "How do I get there?"              │
└─────────────────────────────────────────┘
           ↓
PHASE 3: ACTION (Day 5+)
┌─────────────────────────────────────────┐
│ 6. Enter Daily Loop                     │
│    → "What's my next move?"             │
│                                         │
│ 7. Find Connections                     │
│    → "Who are my people?"               │
│                                         │
│ 8. Discover Mission                     │
│    → "What's mine to do in this world?" │
└─────────────────────────────────────────┘
```

**Key Insight**: Self-first, then others. Personal clarity enables collective contribution.

---

## Product Architecture

### Three-Panel Navigation ("Discord-style")

```
┌──────────┬─────────────┬──────────────────────────────┐
│ Panel 1  │  Panel 2    │         Panel 3              │
│ SPACES   │  SECTIONS   │        CONTENT               │
│          │             │                              │
│ ○ Profile│ ▸ Overview  │  ┌────────────────────────┐  │
│ ○ Growth │ ▸ Mission   │  │                        │  │
│ ○ Move   │ ▸ Genius    │  │   SINGLE FOCUSED BOX   │  │
│ ○ Collabs│   ├ Appleseed │  │                        │  │
│ ○ Events │   └ Excalibur │  │   (One action at a    │  │
│ ○ Market │ ▸ QoL       │  │    time. Always.)      │  │
│ ○ Co-op  │ ▸ Assets    │  │                        │  │
│          │             │  └────────────────────────┘  │
│  240px   │   280px     │        FLEXIBLE              │
└──────────┴─────────────┴──────────────────────────────┘
```

**Design Constraints**:
- **One-Box Rule**: Panel 3 shows ONE focused container only
- **No Truncation**: All labels fully visible in Panel 2
- **Progressive Reveal**: Features unlock as user progresses

### Core Modules

| Module | Question | Output |
|--------|----------|--------|
| **Zone of Genius** | "What's my unique value?" | Archetype, Core Vibration, Unique Offer |
| **Quality of Life** | "Where am I now?" | 8-domain score, priorities |
| **Mission Discovery** | "What's mine to do?" | Aligned mission from 800+ options |
| **Asset Mapping** | "What resources do I have?" | Categorized assets with leverage scores |
| **Matchmaking** | "Who complements me?" | Similar/complementary genius matches |
| **Transformation** | "How do I grow?" | 61 micro-modules across 5 paths |

### The 5 Growth Paths

| Path | Focus | Modules |
|------|-------|---------|
| **Body** | Physical vitality | 7 |
| **Emotions** | Processing & mastery | 8 |
| **Mind** | Perception & stages | 10 |
| **Spirit** | Awareness & character | 10 |
| **Genius** | Unique expression | 9 |

Each module follows the **Flywheel Pattern**:
```
Microlearning (2-5 min) → Experience (1-2 min) → Integration (7 days)
```

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vite + React 18 + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Backend** | Supabase (Postgres, Auth, Edge Functions) |
| **AI** | Lovable API Gateway → Gemini 2.5 Flash |
| **Hosting** | Vercel (auto-deploy on git push) |
| **Content** | NotebookLM → YouTube → Platform |

### Key Files

```
src/
├── components/game/
│   ├── GameShellV2.tsx     # 3-panel layout
│   ├── SpacesRail.tsx      # Panel 1
│   └── SectionsPanel.tsx   # Panel 2
├── modules/
│   ├── zone-of-genius/     # Identity discovery
│   ├── mission-discovery/  # 800+ missions
│   └── asset-mapping/      # Resource mapping
└── prompts/                # AI prompt templates

supabase/functions/
├── generate-appleseed/     # Talent synthesis
├── generate-excalibur/     # Offer generation
├── match-mission-to-excalibur/  # Mission matching
└── suggest-asset-matches/  # Asset complementarity
```

### Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | Auth-linked user data |
| `game_profiles` | Level, XP, onboarding_stage |
| `zog_snapshots` | Zone of Genius + Excalibur |
| `qol_assessments` | Quality of Life scores |
| `events` | Community gatherings |
| `connections` | User relationships |

---

## Current Status

### ✅ Complete

- Zone of Genius (Appleseed + Excalibur)
- Quality of Life Map (Assessment + Priorities)
- Three-Panel Navigation
- Progressive Onboarding
- Asset Mapping (AI + manual)
- Events System (CRUD, RSVP, Calendar)
- Matchmaking v1 (Top-1 + Refresh)
- Mission Matchmaking (Excalibur → 800+ missions)
- Mobile Responsive

### 🔄 In Progress

- Transformation Content: **40/61 modules** (65%)
- Plain Language UI improvements
- Onboarding Progress Bar
- Panel 3 Button Standardization

### 📊 Success Metrics (Targets)

| Metric | Target |
|--------|--------|
| Onboarding → Daily Loop | >70% |
| Module Completion | >50% |
| Match Acceptance | >30% |
| NPS | >50 |

---

## Collaboration Model

### The Team

| Role | Agent | Focus |
|------|-------|-------|
| **Founder** | Human | Vision, Strategy |
| **Chief Architect** | Claude | Architecture, UX |
| **Senior Dev** | Claude CLI | Complex implementation |
| **Lead Engineer** | Codex | Volume UI tasks |
| **DB Manager** | Lovable | Migrations only |

### Protocols

- **Language**: Russian (chat), English (code/docs)
- **Deploy-First**: Not "done" until visible in production
- **Plain Language**: No jargon in user-facing UI
- **Task Queue**: `ai_tasks/PENDING_*.md` → `DONE_*`

### Workflows

| Command | Action |
|---------|--------|
| `/deploy` | Commit + push to production |
| `/ux-audit` | Browser-based UI walkthrough |
| `/commit` | Stage + commit with message |

---

## Glossary

| Term | Meaning |
|------|---------|
| **Appleseed** | Talent discovery process (ZoG Step 1) |
| **Excalibur** | Unique offer generation (ZoG Step 2) |
| **Holonic** | Whole/part — each entity is both whole and part of larger whole |
| **ZoG** | Zone of Genius — intersection of natural talent + joy |
| **QoL** | Quality of Life Map — 8-domain life assessment |
| **Flywheel** | Self-reinforcing cycle: Learn → Experience → Integrate |
| **L0-L5** | Planetary layers: Protocols → Member → Teams → DAOs → Networks → Civilization |
| **Collabs** | Collaborations space for finding complementary people |
| **Game Shell** | The 3-panel navigation wrapper (`GameShellV2`) |

---

## Quick Start

### For AI Agents

1. Read this document fully
2. Check `ai_tasks/PENDING_*.md` for work
3. Follow `GameShellV2` patterns
4. Deploy via `/deploy`

### For Developers

1. `npm install && npm run dev`
2. Explore `src/modules/` for patterns
3. Use `src/prompts/` for AI calls
4. Check `docs/` for context

### Quality Checklist

- [ ] Follows "Absurd Simplicity"
- [ ] Uses `h-dvh` not `h-screen`
- [ ] No truncation in Panel 2
- [ ] Single box in Panel 3
- [ ] Plain language in UI
- [ ] Deployed to production

---

## Reference Index

### Documentation

| Doc | Path |
|-----|------|
| Status & Roadmap | `knowledge/project_status/status_and_roadmap_*.md` |
| Navigation | `knowledge/planetary_os/systems/navigation_strategy.md` |
| Onboarding | `knowledge/planetary_os/systems/onboarding.md` |
| Curriculum | `knowledge/transformational_curriculum/curriculum_index.md` |
| Collaboration | `knowledge/developer_ai_collaboration_model/ai_delegation_model.md` |

### Knowledge Items

- Planetary OS (L0-L5 architecture)
- Transformational Curriculum (61 modules)
- Developer-AI Collaboration
- UI Design Standards
- Holonic Economics

---

*This is a living document. Last updated: January 13, 2026.*

*For real-time status, check `knowledge/project_status/` or run `/ux-audit`.*
