# Deploy Pipeline — Mechanism, Risk, and the Typecheck Gate

*Investigation triggered Jul 28, 2026: a generic-message commit and a near-miss route pointing at a nonexistent module both reached `main` via the "deploy" sweep. A separate bug (`/privacy` white-screening on a `ReferenceError`) had already reached production because `npm run build` did not typecheck. This doc records what the auto-commit mechanism actually is, and what changed. For the full protocol and philosophy, see `.agent/deploy.md` — this file is the incident-driven companion, not a duplicate.*

---

## What actually triggers the "deploy" commits

**It is a manual shell one-liner Sasha runs himself**, recalled from `~/.zsh_history` via up-arrow, many times a day. It is documented verbatim in `.agent/deploy.md`:

```bash
MSG="deploy" && cd ~/evolver-grid-site && bash -lc 'set -euo pipefail; branch=$(git rev-parse --abbrev-ref HEAD); git add -A; if ! git diff --cached --quiet; then git commit -m "'"$MSG"'"; fi; git fetch origin; git rebase origin/main; if [ "$branch" != "main" ]; then git push -u origin "$branch"; git checkout main; git merge --no-ff "$branch" -m "Merge $branch"; git push origin main; git branch -d "$branch"; git push origin --delete "$branch" || true; else git push origin main; fi'
```

Confirmed by:
- `git log --format='%an %ae %cn %ce %s'` — every "deploy" commit is authored **and** committed by `alexanderkonst <alexanderkonst@gmail.com>` (his real local git identity, not a bot or CI account).
- `.git/hooks/` has no active hooks (only the stock `.sample` files), and `core.hooksPath` points at the default `.git/hooks` — so nothing is firing on commit/push locally.
- No cron, no `launchctl` entry, no LaunchAgent references "deploy"/"evolver"/"lovable" on this Mac.
- No GitHub Actions workflow, Netlify/Vercel config, or Lovable config runs `git commit`. `vercel.json` only has rewrites/cache headers. The only workflow (`.github/workflows/corpus-drift.yml`) is a read-only nightly check, not a committer.
- `scripts/mcp-claude-code-bridge/server.mjs` (the Cowork ↔ Claude Code dispatch bridge) explicitly instructs headless Claude Code to commit with **a descriptive message, "NOT deploy"** — so the bridge is not the source of generic messages either; it's actually the thing warning against them.

**What it sweeps:** `git add -A` — literally everything in the working tree, tracked and untracked, regardless of which agent or process put it there. This is the root of the symptom: if a second Claude Code session, a Cowork session, or a background dispatch has half-finished edits sitting in the tree when Sasha runs his one-liner, they get swept into the same "deploy" commit and pushed straight to `main` — no branch, no PR, no review.

**Why it exists this way (by design, per `.agent/deploy.md`):** solo-founder repo, deliberate trade of speed over review ceremony. Push to `main` fires deploy to three surfaces simultaneously: alexanderkonstantinov.com (primary), Vercel, and Lovable. The one-word "deploy" message is meant to be the *terminal-sweep* label specifically for this batching pattern — it is working as designed, just without a safety net for what's being swept.

### Confirmed while investigating (live example)

At the time of this audit, `src/modules/transition-quiz/TransitionQuizPage.tsx` was mid-edit by another agent (per explicit scope constraint, not touched here) and had 8 real type errors (`TFunction` incompatibility). Had `deploy` run at that exact moment, before this gate existed, those errors would have shipped straight to production silently, because `vite build` does not typecheck — it only transpiles.

## The gap: `npm run build` never typechecked

`vite build` (esbuild/SWC under the hood) strips types without checking them. A file can have real type errors — undefined references, wrong function signatures — and still produce working-looking JS output, until the specific broken code path executes at runtime. That's exactly how `/privacy` white-screened: a `ReferenceError` that a real typecheck would have caught before it ever reached `main`.

## What changed (this pass)

1. **Added `typecheck` script** to `package.json`:
   ```json
   "typecheck": "tsc --noEmit -p tsconfig.app.json"
   ```
2. **Gated `build` on it:**
   ```json
   "build": "npm run typecheck && vite build"
   ```
   Now any path that runs `npm run build` — the three hosted deploy surfaces almost certainly build via this script — fails loudly on a type error instead of silently shipping it.
3. **Verified before/after** in an isolated `git worktree` off `HEAD` (not the live dirty tree, since another agent's in-progress work was sitting there): baseline `npm run build` at `HEAD` passed clean; `npm run typecheck` at `HEAD` passed clean (exit 0); gated `npm run build` at `HEAD` passed clean. No regression.

## What was deliberately NOT touched

- **The shell one-liner itself.** It lives in Sasha's shell history, not a file or hook this session controls. Per scope, only an existing local hook/script that is "clearly the auto-committer" gets a gate added directly — none exists. Nothing here disables, rewrites, or intercepts the one-liner.
- **No git hook was invented.** `.git/hooks/` was left as-is (no pre-commit/pre-push hook added). Adding one would be a new mechanism, not a gate on an existing one, and was out of scope for this pass.
- **Lovable's hosted sync, Vercel config, launchd/cron** — untouched, per constraint. If any hosted surface's build step does *not* run `npm run build` (e.g. calls `vite build` directly), this gate won't reach it — worth Sasha confirming per-surface.

## Decision left to Sasha

The `typecheck`-in-`build` gate only fires when something actually invokes `npm run build`. It does **not** stop the one-liner from pushing straight to `main` before any build runs, and it does **not** prevent the `git add -A` sweep from grabbing another agent's half-finished file in the first place. Two options, not acted on here:

1. **Turn the one-liner into a saved script** (e.g. `scripts/deploy-sweep.sh`) that runs `npm run typecheck` (or `npm run build`) *before* `git add -A`/commit/push, aborting the sweep on failure. This would be a new local script Sasha owns and could ask this session (or Claude Code) to create and wire into his shell alias — but that's an explicit ask, not implied by "harden the deploy process."
2. **A local `pre-push` hook** in `.git/hooks/` that runs the typecheck (or full test suite) before any push to `main` reaches the remote — would catch the one-liner too, since hooks fire regardless of how the push is invoked. Not added here because no existing hook was found to extend, and inventing new local infrastructure crossed the line drawn for this pass ("only gate an existing local hook/script that is clearly the auto-committer").

Either is a five-minute follow-up if Sasha wants the gate to reach the one-liner itself, not just the hosted build step.
