# Heroes of Might and Magic III → GoBY (pass 3)

Filled: 2026-11-21 · Status: draft, awaiting Sasha
Earlier passes (not redone here): [heroes-iii.md](heroes-iii.md) (H3-1 town screen, H3-2 Grail), [heroes-iii-pass-2.md](heroes-iii-pass-2.md) (H3-3 editor → constructor, H3-4 hot seat, H3-5 the week).
Lens for this pass: what passes 1–2 left out, read against Sasha's verdicts of 2026-11-21 15:15 ([synthesis.md](../synthesis.md)): the rhythm has four units (day, week, month, year); the constructor of buildings, interiors and villages; the "Create a new digital village" button.
Almanac stage: 2 (Designed Systems), with stage-5 traits (a world that runs on its own clock) · Fidelity: model
One line: Heroes III runs on a calendar where each unit does a different job (day: income, week: growth, month: the world changes), and fills its map with characters who hand out quests, with artifacts that combine into sets, and with a sound for every town.

Standing rules applied to every mechanic (Sasha): (1) a counter/streak/number only where it mirrors a real act; (2) every action in the game is done in the real world, a real person behind every avatar; (3) no raid/battle/group-battle words: "gathering", "Harvest"; (4) no ranking people against each other; (5) no artificial XP; (6) no mush: only concrete decisions; (7) no linear planning or time estimates.

---

## 1. Why it's iconic: facts new in this pass

| Fact | Number | Source, date | Grade |
|---|---|---|---|
| The calendar | days, weeks of 7 days, months of 4 weeks; no year unit. A day = one turn for every player; "once all players have had their turn, the current day ends" | [1] Heroes 3 wiki, Time | B (rules as shipped) |
| Each unit does a different job | day start: mines and towns add resources; week start (day 1): every dwelling grows creatures; month start: artifact merchants restock, special month possible | [1], [2] | B |
| Named weeks and months | each week "astrologers proclaim" a week; 25% chance it is a creature's week (+5 growth), 75% a joke animal (Aardvark, Badger…); special month 40% (doubles available creatures, title creatures appear on 0.5% of free tiles); plague 10% (one of the special months) | [2] Heroes 3 wiki, Growth | B |
| What you don't recruit | in towns it stays and accumulates; in map dwellings it was lost in the original, kept "indefinitely" in HotA | [2] | B |
| Quests from map characters | Seer's Hut: a character on the map gives a quest; you fulfil it and come back; revisiting before done gives more hints; one hut can hold a chain of quests (next opens when the previous is done). Restoration of Erathia: 1 quest type; Armageddon's Blade: 9 types; HotA: repeatable quests in custom order; random maps generate huts automatically | [3] Heroes 3 wiki, Seer's Hut | B (feature facts) / C (popularity) |
| Gates that open on a condition | Quest Guard: blocks the path until the quest is fulfilled, then disappears; one type is "return at/after a specific date" | [4] Heroes 3 wiki, Quest Guard | B |
| Combination artifacts | added in The Shadow of Death (2000); equip all pieces, combine into one; pieces keep their bonuses, the set adds its own; 13 sets in SoD, 4 more in HotA | [5] Heroes 3 wiki, Combination artifact | B |
| Music per town | composer Paul Anthony Romero wrote one theme per town (Castle, Rampart, Tower, Inferno, Necropolis, Dungeon, Stronghold, Fortress, Conflux) | [6] Meduza 2024-03-10; [7] heroescommunity tracklist | B |
| Town themes live on | YouTube uploads of single town themes: Fortress 378K views, Rampart 365K (both ~17 years old) | [8] YouTube playlist, read 2026-11-21 | C (view counts, unaudited) |
| Concerts | Heroes Orchestra (Warsaw, students of the Chopin University of Music) since 2017; 5-concert festival for the 25th anniversary (2024) with Romero; Szczecin Philharmonic 2025-04-28; Romero with LUMOS Orchestra in Lviv (2023-06-26) and Kyiv (2023-07-01/02); first fan concert Budapest 2011 (~100 fans) | [6], [9], [10], [11] | B |
| Russia | Buka's localisation sold ~500,000 copies; the real audience was larger because of hot seat and computer clubs | [6] Meduza | C (journalist figure, no primary source) |

Share of the iconic credited to the mechanics below: **part.** *Judgment:* the calendar is part of the core loop the press credits ("one day follows another, every week your army grows", Meduza [6]); music is named by Meduza as "an important component of success"; quests and combination artifacts are map-making tools that feed the 27-year map culture of pass 2. None is isolated by data.

