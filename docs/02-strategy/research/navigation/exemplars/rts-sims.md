# Navigation dossier — RTS & Sim cluster (Warcraft I–III, StarCraft I–II, SimCity 1989–2013, The Sims 1–4)

Schema: `research/nav/SCHEMA.md`. Method: web_search + web_fetch only, no browser. Evidence grades: **A** = study / large-n data; **B** = hard numbers (sales, telemetry, GDC data); **C** = designer interview, critical consensus, manual/wiki description, fan memory. *Italic = judgment*, everything else is sourced fact. Compiled 2026-11-24.

Caveat up front: no A-grade (controlled study) evidence was found for any navigation feature in this cluster. "Worked" evidence is B at best (sales, adoption, persistence across sequels) and is **not causal** for any single UI feature; it is listed as context, not proof.

---

## Warcraft: Orcs & Humans (1994) and Warcraft II: Tides of Darkness (1995) — Blizzard; WC1 concept Ron Millar, WC2 lead designer Ron Millar

### 1. Layers
| Layer | What the player sees | Task solved | Enter / leave |
|---|---|---|---|
| Front-end / campaign | Linear mission sequence with text briefing between missions | "What's my objective" | Auto after each mission win (*no selectable campaign map found in sources; not established*) |
| Local playfield ("Command Map" in WC2 manual) | Top-down tiled map, edge-scrolling | Act on units | Default |
| Minimap ("Mini Map") | Whole map in miniature, black where unexplored | Where am I / jump | Click minimap to move view |
| Fog of war | Black shroud (unexplored) → WC2 adds grey "explored but not currently seen" | What do I know vs. what is current | Units' sight radius |
| Unit panel / command buttons | Portrait + action buttons of selection | What can this unit do | Select unit |

Sources: WC2 manual, "unknown and will appear as great black regions in both your Command Map and Mini Map… space that is no longer in the vision of any of your units… becomes grey" — https://ftp.war2.ru/war2/Info%20&%20Media%20content/Documents/War2BNE_Manual_EN.pdf ; scrolling by moving mouse to screen edge — https://www.wired.com/2013/10/stay-awhile-and-listen-book/

### 2. Task questions
- Q1 Where am I? Viewport rectangle on minimap; WC1 minimap was upper-left (Wyatt: "our radar minimap was in the upper-left corner… theirs [Dune II] was in the lower-right") — https://kotaku.com/the-inside-story-of-the-making-of-warcraft-part-1-5929157
- Q2 Where can I go? Black = never explored; grey = explored terrain, enemies hidden; bright = in sight — https://classic.battle.net/war2/basic/fog.shtml
- Q3 What next? Mission briefing text; in-game, tech tree (new buildings unlock units) — https://en.wikipedia.org/wiki/Warcraft_II:_Tides_of_Darkness
- Q4 How do I get there? Right-click move (WC2 introduced left-select / right-context-action split, Jesse McReynolds) — https://www.gamedeveloper.com/audio/-quot-rock-balls-quot-the-making-of-warcraft-ii
- Q5 What changed? WC2: buildings remain "as the player last saw them… do not register unobserved changes" — i.e. stale-state memory is explicit — https://en.wikipedia.org/wiki/Warcraft_II:_Tides_of_Darkness
- Q6 What have I done? Revealed map = exploration history. Not otherwise addressed.
- Q7 Return home? Not addressed beyond scrolling (*WC3 later adds town-hall cycling*).
- Q8 See the whole? Minimap only; no zoom.
- Q9 Mode switching? Single screen; menus are modal overlays.
- Q10 (new) **How much may I control at once?** Selection cap: 4 units in WC1, 9 in WC2, deliberately "so users would be required to pay attention to their tactical deployments" — https://kotaku.com/the-inside-story-of-the-making-of-warcraft-part-1-5929157

### 3. Most successful solutions
1. **Three-state fog of war (unexplored / remembered / live).** Mechanics: above. Evidence: **C** — became genre standard; IGN (2001, via secondary) "Warcraft II went a step further… you had to rely on scouting patrols" — https://code198x.com/vault/design/fog-of-war/ ; WC2 >3M sold by 2001 (**B**, not causal) — https://en.wikipedia.org/wiki/Warcraft_II:_Tides_of_Darkness. Driver: *separates map knowledge (stable) from situational knowledge (perishable) — a two-layer memory model that makes scouting a navigation verb.* Patrick Wyatt on WC1 fog in first multiplayer test: "it was impossible to know whether I was winning or losing" (2012) — https://www.gamedeveloper.com/programming/the-story-of-the-first-i-warcraft-i-multiplayer-game-ever
2. **Minimap with draggable viewport rectangle + click-to-jump.** Evidence **C** (persisted in every later Blizzard RTS). Driver: *overview+detail with a visible "you are here" frame.*

### 4. Failures / criticism
- Selection cap (4/9) is a deliberate friction; later criticized across the genre (see StarCraft §4). Kotaku 2012 link above.
- No alert-recall mechanism found in WC1/WC2 sources (*WC3 and SC add spacebar-to-last-alert*).

### 5. Designer intent
- Patrick Wyatt: "our goal was always to create a game where the interface just got out of the way of the gameplay." — https://www.gamesradar.com/making-of-warcraft-orcs-and-humans/ (2019)
- Wyatt on fog: "designed to mimic the imperfect information known by a general" — https://www.codeofhonor.com/blog/the-making-of-warcraft-part-3 (2012)

---

## Warcraft III: Reign of Chaos (2002) / The Frozen Throne (2003) — Blizzard; lead designer Rob Pardo

