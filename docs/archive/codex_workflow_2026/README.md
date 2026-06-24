# Archived: Codex `ai_tasks/` workflow (2026-Q1, retired Day 103 / June 23, 2026)

The Gemini-writes-spec → Codex-implements → `PENDING_*.md → DONE_*.md` queue lived here from ~Jan 2026 to mid-2026. It was set up when multi-agent orchestration looked like the right shape; in practice it didn't earn its keep. Two `PENDING_*` files were sitting stale (one with no work, one explicitly "do not build yet") as of June 2026.

Retired on Day 103 to remove the **systemic compute + cognitive tax** the pattern carried:
- Two parallel task systems (this one and `roadmap.md`) that drifted.
- Pre-prompt mass (AGENTS.md + dependency rules) loaded into every Codex session.
- Stale `PENDING_*.md` files acting as confident "next work" that wasn't actually next.
- Same class of bug as the Day 103 holomap-state staleness (see Phase Shift Library Domain 16, "The Mirror Must Not Lag").

Single task system going forward: `docs/02-strategy/roadmap.md`.
Files preserved here untouched for archival continuity.
