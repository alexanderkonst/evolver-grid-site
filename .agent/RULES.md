# Evolver Project - AI Agent Rules

## 🚀 AUTONOMOUS EXECUTION MODE (MANDATORY)

This project operates in **fully autonomous mode**. All AI agents MUST:

### 1. Terminal Commands
Set `SafeToAutoRun: true` for ALL safe commands:
- ✅ AUTO-RUN: `npm run dev`, `npm run build`, `git status`, `git diff`, `git log -n`, `grep`, `find`, `cat`, `ls`
- ⚠️ USE JUDGMENT: `git push`, `npm install`, file writes
- ❌ NEVER AUTO-RUN: `rm -rf`, destructive commands, system modifications

### 2. Browser Automation
When creating browser subagent tasks, ALWAYS include this instruction:
```
Use SafeToAutoRun: true for all JavaScript operations including button clicks, link navigation, form interactions, DOM queries, screenshot captures, and page scrolling.
```

### 3. Workflow Execution
All workflow files include `// turbo-all` annotation - execute ALL steps without confirmation prompts.

---

## Why This Matters
- The developer does NOT want to click "Confirm" repeatedly
- Constant interruptions break flow state
- This project trusts AI agents to exercise good judgment
- If in doubt, auto-run safe operations and ask only for genuinely destructive ones

---

## Language Rules
- **Conversation**: Russian (разговор ведётся на русском)
- **Code**: English only
- **Documentation**: English only
- **Commit messages**: English

## Agent Lanes (soft guidance, not hard rule — updated April 15, 2026)

Alexander has consolidated onto the Claude ecosystem. Two Claude surfaces, one agent per context. Lanes below are **a map of where each surface is strongest**, not a wall.

### Working rule

**Work where your attention is.** If you're in Cowork talking with me and need a small code change — I make it directly. If you're heads-down in Claude Code shipping a feature — you stay there. Don't bounce between surfaces for the sake of "lane purity."

### Where each surface is stronger

**Claude in Cowork** (this agent):
- Corpus work (`docs/`), plays, methodology, session notes
- Roadmap, holomap, session_log updates
- AI prompts (image gen, video, copy)
- Client session holding (Russian conversation, contextual)
- Strategic reflection, moon-cycle reviews
- Small `src/` edits when the task is content-heavy and we're already in flow together

**Claude Code (Mac app)**:
- Large `src/` changes, refactors, new features
- Supabase migrations, API endpoints, database schema
- UI polish with hot-reload + browser MCP for live verification
- gstack `/review`, `/qa`, `/ship` workflows before merge
- Debugging production issues
- When the task is pure code with no conceptual ambiguity

### Shared
- Both read ALL files. Both CAN edit anywhere. `.agent/skills/` is shared.
- `ai_tasks/PENDING_*.md → DONE_*.md` queue is **deprecated** (was Codex's workflow).
- **Deprecated**: `.cursorrules`, Codex lane, Lovable DB lane, "Claude (Antigravity)" lane. Legacy references may remain in old files until pruned organically.
- `CLAUDE.md` stays pointer-only. Neither surface adds third-party opinions to it.

### Install-level tools
- **gstack** (`~/.claude/skills/gstack/`): Slash-command skills available in Claude Code Mac app — `/plan-ceo-review`, `/review`, `/qa`, `/ship`, `/investigate`, `/retro`, etc. Global install. NOT connected to this project's `CLAUDE.md` (that's intentional — preserves pointer-only contract). Namespaced as `/gstack-*` to avoid collision.
- **UI/UX Pro Max** (`.agent/skills/ui-ux-pro-max/`): Local project skill. Read `SKILL.md` before any UI work.

## Verification Before Completion

Before saying "done" on any non-trivial task:
- Re-read what was actually written (not just trust the tool response).
- If edits touched multiple files, verify each one reflects the intended change.
- If a task has a success criterion ("landing page loads," "skill installed," "no broken refs"), check it directly — run the build, open the file, fetch the URL, grep for the old string.
- If blocked or partial, say so. Don't mark complete.

## Key Reference Documents
- `/working-agreements` - Full working agreements
- `docs/ux_playbook.md` - UX principles and execution workflow
- `docs/customer_journey_map.md` - Source of truth for UX
