# e2e: QA as code

Playwright + axe checks that run against a **deployed URL** (the PR's Vercel preview), guest view only: no sign-in, no submits, no paid backend calls (any request to an edge function or any database write is refused and fails the test). The form and the rules: [`docs/templates/qa-pass.md`](../docs/templates/qa-pass.md).

Standalone on purpose: its own `package.json` and lockfile, so CI needs neither the app's dependencies nor the root lockfile (root `npm ci` currently fails, see below).

## Run it

```bash
cd e2e
npm ci
npx playwright install chromium
PREVIEW_URL=https://<preview>.vercel.app npx playwright test            # all four projects
PREVIEW_URL=http://127.0.0.1:8080 npx playwright test --project=phone   # one viewport, local dev server
npx playwright show-report artifacts/html-report
```

| Project | Viewport |
|---|---|
| `desktop` | 1440 × 900 |
| `tablet` | 768 × 1024 |
| `phone` | 390 × 844 |
| `reduced-motion` | 1440 × 900 with `prefers-reduced-motion: reduce` |

Screenshots land in `artifacts/screenshots/<project>/`. A preview behind Vercel Deployment Protection needs `VERCEL_AUTOMATION_BYPASS_SECRET`. `global-setup.ts` checks this first: if the preview answers with Vercel's login redirect, the run stops once and names the cause (instead of every spec timing out), and with the secret it stores the bypass cookie for all specs.

## Specs

| File | Checks |
|---|---|
| `tests/navigation.spec.ts` | GoBY §25 navigation DoD: one glow; map = rail chip = pane row; where / next / home in the first screen; rooms pane (all rooms, one line each); closed rooms; the enabled «Your next move» on a closed place; no pane text under Hide or the launcher |
| `tests/a11y.spec.ts` | axe: no serious or critical violation (DoD 8); the language chip is named by its code inside the game and keeps its plain name on the title screen, and the moon-clock dial's name holds its visible words (DoD 9) |
| `tests/reduced-motion.spec.ts` | motion stops under `prefers-reduced-motion` (reduced-motion project only) |

Test names start with `DoD <n> ·`; the PR comment table is built from those names (`scripts/pr-comment.mjs`).

## CI

`.github/workflows/qa-preview.yml` (moved there by Hark) waits for the Vercel deployment status of the PR head, runs the four projects, uploads `qa-pass-artifacts`, and edits one PR comment. It reports and does not block merge; make it a required check after two green runs.

Wiring a browser for the agent itself (Playwright MCP, Chrome DevTools MCP) is proposed in [`workflow/claude-code-action-browser.md`](./workflow/claude-code-action-browser.md); the exploratory pass is `qa-pass.md` §14.

### The root lockfile

At the time of writing, `npm ci` at the repo root fails: `package.json` lists `@lovable.dev/mcp-js`, `drizzle-kit`, `drizzle-orm`, `postgres` and `zod@4` that `package-lock.json` does not contain. Not fixed here (a dependency-graph change; out of scope, and `spec-handoff` §6 says stop and ask). The suite avoids it by installing from `e2e/package-lock.json`.
