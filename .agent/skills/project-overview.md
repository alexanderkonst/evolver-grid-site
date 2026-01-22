---
description: Project overview and tech stack for Planetary OS
---

# Planetary OS Overview

Use this skill when onboarding to the project or needing context about the platform.

## What is Planetary OS?

Coordination infrastructure for human potential. Helps individuals:
- **Know Yourself** — Zone of Genius + Quality of Life mapping
- **Grow Yourself** — 61 micro-modules across 5 paths (Body, Emotions, Mind, Genius, Spirit)
- **Find Your People** — Matching by genius, mission, and skills

For communities: talent visibility, auto-matching, asset registry.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS + Radix/shadcn |
| Routing | React Router DOM |
| State | TanStack Query |
| Backend | Supabase (Auth + PostgreSQL + Edge Functions) |
| Validation | Zod |
| Charts | Recharts |
| Icons | Lucide React |

## Key Directories

```
src/
├── components/     # Reusable UI components
├── modules/        # Feature modules (zone-of-genius, onboarding, etc.)
├── pages/          # Route pages
├── lib/            # Utilities and helpers
├── integrations/   # Supabase client
└── hooks/          # Custom React hooks

docs/               # Documentation
.agent/skills/      # AI skills (this folder)
supabase/functions/ # Edge functions
```

## Spaces (Main Navigation)

1. **My Next Move** — Recommended action
2. **Profile** — Zone of Genius, Quality of Life, Mission, Assets
3. **Transformation** — Daily practice, 5 growth paths
4. **Discover** — Matchmaking (similar/complementary genius)
5. **Marketplace** — Genius Offers
6. **Teams** — Connections, team formation
7. **Events** — Community gatherings

## Master Result

> "Know yourself. Grow yourself. Find your people."

One-Button Goal: `[Show Me My Next Move]`
