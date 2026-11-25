# Navigation dossier — Diablo I–IV · Little Big Adventure 1–2 · Allods 1–2 · Journey

Schema: research/nav/SCHEMA.md. Evidence grades: A = study / large-n data; B = hard numbers (sales, telemetry, playtest counts, talk with data); C = designer interview, critical consensus, fan memory. *Judgment* = my inference, not a sourced fact. Research done 2026-11-24 with web_search + web_fetch only. Sales figures are evidence that the *game* succeeded, not proof that its navigation caused it; where I use them I grade them B for "the pattern shipped at scale and was not rejected", never for causality.

---

## Diablo I (1996), Diablo II (2000, LoD 2001), Diablo III (2012, RoS 2014), Diablo IV (2023) — Blizzard North / Blizzard; D1–D2 leads David Brevik, Erich & Max Schaefer; D3 director Jay Wilson; D4 game director Joe Shely, GM Rod Fergusson

Navigation differs enough per title that layers are given as one table with per-title notes.

### 1. Navigation layers (outermost → innermost)

| Layer | What the player sees | Task it solves | Enter / leave |
|---|---|---|---|
| Front-end / lobby | Char select; D2 Battle.net lobby (Brevik wanted to replace it with an in-world "Battle.net Town" — never shipped) | Pick character / session | Menu. Source: https://www.vg247.com/an-oral-history-of-diablo-ii-with-david-brevik-max-schaefer-and-erich-schaefer |
| Act / world map | D1: none. D2: none (only a waypoint menu listing destinations by act). D3: Act map + (Adventure Mode) World map, M key, right-click climbs Level→Act→World. D4: one seamless world map of 5 regions, styled as an "old map" | Choose a region/act; see where activities are | D3/D4: M key. Sources: https://diablo.fandom.com/wiki/Automap ; https://www.wowhead.com/diablo-4/news/diablo-iv-ign-interview-open-world-design-the-world-map-renown-system-329848 |
| Town hub (safe home) | D1: Tristram, the only town, fixed (non-random) layout, all merchants, direct passages down to dungeon tiers. D2: one town per act (Rogue Encampment, Lut Gholein, Kurast Docks, Pandemonium Fortress, Harrogath) — safe, all merchants, stash, a waypoint. D4: a capital City per region (stash, wardrobe, city-styled waypoint) + smaller Towns | Safety, trade, quests, storage, "where everything starts" | Walk in / town portal / waypoint. Sources: https://diablo2.diablowiki.net/D1_Tristram ; https://diablo2.diablowiki.net/Town ; http://techraptor.net/gaming/guides/diablo-iv-map-and-locations-guide |
| Local playfield | Isometric dungeon (D1 random levels, 4 tiers × 4 levels); D2 random outdoor areas bounded by low walls + dungeons; D4 fixed open world + instanced dungeons | Fight, loot, explore | — |
| Automap / minimap | D1–D2: Tab toggles a faint line-drawing overlay *over* the playfield; gameplay continues while it's up; D2 shows stairs, shrines, waypoints (waypoints appear on map before on screen). D3: corner minimap + Tab full level map. D4: corner minimap + full map; no transparent overlay at launch | Q1/Q4 local orientation without leaving action | Tab. Sources: https://diablo.fandom.com/wiki/Automap ; https://classic.battle.net/diablo2exp/basics/controls.shtml ; https://diablo2.diablowiki.net/Waypoint |
| Quest log / journal | D1: none tracked (quests not parallel). D2: quest log invented during development. D3: quest tracker + minimap "this way" arrow. D4: Tab = map + journal | Q3 what next | Key. Source: VG247 oral history (above); https://blizzardwatch.com/2015/08/16/the-short-guide-to-bounties-in-diablo-3 |
| Fast travel | D2: waypoints (≈9 per act, town always has one; activate by finding → menu of all known). D3: waypoints, clickable on map. D4: waypoints (≥6 per region), interact to unlock | Q4/Q7 skip travel | Click waypoint. Sources: https://diablo2.diablowiki.net/Waypoint ; https://www.pcgamer.com/diablo-4-waypoints-fast-travel |
| Return home | Town Portal: D1/D2 scroll/spell opens a two-way blue portal (return to exact spot). D3: belt button, 5-s channel interrupted by damage, portal appears only in town. D4: portal goes to nearest *discovered* City | Q7 safety without losing position | Hotkey/scroll. Sources: http://www.thecomputershow.com/computershow/reviews/diablo.htm ; https://www.diablowiki.net/Town_Portal ; TechRaptor (above) |
| Save / session | D2: no mid-dungeon save; new game restarts in town; waypoints carry geographic progress | Q6/Q7 | Sources: https://www.gamedeveloper.com/design/postmortem-blizzard-s-i-diablo-ii-i- |

### 2. Navigation task answers

