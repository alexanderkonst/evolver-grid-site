# Navigation by auteur designers + wayfinding theory

Cluster: auteur games (Zelda BotW/TotK, Dark Souls/Elden Ring, Ico/SotC, Myst, Outer Wilds, Hollow Knight, Disco Elysium, Animal Crossing/Stardew, Minecraft, Half-Life 2/Portal, Death Stranding, Hades) + theory (Lynch, Fagerholt & Lorentzon, Hodent, information scent, cognitive maps).
Method: web_search + web_fetch only, compiled 2026-11-24. Evidence grades per SCHEMA: **A** study/large-n data · **B** hard numbers, sales, telemetry, GDC talk with data · **C** designer interview, critical consensus, fan memory. *Judgment* = my inference, not a sourced fact. Sales figures are proof of commercial reach, not proof that navigation caused it; graded B only for "the design shipped to N players without being reversed".

---

## 1. The Legend of Zelda: Breath of the Wild (2017) / Tears of the Kingdom (2023) — Nintendo EPD, dir. Hidemaro Fujibayashi, prod. Eiji Aonuma

**Layers**

| Layer | What the player sees | Task solved | Enter / leave |
|---|---|---|---|
| Title | Sparse menu, deliberate empty space ("余白") | Start/continue | Boot |
| World map (Sheikah Slate / Purah Pad) | 120 dynamically loaded sections, 4 zoom levels, unrevealed areas in a separate colour; TotK: 3 stacked maps (Sky / Surface / Depths) switched by d-pad | Q1, Q2, Q8 | Button; pause |
| Towers (BotW Sheikah Towers / TotK Skyview Towers) | Tall diegetic landmark; climbing it downloads the region map and becomes a warp point | Q1, Q4, Q8 | Climb; fast-travel back |
| Scope + pins | First-person zoom; 5 (BotW) / 6 (TotK) colour pins that glow in the world, on map, on minimap | Q3, Q4 | Click stick; place pin |
| Stamps | Up to 100 player stamps (9 shapes) on map only | Q6 (player-authored memory) | Map screen |
| Minimap + "Pro HUD" option | Minimal HUD; Pro HUD strips further | Q1 local | Settings |
| Shrines / Lightroots | Fast-travel nodes; each TotK Lightroot sits directly under a surface shrine (anadrome names) | Q4, Q7 | Touch to activate |
| Playfield | "Gravity" landmarks + "triangle rule" terrain | Q3 without UI | Always |

