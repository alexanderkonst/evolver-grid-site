# AGENTS.md — rules for Codex (and any coding agent) in this repo

Owner: Alexander (Sasha) Konstantinov. Orchestrator: Hark. Plan: ChatGPT Plus ($20), so usage is scarce. Spend it like money.

## Model routing
- Default: GPT-6.1 Sol, Standard speed. Never Fast or Ultrafast (Fast burns 2.5x).
- Routine and bulk work (doc imports, formatting, renames, link fixes, small config): GPT-6 Luna (~20x more usage than Sol).
- GPT-6 Astra: only when the issue explicitly says `model:astra` (hard architecture). Never by default.
- Claude Code is the primary builder here; Codex is the fallback and the reviewer. If a task is already assigned to @claude, don't duplicate it.

## Token economy
- Do exactly the issue's scope and its Definition of Done. No drive-by refactors, no optional improvements.
- Read only the files the task needs. No repo-wide scans unless the issue asks for one. Start from docs/docs_index.md (evolver-grid-site) when you need context.
- One PR per issue, small diffs. Short PR description: what changed, how verified, DoD table.
- Don't run the full test or audit suite when a targeted check proves the change.
- Code review: only when explicitly requested with `@codex review`. Keep reviews to real defects, no style notes.
- If blocked twice on the same step, stop and comment with what you found instead of retrying.

## Boundaries
- Never rewrite locked master texts or anything under docs/ that the issue doesn't name.
- License: .agent/skills/ = MIT; docs/ = CC BY-NC-SA 4.0. Never mix.
- Never commit secrets or private CRM data (names, amounts) to this public repo.
