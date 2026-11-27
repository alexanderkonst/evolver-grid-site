# Game navigation: integral holonic synthesis (v0)

Template: integral-synthesis (first application). Evolver (Hark), 2026-11-24. Status: draft for Sasha. Nothing here is canon; nothing changes in code, title screen, intro, reveal, themes or game entry without his yes to the exact change. Player path v1 draft is used as a hypothesis only.

**One sentence (prism):** Navigation is one world seen at nested scales, where every screen answers the same three questions once (where am I, what is the one next move, how do I get home) and the world itself fills with light as the player lives.

Corpus: 40+ titles in 5 dossiers (all cited, graded A/B/C): [heroes-civ](./exemplars/heroes-civ.md) (HoMM I–VI, Civ I–VII), [rts-sims](./exemplars/rts-sims.md) (Warcraft I–III, StarCraft I–II, SimCity, Sims 1–4), [rpg](./exemplars/rpg.md) (Mass Effect 1–Andromeda, Fallout 1–76, Cyberpunk 2077), [diablo-lba-allods-journey](./exemplars/diablo-lba-allods-journey.md) (Diablo I–IV, LBA 1–2 / Twinsen's Odyssey, Allods 1–2, Journey), [auteurs-theory](./exemplars/auteurs-theory.md) (Zelda BotW/TotK, Souls/Elden Ring, Ico/SotC, Myst, Outer Wilds, Hollow Knight, Disco Elysium, Animal Crossing, Stardew, Minecraft, Half-Life/Portal, Death Stranding, Hades; Lynch, diegetic UI taxonomy, Hodent, cognitive maps). Current state of our game: [nav_map_v0.md](./nav_map_v0.md).

Evidence honesty: almost all evidence is C (designer intent, critical consensus) and B (sales, telemetry, patch reversals). Grade A exists for two claims only: a drawn path or minimap beats a compass or beam for finishing a route (Peacocke et al. 2018), and turn-by-turn guidance erodes the player's own mental map (GPS research). Sales prove reach, not that navigation caused success.

---

## 1. Invariants (what every navigation must solve)

Derived by common denominator from Q1–Q10 across all dossiers; each passed the tests: present in most exemplars, solved in different ways, its absence draws documented complaints, true outside games (Lynch's city), not derivable from another.

| # | Invariant (the player's need) | Common denominator in the corpus | Worst failure seen |
|---|---|---|---|
| I1 | **Where am I in the whole?** | one map at 2–3 zoom levels with a visible "you are here" box (minimap rectangle, HoMM View World, ME galaxy→system, LBA planet→island) | SimCity 2013 cannot zoom out; Sims 4 loading screens per lot |
| I2 | **What can I enter, and what opens the rest?** | soft, readable gates: you see the closed place and why (Civ tech tree, Outer Wilds "zero gating", ME hollow icons, Souls difficulty) | locked doors with no reason; Civ VII hidden outcomes |
| I3 | **What is the one next move, and why?** | one pull, not a list: Journey's mountain, SotC sword beam, Zelda triangle rule, Civ "End Turn" that changes colour, HoMM Next Hero | Cyberpunk launch "one quest per block", Diablo IV "30 flags", Elden Ring no log |
| I4 | **What will it cost and give before I commit?** | preview before commit: HoMM green/red path arrows with turns, Civ turns-to-tech, SC2 mission pitch (who asks, reward, unlocks) | Civ VII hidden yields (modders fixed it) |
| I5 | **What changed since I was last here?** | told at home: Hades' House changes every return, Animal Crossing, SC2 Hyperion news after each mission, HoMM "Astrologers proclaim" week start | the worst-solved question in RPGs (rpg dossier, pattern 9) |
| I6 | **What have I done, where have I been?** | the world itself fills in: discovered places fill, waypoints, Allods' old chart redraws, Lunar colour return | quest log that loses steps (ME3 regression) |
| I7 | **How do I get home safely?** | one fixed home node that saves, heals and means something (bonfire, bench, town portal, Normandy, House of Hades); one tap, keeps your place | friction home trips (Diablo III/IV debates) |
| I8 | **How do I switch modes without getting lost?** | few modes, always legible, safe switch (Sims pauses in Build, Allods never mixes screen types, LBA pauses for behaviour choice) | HoMM V free camera hid objects; Sims 3 lag |

Conditional (not core for us now): **I9 What needs me right now?** (alert queue: idle worker, minimap ping, Civ III message sorting). Becomes core when village quests and circles have real incoming requests.

Rejected as invariants: "how do I get there" as a route (for a web game, distance collapses to one click; it survives only inside I4 as cost in time/effort).

## 2. The most successful solutions (kept)

| Solution | Serves | Evidence | Why it works |
|---|---|---|---|
| S1 Master map at a known safe place (ME galaxy map on the ship, Pip-Boy, Diablo town) | I1, I7 | C, kept in every sequel | the whole lives where you are safe; seeing the whole is a ritual, not a popup |
| S2 Same map folded (minimap ↔ full map, same grammar) | I1, I8 | C + A (minimap beats compass) | no translation between two pictures of the world |
| S3 One pull forward (landmark / beam / glowing next) | I3 | C; A caveat: a subtle beam alone loses players, make it unmistakable | bearing, not route: keeps the player's own map alive (A, GPS research) |
| S4 Readable closed places ("opens when / inside") | I2 | C (Civ tree, Outer Wilds), B (Civ VII path reversal) | desire plus a reason; a graph of possibilities, not a rail |
| S5 Pitch before commit (result, cost, what it unlocks) | I4 | C (SC2, HoMM), B (Civ VII mod uptake) | commitment with eyes open; no regret clicks |
| S6 Home that changes on return | I5, I7 | C (Hades, Animal Crossing, SC2) | "what's new" has one address |
| S7 Earned map: the world fills as you live | I6 | C (Zelda towers, Hollow Knight, Allods), our canon §14.11 | progress shown in the world, never in numbers |
| S8 Few modes, one look per mode | I8 | C, B (HoMM VI reverting V's camera) | the player always knows what kind of screen they are on |
| S9 Path as a constellation, not a ladder (Civ tech tree; Outer Wilds ship log holds only what you know) | I3, I6 | C, B (Civ VII Legacy Paths removed as "railroady") | shows direction and freedom at once |
| S10 Subtraction until it gets out of the way (Wright's 11 Sims UI passes, Wyatt, Ueda) | all | C | every extra element steals from the one pull |

Rejected for us: fast travel networks (web is already instant), alerts/minimap pings now (I9 conditional), free 3D camera, quest log as a long list (Elden Ring vs ME3 shows both extremes fail; our answer is S9).

## 3. Organizing principle

**One world, three answers, one home.** Every screen at every scale answers once: where am I (in the whole), what is the one next move (and what it gives), how do I get home. Everything else is the world itself: places, light, faded doors.

This is GoBY §14.1.1–2 ("one world, one map, one menu; the Journey is the spine") made testable. Check: each kept solution is derived from it (S1–S2 = where; S3–S5, S9 = next; S6–S7 = home and memory; S8, S10 = keep the answers legible).

## 4. Holonic reassembly (same grammar at every scale)

| Scale | Where am I | One next move | Home | Already in code? |
|---|---|---|---|---|
| **World** (title → village map) | the village map with your house lit | the glowing place + "Your next move" card (result it gives) | title screen is the only door; village is home base | yes (Village.tsx, nextMove) |
| **Place** (a village place) | place name + its light on the rail (map folded) | the place's one open room or quest | "← Village" one tap, always top-left | partly; "← Village" missing on 4 pages (#443) |
| **Module** (Intro → one button → Outro) | eyebrow: place · step | the one button = the result as a verb; Intro pitch shows what it gives and what it unlocks (S5) | Outro → back to village where the next hint waits | partly (§14.5 table) |
| **Moment** (any screen) | one line of where | one primary button | the same back control | varies |

Path view (second projection, I6 + I3): the player path shown as a **constellation** in Your House / Quest Board: steps done are lit stars, the next one glows, closed ones are faint with "opens when". Built on the player path v1 hypothesis only after Sasha reviews it. Not a linear list, no numbers.

Synergy tests: remove the one pull → players wander (Cyberpunk launch); remove home → "what changed" has no address; remove faded doors → the world looks smaller than it is; add a second next move → the pull breaks. The emergent property: the player never asks "what now?", yet still feels free.

## 5. Subtraction pass (what to cut)

1. **Pane 2 (SectionsPanel, old "spaces")**: a second, older map of the same world under other names. It violates S2 and causes the wrong-place bugs in #443. Replace by rooms inside the place scene. (Fork F1.)
2. **My AI as a village place**: by Sasha's 2026-11-24 definition it is a separate company and interface (one chat, deep personalization, activation). In navigation it is a mode outside the world: one quiet global button, not a place on the map. (Fork F2.)
3. **Multiple hints / lists on the village**: already one hint; keep it one.
4. Nothing on the title screen, intro, reveal, themes or entry is touched.

## 6. Fit to canon and current state

| Element | Canon | Delta |
|---|---|---|
| Village = master map, rail = map folded | §14.1.2, §14.6 | none (keep) |
| One next move + what changed | §14.6 | move "what changed" also into Your House on return (S6) |
| Lock rule (open/closed/new/live) | §14.3 | none; add "inside: <result>" consistently everywhere |
| Module form | §14.4 | Intro shows what it unlocks (S5) |
| Colour returns as you play | §14.11 | none; this is S7 |
| Constellation path view | §20, §23, player path v1 (draft) | new, after Sasha's review |
| Pane 2 removal, My AI as global button | new | forks F1, F2 |
| #443 shell bugs | bugs | separate, already with Claude |

## 7. Roast (short) and acceptance test

- **Strongest attack:** "glowing next move" turns the game into a GPS and kills discovery. Answer: it is a bearing (the place), not a route; the whole map stays open; A-grade research supports bearing over turn-by-turn.
- **UL (does it feel true?):** a seeker does not want to be herded. The constellation shows freedom; the pull is an invitation with its result, never an order.
- **LL (would the tribe recognize itself?):** the village map with your house lit is "my place among people", not a dashboard.
- **Risk:** monochrome Lunar may make "faded" vs "open" too subtle (Peacocke: subtle cues lose players). Test contrast.

**Acceptance test:** a first-time player dropped on any screen answers in three seconds, without reading help: where am I, what is my one next move and what it gives, how do I get home.

## 8. Decisions (Sasha, 2026-11-24 22:32 MST; recorded in ui_playbook.md Part X)

- **Where am I: both.** Place in the village (game location) and step on the path (hero's-journey roadmap) are both shown.
- **F1 rejected.** The second pane stays as a key milestone of navigation: it appears at the right moments and is open when the player looks at the order of quests. Section 5 item 1 is withdrawn. Open to better solutions from this research.
- **F2 accepted, upgraded.** My AI leaves the map and becomes a carried instrument that opens natively and smoothly from anywhere, like the Pip-Boy.
- **Smoothness everywhere:** the interface should feel like an ancient mystical instrument.
- **F3** (constellation path view) still waits on his review of player path v1.
