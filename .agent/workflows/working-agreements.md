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

## Key Documents
- `docs/customer_journey_map.md` - Source of truth for UX
- `docs/customer_journey_progression.md` - Unlock conditions
- `docs/onboarding_script.md` - Screen copy
- `ai_tasks/README.md` - Task system overview
