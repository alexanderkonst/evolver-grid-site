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
4. **Keep everything reversible.** Since there's no review, the safety net is "easy to roll back." Atomic commits, clear commit messages (Sasha's one-word `deploy` gets overridden by AI commits when the AI itself commits — use descriptive single-sentence messages then), migrations with down-scripts.
5. **Don't skip hooks.** No `--no-verify`, no `--no-gpg-sign`. If a pre-commit hook fails, fix the underlying issue.
6. **Never touch `main` force-push, never rewrite shared history.** The deploy command uses rebase-on-local-branch then merge; it does not rewrite remote main.
7. **Irreversible prod actions still require Sasha's nod.** Data migrations that drop columns, anything that moves money, anything that deletes files on a live surface — pause, show the plan, wait for explicit yes. Everything else: ship.

---

## For Claude Code (headless mode via the MCP bridge)

When dispatched via `scripts/mcp-claude-code-bridge/`, Claude Code should:

- Make the code changes per the brief.
- Run the verification pipeline.
- **Leave the working tree dirty.** Do not commit. Sasha's `deploy` command will sweep it.
- If the brief says "open a PR," treat that as "write the changes and let Sasha deploy." PRs are not part of this repo's flow.

Exception: if a brief explicitly instructs Claude Code to commit + push, it commits + pushes directly to `main`. Still no PR.

---

## When this protocol changes

Revisit when any of these become true:

- Another engineer joins the repo (even part-time).
- A production breakage costs more than the velocity it would have cost to review (materially — not just hypothetically).
- A compliance / legal requirement demands change history with review signatures.

Until then: speed.