---

## 2. Mechanics that demonstrably worked

### H3-6. The calendar: four nested units, each with its own job (Sasha: day, week, month, year)
- **In the source:** one clock for everyone. **Day** = your move; at its start, what you own pays out (mines, towns). **Week** = growth; on day 1 every dwelling adds creatures, and what you did not take stays (in towns). **Month** = the world changes; merchants restock, a special month can double growth or bring plague. Weeks and months get names. There is no year: games end inside months. The designer's choice that matters: **each unit triggers a different kind of event**, not the same check-in at four sizes [1][2].
- **Evidence it worked:** C for the calendar as a cause of the iconic (Meduza names it as the core loop [6]; the "week of the X" phrase is widely remembered, pass 2). B that it is unchanged in HotA 27 years on [2].
- **Driver (why it works):** the **fresh start effect** of temporal landmarks, grade **A** (Dai, Milkman & Riis 2014, three field datasets) [12]. Measured separately for each unit:

| Landmark | Gym visits (11,912 students, 5.27M person-days) | Commitment contracts on stickK (66,062 contracts, 43,012 users) | Google "diet" searches (3,104 days) |
|---|---|---|---|
| start of week | +33.4% | +62.9% | +14.4% |
| start of month | +14.4% | +23.6% | +3.7% |
| start of year | +11.6% | +145.3% | +82.1% |
| after a birthday | +7.5% (non-21st) | +2.6% | — |

  The effect holds for career, money and relationship goals, not only health (health-irrelevant contracts, Models 11–16) [12]. Placebo searches (laundry, gardening) show no such pattern [12]. Motivation **decays gradually** through each week, month and year [12]. People divide their time into day, week, month, semester when asked (Soster et al. 2010, cited in [12]). The authors also warn: an *anticipated* landmark can license delay ("I'll start after my birthday") [12].
- What it did NOT prove: that a game calendar creates landmarks on its own. The study measures real calendar landmarks. *Judgment:* that is exactly why our calendar must be the real one (real days, the real moon, the real birthday), never an in-game clock.

### H3-7. Quests given by characters on the map (Seer's Hut)
- **In the source:** a character in a place on the map gives one quest with an exact done-when ("return with…", "be a specific hero…"). You do it elsewhere and come back to the same person; on the way you can ask for hints. One hut can hold a chain. The map-maker places huts and writes their text in the editor [3]. Quest Guard is the same object as a gate [4].
- **Evidence it worked:** C (a staple of fan maps; the random map generator places huts by default [3]). B that the object was expanded in every expansion (1 → 9 quest types → repeatable chains in HotA) [3].
- **Driver:** **implementation intentions**, grade **A**: plans that spell out *when, where and how* raise goal attainment, d = .65 across 94 tests, 8,461 participants (Gollwitzer & Sheeran 2006) [13]. A hut's quest is an if-then plan tied to a place and a person. *Judgment:* returning to the same person adds a real relationship; not measured here.

### H3-8. Combination artifacts: pieces that become one
- **In the source:** several artifacts found separately combine into one named artifact; each piece keeps its own effect, the set adds a new one; it can be taken apart again [5].
- **Evidence it worked:** C (well-known sets such as Angelic Alliance; no data on play).
- **Driver:** **goal gradient**, grade **A** (Kivetz, Urminsky & Zheng 2006, real café reward program): purchase intervals shortened by ~20% as customers neared the reward; a 12-stamp card with 2 stamps given completed faster than a blank 10-stamp card; and after a reward people **reset**, slowing down again [14]. A visible set with empty slots is a card with stamps.

### H3-9. Every town has its own music
- **In the source:** one composed theme per town, playing while you are in it [6][7]. The town's music is part of its identity, together with its look and creatures.
- **Evidence it worked:** B that the music lives outside the game (orchestra founded by fans 2017, multi-country concert tours with the composer 2011–2025 [6][9][10][11]); C that it explains the iconic (Meduza: "an important component of success" [6]).
- **Driver:** **music-evoked autobiographical memory**, grade **A** (lab and online study, Janata, Tomic & Rakowski 2007): on average 30% of song presentations evoked autobiographical memories; emotions mostly positive; nostalgia the third most common [15]. Music binds to the time and place it was lived in. What it did NOT prove: anything about game music specifically.

---

## 3. Canon filter

