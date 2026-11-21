# The Game of Being You — launch spec (Module 1)

v1, 2026-11-21. Source of the rows: Sasha's notebook (2026-11-20, ledger B1/B2). Canon: [golden_age_canon.md](./golden_age_canon.md) face 1 · Blueprint: [game_of_being_you.md](./game_of_being_you.md) (GoBY).
Launch: early January 2027, after 2027-01-04. No phase dates: we go down the list; Sasha sets the order.
Status: **live** = on the site · **partial** = exists, gap named · **none** = not built. **Yes** = needs Sasha's yes to the exact change (core flows, money, public).

## A. The game

| # | Feature | Done when | Status | Yes |
|---|---|---|---|---|
| A1 | Title screen (NEW GAME) | exists | live `/` | — |
| A2 | Promo video = opening screen (B2-15, B2-18①) | a short film plays before the title; skip button; then onboarding into the village | none (no video yet) | Yes |
| A3 | Onboarding into the digital village (B2-18②) | after the film/title a new player lands in the village with one obvious first step | partial: guest path + Home, issue #354 (main chat) | Yes |
| A4 | Hook after reveal: «Your next potential is… Your first micro-quest to claim that version of yourself is this:» | every reveal ends with one named potential and one doable micro-quest | none | Yes |
| A5 | Stats cards on Your House, owner-only, shown only when they have a value (Sasha 2026-11-21): QoL; U = resonance of the current uniqueness statement (1–10); $ = income the unique business brought, if the player has the number. U.O. parked | the cards a player has values for appear; nothing empty | live 2026-11-21 (#364): owner-only QoL, U, $ cards on Your House, only with a value | — |
| A6 | Social network: see a profile, filter for useful people, write to them | from a profile a player can send a message; the person gets it | live 2026-11-21 (#363): Write from a profile and the directory, inbox at `/game/messages`; table player_messages deployed on Sasha's yes | — |
| A7 | Artifacts / products / clients | player sees what they made, sell and who bought | live 2026-11-21 (#366): `/my-artifacts`, `/game/marketplace/my-products` with Clients list from sales_events | — |
| A8 | Radio for each space | each village place has its own stream | built (San Pancho stream): issue #371. Radio San Pancho on the village and game screens, Play/Pause + volume + credit link, off by default, state in localStorage; station config per village in `src/data/radioStations.ts` | — |
| A9 | Equilibrium clock (lunar creative hours for creative cycles) | clock visible in the game | live: moon dial in the Village, full watch at `/build/equilibrium` (in game shell) | — |
| A10 | 4 glyphs drawn properly (Sasha confirmed meaning 2026-11-21): helix = QoL (gold lived up to the level, blue still unwinding); Grail cup = U (the field passes through one point and turns out into the world); crystal in ring = UB, unique business (was U.O.); Grail loop = $ (the flow closes and returns as a coin) | four clean vector glyphs, used on the stats cards | draft v2 traced from the notebook (2026-11-21): [docs/assets/glyphs/](../assets/glyphs/) SVG, gold + blue; v1 free version in v1-free/; awaits Sasha's look | — |
| A11 | Real world: San Pancho = Village #1, spaces where people already play (NS, SP…), invite everyone to collaborate | a real community can enter the game as its village | spec: GoBY §16, community_whitelabel_spec | Yes (public) |
| A12 | Badges (Sasha 2026-11-21: important, this sprint, by January) | every step's outro awards its badge; shelf in Your House shows earned and faint not-yet badges (GoBY §14.12) | partial: logic live (outro badge + House shelf, `houseRooms.ts`). Art v1 rejected by Sasha 2026-11-21 (docs/assets/badges/v1-rejected). Direction (Sasha 2026-11-21): a badge = one of Sasha's own digital designs, gifted for an achievement and kept in the House, turned into beautiful 3D objects (Sasha 2026-11-21); NFT form open (proposal: off-chain first, claimable on-chain later). Awaits Sasha's design set | — |
| A13 | Forgiving streak (Sasha 2026-11-21: «стрик используем только где это зеркалит действия в реальном мире, не просто как бездумную фишку»). Source: Duolingo analysis (cult-mechanics branch, DL-1); canon GoBY §10 point 3 | one real act a day extends the streak: today's 5-minute practice, a Journey step or the reveal's micro-quest, named by the player ("Day 12: wrote to a client"); never app opens; not tied to the QoL goal or amount; up to 2 freezes held, earned by real acts, never sold; owner-only card on Your House next to A5; no shaming reminders | in work: issue #368 (migration file only; deploy waits for Sasha's yes) | — |

Design compass (not tasks): actions in the game world are done in the real one; repeats social dynamics that already work; unites the evolutionary avant-garde. Refs: Ready Player One, Heroes III, Monopoly (collaboration), Foundation (Asimov).

## B. Lead magnets = free parts of the game

| # | Feature | Done when | Status | Yes |
|---|---|---|---|---|
| B1 | First game levels free | a guest plays the first levels with no payment | partial (guest path, #354) | — |
| B2 | Hero's journey questionnaire | test → result page → into the game | partial `/quiz`, `HeroQuiz`; door into the game in work: issue #362 | — |
| B3 | Infographic sets per person and situation | a player gets a set picked for them | partial: [BOOK.md](../assets/infographics/BOOK.md) | — |
| B4 | Before & after and other psychoactive images | a set shown in the game/lead flow | none | — |

## C. Learning game (Academy)

| # | Feature | Done when | Status | Yes |
|---|---|---|---|---|
| C1 | 3D model of the elements | the five elements as a playable 3D model | partial (GoBY §2); in work: `/game/learn/elements`, issue #361 | — |
| C2 | Course constructor ← infographics | a course assembled from infographics | none | — |
| C3 | Holonic-intuitive learning sequence | courses ordered by it | none | — |
| C4 | Book of Infographics | readable book in the Academy | live 2026-11-21 (#365): reader at `/game/learn/book`, card on `/game/learn` | — |
| C5 | New courses: my sessions' rotation = Platonic solids | course outline on that frame | none | — |
| C6 | Landings for courses | one landing per course | partial `/academy/:slug` | Yes (public) |
| C7 | Make your (Village) buttons for world-building | player adds places to their village | none | — |

## Working rule
Take the next row Sasha names (or the top open row without "Yes"), build it through an @claude issue, test, mark live here.
