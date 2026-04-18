# Deploy — Sasha's Solo-Ship Protocol

*One founder, three surfaces, zero review ceremony. This is a deliberate trade: speed over safety theatre while the team is one person. Changes when there's a team — not before.*

---

## The command

Sasha runs this in his terminal — often many times a day — via up-arrow + Enter.

```bash
MSG="deploy" && cd ~/evolver-grid-site && bash -lc 'set -euo pipefail; branch=$(git rev-parse --abbrev-ref HEAD); git add -A; if ! git diff --cached --quiet; then git commit -m "'"$MSG"'"; fi; git fetch origin; git rebase origin/main; if [ "$branch" != "main" ]; then git push -u origin "$branch"; git checkout main; git merge --no-ff "$branch" -m "Merge $branch"; git push origin main; git branch -d "$branch"; git push origin --delete "$branch" || true; else git push origin main; fi'
```

### What it does

1. `git add -A` — stages everything (tracked + untracked).
2. Commits with message `deploy` if anything is staged.
3. `git fetch origin && git rebase origin/main` — linear history onto latest main.
4. If on a branch: pushes it, checks out main, merges with `--no-ff`, pushes main, deletes local + remote branch.
5. If already on main: just pushes main.

Pushing to `main` auto-deploys to three production surfaces simultaneously:

- **alexanderkonstantinov.com** (primary)
- **Vercel** preview / production
- **Lovable**

---

## Implications for how the AIs work in this repo

Both Cowork Claude and Claude Code should operate with these defaults:

1. **No PR workflow.** Don't open PRs, don't create feature branches "for review," don't suggest staging. When the brief is done, the files are written — Sasha sweeps them up with `deploy`.
2. **No pre-merge review requests.** Sasha is not reviewing. He's running the deploy command and checking the live UI afterwards. That's the review loop.
3. **Verification moves onto the AI side.** Before the AI declares work done, it runs:
   - `npm run test`
   - `npm run corpus:drift` (if corpus touched)
   - `npx tsc --noEmit` (if `src/` touched)
   - any feature-specific smoke check
   A green local pipeline is the gate, not a reviewer's approval.
4. **Keep everything reversible.** Since there's no review, the safety net is "easy to roll back." Atomic commits, clear commit messages. The one-word `deploy` is the **terminal-sweep** message: when Sasha runs his one-liner, it batches whatever is uncommitted (most often Cowork-Claude edits left in dirty-tree) into a single snapshot commit labelled `deploy`. When the AI *itself* commits — i.e. Claude Code in autonomous mode via the MCP bridge — it must use a descriptive single-sentence message so `git log` stays readable. Migrations include down-scripts.
5. **Don't skip hooks.** No `--no-verify`, no `--no-gpg-sign`. If a pre-commit hook fails, fix the underlying issue.
6. **Never touch `main` force-push, never rewrite shared history.** The deploy command uses rebase-on-local-branch then merge; it does not rewrite remote main.
7. **Irreversible prod actions still require Sasha's nod.** Data migrations that drop columns, anything that moves money, anything that deletes files on a live surface — pause, show the plan, wait for explicit yes. Everything else: ship.

---

## For Claude Code (headless mode via the MCP bridge)

When dispatched via `scripts/mcp-claude-code-bridge/`, Claude Code operates in **full-autonomy default**: make changes → verify → commit → push → auto-deploy fires. Sasha does not intervene. The bridge's `buildBriefPrompt` wires these instructions into every apply-mode dispatch.

Specifically, Claude Code should:

1. Make the code changes per the brief.
2. Run the verification pipeline:
   - `npm run test` (always).
   - `npm run corpus:drift` if corpus was touched.
   - `npx tsc --noEmit` if `src/` was touched.
   - Any feature-specific smoke check called out in the brief.
3. Rename the brief `ai_tasks/PENDING_*.md → ai_tasks/DONE_*.md` and append a **"Notes from execution"** section at the bottom (what changed vs brief, pattern divergences, new files/migrations, verification results).
4. `git add -A` — stage everything.
5. `git commit -m "<descriptive single-sentence>"` — NOT `"deploy"`. The one-word `deploy` is the terminal-sweep message used by Sasha's one-liner when it batches uncommitted dirty-tree edits into one snapshot. When Claude Code itself commits, each commit is a discrete unit of work — it should carry a readable message so `git log` is navigable. Never use `--no-verify` or `--no-gpg-sign`.
6. `git push origin main` directly. This fires auto-deploy to all three surfaces. No PR. No staging. No branch.

Exception — `dirty-tree mode`: when a brief or dispatch call explicitly says "do not commit," OR when work happens inside a Cowork session (where Claude edits files and Sasha sweeps with `deploy`). In both, the working tree is left dirty and the terminal one-liner batches it into one `deploy`-labelled snapshot. Dirty-tree is the eyeball-before-ship escape hatch — and, in practice, it's how Cowork-driven work reaches main by default.

**Irreversible prod actions remain a hard stop.** If a brief implies dropping a DB column, deleting live storage files, moving money, or changing a live Stripe price id, Claude Code pauses, emits the plan, and waits for explicit approval before touching anything. Everything else ships.

---

## When this protocol changes

Revisit when any of these become true:

- Another engineer joins the repo (even part-time).
- A production breakage costs more than the velocity it would have cost to review (materially — not just hypothetically).
- A compliance / legal requirement demands change history with review signatures.

Until then: speed.
