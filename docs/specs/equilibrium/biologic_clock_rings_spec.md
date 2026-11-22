# Biologic Clock (spec v1)

Sasha, 2026-11-21 16:35 MST: «чисто как часы персональные биологические, на основании движка эквилибриума, на основном игровом экране». Decided design: **mockup v5**, Sasha 2026-11-22 11:47 MST «А вот это уже хорошо! Делаем!».
Mockup v5 (real engine values for Sasha, Sun 2026-11-22 ~11:15 MST: Waxing Gibbous, Full Moon Tue 2026-11-24 08:25 Mazatlán; Sunday): [village, desktop](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v5-village.jpg) · [phone 390 px](../../02-strategy/research/iconic-mechanics/mockups/bioclock-v5-mobile.jpg). Static, not in code.

## What it is
A personal biological clock: in 5 seconds the player feels **where they are in their cycles**, not in time («время — это на самом деле циклы»). For each rhythm: the current phase, its symbol and its meaning, the previous and next phase, and (for the moon) how long until the next phase.

## Rules
- Not tied to actions. The clock shows cycles and their energy, never progress, scores or streaks.
- One engine: `src/lib/equilibrium-cycles` via `useCycles` / `getAllCyclesV2(now, birthday)`. No second calculation.
- Reuse Equilibrium first: `CycleEnergyBar` already carries the model (orbs, prev / current / next labels); `MoonOrb` draws the real moon per phase; `formatPhaseEndsAt` / `daysRemainingInPhase` give the time to the next phase.
- Every phase has two things: a **symbol** (what it looks like) and **information** (what it means).
- No mechanical clock time on the clock (it should not hurry anyone). No moon in the centre. No Do now.
- 5-second test without a legend before any UI change ships.

## Default view: two rings (Moon, Week)
| Ring | Phases | Symbol | Information |
|---|---|---|---|
| Moon (outer) | 8, New Moon at top, clockwise | the real moon of each phase (`MoonOrb`) | `MOON_PHASES[i].energy`: first word = phase word, the rest = meaning line |
| Week (inner) | 7, Monday at top, clockwise | the planet as a photo (table below); the chakra colour on the ring track | `PLANETARY_DAYS[i]`: first word of `energy` = day word, `description` = meaning line |

Drawing (one grammar for both rings):
- A thin track per ring. Moon: a light arc from the top to now (`lunar.progress`). Week: 7 track segments in the chakra colours, today's bright and thicker, others ~35%.
- Moon orbs up to the current phase lit, later ones dim. Planets ~75%, today's full.
- The current orb is larger, with a soft glow (moon: warm white; week: today's chakra colour).
- Centre: two words, the moon phase word (large serif) over the day word (smaller).
- Readout beside the dial (below it on phone), one block per ring:
  - `prev symbol + word › CURRENT symbol + word (bold) › next symbol + word`
  - small line: phase name («Waxing Gibbous»; «Sunday · Sun»)
  - meaning line
  - Moon only: «Full Moon in 1 d 21 h» (next phase name + time left). Week shows no time left.
- «+ Year and day» toggle under the readout, collapsed by default, choice remembered (localStorage), like a basic vs scientific calculator. Expanded adds, in the same grammar: Year (outer ring, 4 seasons birthday to birthday: `SOLAR_HOLONIC` Seeding, Sprouting, Fruiting, Harvest; no birthday → `BirthdayPrompt`) and the part of the day (a thin gold arc). Still no clock time.

## Week: planets and chakras (Sasha 2026-11-21)
| Day | Planet (photo) | Chakra | Colour |
|---|---|---|---|
| Monday | Moon | Third eye | indigo #5b4fc4 |
| Tuesday | Mars | Root | red #c9483c |
| Wednesday | Mercury | Throat | blue #3f84d0 |
| Thursday | Jupiter | Crown | violet #9a62d6 |
| Friday | Venus | Sacral | orange #e48a3c |
| Saturday | Saturn | Solar plexus | yellow #e8c447 |
| Sunday | Sun | Heart | green #4fb06e |

Planet images: `public/assets/equilibrium/planets/{moon,mars,mercury,jupiter,venus,saturn,sun}.png` (240 px, transparent background). Sources: NASA / ESA public domain via Wikimedia Commons (Mars: OSIRIS true colour; Mercury: «Mercury in true color»; Jupiter: Hubble 2014 full disc; Venus: «Venus globe»; Saturn: Hubble natural colour); Moon and Sun from `public/assets/equilibrium/`. Saturn's rings make its disc small: draw it ~1.7× the other planets' size.

## Words (engine copy; also changes Equilibrium)
- Waxing Gibbous: `Leading` → **`Readying`** («готовить к жатве»): energy `Readying · Prep for harvest · Set up infrastructure · Get the help`.
- Sunday: `Illumination & Celebration` → **`Threshold & Celebration`** (liminal day between weeks); description starts «Between weeks: vision, ceremony, sharing with community. Write, don't send; seed Monday.»

## Where it lives
- Village map: replaces the `MoonDial` dial; the Moon Focus line stays; Do now removed (PR #380).
- Character sheet header `/game/me/overview`: the same component.
- Desktop: dial left, readout right. Phone (~390 px): dial on top, readout below, nothing clipped.

## Done when
A player opens the village map and, without a legend, sees the moon phase and the day of the week with symbol, meaning, previous, next and the time to the next moon phase; «+ Year and day» opens the other two; checked live on desktop and on a phone.

## History
- v0/v1 (2026-11-21): four rings Year · Moon · Week · Day, built in PR #378. Sasha 2026-11-22 10:38: hard to read even for its author; insider glyphs, four grammars, legend only in the mockup.
- v2: one grammar, word labels (rejected: cut pieces, lost the meaning). v3: Equilibrium-style strips with meanings (rejected: must look like cycles). v4: v3 content on two rings. v5: photo planets, chakra track, new words → decided.
- Lessons: reuse Equilibrium before drawing new visuals; 5-second test without a legend.
