# Heroes of Might and Magic III → GoBY

Filled: 2026-11-21 · Status: draft (worked example of template v1), awaiting Sasha
Almanac stage: 2 (Designed Systems: the player authors a strategy), with stage-5 traits (a map you explore) · Fidelity: model
One line: turn-based strategy (1999); you grow towns building by building, raise armies, and explore a map with heroes. Sasha's pick: the town screen, where you see your town grow.

## 1. Why it's iconic (facts)

| Fact | Number | Source, date | Grade |
|---|---|---|---|
| Release | Feb 28, 1999 (Windows, NA) | [1] Wikipedia, read 2026-11-21 | B |
| Launch charts | #3 in PC Data weekly US chart for 3 weeks; 2nd best-selling US computer game, March 1999 | [1] | B |
| Critics | GameRankings 87% | [1] | B |
| Series sales | Heroes series 1.5M units by Dec 1999 (3DO) | [1] | B |
| Eastern Europe | localized into Russian and Polish in 1999; hot-seat mode mattered when only 2% of Russian and 7% of Polish households had internet | [1] | B |
| Still alive 27 years on | fan expansion Horn of the Abyss since 2011, major update Jan 1, 2024; original composer and designer support fan mods | [1], [2] | B |
| Money from nostalgia | board game Kickstarter (2022): £2.6M, 6,000% of a £43,000 goal | [1] | B |
| Publisher bets again | Ubisoft announced Heroes III Remake in 2026, for 2027 | [1] | B |
| Active online play | fan site counts 5.47M ranked games, 210,077 players in the HotA lobby (as of Nov 11, 2026) | [5] fan site, single maker | C |

Share of the iconic credited to the mechanics below: **part**. *Judgment:* the iconic rests on several things at once (nine distinct factions, music, hot-seat with friends, map editor [4]). The town screen is one of them; nobody has isolated it.

## 2. Mechanics that demonstrably worked

### M1. The town screen: you see every building you build
- **In the source:** the town view takes most of the screen; "any structures or upgrades you build in this town will appear here" [3]. One structure per town per day [6]; buildings have prerequisites (dwellings must be built in order) [7]. The empty ground is visible, so the next building is already imaginable.
- **Evidence it worked:** grade **C** for the screen itself (it is the iconic image of the game, the board game keeps a Town Board that fills with building tiles [7], fan memory). No study isolates it.
- **Driver:** the **endowed progress / goal-gradient** effect, grade **A**: in a field experiment with 300 car-wash loyalty cards, 34% finished a 10-stamp card that started with 2 stamps vs 19% for a blank 8-stamp card; same 8 purchases, and the head-start group also came back faster [8]. A visible half-built thing reads as *continuing*, not *starting*. Plus the felt pride of seeing one's own work in place (*Judgment*, not verified with a study here).

### M2. The Grail: one rare find becomes a permanent building
- **In the source:** some maps hide the Grail; carried to a town, it builds a permanent structure with large bonuses [1].
- **Evidence it worked:** grade **C** (a memorable set piece; no data).
- **Driver:** a rare, earned, permanent mark of a peak moment (*Judgment*).

## 3. Canon filter

| Check | M1 Town screen | M2 Grail |
|---|---|---|
| §10a fidelity | **Pass with change:** every object must be a real result (talent, mission, phrase, price, first sale), never a bought decoration. The endowed head start must be real too: J1's reveal already built the frame | **Pass:** the first real sale is the Grail; already the "lamp lights" moment (§14.12) |
| §21.2 real-life counterpart | Each object = an artifact made in life (§23.5) | First paying client |
| §15.8 new facet/verb | The House shows all facets in one place; no new verb, it is the *place where results land* (§15.8 q5) | New verb: being paid |
| Almanac design rule | Unit = the player's uniqueness; no points; ok | ok |

Verdicts: **M1 pass with change. M2 pass**, and it already exists in canon (J12 lamp, §22.6 sacred objects), so it adds only the framing.

## 4. Where it lands

