# Cluster: GAME QA, PLAYTESTING & BETA — exemplar dossier (2026-11-27)
Evidence grades: A measured/controlled or large data; B credible case data or practitioner report with numbers; C anecdote/reputation. Sources: web_search/web_fetch only. *Judgment* = my inference, not a sourced fact.

---

## 1. Valve — empirical playtesting (Half-Life, Portal, biometrics)
**Header.** Valve, 1997–present; Ken Birdwell (Cabal), Mike Ambinder (experimental psychologist), Gabe Newell. In because Valve is the canonical "playtest is the core of development" studio.

| Layer | Catches | Who/what | When |
|---|---|---|---|
| Silent observed playtest (outsider, 2 h) | confusion, "obvious" puzzles that aren't | level's cabal + designer, mute behind player | weekly from first playable |
| Survey + Q&A | stated fun, frustration | Ambinder's team | after each session |
| Stats / design experiments | difficulty curve (HP over time, pacing) | instrumentation | ongoing |
| Biofeedback (skin conductance, eye tracking) | arousal/engagement spikes | supplemental tests | side studies |

**Q1** "Fun — not bug testing, not balancing, DEFINITELY not focus testing" (https://media.gdcvault.com/gdc09/slides/GDC09_Ambinder_ValvesApproach.pdf). **Q2** One outside volunteer per session, pulled from local registration-card senders (https://www.jmeiners.com/shamans/papers/art/half_life_design.pdf). **Q3** Each 2-hour session ≈100 action items; ~200 sessions on Half-Life (same source). **Q4** Internal first, external "soon after" (https://www.stevebromley.com/blog/2011/09/01/valves-philosophy-with-user-research-in-games-habe-newell-and-mike-ambinder/). **Q5** Not addressed. **Q6** Iterate until "no longer excruciatingly painful to watch the playtests" (David Speyrer, https://gmtk.substack.com/p/valves-secret-weapon). **Q7** Not addressed in sources. **Q8** Sept 1997: lukewarm playtests → game scrapped and rebuilt (https://en.wikipedia.org/wiki/Half-Life_(video_game)). **Q9** Weekly cabal cycle: Monday sets playtest goals, all week aims at Friday's test (https://book.leveldesignbook.com/process/blockout/playtesting). **Q10** Playtests "settle design arguments" (https://www.readkong.com/page/the-cabal-valve-s-design-process-maribeth-gandy-7611979).

**Practices.**
1. *Silent observation, weekly, from week one*: Portal team playtested a puzzle-less first room in week one, vs. Narbacular Drop tested only in its last month "far too late" (https://www.gamedeveloper.com/design/thinking-with-portals-creating-valve-s-new-ip). Grade B (200 sessions/20k items). Driver: curse of knowledge — designers can't see their own arbitrariness.
2. *Design = hypothesis, playtest = experiment* (GDC09 slides). Grade C. Driver: removes ego from design disputes.
3. *Biofeedback*: L4D2 AI Director driven by arousal rated "twice as enjoyable" in post-test surveys (https://www.pcgamer.com/breaking-watch-portal-2-eye-tracking-now/). Grade B (small internal sample).

**Failures/criticism.** Players who know they're monitored bias eye movements and responses (https://www.vice.com/en/article/gdc-11-valve-talks-biofeedback-biologic-inputs-for-videogames/). *Judgment*: method is costly in labor; Valve's sources say little about bug QA or post-release.

**Quotes.** "We see our game designs as hypotheses and our playtests as experiments to validate these hypotheses" — Ambinder (https://gmtk.substack.com/p/valves-secret-weapon). "Nothing is quite so humbling as being forced to watch in silence as some poor play-tester stumbles around your level for 20 minutes" — Birdwell (https://www.readkong.com/page/the-cabal-valve-s-design-process-maribeth-gandy-7611979).

---

## 2. Nintendo — blind "monitor tests", World 1-1 as tutorial, Mario Club
**Header.** Nintendo, 1985–present; Shigeru Miyamoto, Takashi Tezuka, Satoru Iwata, Mario Club Co. In as the iconic "teach through play, verify by watching first-timers" studio.

| Layer | Catches | Who/what | When |
|---|---|---|---|
| Monitor test (silent, no explanation) | players not doing what designer expected | designer watching from behind | during development |
| Design-by-simulation of first-timer | onboarding gaps | designers | level design |
| Mario Club debug + difficulty tuning | bugs, too-hard/too-easy | ~250-person subsidiary | throughout, esp. late |
| Public play tests | 3D camera/control confusion | external players | Galaxy-era, many rounds |

**Q1** First-use path most: 1-1 "still adjusting right up until the last minute" (https://iwataasks.nintendo.com/interviews/wii/nsmb/1/4/). **Q2** Designers (intent), Mario Club (debug + difficulty, https://www.nintendo.co.jp/ir/en/stock/meeting/150626qa/02.html), novice and expert "litmus tests" (https://iwataasks.nintendo.com/interviews/wiiu/nsmbu/0/2), public testers. **Q3** Not addressed publicly. **Q4** Shielded room with many 3DS units for wireless play (IR Q&A above). **Q5** Mario Club "breaks" levels, e.g. Mini Mario falling between mushrooms (https://iwataasks.nintendo.com/interviews/wii/mario25th/3/3). **Q6** Bugs drive delays "nine times out of ten" — Sakurai (https://sourcegaming.info/2015/07/16/finatesting-vol-459). **Q7–Q9** Not addressed. **Q10** Build the first level LAST, after the team knows the game (https://www.youtube.com/watch?v=zRGRJRUWafY).

**Practices.**
1. *Never explain; watch silently*: Miyamoto's monitor-test rule; players usually don't play as he intended, so he often has to cover his eyes (Japanese transcript, https://www.youtube.com/watch?v=zRGRJRUWafY). Grade C. Driver: the player sees only what's on screen.
2. *Safe-failure teaching*: Koopa first enemy replaced by the invented Goomba because stomp-and-kick was too hard for first-timers (https://www.ign.com/articles/miyamoto-explains-how-super-mario-bros-world-1-1-was-created). Grade C. Driver: one-shot learnable lesson.
3. *Dedicated test org*: Mario Club spun off as ~250 people (https://www.gamedeveloper.com/game-platforms/nintendo-establishes-mario-club-testing-company). Grade C.

**Failures.** Critical bugs Mario Club missed were found by the director in Xenoblade (https://iwataasks.nintendo.com/interviews/wii/xenoblade/2/3). "A delayed game is eventually good…" is misattributed to Miyamoto (https://www.acriticalhit.com/solved-miyamoto-quote-late-game-bad-forever/).

**Quotes.** Once players understand what to do, "it becomes their game" (https://www.gamedeveloper.com/design/how-miyamoto-built-i-super-mario-bros-i-legendary-world-1-1). "We kept simulating what the player would do" (IGN above).

---

## 3. Microsoft Game Studios User Research — RITE, Halo 3 lab, Bungie heatmaps
**Header.** MGS UR, ~1999–2012; Randy Pagulayan, Michael Medlock, Dennis Wixon, John Hopson; Bungie (Halo). In as the most instrumented, measured games UR practice.

| Layer | Catches | Who/what | When |
|---|---|---|---|
| RITE usability test | tutorial/UI blockers | UR engineer + decision-makers present | prototype, fixes between participants |
| Lab sessions (one-way mirror, think-aloud, pop-up ratings) | boredom, frustration, lost players | ~20 players every other week | from first build |
| Telemetry + heatmaps/position snapshots | deaths, lost paths, weapon balance | instrumented build | every session |
| Public heatmaps on Bungie.net | live map balance | players + Bungie | post-launch "beta" feature |

**Q1** Must-do tasks agreed in advance with "zero error tolerance" (https://jpattonassociates.com/wp-content/uploads/2015/04/rite_method.pdf). **Q2** Everyday players catch what designers who "know what players should do" can't (https://www.wired.com/2007/08/ff-halo-2). **Q3** RITE four categories: obvious+quick fix → fix now; obvious+slow → start fix; unclear cause / test artifact → collect more data (RITE pdf). **Q4** Lab simulates a living room (Wired). **Q5** Not addressed. **Q6** Verify fixes on subsequent participants; 6 clean extra participants ≈88% confidence at p=0.30 (RITE pdf). **Q7** Heatmaps rolled out as "beta" with an off-switch if load hurt the service (https://halo.bungie.org/bwu/index.html?item=153). **Q8** Halo 2: 80% of campaign work thrown out; lab couldn't catch everything under time pressure (Wired). **Q9** Data reported "in terms that made sense to the designers, such as the location" (https://interactions.acm.org/archive/view/january-february-2008/thats-entertainmnthalo-31). **Q10** Competitor games tested in the same lab (Wired).

**Practices.**
1. *RITE*: Age of Empires II tutorial, 16 participants, 6 iterations; 31 problems found, 30 fixed (impact ratio 97%), re-fix ratio 20%; AoE II sold ~2× AoE I (RITE pdf). Grade B. Driver: decision-makers in the room → findings "believed" and fixed same day.
2. *Instrumented playtest*: 3,000+ h, ~600 players on Halo 3; Wraith-turret suicides fixed by limiting turret angle; red reticle for range (Wired). Grade B.
3. *Developers watch live*: "All of my research is nothing compared to having the developer being there" — Hopson (https://www.gamespot.com/articles/gdc-2009-quality-testing-halo-3/1100-6206812). Grade C.

**Failures.** RITE risks: changes on unclear issues, too many changes at once, missing rare issues (RITE pdf).

**Quotes.** "It is more important to get the team to fix problems… than to agonize over if every problem has been uncovered" (RITE pdf). "That's not acceptable" — Pagulayan on missed grenades (Wired).

---

## 4. Supercell — staged kill gates, soft launch, champagne post-mortems
**Header.** Supercell, 2010–present; Ilkka Paananen. In as the purest "real exposure decides; kill early" model.

| Layer | Catches | Who/what | When |
|---|---|---|---|
| Weekly Friday demo to company | weak concept | game lead | from 1-week prototype |
| Company playable | not fun to colleagues | all employees | months in |
| Closed beta / soft launch (often Canada) | retention, monetization | real players, metrics | pre-global |
| Global live ops | sentiment, churn | live team | post-launch |

**Q1** Retention above all; "we kill good games" (https://supercell.com/en/news/10-learnings-10-years/7436/). **Q2** Team, then colleagues, then players (https://www.wired.com/story/supercell-clash-of-clans-hay-day/). **Q3** Team decides kill pre-launch; at test market "power shifts… to the players" (https://gamesbeat.com/supercells-ilkka-paananen-wants-every-game-to-be-as-good-as-clash-of-clans-interview-part-one/). **Q4** Canadian soft launch for lower profile (Wired); Brawl Stars stayed >1 year (https://blakeir.com/supercells-killed-games-celebrating-lessons-not-failures). **Q5** Not addressed. **Q6** Metric thresholds + team gut; Smash Land "didn't have the pull… for years" (Wired). **Q7** Sentiment as leading signal for live games (https://supercell.com/en/news/the-best-games-havent-been-made-yet). **Q8** Killed team presents on stage what went right/wrong; champagne (https://schoolofherring.com/2015/07/19/ilkka-paananen-of-supercell-celebrate-learnings-from-failures). **Q9** Written public learnings (Squad Busters post). **Q10** Failure made "survivable, or even honored" to keep risk-taking (https://supercell.com/en/news/learning-from-failures/).

**Practices.**
1. *Multi-gate kill funnel* with team-owned kill rights (Wired). Grade B (two evergreen hits, many kills; survivorship caveat).
2. *Champagne post-mortem* (sources above). Grade C. Driver: psychological safety → honest reporting.
3. *Beta metrics gates*: Squad Busters beta 1 (5k players) D7 29% → 3-month rework → beta 2 (140k) D1 61/D3 44/D7 38% (Squad post). Grade B.

**Failures.** Squad Busters, killed after global launch: "Even large beta samples don't predict global behavior… 100,000+ players"; betas validated only D7, soft launch one month (Squad post).

**Quotes.** "If there is no failures, you're not taking enough risks" (schoolofherring). "We were blind to that" — Eino Joas (Squad post).

---

## 5. Blizzard — closed/open betas, stress-test weekends, Error 37
**Header.** Blizzard, 2004–present; Josh Mosqueira, Mike Morhaime. In for public stress tests, plus a launch failure despite them.

| Layer | Catches | Who/what | When |
|---|---|---|---|
| Closed beta | gameplay, balance | invited players, beta forums | months pre-launch |
| Open/invite stress-test weekend | server capacity, login flow | anyone with account | weeks pre-launch |
| Launch "war room" | live outages | engineers, live ops | launch |
| Long patch tail / expansion | design faults | dev team + forum feedback | years |

**Q1** Stress tests target "technical feedback" (https://overwatch.blizzard.com/en-us/news/19964704/). **Q2** Closed testers vs. stress participants (no forum posting) (https://us.diablo3.blizzard.com/en-us/blog/4963739). **Q3** Not addressed. **Q4** D3 3-day open beta "to simulate launch conditions" (https://www.forbes.com/sites/insertcoin/2012/04/23/blizzards-diablo-3-stress-test-lives-up-to-its-name); still used 2026 (https://news.blizzard.com/en-us/article/24302072/join-the-world-of-warcraft-forever-stress-test). **Q5** Stress tests warn of "restarts and downtime… without warning" (Overwatch post). **Q6** Projections doubled, then tripled — "still super conservative" (https://kotaku.com/how-blizzard-saved-diablo-iii-from-disaster-1797427650). **Q7** In-game breaking news + forums; login rate throttling (https://us.diablo3.blizzard.com/en-us/blog/5338015). **Q8** GDC 2015 retrospective (https://za.ign.com/diablo-iii-ultimate-evil-edition/89061/gdc-2015-blizzard-gives-interesting-retrospective-talk-about-diablo-3s-disastrous-launch). **Q9** Queueing system (https://me.ign.com/en/diablo-iii/57894/blizzard-kills-error-37-in-diablo-iii); descriptive error messages with ETA (Kotaku). **Q10** "Every Voice Matters": forum/Reddit feedback → Loot 2.0, auction house killed (Kotaku).

**Practices.**
1. *Public stress weekend* before launch (sources above). Grade C (did not prevent D3 outage).
2. *Fix forward for years*: ~18 patches in 3.5 months; Reaper of Souls launched with no Error 37 (Kotaku). Grade B.
3. *Actionable error messages* as a post-mortem item (Kotaku). Grade C.

**Failures.** Error 37 showed up in the April beta but launch still failed (https://www.theguardian.com/technology/gamesblog/2012/may/15/diablo-3-gamers-angry-servers-collapse); beta peak reportedly ~300k concurrent, well below launch (https://www.codehistory.org/games-online-services-live-launch-failures/_diablo-iii-and-error-37-when-always-online-authentication-met-launch-demand/, grade C).

**Quotes.** "You can build a game, you can test a game, and you can think you know the game—until you release it" — Mosqueira (Kotaku).

---

## 6. NEGATIVE — Cyberpunk 2077 launch (Dec 2020)
**Header.** CD Projekt Red; Adam Kiciński, Marcin Iwiński. In as a release decided by a date instead of by the evidence, on the weakest platform.

| Layer | Catches | Who/what | When |
|---|---|---|---|
| External test centers | platform bugs | outsourced QA | reduced (COVID) |
| Platform certification | crashes vs. rules | Sony/MS | pre-launch (passed) |
| Press review | quality signal | reviewers | PC only; console code 1 day before |
| Store refunds / delisting | consumer harm | Sony | 8 days post-launch |

**Q1** Last-gen consoles under-tested: "ignored the signals" (https://www.cdprojekt.com/en/wp-content/uploads-en/2020/12/call-transcript_en.pdf). **Q2** External testers couldn't work from home (https://arstechnica.com/gaming/2020/12/cdpr-admits-it-ignored-the-signals-of-cyberpunk-2077s-console-issues). **Q3** Not addressed. **Q4** Marketing showed mostly PC (transcript); reviewers got PC only under NDA (https://www.theguardian.com/games/2020/dec/18/cyberpunk-2077-how-2020s-biggest-video-game-launch-turned-into-a-shambles). **Q5** Not addressed. **Q6** Board "too focused on releasing the game" after 3 delays (transcript). **Q7** Player reviews; Sony delisted and refunded (https://www.cdprojekt.com/en/investors/regulatory-announcements/current-report-no-66-2020). **Q8** Public apology + refunds (https://www.polygon.com/2020/12/14/22173762/cyberpunk-2077-cd-projekt-red-apology-base-ps4-xbox-one-bugs-issues-glitches/); CEO video owning failure, root cause in-game streaming system (https://arstechnica.com/gaming/2021/01/cdpr-ceo-blames-in-game-streaming-for-cyberpunks-console-problems/). **Q9–Q10** Not addressed in sources.

**Practices (inverse).** 1. Gate per platform on the weakest target, not the flagship. Grade B (delisting, refunds). 2. Show buyers the version they'll get (apology text). Grade B.

**Failures.** Crunch reported in Sept 2020 (https://www.vulture.com/2020/12/cyberpunk-2077-launch-controversy-refund.html).

**Quotes.** "We underestimated the scale and complexity of the issues, we ignored the signals…" — Kiciński (transcript). "It was the wrong approach and against our business philosophy" (same).

---

## 7. NEGATIVE — No Man's Sky launch (Aug 2016)
**Header.** Hello Games; Sean Murray. In as a failure of claims vs. shipped product, then a model recovery through updates.

| Layer | Catches | Who/what | When |
|---|---|---|---|
| Pre-launch claims (interviews, trailers) | — (source of the gap) | Murray | years pre-launch |
| Player discovery at launch | missing promised features | players | day 1 |
| Regulator | misleading ads | UK ASA | Sept–Nov 2016 |
| Silent patch-and-update loop | gaps, retention | team + stats | 2016–2018+ |

**Q1** Promised multiplayer sighting absent on day 1 (https://kotaku.com/the-no-mans-sky-hype-dilemma-1785416931). **Q2** Not addressed. **Q3** Not addressed. **Q4** None that checked claims against product (*Judgment*). **Q5** Not addressed. **Q6** Not addressed. **Q7** Feedback read "in a pure stats way" (https://www.eurogamer.net/the-big-sean-murray-interview). **Q8** ASA got 23 complaints about ~10 features; cleared Nov 2016 (https://www.polygon.com/2016/11/30/13791782/no-mans-sky-false-advertising-results/). **Q9** Communicate through updates: "you've got to release something" (https://www.gamerevolution.com/news/564467-no-mans-sky-media-silence-sean-murray). **Q10** Free updates; NEXT drew launch-level numbers (https://www.gamesindustry.biz/sean-murray-on-no-mans-sky-i-thought-we-were-making-a-niche-game).

**Practices (inverse/recovery).** 1. Say what may get dropped (https://www.polygon.com/2016/9/16/12929618/no-mans-sky-disaster-lies-lessons-learned/). Grade C. 2. Answer with shipped fixes, not words (GameRevolution). Grade B.

**Failures.** Media silence after launch fed the backlash (https://www.pcgamer.com/the-makers-of-no-mans-sky-need-to-start-talking-again/); harassment reached police involvement (https://www.theguardian.com/games/2018/jul/20/no-mans-sky-next-hello-games-sean-murray-harassment-interview).

**Quotes.** "We definitely messed up a whole bunch of communication" — Murray (Guardian above).

---

## Cluster patterns
- **Candidate invariant — watch real first-timers silently, early and repeatedly** (Valve, Nintendo, MS UR; Supercell company playable; absent in both negatives). The designer never explains; confusion is the finding.
- **Candidate invariant — first-use path gets the most testing and last-minute tuning** (1-1 built last and tuned to the end; AoE II tutorial RITE; Halo 3 Jungle level).
- **Candidate invariant — decision-makers present at the test, fixes verified on the next participant** (RITE 97% impact ratio; Valve cabal behind player; Hopson "developer being there").
- **Candidate invariant — staged real exposure with explicit gates** (Supercell prototype → company playable → beta → soft launch; Blizzard closed → stress → launch). Ship/kill set by evidence, not date. Cyberpunk is the counterexample: the date won.
- **Candidate invariant — gate on the weakest target / representative load** (Cyberpunk last-gen; D3 stress peak far below launch; Squad Busters 100k beta ≠ global). Rehearsal that misses the hard case gives false confidence.
- **Candidate invariant — blameless, public post-mortem with concrete fixes** (Supercell stage + champagne + blog; Blizzard GDC + queue + clear errors; CDPR apology + root cause).
- **Recurring practice — instrument play and show it spatially** (Halo heatmaps/position dots; Valve HP-over-time graphs).
- **Recurring practice — the first answer after a failed launch is a shipped fix, then words** (NMS updates, D3 patches/Reaper).
- **Recurring practice — be honest about what players will get** (CDPR apology, NMS "say what may get dropped").
- *Judgment*: for a tiny team, RITE plus a silent 3-5 first-timer test maps most directly. Telemetry-scale methods (heatmaps, soft-launch retention) need volumes FYTT lacks. The Squad Busters lesson says even large samples mislead, so qualitative observation carries more weight.
