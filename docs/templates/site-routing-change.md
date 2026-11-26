# Site routing change: rename, move or add a place, a room or a route

> Button (= the result): **A place renamed or moved in one pass, nothing left pointing at the old one.** Source: Sasha, 2026-11-25 18:38 MST («сделай шаблон по изменению раутинга сайта для ИИ агентов которые будут брать эту задачу в будущем (и добавь в наш раутер)»), first applied to Workshop → Collective (#512). Template: meta-template.

## Meta-description
- **Level / parent:** L2 · Ops & Agents · parent: [spec-handoff.md](./spec-handoff.md)
- **Lens:** Blueprint (where every name and route of a place lives) with Causal (one change, every place it reaches)
- **Shift carried:** Craft (nearest 115). The village stays one coherent map while it grows.
- **Siblings:** [module-form.md](./module-form.md) (copy of the place), [qa-pass.md](./qa-pass.md) (checking it), [spec-handoff.md](./spec-handoff.md) (the issue)
- **Status · last reviewed:** v0.1 · 2026-11-25

## Rules
1. **Rename the label, keep the key.** A place key (`workshop`), pane id (`build`), room id and route are internal ids used by state, tests, the tour and saved progress. A rename changes `name`, `line`, copy, image and i18n strings only. Change a key only when Sasha asks for it explicitly.
2. **A route that moves keeps a redirect** from the old path (App.tsx `<Navigate replace>`), so links in mail, videos and docs still work.
3. **Hard lines need Sasha's yes to that exact change:** title, intro, reveals, entry, themes, existing nav order, `/ubb` screens, `/playbook`. Quote his yes (date, time) in the issue.
4. **en / es / ru** for every visible string; 390 px; reduced motion; no new dependency; no DB.
5. **One issue, one diff.** List every file below that the change touches; touch nothing else.

## Where a place lives (check every row)
| What | File | What to change |
|---|---|---|
| The place: name, line, element, ENTER route, open rule, scene, marker | `src/data/villagePlaces.ts` | label fields; key stays |
| Scene image | `public/game/village/<name>.webp` (1024×1024, night, same style) | new file; old one kept until nothing uses it |
| Rooms in pane 2 (order = order on screen) | `src/data/placeRooms.ts` | add / reorder rooms; each needs `result` |
| Pane-2 space behind the place | `src/lib/railPlaces.ts` (`PANE_BY_PLACE`, `PLACE_BY_PANE`, `HOME_PATHS`) | only when the place changes pane |
| Pane-2 rows and title | `src/components/game/SectionsPanel.tsx` (`SPACE_SECTIONS`), visibility in `src/data/founderTools.ts` | labels, new rows |
| Browser tab title | `src/lib/pageTitles.ts` | label |
| Routes | `src/App.tsx` | new route + redirect from the old |
| Place header on module screens | `src/components/game/VillagePlaceHeader.tsx` and callers | usually nothing (reads the place) |
| Familiar / possibility lines | `src/modules/familiar/possibilityMap.ts`, `familiarState.ts` | copy that names the place |
| Lunar paths, colours, quarters | `src/lib/lunarWorld.ts`, `src/lib/placeColor.ts` | only if the key or element changes |
| Strings | `src/locales/{en,es,ru}/common.json` (`village.*`, `villagePlaces.*`, `rail.*`) | all three |
| Other pages naming the place | `grep -rn -i "<old name>" src` (e.g. InvestorRoom, Marketplace, MyProducts buttons) | copy only |
| Tests | `src/**/__tests__`, `e2e/` naming the place | update expected labels; never weaken an assertion |

## Steps
1. `grep -rn -i "<old name>\|<key>" src e2e public` and paste the list into the issue.
2. Write the issue with [spec-handoff.md](./spec-handoff.md): Sasha's yes, the rows above that change, DoD.
3. Build; run unit tests and the e2e suite; check the map marker label at 390 px and desktop.
4. Merge on green + DoD, publish (Lovable Publish, no prompt), open the live map, the place, each room, and the old route.
5. Report: what moved, the live link, one question.

## DoD
- The new name shows on the map, in the place scene, in pane 2, in the tab title, in en/es/ru.
- Every room opens; the old route redirects; saved progress unchanged.
- `grep` for the old visible name returns only history, docs and ids.
- All tests green.
