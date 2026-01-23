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

## Agent Assignments
- **Codex**: Routine UI, simple features, low-risk changes
- **Claude (Antigravity)**: Complex logic, architecture, debugging, browser audits
- **Lovable**: Database changes ONLY

## Key Reference Documents
- `/working-agreements` - Full working agreements
- `docs/ux_playbook.md` - UX principles and execution workflow
- `docs/customer_journey_map.md` - Source of truth for UX
