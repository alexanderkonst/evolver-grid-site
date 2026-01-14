# Planetary OS

> A coordination platform for human potential. The Member Portal (L1) of the planetary infrastructure.

**Live**: [evolver.network](https://evolver.network)

---

## What Is This?

A system that helps individuals:

1. **Discover** their unique genius (Zone of Genius)
2. **Map** their quality of life across 8 domains
3. **Connect** with complementary people
4. **Move** forward daily with AI guidance

**Core Promise**: *"There's always a next move. And we'll always tell you what it is."*

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Architecture

### The Three-Layer Model

| Layer | What It Does |
|-------|--------------|
| **5 Growth Paths** | Spirit, Mind, Emotions, Genius, Body — inner development vectors |
| **8 QoL Domains** | Wealth, Health, Happiness, Love, Impact, Growth, Social, Home |
| **5 Game Spaces** | Profile, Transformation, Marketplace, Matchmaking, Venture Co-op |

**Key Insight**: Self-Development → Life Results (not the reverse).

### User Journey (8 Steps)

```
PHASE 1: IDENTITY          PHASE 2: MAPPING           PHASE 3: ACTION
┌──────────────────┐      ┌──────────────────┐       ┌──────────────────┐
│ 1. Discover      │      │ 3. Assess Life   │       │ 6. Daily Loop    │
│    Genius        │  →   │ 4. Set Priorities│   →   │ 7. Find Matches  │
│ 2. Forge Offer   │      │ 5. Growth Recipe │       │ 8. Discover      │
└──────────────────┘      └──────────────────┘       │    Mission       │
                                                     └──────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Postgres, Auth, Edge Functions) |
| AI | Lovable API Gateway → Gemini 2.5 Flash |
| Hosting | Vercel (auto-deploy on git push) |

---

## Project Structure

```
src/
├── components/game/       # 3-panel layout, navigation
├── modules/               # Feature modules
│   ├── zone-of-genius/    # Appleseed + Excalibur
│   ├── quality-of-life-map/
│   ├── mission-discovery/
│   └── asset-mapping/
├── pages/                 # Route pages
└── prompts/               # AI prompt templates

supabase/functions/        # Edge functions for AI
docs/                      # Project documentation
```

---

## Current Status (Jan 14, 2026)

### ✅ Complete

- Zone of Genius (Appleseed + Excalibur)
- Quality of Life Map (Assessment + Priorities)
- Three-Panel Navigation
- Asset Mapping (AI + manual)
- Events System (CRUD, RSVP)
- Matchmaking v1 (Top-1 + Refresh)
- Mission Discovery (800+ missions)
- Mobile Responsive

### 🔄 In Progress

- Transformation Content: 40/61 modules (65%)
- Plain Language UI improvements

---

## Documentation

| Document | Purpose |
|----------|---------|
| [Project Synthesis](docs/project_synthesis.md) | Complete project overview |
| [Customer Journey](docs/customer_journey_map.md) | User flow and experience |
| [Session Log](docs/session_log.md) | Development chronicle |
| [Holonic Vision](docs/holonic_vision.md) | Planetary-scale architecture |

---

## Collaboration

### Team

| Role | Agent |
|------|-------|
| Founder | Human |
| Chief Architect | Claude |
| Senior Dev | Claude CLI |
| Lead Engineer | Codex |
| DB Manager | Lovable |

### Workflows

| Command | Action |
|---------|--------|
| `/deploy` | Commit + push to production |
| `/ux-audit` | Browser-based UI walkthrough |
| `/commit` | Stage + commit with message |

---

## Design Principles

1. **Absurd Simplicity** — One box in Panel 3, one action at a time
2. **AI Amplifies, Not Replaces** — Human agency is sacred
3. **Everyone Has Genius** — It just needs articulation
4. **Connection Is The Product** — The network creates value

---

## The Vision

```
Individual → Team → Community → Bioregion → Planet
```

This is infrastructure for the Great Turning. An operating system for human transformation at planetary scale.

---

*Built at Network School, Malaysia. January 2026.*
