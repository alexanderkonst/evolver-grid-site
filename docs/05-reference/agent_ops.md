# Agent Ops

*Proactive agent loops that run on GitHub Actions. Each one is a trigger, a context bundle, and a steer/verify step. Pattern: generator/critic pairing.*

Auth and action are the same as `.github/workflows/claude.yml` (`anthropics/claude-code-action@v1`, `CLAUDE_CODE_OAUTH_TOKEN`). Model policy: Sonnet, with `--max-turns` set on every Claude job.

## Workflows

> **Activation:** the Claude GitHub App cannot push to `.github/workflows/`, so the three files are staged in [`agent-ops-workflows/`](./agent-ops-workflows/). Activate with `git mv docs/05-reference/agent-ops-workflows/*.yml .github/workflows/` and push with a token that has `workflows` permission. Delete this note afterwards.

- **`claude-review.yml`**: on every PR (opened, synchronize), Claude reviews the diff against the linked issue's DoD and repo conventions and posts one sticky comment starting `REVIEW: PASS` or `REVIEW: CHANGES`. Review only, never pushes. Label a PR `no-review` to skip. Hark merges only on green checks plus `REVIEW: PASS`.
- **`docs-sync.yml`**: Mondays 15:00 UTC (and manual dispatch), Claude compares PRs merged to main in the last 7 days with the manuals and specs in `docs/`. If they lag, it opens one `docs-sync/<date>` PR listing the source PRs; if not, nothing happens. Add a `DOCS_SYNC_TOKEN` secret if the docs PR needs checks to run on it.
- **`post-merge-verify.yml`**: on push to main (docs-only pushes skipped), waits 5 minutes, then curls `findyourtoptalent.com` home, `/build/equilibrium` and one route touched by the merge (`scripts/ci/touched-route.mjs`). Anything but HTTP 200 without error text opens an issue labeled `regression` naming the commit. No rollback, no model call.
