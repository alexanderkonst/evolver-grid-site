# Swarm weekly numbers

> Cost and flow of the agent swarm, one row per week. Written by `.github/workflows/swarm-weekly.yml` (Mondays 15:00 UTC) via `scripts/swarm/weekly.mjs`. Do not hand-edit rows; fix the script and backfill with the workflow's `now` input.
> Owner: Hark (Evolver). Started 2026-11-01 (issue #285).

## Columns

| Column | Definition |
|---|---|
| Week | Previous Monday 15:00 UTC → this Monday 15:00 UTC. |
| PRs merged | Pull requests merged into `main` inside the week (GitHub search `is:pr is:merged base:main merged:START..END`). |
| Median issue→merge | Median of (PR `merged_at` − linked issue `created_at`) in hours (`d` above 48 h). Linked issue = `Closes/Fixes/Resolves #N` in the PR body, else `claude/issue-N-*` branch name. `n` = PRs that had a linked issue; the rest are left out. |
| Rework | Merged PRs with **more than one review round and at least one round that asked for changes**. A round is a second-key verdict comment (one per reviewed commit) or a formal review submitted as APPROVED or CHANGES_REQUESTED. Non-gated PRs usually have no rounds, so this undercounts rework on `docs/`-only PRs. |
| needs-hark added | `labeled needs-hark` events inside the week (issue events API, last 90 days). |
| needs-hark open | Issues and PRs that carry `needs-hark` at the moment the row is written. |
| Actions min | Sum of `run_duration_ms` over workflow runs created in the week, in minutes. **Wall-clock of runs, not billed minutes**; it is a cost proxy that moves with how much the swarm runs. Capped at the 500 newest runs. |
| Runs | Workflow runs created in the week (same cap). |

A week with no merged PR shows `0` and `n/a`. The script is idempotent: a week already in the table is not written twice (each row ends with a `<!-- week:YYYY-MM-DD -->` marker).

## Rows

| Week | PRs merged | Median issue→merge | Rework | needs-hark added | needs-hark open | Actions min | Runs |
|---|---|---|---|---|---|---|---|
