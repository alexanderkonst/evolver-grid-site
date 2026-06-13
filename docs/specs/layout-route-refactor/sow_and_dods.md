# Layout-Route Refactor — Scope of Work + DoDs

> *Day 87 (Sasha 2026-05-29). Branch: `refactor/layout-routes`. Goal: hoist
> `GameShellV2` from a per-route wrapper to a persistent layout route so the
> shell mounts ONCE per session instead of rebuilding on every navigation.*

---

## Why (the problem)

Every route in `App.tsx` wraps its page in `<GameShellV2>` — either inline at
the route (14 routes) or internally inside the page component (66 files). Because
React treats each route's element as a fresh tree, **navigating between pages
tears down and rebuilds the entire shell**: the SpacesRail, the profile fetch,
the unlock-state logic, the Mux video background, the keyboard-shortcut handler,
pane-2 state — all re-initialize on every click (~300–500ms + visible flicker).

The COLLABORATE-chip-disappears bug (fixed Day 75) was one symptom. The root is
architectural: the shell is rebuilt when it should persist.

## What (the fix)

Make `GameShellV2` render React Router's `<Outlet/>` when given no children,
then group all in-shell routes under parent **layout routes** that supply the
shell once. Child routes swap only Pane 3. The shell — and everything expensive
inside it — mounts a single time per session.

## The wins

- All chip flicker dies (not just COLLABORATE)
- Pane 2 stops flashing blank on navigation
- Page navigation feels ~300–500ms snappier (no shell rebuild)
- Profile fetched once per session (fewer Supabase calls)
- **Mux video background streams continuously** instead of restarting each nav
- Keyboard shortcuts register once
- Future gated chips/spaces inherit no-flicker behavior for free

## The risk profile

**Low-to-medium. Failure mode is loud-and-fast, not silent-and-slow.** Anything
broken shows up as a blank page / missing rail / console error on the first
click-through of the smoke pass — never as a subtle bug surfacing later. The
genuinely-hard-to-fix categories (data loss, auth holes, payment breakage) are
structurally untouched: gates stay per-route, no Supabase/Stripe code is in
scope. Built entirely on branch `refactor/layout-routes` — `git revert` /
branch-delete away the whole time. Not merged to live `main` until verified
green AND Sasha pulls the go-live trigger (Balaji review window).

---

## The taxonomy (locked after 3 audit rounds)

71 files import `GameShellV2`. Classified:

| Bucket | Count | Treatment |
|---|---|---|
| `App.tsx` | 1 | Keystone — defines the layout routes |
| **Holdouts** (keep own internal shell) | 5 | `ZoneOfGeniusEntry`, `GameHome`, `GeniusQuiz`, `Settings`, `TourStepsScreen` |
| **Special-strip** (preserve Outlet/Provider/multi-internal) | 5 | `QolLayout`, `ZoneOfGeniusAssessmentLayout`, `ProductBuilderPage`, `TransformationGeniusAssessment`, `MeGate` |
| **Plain-strip** (remove wrapper, fix import) | 60 | the rest |
| Orphan (touch separately, NOT in scope) | 1 | `Profile.tsx` (dead — no route mounts it) |

Layout grouping (final): **two parents** —
1. `<GameShellV2/>` for public shell routes (no auth)
2. `<RequireAuth><GameShellV2/></RequireAuth>` for authed shell routes

`hideLogo` is derived inside GameShellV2 from the URL (not a per-layout split),
collapsing the earlier "Layout A vs B" into one shell with internal URL rules.
`MeGate` stays per-child-route. `<Navigate>` redirects + true full-bleed routes
(`/art`, `/auth/*`, public dossier/landing pages) stay OUTSIDE the layouts.

Holdouts each keep their internal `<GameShellV2 ...>` because they flip shell
config on internal component state (not URL-derivable) — migrating them would
require lifting that state to the URL, a separate refactor.

### Side-findings (parked — NOT this refactor)
- `path="/founders"` duplicated (App.tsx L447 + L714) — L714 unreachable
- `path="/zone-of-genius"` duplicated (L306 + L637) — L637 unreachable
- `Profile.tsx` orphan — delete in a hygiene pass

---

