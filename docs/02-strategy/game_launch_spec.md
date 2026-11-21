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
| A5 | Stats cards on Your House: QoL, U, U.O., $ ("people love stats") | four cards with a number and its change; QoL e.g. 6.3/10 (+0.1 in Q2) | partial: QoL level exists; U, U.O., $ not built | — |
| A6 | Social network: see a profile, filter for useful people, write to them | from a profile a player can send a message; the person gets it | built in issue #356 (PR open): Write on profile + directory card, inbox `/game/collaborate/messages`, unread badge in Party & Guild; **migration `20261121190000_player_messages.sql` not deployed, held for Sasha's yes** | — |
| A7 | Artifacts / products / clients | player sees what they made, sell and who bought | partial `/my-artifacts`, `/game/marketplace/my-products`; clients none | — |
| A8 | Radio for each space | each village place has its own stream | none | — |
| A9 | Equilibrium clock (lunar creative hours for creative cycles) | clock visible in the game | partial: `/equilibrium` page | — |
| A10 | 4 glyphs drawn properly: helix 6.3, Y, polyhedron in circle, U-loop | four clean vector glyphs, used on the stats cards | none | — |
| A11 | Real world: San Pancho = Village #1, spaces where people already play (NS, SP…), invite everyone to collaborate | a real community can enter the game as its village | spec: GoBY §16, community_whitelabel_spec | Yes (public) |

Design compass (not tasks): actions in the game world are done in the real one; repeats social dynamics that already work; unites the evolutionary avant-garde. Refs: Ready Player One, Heroes III, Monopoly (collaboration), Foundation (Asimov).

## B. Lead magnets = free parts of the game

| # | Feature | Done when | Status | Yes |
|---|---|---|---|---|
| B1 | First game levels free | a guest plays the first levels with no payment | partial (guest path, #354) | — |
| B2 | Hero's journey questionnaire | test → result page → into the game | partial `/quiz`, `HeroQuiz` | — |
| B3 | Infographic sets per person and situation | a player gets a set picked for them | partial: [BOOK.md](../assets/infographics/BOOK.md) | — |
| B4 | Before & after and other psychoactive images | a set shown in the game/lead flow | none | — |

## C. Learning game (Academy)

| # | Feature | Done when | Status | Yes |
|---|---|---|---|---|
| C1 | 3D model of the elements | the five elements as a playable 3D model | partial (GoBY §2) | — |
| C2 | Course constructor ← infographics | a course assembled from infographics | none | — |
| C3 | Holonic-intuitive learning sequence | courses ordered by it | none | — |
| C4 | Book of Infographics | readable book in the Academy | partial (BOOK.md) | — |
| C5 | New courses: my sessions' rotation = Platonic solids | course outline on that frame | none | — |
| C6 | Landings for courses | one landing per course | partial `/academy/:slug` | Yes (public) |
| C7 | Make your (Village) buttons for world-building | player adds places to their village | none | — |

## Working rule
Take the next row Sasha names (or the top open row without "Yes"), build it through an @claude issue, test, mark live here.
