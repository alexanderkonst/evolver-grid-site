# The Game of Being You — launch spec (Module 1)

v1, 2026-11-21. Source of the rows: Sasha's notebook (2026-11-20, ledger B1/B2). Canon: [golden_age_canon.md](./golden_age_canon.md) face 1 · Blueprint: [game_of_being_you.md](./game_of_being_you.md) (GoBY).
Key documents and this moon: [golden_age_canon.md §0](./golden_age_canon.md) (the set to keep in view) and its §5 (this moon's tasks).

**Who writes where** (2026-11-22). One place per fact; in another project's place, only through its owner.

| Place | Writer |
|---|---|
| [golden_age_canon.md](./golden_age_canon.md): key documents, harvest of insights (§3), this moon (§5) | main chat |
| this spec: rows | text only on Sasha's yes; the project that builds a row updates its Status |
| [GoBY §24](./game_of_being_you.md): mechanics list | project «Модуль 1.1: Синтез механик знаковых игр» |
| [biologic_clock_rings_spec.md](../specs/equilibrium/biologic_clock_rings_spec.md) | project «Биологические часы Equilibrium» |
| Circles (our own Luma), spec when written | project «Круги в GoBY» |
| [modular_collaboration/](./modular_collaboration/): Module 2 launch plan, partner offer, connector, research | project «Модуль 2: модульная коллаборация» |
| [source-integration.md](../templates/source-integration.md) (v2.0) and the knowledge intake stream | project «Интейк знаний в проект» |
| [collective_terms_roadmap.md](./collective/collective_terms_roadmap.md), [funnel_map_v1.md](./unique-businesses/funnel_map_v1.md), [ai-suite/](./ai-suite/) (Your AI suite spec, AI course outline, Result Wizards spec, wizards/) | project «Модуль 3: коллектив фаундеров» |
| Formalization of the universal ontology (theory layer, private repo knowledgegraph) | project «Модуль 1: Формализация Теории Всего» |

**Write rule for every project.** Read the file fresh from the GitHub API right before editing (never raw.githubusercontent.com: it served a stale copy and a row was lost on 2026-11-21). Commit on the current head. After the commit, compare it with the parent and check that only your lines changed.

Mechanics Sasha accepted live in one list: [GoBY §24](./game_of_being_you.md) (24.1 accepted, 24.2 considering, 24.3 open, 24.4 later, 24.5 rejected). A mechanic becomes a row here only on his yes to the exact text, and the row names its §24 number. Research behind them: [research/iconic-mechanics/](./research/iconic-mechanics/).
Launch: early January 2027, after 2027-01-04. No phase dates: we go down the list; Sasha sets the order.
Status: **live** = on the site · **partial** = exists, gap named · **none** = not built. **Yes** = needs Sasha's yes to the exact change (core flows, money, public).

## A. The game

| # | Feature | Done when | Status | Yes |
|---|---|---|---|---|
| A1 | Title screen (NEW GAME) | exists | live `/` | — |
| A2 | Promo video = opening screen (B2-15, B2-18①) | a short film plays before the title; skip button; then onboarding into the village | none (no video yet) | Yes |
| A3 | Onboarding into the digital village (B2-18②) | after the film/title a new player lands in the village with one obvious first step | partial: guest path + Home, issue #354 (main chat) | Yes |
| A4 | Hook after reveal: «Your next potential is… Your first micro-quest to claim that version of yourself is this:» | every reveal ends with one named potential and one doable micro-quest | merged 2026-11-22 (#399), on findyourtoptalent.com after Lovable publish: next potential + micro-quest block after the reveal card, «Accept the quest» puts it on the Quest Board; reveals made before have no block | Yes |
| A5 | Stats cards on Your House, owner-only, shown only when they have a value (Sasha 2026-11-21): QoL; U = resonance of the current uniqueness statement (1–10); $ = income the unique business brought, if the player has the number. U.O. parked | the cards a player has values for appear; nothing empty | live 2026-11-21 (#364): owner-only QoL, U, $ cards on Your House, only with a value | — |
| A6 | Social network: see a profile, filter for useful people, write to them | from a profile a player can send a message; the person gets it | live 2026-11-21 (#363): Write from a profile and the directory, inbox at `/game/messages`; table player_messages deployed on Sasha's yes. People Directory unlocked 2026-11-22 (#397) | — |
| A7 | Artifacts / products / clients | player sees what they made, sell and who bought | live 2026-11-21 (#366): `/my-artifacts`, `/game/marketplace/my-products` with Clients list from sales_events | — |
| A8 | Radio for each space | each village place has its own stream | none | — |
| A9 | Equilibrium clock (lunar creative hours for creative cycles) | clock visible in the game | live 2026-11-21 (#378): four-ring biologic clock (Year · Moon · Week · Day, tonight's moon in the centre) on the village map in place of the moon dial and in the character profile header (`/game/me/overview`); full watch at `/build/equilibrium`. 2026-11-22: two primary rings Moon + Week, symbol + meaning (#382); three views dial / text / Year+Day, village top-right (#387); v6 mockup in spec. [spec](../specs/equilibrium/biologic_clock_rings_spec.md) | — |
| A10 | 4 glyphs drawn properly (Sasha confirmed meaning 2026-11-21): helix = QoL (gold lived up to the level, blue still unwinding); Grail cup = U (the field passes through one point and turns out into the world); crystal in ring = UB, unique business (was U.O.); Grail loop = $ (the flow closes and returns as a coin) | four clean vector glyphs, used on the stats cards | draft v2 traced from the notebook (2026-11-21): [docs/assets/glyphs/](../assets/glyphs/) SVG, gold + blue; v1 free version in v1-free/; awaits Sasha's look | — |
| A11 | Real world: San Pancho = Village #1, spaces where people already play (NS, SP…), invite everyone to collaborate | a real community can enter the game as its village | spec: GoBY §16, community_whitelabel_spec | Yes (public) |
| A12 | Badges (Sasha 2026-11-21: important, this sprint, by January) | every step's outro awards its badge; shelf in Your House shows earned and faint not-yet badges (GoBY §14.12) | partial: logic live (outro badge + House shelf, `houseRooms.ts`). Art v1 rejected by Sasha 2026-11-21 (docs/assets/badges/v1-rejected). Direction (Sasha 2026-11-21): a badge = one of Sasha's own digital designs, gifted for an achievement and kept in the House, turned into beautiful 3D objects (Sasha 2026-11-21); NFT form open (proposal: off-chain first, claimable on-chain later). Awaits Sasha's design set | — |
| A13 | Forgiving streak (Sasha 2026-11-21: «стрик используем только где это зеркалит действия в реальном мире, не просто как бездумную фишку»). Source: Duolingo analysis (iconic-mechanics branch, DL-1); canon GoBY §10 point 3 | one real act a day extends the streak: today's 5-minute practice, a Journey step or the reveal's micro-quest, named by the player ("Day 12: wrote to a client"); never app opens; not tied to the QoL goal or amount; up to 2 freezes held, earned by real acts, never sold; owner-only card on Your House next to A5; no shaming reminders | ready: PR #373 green (Vercel success 2026-11-22); merge waits for Sasha's «Да: деплой миграции streak_acts» (one Lovable Build prompt) | — |
| A14 | Constructor of buildings, interiors and villages (GoBY §24 #4, #6, #15, #19) | build and edit from presets first, AI generation second; each new constructor step opens only after a real deed confirmed by someone who already walked that step; credits buy generations, never artifacts, badges or rights; the word «level» is not used | none | — |
| A15 | Rhythm (GoBY §24 #7) | day = one real act (A13); week = Monday step, then Sunday Save Point; month = real moon, closed by Harvest; year = New Year or the player's birthday; shown on the four-ring clock (A9); no 6-week seasons | partial: clock live (A9), streak in work (A13) | — |
| A16 | Feed of real deeds on the Quest Board (GoBY §24 #23) | Quest Board shows open quests on top and "What happened" below: one chronological, finite list of real events, ending with "You're up to date"; no ranking, no filler. Events: the §13.4 victories as they happen (a new resident entered the village; a new self-understanding such as top talent, mission, uniqueness phrase, shown as the fact only, e.g. "Ana found her top talent", its content only if the player made it public on their profile; a new unique business: tagline, stall opened; first price named; first sale), a quest closed (confirmed by the one who posted it), a circle happened (host confirmed who came, faces not numbers; Care of a place with its "after" photo). One tap "I see you" + optional written line; the doer sees who tapped; no public counts. Not in Your House | merged 2026-11-22 (#400), migration applied; on the site after Lovable publish | — |

Design compass (not tasks): actions in the game world are done in the real one; repeats social dynamics that already work; unites the evolutionary avant-garde. Refs: Ready Player One, Heroes III, Monopoly (collaboration), Foundation (Asimov).

## B. Lead magnets = free parts of the game

| # | Feature | Done when | Status | Yes |
|---|---|---|---|---|
| B1 | First game levels free | a guest plays the first levels with no payment | partial (guest path, #354) | — |
| B2 | Hero's journey questionnaire | test → result page → into the game | live 2026-11-21 (#372): `/quiz` fresh and saved reads (`/quiz/r/:id`) carry a quiet «Continue in the game» link to `/village` (issue #362) | — |
| B3 | Infographic sets per person and situation | a player gets a set picked for them | partial: [BOOK.md](../assets/infographics/BOOK.md) | — |
| B4 | Before & after and other psychoactive images | a set shown in the game/lead flow | none | — |

## C. Learning game (Academy)

| # | Feature | Done when | Status | Yes |
|---|---|---|---|---|
| C1 | 3D model of the elements | the five elements as a playable 3D model | live 2026-11-21 (#367): /game/learn/elements; drag rotation fixed for the fallback view and touch, merged 2026-11-22 (#398) | — |
| C2 | Course constructor ← infographics | a course assembled from infographics | none | — |
| C3 | Holonic-intuitive learning sequence | courses ordered by it | none | — |
| C4 | Book of Infographics | readable book in the Academy | live 2026-11-21 (#365): reader at `/game/learn/book`, card on `/game/learn` | — |
| C5 | New courses: my sessions' rotation = Platonic solids | course outline on that frame | none | — |
| C6 | Landings for courses | one landing per course | partial `/academy/:slug` | Yes (public) |
| C7 | Make your (Village) buttons for world-building | player adds places to their village | none | — |

## Progress

- 2026-11-21: live A5 stats cards (#364), A6 messages (#363, table player_messages deployed on Sasha's yes; open to everyone by default, profile visibility setting closes it), A7 clients (#366), A9 four-ring clock (#378), B2 quiz → game link (#372), C1 3D elements (#367), C4 Book of Infographics (#365). A12 badge logic live, art v1 rejected. A10 glyphs v2 drafted.
- 2026-11-22: merged A4 hook after reveal (#399), A16 feed of real deeds (#400, migration applied), A6 People Directory (#397), playtest fixes (#398), clock Moon + Week and three views (#382, #387), Circles v1 with Care of a place (#388, live), place icons painted set per skin (live). Your AI place re-scoped to a plain hand-over, no test (#402, in work). Loading screen matte + waxing moon (#401, in work). A13 streak PR #373 green, held for «Да: деплой миграции streak_acts». Waiting on Sasha: A10 glyph look, A12 badge designs, A2 video, reveal words.

## Working rule
Take the next row Sasha names (or the top open row without "Yes"), build it through an @claude issue, test, mark live here.