| Mechanic | Place (§13.1) | Journey (§14.2) | Spec row | New row? |
|---|---|---|---|---|
| M1 Town screen | Your House (§14.7) + your stall in the Market (§14.12) | every step J1–J12 installs one object | **A12** badges/shelf; **A5** stats cards sit in the same scene | No: extends A12's "done when" |
| M2 Grail | Market → Town Hall opens | J12 First sale | A7 (clients) + A12 | No |

## 5. Our version

**M1.** Your House is a *scene*, not a list. Twelve places in it (one per Journey step) are visible from day one as faint outlines with their "Opens when… Inside: …" line (the lock rule, §14.3). Each completed step installs its object in its spot, in your soul colors: the post with your talent carved on it, the banner with your mission, the signboard with your tagline, the price tag, the lamp. After the reveal (J1) the House is never empty: the frame and the first object stand, so the player continues rather than starts (endowed progress, earned for real). One glowing outline is always the next move (§14.6). Order is flexible, skipping is not (§21.1). This mostly *joins* what canon already decided (§14.7, §14.12 stall, §21.3 "artifacts installed in the house"); what Heroes adds is the single picture that fills up, and seeing the empty ground on purpose.

**M2.** The first sale is our Grail: the only object you cannot get from the game, only from a client. It lights the lamp, colors your house on others' maps and opens Town Hall (already §14.12). Framing for copy and the Outro: "the one thing the village cannot give you".

## 6. Smallest testable version (M1)
- **What:** a static mock of the House scene: 12 outlines, 2 filled from a real J1 result, the next one glowing; vs the current list-style sheet. No backend.
- **Who:** 5–8 players in a playtest (Sasha's circle or San Pancho).
- **Signal:** share who click the glowing outline and start J2 in the same session, scene vs list.
- **Kill line:** no visible difference across 8 players → keep the list, drop the scene.
- **Depends on:** A12 (badge in Outro + shelf, partial in code). No new storage.

## 7. Risks and anti-patterns
- **Decoration grind:** objects that can be bought or farmed break §10a. Only real results.
- **Fake head start:** pre-filled spots that the player did not earn = a lie. The endowment must come from J1.
- **Clutter:** 12 objects + 4 stats cards + crystal in one scene can drown the one next move. Test on a phone first.
- **Vanity house:** the house shown to others becomes status. Canon already limits what others see (§14.7 q5).
- **Theme drift:** the scene must work in Lunar (silver until earned, §14.12) and the other skins on tokens.

## 8. Priority
- M1: Impact 3 × Confidence 2 (driver A, mechanic C) × Ease 3 (attaches to A12, already partial) = **18 → High**.
- M2: Impact 2 × Confidence 1 × Ease 3 (framing only) = **6 → Low** (copy pass when J12 is built).

## 9. Sources (read 2026-11-21)
1. Wikipedia, "Heroes of Might and Magic III": https://en.wikipedia.org/wiki/Heroes_of_Might_and_Magic_III
2. Wikipedia, "Heroes of Might and Magic III: Horn of the Abyss": https://en.wikipedia.org/wiki/Heroes_of_Might_and_Magic_III:_Horn_of_the_Abyss
3. Heroes 3 wiki, Tutorial (town screen): https://heroes.thelazy.net/index.php/Tutorial
4. Per Fornander, "The many virtues of Heroes of Might and Magic 3", GamesIndustry.biz, 2022-05-12: https://www.gamesindustry.biz/the-many-virtues-of-heroes-of-might-and-magic-3-why-i-love
5. heroes3.vi.ki, towns page (fan site): https://heroes3.vi.ki/towns
6. heroes3.vi.ki, build order (one building per town per day): https://heroes3.vi.ki/town-build-order
7. Heroes III board game rule book (Town Board, build order): https://raw.githubusercontent.com/qwrtln/Homm3BG-build-artifacts/en/main_en.pdf
8. Nunes & Drèze, "The Endowed Progress Effect", Journal of Consumer Research 32(4), 2006: https://faculty.wharton.upenn.edu/wp-content/uploads/2012/04/PSC.pdf
