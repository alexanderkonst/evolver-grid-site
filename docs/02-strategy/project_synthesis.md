# Planetary OS — Project Synthesis v3
> **Version**: 2026-03-12 | **Status**: Canvas Era | **Stage**: Session-Driven Growth

---

## Who Is This Document For?

| Audience | How to Use |
|----------|------------|
| **AI Agents** | Read fully for context injection. Focus on Architecture + Reference Index. |
| **Human Collaborators** | Skim Executive Summary + Core Beliefs. Dive into sections as needed. |
| **Future Self** | Continuity anchor. Check Status section for current state. |

---

## Executive Summary

> **Thesis**: *"Planetary OS is the coordination layer for the Evolutionary Avantgarde. One launch sequence across all movements — Sovereignty, Innovation, Regeneration, Awakening, Rooting, Creation. People articulate and monetize their value, jump-start collaborations systematically, and the scattered movements building the future coordinate as one meta-ecosystem."*

### Platform Slogan (The 6 Spaces)

> **ME. LEARN. MEET. COLLABORATE. BUILD. BUY & SELL.**

| Space | Purpose | Key Modules |
|-------|---------|-------------|
| 🪞 **ME** | Know yourself, your profile | ZoG, QoL, Resources, Mission, Personality Tests |
| 📚 **LEARN** | Practices, growth paths | Library, Growth Paths, Skill Trees, Daily Loop |
| 🎉 **MEET** | Events, gatherings | Events, Men's Circle |
| 🤝 **COLLABORATE** | Find your people | Matchmaking, Connections |
| 🛠️ **BUILD** | Create products | Unique Business, Product Builder, Business Incubator |
| 🏪 **BUY & SELL** | Marketplace | Browse/purchase offerings |

### What Each Citizen Gets

1. **Discover** their unique genius (Unique Gift → Appleseed)
2. **Monetize** their value (Unique Business → Excalibur)
3. **Map** their quality of life (8 domains)
4. **Connect** with complementary people across currents
5. **Move** forward daily with AI guidance

**Core Promise**: *"There's always a next move. And we'll always tell you what it is."*

---

## Core Beliefs

These are non-negotiable:

1. **Everyone has genius** — it just needs articulation
2. **Growth creates results** — inner development precedes outer success
3. **AI amplifies, not replaces** — human agency is sacred
4. **Simple beats complex** — "Absurd Simplicity" as design principle
5. **Connection is the product** — the network creates value

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

---

## Product Architecture

### Core Modules (18 Total)

| Space | Module | Question | Output |
|-------|--------|----------|--------|
| **ME** | Unique Gift | "What's my unique value?" | Archetype, Core Vibration, Unique Offer |
| **ME** | Quality of Life | "Where am I now?" | 8-domain score, priorities |
| **ME** | Mission Discovery | "What's mine to do?" | Aligned mission from 800+ options |
| **ME** | Resource Mapping | "What assets do I have?" | Categorized assets with leverage scores |
| **ME** | Personality Tests | "My deep psychology?" | MBTI, Enneagram, HD integration |
| **LEARN** | Daily Loop | "What's my next move?" | Personalized action recommendation |
| **LEARN** | Library | "What practices exist?" | Curated practices and activations |
| **LEARN** | Growth Paths | "How do I develop?" | 5 paths with sequential upgrades |
| **LEARN** | Skill Trees | "What can I unlock?" | Visual progression system |
| **MEET** | Events | "What's happening?" | Community gatherings |
| **MEET** | Men's Circle | "Where's my tribe?" | Online circle for men |
| **COLLABORATE** | Matchmaking | "Who complements me?" | Similar/complementary genius matches |
| **COLLABORATE** | Connections | "Who's in my network?" | User relationship management |
| **BUILD** | Unique Business | "How do I monetize?" | Business model from genius |
| **BUILD** | Unique Business Canvas | "What's my full business at a glance?" | 7 artifacts: Uniqueness, Myth, Tribe, Pain, Promise, Lead Magnet, Value Ladder — each in full-signal + universal language |
| **BUILD** | Product Builder | "How do I package it?" | Product blueprints and builders |
| **BUILD** | Business Incubator | "How do I scale?" | Venture studio support |
| **BUY & SELL** | Marketplace | "What can I offer/find?" | Browse and purchase offerings |
| **Special** | Onboarding + Tour | "How does this work?" | Guided introduction |

### Design System: Bio-Light Aesthetic