### 1. Layers
| Layer | What the player sees | Task solved | Enter / leave |
|---|---|---|---|
| Campaign select | Races as campaigns, each split into ordered chapters; completed chapters replayable | Where am I in the story | Main menu → Campaign; next chapter unlocks on win |
| In-map "seamless quests" | Cutscenes in engine replace briefing screens; quests revealed during the map | What should I do now | Triggered by map progress |
| Quest Log (F9) | Main vs. optional quests, objectives | What's required vs. optional | F9 / top button bar |
| Playfield | 3D, slightly angled camera, limited zoom/rotation | Act | default |
| HUD bottom bar | Minimap, selection info, command card (grid of abilities, hotkey letter in yellow) | What can I do | Select unit |
| Hero portraits (top-left) | Portrait per hero; click = select, double-click/press = center camera (F1–F3) | Where is my key unit | Click/F-key |
| Idle-worker button | Worker icon with count, bottom-left above minimap; click/F8 cycles idle workers | Who's doing nothing | Click / F8 / ~ |
| Alerts | Minimap ping + voice; Spacebar centers last notification; Backspace cycles town halls | What just happened / go home | Space / Backspace |
| Message log (F12) / Allies (F11) / Menu (F10) | Modal dialogs | History / diplomacy / save | F-keys |

Sources: https://en.wikipedia.org/wiki/Warcraft_III:_Reign_of_Chaos ; https://classic.battle.net/war3/basics/specialcommands.shtml ; https://gamefaqs.gamespot.com/pc/256222-warcraft-iii-reign-of-chaos/faqs/24822 ; https://clan-os.blogspot.com/2008/11/battlenet-chat-commands.html

### 2. Task questions
- Q1 Where am I? Minimap frustum + hero portrait double-click to recentre.
- Q2 Where can I go? Fog (black/grey) as WC2; story level: chapters unlock in fixed order, "you must play the campaigns in order" — https://gamefaqs.gamespot.com/pc/589475-warcraft-iii-the-frozen-throne/faqs/17813
- Q3 What next, why? Quest log separates **main** (required to proceed) from **optional** side quests "not initially revealed"; villagers with "!" offer quests; quest targets often pinged on minimap (e.g. gnoll position "shown on the minimap") — https://en.wikipedia.org/wiki/Warcraft_III:_Reign_of_Chaos ; https://gamefaqs.gamespot.com/pc/256222-warcraft-iii-reign-of-chaos/faqs/18954
- Q4 How to get there? Minimap ping of location; click minimap to move; no route drawing.
- Q5 What changed? Spacebar → "Centers in the last notification. VERY useful" (FAQ); message log F12.
- Q6 History? Mission summary screen after each mission; message log — https://www.mobygames.com/game/6860/warcraft-iii-reign-of-chaos/screenshots/
- Q7 Return home? Backspace cycles main halls — classic.battle.net link above.
- Q8 See whole? Minimap; camera "can only be zoomed and rotated slightly" (Wikipedia).
- Q9 Mode switch? F9–F12 modal dialogs; cutscenes in-engine so no screen change between story and play.
- Q10 (new) **"Where is my idle/at-risk capacity?"** — idle-worker counter turns an invisible absence (a unit doing nothing) into a visible, countable, one-click object.

### 3. Most successful solutions
1. **Persistent shortcut buttons for "things you must not lose track of" (hero portraits, idle-worker counter).** Mechanics: always-on HUD icons, single click selects, second click centers camera; F1–F3 / F8. Evidence **C**: Wikipedia gameplay description; UOL review 2002 praised "signalling idle builders with a simple icon" — https://www.uol.com.br/start/analises/2002/07/26/warcraft-iii.htm ; idle-worker hotkey carried into SC2 (F1) — https://clan-os.blogspot.com/2008/11/battlenet-chat-commands.html. Context **B**: 4.4M shipped, >1M in first month (Wikipedia, not causal). Driver: *externalised attention — a pull-based reminder of exceptions; converts "search the map" into "click the badge".*
2. **Seamless in-map quests + Quest Log with main/optional split.** Evidence **C** (Wikipedia; FAQs). Driver: *goal hierarchy made explicit (required vs. optional) and discovered in-place, no context switch to a briefing screen.*
3. **Camera pulled back to near-isometric** after a low third-person camera failed. Evidence **C** (Pardo, below). Driver: *strategic overview beats immersion for navigation in a multi-unit game.*

### 4. Failures / criticism
- Pardo: low camera "was disorienting when you went around the map and it was difficult to select units… you didn't have a good view of the battlefield" — https://flylib.com/books/en/2.489.1.80/1/ (2003). Failure fixed in development.
- Linear chapter order (no choice) — *later explicitly reversed by SC2's mission choice.*

### 5. Designer intent
- Rob Pardo: lead designer role "went to, you know, 'how does the mini-map work?' spec'ing out the design documentation" — https://flylib.com/books/en/2.489.1.80/1/
- Pardo: "Eventually we pulled the camera into a more traditional isometric view and that's when we really started making progress." — same URL.

---

## StarCraft (1998) / Brood War — Blizzard (lead designers incl. James Phinney; *design leadership attribution not verified in fetched sources*)

