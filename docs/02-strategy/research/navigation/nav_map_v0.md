# Game navigation: what exists (snapshot 2026-11-24, main @ tarball, read by Hark)

Sources: GoBY §4 (title), §13.1 (village), §14.1–14.6 (one world one map one menu, Journey J0–13, lock rule, module form, village as main screen), issue #443 (shell glitches), #322, holon-core H0.G player path, player-path-v1-draft.md (d444739, DRAFT, hypothesis only).

## Layers
1. Title screen `src/pages/GameTitle.tsx`: New Game → /village/reception (Entry Portal, cinematic intro first time), Load Game, Multiplayer → /build/mastermind, About → Investor Room. Tutorial removed 2026-11-02.
2. Village `/village` (`src/pages/Village.tsx`): 11 places from `src/data/villagePlaces.ts` (reception "Entry Portal", house "Home", quest-board, oracle "Your AI", cafe, coworking, fire-circle "Mastermind", academy, workshop, market, town-hall). States from placeState (open/closed/new/live). One "Your next move" card + "what changed" line.
3. Rail `SpacesRail.tsx` + `src/lib/railPlaces.ts`: RAIL_PLACES = VILLAGE_PLACES (map folded).
4. Shell `GameShellV2.tsx` + `shellRoutes.ts`: rail + pane 2 (`SectionsPanel.tsx`, old space ids journey/grow/ai-os/meet/collaborate/build/learn/buysell, bridged by PANE_BY_PLACE) + content. Some routes outside the shell (/holomap).
5. Inside modules: Intro → one button → Outro → back to village (§14.4), partly built.

## Known breaks (#443 A)
Rail buttons grey out after load; Town Hall never navigates; pane 2 shows wrong place (/build/equilibrium, /build/cockpit → Workshop; /my-artifacts, /settings → Quest Board); /holomap no shell; "← Village" missing on /game/learn, /game/meet, /game/marketplace, /game/collaborate/people.

## Gaps vs the model
- Navigation is wired to Journey J0–13; player path v1 draft proposes Player One (§23.1) as spine, Gift Path as progress scale, Journey as hidden implementation map. Not decided.
- Pane 2 is the old structure (spaces), not places/rooms.
- "Where am I on the path" exists only as one hint card; no path view.
- Your AI is now a separate company/interface (2026-11-24), yet it is a village place (Oracle → /game/your-ai).

## Open questions sent to Sasha 2026-11-24
Q1 where-am-I: place vs path step. Q2 pane 2 fate. Q3 Your AI: place or global button.