| Element | Standard |
|---------|----------|
| **Primary Theme** | Pearl Mode (light, iridescent) |
| **Motion** | 8s Anti-Anxiety Standard |
| **Typography** | Display Serif (headlines) + UI Sans (body) |
| **Colors** | Wabi-sabi palette with depth violets |
| **Cards** | Glass morphism with subtle glow |

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vite + React 18 + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Backend** | Supabase (Postgres, Auth, Edge Functions) |
| **AI** | Gemini 2.5 Flash via Edge Functions |
| **Hosting** | Vercel (auto-deploy on git push) |
| **Content** | NotebookLM → YouTube → Platform |

### Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | Auth-linked user data |
| `game_profiles` | Level, XP, onboarding_stage |
| `zog_snapshots` | Unique Gift + Excalibur |
| `qol_assessments` | Quality of Life scores |
| `events` | Community gatherings |
| `connections` | User relationships |

---

## Current Status (February 2026)

### ✅ Complete

- Unique Gift (Appleseed + Excalibur)
- Quality of Life Map (Assessment + Priorities + Growth Recipe)
- Three-Panel Navigation (Bio-Light theme)
- Progressive Onboarding with Tour
- Resource Mapping (AI + manual)
- Events System (CRUD, RSVP, Calendar)
- Matchmaking v1 (Top-1 + Refresh)
- Mission Matchmaking (Excalibur → 800+ missions)
- Mobile Responsive
- My Next Move logic (badge system)
- Brand identity crystallized (Bio-Light aesthetic)
- Architecture of Liberation documented

### 🔄 In Progress

- Onboarding flow polish (button sequencing)
- Landing page for organic acquisition
- User results persistence (missions, resources to DB)
- Invite system for beta testers

### 📊 Current Phase

| Metric | Value |
|--------|-------|
| **Current phase** | Canvas Era — Session-driven methodology proven |
| **Focus** | Canvas sessions + Strategic document alignment + Canvas platform module |
| **Module count** | 19 modules across 6 spaces (Canvas module added to BUILD) |
| **Active founders** | Oyi (9.9), Sergey (🔄), Alexa/Sandra/Karime (queued) |
| **Community** | The Originals (Telegram) — launched March 12, 2026 |
| **Key artifacts** | Playbook v2.0, Canvas Template v5.0, Venture Architecture |
| **System integration** | 6 acupuncture points identified connecting platform ↔ sessions ↔ community |

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

### Workflows

| Command | Action |
|---------|--------|
| `/deploy` | Commit + push to production |
| `/commit` | Stage + commit with message |
| `/ux-audit` | Browser-based UI walkthrough |
| `/feature` | Generate Feature Requirement Document |

---

## Documentation Architecture

### Core Directories

```
docs/
├── 01-vision/           # Why we exist
├── 02-strategy/         # How we win
├── 03-playbooks/        # How we execute
├── 04-specs/            # What we build
├── 05-reference/        # What we know
├── 06-architecture/     # How it's structured
├── 07-technology/       # How it works
├── 08-content/          # What we say
├── 09-logs/             # What happened
└── 10-workshops/        # Teaching materials
```

### Key Documents

| Doc | Path |
|-----|------|
| Module Taxonomy | `02-strategy/module_taxonomy.md` |
| Roadmap | `02-strategy/roadmap.md` |
| Game Spaces | `02-strategy/game_spaces.md` |
| Brand Identity | Knowledge: `evolver_brand_identity` |

---

## Glossary

| Term | Meaning |
|------|---------|
| **Appleseed** | Talent discovery process (ZoG Step 1) |
| **Excalibur** | Unique offer generation (ZoG Step 2) |
| **Holonic** | Whole/part — each entity is both whole and part of larger whole |
| **ZoG** | Unique Gift — intersection of natural talent + joy |
| **QoL** | Quality of Life Map — 8-domain life assessment |
| **Bio-Light** | Design aesthetic — iridescent, alive, precise |
| **Pearl Mode** | Light theme with wabi-sabi colors |
| **L0-L5** | Planetary layers: Protocols → Member → Teams → DAOs → Networks → Civilization |
| **Game Shell** | The 3-panel navigation wrapper (`GameShellV2`) |

---

## Quick Start

### For AI Agents

1. Read this document fully
2. Check `docs/02-strategy/roadmap.md` for current priorities
3. Follow `GameShellV2` patterns for UI
4. Deploy via `/deploy`

### For Developers

1. `npm install && npm run dev`
2. Explore `src/modules/` for patterns
3. Use `src/prompts/` for AI calls
4. Check `docs/` for context

### Quality Checklist

- [ ] Follows "Absurd Simplicity"
- [ ] Uses `h-dvh` not `h-screen`
- [ ] Bio-Light aesthetic (pearl theme)
- [ ] 8s animation standard
- [ ] Deployed to production

---

*This is a living document. Last updated: February 2, 2026.*

*For real-time status, check `docs/02-strategy/roadmap.md` or run `/ux-audit`.*
