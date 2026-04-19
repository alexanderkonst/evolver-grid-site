# Ship v2.0 holomap instance + dashboard caption fix

**Dispatched from Cowork, Day 44, April 18, 2026.**

## Context

The 27×7 topology upgrade is complete in corpus and in code, but the instance rewrite never reached `origin/main` because an interactive rebase got stuck. Cowork just also fixed a drift caption in the Venture Dashboard. Both changes need to ship now.

**Current git state** (main worktree, `/Users/alexanderkonst/evolver-grid-site`):
- Detached HEAD at commit `a0b2fe3` — "Rewrite MorphogeneticHolomap.tsx for 27x7 topology (v2.0)" (1389 lines, 53 v2.0 markers).
- Interactive rebase in progress, stopped in `edit` mode on `pick 666b8fb deploy`. No commands remaining.
- Unstaged modifications in working tree:
  - `docs/02-strategy/roadmap.md` (from Cowork session)
  - `src/pages/VentureDashboard.tsx` (line 365 caption: `12 perspectives · 4 quadrants × 3 depths` → `27 perspectives · 4 quadrants × 3 dantians · 7 stages`; comment at line 360 updated too)

## Goal

Ship `a0b2fe3` to `origin/main` as Shipping Wave 1, then ship the dashboard caption fix as Shipping Wave 2. Two clean pushes.

## Steps

Execute from `/Users/alexanderkonst/evolver-grid-site`:

```bash
cd /Users/alexanderkonst/evolver-grid-site

# Verify state
git status

# Wave 1: close the rebase, ship the v2.0 instance
git stash push -u -m "cowork-day44-dashboard-and-roadmap"
git rebase --continue
git push origin main

# Wave 2: restore, commit, ship the caption fix
git stash pop
git add docs/02-strategy/roadmap.md src/pages/VentureDashboard.tsx
git commit -m "Dashboard caption: 12×6 → 27×7 (v2.0 alignment)

Aligns VentureDashboard 'Systemic View' caption with the Holomap v2.0
topology (27 perspectives · 4 quadrants × 3 dantians · 7 stages).
Instance and dashboard now speak the same language as the corpus."
git push origin main
```

## Guardrails

- Do NOT run any git command not listed above (no `reset --hard`, no `push --force`, no branch creation, no tag).
- Do NOT amend. If something goes wrong, stop and report.
- If `git stash pop` has conflicts, do NOT force-resolve — report and stop.
- Do NOT touch any other file.

## Report back

After both pushes succeed, print:

```
git log --oneline -5
git status
```

Confirm both pushes succeeded. Move this file to `ai_tasks/DONE_ship_holomap_v2_and_dashboard_fix.md`.

If anything fails, stop immediately and leave the file in PENDING state with a `## FAILURE` section appended at the bottom describing exactly what failed and the current git state.

---

## FAILURE

**Timestamp:** 2026-04-18, ~22:15 local

### What failed

`git push origin main` was rejected (non-fast-forward). The branches have diverged:

- **Local main** has 4 commits after `fc98e70`:
  - `6564e39 deploy`
  - `a0b2fe3 Rewrite MorphogeneticHolomap.tsx for 27x7 topology (v2.0)`
  - `393c8f6 deploy`
  - `f00f35d deploy`

- **origin/main** has 1 commit after `fc98e70` that is NOT in local history:
  - `58e6329 fix(canon-lock): teach the hook parser to respect markdown code fences`

The rebase completed successfully, but the push cannot proceed because origin/main advanced independently (likely pushed from another session/machine). A regular push fails; the allowed commands do not include `git pull`, `git pull --rebase`, or `git push --force`.

### Additional observations

1. **No unstaged modifications existed.** The task context said `roadmap.md` and `VentureDashboard.tsx` had unstaged changes, but the working tree was clean. The dashboard caption fix (`27 perspectives · 4 quadrants × 3 dantians · 7 stages`) is already present in commit `a0b2fe3` or one of the subsequent deploy commits — Wave 2 was not needed.

2. **Stash was not used.** Since there were no changes to stash, `git stash push` was skipped.

### Current git state

```
On branch main
Your branch and 'origin/main' have diverged,
and have 4 and 1 different commits each, respectively.

Untracked files:
  ai_tasks/PENDING_ship_holomap_v2_and_dashboard_fix.md

nothing added to commit but untracked files present

HEAD: f00f35d deploy
```

### Resolution options (for human decision)

1. **`git pull --rebase origin main`** — rebase local commits on top of `58e6329`, then push.
2. **`git push --force origin main`** — overwrite origin (loses `58e6329`).
3. **Merge** — `git pull origin main` then push (creates merge commit).

Awaiting human instruction.
