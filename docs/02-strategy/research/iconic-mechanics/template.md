# Mechanic Transplant Template (v1)

How we take one iconic game or product apart and move what demonstrably worked into **The Game of Being You** (GoBY).
v1, 2026-11-21. Keeper: Evolver (Hark). Owner: Aleksandr Konstantinov. Sasha sets the order of games.
Worked examples: [games/heroes-iii.md](games/heroes-iii.md), [games/couchsurfing.md](games/couchsurfing.md). All mechanics across games: [registry.md](registry.md).

Canon this template reads from (repo `alexanderkonst/evolver-grid-site`, snapshot 2026-11-21):
- `docs/02-strategy/game_design_almanac.md`: stages 1–10 (what the player authors) and the fidelity axis.
- `docs/02-strategy/game_of_being_you.md`: GoBY canon. Key rules: §10a fidelity test, §21.2 every mechanic has a real-life counterpart, §15.8 Koster facet check, §13.1 village places, §14.2 Journey steps J1–J12, §14.7 Your House, §14.12 stall + badges.
- `docs/02-strategy/game_launch_spec.md`: rows A1–A12, B1–B4, C1–C7. **Every adopted mechanic lands as a spec row or attaches to one.**

---

## How to fill it (rules)

1. **Evidence, not taste.** A mechanic gets in only with evidence it worked. Grade every claim:
   - **A** controlled study or large-n platform data (an experiment, a paper on the full dataset).
   - **B** hard numbers that are observational (sales, members, retention curves, the platform's own stats).
   - **C** consensus, designer interviews, fan memory. Allowed, but never alone for a "High" priority.
2. **Facts, assumptions, judgments never mixed.** Each fact carries its source and date. My reading is marked *Judgment*.
3. **Separate the mechanic from the game's success.** An iconic game is iconic for many reasons; say how much of it this mechanic plausibly explains.
4. **Canon filter before design.** A mechanic that fails §10a (adds something artificial) or §21.2 (no real-life counterpart) is recorded as *rejected* with the reason, not redesigned in secret.
5. **No dates invented.** The smallest test has a signal and a kill line, not a deadline.
6. **Nothing touches the repo** (no commits, no issues, no Lovable credits) until Sasha says yes to the exact change.

---

## The template (copy into `games/<name>.md`)

```markdown
# <Game / product> → GoBY

Filled: <YYYY-MM-DD> · Status: draft | reviewed by Sasha | adopted
Almanac stage: <1–7> (<player authors …>) · Fidelity: <symbol / model / … / reality>
One line: <what this game is, in plain words>

## 1. Why it's iconic (facts)
| Fact | Number | Source, date | Grade |
|---|---|---|---|
Share of the iconic this analysis credits to the mechanics below: <small / part / large> + one line why.

## 2. Mechanics that demonstrably worked (1–3)
### M1. <name>
- **In the source:** how it works, exactly (rules, numbers).
- **Evidence it worked:** facts + grade. What it did NOT prove.
- **Driver (why it works):** the psychological effect, named, with its source.

## 3. Canon filter (each mechanic)
| Check | M1 | M2 |
|---|---|---|
| §10a fidelity: shows something true about the player's life? | | |
| §21.2 real-life counterpart (person, place, trade, skill, payment)? | | |
| §15.8 new facet / new verb (not a recolor of an earlier place)? | | |
| Almanac design rule: unit is uniqueness; no artificial points; players can write/fork the rules? | | |
| Already in canon? (search GoBY first: which § already decides it; what this adds) | | |
Verdict per mechanic: pass / pass with change (say which) / reject (say why).

## 4. Where it lands in our game
| Mechanic | Village place (§13.1) | Journey step (§14.2) | Spec row | New row needed? |
|---|---|---|---|---|

## 5. Our version (one paragraph per mechanic)

## 6. Smallest testable version
- **What:** the least we can build or fake (mock, form, manual run) to learn.
- **Who:** which players, how many.
- **Signal:** the one number or behavior that says it works.
- **Kill line:** what result makes us drop it.
- **Depends on:** spec rows / issues that must exist first.

## 7. Risks and anti-patterns
What broke in the source game; how our version could fail; what it must never become.

## 8. Priority
Impact (1–3) × Confidence (1–3, from evidence grade) × Ease (1–3) = score; High ≥ 18, Medium 8–17, Low ≤ 7.
Priority is a recommendation. Sasha sets the order.

## 9. Sources
Numbered list, each with URL and access date.
```

---

## Lifecycle of a mechanic (status column in the registry)

`candidate` (named, not analysed) → `analysed` (this template filled) → `proposed` (sent to Sasha) → `accepted` (Sasha's yes) → `in spec` (row added or attached) → `built` (issue merged) → `tested` (signal read) → `kept` / `dropped`. A rejected mechanic keeps its row with the reason.

## Standing rule (Sasha, 2026-11-21, on Duolingo's streak)
A counter, streak or number is used only where it mirrors an act in the real world, never as a mindless hook. Add this check to every canon filter.
