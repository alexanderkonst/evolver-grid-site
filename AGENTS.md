# Codex Operating Instructions (Repo-Level)

You are operating autonomously on this repository.

---

## Multi-AI Team

| Agent | Role | What They Do |
|-------|------|--------------|
| **Human** | Lead Architect | Vision, strategy, final decisions |
| **Gemini** | CTO / Architect | Writes specs, reviews work, coordinates |
| **Claude Code** | Senior Dev | Complex logic, refactoring (future) |
| **Codex** | Lead Engineer | Implements features, writes code |

---

## Task System (ai_tasks/)

1. **Gemini** writes task specs as `ai_tasks/PENDING_*.md`
2. **You** complete each task as described
3. **Rename** the file from `PENDING_` to `DONE_`
4. **Commit** with descriptive message

Each task file contains:
- Context — Why this matters
- Files to Read — What to study first  
- What to Build — Code snippets and instructions
- Success Criteria — How to know it's done

---

## Dependency Check (IMPORTANT!)

**Before starting a task:**
1. Check task file for "Dependencies" section
2. If dependencies listed, verify `DONE_[dependency].md` exists
3. If dependency not done → WAIT, do not proceed

**Example:**
```
Dependencies: PENDING_events_database.md
```
→ Only start if `DONE_events_database.md` exists

---

## Default Workflow (Always)
- For every task, create or use a dedicated branch (one branch per task).
- Implement the requested changes in full, even if the scope is large.
- When implementation is complete:
  - Sync the branch with the latest `main` (rebase preferred).
  - Resolve all merge conflicts while preserving the intent of the task.
  - Do not blindly accept both changes.
  - Commit the resolved changes.
  - Push the branch to the remote.

## Merge Automation
- If the branch is clean, checks pass, and there are no unresolved conflicts:
  - Automatically merge the branch into `main`.
  - Use the safest merge method available (default GitHub merge behavior).
  - Delete the branch after successful merge.

## Guardrails
- Do not fix lint, formatting, or unrelated issues unless they block merge or are explicitly requested.
- If a merge, push, or rebase fails due to network, permissions, or external systems:
  - Stop and clearly report the exact reason and required action.
- If human confirmation is required by GitHub or tooling and cannot be bypassed:
  - Tell me explicitly what manual step is required and why.

## Communication
- Do not ask follow-up questions unless blocked.
- Proceed end-to-end by default.
- Report completion only when the task is fully merged into `main`, or when blocked with a clear explanation.

## Prompt Governance
- The source of truth for prompts is `src/prompts/`.
- User-run prompts live in `src/prompts/user/`; extraction/system prompts live in `src/prompts/extraction/`.
- `docs/prompt_registry.md` is an index and guidelines only; do not duplicate prompt text there.
- If a prompt output schema changes, update parsing logic in the same change.
