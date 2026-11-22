# Biologic Clock: four rings (spec v0)

Sasha, 2026-11-21 16:35 MST, on the four-rings mockup: «чисто как часы персональные биологические, на основании движка эквилибриума, на основном игровом экране». Build in this lunar cycle: the engine, the minimal clock on the main screen and the Equilibrium art already exist; the work is synthesis into one simple visual.
Origin: iconic-mechanics research (Apple Watch rings + Heroes III calendar), GoBY §24 #8. Mockup v0: [four-rings.png](../../02-strategy/research/iconic-mechanics/mockups/four-rings.png) (shape only; it was drawn as filled by acts, which is now dropped).
Mockup v1 (2026-11-21 16:38 MST, real engine values for Sasha, birthday 1985-01-04: year 88% lived, Waxing Gibbous day 11.8, Saturday ♄, 16:38): [on the village map](../../02-strategy/research/iconic-mechanics/mockups/four-rings-v1-village.jpg) · [close-up with reading key](../../02-strategy/research/iconic-mechanics/mockups/four-rings-v1-closeup.png). Every ring starts at the top (birthday, new moon, Monday, midnight) and runs clockwise; lived = dim, left = bright; centre = tonight's moon. Static, not in code.

## What it is
A personal biological clock read at one glance: where I am in my day, week, moon and year, and how much of each is left. Data per person: everyone is born on a different day, so the cycles overlap differently for each player.

## Rules
- Not tied to actions. The rings show time and energy, never progress, scores or streaks.
- One engine: `src/lib/equilibrium-cycles` (`getAllCyclesV2(now, birthday)`). No second calculation.
- One glance: no text needed to read it; labels only on hover/tap.
- Reuse existing art: moon phase images and Sun/Moon orbs from Equilibrium (`MoonOrb`, `SunOrb`, `public/assets/equilibrium/`), the dial geometry of `MoonDial`.

## The four rings (outside in)
| Ring | Source in engine | Shows |
|---|---|---|
| Year | `getSolarState(now, birthday)` | the player's personal year from birthday to birthday; arrow = now; its holonic phases. No birthday yet → `BirthdayPrompt` |
| Moon | `getLunarState(now)` | the real lunar cycle; phases drawn with the Equilibrium moon images; tonight lit |
| Week | `getDayOfWeekState(now)` | 7 segments Monday → Sunday, each a planet with its chakra symbol and colour (table below); today lit |
| Day | local time | the Sun in gold travels the day; the part already lived is dim, what is left is bright |

## Week: planets and chakras (Sasha 2026-11-21)
| Day | Planet | Chakra | Colour (chakra) |
|---|---|---|---|
| Monday | Moon | Third eye (imagination, insight into the week) | indigo |
| Tuesday | Mars | Root | red |
| Wednesday | Mercury | Throat (communication) | blue |
| Thursday | Jupiter | Crown (expansion) | violet |
| Friday | Venus | Sacral | orange |
| Saturday | Saturn | Solar plexus (inner and spiritual power) | yellow |
| Sunday | Sun | Heart | green |

The seven chakra colours make the week a rainbow, so «rainbow» and «planet colours» meet in one palette. Symbol per segment: the planet glyph (already in `PLANETARY_DAYS.symbol`) or the planet itself, plus the chakra sign. Sasha weighed Venus = heart and Sun = crown and chose the table above.

## Where it lives
- Main game screen, where the player spends most time: the village map and/or the character profile; Sasha leans to both.
- Forms to try: a widget; on the village map, a building that really rotates. Even as a village building, the data stays the player's own.
- Replaces or grows from the current `MoonDial` on the village map (one clock, not two).

## Done when
A player with a birthday opens the main game screen and, without reading, sees the day, week, moon and year rings for their own date, with today and tonight lit and what is left of each.

## Decided (Sasha 2026-11-21 18:09 CST, «Да, делай» on mockup v1 and my recommendations)
- Both places: the village map first, replacing the `MoonDial` SVG (one clock, not two); then the same component on the character profile.
- A widget, not a rotating building.
- Week symbols: planet glyphs only (`PLANETARY_DAYS.symbol`), chakra shown by colour; no separate chakra signs.
- Every ring starts at the top and runs clockwise (birthday, new moon, Monday, midnight), as in mockup v1.
- Built through an @claude issue; the exact change is mockup v1.