### 1. Layers
| Layer | What the player sees | Task solved | Enter / leave |
|---|---|---|---|
| Campaign / briefing room | Menu-like screen, character portraits, captioned voices, objectives | Why this mission | Between missions |
| Playfield | 640×480 isometric | Act | default |
| Console HUD | Minimap, selection panel, command card | Overview / options | always on |
| Minimap modes | Tab hides/reveals terrain; Shift+Tab toggles diplomacy colors (green you / yellow ally / red enemy) | Read force disposition | Tab / Shift+Tab |
| Alerts / transmissions | Voice ("Nuclear launch detected", "base under attack") + red minimap ping; Spacebar centers last transmission | What's happening off-screen | Space |
| Control groups | Ctrl+# assign; # select; # again = center camera | Teleport to my forces | number keys |

Sources: manual hotkey table — https://archive.org/stream/starcraft_202306/StarCraft_djvu.txt ; briefing — https://en.wikipedia.org/wiki/StarCraft_(video_game) ; Blizzplanet SC1 briefing description — https://www.blizzplanet.com/blog/comments/starcraft_ii_single_player_hands_on_the_bridge_room

### 2. Task questions
- Q1 Where am I? Minimap viewport; "Ctrl-C / Alt-C Center on Selected Unit" (manual).
- Q2 Where can I go? Fog; tech-tree gating.
- Q3 What next? Briefing objectives; in-mission transmissions.
- Q4 How to get there? Shift+command waypoints (manual).
- Q5 What changed? **Audio alert + minimap ping + Spacebar recall**. Academic description: hearing the adjutant "stating that their base is under attack, while seeing a red ping… will prompt them to click on the spacebar to quickly move the camera there" — https://library.oapen.org/bitstream/handle/20.500.12657/86607/9780472904457.pdf (2023). Nuke target shown to all as "small flashing red dot" + announcement — https://starcraft.fandom.com/wiki/Nuclear_missile
- Q6 History? Not addressed in-mission (score screen post-mission).
- Q7 Home? No dedicated key found in manual (*WC3 added Backspace*). Not addressed.
- Q8 Whole? Minimap only.
- Q9 Mode switch? Briefing ↔ mission are separate screens.
- Q10 (new) **"Read the map semantically"** — diplomacy-colour minimap mode recolours the overview by relationship (mine/ally/enemy) rather than player colour.

### 3. Most successful solutions
1. **Multimodal off-screen alert → one-key camera recall (Space).** Evidence **C** (manual, academic description); **B** context: StarCraft 11M sold, Guinness best-selling PC strategy game (2013) — https://guinnessworldrecords.com/world-records/best-selling-strategy-game-for-pc (not causal). Driver: *attention capture (audio) + spatial index (ping) + zero-cost travel (hotkey) = closed loop "notice → locate → go".*
2. **Control groups with double-press-to-center.** Evidence **C** (manual). Driver: *bookmarks for places-that-move.*

### 4. Failures / criticism
- 12-unit selection limit: GameSpot review 1998 ("only allows you to select 12 units at a time") — https://www.gamespot.com/reviews/starcraft-review/1900-2533189/ ; MobyGames user review: "gets very, very irritating"; console "swallows up about a third of the screen… like playing a game through a freaking telescope" — https://www.mobygames.com/game/378/starcraft/
- Spacebar remembers only the **last** alert: players asked for history ("Press it twice… centers on the second last alert"), complaint that a "unit complete" alert overwrites an attack alert — https://tl.net/forum/starcraft-2/57151-general-mouse-keyboard-and-ui-controls?page=2 (2007, C).

### 5. Designer intent
- Not found verbatim for SC1 navigation in fetched sources. Gap.

---

## StarCraft II: Wings of Liberty (2010), Heart of the Swarm (2013), Legacy of the Void (2015) — Blizzard; lead designer Dustin Browder

