# Layout-Route Refactor — SOW + DoDs

> *Started 2026-06-13. Goal: hoist `GameShellV2` from a per-route wrapper to a
> single persistent layout so the shell mounts ONCE per session instead of
> rebuilding on every navigation.*
>
> **⚠ This doc was rewritten 2026-06-14 to match reality.** The original
> described a branch-isolated, two-layout-parent plan that execution abandoned.
> What's below is what was actually built and where it actually stands. If a
> claim here conflicts with an older memory of the plan, this doc wins.

---

## Status at a glance (2026-06-14)

- **Live on `main`, in production.** Not isolated. The local auto-deploy pushed
  every commit to `origin/main` as it landed (Sasha chose "proceed now, keep
  every commit green" over pausing the auto-deploy). Each commit was green +
  behavior-correct before it shipped, so live was never broken — but the work
  is in prod, not on a branch.
- **Core win delivered + verified on PUBLIC routes only.** Authed surfaces are
  **unverified** (the preview server can't log in). This is the main open gap.
- **Three commits landed:** `0ea442a0` (nesting-aware shell) → `354701b6`
  (SmartShellLayout + classifier) → `c6b45184` (this doc, since superseded).
- **Strips not started.** Pages still wrap their own `<GameShellV2>`; all are
  harmless no-ops via the nesting guard, so the app is already correct.

---

## Why (the problem) — unchanged, accurate

Every route wrapped its page in `<GameShellV2>` (inline in `App.tsx` or inside
the page component). React treats each route element as a fresh tree, so
navigating between pages tore down and rebuilt the whole shell — SpacesRail,
profile fetch, unlock logic, Mux video, keyboard handler, pane-2 state — every
click (~300–500ms + visible flicker). The COLLABORATE-chip-vanishes bug was one
symptom. Root cause: the shell rebuilt when it should persist.

## What we ACTUALLY built (not the original plan)

The original plan was to physically regroup all in-shell routes under two parent
layout routes (`<GameShellV2/>` and `<RequireAuth><GameShellV2/></RequireAuth>`).
**That was abandoned** — reordering 176 routes risked dropping a route or
mis-assigning an auth wrapper (an auth hole, the genuinely-bad failure mode).

Instead:

1. **`GameShellV2` made nesting-aware + Outlet-capable** (`0ea442a0`). `children`
   is optional → renders `<Outlet/>` when used as a layout element. A
   `ShellNestingContext` lets a nested `GameShellV2` detect it's already inside a
   shell and render as a transparent pass-through. This is what lets the strips
   land incrementally without breaking anything: pages keep their inner wrapper,
   it no-ops, gets removed later.
2. **`SmartShellLayout` wraps the ENTIRE route list** (`354701b6`), routes left
   **byte-for-byte unchanged** — no reordering, no auth-wrapper moves. It renders
   one persistent `GameShellV2` for in-shell paths and a bare `<Outlet/>`
   otherwise.
3. **`src/lib/shellRoutes.ts`** — the URL classifier (`pathUsesLayoutShell` +
   `pathHidesLogo`). `hideLogo` is decided here, not "inside GameShellV2."
   `RequireAuth` did **NOT** lift to a layout — it stayed per-route (the whole
   point: routes unchanged). `showNavigation` is not URL-derived; the two pages
   that use it are holdouts.

Net: the worst a classifier mistake can do is show/hide a rail (visual), never
break auth or a route.

## The wins (delivered, but see verification gap)

- All chip flicker dies · pane-2 stops flashing · ~300–500ms snappier nav ·
  profile fetched once per session · Mux video streams continuously · keyboard
  shortcuts register once · future gated chips inherit no-flicker for free.

## The REAL risk profile (rewritten honestly)

The original "built on a branch, revert away, not live until go-live trigger"
story is **false** — there was never a branch isolation in practice. Actual risks:

1. **Auto-deploy ships every commit to live before authed verification is
   possible.** This is the live exposure. Mitigated only by per-commit green +
   the nesting guard (which keeps each commit behavior-correct).
2. **Authed surfaces are unverified.** The preview can't authenticate, so ME /
   UBB / QoL / MeGate states / auth-gates / the multi-instance special files were
   NOT exercised. These are exactly where a botched strip would hurt and where no
   automated check will catch it.
3. Structurally untouched (still true): no Supabase/Stripe/schema in scope; auth
   gates stay per-route. Data-loss / payment / auth-hole categories remain
   low-risk.

Reversibility: `git revert 354701b6 0ea442a0` restores the old per-route shell.

---

## Taxonomy (corrected to reality, 2026-06-14)

**73 files** import `GameShellV2` (excluding `GameShellV2.tsx` + `App.tsx`).

| Bucket | Count | Treatment |
|---|---|---|
| **Holdouts** — render own shell from internal state | **9** | `ZoneOfGeniusEntry`, `GameHome`, `GeniusQuiz`, `Settings`, `TourStepsScreen`, `KarimeOffer`, `KarimeIntake`, **`Auth`**, **`Admin`** |
| **Orphan** — dead, delete separately | 1 | `Profile.tsx` (no route mounts it) |
| **Provider/Outlet special-strip** — preserve structure | 5 | `QolLayout`, `ZoneOfGeniusAssessmentLayout`, `ProductBuilderPage`, `TransformationGeniusAssessment`, `MeGate` |
| **Multi-instance strip** — shell rendered in 2–5 conditional states (loading/error/main); remove ALL | **~24** | inc. `GeniusBusiness` (5×), `ZoneOfGeniusOverview` (3×), `CanvasOverviewPage` (3×), `AppleseedView`/`ExcaliburView`/`Connections`/`BuildCanvasPage` (3×), the `GeniusBusiness*` family, `DailyLoopV2`, `CoreLoopHome`, … |
| **Single-instance plain strip** | **~34** | the rest |

> **Correction vs original plan:** the original said "60 plain + 5 special." It
> missed that ~24 files render the shell across multiple conditional branches —
> trickier than "plain," and most live on authed surfaces the preview can't test.
> Total to strip = 63 (≈34 single + ≈24 multi + 5 special). Holdouts grew 5→9
> (Auth, Admin, Karime×2 added during execution).

### Side-findings (parked — NOT this refactor)
- `/founders` duplicated in `App.tsx` — reachable route is `FoundersIndex` (no
  shell); the `FoundersShowcase` route is unreachable dead code.
- `/zone-of-genius` declared twice — second is unreachable.
- `Profile.tsx` orphan — delete in a hygiene pass.
- *(line numbers intentionally omitted — they drift; grep the path)*

---

## DoD 1 — Planning  ✅ decisions made, some SUPERSEDED by execution

| # | Item | Status |
|---|---|---|
| P1 | Felt sketch ratified | ✅ |
| P2 | Route taxonomy | ✅ (corrected above: 73 importers, 9 holdouts) |
| P3 | Strip list | ⚠️ **superseded** — "60 plain + 5 special" → 63 (≈34 single + ≈24 multi + 5 special) |
| P4 | Holdout list | ⚠️ **superseded** — 5 → **9** (added Auth, Admin, Karime×2) |
| P5 | `sectionsPanelOpen` URL rule + session-persistence | ✅ (carried into SmartShellLayout) |
| P6 | Wizard freshness — natural route lifecycle, no `key=` | ✅ (still believed; unverified on authed wizards) |
| P7 | ~~RequireAuth lifts to layout; MeGate sheds shells~~ | ❌ **REVERSED** — RequireAuth stayed per-route; MeGate not yet stripped |
| P8 | Behavior-change inventory | ✅ |

## DoD 2 — Implementation

| # | Item | Evidence | Status |
|---|---|---|---|
| I1 | `GameShellV2` Outlet-capable (`children?`) | `0ea442a0` | ✅ |
| I2 | Nesting-aware shell (no-op when nested) | `0ea442a0` | ✅ |
| I3 | `SmartShellLayout` + URL classifier verified vs all 153 concrete routes | `354701b6` | ✅ |
| I4 | ≈34 single-instance plain strips | — | ⬜ |
| I5 | ≈24 multi-instance strips (all conditional branches) | — | ⬜ |
| I6 | 5 Provider/Outlet specials (preserve structure) | — | ⬜ |
| I7 | 9 holdouts untouched + doc-comment | — | ⬜ |
| I8 | `/art`, `/auth/*`, public pages stay shell-less | classifier verified | ✅ |
| I9 | Effect-on-navigation audit (no effect assumed per-nav re-fire) | — | ⬜ |
| I10 | `tsc` clean + `vite build` clean | green per commit | ✅ |

## DoD 3 — Verification (PUBLIC done · AUTHED is the open gap)

> The preview server runs unauthenticated. Everything below split into what was
> actually verified (public routes) and what CANNOT be verified without a login.

**Verified live (public routes only):**
| # | Item | Status |
|---|---|---|
| V1 | In-shell page renders shell ONCE — `/ai-os` (no double-wrap) | ✅ |
| V2 | No-shell page renders bare — `/1-pager` (0 rail) | ✅ |
| V3 | Shell DOM node SURVIVES client-side nav `/ai-os → /playbook` | ✅ |
| V4 | Post-nav state == fresh-load state (no accumulation) | ✅ |
| V5 | Zero console errors across the public sweep | ✅ |

**UNVERIFIED — needs an authenticated session (test account or Sasha):**
| # | Item | Status |
|---|---|---|
| U1 | Mux video continuity (preview showed fallback img, not the video) | ⬜ |
| U2 | Chip flicker gone on authed Space switching (COLLABORATE/ME/OFFER) | ⬜ |
| U3 | Profile fetched ONCE/session — **measured**, not asserted (Network tab) | ⬜ |
| U4 | Pane-2 toggle persists across navigations | ⬜ |
| U5 | Default-closed routes still default closed (`/`, `/ignite`, `/build/equilibrium`) | ⬜ |
| U6 | Every authed surface renders (ME/UBB/QoL/assets/mission/learn/meet/collaborate/marketplace) | ⬜ |
| U7 | Holdouts work (ZoG wizard steps; GameHome hasAnyData; Auth phases; Admin) | ⬜ |
| U8 | Wizards reset on re-entry (asset-mapping, UBB phases) | ⬜ |
| U9 | Mobile 390px transitions intact | ⬜ |
| U10 | Cmd+B toggles pane 2 from any page | ⬜ |
| U11 | Auth + gate semantics preserved (sign-out → /mission-discovery redirect; non-activated → /ubb MeGate) | ⬜ |
| U12 | MeGate blocking states (ComingSoon/SaveProfile) render in the parent layout shell | ⬜ |
| U13 | QolLayout / ZoG-assessment don't double-wrap (post-strip) | ⬜ |

---

## Next steps (agreed 2026-06-14)

1. ✅ Rewrite this doc to match reality (done).
2. **Set up authed verification** (test login) so DoD-3 U-rows are executable —
   the high-risk strips live on authed surfaces.
3. Strips, in risk order: single plain → multi-instance → Provider/Outlet
   specials → MeGate. Build-green per batch; authed-smoke after the special files.

*The win is banked and live. The honest open work is authed verification, then
the strips. Go-live of strips is incremental (already in prod via auto-deploy).*