**Q1–Q10**
- Q1 Where am I? Minimap + towers as visible landmarks; map regions empty until tower climbed.
- Q2 Where can I go? Everywhere after the Great Plateau; limits are stamina, temperature, enemy strength, not locks (*Judgment* from design; Fujibayashi: "a game where the user can truly experience freedom… decide on their own where they go" — https://www.thumbsticks.com/gdc-17-breaking-conventions-breath-of-the-wild/).
- Q3 What next? Things you can see: towers, shrines' glow, smoke, structures of graded visibility ("gravity"); the main quest exists but is optional in order.
- Q4 How to get there? Scope → pin → beacon on horizon/minimap; climb/glide straight line; warp to shrines/towers.
- Q5 What's new? Not addressed systematically (no "new" markers beyond quest log). TotK: map layers reveal per Lightroot.
- Q6 History? Revealed map, shrine/tower counters on the map (https://legendsofz.com/game-guides/sheikah-slate-guide), up to 100 player stamps (https://www.zeldadungeon.net/wiki/Map).
- Q7 Safety? Warp to any activated shrine/tower; stables; autosave (CEDEC: a "Game Over View" of where players died drove autosave — https://gist.github.com/Hengle/1118a43202e4daf0586151f6928b95a4).
- Q8 Whole? Climb high → see; map zoom 4 levels; TotK sky-dive survey: "diving … brings more value as a tool for gathering information about the surface by surveying" (https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-9-the-legend-of-zelda-tears-of-the-kingdom-part-1/).
- Q9 Modes? Slate is one diegetic device that holds map/runes/album → one mental "place" for all meta (*Judgment*).
- Q10 New Q: **"What is worth my attention among many things I can see?"** — solved by ranked visibility ("gravity"), not markers.

**Top solutions**
1. **Gravity + towers revised by telemetry.** Initial plan "point and line" (towers, events between) failed: heatmaps from all of several hundred testers' footprints showed ~80% walking strictly along roads, ~20% wandering aimlessly; players "felt they were being guided, … too linear". Fix: "gravity" — structures of varying visibility/importance pulling players in different directions → much more evenly distributed heatmap. Evidence **B** (internal telemetry presented at CEDEC 2017). Sources: https://www.ndw.jp/post-1121/ ; https://gist.github.com/Hengle/1118a43202e4daf0586151f6928b95a4 ; https://www.eurogamer.net/zelda-breath-of-the-wild-development-secrets-revealed (2017-10-04). Driver: curiosity pull vs. instruction push; autonomy (*Judgment*: information scent at landscape scale).
2. **Triangle rule.** Triangular terrain gives a choice (over or around) and hides what's behind → reveal/surprise; three scales: large = landmarks/visual markers, medium = occlude, small = tempo; rectangles hide completely. Chain "hill → bridge structure → tower". Evidence **C** (designer talk, no outcome data). Source: same gist; https://www.blog.radiator.debacle.us/2017/10/open-world-level-design-spatial.html. Driver: progressive disclosure; Lynch landmarks at multiple scales.
3. **Scope→pin→beacon loop.** See it, mark it, follow your own light. Player-authored waypoints replace designer quest markers. Evidence **C** (cartographers' review praises 100 stamps: https://stamen.com/cartographers-play-video-games-a-review-of-the-map-in-the-legend-of-zelda-breath-of-the-wild). Commercial context **B**: BotW 34.28M Switch units, TotK 22.90M (Nintendo IR, as of 2026-09-30: https://www.nintendo.co.jp/ir/en/finance/software/switch.html).

**Failures/criticism**: TotK Depths criticised as monotonous/pacing drag; Aonuma/Fujibayashi defend it as intentional contrast (https://www-s1.npr.org/2023/09/13/1199307678/zelda-tears-of-the-kingdom-dlc-video-game). Multi-layer maps risk confusion; Stamen reviewers note layered maps "can easily confuse players" though TotK handles it with d-pad switching (https://stamen.com/cartographers-play-video-games-a-review-of-the-map-in-the-legend-of-zelda-tears-of-the-kingdom). Sky early drafts "messy" until designers pushed back (https://www.nintendo.com/en-gb/News/2023/May/Ask-the-Developer-Vol-9-The-Legend-of-Zelda-Tears-of-the-Kingdom-Chapter-3-2383821.html).

**Designer intent**
- UI concept: "only essential UI"; "only display information when necessary"; no tutorial "so players wouldn't feel guided by the hand" (CEDEC UI talk, Matt Walker translation, gist above).
- Dohta (TotK, GDC 2024): "We wanted players to see things in the distance and have players go there." (https://www.theverge.com/24115898/tears-of-the-kingdom-physics-gameplay-design-gdc-2024)

---

## 2. Dark Souls (2011) / Elden Ring (2022) — FromSoftware, dir. Hidetaka Miyazaki

**Layers**

| Layer | Sees | Task | Enter/leave |
|---|---|---|---|
| Hub (Firelink Shrine; ER: Roundtable Hold) | Safe place that "connects to many different places" | Q7, Q2 | Walk / warp |
| Bonfire / Site of Grace | Fire = checkpoint + level-up + respawn + (later) warp; ER grace emits golden "guidance" rays | Q7, Q3 | Rest |
| Interconnected playfield | Single folded world; shortcuts (doors, elevators) loop back to bonfires | Q4, Q1 | Walk |
| ER world map | Fog over unexplored; map fragments from monuments overlay terrain; POIs mark even without fragment | Q1, Q8 | Menu |
| ER Stakes of Marika | Extra respawn points near bosses | Q7 | Auto on death nearby |
| Messages/bloodstains (social) | Other players' notes/ghosts | Q3 hints | Online |
| No quest log (DS & ER until 1.03 NPC icons) | — | — | — |

**Q1–Q10**
- Q1: DS — landmarks only, no map; ER — map + player marker (Kitao: you see "your own player position, and … an illustrated icon of a monument in the distance" — https://www.ungeek.ph/2021/08/full-interview-fromsoftwares-yasuhiro-kitao-shares-big-elden-ring-details).
- Q2: Difficulty is the gate: Miyazaki wanted players "to go into the wrong stage and get brutally beaten up so badly that they would automatically know that the stage was not the one to go" (https://gameinformer.com/b/features/archive/2011/11/12/afterwords-dark-souls).
- Q3: DS — none explicit; ER — guidance of grace rays: "so that players would not be unsure of where to go to progress in the main story… refusing to follow the guidance is supposed to in itself feel like a choice" (https://www.frontlinejp.net/2022/03/08/discussing-design-philosophy-elden-ring-release-interview-with-director-miyazaki-part-2-2/).
- Q4: Memory of route + shortcuts; ER: map + Torrent + grace warp.
- Q5: Not addressed (enemies respawn on rest; nothing flags change).
- Q6: Not addressed (no log); ER 1.03 adds NPC icons on map.
- Q7: Bonfire/grace = the answer; Miyazaki: "It serves as a recovery point… respawn point… a place where players can gather… the one place… where users can relax… a place of warmth" (http://soulslore.wikidot.com/das1-variety-is-the-spice-of-death, 2011-02-04).
- Q8: DS — vistas: "you'll be able to travel to any location you can see in the distance" (https://darksouls.wiki.fextralife.com/Articles_and_Interviews); ER — map.
- Q9: Menus don't pause (*Judgment*, well known; not fetched) → no "safe" mode outside the bonfire.
- Q10 New Q: **"Where is home relative to here, and can I make the trip shorter?"** — the shortcut-unlock answers it by changing topology.

**Top solutions**
1. **Bonfire/grace as home + save + respawn + hub of meaning.** Evidence **C** (critical consensus; Wikipedia: widely imitated checkpoint design — https://en.wikipedia.org/wiki/Bonfire_(Dark_Souls)). Driver: secure base; loss aversion bounded by a known return point.
2. **Folded world + shortcuts.** "Walk for hours away from the first safe place, and a door or an elevator brings you back to it in seconds" (https://academy.lerpworks.com/en/learn/case-lordran/). Firelink "small area but … connects to many different places and has many hidden spots" (http://soulslore.wikidot.com/das1-design-works). Evidence **C**. Driver: cognitive-map reward — the player's survey map suddenly gains an edge they discovered (aha).
3. **Guidance of grace + Stakes of Marika (ER) — minimal guidance added via playtesting.** Stakes "resulted from" playtests finding tedious runbacks; "careful not to add too many because adventuring could feel a little bit lukewarm" (https://gameinformer.com/feature/forging-the-future-of-fantasy). Evidence **B/C** (playtest-driven, no numbers published). Commercial **B**: ER 30M+ units (FromSoftware, as of March 2025: https://www.fromsoftware.jp/ww/pressrelease/20250530_eldenring_nightreign_salesdata.html).

**Failures**: NPC quests too easy to lose → Patch 1.03 (17 Mar 2022, 3 weeks after launch) "Added a function to record an icon and the name of an NPC on the map when you encounter that NPC" (https://www.bandainamcoent.com/news/elden-ring-patch-notes-v1-03); reviewers had advised keeping a physical log (https://www.thesixthaxis.com/2022/03/17/elden-ring-update-1-03-patch-notes-adds-npc-log-map-icons-quest-phases-and-more/); critics still call markers "a Band-Aid" and ask for a quest log (https://www.pcgamer.com/elden-rings-npc-quest-markers-are-just-a-band-aid/; https://www.thegamer.com/fromsoftware-next-open-world-game-needs-quest-log-after-elden-ring/). Evidence **B** (designer reversal under load). Miyazaki himself in 2011: "I actually wanted to add a few more objectives for players when they are exploring" (Game Informer above).

**Designer intent**: "Trust players. Players will figure out what to do next." (https://www.gamedeveloper.com/design/hidetaka-miyazaki-s-advice-for-challenging-game-design-trust-players-, 2023). "We didn't want players to get lost and not have any clue of what to do or where to go. So there is an element of guidance, particularly at the beginning." (https://www.ign.com/articles/elden-ring-miyazaki-hidetaka-full-interview-summer-of-gaming)

---

## 3. Ico (2001) / Shadow of the Colossus (2005) — Team Ico (SCE Japan Studio), dir. Fumito Ueda

**Layers**

| Layer | Sees | Task | Enter/leave |
|---|---|---|---|
| Playfield, no HUD (Ico: no HUD/health/map/inventory) | Castle; directed camera | Q1 via architecture | — |
| Ico save couches | Stone sofas; sit with Yorda to save | Q7 | Sit |
| SotC Shrine of Worship | Hub: wake → ride out → kill → return automatically | Q7, Q3 | Automatic after kill |
| SotC sword light | Hold sword in sunlight; beams converge toward next colossus' weak point | Q3, Q4 | Hold button; fails in shade |
| SotC map | Pause map (Start) | Q8 | Menu |
| SotC light pillars | Each slain colossus leaves a sky-high beam | Q6, Q1 | Automatic |

**Q1–Q10**
- Q1: Ico — the castle is designed so "the player would always be aware of its entire structure" (Ueda, https://www.gamesradar.com/why-icos-castle-feels-real-place); camera chosen "so that players do not lose their sense of direction" (http://archive.thegia.com/features/f010831.html).
- Q2: Ico — doors only Yorda opens; SotC — "All locations … accessible from the beginning" (https://www.gamedeveloper.com/design/navigation-in-shadow-of-the-colossus).
- Q3: SotC — sword beam (one target at a time; colossi in linear order); Ico — the escape goal, visible next areas.
- Q4: SotC — beam gives bearing only, not route; "journey … seldom follows a direct route" (https://en.wikipedia.org/wiki/Shadow_of_the_Colossus).
- Q5: Ico — walkways seen earlier "from a different vantage point, often having been modified by the player's actions" (https://research.gold.ac.uk/id/eprint/17320/1/TragedyofBetrayal_DIGRA2015_CameraReady.pdf).
- Q6: SotC — light pillars as "tombstones" and landmarks (Colquhoun, gamedeveloper above).
- Q7: Save couch; SotC auto-return to shrine.
- Q8: SotC map menu; Ico: vistas.
- Q9: Almost no menus → nothing to switch (subtraction).
- Q10 New Q: **"Who am I responsible for while moving?"** — Ico's hand-holding makes navigation relational (route must fit Yorda's abilities).

**Top solutions**
1. **Diegetic directional sensor (sword beam).** Bearing, not path; needs sun; on foot you must stop; on horse you can't steer → "wants you to get a little lost" (gamedeveloper above). Evidence **C**. Driver: active navigation preserves cognitive-map building (links to GPS research, §Theory).
2. **Hub-and-spoke with automatic return** — one constant home (shrine) and 16 radial trips; past trips become landmarks. Evidence **C**.
3. **Subtraction.** GDC 2002 keynote: removing elements raises "quality and density"; "Emotional reality does not equal photo-realistic reality" (https://www.psu.com/news/the-true-brilliance-behind-shadow-of-the-colossus-part-1/). Evidence **C**.

**Failures**: Shade disables the beam ("If you're in a cloudy area, then you're on your own" — https://www.ign.com/wikis/shadow-of-the-colossus-and-ico/Shadow_of_the_Colossus_Basics); Ico's two near-identical symmetric halves divide players (GamesRadar above). Evidence **C**.

**Designer intent**: Ueda on level building: test "if it's a place that players would easily get lost in, and place some kind of landmark, or some kind of guide post… If it's a dark setting, then open some windows." (https://www.gamedeveloper.com/game-platforms/q-a-parsing-fumito-ueda-s-creativity). "Whether it was the girl's animation or the details of the map, I didn't hold back on removing and subtracting elements" (https://shmuplations.com/ico/).

---

## 4. Myst (1993) — Cyan, Rand & Robyn Miller

**Layers**: Linking book (title = in-fiction book you touch to enter) → Myst Island hub → library → linking books to 4 self-contained Ages → back to island. Point-and-click slideshow; cursor shape = only UI; optional "Zip" travel to visited spots. No inventory bar (one page carried at a time), no death (https://en.wikipedia.org/wiki/Myst).

**Q1–Q10**
- Q1: The node/frame you're in; small island; Rand: island "would provide a natural boundary" (https://waytoomany.games/2020/05/21/interview-with-rand-miller-co-creator-of-myst).
- Q2: Ages behind linking books found by puzzle; each Age completable independently.
- Q3: Not told; inferred from notes (Atrus' note), clues.
- Q4: Click forward; Zip.
- Q5: Not addressed.
- Q6: Pages delivered to red/blue books; brothers' messages grow (*Judgment*).
- Q7: No death → no need; island = home.
- Q8: In-world map/planetarium-style devices (*Judgment*: not fetched in detail).
- Q9: No menus at all.
- Q10 New Q: **"Which space's problems am I holding in my head right now?"** — "psychological spaces": each Age contains its puzzles, so the mind can "block off" others (Rand Miller, https://www.pcworld.com/article/448644/deep-dive-with-myst-co-creator-rand-miller-the-full-interview.html).

**Top solutions**
1. **Hub + sealed sub-worlds (Ages) via an in-fiction portal (book).** Scope containment lowers working-memory load. Evidence **C**.
2. **Interface that disappears**: "no inventory, no on-screen arrows or menus, no points or timers - just the world" (http://www.adventureclassicgaming.com/index.php/site/interviews/269). Evidence **C** (commercial hit; sales numbers not fetched).
3. **Design starts from maps**: "We're not game designers; we were place designers, so we just started drawing maps, and the maps kind of fueled the story" (https://grantland.com/features/looking-back-game-myst-20th-anniversary). The pitch was "top-down maps of every island with little notes" (https://cdn.arstechnica.net/wp-content/uploads/2020/01/Myst_Transcript.txt). Evidence **C**.

**Failures**: Zip "can also cause players to miss important items and clues" (Wikipedia above). Obscurity/notes-taking burden is common criticism (*Judgment*, not sourced here).

---

## 5. Outer Wilds (2019) — Mobius Digital, creative dir. Alex Beachum; narrative Kelsey Beachum

**Layers**

| Layer | Sees | Task | Enter/leave |
|---|---|---|---|
| Solar system (real 3D, diegetic) | Planets moving in time; 22-min loop | Q1, Q8 | Fly |
| Ship = home | Cockpit, ship log computer | Q7 | Board |
| Ship Log — Map mode | Entries organised by planet | Q6, Q8 | Ship computer |
| Ship Log — Rumor mode | "Detective board": cards + lines linking clues; "?" for heard-not-visited; "more to explore" marks | Q3, Q6 | Toggle |
| HUD marker | Select any entry → waypoint on HUD | Q4 | From log |
| Signalscope, translator | Diegetic tools | Q4, Q3 | Equip |

**Q1–Q10**
- Q1: Visual of planets; locator. Q2: everything open from start — "Zero gating = no funnel points" (GDC slides: https://media.gdcvault.com/GDC+2021/beachum_gdc_2021(1).pdf). Gates are knowledge: POIs "simply teach players how to reach [Curiosities]" (https://sbekumod.github.io/Assets/OWtesi.pdf).
- Q3: Rumor-mode question marks + lines; NPC traveller menu routes by intent ("I think I'll start with something small" → Attlerock).
- Q4: Log entry → HUD marker. Q5: "New" entries per loop; unread Nomai text "visually different" (GDC slides).
- Q6: Ship log = "external representation of the player's knowledge" (https://rigdern.github.io/a/learning-about-learning/learning-design-insights-from-outer-wilds/index.html).
- Q7: Loop reset returns you to campfire start; ship.
- Q8: Map mode + flying out.
- Q9: Log lives in the ship (diegetic place) (*Judgment*).
- Q10 New Q: **"What do I know, and what do I know I don't know?"** — navigation by knowledge, not keys.

**Top solutions**
1. **Ship log as a knowledge map, strictly honest.** "Entries are only what we're 100% certain the player knows … NO leaps of logic" (GDC slides p.60). Beachum: "I tried really hard to make sure the ship log doesn't tell you anything you technically don't know" (https://castro.fm/episode/XU2TVC). Evidence **C**.
2. **Rumor mode added after a failed playtest.** Originally only Map mode; "a play test at Annapurna that went very poorly"; rumor mode "detective board" added ~1 year before launch (castro above; https://www.youtube.com/watch?v=LbY0mBXKKT0). Evidence **C/B** (playtest-driven reversal; no numbers).
3. **Pull, not push; three content depths.** Surface → mid → hidden; answers only at hidden level; "Average time from game start to players investigating Nomai text ranges from 30 minutes to 2–3 hours" (GDC slides p.42). Evidence **B** (play data cited in GDC talk). Driver: curiosity/information-gap; autonomy.

**Failures**: Post-launch patches to clarify warp system and murals; Beachum: "it's always our fault in terms of design" (https://medium.com/@cordialkobold/interview-with-alex-beachum-creative-director-of-outer-wilds-a01bb9631e20). Design admittedly alienates achiever/killer types (GDC slides p.17).

**Designer intent**: "Curiosity is Outer Wilds' sole driving force… No missions, assigned objectives… Knowledge is the only gameplay reward" (GDC slides p.15). "It's surprisingly okay for the player to not always and immediately know what they are doing" (p.78).

---

## 6. Hollow Knight (2017) — Team Cherry, Ari Gibson & William Pellen

**Layers**

| Layer | Sees | Task | Enter/leave |
|---|---|---|---|
| Town hub (Dirtmouth) on top; Forgotten Crossroads "the crossroads to the world" | Shops incl. Iselda's map store | Q7, Q2 | Walk/Stag |
| Area map (bought from Cornifer) | Sketchy partial map with landmark drawings | Q1, Q8 | Buy, then menu |
| Quill | Redraws explored rooms — **only when resting at a bench** | Q6 | Buy 120 geo |
| Compass charm | Shows your position on map (costs a charm slot) | Q1 | Equip |
| Pins | Bench/stag/vendor pins bought from Iselda; custom markers | Q4 | Buy |
| Benches | Save/respawn | Q7 | Sit |
| Stag stations / tram | Fast travel | Q4 | Ride |
| Quick map | Hold button: current area | Q1 | Hold |

**Q1–Q10**
- Q1: Requires compass charm + map; otherwise landmarks and Cornifer's humming (RPS: "a bright light in the darkness" — https://www.rockpapershotgun.com/the-joy-of-cornifer-in-hollow-knight).
- Q2: Ability gates softened; "chipped away at a lot of the hard gating… power-ups ended up being optional" (https://www.pcgamer.com/how-to-design-a-great-metroidvania-map).
- Q3: Not told; explore. Q4: stag/tram; pins. Q5: not addressed. Q6: quill-drawn map = where you've been. Q7: benches. Q8: full map pane. Q9: inventory pane cluster.
- Q10 New Q: **"Am I lost on purpose?"** — lostness is a phase you pay to exit.

**Top solutions**
1. **Map as earned, sold artefact (Cornifer) + consolidation at rest (quill updates at bench).** Evidence **C** (critical consensus: A.V. Club "ingenious", https://www.avclub.com/hollow-knights-ingenious-map-system-ensures-theres; *Judgment*: the bench-only redraw mimics memory consolidation during rest). Commercial **B**: ~15M copies (https://www.ign.com/articles/hollow-knight-reaches-15-million-copies-sold).
2. **"98% pure" physically coherent space with many inter-area connections** so players "can map it in your head" (Pellen, PC Gamer above). Evidence **C**.
3. **Scope cut for cognitive load**: Bone Forest removed because "the game's already quite overwhelming… you have to keep a lot of it in your head… pushing people too far in … how much information they could retain" (Gibson, PC Gamer). Evidence **C**.

**Failures**: Being mapless after first entering an area; missing Cornifer means a trip back to Dirtmouth (letter: "If you're feeling lost, why not pop up to our store" — https://hollowknight.wiki/w/Cornifer). Gibson admits players "get lost, really easily" (PC Gamer). *Judgment*: compass costing a charm slot taxes Q1.

**Designer intent**: "We kind of ask for a lot of faith from players… if you explore you'll eventually find your way. And it'll be worth it" (Pellen, PC Gamer). "Everything we're concerned about is convincing people they're in the place." (Gibson)

---

## 7. Disco Elysium (2019) — ZA/UM, lead designer/writer Robert Kurvitz

**Layers**: Isometric district (Martinaise, gated in stages: only Rue de Saint-Ghislaine until Day 3 — https://discoelysium.wiki.gg/wiki/Martinaise) → Journal with TASKS tab + hand-drawn axonometric MAP tab listing open "White Checks" (retryable) by place and colour → Thought Cabinet (inventory of ideas; 53 thoughts, 12 slots, research timer) → Skills sheet → dialogue as main "terrain". Fast travel unlocked by buying the Map of Martinaise and visiting 2 of 3 points (https://www.gamebanshee.com/discoelysium/walkthrough/gameplaynotes.php). In-game clock; time passes mainly through dialogue; ~1 real day per meticulous in-game day (https://discoelysium.com/devblog/2019/09/24/disco-elysium-is-a-colossal-game).

**Q1–Q10**
- Q1: Location label + isometric view. Q2: geographic gates by day/plot; checks by skill level.
- Q3: Tasks list — "intended to give the player direction"; "vast majority … not necessary for plot progression" (https://discoelysium.wiki.gg/wiki/Tasks). ~100 tasks, no main/side split: "We don't differentiate between side-quests and main quests" (devblog above).
- Q4: Walk; fast travel late. Q5: "Tomorrow brings new NPC's to old locations, as the world changes each day" (devblog). Q6: Journal; Thought Cabinet = record of who you've become. Q7: Whirling-in-Rags room/sleep (*Judgment*). Q8: Journal map. Q9: Time frozen in menus.
- Q10 New Q: **"Where am I in my own head?"** — the Thought Cabinet maps an inner space, navigated like a place.

**Top solutions**
1. **Journal map fused with retryable checks** ("spatial to-do list": select a person, portrait pins onto the district — https://playcraft.space/gallery/e/disco-elysium-journal-white-checks-over-the-martinaise-map). Evidence **C**.
2. **Thought Cabinet**: "a unifying element that ties all the game's systems together"; average character internalises 16 of 53 thoughts (https://discoelysium.com/devblog/2019/09/30/introducing-the-thought-cabinet). Evidence **C** (internal number, not outcome data).
3. **Small, dense district instead of large world** (size ~Planescape, density ~5× — https://www.pcgamer.com/disco-elysium-is-a-colossal-game-that-can-take-90-hours-to-finish/). Evidence **C**.

**Failures**: Kurvitz called the Thought Cabinet a "quagmire" feature that almost sank the project (https://www.gamespot.com/articles/how-the-feature-that-almost-sunk-disco-elysium-was/1100-6472676). Evidence **C**.

---

## 8. Animal Crossing (2001–2020) — Nintendo EAD/EPD, Katsuya Eguchi; Stardew Valley (2016) — Eric Barone (ConcernedApe)

**Layers (AC)**: Home (house you expand) → town/island (small, fixed) → shops with real opening hours → museum/bulletin board/letters → real-time clock & calendar (seasons, events, moon). **Stardew**: Farmhouse bed (day 6am → must sleep; pass out at 2am and wake in bed — https://stardewvalleywiki.com/Day_Cycle) → farm → town with NPC schedules → calendar (birthdays, festivals) → mines (depth floors, elevator every 5 — *Judgment*/common knowledge, not fetched).

**Q1–Q10**
- Q1: Tiny known map. Q2: Shops/time windows ("Tom Nook's shop was closed" when Kyogoku came home late — https://www.nintendo.com/en-gb/Iwata-Asks/Iwata-Asks-Animal-Crossing-New-Leaf/Animal-Crossing-New-Leaf/2-Being-the-Mayor/2-Being-the-Mayor-738645.html).
- Q3: Daily rhythm: villagers' requests, letters, appointments ("Tex… invite you to come over next week at 10:00AM" — https://uxdesign.cc/the-value-of-time-in-animal-crossing-14f80dfcde8d). Eguchi: "a town with a to-do list, but the to-do list shouldn't feel like bad pressure… good stress" (https://www.gamedeveloper.com/design/an-inviting-mini-world-how-nintendo-made-i-animal-crossing-i-).
- Q4: Walk; trivial. Q5: **The core question** — weeds, visitors, seasonal fish; time travel shows "weeds are going to come, plants are going to die" (https://www.gamedeveloper.com/design/crossing-into-the-mainstream-katsuya-eguchi-on-i-animal-crossing-i-).
- Q6: House contents, museum, catalog. Q7: Home always one walk away; Stardew bed ends day = save. Q8: Calendar/seasons. Q9: Minimal.
- Q10 New Q: **"When am I?"** — time, not space, is the primary axis of navigation.

**Top solutions**
1. **Real-time clock = shared, asynchronous rhythm**; seed idea: family members play "together" at different times via letters/board (https://www.gamedeveloper.com/design/book-excerpt-animal-crossing; http://www.nintendoworldreport.com/interview/11229/animal-crossing-interview). Evidence **B** for reach: New Horizons 50.63M units (Nintendo IR link above). Driver: habit loop, appointment mechanics, real-world synchrony.
2. **Home as the growing artefact** (desire→satisfaction→sharing→stimulus→desire, Eguchi GDC 2006: https://www.gamedeveloper.com/design/gdc-is-that-a-franchise-in-your-pocket-an-i-animal-crossing-wild-world-i-case-study). Evidence **C**.
3. **Stardew: bounded day + bed reset** gives a natural "plan → do → sleep" unit; Barone: avoid "hyper-stimulating" pacing (https://www.npr.org/2025/01/24/g-s1-44510/the-legacy-and-future-of-the-farming-game-stardew-valley). Evidence **C**.

**Failures**: Fixed hours frustrate players with late schedules (Iwata Asks above); clock-tampering punished by weeds. Evidence **C**.

---

## 9. Minecraft (2009/2011) — Mojang, Markus Persson; later Jens Bergensten

**Layers**: Infinite procedural world → world spawn (fixed) → personal spawn via bed → compass (always points to world spawn; lodestone re-targets) → map item (reveals as you walk, top-down) → coordinates (F3/Bedrock option) → Nether as 1:8 shortcut layer → player-built landmarks, paths, signs.

**Q1–Q10**
- Q1: Landmarks/sun; map item; coordinates. Q2: Everything; danger by night/biome. Q3: Self-set; later structures with "exploration maps" (Mojang guidelines: searching for features "is NOT fun", so they added exploration maps, eye of ender — https://archive.org/stream/minecraft-game-design/Minecraft_Game_Design_-_Complete_Edition_djvu.txt). Q4: Compass, Nether portals, built paths. Q5: Not addressed. Q6: Your own constructions + filled maps. Q7: Bed sets spawn (https://minecraft.wiki/w/Tutorial:Navigation); compass → spawn ("so you can actually find your way back home again" — https://www.minecraft.net/en-us/article/taking-inventory--compass). Q8: Map zoom levels (cartography table). Q9: Inventory only.
- Q10 New Q: **"How do I make this place legible to myself?"** — players author Lynch elements (towers = landmarks, roads = paths, walls = edges).

**Top solutions**
1. **Home-pointing compass** (single-purpose, diegetic; Mojang principle: "describe what happens using objects in the game world, and not rely on text messages or a heads-up display… map, compass, and clock" — archive.org above). Evidence **C**.
2. **Player-built legibility** (wiki advice: memorise landmarks, build markers visible from hundreds of blocks — https://minecraft.wiki/w/Tutorial:Things_not_to_do). Evidence **C**.
3. **Getting lost as a real cost** (death far from base; no in-game pointer to "where I built" — https://gaming.stackexchange.com/questions/376042/whats-the-best-way-to-find-your-base-in-minecraft). This is a *failure* that became culture.

---

## 10. Half-Life 2 (2004) / Portal (2007), Portal 2 (2011) — Valve (cabal process)

**Layers**: Front menu → chapter levels (linear) → playfield with light, lines, props as cues; HL2 keeps a small HUD (health, suit, ammo) but no map, minimap or objective markers (*Judgment*/author knowledge, not fetched); Portal: test chamber loop (door → GLaDOS line → test → line), chamber number signage.

**Q1–Q10**: Q1 chapter title + signage; Q2 level geometry (force fields etc.); Q3 environment cues; Q4 light/geometry; Q5 not addressed; Q6 chapter select; Q7 checkpoints/quick-save; Q8 not addressed (linear); Q9 minimal; Q10 New Q: **"What is the one thing to look at now?"** — attention direction is the whole navigation system.

**Top solutions**
1. **Playtest-calibrated environmental cueing.** HL2 commentary: early plaza produced "a feeling of being lost, or worse, confused"; "extensive testing … helped us find the right visibility for the alley forward, using lighting, layout, and a wooden crate – an object players have already used as a sign they're headed in the right direction" (https://www.combineoverwiki.net/wiki/Developer_commentary/Half-Life_2). Evidence **C/B** (systematic observation, no numbers). Driver: learned signifiers (Hodent's "inviting signs").
2. **Weekly naive-playtester observation, no hints**: "Don't give them hints. Don't answer any questions" (https://cdn.cloudflare.steamstatic.com/apps/valve/2006/GDC2006_HL2DesignProcess.pdf). Evidence **C** (process).
3. **Subtraction of visual clutter**: early cluttered Portal chambers "distracted players to the point where it actually interfered with the portal training process. So we simplified the art style" (https://theportalwiki.com/wiki/Portal_developer_commentary). Evidence **C**. Ritual loop as orientation: "you have to show the normal routine before the abnormal becomes surprising" (Adam Foster, https://www.rockpapershotgun.com/specially-level-with-me-adam-foster-part-two).

---

## 11. Death Stranding (2019) — Kojima Productions, Hideo Kojima

**Layers**: Map screen with tiltable 3D terrain for route planning ("tilting the map … check the steepness" — https://kojimaproductions.jp/en/death-stranding-directors-cut-beginners-guide) → route lines drawn by player → Odradek scanner (terrain colour danger; BT proximity by rotation/colour, deliberately not exact position — https://hypebeast.com/2019/12/hideo-kojima-yoji-shinkawa-death-stranding-scenes-and-elements-breakdown) → Chiral Network: connecting a node unlocks detailed map + other players' structures/signs → social strand layer (footpaths worn by many players; "Likes") → distribution centres/private rooms (home/save).

**Q1–Q10**: Q1 map + scanner; Q2 terrain + network coverage; Q3 orders board; Q4 **player-planned routes** on 3D map; Q5 other players' new structures appear; Q6 network connected = progress; Q7 private room/safe houses; Q8 map tilt/zoom; Q9 terminals; Q10 New Q: **"Who walked here before me?"** — social traces as wayfinding ("If you see a footpath, that almost certainly means that it's safe" — https://www.polygon.com/death-stranding-guide/2019/11/7/20951435/beginners-getting-started-strand-game-porter-bridges).

**Top solutions**
1. **Asynchronous social infrastructure** (footpaths, ladders, signs from others). Evidence **C** (Gamecritics: "online sharing is one of the coolest things ever" — https://gamecritics.com/jarrod-johnston/death-stranding-review). Driver: stigmergy (*Judgment*).
2. **Connecting = revealing** (map detail unlocks per network node). Evidence **C**.
3. **Route planning as play** (terrain, weight, tools). Evidence **C**.

**Failures**: Widely criticised as tedious traversal: "trudging … 10, 20, 30-plus minutes walking alone" (https://arstechnica.com/gaming/2019/11/death-stranding-is-kojima-unleashed-and-its-as-weird-as-youd-expect/); "plotting and trudging along a dotted line on your map screen, again and again" (https://www.videogameschronicle.com/review/death-stranding/); first ~10 hours "a tedious slog" (https://www.gq.com/story/death-stranding-review). Evidence **C** (critical consensus). Kojima expected it: "they don't get it at first… just walking is really fun" (https://gameinformer.com/interview/2019/09/16/hideo-kojima-answers-our-questions-about-death-stranding).

---

## 12. Hades (2020) — Supergiant Games, creative dir. Greg Kasavin

**Layers**: House of Hades hub (rooms, characters, Contractor, Mirror of Night, Codex) → run entrance → biome chain of rooms with door reward icons (choose next room by previewed reward — *Judgment*/common knowledge) → death → Pool of Styx → hub again with new dialogue.

**Q1–Q10**: Q1 biome name/visuals; Q2 door reward symbols; Q3 prophecies/relationships/upgrades; Q4 linear chambers; **Q5 core**: every return unlocks new eligible lines referencing the run that just ended (https://teemo.dev/game-design/hades/systems/narrative-gating-and-relationship-system); Q6 Codex, relationship hearts; Q7 death = return home (not failure); Q8 not addressed; Q9 hub is physical, menus diegetic-ish (Mirror); Q10 New Q: **"Did failure move me forward?"** — death recast as navigation back to home with progress.

**Top solutions**
1. **Home hub that changes every return.** "It was an explicit goal of our early development, to take the pain out of dying"; "the moment of death isn't about rage-quitting" (https://www.gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death). Evidence **C**. Industry calls it a replicable subgenre structure (https://www.gamedeveloper.com/design/hades-devs-say-accidentally-inventing-a-subgenre-was-surreal-).
2. **Contextual reactivity** ("you just found Zeus while you were about to die" → matching line — https://www.rockpapershotgun.com/how-hades-plays-with-greek-myths). Evidence **C**.
3. **Self-aware loop**: "why not have the characters acknowledge … the cycle?" (Kasavin, https://www.gameshub.com/news/features/hades-greg-kasavin-breaks-down-supergiants-unique-approach-to-narrative-262459-2193/). Evidence **C**.

---

## THEORY — wayfinding science mapped onto Q1–Q10

### T1. Kevin Lynch, *The Image of the City* (1960)
Facts: From sketch maps and interviews in Boston, Jersey City, LA, Lynch found people organise city images with five elements (https://www.cooldavis.org/wp-content/uploads/2022/03/THE_IMAGE_OF_THE_CITY_Kevin_Lynch.pdf):
- **Paths** — channels the observer moves along; "for many people, these are the predominant elements".
- **Edges** — linear breaks not used as paths; "lateral references rather than coordinate axes"; barriers or seams.
- **Districts** — areas with common character, entered "inside of".
- **Nodes** — strategic junctions/concentrations.
- **Landmarks** — external point references.
- **Legibility** = ease with which parts "can be recognized and can be organized into a coherent pattern"; **imageability** = quality that evokes a strong image; depends on identity, structure, meaning (https://sk.sagepub.com/ency/edvol/urbanstudies/chpt/lynch-kevin). Evidence **A-** (qualitative but replicated internationally, per Lynch 1984 cited in FDG'25 paper).

**Game evidence**: FDG 2025 study (Sable, A Short Hike; n=3 fully analysed — small, preliminary): **landmarks and edges** prominent; paths, nodes, districts weak; a new sixth element **"characters/NPCs"** used as reference points because NPC routines are dependable (https://dl.acm.org/doi/full/10.1145/3723498.3723837). Evidence **C** (n too small for A). FDG 2025 companion paper recommends layered cues (orientation cues e.g. distant mountains, associative cues, beacons) and coherent global reference frames (https://dl.acm.org/doi/full/10.1145/3723498.3723826).

**Mapping Lynch × Q (with exemplar games)**

| Q | Primary Lynch element | Best exemplars |
|---|---|---|
| Q1 Where am I? | Landmark + District | BotW towers; SotC light pillars; Hollow Knight district art |
| Q2 Where can I go? | Edge (barrier vs seam) | DS difficulty-edges; DE gated districts; TotK sky/depth layers |
| Q3 What next? | Landmark as beacon ("gravity") + NPC | BotW gravity; ER grace rays; Outer Wilds rumor cards |
| Q4 How do I get there? | Path | Death Stranding routes; HK stag lines; DS shortcuts |
| Q5 What changed? | Node (place you return to) | Hades House; AC town |
| Q6 Where have I been? | District filled-in / player-made landmarks | HK quill map; BotW stamps; Minecraft builds |
| Q7 Return home? | Node = home | Bonfire, Shrine of Worship, bed |
| Q8 Whole? | Districts composed into a map | ER fragments; BotW 4 zooms; OW map mode |
| Q9 Switch modes? | (outside Lynch) → diegesis | Sheikah Slate, ship log, Mirror |
| Q10 | Characters (FDG'25 addition) | Cornifer, OW travellers, Hades cast |

*Judgment*: games repeatedly convert Lynch's **node** into a **home** with save/respawn (bonfire, bench, couch, bed, ship, House of Hades) — a function cities don't have.

### T2. Diegetic UI taxonomy — Fagerholt & Lorentzon (2009), "Beyond the HUD", Chalmers MSc
Two questions: "Is the UI element existing in the fictional game world?" × "Is it visualised as part of the 3D game space?" (https://gdad.wiki/wiki/sources/source-beyond-the-hud; original https://publications.lib.chalmers.se/records/fulltext/111921.pdf). Common 4-type reading: **non-diegetic** (HUD overlay; suits "high level of detail"), **diegetic** (in fiction and space: Dead Space spine), **spatial/geometric** (in space, not fiction: L4D outlines, Mirror's Edge runner vision), **meta** (fiction, not space: blood spatter) (https://www.gamedeveloper.com/design/user-interface-design-in-video-games). Final model in the thesis has six categories (adds meta-perception split and signifiers) — per gdad.wiki summary.

**Empirical test (A)**: Peacocke, Teather et al. 2018, *Entertainment Computing* 26:41–58, four controlled experiments (n=20–24 each, expert FPS players): **no display class universally best**. Ammo: diegetic number-in-game best (central placement). Health: HUD numbers best; blood-splatter meta "should be avoided". **Navigation (maze): spatial "navigation line" best (step-error 1.03); rotating minimap statistically comparable; diegetic compass worst (step-error 2.43, 42% trials incomplete); light pillar and wayfinding arrow also significantly worse than minimaps.** Authors: "Our results do not support existing recommendations to use alternative displays whenever possible" (http://www.csit.carleton.ca/~rteather/pdfs/Entertainment-Computing-HUDS.pdf). Caveat: maze task, short-term efficiency; does not measure cognitive-map formation or enjoyment.

**Mapping taxonomy × Q**

| Q | Auteur choice | Class |
|---|---|---|
| Q1 | Landmarks, towers, couches | Diegetic (world itself) |
| Q3 | Grace rays, sword beam, BotW pin beacons | Spatial (beam in world) / diegetic tool |
| Q4 | Pins on minimap; OW HUD marker; DS route line | Non-diegetic / spatial |
| Q6 | Ship log, quill map, Slate album | Diegetic device holding non-diegetic content |
| Q7 | Bonfire, bench, bed | Diegetic place |
| Q8 | Map screens | Non-diegetic but framed as in-fiction object (Slate, Cornifer map) |
| Q9 | Single in-fiction device as "meta home" | Diegetic container |

*Judgment*: auteurs keep **direction** diegetic/spatial (Q3) and **memory/state** in a diegetic device with a non-diegetic display (Q6, Q8). The 2018 data says direction-only aids (compass, beacon, light pillar) cost efficiency vs. path/map aids — which is consistent with auteurs *wanting* some lostness (SotC, HK, DS), and with Elden Ring/Outer Wilds adding map/log layers when lostness overflowed.

### T3. Celia Hodent — game UX (The Gamer's Brain)
UX = Usability + "Engage-ability". Seven usability pillars: **Signs & Feedback, Clarity, Form Follows Function, Consistency, Minimum Workload, Error Prevention/Recovery, Flexibility** (https://media.gdcvault.com/gdc2016/Presentations/Hodent_Celia_TheGamersBrain.pdf; https://celiahodent.com/understanding-the-success-of-fortnite-ux). Two sign types: **inviting signs** (draw attention, guide) and **informative signs** (legible but quiet); "Inviting signs can sometimes be more subtle (such as in the Zelda example) if the intent is to make the player feel discovery" (https://celiahodent.com/ux-practices-epic-games). Brain constraints: attention as spotlight, inattentional blindness, forgetting curve, working memory "about 5 items more or less 2" during onboarding (https://celiahodent.com/gamers-brain-ux-onboarding/). Evidence **B/C** (framework grounded in cognitive psych; applied at Epic).

Mapping: Q3 = inviting signs (HL2 crate, BotW gravity); Q1/Q6 = informative signs; Q9 = consistency (one device); Q7 = error recovery (bonfire/autosave); Minimum Workload = HK Bone Forest cut, Myst "psychological spaces", Outer Wilds log "keeping track … should not be the challenging part".

### T4. Information scent / foraging (Pirolli & Card 1999, *Psychological Review* 106(4))
Information scent = "the (imperfect) perception of the value, cost, or access path of information sources obtained from proximal cues" (https://www.websiteoptimization.com/speed/tweak/scent/ quoting Pirolli & Card 1999; theory: http://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/280uir-1999-05-pirolli.pdf). Foragers maximise value/cost; strong scent widens attention, weak scent hurts navigation (https://dl.acm.org/doi/10.1145/345513.345304). Evidence **A** (lab + model-validated, SNIF-ACT).
Mapping: Q3/Q4 in games = proximal cue → distal reward. BotW "gravity" ranks scent by visibility; Outer Wilds "?" cards and "more to explore" marks are scent for knowledge; Hades door icons are literal scent (reward preview); DS footpaths = social scent. *Judgment*: the auteur move is to make scent **perceptual** (light, silhouette, sound — Cornifer's humming) rather than textual.

### T5. Cognitive maps & active navigation
- Cognitive map (Tolman 1948; O'Keefe & Nadel 1978): survey knowledge enables shortcuts/detours; hippocampal place/grid cells; landmark anchoring via parahippocampal/retrosplenial cortex (https://pmc.ncbi.nlm.nih.gov/articles/PMC6028313; https://journals.physiology.org/doi/full/10.1152/jn.00005.2017). Evidence **A**.
- GPS harms self-guided spatial memory: Dahmani & Bohbot 2020, n=50 cross-sectional + 13 longitudinal: more lifetime GPS use → worse spatial memory; more GPS use over 3 years → steeper decline in hippocampal-dependent strategy (https://www.nature.com/articles/s41598-020-62877-0). Longitudinal n small (noted by https://cognitiveresearchjournal.springeropen.com/articles/10.1186/s41235-024-00545-x). 2024 systematic review/meta-analysis finds negative associations overall (https://www.sciencedirect.com/science/article/pii/S0272494424001907; effect-size details not fetched — page returned error). Ishikawa et al. 2008: GPS group stopped more and travelled further than map/no-aid groups (listed in same review). Smartphone map users learn routes worse than paper-map users and don't perceive it (https://doi.org/10.1080/13875868.2021.1969401). Evidence **A** (multiple studies; effect modest).
- Alternative: **beacon-based audio** (Microsoft Soundscape) produced more exploration and more accurate mental maps than turn-by-turn (https://www.nature.com/articles/s41598-021-87148-4). Evidence **A-** (single study).

Mapping: Turn-by-turn waypoint = high Q4 efficiency, low Q1/Q8 learning. Beacon/bearing-only (SotC sword, BotW pin beacons, grace rays) ≈ Soundscape: direction without route → active navigation → map formation. Peacocke 2018 shows the short-term cost of exactly this trade. *Judgment*: auteurs choose beacon over route for Q3/Q4 because they optimise for Q1/Q8 (owning the map) and for the "aha" of shortcuts, accepting efficiency loss; they add path/map aids only where lostness turns into stress (ER guidance, OW rumor mode, ER 1.03).

### T6. Q-by-Q synthesis table (theory → best auteur instance)

| Q | Theory lever | Best instance | Evidence |
|---|---|---|---|
| Q1 | Landmarks + anchored cognitive map | BotW towers; SotC pillars | C (+A for theory) |
| Q2 | Edges; difficulty as soft edge | DS/ER "beaten so badly" | C |
| Q3 | Information scent; inviting signs; gravity | BotW gravity (heatmap fix) | B |
| Q4 | Beacon vs route (GPS literature) | Pins/beacons; DS player routes | A (theory) / C |
| Q5 | Node revisited with change | Hades House; AC real clock | C / B (sales) |
| Q6 | External memory; honest record | OW ship log ("100% certain") | C |
| Q7 | Error recovery; home node | Bonfire/grace; bench; bed | C |
| Q8 | Survey knowledge | ER map fragments; HK bought maps | C |
| Q9 | Consistency; one diegetic container | Sheikah Slate; ship computer | C |
| Q10 | Characters as Lynch 6th element; time as axis | Cornifer; AC clock; Hades cast | C |

---

## Cross-game patterns in this cluster (candidate invariants)

1. **Home node with save + respawn + meaning** is near-universal (bonfire/grace, bench, couch, shrine, ship, bed, House of Hades). Cities don't have it; games add it to Lynch's node. Best version changes every return (Hades, AC) so Q5 is answered at home.
2. **Beacon, not route.** Auteurs give bearing (sword beam, grace rays, pins, Cornifer's humming), rarely a turn-by-turn line. Science: active navigation builds the cognitive map (A); cost: lower short-term efficiency (Peacocke 2018, A).
3. **Map is earned or authored, not given**: tower climb, bought from a cartographer, fragments at monuments, Lightroots, quill updates at rest, player stamps/pins. Revealing = progress.
4. **Gates are soft and legible**: difficulty, knowledge, time windows, ability — rarely locked doors with keys. Outer Wilds pushes this furthest (knowledge only).
5. **Guidance is added back under telemetry/playtest pressure**: BotW gravity (heatmaps, B), Outer Wilds rumor mode (failed playtest), ER Stakes (playtests) and NPC map icons (patch 1.03, B), Valve crate/lighting. Pure subtraction overshoots; the shipped equilibrium is "minimum guidance that prevents stress".
6. **Honest external memory**: the best logs record only what the player knows (OW), keep state in one diegetic device (Slate, ship log), and redraw at rest (HK). Missing memory is the most-criticised failure (ER quest log).
7. **Landmarks + edges + characters** carry navigation in games more than paths/districts (FDG'25, C); NPCs are dependable landmarks (Cornifer, OW travellers, Hades cast).
8. **Scope cut for working memory**: HK cut its biggest area because players couldn't retain more; Myst seals each Age; DE uses one dense district. Coherent, physically true space (HK "98% pure", DS folded world) makes the map learnable.
9. **Ranked visibility ("gravity") answers "what next?" without text**: the largest landmark pulls first, mid-scale occluders create reveal, small ones set tempo (triangle rule at 3 scales).
10. **Time can be the navigation axis** (AC real clock, Stardew day, OW 22-min loop, DE days): "when" structures "what next" as strongly as "where".