### 1. Layers
| Layer | What the player sees | Task solved | Enter / leave |
|---|---|---|---|
| Story-mode hub ("story mode space") | WoL: Hyperion with Bridge, Armory, Cantina, Lab (+Joey Ray's bar early); HotS: Leviathan (Bridge/Nerve center, Evolution Pit, Kerrigan); LotV: Spear of Adun (Bridge, War Council…) | Where am I between missions; prepare; story | After each mission; rooms reached via an exit sign → drop-down room menu |
| Star Map / Celestial Array (on Bridge) | Planets with mission offers: giver, pitch video, reward (credits, unit unlock), mission type | What next and why | Click Star Map; launch mission |
| Mission archives / Battle Report | Replay completed missions, stats | History / redo | Bridge; master archives in HotS |
| Armory / Lab / Evolution Pit | Upgrade trees; research progress "like a quest log" | Spend progress | Click room |
| Cantina TV news | News reports reacting to your last mission | What changed because of me | After each mission a new report |
| In-mission HUD | Minimap, alerts, idle-worker (F1), control groups, ping (Alt+G) | as SC1 | as SC1 |

Sources: Browder keynote 2009 — http://www.blizzplanet.com/blog/comments/starcraft_ii_single_player_hands_on_dustin_browder_keynote ; Cantina room / exit sign menu — https://www.blizzplanet.com/blog/comments/starcraft_ii_single_player_hands_on_the_cantina_room ; Battle Report replay — https://starcraft.fandom.com/wiki/StarCraft_II:_Wings_of_Liberty ; HotS hub — https://www.blizzplanet.com/blog/comments/blizzplanet-review-starcraft-ii-heart-of-the-swarm ; LotV — https://news.blizzard.com/en-us/article/16668520/legacy-of-the-void-campaign-preview ; mission/master archives — https://liquipedia.net/starcraft2/Campaign ; ping — https://www.ign.com/wikis/starcraft-2/Simplified_Controls

### 2. Task questions
- Q1 Where am I? Diegetic: the room you stand in; LotV Bridge "surroundings… will change to reflect your current location" (planet outside) — Blizzard news link.
- Q2 Where can I go? Star Map shows "one to four places to go next" — https://www.unboringdungeons.com/blog/the-story-of-starcraft-part-21-wings-of-liberty-the-hyperion ; prerequisites by count (e.g. Horner missions after 6 total missions) — Liquipedia. Only 2–4 hard exclusive choices in WoL (Browder).
- Q3 What next, why? Each mission is pitched by a character with stated payout and unlock ("pay us 60,000 credits and we got access to Firebats… mission type is 'Evacuate the colony'") — Browder keynote.
- Q4 How? Click planet → launch (no travel).
- Q5 What changed? Cantina news report "after each mission there is a new one"; HotS hub "changes after missions with new things to interact with or old things removed" — https://gamefaqs.gamespot.com/pc/954721-starcraft-ii-heart-of-the-swarm/faqs/66772
- Q6 History? Battle Report / mission archives with stats incl. build order.
- Q7 Home? The ship *is* home; you always return there after a mission.
- Q8 Whole? Star Map = campaign overview; missions ~19–20 critical path of ~30 (Browder 2009).
- Q9 Mode switch? Hub ↔ mission via Bridge only; rooms via one menu.
- Q10 (new) **"Can I defer a hard thing?"** — non-linear order lets the player park a mission and return stronger (Browder quote §5).

### 3. Most successful solutions
1. **Diegetic hub with function-per-room (story=Cantina, upgrades=Armory, progress=Lab, choice=Bridge).** Evidence **C**: retained across all three campaigns with adaptation (HotS cut Cantina/Lab to Bridge + Evolution Pit) — Blizzplanet HotS review; LotV Bridge + War Council. Driver: *spatial memory / method-of-loci: each verb has a place; "home base" ritual between sorties.*
2. **Mission board with pitch + reward + type, mostly non-exclusive.** Evidence **C** (Browder; previews). Driver: *informed choice + reversibility ("you can come back and absolutely choose to do any mission you've skipped").*
3. **"World reacts" feedback (news TV) as the what-changed channel.** Evidence **C**. Driver: *consequence visibility; closes loop between action and narrative.*

### 4. Failures / criticism
- Browder on the Lab: "not very happy with this interface… very easy to miss some of the bonus items so then you really can't complete the quest… We are going to throw out this whole UI" (2009) — Browder keynote URL; Kotaku: Browder "didn't sound too thrilled" with Lab — https://kotaku.com/first-starcraft-ii-single-player-campaign-hands-on-now-5338309
- Hub tracking of all mission branches was buggy pre-release (Battle Report showed 26, "it's actually bugged. It's not listing all the A/B choices") — https://www.engadget.com/2010-05-02-blizzards-dustin-browder-talks-starcraft-2.html
- *Judgment:* room-to-room travel via menu adds clicks vs. a flat menu; no source quantifies this.

### 5. Designer intent
- Browder: "This is where you come in between missions to interact with characters, buy different technologies and make some choices about which mission you might want to take next." — Blizzplanet keynote.
- Browder: "if you get stuck, you can go, 'I'm going to come back to this one. I'm going to go myself something powerful and come back here and make this one suffer.'" — https://www.insidemacgames.com/historical/news/story.php%3FArticleID=17937.html (2009)
- Browder: "In our past RTS campaigns, we've typically walked players through a linear series of missions… In StarCraft II, players will have some significant choices to make… the order in which they tackle missions" — https://www.insidemacgames.com/historical/news/story.php%3FArticleID=17606.html (2009)
- Browder: "Between the Armory and this [Bridge], this is the heart and soul of our story mode environment." — keynote.

---

## SimCity (1989), SimCity 2000 (1993), SimCity 3000 (1999) — Maxis; designer Will Wright (SC3000 UI: Christian Stratton)

### 1. Layers
| Layer | What the player sees | Task solved | Enter / leave |
|---|---|---|---|
| Edit window/view | Tile city, tools; RCI demand indicators at top | Build | default |
| Maps window (1989) | Separate window: City form, Power grid, Transportation, Population, Traffic, Pollution, Crime, Land value, City services; red rectangle = edit view area, draggable | See systems; jump | Ctrl-M / Windows menu |
| Graphs window | Time series (crime, cash flow, pollution) | History / trend | Windows menu |
| Evaluation window | Public opinion poll, "most pressing problems", approval % | What should I fix next | Windows menu |
| SC2000 newspaper | Headlines incl. opinion polls, warnings (aging plant) | What changed / what people want | Pops at founding; subscribe yearly |
| SC2000 zoom & rotate; underground view | Zoom levels in one window; show/hide buildings, underground infrastructure | See whole / layers | Toolbar |
| SC3000 advisors, news ticker, data maps superimposable on Navigation map | Advisor briefings; ticker; overlays | What next / where | Toolbar |

Sources: 1989 manual (RCI, Maps view) — https://drwjf.github.io/ctm/references/SimCity_1989_Manual_EN.pdf ; IBM manual Maps window/rectangle — https://archive.org/stream/simcity_ibm_manual/SimCity%20-%20Manual_djvu.txt ; Evaluation window (>55% approval = secure) — https://www.lemonamiga.com/games/docs.php?id=1448 ; SC2000 manual newspaper/toolbar — https://archive.org/stream/SimCity.2000-Manual/SimCity.2000-Manual_djvu.txt ; SC2000 newspaper unique in series — https://electronicarts.fandom.com/wiki/SimCity ; SC3000 Prima guide data maps on Navigation Map — https://archive.org/stream/SimCity_3000_Prima_Official_eGuide/SimCity_3000_Prima_Official_eGuide_djvu.txt

### 2. Task questions
- Q1 Where am I? Rectangle on the Maps/Navigation map.
- Q2 Where can I go? Unbounded sandbox within map; scenarios add goals.
- Q3 What next? **RCI demand bars** ("Above the center line indicates a positive demand") + Evaluation "most pressing problems" + advisors/newspaper.
- Q4 How? N/A (direct placement).
- Q5 What changed? Newspaper (SC2000), ticker (SC3000+), disasters.
- Q6 History? Graphs window.
- Q7 Home/safety? Save; pause.
- Q8 Whole? 1989: separate map window; SC2000 "integrated these [close-up and overall views] with zooming in one window" (Wright, 1996) — https://donhopkins.medium.com/designing-user-interfaces-to-simulation-games-bd7a9d81e62d
- Q9 Mode switch? Window-based (classic Mac/Windows metaphor).
- Q10 (new) **"Why is the system behaving this way?"** — data maps expose hidden simulation state (Stratton: data maps "gave the player the ability to peek at what the simulator is doing") — https://simcity2013.blog.fc2.com/blog-entry-174.html (Japanese translation of official SimCity blog "Data Maps in SimCity, Part 1", 2012)

### 3. Most successful solutions
1. **RCI demand indicator** — three bars, the single "what next" signal. Evidence **C**: survived in every SimCity through SC4 (ChristopherBerry: "quite possibly the most important heads up data") — https://christopherberry.ca/simulation-and-data-exploration/. Driver: *one-glance needs gauge for the whole system — the city's equivalent of Sims motives.*
2. **Overlay maps of hidden variables with viewport frame.** Evidence **C**. Driver: *make the model visible; overview+detail.*
3. **Multi-voice feedback (poll, newspaper, advisors).** Evidence **C**. Driver: *narrativised telemetry.* MIT thesis lists the full set: "tiny graph indicating relative demand… map overlays… newspaper commentary and advisors' briefings" — https://web.mit.edu/mr_mole/thesis/ch2.pdf

### 4. Failures / criticism
- Stratton (UX director, official blog, translated): in SC2000 the player "needed to view several different views to see the full picture of how the fire system works… the UI can get in the way exactly when the player is panicking"; SC3000's sprite engine had no overlay ability so only "simple improvements" — http://simcity2013.blog.fc2.com/blog-entry-175.html
- Wright: SimEarth (sibling) "too complex a simulation for people to grasp"; time-scale changes hard to convey — Hopkins Medium link.

### 5. Designer intent
- Wright (as summarised by Don Hopkins, 1996): "The digital models running on a computer are only compilers for the mental models users construct in their heads." — https://donhopkins.medium.com/designing-user-interfaces-to-simulation-games-bd7a9d81e62d
- Wright: "With SimCity Classic as the standard… SimEarth was too complex, SimAnt was too simple, and SimCity 2000 was just right." — same URL.

---

## SimCity 4 (2003) — Maxis (EA)

### 1. Layers
| Layer | What the player sees | Task solved | Enter / leave |
|---|---|---|---|
| Region view | "Patchwork of different-sized city tiles", names, populations; incorporated vs. unincorporated | Which city to play; how cities relate | Opening view; exit city → region |
| City (Mayor / God / MySim modes) | 3D terrain, 2D sprite buildings, deep zoom | Build / terraform / observe | Mode buttons |
| Needs meters | Sims-style meters for Health, Education, Pollution… | What's wrong | always visible |
| News ticker | Continuous, clickable headlines (jump to location) | What changed / what's needed | always visible; click |
| Advisors panel | 3D advisors by department | Advice | Panel |
| Data views / overlays | 3D overlay on city, e.g. fire stations (green) + fire areas (orange) + smoke | Locate problems | Toolbar |
| MySim | Imported Sim reports what they think of where they live | Ground-level feedback | MySim mode |

Sources: manual region view — https://archive.org/stream/SimCity_4_Manual/SimCity_4_Manual_djvu.txt ; region basics/advisors — https://www.simtropolis.com/library/maxis/sc4/tools/SC4rh_deluxe_manual.pdf ; GameSpy needs meters — http://pc.gamespy.com/pc/simcity-4/5557p1.html ; GameSpot ticker — https://www.gamespot.com/reviews/simcity-4-review/1900-2908858/ ; ticker clickable — https://www.quora.com/How-do-I-play-SimCity-4 (C) ; overlay description — http://simcity2013.blog.fc2.com/blog-entry-175.html ; seamless zoom from map to building — https://www.4gamer.net/news/history/2002.05/20020527002348detail.html

### 2. Task questions
- Q1 Where am I? Region tile highlighted; city name/pop in region corner.
- Q2 Where can I go? Any region tile; neighbours connect by road/rail/highway at edges — 1UP review via archive https://web.archive.org/web/20121103212935/http:/www.1up.com/reviews/simcity-4_2
- Q3 What next? Ticker "will keep you informed about whether your sim population needs anything" (GameSpot); meters; advisors.
- Q4–Q5: ticker click-to-locate; MobyGames: "only the most urgent messages… are popped-up — the rest can be grouped, filtered and ignored" — https://www.mobygames.com/game/7999/simcity-4/reviews/windows/
- Q6 History? Graphs.
- Q7 Home? Region view acts as save/exit hub.
- Q8 Whole? **Region view = meta-map** above city; continuous zoom within city.
- Q9 Modes? God/Mayor/MySim buttons.
- Q10 (new) **"How does my place relate to its neighbours?"** — region view makes inter-city dependency (commuting, buying power/water) navigable.

### 3. Most successful solutions
1. **Region view as overworld.** Evidence **C**: 1UP "The largest, most welcome change is the region view". **B** context: SC4 best-selling PC game of 2003 at ~2M per HP list — https://www.hp.com/us-en/tech-takes/gaming/research/best-selling-pc-games-by-year.html (secondary, weak). Driver: *nested scales with persistent state; meta-map as save hub.*
2. **Priority-tiered notifications (pop-up only urgent; ticker for rest; filterable).** Evidence **C** (MobyGames review). Driver: *interrupt only above threshold.*

### 4. Failures / criticism
- GameSpy: "mostly-useless city advisors (would that they could take away some micromanagement instead of whining all the time!)" — GameSpy link.
- IGN: interface "takes up a lot of the viewable screen space" below 1024×768 — https://www.ign.com/articles/2003/01/14/simcity-4-review

### 5. Designer intent
- Not found verbatim for SC4. GameSpy reports Maxis "opted to sculpt their interface along similar lines [to The Sims]… SimCity 4 shows you the needs of your city" (paraphrase, C).

---

## SimCity (2013) — Maxis Emeryville (EA); creative director Ocean Quigley; UX director Christian Stratton; GlassBox engine (Andrew Willmott)

### 1. Layers
| Layer | What the player sees | Task solved | Enter / leave |
|---|---|---|---|
| Region | Several city plots sharing resources (online) | Specialise / cooperate | Region screen |
| City (live view) | Agent-based simulation; zoom/tilt | Build, watch | default |
| Data layers (≈30 icons, bottom-right) | Full-screen in-world overlays: power flowing, water table, sewage, crime, happiness, etc. | See system state in place | Toggle icon; also auto-shown when placing a related building |
| Building panels | Click building → stats, modules | Local info | Click |

Sources: data layer list — http://simcityversity.blogspot.com/2013/02/simcity-192-data-map-overlays.html ; Wikipedia: "user interface, which was inspired by Google Maps and infographics… only presented when needed… opening up the water tower instantly changes the landscape" — https://en.wikipedia.org/wiki/SimCity_5 ; Halvorson (UI designer) — http://www.jasonhalvorson.com/simcity

### 2. Task questions
- Q1 Where am I? Camera on city; *no minimap found in sources.*
- Q2 Where can I go? Region plots; city boundary fixed (small).
- Q3 What next? Context-triggered data layers + building panels + advisors-style notifications (not fully sourced).
- Q4 How? N/A.
- Q5 What changed? Agents animate flows (power "will start flowing along power conductors… If there's a break… the player will immediately see the break") — Stratton, official blog Part 2, quoted at http://sirmmo.blogspot.com/2012/05/data-maps-part-2.html
- Q6 History? Graphs (not verified in fetched sources).
- Q7 Home? Region/save (always-online).
- Q8 Whole? **Weak**: "fully zoomed out… I'm only seeing about 1/4 of my city" — http://www.thatgamesux.com/simcity-tiny-maps-and-tiny-zooms (2013)
- Q9 Modes? Overlay toggles stay in the live world ("no extra screen required").
- Q10 (new) **"Learn the system without a tutorial"** — layers teach causal mechanics by showing flows.

### 3. Most successful solutions
1. **In-world, animated, context-triggered data layers.** Evidence **C**: thatgamesux "The UI hasn't been one of them [the complaints], and that's because it's pretty good"; producer Kip Katsarelis on power/water layers "so eloquently communicated the detailed workings" — https://www.forbes.com/sites/jasonevangelho/2013/03/04/7-questions-with-simcity-producer-kip-katsarelis/ . **B** context: 1.1M sold in two weeks, "biggest SimCity launch of all time" — https://news.ea.com/press-releases/press-releases-details/2013/SimCity-Sells-More-Than-1-Million-at-Launch/default.aspx (sales not attributable to UI; launch dominated by server failures). Driver: *in-situ overlay (no context switch); showing causation (flow) not just state (colour); progressive disclosure (layer appears when relevant).*

### 4. Failures / criticism
- Cannot zoom out to see whole city even though cities are small (thatgamesux).
- Icon legibility ("little gear… means 'industrial tech' but I only know that because I just looked it up") — same.
- Fan worry that charts/tables were cut; Maxis: "There's no lack of data… experimenting with playful ways of representing that data" — https://community.simtropolis.com/omnibus/other-games/maxis-amaa-transcript-r232 (2012)

### 5. Designer intent
- Stratton: "as if they had X-ray goggles that could show electricity flowing. Through the data layers, we're teaching the player the mechanics of a complex system without them being aware of it." — http://sirmmo.blogspot.com/2012/05/data-maps-part-2.html (quoting simcity.com blog, 2012)
- Ocean Quigley (creative director, 2012): "Everything in there is doing a UI job to tell the player what's going on." and "what you're really doing is you're looking at UI that's telling you the state of the simulation. The UI is just aesthetically stylized to look like the city." (e.g. a parked car means someone is inside; lights on means power) — https://www.gamedeveloper.com/design/how-do-you-put-the-sim-in-i-simcity-i- (verified)
- Halvorson: "By layering visual data onto the live game models, we were able to clearly highlight points of interest" — http://www.jasonhalvorson.com/simcity

---

## The Sims (2000), The Sims 2 (2004), The Sims 3 (2009), The Sims 4 (2014) — Maxis; designer Will Wright (Sims 1)

### 1. Layers
| Layer | What the player sees | Task solved | Enter / leave |
|---|---|---|---|
| Neighborhood screen | Sims 1: "single screen displaying all playable lots"; Sims 2: neighborhood with lots; Sims 4: world → neighborhoods map | Choose household/lot | Main menu / exit lot (loading screen) |
| Lot / Live mode | Isometric house; selected Sim; plumbob over active Sim; action queue top of screen | Live | default |
| Build / Buy modes | Catalogues; **time pauses** | Construct / furnish | Mode buttons |
| Control panel "brain" (Sims 1) | Motives (default), personality, skills, relationships sub-panels | Needs = what next | Click brain quadrant |
| Needs bars | Sims 1: 8 red/green bars (hunger, comfort, hygiene, bladder, energy, fun, social, room) | What does my Sim need now | Live mode default panel |
| Wants/Fears + aspiration meter (Sims 2) | Icon slots, lockable; aspiration bar | Medium/long-term goals | Live mode panel |
| Map View (Sims 3) | Whole open town; colour-coded map tags (green home, blue community, career, orange known Sims' homes, star = opportunity) | Where are people/places; travel | M key / skyline button; click tag to send Sim |
| Whims/Wants (Sims 4) | Up to 3 slots above portrait | Short-term what next | Live mode |

Sources: https://en.wikipedia.org/wiki/The_Sims_(video_game) ; Sims 1 design doc control panel/brain — https://donhopkins.com/home/TheSimsDesignDocuments/TheSimsDesignDocumentDraft7-DonsReview.pdf ; motives list — https://gmtk.substack.com/p/the-genius-ai-behind-the-sims ; Sims 2 diary — https://www.gamespot.com/articles/the-sims-2-designer-diary-8/1100-6100496/ ; Sims 3 manual — https://eaassets-a.akamaihd.net/eahelp/manuals/the-sims-3-manual_PC.pdf ; map tag colours — https://www.thesimswiki.com/wiki/The_Sims_3 ; Sims 4 wants — https://www.rockpapershotgun.com/the-sims-4-wants-and-fears

### 2. Task questions
- Q1 Where am I? Plumbob over the controlled Sim; Sims 3 map shows plumbob next to the lot's tag.
- Q2 Where can I go? Sims 1 base: home lot only; Hot Date (2001) added Downtown — Wikipedia. Sims 3: open world; Sims 4: lots/neighborhoods via load.
- Q3 What next, why? **Needs bars** (now); objects "advertise" which need they satisfy, driving autonomy; Sims 2 wants (soon) tied to aspiration (life) with score bar; Sims 4 wants.
- Q4 How to get there? Click object → pie menu; Sims 3 click map tag → travel.
- Q5 What changed? Thought bubbles ("flashing red for urgency") — https://www.thegamer.com/sims-1-all-needs-motives-keep-happy ; Sims 2 slot-machine animation on want fulfilment.
- Q6 History? Skills/career level, relationships panel, memories (Sims 2).
- Q7 Safety? Pause; Build/Buy freeze time.
- Q8 Whole? Sims 3: "zoom out to see the entire neighborhood or zoom in to see a single Sim" — https://giantbomb.com/wiki/Games/The_Sims_3 ; Sims 4: map view static, travel via loads.
- Q9 Modes? Three-mode switch (Live/Build/Buy) with time pause as a mode boundary.
- Q10 (new) **"What can this object do for me?"** — affordance-advertising objects + pie menus make the environment self-describing.

### 3. Most successful solutions
1. **Needs bars as the "what next" engine.** Mechanics: 8 decaying meters, red/green; objects advertise need satisfaction; free will fills gaps. Evidence **B** context: The Sims became best-selling PC game in history by 2002 (6.3M), 16M shipped by 2005 — Wikipedia; Guinness 14.91M all platforms — https://www.guinnessworldrecords.com/world-records/111571-best-selling-life-sim-videogame ; ~60% female players — Wikipedia (not causal to UI). **C**: Sims 2 producer: original interface did this "in a clear, concise, and compelling manner" — Sims 2 diary. Driver: *homeostatic goals — urgency is computed and colour-coded, so the next action is always legible; Maslow pyramid (Wright, MasterClass) — http://www.masterclass.com/classes/will-wright-teaches-game-design-and-theory/chapters/exploring-player-psychology*
2. **Goal ladder: needs (minutes) → wants (hours/days) → aspiration (lifetime)** (Sims 2). Evidence **C** (diary); Sims 4 brought back wants/fears in 2022 after whims were criticised (RPS; fan wishlists, C). Driver: *nested goal horizons with lockable pins ("lock a want… so players can strategize toward long-term wants").*
3. **Sims 3 Map View with colour-coded, clickable tags + seamless open world.** Evidence **C**: GameRant 2024 "Still the Best in the Franchise" — https://gamerant.com/sims-3-15-year-anniversary-open-world-best-setting-map ; GameRevolution: "the ability to zoom out and view the breadth of the open world engenders a sense of cohesion" — https://www.gamerevolution.com/review/65337-the-sims-4-review. Driver: *one continuous zoom from person to town; tags encode relation-to-me (home / known / work / opportunity).*
4. **Pause-on-mode-switch (Build/Buy freeze time).** Evidence **C** (Wikipedia). Driver: *mode boundary = safe space; reduces mode errors.*

### 4. Failures / criticism
- Sims 4 loading screens between every lot: "even to the house adjacent… about 20 seconds… the world of The Sims 4 doesn't feel like a world at all" — https://www.polygon.com/2014/9/10/6124747/the-sims-4-review-skin-deep ; list of what triggers loads — https://simsvip.com/2014/07/02/the-sims-4-loading-screens-the-world-explained ; still a top complaint in 2024–26 — https://screenrant.com/the-sims-4s-neighborhoods-still-have-a-huge-immersion-breaking-problem , https://simscommunity.info/2026/10/27/sims-4-open-neighborhood-mod-preview/
- Sims 3 open world: lag/stability issues as packs accumulate — https://comicbook.com/gaming/news/the-sims-4-3-2-neighborhood-series-customization-lots ; GameRevolution notes Sims 4's lot system bought "greatly enhanced stability".
- Sims 4 2022 wants/fears criticised: "forces people to only play a single specific… way" (forum, C) — https://forums.ea.com/discussions/the-sims-4-gameplay-en/cars-horses-open-world-why-get-sims-4/8673266
- Sims 3 map tags sometimes vanish/filtered by mistake (support Q&A) — https://gamefaqs.gamespot.com/pc/936498-the-sims-3/answers/421554-why-can-my-sim-not-see-the-town-map-icons

### 5. Designer intent
- Wright: "We iterated the Sims interface like 11 times and every iteration we got rid of a few buttons." — https://gameindustrylibrary.com/documents/will-wright-s-design-plunder
- Wright on learning layers: "you start noticing that they have needs. They need to go to the bathroom…" (progressive discovery: move → needs → goals) — https://pensivepuffin.com/dwmcphd/syllabi/info360_au13/supplements/Wright.Interview.pdf
- Wright (1996 talk, per Hopkins): overhead 3rd-person view "doesn't suffer from the disorienting navigational problems that a first-person view like Doom imposes" — https://donhopkins.medium.com/designing-user-interfaces-to-simulation-games-bd7a9d81e62d
- Wright: "the fridge yells at the player, 'I can satisfy hunger five!'" — https://www.will-wright.com/willshistory12.php
- Jonathan Knight (Sims 2 producer): "Arguably, the most important thing any game can do is communicate the user interface in a clear, concise, and compelling manner." — Sims 2 diary.
- Charles London (artist) on the plumbob: "It's everywhere. It's the symbol of the game" — https://www.vice.com/en/article/sims-game-an-oral-history

---

## Cross-game patterns in this cluster

1. **Overview + detail with a "you-are-here" frame is invariant.** Every title pairs a playfield with an overview showing the current viewport (WC/SC minimap rectangle, SimCity 1989 red rectangle, SC4 region view, Sims 3 map view). Where the overview was weak (SimCity 2013 can't zoom out to whole city; Sims 4 static map + loads), it is the most cited navigation complaint. (C)
2. **"What next" is a computed needs gauge, not a quest list, in sandboxes.** RCI bars (SimCity) and motive bars (Sims) are the same pattern: few bars, colour/height = urgency; GameSpy explicitly links SC4's meters to The Sims. Goal ladders then stack horizons: needs → wants → aspiration (Sims 2); main → optional quests (WC3). (C; sales B as context only)
3. **Exception surfacing beats search.** Idle-worker counter, hero portraits, alert pings, priority-filtered tickers (SC4) all convert "scan the world for problems" into "click the badge". Best implementations close the loop notice → locate → go with one key (Space, F8, ticker click). Known gap: single-slot recall (SC1 spacebar) loses earlier alerts — players asked for alert history. (C)
4. **Separate stable knowledge from perishable knowledge.** WC2 three-state fog (unseen / remembered-stale / live) and SimCity data layers (hidden state made visible) both tell the player *how fresh* what they see is. (C)
5. **Show causation in place, don't send the player to another screen.** Evolution: SimCity 1989 separate Maps window → SC2000 multiple views (UI "in the way exactly when the player is panicking", Stratton) → SC4 3D overlay on city → SC2013 animated in-world flows that appear in context. Same arc in WC3: briefing screens replaced by in-map quests. (C)
6. **A home base between sorties, organised spatially by verb.** SC2's ship rooms (story / upgrades / research / mission board), SC4 region view as save hub, Sims neighborhood screen. Each function has a place; the player always returns there; the hub visibly changes to show consequences (news TV, new characters). (C)
7. **Choice framed with stakes and reversibility.** SC2 mission board: who asks, why, reward, unlock, mission type; most choices non-exclusive and revisitable ("come back to this one… make this one suffer"). (C)
8. **Mode boundaries are made safe.** Sims Build/Buy pause time; WC3 F9–F12 modal dialogs; SC2 hub is outside mission time. Seamlessness vs. stability is a real trade-off (Sims 3 open world loved but laggy; Sims 4 stable but fragmented by loads). (C)
9. **Subtract UI until it disappears.** Wyatt ("interface just got out of the way"), Wright (11 iterations removing buttons), Quigley ("everything… doing a UI job"). Camera choice is part of navigation: WC3's low camera and first-person views were rejected as disorienting in favour of overhead views. (C)

### Gaps / not established
- No A-grade (controlled or telemetry) evidence for any navigation feature in these games was found.
- Warcraft I/II campaign-select screens and StarCraft I designer quotes on navigation were not found in fetched sources.
- SimCity 2013 notifications/graphs and minimap presence not verified.
- Sales figures are aggregated from Wikipedia/Guinness/EA press releases and cannot be attributed to UI.
