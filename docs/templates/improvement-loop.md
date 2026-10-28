# Improvement loop (work by plan, report, improve the planning itself)

*Sasha, 2026-10-27: «Продолжай привносить улучшения в игру по плану. Отчитывайся, пересматривай план в сторону улучшения самого планирования работ.»*

A standing instruction for any long-running build (first applied to The Game of Being You). Evolver runs it without asking; forks that are Sasha's (money, strategy, public-facing, privacy, migrations) still go to him.

## Meta-description
- Level / parent: L2 · Ops & Agents (proposed L1, awaiting Sasha's confirmation, Meta-Template T3) · parent: [meta-template.md](./meta-template.md)
- Lens(es): **Causal** (take → ship → report → review the plan → improve the planning; a loop that feeds on its own results)
- Technology (shift it carries): PST 161 The Hexagon Cycle — building as a straight push → a cycle of DO and BE that turns again from a deeper connection with uniqueness · also PST 40 (the recursive proof: the method sharpens itself), 117 (the learning ledger and the meta-game), 115 (articulation is the mechanism of growth) · shift check: the planning retro names one change to how we plan, and the next plan visibly carries it
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

## Applied in
- The Game of Being You (from 2026-10-27)
