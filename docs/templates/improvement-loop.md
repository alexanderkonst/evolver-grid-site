# Improvement loop (work by plan, report, improve the planning itself)

*Sasha, 2026-10-27: «Продолжай привносить улучшения в игру по плану. Отчитывайся, пересматривай план в сторону улучшения самого планирования работ.»*

A standing instruction for any long-running build (first applied to The Game of Being You). Evolver runs it without asking; forks that are Sasha's (money, strategy, public-facing, privacy, migrations) still go to him.

## Meta-description
- Level / parent: L2 · Ops & Agents (proposed L1, awaiting Sasha's confirmation, Meta-Template T3) · parent: [meta-template.md](./meta-template.md)
- Lens(es): **Causal** (take → ship → report → review the plan → improve the planning; a loop that feeds on its own results)
- Shift carried: PST 161 The Hexagon Cycle — building as a straight push → a cycle of DO and BE that turns again from a deeper connection with uniqueness · also PST 40 (the recursive proof: the method sharpens itself), 117 (the learning ledger and the meta-game), 115 (articulation is the mechanism of growth) · shift check: the planning retro names one change to how we plan, and the next plan visibly carries it
- What emerges: a long build that keeps getting done, and a way of planning that gets better with every wave.
- As a part of the whole: the Meta-Template sees this as the template applied to its own evolution: emergence turned back on the process that produces it, so the whole improves not only what it makes but how it makes it (the same move as Meta-Template §7.4 and T11).
- Siblings / repeats: Meta-Template §7 self-extension protocol and T11 review rhythm (this loop at the level of templates); Equilibrium daily loop and the Hexagon Cycle (PST Technology 161) as the same cycle in a person and a product; Spec & handoff to Claude Code (its build step).
- Status · applied in · last reviewed: in use · The Game of Being You (from 2026-10-27) · 2026-10-27

## The loop
1. **Take the next item from the plan.** The plan is the source of truth (for the game: `docs/02-strategy/game_of_being_you.md` §14.8 Scope of Work and the §15 queue). Work in the plan's order; don't invent side quests.
2. **Build and ship it.** Delegate where it fits (Claude Code issue → PR → review → merge once checks pass), publish through Lovable (free), then check the live site yourself.
3. **Report in meaning.** One short report per landed item: what the player now experiences, why it matters, what is next. No PR or merge jargon.
4. **Review the plan.** After each item update the plan: mark done, re-estimate what's left, reorder only where dependencies demand it, add what reality revealed.
5. **Improve the planning itself.** After each wave, add a line to the *Planning retro* below: where the estimate was off and why, which step was a bottleneck, what to plan differently next time (sizing, dependency order, parallel vs serial, check steps). Apply it to the next wave.

## Rules of thumb
- Plan updates extend the existing doc; never start a parallel plan.
- A report goes out when something lands, never "started" or "in progress".
- If an item loops twice without progress, split it or move it, and note why in the retro.
- Real-world contact (San Pancho, users) outranks speculation: let reality reshape the plan.

## Planning retro
| Date | Wave | What we learned about planning | Change applied |
|---|---|---|---|
| 2026-10-27 | Waves 1–2 (WP-1…WP-18) | Lovable publish is a separate, sometimes blocking step; a shared Lovable session serialises everything | Publish is its own checklist item per wave, with its own session |
| 2026-10-27 | Wave 2 (WP-5, WP-7a) | A WP that bundles UI and a DB table waits whole on the consent for the table; and a review request («send to /village after save») hid the player's reward | Migrations always ship as their own PR, UI degrades without them; every review change is checked against the three-minute walk (title → test → saved character → village) before it is asked for |
| 2026-10-27 | Wave 2 (WP-4, WP-5, WP-7a) | Three big PRs in parallel on shared files (`ZoneOfGeniusEntry`, `GameTitle`) merge in sequence and the second one conflicts; and WP-5 gates five queued WPs (6, 7 rest, 9, 19, 20), so with it stuck only one build slot was usable | Order by shared files, not only by dependency: merge the smallest first, ask for the rebase in the same turn; land the form WP (WP-5) before anything that needs it, and give it priority over new slots |
| 2026-10-28 | Wave 2–3 (WP-5, WP-19, WP-21) | Issues written early and parked as «queued» went stale: #147 still described a new table that was later created by hand, #171 and #160 stayed open after their PRs merged. Hark also did the PR step for Claude's orphan branches, so merge and issue-close were separate steps | Every run first closes issues whose PR merged; an unblocking comment restates storage and file-boundary decisions in full, and the three parallel builds get disjoint file lists |
| 2026-10-28 | Wave 3 (WP-6, WP-8, WP-19) | Claude's job leaves a branch and a «Create PR» link but never opens the PR, and auto-merge then merges a green PR within two minutes, so the only review window is the branch diff before Hark opens the PR; two builds on neighbouring files (WP-8 vs WP-19/WP-6) conflicted although their file lists looked apart (`ProfileOverview`, `placeState`) | Hark opens PRs at the start of each fire and checks the file overlap of all open branches before opening; late builds are asked to rebase, not redone |
| 2026-10-28 | Wave 3–4 (WP-9, WP-11, WP-15, playtest fixes) | Claude's first push for #185 never landed (shell blocked install and the branch was missing); the retry cost 17 minutes, and WP-11 then conflicted with a playtest fix that touched `Village.tsx` and `placeState.ts`. Playtest fixes born from Sasha's live walks jumped the queue and shared files with planned WPs. A harmony pass touches every screen, so it cannot run beside other builds | Check that the branch exists on origin before waiting on a build; a build must name the open playtest PRs' files in its avoid list; the harmony pass runs alone, after the content WPs land |
| 2026-10-29 | Game v1 (#224, #225, audit fixes) | Claude's sandbox now refuses `npm ci`, so every PR arrives with build, tsc, lint and screenshots unrun, and a green Vercel build is the only gate; two branches written the same evening for one noon deadline shared `villagePlaces.ts`, `App.tsx` and `placeState.test.ts`, so the second conflicted as soon as the first merged (2 min). | Open and merge the smaller branch first, ask the rebase of the larger one in the same turn; the DoD check for unverified PRs is Hark's live guest walk after publish (not screenshots in the PR); issues say «if `npm ci` is refused, try `npm install --no-audit --no-fund` and say what could not run». |
| 2026-10-30 | Game v1 (#227, #229) | A branch left waiting while main moved (the Home rename touched 5 of its files) cost ~25 min of hand-merging in a sandbox with no git remote; the rename sweep and the new place were planned on the same files. Lovable showed «up to date» before any Publish click: merges to main appear to deploy on their own. | Land a repo-wide rename before queued branches start, or after they merge, never in between; when a branch is behind, merge main into it through the git data API (tarball → `git merge-file` → blobs/tree/commit with two parents) rather than waiting for Claude. Check the live site first; click Publish only if Lovable shows pending changes. |

## Applied in
- The Game of Being You (from 2026-10-27)