## DoD 1 — Planning  ✅ COMPLETE (3 audit rounds, see git history of this doc)

| # | Item | Status |
|---|---|---|
| P1 | Felt sketch ratified | ✅ |
| P2 | Route taxonomy locked (176 active routes, 51 redirects, 71 importers) | ✅ |
| P3 | Strip list locked (60 plain + 5 special = 65 ops) | ✅ |
| P4 | Holdout list locked (5) | ✅ |
| P5 | `sectionsPanelOpen` URL rule + session-persistence decision | ✅ |
| P6 | Wizard freshness — natural route lifecycle, no `key=` needed | ✅ |
| P7 | RequireAuth lifts to layout; MeGate stays per-child + sheds internal shells | ✅ |
| P8 | Behavior-change inventory | ✅ |
| P9 | DoD 2 + 3 amended | ✅ |

## DoD 2 — Implementation

| # | Item | Evidence | Status |
|---|---|---|---|
| I1 | `GameShellV2` renders `<Outlet/>` when no children (`children?` optional) | grep `children ?? <Outlet` | ⬜ |
| I2 | `hideLogo` + `showNavigation` derived from URL inside GameShellV2 (rules cover all former per-route props) | code | ⬜ |
| I3 | App.tsx restructured: public-shell + authed-shell layout parents; the 14 inline wrappers + 65 internal-wrap routes nested under them | git diff | ⬜ |
| I4 | 60 plain-strip files: internal `<GameShellV2>` wrapper removed, unused import removed | grep count → only holdouts remain | ⬜ |
| I5 | 5 special-strip files: shell removed, Outlet/Provider/gate logic preserved | per-file review | ⬜ |
| I6 | MeGate: 3 internal shell wrappers removed; gating logic intact | code | ⬜ |
| I7 | 5 holdouts untouched + doc-comment header explaining why | grep | ⬜ |
| I8 | `/art`, `/auth/*`, public pages stay shell-less (not pulled into a layout) | route review | ⬜ |
| I9 | Effect-on-navigation audit: no GameShellV2 effect silently assumed per-nav re-fire | code | ⬜ |
| I10 | `npx tsc --noEmit` zero errors; `npm run build` clean; no NEW lint warnings | terminal | ⬜ |

## DoD 3 — Debugging (live verification)

| # | Item | Status |
|---|---|---|
| D1 | Mux video continuity — never restarts across ME→AI OS→BUILD→mission-discovery | ⬜ |
| D2 | Zero chip flicker on rapid Space switching (esp. COLLABORATE/ME/OFFER) | ⬜ |
| D3 | Profile fetched ONCE per session (DevTools Network: 1 `game_profiles` read across 5+ navs) | ⬜ |
| D4 | Pane 2 toggle persists across navigations | ⬜ |
| D5 | Default-closed routes still default closed on first load (`/`, `/ignite`, `/build/equilibrium`) | ⬜ |
| D6 | Smoke pass — every authed surface renders (ME/AI OS/UBB/QoL/assets/mission/learn/meet/collaborate/marketplace/dashboard) | ⬜ |
| D7 | Holdouts work (ZoG entry wizard steps; GameHome hasAnyData) | ⬜ |
| D8 | Wizards reset on re-entry (asset-mapping, UBB phases) | ⬜ |
| D9 | Mobile breakpoint (390px) transitions intact | ⬜ |
| D10 | Cmd+B toggles pane 2 from any page | ⬜ |
| D11 | Auth + gate semantics preserved (sign-out → /mission-discovery redirects; non-activated → /ubb MeGate fires) | ⬜ |
| D12 | Build pipeline + Vercel preview deploy clean | ⬜ |
| D13 | DoD 1+2+3 amended with whatever the live walk surfaced | ⬜ |
| D14 | QolLayout / ZoG assessment layout don't double-wrap shell | ⬜ |
| D15 | Onboarding tour (TourStepsScreen) renders its own shell correctly | ⬜ |
| D16 | MeGate blocking states (ComingSoon/SaveProfile) render in parent layout shell | ⬜ |

---

*Branch `refactor/layout-routes`. Build green + smoke-passed before merge.
Go-live = Sasha's call (Balaji window).*
