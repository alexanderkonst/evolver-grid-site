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

## Key Documents
- `docs/one_button_product_builder.md` - **META**: The product that builds products
- `docs/ux_playbook.md` - First principles of product design + execution workflow
- `docs/customer_journey_map.md` - Source of truth for UX
- `docs/customer_journey_progression.md` - Unlock conditions
- `docs/onboarding_script.md` - Screen copy
- `ai_tasks/README.md` - Task system overview
- `ai_tasks/PENDING_MIGRATIONS.md` - Database tasks for Lovable
