# Agent Ops

*Proactive agent loops that run on GitHub Actions. Each one is a trigger, a context bundle, and a steer/verify step. Pattern: generator/critic pairing.*

Auth and action are the same as `.github/workflows/claude.yml` (`anthropics/claude-code-action@v1`, `CLAUDE_CODE_OAUTH_TOKEN`). Model policy: Sonnet, with `--max-turns` set on every Claude job.

## Workflows

> **Activation (Hark):** the Claude GitHub App cannot push to `.github/workflows/`, so the files are staged in `.agent/pending/` like the other agent workflows. From a checkout with a token that has `workflows` permission: `git mv .agent/pending/{claude-review,docs-sync,post-merge-verify}.yml .github/workflows/` and `git mv -f .agent/pending/agent-automerge.yml .github/workflows/agent-automerge.yml` (adds `Claude Review` to its trigger list and makes it honour the critic's `REVIEW: CHANGES`). Delete this note afterwards.
>
> Wiring with the existing agent workflows: `claude-review` and `post-merge-verify` declare `workflow_dispatch` so `agent-open-pr` and `agent-automerge` can run them after `GITHUB_TOKEN` PRs and merges, which fire no `pull_request` or `push` events. `docs-sync` is also dispatched by auto-merge after each merge (its name matches), but ignores that unless `force` is ticked, so it stays weekly.

- **`claude-review.yml`**: on every PR (opened, synchronize), Claude reviews the diff against the linked issue's DoD and repo conventions and posts one sticky comment starting `REVIEW: PASS` or `REVIEW: CHANGES`. Review only, never pushes. Label a PR `no-review` to skip. Hark merges only on green checks plus `REVIEW: PASS`.
- **`docs-sync.yml`**: Mondays 15:00 UTC (and manual dispatch with `force` ticked), Claude compares PRs merged to main in the last 7 days with the manuals and specs in `docs/`. If they lag, it opens one `docs-sync/<date>` PR listing the source PRs; if not, nothing happens. Add a `DOCS_SYNC_TOKEN` secret if the docs PR needs checks to run on it.
- **`post-merge-verify.yml`**: on push to main (docs-only pushes skipped), waits 5 minutes, then curls `findyourtoptalent.com` home, `/build/equilibrium` and one route touched by the merge (`scripts/ci/touched-route.mjs`). Anything but HTTP 200 without error text opens an issue labeled `regression` naming the commit. No rollback, no model call.
