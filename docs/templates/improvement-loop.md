# Improvement loop (work by plan, report, improve the planning itself)

*Sasha, 2026-10-27: «Продолжай привносить улучшения в игру по плану. Отчитывайся, пересматривай план в сторону улучшения самого планирования работ.»*

A standing instruction for any long-running build (first applied to The Game of Being You). Evolver runs it without asking; forks that are Sasha's (money, strategy, public-facing, privacy, migrations) still go to him.

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

## Applied in
- The Game of Being You (from 2026-10-27)
