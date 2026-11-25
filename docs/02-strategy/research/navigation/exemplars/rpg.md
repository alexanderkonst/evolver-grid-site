# Navigation dossier — Western RPG cluster: Mass Effect 1/2/3/Andromeda, Fallout 1/2/3/NV/4/76, Cyberpunk 2077

Compiled 2026-11-24 per `SCHEMA.md`. Sources: web_search + web_fetch only. Evidence grades: **A** = study / large-n data; **B** = hard numbers (sales, telemetry, patch notes, platform data); **C** = designer interview, critical consensus, fan memory. *Judgment* = my inference, not a sourced fact.
Credits (studio/lead) not separately sourced are marked "(credit not verified here)".

---

## Mass Effect 1 (2007, BioWare; project director Casey Hudson, lead designer Preston Watamaniuk — credit not verified here)

### 1. Navigation layers (outermost → innermost)
| Layer | What the player sees | Task it solves | Enter / leave |
|---|---|---|---|
| Galaxy Map (diegetic hologram in Normandy CIC) | 4 nested scales: Galaxy → Cluster → System → Planet (https://masseffect.fandom.com/wiki/Galaxy_Map) | Choose destination; see the whole | Walk to CIC console; only the CO can use it (same source) |
| Normandy SR-1 (hub ship, 3 decks) | Crew, shops, briefing between missions (https://en.wikipedia.org/wiki/Mass_Effect_%28video_game%29) | Safety, return home, social progression | Galaxy map → land; return after mission |
| Planet surface (Mako) / hub cities (Citadel) | Free-roam uncharted worlds by M35 Mako; on-foot hubs (same) | Exploration, side content | Land from planet layer |
| HUD radar/markers | Radar blips toward POIs; Mako drives toward "nearest radar blip" (https://www.gamesradar.com/flawed-features-mass-effect-1-we-still-kind-miss/) | Local direction | Always on |
| Journal (Missions/Assignments tabs) + Codex | Step-by-step entries, e.g. Noveria entries name exact locations ("roof of Peak 15") (https://www.pcgamer.com/mass-effect-3s-ending-isnt-as-bad-as-navigating-its-quest-log) | What next / why | Pause menu |
| Elevators | Long in-fiction load transitions (https://digitalchumps.com/2009/11/25/roundtable-interview-mass-effect-2-executive-producer-casey-hudson-part-3/) | Masked loading between zones | Automatic |

### 2. Navigation questions
- Q1 Where am I? Galaxy map always opens at current location; on surface, radar + map. 
- Q2 Where can I go? Galaxy map shows main-story locations but **not** side-mission destinations; player must read the journal, memorize names ("Mavigon of the Han system in the Gemini Sigma cluster"), and find them; a reviewer physically wrote destinations down (http://www.thatgamesux.com/mass-effect-2s-galaxy-map-offers-information-when-you-need-it, 2012-02-08).
- Q3 What next / why? Journal is detailed and step-wise (PC Gamer above). Cutscenes name nebula but not planet (https://www.stevebromley.com/blog/2011/01/10/usability-thoughts-mass-effect/).
- Q4 How to get there? Point-and-select reticle on galaxy map; on planets, drive toward radar blip, often over "nearly vertical cliff" (GamesRadar above).
- Q5 What changed? Not addressed: "you don't know when your squad mates have new conversation options… running around your ship chatting folks up only to rehash old conversations" (https://aimlesslygoingforward.com/blog/2021/06/26/mass-effect-1-remaster).
- Q6 Where have I been? Weak: "The travel map doesn't show you which sectors or planets you've explored already (I had to keep a separate checklist outside of the game)" (same).
- Q7 Return to safety? Return to Normandy is one action from any landed planet; Normandy = home.
- Q8 Whole / zoom? Galaxy map's nested-scale zoom is the series' signature solution (Fandom Galaxy Map).
- Q9 Mode switching? Galaxy map is reached by walking to a physical console (diegetic) — mode change is spatial, not a menu.
- Q10 (new) *Pacing of optional vs. critical content*: designers expected Mako missions to read as "value-add"; players held them to main-quest quality (see §5).

### 3. Most successful solutions
1. **Diegetic multi-scale galaxy hologram on the ship.** Mechanics: 4 zoom levels, entered by walking up to the CIC table. Evidence **C**: became the series' persistent spine (kept in ME2, ME3, adapted in Andromeda; Fandom Galaxy Map); praised as one of the "enjoyable pieces of interface design" even by a hostile UI critic (http://gamedesignreviews.com/reviews/mass-effect-massive-interface-fail-part-iii/, 2009-11-10). Driver: *nested spatial hierarchy* (overview → detail) + diegesis (map is a place, so "go to map" = "go to bridge").
2. **Ship-as-hub.** Normandy is base of operations for crew, gear, travel (Wikipedia ME1). Evidence **C**: retained and expanded in every sequel (ME2's SR‑2 twice the size with 4–5 decks: https://www.gamedeveloper.com/design/mass-effect-meaning-through-design, 2012-10-04). Driver: *home base / safe anchor* that is also the travel console.

### 4. Failures / criticism
- Mako/uncharted worlds: repetitive "land on a planet, enter the outpost, shoot the bad guys, return to the Normandy, rinse and repeat" (https://retromo.substack.com/p/mass-effect-pc-2007, 2025-08-15); "copy-pasted… same drive over or around mountains to a familiar bunker" (https://www.pcgamer.com/mass-effect-1-legendary-edition-review/, 2021-05-19); "most divisive vehicle in video game history" (Escapist via https://en.wikipedia.org/wiki/Mako_(Mass_Effect)). Removed as drivable vehicle in ME2 "due to the substantial negative feedback" (same).
- Side destinations absent from galaxy map (thatgamesux above).
- No visited-state on map; no "new dialogue" indicator (aimlesslygoingforward above).
- Slow elevators as loading masks (same; Hudson admits "we missed an opportunity", see §5).

### 5. Designer intent (verbatim)
- Casey Hudson: "The way we looked at the Mako missions is that they would be a value-add… When people played *Mass Effect*, they perceived the Mako missions as on an equal footing with the other missions and applied the same quality expectations to those… if we're going to do something that's a value-add, it has to be perceived as a value-add, or it has to withstand the same richness and quality as the rest of the story… No one plays it wrong." (Engadget/Joystiq 2010-06-15, https://web.archive.org/web/20220620093857/https:/www.engadget.com/2010-06-15-interview-bioware-casey-hudson-on-the-making-of-mass-effect-2.html)
- Hudson on elevators: "In Mass Effect 1 I think we missed an opportunity in telling and showing people what's actually happening when you're in one of these elevators… In Mass Effect 2… it actually shows you a schematic of where you are, where you're going, and how you're getting there." (https://digitalchumps.com/2009/11/25/roundtable-interview-mass-effect-2-executive-producer-casey-hudson-part-3/)
- Inspiration: Mako was "a direct nod to the lander gameplay of Star Control II" (Mike Laidlaw, via https://en.wikipedia.org/wiki/Mako_(Mass_Effect)).

---

## Mass Effect 2 (2010) and Mass Effect 3 (2012) (BioWare; exec producer Casey Hudson)

### 1. Navigation layers
| Layer | What the player sees | Task | Enter / leave |
|---|---|---|---|
| Galaxy map v2 | Player flies a miniature Normandy (not a crosshair); limited fuel + probes (https://digitalchumps.com/2009/11/25/roundtable-interview-mass-effect-2-executive-producer-casey-hudson-part-2/; https://www.gamedeveloper.com/design/mass-effect-design-themes-critical-comparison) | Travel with felt distance/cost | CIC console |
| Active-mission labels on map (ME2) | Titles of all active missions shown directly on the map (thatgamesux, 2012) | "Where do I go for quest X" | Automatic |
| Planet scan (ME2) / system pulse scan + Reaper chase (ME3) | ME2: reticle over rotating planet watching a seismograph spike; ME3: sonar ping around Normandy, red rings mark finds; scanning raises a Reaper-alert bar, Reapers chase you out (https://gaming.stackexchange.com/questions/54264/; https://www.gamepressure.com/masseffect3/basic-information/z23a68) | Resources + side-mission discovery | Inside system view |
| Normandy SR-2 (5 decks, central elevator) | Deck-numbered hub; ME3 adds War Room on deck 2 (https://masseffect.fandom.com/wiki/Normandy_SR-2) | Hub, crew, upgrades | Elevator deck select |
| Hub cities (Citadel, Illium, Omega) + transit schematic | Rapid-transit schematic showing "where you are, where you're going" (Hudson, part 3 above) | Inter-zone travel | Cab/terminal |
| Journal | ME2: indented sub-step updates; ME3: merged with Codex, no main/side split, "Priority:" prefix, no step updates (https://www.pcgamer.com/mass-effect-3s-ending-isnt-as-bad-as-navigating-its-quest-log; https://masseffect.fandom.com/wiki/Journal) | What next / why | Menu |

### 2. Navigation questions
- Q1 Where am I? Galaxy map; transit schematic in hubs (Hudson).
- Q2 Where can I go? ME2 labels active missions on the map (thatgamesux). ME3: Reaper icons mark invaded clusters (https://www.gamerguides.com/mass-effect-3-legendary-edition/guide/exploration/information/exploration-overview); some journal quests point to systems not yet unlockable with no indicator ("the moment a quest hits your journal… you can do that quest now. And if you can't, normally there's some sort of indic[ation]" — https://the-typer.medium.com/finishing-mass-effect-3-a4549516c610).
- Q3 What next / why? ME2 strong (indented steps; "Hail a cab" — PC Gamer). ME3 weak: "missions don't have enough detail… don't keep track of what you've done already" (PC Gamer).
- Q4 How to get there? Fly the ship icon; overshoot wastes fuel (https://www.gamedeveloper.com/design/the-galaxy-is-yours-mass-effect-2, 2016-05-09).
- Q5 What changed? ME3: after finding fetch item, the map highlights the NPC to talk to (https://gamefaqs.gamespot.com/boards/995452-mass-effect-3/66799284) — journal itself doesn't update.
- Q6 Progress? ME2 shows per-planet/system completion percentages ("node-based checklist with percentages", Game Developer 2016).
- Q7 Return home? Out of fuel → EDI emergency FTL returns you to gateway system, no penalty (Fandom Galaxy Map). Normandy always reachable.
- Q8 Whole? Same nested map.
- Q9 Mode switching? ME3 adds ambient "eavesdrop" quest pickup — no mode switch, but quests silently enter journal (https://www.kiasa.org/2012/03/the-key-to-good-eavesdropping-is-not.html).
- Q10 (new) *Risk on the map layer*: ME3's Reaper-awareness bar turns map browsing into a mini-game with stakes.

### 3. Most successful solutions
1. **Mission names printed on the galaxy map (ME2)** — "information where and when you need it"; replaced ME1's memorize-and-search (thatgamesux, 2012-02-08). Evidence **C**. Driver: *recognition over recall* (Nielsen heuristic; same heuristic invoked for Andromeda UI at https://www.gameskinny.com/opinion/why-mass-effect-andromedas-ui-is-bad/).
2. **Indented step-tracking journal (ME2)** — named "my favorite journal in the trilogy"; regression in ME3 widely criticized (PC Gamer 2021; GameFAQs thread "Wow, they really butchered the journal system", https://gamefaqs.gamespot.com/boards/995452-mass-effect-3/62184930). Evidence **C** (consensus via natural experiment: same series, feature removed, complaints spike). Driver: *externalized working memory*.
3. **ME3 system-scan + Reaper chase** — faster than ME2 scanning: "infinitely faster and less tedious than before" (https://www.trueachievements.com/game/Mass-Effect-3/reviews); "integrated seamlessly into the galaxy" map (https://www.choicestgames.com/2012/10/mass-effect-3-review.html). Evidence **C**. Driver: *risk/tension added to a browsing layer* + reduced action count.

### 4. Failures / criticism
- ME2 planet scanning: "you spend the next 20 minutes meticulously (and at a glacial pace) combing the planet's grid" (Game Informer 2010-01-29, https://gameinformer.com/blogs/editors/b/gijoe_blog/archive/2010/01/29/mass-effect-2-mineral-scanning-is-terrible.aspx); "made exploration of the universe more tedious than the Mako did" (https://www.gamedeveloper.com/design/mass-effect-design-themes-critical-comparison, 2010-03-18).
- ME3 journal: merged tabs, "Priority" prefix implies urgency, priority missions can lock out side quests, uncompletable quests sit at top forever (PC Gamer 2021).
- ME3 eavesdrop quests: "no way to know if you got all the quests in an area without running laps" (https://maskofreason.wordpress.com/2012/05/08/objective-reviews/).

### 5. Designer intent
- Hudson (ME2 galaxy map): "You're actually…moving the position of the Normandy versus a target crosshair. And, when you arrive at a planet, you have an actual minigame for scanning… This part basically replaces the less interesting aspects of resource gathering from Mass Effect 1." (digitalchumps part 2, 2009-11-25)
- Hudson on scanning overuse: "What a lot of people ended up doing is they saw the mini-game and they literally felt like they had to mine the galaxy. The whole galaxy. It definitely wasn't meant to withstand that much pressure." (Engadget 2010)
- Hudson, ME2 overall: "let the game get out of the way of the player having an experience." (same)

---

## Mass Effect: Andromeda (2017, BioWare Montreal; lead designer Ian Frazier — credit partly from IBTimes)

### 1. Navigation layers
| Layer | What the player sees | Task | Enter / leave |
|---|---|---|---|
| Galaxy map from Tempest bridge | Cluster → System → Orbit; "stand on the bridge and stare out at the stars… as you select your destinations" (https://gameinformer.com/b/features/archive/2016/11/21/getting-to-know-the-tempest-mass-effects-new-normandy.aspx); exploration completion % per place (EA manual https://eaassets-a.akamaihd.net/eahelp/manuals/mass-effect-andromeda-pc-en.pdf) | Travel, scan anomalies | Bridge console; hold T to exit |
| Travel cutscenes | 10–15 s unskippable flight per jump at launch (https://www.polygon.com/2017/3/20/14886618/mass-effect-andromeda-review-PS4-Xbox-One-PC) | Spectacle/immersion | Patched skippable (planet-to-planet only) 2017-04-06 (https://www.gamespot.com/articles/mass-effect-andromeda-patch-detailed-addresses-som/1100-6449172/; https://www.paperghost.com/2017/04/andromeda-redux-boogaloo.html) |
| Tempest hub | No loading screens or elevators between areas (https://www.pcgamer.com/mass-effect-andromedas-tempest-ship-has-no-loading-screens) | Home | Walk |
| Open planets + Nomad, forward stations | Open zones, Viability % per planet (https://masseffect.fandom.com/wiki/Viability) | Exploration, progress | Land |
| HUD compass (no minimap) | Compass; distance only within ~100 m (https://www.pcgamer.com/17-tiny-things-that-drive-us-crazy-about-mass-effect-andromeda) | Direction | Always |
| Journal | 5 folders: priority ops, allies & relationships, Heleus assignments, additional tasks, completed (https://www.businessinsider.com/mass-effect-andromeda-problems-issues-2017-3) | What next | Menu |

### 2. Navigation questions
- Q1 Where am I? Compass + full map only; no minimap (PC Gamer).
- Q2 Where can I go? Unvisited systems tagged "new"; key systems labeled with progress (https://masseffectandromeda.fandom.com/wiki/Galaxy_Map).
- Q3 What next? Overwhelmed: "nearly impossible to keep track… I'd forgotten who gave it to me or why I was doing it" (https://giantbomb.com/reviews/mass-effect-andromeda-review). Untracked = all waypoints shown, "obnoxious and anxiety-producing" (Business Insider).
- Q4 How? Compass fails with verticality ("Should I turn left or right… It was actually in front of me") (https://medium.com/@charliedeets/thoughts-on-mass-effect-andromedas-user-experience-7e8d2a684928).
- Q5 What's new? "New" ticks auto-clear when scrolled past before you can see them (https://www.rockpapershotgun.com/mass-effect-andromeda-review).
- Q6 Progress? Exploration % per planet/system and Viability %.
- Q7 Return? Tempest; forward stations.
- Q8 Whole? Nested map, but zoom transitions were long animations.
- Q9 Mode switch? Seamless ship (no loading) — positive; map closes with Esc not M ("pressing M again doesn't close the map", PC Gamer).
- Q10 (new) *Forced move-on*: game "effectively forces you off of Eos" to prevent completionist trapping (https://arstechnica.com/gaming/2017/03/early-review-mass-effect-andromeda-is-dragon-age-inquisition-in-space/).

### 3. Most successful solutions
1. **Loading-free hub ship** — "much smaller than the Normandy—but it almost feels deceptively larger, as we removed load tunnels and elevator rides" (Jessica Hara Campbell, https://primagames.com/eguides/mass-effect-andromeda-collectors-edition-eguide/developer-interviews-and-concept-art/jessica-hara-campbell-level-designer). Evidence **C**. Driver: *continuity of place*.
2. **Forced exit from first open zone** (Ars Technica above). Evidence **C**. Driver: *anti-completionist trap* / pacing.

### 4. Failures / criticism
- Unskippable travel animations — first-patch priority (Ars Technica 2017-04-04 https://arstechnica.com/gaming/2017/04/bioware-says-mass-effect-andromeda-bugfixes-and-improvements-are-coming/). Evidence **B** (developer patched it within ~2 weeks).
- Map "looks like spilled spaghetti"; compass bad; no minimap (PC Gamer); compass nearly invisible against bright terrain (https://www.tweaktown.com/news/56791/mass-effect-andromeda-first-impressions/index.html).
- Journal bloat, 4 tiers, forgotten context (Giant Bomb).

### 5. Designer intent
- Ian Frazier: "That idea of literally finding new worlds to discover and wondering what's over the horizon is something that Mass Effect 2 and 3 moved away from a bit. We wanted to bring that back." (https://www.ibtimes.co.uk/mass-effect-andromeda-how-bioware-aimed-fulfil-promise-original-mass-effect-1616748)
- Campbell: "we redesigned the galaxy map… this beautiful, immersive player experience that reinforced the narrative of Ryder as the Pathfinder." (https://www.gamespot.com/articles/mass-effect-andromeda-jessica-campbell-interview/1100-6448767/)
- *Judgment*: Andromeda shows immersion and speed in direct conflict on the travel layer; immersion lost (patch).

---

## Fallout 1 (1997) and Fallout 2 (1998) (Interplay / Black Isle; Fallout 1 producer & lead programmer Tim Cain)

### 1. Navigation layers
| Layer | What the player sees | Task | Enter / leave |
|---|---|---|---|
| Title / main menu | — | — | — |
| World map | Top-down grid of equal terrain squares; fog lifts as you travel; red-cross path line; terrain sets speed (Fallout 2: 25 h per desert square, 32.5 h mountain; Fallout 1: 10 h desert, 20 mountain, 6 city) (https://fallout.wiki/wiki/World_Map; https://fallout.wiki/wiki/Worldmap.txt_File_Format) | Long-range travel, time passing | Step on exit grid of any local map |
| Random/special encounters | Rolled during travel (~every 24 h of travel in FO1 per wiki); special ones gated by Luck (https://fallout.wiki/wiki/Fallout_map; OGR 1998 https://web.archive.org/web/19980208014851/ogr.com:80/specials/fallout/fallout_interview1.shtml) | Danger, surprise | Forced drop to local map |
| Town / location maps | Isometric local maps (12 locations in FO1, 21 in FO2) (https://fallout.fandom.com/wiki/World_map) | Local play | Click location on world map |
| Pip-Boy 2000 | Status, quest log, automaps, water-days countdown (https://fallout.wiki/wiki/Pip-Boy_2000; https://steamcommunity.com/app/38400/discussions/0/1726450077681524856/) | Quest memory, time pressure | Button |
| Highwayman car (FO2) | 400–600% world-map speed + trunk storage (https://fallout.fandom.com/wiki/Highwayman) | Faster travel, mobile stash | Earned mid-game |

### 2. Navigation questions
- Q1 Where am I? World map marker; location name.
- Q2 Where can I go? Locations appear when told about or reached; Overseer "marked your map with the location of another Vault" (https://lilura1.blogspot.com/2021/02/Fallout-1-Retrospective-Review-Time-based-Reactivity.html). Unknown terrain is dark.
- Q3 What next / why? One clear critical goal + deadline: water chip in 150 days (https://en.wikipedia.org/wiki/Fallout_%28video_game%29); Pip-Boy shows days left.
- Q4 How? Click destination; game draws path, time elapses by terrain.
- Q5 What changed? Time-based world reactivity (cities can be destroyed if you take too long — https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/FallOut1).
- Q6 Progress? Revealed squares on map; Pip-Boy log.
- Q7 Return home? Vault 13 is a map location; FO2 car trunk = portable home.
- Q8 Whole? World map is the whole; no zoom levels.
- Q9 Mode switch? Clean two-mode split: world map (abstract time) ↔ local map (real-time/turn-based).
- Q10 (new) *Time as a navigation resource*: every trip spends days against a visible deadline.

### 3. Most successful solutions
1. **Abstract world map with fog reveal + terrain time cost.** Evidence **C**: Josh Sawyer modelled New Vegas's open critical path on it ("the critical path is basically three points… you can skip everything in between and go straight to the necropolis" — https://www.theexaminedgame.com/from-icewind-dale-to-fallout-new-vegas-josh-sawyer-obsidian-part-1/). Driver: *legible macro-space + agency over route*.
2. **Visible countdown as "what next" compass** (150 days, extendable by 100 via water merchants: https://fallout.wiki/wiki/Find_the_Water_Chip). Evidence **C/B**: second (500-day) limit was patched out (TV Tropes; https://steamcommunity.com/app/38400/discussions/0/1726450077681524856/) — developers kept the first, removed the second (B-ish: behavior of patch). Driver: *goal gradient*; but overpressure undermines exploration.
3. **Luck-gated special encounters** — fun discovery with no story dependency (Tim Cain: "No story elements, since they might never be encountered by some players" — https://fallout.fandom.com/wiki/Fallout_at_25_Fallout_Wiki_roundtable). Evidence C. Driver: *variable reward*, kept off critical path.

### 4. Failures / criticism
- Time limit frustration: "I lost 55 out of the 150 days" (https://forums.atariage.com/topic/147004-fallout-1-lockreset-of-days-for-water-chip/); TV Tropes: leaves "relatively little time to explore".
- Few random-encounter maps; repetition ("we had six something" — Tim Cain video https://www.youtube.com/watch?v=KtTtXUDldok).
- Cain: felt "constrained by Fallout's world map… inability to place handmade content without also placing a location on the map" (https://rpgcodex.net/content.php?id=8416).

### 5. Designer intent
- Tim Cain (1997): "as he travels over the world map, which connects locations, we speed up time so you don't have to wait the days it takes to walk" (https://www.nma-fallout.com/threads/desslock-interviews-tim-cain.179345/).
- Cain/Taylor: "Luck is the primary attribute… A very unlucky character will never get these encounters." (OGR 1998)
- Cain rule (2026 summary, secondary): "From any point on an open map, there should be at least one point of interest visible" (https://vgtimes.com/gaming-news/154069-dont-assume-anything-fallout-creator-explains-how-to-make-rpgs-the-right-way.html) — *grade C, paraphrased by a news site; not verbatim*.

---

## Fallout 3 (2008), Fallout: New Vegas (2010), Fallout 4 (2015) (Bethesda Game Studios; FNV by Obsidian, director Josh Sawyer; FO3/FO4 director Todd Howard, lead designer Emil Pagliarulo)

### 1. Navigation layers
| Layer | What the player sees | Task | Enter / leave |
|---|---|---|---|
| World map (in Pip-Boy) | Discovered locations auto-added; NPC-mentioned locations marked but not fast-travelable; Explorer perk reveals all (https://fallout.wiki/wiki/World_Map; https://fallout.wiki/wiki/Explorer_(Fallout_3)) | Overview, fast travel | Pip-Boy map tab |
| Local map | Shows only explored area (https://fallout.fandom.com/wiki/Pip-Boy_3000) | Local layout | Pip-Boy |
| Fast travel | Click any discovered location | Skip traversal | From map; not in combat |
| Compass HUD | Clear triangle = undiscovered location; filled = discovered; quest target = solid arrow flashing faster as you near; custom marker; friend/foe bars gated by Perception (FO3 manual https://images.fallout.wiki/b/b3/Fallout_3_Manual.pdf); FO4 adds vertical indicators (https://gbradley.com/2015/12/01/the-ui-of-fallout-4) | Direction + discovery lure | Always on |
| Pip-Boy 3000 / 3000 Mk IV (diegetic wrist device) | Map, inventory, quests, stats, radio; character raises arm (https://www.kokutech.com/blog/gamedev/design-patterns/world-building/fallout-3) | All menus | Raise wrist |
| World design gates (FNV) | Deathclaws/cazadores north of Goodsprings; route south signposted by quest marker, road and a visible rollercoaster (https://www.thegamer.com/fallout-new-vegas-deathclaw-quarry-is-a-rite-of-passage) | "Where should I go" by danger | Implicit |
| Settlements (FO4) | 37 buildable sites (30 base) (https://fallout.wiki/wiki/Fallout_4_Settlements) | Owned hubs, fast-travel anchors | Workshop |

### 2. Navigation questions
- Q1 Where am I? Location-discovery banner; map; local map.
- Q2 Where can I go? Hollow compass triangles advertise nearby undiscovered POIs (FO3 manual). FNV: difficulty gates (compressed level scaling) instead of locks (Sawyer, https://www.gamesradar.com/games/fallout/fallout-new-vegass-harsher-level-scaling-is-designed-to-teach-players-that-this-is-not-actually-fallout-3-josh-sawyer-says-youre-going-to-get-your-ass-handed-to-you-if-youre-not-careful).
- Q3 What next? Main-quest marker always available ("we never really let you get lost" — Pagliarulo, §5). FO4 does not label main vs side ("weighs all of its actions equally" — https://www.criticalhit.net/gaming/fallout-4-doesnt-tell-me-which-quests-are-important-and-thats-fantastic).
- Q4 How? Compass arrow; marker flashes faster as you approach (FO3 manual). FO4 map can't zoom to full overview; "slowly scroll through the map" (https://www.gamespot.com/reviews/fallout-4-review/1900-6416306).
- Q5 What changed? Not strongly addressed; FO4 radiant settlement alerts ("A settlement needs our help") (https://www.forbes.com/sites/insertcoin/2016/01/11/how-to-fix-fallout-4s-maddening-never-ending-radiant-quests).
- Q6 Progress? Filled vs hollow icons; FO3 Geomapping quest/One-Man Scouting Party achievement count discoveries (Explorer wiki).
- Q7 Return home? Fast travel to discovered locations; player homes; FO4 settlements.
- Q8 Whole? World map in Pip-Boy; FO4 criticized for no full bird's-eye view (GameSpot).
- Q9 Mode switch? Diegetic Pip-Boy: menus as an arm-raise within the fiction (§5).
- Q10 (new) *Discovery as currency*: fast travel only to walked-to places makes exploration the unlock for convenience.

### 3. Most successful solutions
1. **Hollow → filled compass icons + "fast travel only to discovered".** Mechanics in FO3 manual. Evidence **C/B**: pattern reused across Bethesda's Skyrim (black undiscovered / white visited — https://en.uesp.net/wiki/Skyrim:Maps), Fallout 4 ("punched out" icons — https://steamcommunity.com/sharedfiles/filedetails?id=2897797252) and Fallout 76 (filled blue = discovered — https://twinfinite.net/guides/fallout-76-fast-travel-how/); Fallout 3 sold 12.4M, FNV 11.6M, FO4 25M (https://levvvel.com/statistics/fallout — aggregator, B-). Driver: *Zeigarnik / curiosity gap* (an unfilled icon is an open loop) + *earned convenience*. Counter-evidence: mods exist to remove undiscovered markers for immersion (https://www.nexusmods.com/fallout3/mods/1292).
2. **Diegetic Pip-Boy** — one in-world device for map/quests/stats. Evidence **C**: Todd Howard calls it "one of the first things we worked on… the player looks at so much" (https://fallout.fandom.com/wiki/Fallout_3_Official_Game_Guide_Pre-War_Collectors_Edition); persisted FO3→FO76. Driver: *diegesis lowers immersion cost of mode switching*.
3. **FNV danger-as-signpost** (deathclaws/cazadores block shortcuts; marker + road + rollercoaster point south). Evidence **C** (designer statement + community "rite of passage" consensus). Driver: *soft gating via consequence, not walls*; preserves open critical path ("you can go from Goodsprings straight to Benny" — GamesRadar 2026).

### 4. Failures / criticism
- Markers make exploration rote: turning markers off turns FO4 into "an exploration engine, rather than a quest engine" (https://www.gamedeveloper.com/business/letting-go-of-quest-obsession-and-soaking-in-the-world-of-fallout-4); Skyrim-style compass: "Every single place worth exploring is marked on your compass… If you find yourself between map markers, you're practically guaranteed not to find anything" (https://obsex.wordpress.com/2015/04/13/all-the-knees-no-arrows/).
- FO4 map usability: "woefully limited map functionality"; local maps "indecipherable" (GameSpot review).
- FO4 radiant quest flood; no handcrafted/procedural distinction (Forbes; https://news.ycombinator.com/item?id=49628493).
- FNV invisible walls / corridor funneling; Sawyer: "Were we to build the Mojave Wasteland again, we would make different choices in how to lay out the areas" (https://fallout.wiki/wiki/Mojave_Wasteland).

### 5. Designer intent
- Emil Pagliarulo (FO3): "you've always got an objective in your Pip-Boy that point back toward your quest to find your father. So we allow you to explore… but we never really let you get lost. That's the important distinction." (https://vagrantbard.com/2011/05/30/interview-emil-pagliarulo-lead-designer-and-writer-for-fallout-3/)
- Pagliarulo: the Pip-Boy is "your link to survival… the only thing you take with you is this piece of technology strapped to your wrist that becomes your sort of lifeline." (https://www.fallout.wiki/wiki/Fallout_3_Developer_Statements/The_Making_of_Fallout_3)
- Istvan Pely: "we sought to create an interface system that was functional, unique and entertaining… exists as both an important object in-game as well as the player's primary method of interacting with his character." (https://fallout.wiki/wiki/Istvan_Pely/Design_and_Development_of_the_Pip-Boy_Model_3000_Diary_(October_2007))
- FO3 world density: map felt too small late in dev because flat terrain let landmarks be seen on the horizon; "The tone of Fallout doesn't work if it's not a bit lonely" (Burgess, https://www.techradar.com/news/vaulting-ambition-how-fallout-3-changed-the-game).
- Josh Sawyer (FNV): "there are deathclaws and cazadores and super mutants north of Goodsprings, to show people from Fallout 3… you can't just slide all over the map and not feel the heat." (https://www.pcgamer.com/games/rpg/josh-sawyer-says-fallout-new-vegas-has-deathclaws-in-cazador-as-a-warning-to-fallout-3-players-expecting-another-easy-ride-you-cant-just-slide-all-over-the-map-and-not-feel-the-heat); "They were there for players to Git Gud or Die." (https://www.gamesradar.com/fallout-new-vegas-director-debunks-13-year-old-theory-about-the-rpgs-most-infamous-areas-they-were-there-for-players-to-git-gud-or-die/)
- Todd Howard (2016 DICE summary): pique curiosity via something "just over the horizon that beckons them over… try to pique curiosity, and reward it" (https://www.gamedeveloper.com/design/in-open-world-game-design-curiosity-is-key-says-bethesda-s-todd-howard) — paraphrase by reporter.

---

## Fallout 76 (2018, Bethesda Game Studios)

### 1. Navigation layers
| Layer | What the player sees | Task | Enter / leave |
|---|---|---|---|
| World map (pulled out of Pip-Boy into its own screen) | Illustrated atlas-style map; 6 regions at launch, 4× FO4 area; shows rough locations of other players (https://fallout.wiki/wiki/World_Map; https://fallout76.wiki.fextralife.com/Helpful_Hints) | Overview, social | Map button |
| Fast travel | Caps cost scales with distance; free to own C.A.M.P., teammates, Vault 76, Foundation, Crater, Fort Atlas, public events (https://bethesda.net/en-US/news/welcome-to-fallout-76-a-newcomers-guide) | Economy-priced convenience | From map |
| C.A.M.P. | Movable personal base, free fast-travel anchor; moving costs caps (https://www.polygon.com/fallout-76-guide/2018/11/13/18086406/beginners-guide/) | Player-placed home | Pip-Boy |
| Compass | Locations, enemies, quest checkpoints, events, CAMPs, last death, players, team leader, one custom marker (https://primagames.com/eguides/fallout-76-eguide/training/status-you-will-emerge) | Direction, social | Always |
| Quest delivery | Launch: holotapes, terminals, notes, robots; human NPCs added in Wastelanders (Apr 2020) (https://fallout.wiki/wiki/Fallout_76_Quests) | What next | — |

### 2. Navigation questions
- Q1 Where am I? Map + compass. Q2 Where can I go? Regions, events on map. Q3 What next? At launch weak — "quests boil down to ping-ponging from checkpoint to checkpoint" (https://sea.ign.com/fallout-76/143407/fallout-76-is-a-weirdly-lifeless-adventure-played-solo). Q4 How? Compass; only one custom marker (https://www.tweaktown.com/articles/8810/fallout-76-impressions-round-learning-experience/index.html). Q5 What changed? Public events surfaced on map. Q6 Progress? Discovered icons. Q7 Home? Free travel to CAMP. Q8 Whole? Atlas map. Q9 Modes? Map moved out of Pip-Boy (non-diegetic, because game can't pause online — *Judgment*). Q10 (new) *Where are other people?* Player and teammate positions on map and compass.

### 3. Most successful solutions
1. **Movable player-placed home with free fast travel (C.A.M.P.).** Evidence **C** (persistent feature, guides center on it). Driver: *self-chosen anchor* reduces return cost.
2. **Price-tiered fast travel (free to home/team/events, caps elsewhere).** Evidence **C**. Driver: *nudging toward social hubs*.
3. **Wastelanders restoring human quest-givers.** Evidence **B (confounded)**: 11M players Nov 2021 → 17M Dec 2023 → 20M May 2024 → 25M Oct 2026 (https://www.vgchartz.com/article/469456/fallout-76-tops-25-million-players); Steam peak doubled after TV show (https://www.polygon.com/24131018/fallout-games-steam-player-count-bethesda-tv-show). Growth is confounded by TV series and content cadence; cannot be attributed to navigation.

### 4. Failures / criticism
- No human NPCs at launch → "lifeless" (https://www.forbes.com/sites/games/2018/11/20/fallout-76-review-xbox-one-x-look-upon-my-works-and-despair); identical quest markers clutter HUD (https://randocity.com/2018/12/10/top-25-reasons-to-hate-fallout-76/); wanted a minimap (TweakTown).

### 5. Designer intent
- Jon Rush (2026): players returning "like, 'oh wait, this game has completely changed'"; reliability of six-weekly drops built rapport (https://www.thegamebusiness.com/p/interview-how-the-fallout-tv-show) — about content cadence, not navigation specifically.

---

## Cyberpunk 2077 (2020; Phantom Liberty + 2.0 in 2023; CD Projekt RED; game director Adam Badowski, quest director Paweł Sasko — credit not verified here)

### 1. Navigation layers
| Layer | What the player sees | Task | Enter / leave |
|---|---|---|---|
| World map | Dense icon map: fixer gigs (shown as "?" Undiscovered until approached), NCPD hustles, cyberpsychos, vendors, fast travel; filter key (Z on PC) (https://gamefaqs.gamespot.com/pc/672376-cyberpunk-2077/faqs/79161/map; https://cyberpunkcentral.com/cyberpunk-2077-map-icons/) | Overview, choose job | Menu |
| Fast travel | 166 dataterms, auto-unlocked by proximity (https://cyberpunk.fandom.com/wiki/Fast_Travel); 2.1 adds NCART metro, 19 stations / 5 lines, ride or fast-travel (https://www.cyberpunk.net/en/news/49597/update-2-1-patch-notes) | Skip traversal | Walk up to terminal |
| Minimap + GPS route | Top-right minimap with route line; launch zoom too tight for driving; 1.3 zoomed out while driving; 2.0 dynamic zoom by speed (https://www.destructoid.com/cyberpunk-2077s-minimap-actually-works-now-it-only-took-eight-months-lawsuits-and-investor-threats/; 2.0 notes https://www.cyberpunk.net/en/news/49060/update-2-0) | Route following | Always |
| World-space objective marker | Floating yellow marker (https://prototypr.io/post/a-ux-analysis-of-cyberpunk-2077s-hud) | Local target | Tracked quest |
| Phone (calls/texts) | Fixers call when you near a gig; quests auto-picked (https://rpgcodex.net/content.php?id=11613) | Quest intake | Auto / D-pad |
| Journal | 2.0: tabs by job type, distance to marker, untrack option (2.0 notes) | What next | Menu |
| HUD options | 2.1 Accessibility: larger HUD, remove HUD visual effects, reduce decorative elements (https://support.cdprojektred.com/en/cyberpunk/pc/gameplay/issue/1661/accessibility-features-1) | Declutter | Settings |

### 2. Navigation questions
- Q1 Where am I? Minimap; district names.
- Q2 Where can I go? Gigs unlock in sets per fixer/district as street cred rises; hover a fixer to see completed count (https://senseos.gg/guides/cyberpunk-2077/cyberpunk-2077-gigs-fixers-street-cred/).
- Q3 What next? Phone calls push work; at launch critics: fixers call "the moment they enter a new area", jobs start without clear trigger (https://www.gamingnexus.com/Article/7233/Cyberpunk-2077).
- Q4 How? GPS line on minimap; launch minimap made drivers miss turns (NME https://www.nme.com/news/cyberpunk-2077-1-3-patch-revealed-gps-improvements-incoming-3020987); critics asked for AR road guidance "something that Cyberpunk's world is uniquely prone to" (https://www.gamewatcher.com/editorials/how-to-fix-cyberpunk-2077/13255).
- Q5 What changed? "?" icons resolve on approach; 2.0 phone UI unread filter (https://game8.co/games/Cyberpunk-2077/archives/2-0-UI-Changes-and-Overhaul).
- Q6 Progress? Fixer completion counts; dataterm "Frequent Flyer" achievement.
- Q7 Return home? Fast travel to V's apartments area; no "home" fast-travel shortcut documented here.
- Q8 Whole? Flat map projection of a vertical city: "a flat projection trying to represent a cube. It doesn't work." (https://gamedatacrunch.com/finding-everything-in-night-city-why-the-cyberpunk-2077-interactive-map-is-actually-mandatory-219g, C).
- Q9 Mode switch? Diegetic framing (Kiroshi optics lens effect — https://dotesports.com/cyberpunk/news/cyberpunk-2077-hud-feature-looks-like-a-glitch-on-ultrawide-monitor) but heavy chrome; calls interrupt dialogue ("someone else will call you mid-sentence" — RPG Codex).
- Q10 (new) *Navigation while driving at speed* — a distinct sub-problem (zoom vs speed, turn anticipation).

### 3. Most successful solutions
1. **Speed-dependent minimap zoom (1.3 → 2.0 dynamic).** Evidence **B**: shipped as a headline fix in patch 1.3 ("Improved the minimap's zoom level when driving" — Destructoid 2021-08-18); a community dataset claims patch 1.3 coincided with "+26% player gain and a rating jump from 65 to 71" (https://www.kaggle.com/datasets/salarsanadizadeh/cyberpunk-player-trends-ratings-and-sales-steam — secondary, confounded with other 1.3 content; grade B-/C). Popular pre-fix mod "Better Minimap" (https://www.nexusmods.com/cyberpunk2077/mods/634). Driver: *information horizon must scale with velocity* (Fitts/reaction-time logic, *Judgment*).
2. **Fast travel tied to physical in-world terminals + metro (2.1).** Evidence **C/B**: metro was "most-requested" per CDPR patch notes (official, B for demand signal). Driver: *diegetic transit* lets players choose immersion (ride) or speed (fast travel) — the opposite of Andromeda's forced cutscene.
3. **Journal tabs + distance + untrack (2.0).** Evidence **C** (official change; part of broad 2.0 recovery: Steam "Overwhelmingly Positive" recent reviews by Jan 2025, 95% of 12,818 recent — https://www.gamespot.com/articles/four-years-after-its-disastrous-launch-cyberpunk-2077-has-a-great-steam-user-score/1100-6529009; 30M sold Nov 2024 — https://www.pcgamer.com/games/rpg/cyberpunk-2077-and-the-phantom-liberty-expansion-have-sold-over-38-million-copies/). Confounded: 2.0 changed police, perks, combat too.

### 4. Failures / criticism
- Launch minimap too zoomed in; "makes driving impossible" (GameWatcher 2020-12-16); fixed 8 months later (Destructoid).
- Quest markers "far too exaggerated… actively discouraging any creativity" (https://interfaceingame.com/articles/cyberpunk-2077-ux-ui-critique/).
- Map clutter, no danger-level filter (https://gamefaqs.gamespot.com/boards/672376-cyberpunk-2077/79185947); quest density "at least one quest… per block" (RPG Codex).
- Players mod minimap to appear only while driving: "I found myself staring at the minimap too much" (https://www.nexusmods.com/cyberpunk2077/mods/3239).

### 5. Designer intent
- Alvin Liu (UI coordinator, 2019): "The most fun [difficulty setting] I think will be the Hardcore setting where we turn off the UI" (https://www.dualshockers.com/cyberpunk-2077-hardcore-mode-turn-off-ui/).
- Andrzej (programmer), patch 1.3: "With the new minimap system software update you are able to see more and navigate better. Drive fast, drive safe." (Destructoid)
- Paweł Sasko: "Smaller quests cannot feel disposable either. We never treat side content as filler." (http://www.rpgsite.net/interview/20908-cyberpunk-2077-interview-pawel-sasko-new-edgerunners-quest-design-music-launch)
- CDPR UI artist (Behance): red UI "was a bold decision and a walk against the stream of all the conventions… just because the colour RED is a default it is inevitably causing a discrepancy with its general use, communicating malfunctioning, warnings" (https://www.behance.net/gallery/133185623/Cyberpunk-2077User-Interface-(Part-2)).

---

## Cross-game patterns in this cluster

1. **Hub-as-place + map-as-place.** ME's Normandy/Tempest and Fallout's Pip-Boy put the master navigation tool inside the fiction (a console you walk to, a device you raise). Every sequel kept it. *Candidate invariant*: the "zoom out" tool should live at a known, safe home location. (C)
2. **Nested scale map (Galaxy→Cluster→System→Planet).** Best-in-cluster answer to Q8; survives four games. Pair with **labels of active goals printed on the map** (ME2) — recognition beats recall. (C, natural experiment ME1→ME2)
3. **Discovered vs undiscovered states (hollow→filled icon; "?"→specific icon) + "fast travel only where you've been".** Shared by Fallout 3/NV/4/76, Skyrim, Cyberpunk. Turns exploration into the unlock for convenience and gives Q6 for free. (C; pattern ubiquity in BGS games selling 11–25M each, B-)
4. **Always one thread back to the critical path, but never a wall.** Pagliarulo "we never really let you get lost"; Sawyer's danger gates instead of locks; Fallout 1's 3-point critical path. Soft gating by consequence beats hard locks for perceived freedom. (C)
5. **Step-level quest memory is non-negotiable.** ME2's indented journal vs ME3's static entries is the cleanest natural experiment in the cluster: removal produced loud, durable complaints. Andromeda and Cyberpunk show the opposite failure — volume without hierarchy. Answer Q3 with "next step + where + why" and allow untrack/filter (Cyberpunk 2.0). (C)
6. **Travel layer: speed vs spectacle must be the player's choice.** Andromeda's unskippable jumps were patched within weeks; ME2 scanning "wasn't meant to withstand that much pressure"; Cyberpunk 2.1 metro offers ride *or* skip. (B for Andromeda patch; C otherwise)
7. **Optional content perceived as equal to main content.** Hudson's Mako lesson + Fallout 4 radiant quests + Cyberpunk "one quest per block": anything on the map is read as a promise of quality; filler on the map erodes trust in the map. Mark procedural/repeatable content distinctly or keep it off the main layer. (C)
8. **Information horizon must match velocity.** Cyberpunk's 8-month minimap fix (speed-dependent zoom) and Andromeda's 100 m distance cutoff: what the HUD shows must scale with how fast the player moves. (B-/C)
9. **Q5 "what's new since I was last here" is the weakest-solved question across the whole cluster** (ME1 crew dialogue, Andromeda auto-clearing "new" ticks, ME3 fetch items). Best partial fix: ME3 highlighting the NPC on the map once the item is in hand. *Judgment*: open design space.
10. **Home anchor with free return.** Normandy/Tempest, Fallout 2 car trunk, FO4 settlements, FO76 free fast travel to C.A.M.P.: a zero-cost return path to a self-owned safe place lowers the risk of venturing out. (C)

### Gaps / limits
- No grade-A (controlled study) evidence found for any title in this cluster; strongest numbers (Cyberpunk sales/reviews, FO76 player counts) are confounded by non-navigation changes and the TV series.
- Lead-designer credits for Fallout 2, Fallout 76 and Cyberpunk not sourced here.
- Tim Cain "one POI visible from any point" is a news-site paraphrase, not a verbatim quote.