| Check | H3-6 Calendar | H3-7 Map quest-givers | H3-8 Sets | H3-9 Music per place |
|---|---|---|---|---|
| §10a fidelity: shows something true? | **Pass with change:** the calendar is the real one (days, weeks, the real moon, the player's birthday); every unit opens and closes with the player's own real act | **Pass with change:** the quest-giver is a real villager at their real place; "coming back" = that person confirms | **Pass:** each piece = a quest really passed | **Pass with change:** the music is by real villagers (local musicians), credited, linking to their stall |
| §21.2 real counterpart | calendar, moon, birthday | a practitioner, their session, their place | real milestones of one chapter | a musician and their work |
| Rule 1: number mirrors a real act | the only marks: the step named and the step done; the month's QoL re-read is already monthly (§22.5). **No counter of rituals attended** | "N people did my quest" = N confirmations by the giver, owner-only. No ranking of givers | "3 of 5 pieces" = 3 real quests. Allowed | none needed |
| Rule 2: done in the real world | yes | yes: the act happens in the village | yes | the music is played in the village too (Harvest) |
| Rule 3: vocabulary | week opens / Save Point / Harvest | "quest", "gathering" | "set", "chapter" | "the village's theme" |
| Rules 4–5: no ranking, no XP | ok; the random +5 week and plague month are dropped (random numbers, punishment) | source types "defeat a hero/stack" dropped | sets open things, never give power (§23.5) | ok |
| §15.8 new facet / verb | no new verb; it gives the **form** to §21.5 ("form open") and §15.7a two loops | **new verb: give a quest** (a villager authors one for others) | no new verb; structure for §23.2 artifacts | new facet: hearing a place |
| Already in canon? | **Mostly:** §10 weekly Save Point + seasonal re-take; §15.7a moon (macro) + sun (daily) loops; §21.5 week & moon arc; A9 Equilibrium clock (live); A13 daily act; H3-5. **Adds:** the year unit, the rule "one job per unit", named weeks/months from real things, and the decay/delay design | **Partly:** §23.4 village quests ("buy 3 sessions from 3 people → artifact"), verification left open. **Adds:** the object (a quest pinned to a person's place), the confirmation by that person (closes §23.4's open question), hints, chains; authorable in the constructor | **Partly:** §23.2 seasonal rares, §23.5 physical item after a completed chapter. **Adds:** visible chapter set with empty slots; combining unlocks the physical-edition right | **Partly:** A8 "radio for each space" (status none). **Adds:** whose music it is (villagers'), and that every new digital village gets its own theme |

Verdicts: **H3-6 pass with change** (real calendar only, one job per unit, no random events). **H3-7 pass with change** (real villager, confirmation by them, no combat types). **H3-8 pass.** **H3-9 pass with change** (local musicians, credited; licensing is a real constraint).

---

## 4. Where it lands in our game

| Mechanic | Village place (§13.1) | Journey (§14.2) / canon | Spec row | New row needed? |
|---|---|---|---|---|
| H3-6 Calendar | Your House (A9 clock) + Fire Circle (new moon) + Harvest (full moon) | §10 Save Point, §15.7a, §21.5, §22.5 monthly level | **A9** (clock) + **A13** (day) | **Yes, one row** "Rhythm: day / week / month / year" (or extend A9's done-when). Absorbs H3-5 |
| H3-7 Quest-givers | Quest Board + each practitioner's building/stall on the village map | §23.4 village quests; constructor (H3-3 direction) | C7 (world-building buttons) + A7 (clients) | **Yes, one row** "Village quest: a villager pins one quest to their place; done when they confirm" |
| H3-8 Sets | Your House shelf | §23.2, §23.5 | **A12** (badges/shelf) | No: extends A12's done-when |
| H3-9 Music | every village place; each new village | A11 real village; "Create a new digital village" | **A8** (radio per space) | No: fills A8's done-when |

---

## 5. Our version

**H3-6. One real calendar, four units, four different jobs.** The design rule taken from Heroes: each unit triggers a different kind of event, so the four never feel like four check-ins.
- **Day = act.** One real act extends the day (A13 as specced: named by the player, "Day 12: wrote to a client"). Heroes' daily income maps to what the day actually brought (a reply, a client, money), which the player may note in one line; nothing is counted for them.
- **Week = growth.** Monday opens one named real step; Sunday's 60-second Save Point closes it (§10, H3-5). What you didn't do stays for next Monday, as unrecruited creatures stay in town. The village may name its week after the shared step its ambassador sets ("the week of naming a price"): a week named by a real act, never by an astrologer.
- **Month = the world changes, by the real moon** (~29.5 days, close to Heroes' 28-day month). New moon: intention and a quiet circle. Full moon: the Harvest gathering where stalls are shown in person (§16.3, PG-2), and the Market's offers are refreshed for the month (Heroes restocks merchants on day 1 of the month). The private QoL level is re-read monthly (§22.5). The month carries the moon's own name and phase (Equilibrium's phases), so every village on the world map shares the same month and the same Harvest night.
- **Year = the chapter.** Two real landmarks, the player picks one: the calendar New Year (the strongest landmark in the data: commitment contracts +145.3%) or their own birthday. The year opens with one intention and closes with the before/after map and the year's objects in the House; a completed chapter is what unlocks the physical edition (§23.5, H3-8).
- **Against delay:** the day is always open. No unit asks the player to wait for the next landmark to start; any day can begin the week's step.
- Fact for Sasha, no proposal attached: the launch window in the spec, "early January 2027, after 2027-01-04", sits on the year's strongest fresh-start landmark.
- Open for Sasha: canon §10 also names **seasons of ~6 weeks** with a seasonal re-take. Four units (day, week, month, year) or five (with season)? I don't decide this.

**H3-7. A villager pins a quest to their place.** In the constructor, a practitioner who has a building/stall on the village map can attach one quest to it, written by them: what to do, where, and done when ("Come to my Saturday sound bath and tell me one thing you noticed"). A player takes it at that place, does it in real life, and the practitioner confirms it from their shop (this closes §23.4's open question "how a real-life action is verified"). Revisiting before done shows the giver's hint. A practitioner can chain quests: the second opens when the first is confirmed. The giver sees one owner-only number: how many people did their quest. Sasha's example ("buy 3 sessions from 3 different people → artifact") becomes three huts and one set (H3-8). Quests are reviewed like player-written quests (pass 2 waiting shelf) before going live.

**H3-8. Chapter sets.** On the House shelf, each chapter of the quest line (§23.1) shows its pieces as faint slots. Each passed quest fills one. When all are filled, the pieces combine into the chapter's artifact (one of Sasha's designs); the pieces keep their meaning. The combined artifact opens the right to order the real piece (§23.5); it gives no power. Because people slow down right after a reward (the reset in [14]), the next chapter's faint slots appear the moment a set combines (H3-1's empty ground).

**H3-9. Each place sounds like its village.** A8's radio plays music by the village's own musicians (San Pancho first), credited by name with a link to their stall. Each place has its theme. When someone presses "Create a new digital village", one of the founding steps is choosing the village's theme from its own musicians. The same track plays at the full-moon Harvest, so the music ties to a night people really lived (the memory effect in [15]).

---

## 6. Smallest testable version

**H3-6 (first: it is Sasha's key and organises A9, A13 and H3-5).**
- **What:** no code. One cohort lives one real lunar month on the four-unit form: daily act line (A13 as text), Monday step + Sunday Save Point, new-moon intention, full-moon Harvest reading of stalls, month close with the QoL re-read. A paper or chat version of the Equilibrium clock.
- **Who:** 5–10 players from the pilot cohort (San Pancho).
- **Signal:** share of named weekly steps reported done by Sunday, and whether it holds across the month's weeks (the study predicts decay inside each period; the monthly opening should lift the week after new moon). Plus one question at the month's close: which of the four felt like a chore?
- **Kill line:** any unit that most players call a chore and that shows no lift in done steps is cut from the form.
- **Depends on:** A9 (live), A13 (spec'd, not built), Save Point (§10, not built). Nothing new for the test.

**H3-7.** One San Pancho practitioner writes one quest for their place; 10 players see it on the Quest Board. **Signal:** completions the practitioner confirms, and whether the practitioner wants to write a second. **Kill line:** fewer than 2 of 10 complete, or confirming feels like a burden to the practitioner. **Depends on:** A7 (clients), a Quest Board slot; no storage for the test.

**H3-8.** Fold into the H3-1 House mock: one chapter shown as a set (e.g. 2 of 4 slots filled) vs. a plain shelf. **Signal:** share who start the next quest in the same session. **Kill line:** no difference across 8 players. **Depends on:** A12.

**H3-9.** One local musician's track as the Village theme in the app and at one live Harvest. **Signal:** taps from the credit to the musician's stall; the musician's own wish to continue. **Kill line:** no taps and no wish. **Depends on:** A8 (none); the musician's written permission.

---

## 7. Risks and anti-patterns
- **Ritual overload (H3-6):** four units can become four chores. The "one job per unit" rule and the chore question in the test exist for this.
- **License to delay (H3-6):** landmarks can make people wait for Monday or the new moon [12]. The day stays open; carry-over, never "start next week".
- **Calendar as guilt (H3-6):** no counter of missed Save Points or Harvests; a missed week is weather, not a score (§10 Current vs Peak spirit).
- **Random events (H3-6):** Heroes' plague and lucky weeks are random numbers with no real act. Not imported.
- **Quests as ads (H3-7):** a practitioner's quest can become a sales funnel. Review shelf before live; the quest must be something the giver really does with people, not a discount.
- **Burden on givers (H3-7):** confirmation must be one tap from their shop, or givers stop.
- **Set grind (H3-8):** if pieces could be bought or farmed, the set becomes a collection game. Pieces only from real quests (§23.5).
- **Reset slump (H3-8):** motivation drops after a set combines [14]. Next slots appear at once.
- **Music rights (H3-9):** only tracks the musician licenses to the village; credit always; never royalty-free stock dressed as local.

## 8. Priority
Impact (1–3) × Confidence (1–3) × Ease (1–3); High ≥ 18, Medium 8–17, Low ≤ 7. Sasha sets the order.
- **H3-6 Calendar:** Impact 3 (Sasha: key; organises A9, A13, Save Point, Harvest) × Confidence 3 (grade A field data measured on exactly these units, including career and money goals; unlike pass 1, the driver is not an analogy) × Ease 2 (A9 live; A13 and Save Point not built) = **18 → High**. Absorbs H3-5 (Medium, 8).
- **H3-7 Quest-givers:** Impact 3 (makes §23.4 village quests buildable and verifiable; revenue to practitioners; a concrete piece of the constructor) × Confidence 2 (driver A, mechanic C) × Ease 2 (needs a quest object and a confirm action) = **12 → Medium**.
- **H3-8 Sets:** Impact 2 × Confidence 2 (driver A, mechanic C) × Ease 3 (layout on A12's shelf) = **12 → Medium**.
- **H3-9 Music:** Impact 2 × Confidence 2 (driver A, concert life B, causation C) × Ease 2 (sourcing, permission) = **8 → Medium (low end)**.

### Dropped, one line each
- **Fog of war / exploration:** already canon (§10a point 5: fog of war = the next stage's description).
- **Seven resources and mines you flag:** a fictional economy; our resources are real (assets, J5). The daily payout idea is folded into H3-6's day.
- **External dwellings you revisit weekly to collect:** a collect-or-lose loop with no real act (original game lost what you didn't take). Folded into H3-6's carry-over.
- **Obelisks + puzzle map to the Grail:** the Grail is already canon (first sale, H3-2); a puzzle reveal adds no real act unless each piece is a real visit, which is H3-7.
- **Neutral creatures offering to join:** depends on army strength, i.e. power over others (rule 4).
- **Taverns and rumors:** hiring heroes has no counterpart; rumors are random text. The Café already holds meeting.
- **Heroes with specialties and biographies:** already canon (specialty = top talent, J1; real photo and profile).
- **Campaigns and their story:** already canon (§23: Sasha's own path is the quest line).
- **Quest Guard as its own object:** already canon as the lock rule (§14.3); its date type ("return after a date") is the Harvest window (PG-2).
- **Random named weeks, special months, plague:** random numbers and punishment (rules 1, 5).
- **Why it holds up 27 years (HotA, lobby):** covered in pass 2 (H3-3).

## 9. Sources (read 2026-11-21 unless stated)
1. Heroes 3 wiki, "Time": https://heroes.thelazy.net/index.php/Time
2. Heroes 3 wiki, "Growth" (special weeks and months, last edited 2026-09-23): https://heroes.thelazy.net/index.php/Creature_growth
3. Heroes 3 wiki, "Seer's Hut": https://heroes.thelazy.net/index.php/Seer%27s_Hut
4. Heroes 3 wiki, "Quest Guard": https://heroes.thelazy.net/index.php/Quest_Guard
5. Heroes 3 wiki, "Combination artifact" (last edited 2026-07-04): https://heroes.thelazy.net/index.php/Combination_artifact
6. Meduza, «Если бы не муж, я бы не написал этот саундтрек», 2024-03-10: https://meduza.io/feature/2024/03/10/esli-by-ne-muzh-ya-by-ne-napisal-etot-saundtrek
7. Heroes Community, "Melodies of Might and Magic" (tracklist): http://heroescommunity.com/viewthread.php3?TID=44864
8. YouTube playlist "Heroes of Might & Magic III music" (view counts as shown): https://www.youtube.com/playlist?list=PL5BBE5BFFDE86918D
9. Heroes Orchestra: https://heroesorchestra.com/en ; Narodowe Centrum Kultury, Szczecin concert 2025-04-28: https://nck.pl/en/projekty-kulturalne/polish-presidency/news/the-heroes-orchestra-will-take-szczecin-to-the-world-of-heroes-of-might-and-magic-
10. FilmMusic.pl, Heroes Orchestra interview (25th-anniversary festival, 5 concerts), 2024-04-19: https://filmmusic.pl/artykuly/an-interview-with-heroes-orchestra/
11. SoundTrackFest, Romero & LUMOS Orchestra, Lviv 2023-06-26, Kyiv 2023-07-01/02: https://soundtrackfest.com/en/micro/heroes-of-might-and-magic-iii-in-concert-paul-romero-lumos-orchestra/
12. Dai, Milkman & Riis, "The Fresh Start Effect", Management Science 60(10), 2014 (pages read: Studies 1–3, Discussion, Limitations): https://faculty.wharton.upenn.edu/wp-content/uploads/2014/06/Dai_Fresh_Start_2014_Mgmt_Sci.pdf
13. Gollwitzer & Sheeran, "Implementation Intentions and Goal Achievement: A Meta-analysis", Advances in Experimental Social Psychology 38, 2006: https://doi.org/10.1016/S0065-2601(06)38002-1 (figures from the abstract and Results excerpt)
14. Kivetz, Urminsky & Zheng, "The Goal-Gradient Hypothesis Resurrected", Journal of Marketing Research 43(1), 2006: https://home.uchicago.edu/ourminsky/Goal-Gradient_Illusionary_Goal_Progress.pdf (read in full text: interpurchase times decrease by 20%, .7 day, first to last stamp; "postreward resetting" to a lower rate after the first reward)
15. Janata, Tomic & Rakowski, "Characterisation of music-evoked autobiographical memories", Memory 15(8), 2007 (abstract): https://doi.org/10.1080/09658210701734593

---

## Proposed registry rows (not added to registry.md; for Sasha's yes)

| ID | Game | Mechanic | Driver (why it works) | Evidence | Our place (village · Journey) | Spec row | Priority | Status |
|---|---|---|---|---|---|---|---|---|
| H3-6 | Heroes III (pass 3) | Real calendar, four units with four jobs: day = one real act; week = Monday step / Sunday Save Point, carry-over; month = real moon, new-moon intention, full-moon Harvest, Market refresh, QoL re-read; year = New Year or birthday, chapter close. Absorbs H3-5 | fresh-start effect per unit (A: gym week +33.4%, month +14.4%, year +11.6%; stickK week +62.9%, month +23.6%, year +145.3%) | C mechanic · A driver | Your House (A9 clock), Fire Circle, Harvest · §10, §15.7a, §21.5, §22.5 | A9 + A13; new row "Rhythm" or extend A9 | High (18) | analysed → proposed. Open: season (~6 weeks, §10) as a fifth unit? |
| H3-7 | Heroes III (pass 3) | Seer's Hut → a villager pins one quest to their place in the constructor; done when they confirm; hints, chains | implementation intentions (A: d = .65, 94 tests) | C mechanic · A driver | Quest Board + practitioner's building · §23.4 village quests | C7 + A7; new row "Village quest" | Medium (12) | analysed → proposed |
| H3-8 | Heroes III (pass 3) | Combination artifacts → chapter sets on the House shelf; combined set opens the physical edition right; next slots appear at once | goal gradient (A: ~20% faster near reward; reset after reward) | C mechanic · A driver | Your House shelf · §23.2, §23.5 | A12 | Medium (12) | analysed → proposed |
| H3-9 | Heroes III (pass 3) | Music per town → A8 radio plays the village's own musicians, credited, linked to their stall; each new digital village chooses its theme | music-evoked autobiographical memory (A: 30% of songs) | B concerts · C causation · A driver | every place; "Create a new digital village" · A11 | A8 | Medium (8) | analysed → proposed |
| H3-5 | Heroes III (pass 2) | (update) merged into H3-6 | — | — | — | — | — | accepted in direction → merged into H3-6 |