- **Q1 Where am I?** D1/D2: automap overlay centred on hero; act town look (Irish countryside → desert → jungle → Hell) signals act. D4: minimap + region map; minimap shows a trail of recent footsteps (https://mythicdrop.com/guide/diablo-4-minimap).
- **Q2 Where can I go?** D1: strictly down — stairs from Tristram/levels unlock the next level (https://diablo2.diablowiki.net/D1_Tristram). D2: act gates + discovered waypoints = reachable set; outdoor areas bounded by "weird low walls" (Erich Schaefer, VG247). D4: regions gated by campaign; Strongholds, once cleared, "convert into a Town" and unlock dungeon/waypoint (TechRaptor; https://www.gamespot.com/articles/how-diablo-4-reinvents-necromancer-encourages-customization-and-deepens-endgame/1100-6504471/).
- **Q3 What next, why?** D1: talk to Tristram NPCs; mostly "go deeper". D2: quest log + NPC dialogue in town. D3: quest tracker + minimap objective arrow ("This way, stupid", Blizzard Watch). D3 Adventure Mode: "!" on waypoints marks bounties (https://maxroll.gg/d3/resources/bounties). D4: map icons, priority quests, renown.
- **Q4 How do I get there?** Waypoints (D2+); D4 adds mount + player map pin that draws a red route line on the minimap (https://www.polygon.com/diablo-4-guides/23648501/beginners-guide-tips-tricks/).
- **Q5 What changed?** D4 Strongholds permanently transform the place (GameSpot, Shely). D1–D3: random re-generation each game means "new" is the default; not otherwise addressed.
- **Q6 What have I done / been?** Automap reveals only seen walls (D1: "best method to track where you are, and where you have been", Fandom). D2 waypoint list = progress record. D4 complaint: map uncovers whole sub-area on entry so "I can't tell what I've truly explored" (https://us.forums.blizzard.com/en/d4/t/lets-talk-about-the-mapmini-map/10035).
- **Q7 Return to safety?** Town portal (all), waypoints (D2+), town = only safe zone (D2 towns explicitly "free from attacks", diablowiki Town).
- **Q8 Whole view / zoom?** D1–D2: no world map at all; zoom = automap only (D1 automap +/– zoom). D3: Level→Act→World map. D4: seamless world map zoom.
- **Q9 Mode switching without getting lost?** Overlay automap keeps the player *in* the action (gameplay doesn't pause; Arreat Summit). D3/D4 full-screen map takes you out; D4 players: "mobs continue to attack you while you're trying to navigate the map" (https://us.forums.blizzard.com/en/d4/t/how-are-you-supposed-to-navigate-d4-without-an-overlay-map/162514).
- **Q10 (new) How do I resume a session without losing geographic progress?** D2's answer: always restart in town + waypoint network as the "save" of position (D2 postmortem).

### 3. Most successful solutions

**3a. Town ↔ dungeon pulse with a safe, fixed hub (D1, kept in every sequel).**
Mechanics: one immutable safe town with all services; the dangerous space is elsewhere and randomised. D1 copied this exactly from Angband ("Forays into the dungeon will be broken up by trips to the town located above", D1 pitch quoted in https://www.filfre.net/2023/07/diablo/). Tristram's layout "is not random at all" while dungeons regenerate (diablowiki D1 Tristram). D2 scaled it to one hub per act.
Evidence: kept in D2, D3, D4 (C, design persistence); series sales — D3 3.5 M copies in 24 h, Guinness fastest-selling PC game (https://www.guinnessworldrecords.com/world-records/fastest-selling-pc-game), D4 $666 M in 5 days (https://investor.activision.com/news-releases/news-release-details/diablor-iv-crosses-666-million-sell-through-within-five-days) — B for "shipped at scale", not causal.
Driver (*Judgment*): **prospect–refuge** rhythm + a stable *anchor* against which randomised space is read; the fixed hub is the one memorised map in a world that is never the same twice.

**3b. Waypoints as discovered, persistent fast-travel (D2 invention, kept D3/D4).**
Mechanics: platform per area, found by exploration; once clicked, a menu lists every activated waypoint across acts; town always has one; final waypoint is near, not at, the act boss (https://diablo2.diablowiki.net/Visit:_A_to_Z).
Evidence: designer statement of intent and result — "Finding new waypoints is a rewarding mini-goal during play… allows characters in new games to return quickly somewhere close to where they quit" (Erich Schaefer postmortem, Game Developer, 2000-10-25, https://www.gamedeveloper.com/design/postmortem-blizzard-s-i-diablo-ii-i-) — C. Retained in D3 and D4 (C). Academic read: waypoints "push the 'frontier' of their unexplored limits back" (https://doi.org/10.26503/dl.v2019i1.1073, DiGRA 2019) — C.
Driver: **progress made spatial** (a waypoint is both a save-point and a trophy); **frontier** effect; cuts backtracking cost (Jay Wilson, D3: "it's not a game about travel, travel time is not something we want in it", https://www.purediablo.com/diablo-3-open-qa-full-transcript).

**3c. Transparent Tab automap overlay (D1–D2).**
Mechanics: line drawing of seen walls/doors over the live playfield; play continues; D2 marks stairs, shrines, waypoints; D2R adds opacity/position options and recoloured lines for readability (https://news.blizzard.com/en-us/article/23695734/technical-alpha-learnings).
Evidence: when D4 shipped without it, sustained player demand: Fergusson "No plans at the moment" reply triggered coverage of a divided but vocal base (https://www.eurogamer.net/blizzard-no-plans-for-diablo-4-tab-overlay-map ; https://www.gamespot.com/articles/diablo-4-devs-have-no-plans-for-key-map-feature-and-fans-are-divided-on-it/1100-6513321); forum thread "We've been asking for this since day 1" (Blizzard forums 2024); an overlay was later added (forum posts from 2026 discuss the new overlay being too dense, https://us.forums.blizzard.com/en/d4/t/diablo-iv-overlay-map-issue-%E2%80%93-can%E2%80%99t-play-since-season-13/247150) — C (fan consensus), but the reversal itself is a B-ish behavioural signal.
Driver: **no mode switch** — orientation without leaving the action loop (keeps flow); eye stays at screen centre (Wowhead notes eye-strain cost of darting to a corner minimap, https://www.wowhead.com/diablo-4/news/why-isnt-diablo-4s-map-overlay-see-through-376215).

### 4. Known failures / criticism

- D1: "no autotravel even in the town… Traveling from place to place can be a pain"; automap can't be examined beyond the local area (Al Giovetti review, http://www.thecomputershow.com/computershow/reviews/diablo.htm).
- D2 outdoor scale: "we had way too big an area for a while… how big an area was it before you miss things or you're lost" — fixed by iteration and choke points "to reorient everyone along the path" (Max Schaefer, VG247 oral history).
- D2: waypoints were controversial — "This system has many critics and advocates" (Stanford STS 145 case history, https://silo.tips/download/blizzard-entertainment-a-case-history-the-right-way-to-make-a-computer-game-luke-daley-sts-145-professot-henry-lowood-winter-quarter-free-download-pdf); Schaefer: "A lot of players don't like our decision" (no mid-level save) (postmortem mirror http://icewyrmgames.github.io/examples/diablo-ii-postmortem).
- D4: removed overlay (above); map discovery reveals whole sub-areas (forum); open-world traversal "pretty boring", "Ubisoft open world bloat" (https://defector.com/diablo-iv-isnt-quite-sure-what-it-wants-to-be ; https://d4gold.com/news/diablo-4-season-1-open-world-pros-and-cons-discussion); "Open world busywork and bloat" listed as a con (https://www.gamerguides.com/diablo-iv/reviews/diablo-iv-review); players ask for a waypoint list because they can't remember where waypoints are (https://us.forums.blizzard.com/en/d4/t/world-map-needs-a-drop-down-list-for-waypoints/210376).

### 5. Designer intent quotes

- Erich Schaefer (D2): "we probably invented the idea of a quest log… how people know what to do, where to go. The waypoint system for getting around, we had to invent all that stuff… Hey, how are we ever going to get back to town? How are we going to get back to here?" — https://www.vg247.com/an-oral-history-of-diablo-ii-with-david-brevik-max-schaefer-and-erich-schaefer
- Max Schaefer (D2): "when do you need a choke point just to reorient everyone along the path, and how big an area was it before you miss things or you're lost or you don't know where you've been?" — same URL.
- Erich Schaefer (D2): "we came up with all kinds of weird low walls… Turns out, it felt really natural" — same URL.
- David Brevik (D2): "I wanted you to start in that world, not start in the Battle.net chat lobby… you never left the world" — same URL.
- Brevik (D1): UI to meet the "mom test" — "could my mom play this?" — https://www.gamedeveloper.com/design/20-years-later-david-brevik-shares-the-story-of-making-i-diablo-i-
- Jay Wilson team (D3 Q&A, 2009): "players be able to move quickly through the world, it's not a game about travel" — https://www.purediablo.com/diablo-3-open-qa-full-transcript
- D3 BlizzCon 2014 (Adventure Mode): "We wanted you to be able to jump from point to point without having to go back to the menus" — https://diablo.blizzplanet.com/blog/comments/blizzcon-2014-diablo-iii-whats-next-panel-transcript/2
- D4 team (video, speaker not identified in transcript): the map "needs to effectively show you all of these coolest things you can do without turning into a task list of like… there are 30 Flags I guess I gotta do all 30" and must show "a mountain range… so they're not like running along the coast like how do I get down here" — https://www.youtube.com/watch?v=gpBU75mhv7w
- Joe Shely (D4, German interview, my translation): "when an overlay map is active, you are permanently distracted by it… our focus is on making the minimap as effective as possible and keeping it out of the centre of the screen" — https://www.gamepro.de/artikel/diablo-4-fehlendes-feature-aus-diablo-2,3391928.html

---

## Little Big Adventure (1994) and LBA2 / Twinsen's Odyssey (1997) — Adeline Software International; Frédérick Raynal (creator/director), Didier Chanfray, Sébastien Viannay

### 1. Navigation layers

| Layer | What the player sees | Task | Enter / leave |
|---|---|---|---|
| Front-end | Main menu, load/save | Session | Menu |
| Planet (Holomap, PLANET mode) | Rotatable 3D globe of Twinsun (LBA1) or the current planet (LBA2: Twinsun, Emerald Moon, two-layer Zeelich) with hero position and red arrows | Q1 at planet scale, Q3 where objectives are | Diegetic item; H (LBA1) / Tab (LBA2) or from inventory. LBA1 manual https://files.magicball.net/documents/lba1-manual.pdf ; LBA2 manual https://files.magicball.net/documents/lba2-en-manual.pdf |
| Island (Holomap, MAP mode — LBA2 only) | 2D map of the island you are on (zoom only allowed on current island); cursor + text box describe places | Q1/Q4 at island scale | Space/Enter from planet mode (LBA2 manual) |
| Transit between islands | Ferry tickets, later catamaran; non-controllable cut between islands | Q4 inter-island | NPC transport. https://presentperfectgaming.com/a-relentless-little-big-adventure/ |
| Local scene | Isometric screen-sized scenes; exit by walking to the screen edge | Play | "To exit a scene, move to the edge of the screen" (https://manuals.plus/m/a0c19638a688d8fcb1c078b58f8ff056177bb53b4f9e46cd1f99ae0afb38a8c1.pdf) |
| Behaviour menu (= the only status display) | Hold CTRL → game pauses → four windows (Normal/Sporty/Aggressive/Discreet) + red life bar, blue magic bar, coins, keys, clovers | Mode switch + check status | Hold/release CTRL (F1–F4 shortcuts). https://www.gamers.org/pub/archives/uwp-uml/demos/lba_prev.txt ; LBA1 manual |
| Mini-holomap pop-up (LBA2) | Small spinning holomap appears top-left when an NPC gives a new objective | Q5 "something new was marked" | Automatic (LBA2 manual) |
| Inventory | Items incl. holomap | — | Shift |

No permanent on-screen HUD in the PC originals: status lives in the CTRL behaviour screen; damage is shown as stars over Twinsen's head (LBA1 manual, LBA2 manual). The PlayStation port, having no CTRL menu, *added* an on-screen status bar (https://gamefaqs.gamespot.com/ps/573157-little-big-adventure-twinsens-adventure/faqs/67979), as did the 2014 mobile/Enhanced editions (https://magicball.net/lba1/articles/lba1-mobile-review).

### 2. Navigation task answers

- **Q1** Holomap: planet (LBA1, rotatable with CTRL+arrows), planet + island (LBA2). Scene art itself (distinct island styles) also locates.
- **Q2** Islands unlock via story ("Certain locations in the game are initially blocked", https://en.wikipedia.org/wiki/Little_Big_Adventure_2); transport (ferry ticket, later own boat/ Dino-Fly) is the gate. Behaviour mode also gates *actions* (jump only in Sporty, sneak only in Discreet).
- **Q3** NPC dialogue gives objective → red arrow placed on holomap; "Twinsen's speech are gradual indicators of what to do next if stuck" (https://gamefaqs.gamespot.com/android/802842-little-big-adventure/reviews/154830); arrows say *where*, not *what* ("It just doesn't tell you what needs doing", Present Perfect).
- **Q4** No route drawing; arrows + island map (LBA2) + ferries.
- **Q5** LBA2 mini-holomap pop-up on new objective; arrow disappears when task done (LBA2 manual).
- **Q6** Not addressed beyond arrows vanishing; no quest log.
- **Q7** Autosave (LBA1; "a departure from the usual manual save system", https://en.wikipedia.org/wiki/Little_Big_Adventure); clovers respawn you at scene start; Twinsen's house as narrative home.
- **Q8** Holomap planet↔island toggle (LBA2); LBA1 only planet-level (fans: "you can't see the islands individually… no island maps", https://forum.magicball.net/t/how-do-i-use-the-holomap-in-lba1/6368).
- **Q9** CTRL pauses the world to switch mode; holomap is an inventory object, so opening it is "looking at a device", not leaving the fiction (*Judgment*).
- **Q10 (new) "How should I *be* here?"** Behaviour modes make the stance (calm/athletic/fight/sneak) a navigational choice — a scene is traversable only in the right mode.

### 3. Most successful solutions

**3a. Holomap — diegetic 3D world map with objective arrows.**
Mechanics: a found/bought object (LBA1: locker in the Citadel or the Old Burg bazaar; LBA2: locked room in Twinsen's house, also sold in shops — https://lbalab.github.io/twinsuniverse/wiki/Holomap); 3D globe; red arrows for places "pointed out to you during your quest… They will disappear once you have completed" (https://lba.fandom.com/wiki/Holomap). LBA2 added island zoom and the pop-up.
Evidence: LBA1 sold 320,000 by Feb 1997 and >500,000 by Aug 1999 (Edge / allgame via https://en.wikipedia.org/wiki/Little_Big_Adventure) — B (game-level); reviewers singled out LBA2's added island map: "l'ajout d'une carte rapprochée facilite fortement l'exploration" (https://www.gameforever.fr/forum/test-little-big-adventure-2-pc-t1265.php) — C. The step LBA1→LBA2 (planet-only → planet+island) is itself evidence the planet-only scale was insufficient (C).
Driver: **map as an object in the world** (diegesis keeps immersion); **two-scale zoom** answers "whole" and "here" together; arrows give *direction without instruction*, preserving exploration.

**3b. Behaviour modes as the interface (stance = control scheme).**
Mechanics: four modes, one action button whose meaning changes per mode (talk/search, jump, fight, sneak); CTRL pauses to choose (https://www.hardcoregaming101.net/little-big-adventure).
Evidence: designer pride + Chanfray calls it "a fundamental aspect of LBA" while admitting "we wouldn't understand that kind of gameplay" today (https://www.gameforever.fr/littlebigadventure-english.php) — C; later ports moved modes onto shoulder buttons and players "complained about the controls" (GameFAQs PS guide) — C.
Driver: **one-button affordance** with mode context; mood-as-mode ("set the hero in the mood you would be in real life").

**3c. HUD-less screen; status on demand.**
Mechanics: life/magic/keys/coins only in the CTRL screen; damage via stars over the head (LBA1/LBA2 manuals).
Evidence: weak — design-intent only (manual philosophy line, below); all later ports added a HUD (PS, mobile, Enhanced), which reads as evidence *against* pure HUD-lessness for action-heavy play — C.
Driver: attention on the world; *Judgment*: works when combat is light, fails when the player must monitor health mid-fight (fan walkthrough: "after every hit you take bring up your health screen", https://magicball.net/lba1/hints/paul-smith-walkthrough/).

### 4. Known failures / criticism

- LBA1 holomap shows only a globe; "lite med kart over byen/landet" — no city/area map to find e.g. the nearest library (https://retro.gg/game/little-big-adventure/92); nothing in scenes is marked, so you "check everything" (same).
- LBA1 save handling criticised (same source; also Raynal team admits "Some of these mistakes were done on purpose: LBA1 was planned also for the SNES… you don't run into your houses. But OK, this was wrong for the gameplay", https://web.archive.org/web/20120428051636/www.gog.com/en/news/your_questions_about_little_big_adventure_answered).
- LBA2: "Twinsen travels back and forth multiple times in the first two acts"; UI and controls "in that awkward '90s stage" (https://www.pcgamer.com/revisiting-the-strangely-sweet-world-of-little-big-adventure-2).
- Tank controls: "Today, people don't understand how you can control a guy like a car" (Chanfray, gameforever); the 2014 mobile version added POI hints and "work[ed] on finding the way" (same).
- US failure (30,000 units) blamed on marketing, not navigation (Wikipedia LBA).

### 5. Designer intent quotes

- LBA1 manual: "An easy to use interface that lets the player concentrate on the game, not the controls, but which also allows for a deep and rich gameplay experience. Maximum interaction with the game environment." — https://files.magicball.net/documents/lba1-manual.pdf
- Raynal/Viannay/Chanfray (GOG Q&A 2011): "we decided to build the interface around these behaviors, in order to set the hero in the mood you would be in real life." — GOG archive URL above.
- Chanfray: LBA in one sentence: "to have the feeling of freedom" — https://www.gameforever.fr/littlebigadventure-english.php
- Raynal: "LBA is only a Zelda like game in Alien8 environments with an Alone in the Dark way to control 3D animated characters" — https://www.jeuxvideo.com/forums/1-671-8660480-5-0-1-0-0.htm (C; fan-forum transcript).
- No verbatim Raynal quote specifically about the holomap was found (gap).

---

## Allods: Sealed Mystery / Rage of Mages (1998) and Allods II: Master of Souls / Rage of Mages II: Necromancer (1999) — Nival Interactive (publishers 1C/Buka; Monolith in the West). Lead designer: not established in sources opened (gap)

### 1. Navigation layers

| Layer | What the player sees | Task | Enter / leave |
|---|---|---|---|
| Front-end | Main menu, character creation, load | Session | Menu |
| Island Map (global map) | Hand-drawn "ancient" map of Umoir (A1) / the allod Yazes (Язес, forest/plain/desert parts — https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%BB%D0%BE%D0%B4%D1%8B_II:_%D0%9F%D0%BE%D0%B2%D0%B5%D0%BB%D0%B8%D1%82%D0%B5%D0%BB%D1%8C_%D0%B4%D1%83%D1%88) (A2); hero's banner; quest scrolls with outline, map location, payment; on selection a dotted path to an X | Q1 on island; Q2 which missions are open; Q3 pick next; Q4 path | Leave town via main gate → map; pick scroll → map closes, mission loads. Manual https://www.mocagh.org/miscgame/ragemages-manual.pdf |
| Town screen (static menu-place) | Painted square of Plagat; 5 hotspots where the cursor changes: Inn, Weapon Shop, School of Mages & Fighters, Mage's Statue, Town Gate | Trade, train, hire, get quests/rumours | Hotspot click; Gate → Island Map (manual) |
| Inn (sub-screen) | Innkeeper, portraits of talkable characters (purple frame) and mercenaries (blue frame) with price/count | Q3 quest source, hire | Hotspot |
| Mission map (battle screen) | RTS-style real-time map with fog of war: visible / previously explored (grey, no enemies shown) / unexplored (black) | Play; Q6 within mission | Mission start/victory |
| Minimap ("green crystal") | Whole mission area, colour squares for friend/foe/locations; click jumps view (A2) | Q1/Q8 within mission | Always on (manual; https://vertigosn.ru/solutions/pcgames/allods2) |
| Save | Save anywhere in mission (manual) | Q7 | Menu |

### 2. Navigation task answers

- **Q1** Island Map banner = "the hero's party is staying in this part of the island" (manual). In mission: minimap + fog.
- **Q2** Available quests are the scrolls on the Island Map; new quests unlock by talking to specific NPCs ("задания появляются лишь по окончании беседы с определенным человеком", http://psphome.ru/rage-of-mages-prohozhdenie-igry.html); A1 gives missions ~1–3 at a time (https://www.rpgjeuxvideo.com/test/rage-of-mages/).
- **Q3** Choose among scrolls (outline + pay shown on hover); NPCs in Inn give leads. In-mission: objectives from briefing only — "no hints or markers… exploration is essential" (https://crpgbook.cn/2023/09/05/147-rage-of-mages/, CRPG Book).
- **Q4** Dotted path from banner to X on Island Map (manual). In-mission: none beyond minimap.
- **Q5** Island Map: new roads, houses, military buildings "appear on the map as you explore" — the map is pre-curse and updates diegetically (manual, "Origin of the Island Map"). Inn roster grows over the game (https://stanislavcostiuc.com/2023/10/09/rage-of-mages-%D0%B0%D0%BB%D0%BB%D0%BE%D0%B4%D1%8B-%D0%BF%D0%B5%D1%87%D0%B0%D1%82%D1%8C-%D1%82%D0%B0%D0%B9%D0%BD%D1%8B).
- **Q6** Fog of war (explored vs unexplored) per mission; no cross-mission log found.
- **Q7** Town = rest "behind the sturdy Town walls" (manual); after any quest you can return to Plagat; save anywhere.
- **Q8** Two discrete scales (island ↔ mission) + minimap; A2 spans two allods but "95% of the game" is on the second (https://www.old-games.ru/game/713.html).
- **Q9** Hard cuts between three screen types (town menu / island map / RTS map); each looks completely different, so mode is never ambiguous (*Judgment*).
- **Q10 (new) "What's the risk/reward of going there?"** Scroll shows payment up front; mission maps contain monsters "too strong for you to handle" as soft gates (https://www.mobygames.com/game/743/rage-of-mages/reviews/).

### 3. Most successful solutions

**3a. Town-as-menu-place (painted hub, hotspot navigation).**
Mechanics: town is not walkable; it is a single illustrated screen where hovering changes the cursor over 5 places (manual). Zero travel time between services.
Evidence: CRPG Book calls the town "通过设计精良的菜单界面" (via a well-designed menu interface) (https://crpgbook.cn/2023/09/05/147-rage-of-mages/) — C; Old-Games describes the loop "mission → back to town → reward → sell → buy → tavern for a new one" as the game's whole structure (https://www.old-games.ru/game/156.html) — C. Sales: not established (gap; ru.wikipedia calls it "one of the first Russian games to win popularity in the world", https://ru.wikipedia.org/wiki/%D0%90%D0%BB%D0%BB%D0%BE%D0%B4%D1%8B:_%D0%9F%D0%B5%D1%87%D0%B0%D1%82%D1%8C_%D1%82%D0%B0%D0%B9%D0%BD%D1%8B) — C.
Driver: **hub as a picture of places** — the metaphor ("inn", "shop", "school") does the wayfinding; recognition over recall.

**3b. Diegetic, self-updating Island Map as mission select.**
Mechanics: in-fiction "ancient cartographer" map, explicitly out of date; new landmarks appear as you explore; hover hints; quest scroll → path → X → auto-close into mission (manual).
Evidence: design-intent (manual) — C. A2 extended it: several missions on the map at once, any order, and chaining mission→mission without returning to town ("вы можете сразу, не возвращаясь в город, отправиться на любую другую", https://vertigosn.ru/solutions/pcgames/allods2); Nival listed "свобода передвижений между городами и миссиями" as a headline feature (https://allods.gipat.ru/index.php?p=a2) — C. The sequel's loosening = evidence the A1 strict loop was felt as too rigid (*Judgment*).
Driver: **map = menu = story** (choosing a mission is choosing a place); **visible progress on the map** (Q5).

**3c. Three-state fog of war on mission maps (inherited from RTS).**
Mechanics: visible / explored-grey (enemies hidden) / unexplored-black; sight depends on elevation (manual).
Evidence: genre convention (Warcraft II comparison, CRPG Book) — C.
Driver: **visible frontier** — the black edge is the "where can I still go" answer.

### 4. Known failures / criticism

- No in-mission markers or hints; reliance on exploration (CRPG Book) — some praise this ("Just wondering around the map is quite pleasurable", MobyGames), some treat it as a burden (*Judgment*: mixed).
- A2: "There are many cities or villages on the map… yet it's impossible to talk to them" — placed settlements that are not navigable destinations (https://www.mobygames.com/game/6811/rage-of-mages-ii-necromancer/).
- A2 reviewed as self-copying: "Структура миссий осталась неизменной" (https://www.old-games.ru/forum/threads/allody-2-povelitel-dush.23723/).
- Town/menu/mission screens fixed at 640×480 and windowboxed in A2 (https://www.wsgf.org/dr/rage-mages-2-necromancer) — presentation, not wayfinding.

### 5. Designer intent quotes

- None verbatim from Nival designers about navigation found in opened sources (gap). Closest: the manual's in-fiction framing — "Never forget that this map, useful as it may be in some places, dates back to the time before the island was cursed… new landmarks appear on the map as you explore Uimoir." — https://www.mocagh.org/miscgame/ragemages-manual.pdf
- Allods Online team (Nival lineage, 2009, different game): "we tried to place a unique landmark in each area" — https://www.ign.com/articles/2009/05/29/allods-online-interview (C; shows landmark thinking carried into the franchise).

---

## Journey (2012) — thatgamecompany; creative director Jenova Chen, lead designer Nicholas Clark, producer Robin Hunicke, art director Matt Nava

### 1. Navigation layers

| Layer | What the player sees | Task | Enter / leave |
|---|---|---|---|
| Title | Title screen (only place with words besides credits) | Start | https://en.wikipedia.org/wiki/Journey_(2012_video_game) |
| Chapter-select hub (replays) | Starting area becomes a hub with doorways per level; walls light up with glyphs found per chapter | Q6 history; choose chapter | Walk into a room. https://journey.fandom.com/wiki/Ancient_Glyphs ; https://strategywiki.org/wiki/Journey_(2012) |
| The mountain | Single glowing peak visible from the start, almost always on the horizon | Q3 global goal, Q1 direction | Always present. GameSpot review https://www.gamespot.com/reviews/journey-review/1900-6363693/ |
| Level (linear sections) | Open-looking desert/ruins but linear sequence; "doorways"/"weenies"; invisible boundary walls | Q4 local route | Reach end shrine. Push Square interview (below) |
| Shrine + vision cutscene | At each level end: rest, white-robed figure shows a pictographic mural of past/present/future | Q5/Q6 progress, story so far, what's ahead | Automatic. Wikipedia; https://giantbomb.com/wiki/Games/Journey_2012 |
| Murals/glyphs (optional) | Wall art telling the civilisation's history; later levels show the player's own journey as glyphs, replayed in a flashback | Q6 | Walk near / chirp. https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/Journey2012 |
| "HUD" on the body | Scarf length = flight capacity; glowing runes on scarf = remaining charge; symbol on robe identifies companion | Resource state without UI | Always. Wikipedia |
| Companion | One anonymous other player; chime as only signal | Shared wayfinding | Matchmade silently, no lobby |

### 2. Navigation task answers

- **Q1** Position relative to the mountain; sand trails and dunes give local progress (GDC 2013 notes: large 3D spaces "boring as it's difficult to measure progress. This birthed the presence of dunes and sand-trails to create a sense of progress", https://journey-archive.fandom.com/wiki/User_blog:JAlbor/GDC_2013:_Designing_Journey_with_Jenova_Chen).
- **Q2** Linear sections; invisible walls if you stray (Chen, Push Square); red cloth activated by chime opens bridges/doors (Wikipedia).
- **Q3** "The game's goal is simple: go to the mountain." (Chen, Push Square). Local next-step via "weenies", guiding cloth creatures that "lead you to the next curiosity" (https://bitmob.com/articles/journey-isnt-about-the-destination.html).
- **Q4** Line of sight to landmarks; companion showing paths (Wikipedia).
- **Q5** Colour/theme of level shifts with emotional arc (https://game.watch.impress.co.jp/docs/news/593897.html); vision after each level.
- **Q6** Murals/vision cutscenes; replay hub shows found glyphs; robe patterns accrue over playthroughs (Wikipedia).
- **Q7** Not addressed as "home"; the sand dune start is where the final shooting star returns (Wikipedia) — circular structure.
- **Q8** The opening dune-top view of the whole route to the mountain; the end-credits star retraces the whole path (Wikipedia).
- **Q9** No menus in play; no lobby; no names until credits (https://www.gamedeveloper.com/business/the-journey-to-create-i-journey-i----the-quest-for-emotion).
- **Q10 (new) "Who is with me on this route?"** Navigation as social: a stranger's presence charges your scarf and can show the way; no text/voice.

### 3. Most successful solutions

**3a. One omnipresent landmark ("weenie") as the entire objective system.**
Mechanics: mountain with lit crevice visible from first dune; levels use Disney "weenies"/doorways; invisible walls catch strays.
Evidence: **B** — Chen: "we've tested the game on at least 200 people and they all managed to find their way out themselves… We used the environment to guide the player without using words, or compass, or map." (Push Square, 2012-02-27, https://www.pushsquare.com/news/2012/02/interview_thatgamecompany_journey). Outcome: fastest-selling game on PlayStation Store in NA and EU (https://blog.playstation.com/archive/2012/03/29/journey-breaks-psn-sales-records); Metacritic 92; GDC Choice GOTY, D.I.C.E. GOTY, 5 BAFTAs incl. Game Design (Wikipedia) — B for "shipped and celebrated". Critic: "a near-constant, towering waypoint… suggesting objectives so subtly as to feel like you're always exploring on instinct" (GameSpot) — C.
Driver: **distal landmark / beacon** (global orientation without map), Disney **weenie**; agency preserved because the guidance is the world itself.

**3b. Progress encoded in the environment and body, not UI.**
Mechanics: scarf length/runes = capacity; sand trails/dunes = progress cue; level colour palette tracks emotional arc; end-of-level shrine visions = chapter progress; glyph walls in hub = collection progress.
Evidence: GDC 2013 (dunes/trails introduced specifically to fix "difficult to measure progress") — C (designer talk, no numbers in the notes); 3 of 25 testers cried at the end (D.I.C.E. speech, Wikipedia) — B-ish for emotional arc, not navigation.
Driver: **diegetic feedback**; *Judgment*: removes the modal split between "playing" and "checking status".

**3c. Wordless co-navigation (chime, no names, no lobby).**
Mechanics: one button chime; companions can show paths but not hinder; matched silently; names shown only after credits.
Evidence: critics called the unnamed partner a "master stroke" (Eurogamer via Wikipedia) — C; Chen saw players "apologizing in online forums for having to leave games early" (GDC 2013 notes) — C.
Driver: **social proof as wayfinding** (follow the other traveller); minimal channel forces gesture-level guidance.

### 4. Known failures / criticism

- Main criticisms are length/pacing, not getting lost: "deliberate, melancholic pace", short duration, lack of complex gameplay (IGN, Edge, Game Informer via Wikipedia).
- Mid-development failure: by end of year 2 "testers still did not enjoy the game"; mountain section had to be lowered/reworked because the climb felt like a "slog" (GDC 2013 notes).
- Early prototype with flight-resource sharing made players feel "other players were stealing from them or stalking them" — cut (GDC 2013 notes).
- Chen's own caveat: "In order to go on an adventure, you can't know too much about the adventure… Adventure is about going to a place that is unknown." — i.e. the method deliberately trades efficiency for wonder (Push Square). *Judgment*: does not transfer to tasks where the user needs to reach many different destinations.

### 5. Designer intent quotes

- Chen: "When you have open space it often feels like you don't know where to go, you feel lost… in Journey… the experience is rather guided, because there's always a 'doorway', a giant 'weenie' — which is a Disney term, it's something in the distance to guide you in the right direction." — https://www.pushsquare.com/news/2012/02/interview_thatgamecompany_journey
- Chen: "You can't just get a map, or just have people tell you, 'your mission is go to this waypoint, do this thing.' That takes out the feeling of adventure." — same.
- Chen: "There is no HUD… There is no lobby." — https://www.polygon.com/2013/2/7/3965342/journey-and-the-search-for-emotional-gaming/
- Chen: "the UI of journey is no UI" — https://www.youtube.com/watch?v=AL-StB8qmII (Game UX Summit '19)
- Chen: "the player needs to have the choice to stay in the experience, to have the flow." — GDC 2013 notes (fandom URL above)
- Chen (on Sony's request for names on the HUD): "We had to trim all the weeds." — https://www.eurogamer.net/how-journey-only-truly-made-sense-when-almost-everything-had-been-cut

---

## Cross-game patterns in this cluster

1. **Safe hub + dangerous field is the base rhythm** (Diablo towns, Allods' Plagat, LBA's Twinsen's house; Journey inverts it into a single outward pilgrimage with the hub only for replays). The hub is *fixed* while the field varies — the invariant gives the player one place they never have to re-learn. Strongest evidence: persistence across four Diablo titles and Allods 1→2.
2. **Two to three discrete scales, each with its own clearly different screen** — world/planet → region/island → local scene (LBA2 holomap planet↔island; Allods island map ↔ mission ↔ town; D3 World→Act→Level). Scale transitions are explicit actions, never ambiguous. Games that offered only one scale were criticised and the sequel added one (LBA1→LBA2 island map; D1 "can't examine beyond local area").
3. **Discovered, persistent shortcuts turn progress into geography** (D2 waypoints "a rewarding mini-goal"; Allods map gaining landmarks; D4 strongholds becoming towns). The map is also the progress log — answering Q5 and Q6 with one artefact.
4. **Direction without instruction**: a marker says *where*, not *what* (LBA red arrows; Journey's mountain; D3 arrow only appears when you wander). The best-received versions guide at the coarse scale and leave the local scale to exploration; over-marking (D4 "30 flags", "Ubisoft bloat") draws criticism.
5. **Orientation without leaving the action beats full-screen maps** — D1/D2 transparent overlay; Journey's environment-as-map; when D4 removed the overlay, demand persisted until one was added. Every modal map (D4 full map, A1 island screen) is a context switch the player pays for.
6. **Diegetic artefacts carry navigation** (LBA holomap as an item you find; Allods' "ancient cartographer" map that is out of date; Journey's scarf and murals). They keep immersion *and* justify the map's limits (why it's incomplete, why it updates).
7. **Minimal persistent HUD is viable only when the moment-to-moment load is low** — Journey (no combat) succeeds; LBA's HUD-less status screen was replaced by a HUD in every later port; Diablo always kept health/mana orbs. *Judgment*: strip UI in proportion to how little the player must monitor.
8. **One big landmark solves global wayfinding cheaply** — Journey's mountain (≥200 testers, all found their way); Allods Online's "unique landmark in each area"; D4 team insisting the map show the mountain range. Landmarks + boundaries (D2 low walls, Journey invisible walls, choke points "to reorient everyone") together replace most UI.
9. **Return-home must be instant and position-preserving** (two-way town portal D1/D2; D3/D4 versions add friction or lose position and are discussed as trade-offs). The safety exit should not cost the player their place.
10. **Stance/mode can be part of navigation** (LBA behaviour modes gate where you can go; Allods screens never mix modes). Making the current mode unmistakable (different screen, paused selector) prevents "lost in modes".

### Gaps / not established
- No A-grade (study / telemetry) evidence found for any of these games' navigation specifically; strongest hard number is Journey's ≥200-tester wayfinding claim (designer-reported).
- Allods: lead designer name, sales figures and any designer quote on the island map/town screen not found in opened sources.
- No verbatim Raynal quote about the holomap found.
- D4 overlay addition: date/patch inferred from 2026 forum posts, not an official patch note.
