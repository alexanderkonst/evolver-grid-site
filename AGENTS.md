# Codex Operating Instructions (Repo-Level)

You are operating autonomously on this repository.

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
