# UBB ↔ GameShell Integration — Design

*UBB v2.0 supplement · 2026-04-24 · Status: design, pre-implementation*

> **Question this answers:** how does the standalone UBB module live inside the 3-pane GameShell?
> **Today:** `/ubb` renders `UniqueBusinessLayout` directly — its own sticky header, its own max-w-6xl main, no GameShell. It's an island.
> **Goal:** UBB becomes a citizen of the BUILD space without losing its focus mode.

---

## The 5 seams

These were the unsketched joints. Each gets a decision below.

1. Canvas Overview placement (where does the 18-tile grid live)
2. Phase dividers in pane 2 (does pane 2 expand to show all 18 artifacts, or stay a doorway)
3. Improve drawer location (left-edge? right-edge? overlay? full-screen on mobile?)
4. `UniqueBusinessLayout` internal-state audit (what does it own once GameShell wraps it)
5. BUILD pane 2 — doorway-vs-full-list (one chip or 18)

---

## Seam 1 — Canvas Overview placement

**Decision: Canvas Overview lives in GameShell pane 3.**

When user clicks BUILD chip → "Unique Business Builder" item in pane 2 → pane 3 renders `<CanvasOverviewScreen />` — the 18-tile grid. No route change beyond `/ubb`. The shell wraps it.

**Why not full-bleed (today's behavior):**
- Loses pane 1 + pane 2 context. User can't jump to ZONE OF GENIUS without a back-navigation.
- Breaks the shell's promise: every authenticated surface is reachable via the rail.
- Forces a duplicate header (sticky breadcrumb) that competes with the shell's own pane 2 header.

**What changes:**
- `/ubb` route still resolves to `UniqueBusinessLayout`, but `UniqueBusinessLayout` no longer renders its own `<header>` + `<main>`. It just renders `<UniqueBusinessProvider>` + `<Outlet />` and lets GameShell own the chrome.
- The 18-tile grid uses pane 3's full width (~720–960px on desktop, the existing pane 3 max-width).

**Mobile:** GameShell collapses to single-pane on mobile already. UBB inherits that. The 18-tile grid becomes a 2-column scroll.

---

## Seam 2 — Phase dividers in pane 2

**Decision: pane 2 stays a doorway by default, expands to phase-grouped list when the user is INSIDE UBB.**

Three states for pane 2 when BUILD is the active space:

| User location | Pane 2 contents |
|---|---|
| Not yet in `/ubb` | One row: **"Unique Business Builder · 6 / 18 sharp"** → clicking opens `/ubb` |
| At `/ubb` (Canvas Overview) | Doorway row stays at top + below it, the 4 phase dividers with their artifact counts (collapsed) |
| At `/ubb/{artifact}` (focus mode) | Doorway row at top + the phase containing the current artifact, expanded; sibling phases stay collapsed |

**Phase dividers** (matches the playbook's structure):

```
▸ Phase A — Canvas (7)            6 / 7 sharp
  · Uniqueness                    9.2  ✓
  · Myth                          8.8  ✓
  · Tribe                         9.0  ✓
  · Pain                          8.5  ✓
  · Promise                       9.1  ✓
  · Lead Magnet                   7.4  ⟳
  · Value Ladder                  ·    ◯
▸ Phase B — Session Bridge (1)    0 / 1
▸ Phase C — Market Path (9)       0 / 9
▸ Phase D — Publication (1)       0 / 1
```

Glyph legend: `✓` locked at ≥ 9 · `⟳` locked but improvable · `◯` not yet generated · `·` no score yet.

**Why this and not full-flat-list-of-18:**
- 18 items is too many for pane 2's narrow width.
- Phase grouping IS the playbook's mental model. Pane 2 should mirror it.
- Collapsed-by-default keeps the doorway scannable; expansion follows attention.

**Why not "no doorway, just expand by default":**
- The doorway carries the **specificity progress** glance (`6 / 18 sharp`). That's the at-a-rail-glance signal.
- Removing it forces the user to count; the doorway compresses 18 numbers into one.

---

## Seam 3 — Improve drawer location

**Decision: right-edge drawer, overlays pane 3 only, never the rail or pane 2.**

Today: `<ImproveReviewDrawer />` is rendered inside `UniqueBusinessLayout`, slides up from bottom, full-width.

In the shell:
- Drawer slides in from **right edge of pane 3** on desktop (440–520px wide).
- Pane 3's content shifts left, doesn't disappear (so user can re-read what they're roasting).
- Pane 1 + pane 2 stay visible and interactive — user can navigate elsewhere mid-review without dismissing the drawer.

**Mobile:**
- Drawer becomes full-screen modal sliding up from bottom (current behavior, kept).
- Backdrop dims pane 3 only (the only pane visible on mobile).

**Why not modal-overlay-everything:**
- The Improve cycle is a **comparison** task: read current → read proposed → choose. Letting the artifact stay visible behind the drawer keeps that comparison alive.
- Modal-everything blocks pane 1 navigation, which contradicts seam 1's "shell stays a citizen" promise.

**Drawer state lives in `UniqueBusinessContext` (already does).** Open/close events don't navigate. URL doesn't change when drawer opens.

---

## Seam 4 — `UniqueBusinessLayout` internal-state audit

**Today:**

```ts
function UniqueBusinessLayout() {
  return <UniqueBusinessProvider><Shell /></UniqueBusinessProvider>;
}

function Shell() {
  // owns: <header> with sticky breadcrumb, <ProgressBar>, <main>, <ImproveReviewDrawer>
}
```

**After integration:**

```ts
function UniqueBusinessLayout() {
  return (
    <UniqueBusinessProvider>
      <Outlet />
      <ImproveReviewDrawer />  {/* portal'd to body, positioned right-edge */}
    </UniqueBusinessProvider>
  );
}
```

**Strip from `UniqueBusinessLayout`:**
- ❌ Sticky header — GameShell pane 2 owns the breadcrumb now ("Build > Unique Business Builder > Uniqueness").
- ❌ Progress bar — moves into pane 2 doorway row as the `6 / 18 sharp` summary.
- ❌ `<main className="max-w-6xl">` wrapper — pane 3 already provides width constraint.
- ❌ Back-link to Canvas — pane 2 phase tree is the back-navigation.

**Keep in `UniqueBusinessLayout`:**
- ✅ `UniqueBusinessProvider` — context owns canvas state, drawer state, Improve calls.
- ✅ `<ImproveReviewDrawer />` — portal'd, positions itself relative to viewport not pane.
- ✅ `<Outlet />` — for nested artifact screens.

**The rule:** `UniqueBusinessLayout` owns **state and the drawer**. GameShell owns **chrome and navigation**. No overlap.

---

## Seam 5 — BUILD pane 2: doorway vs. full list

**Decision: doorway, with phase-tree expansion only when user is inside `/ubb`.**

This is seam 2 restated as a chip-level decision, but worth pinning because pane 2 today already has 8 BUILD items planned (from the journey arc):

```
BUILD (current journey order)
1. Genius Path
2. (locked) Build a business off your top talent  → /ubb
3. (locked) Mission Discovery
4. (locked) Asset Mapper
5. ...
```

**Inside BUILD, when not in /ubb:** item 2 is a single doorway with the `6 / 18 sharp` chip. Clicking opens `/ubb`, which lands the user on Canvas Overview.

**Inside BUILD, when in /ubb:** item 2 expands inline, showing the four phase dividers with their artifact counts (per seam 2). Other BUILD items (Mission Discovery, Asset Mapper) stay as doorway rows — they don't expand because they're not the active area.

**Why not "promote UBB to a separate space chip in pane 1":**
- Pane 1 is the SPACES rail (ME, JOURNEY, BUILD, DASHBOARD, etc.). UBB is part of BUILD, not a peer to it. Promoting it would dilute the space taxonomy.
- The doorway pattern works for nested products inside a space. It's the same shape as how Marketplace nests under BUILD today.

**Why not "no expansion, always doorway, all navigation happens in pane 3":**
- Forces the user to scroll inside pane 3 to find sibling artifacts. Pane 2's job is sibling navigation. Defeats the 3-pane premise.

---

## Mock — desktop layout when user is at `/ubb/uniqueness`

```
┌──────┬────────────────────────────┬─────────────────────────────────────┐
│ ME   │ Build                      │ Uniqueness                          │
│ JRN  │                            │                                     │
│ BLD▸ │ 1. Genius Path             │ [SpecificityBadge: 9.2 sharp]       │
│ DSH  │ 2. Unique Business Builder │                                     │
│ LIB  │    6 / 18 sharp     ▾      │ Current content (locked v3)         │
│ ...  │    ▾ Phase A — Canvas (7)  │ ...                                 │
│      │      Uniqueness    9.2 ✓●  │                                     │
│      │      Myth          8.8 ✓   │ [Improve →]  [Lock]                 │
│      │      Tribe         9.0 ✓   │                                     │
│      │      Pain          8.5 ✓   │                                     │
│      │      Promise       9.1 ✓   │                                     │
│      │      Lead Magnet   7.4 ⟳   │                                     │
│      │      Value Ladder  · ◯     │                                     │
│      │    ▸ Phase B (1)           │                                     │
│      │    ▸ Phase C (9)           │                                     │
│      │    ▸ Phase D (1)           │                                     │
│      │ 3. (locked) Mission Disc.  │                                     │
│      │ 4. (locked) Asset Mapper   │                                     │
└──────┴────────────────────────────┴─────────────────────────────────────┘
```

`●` = active artifact in the phase tree (gold left-pill, matches journey register).

---

## Touch points for implementation

| File | Change |
|---|---|
| `src/modules/unique-business-builder/UniqueBusinessLayout.tsx` | Strip header + main wrapper. Keep provider + drawer portal. |
| `src/components/game/SectionsPanel.tsx` | Add `buildBusinessSections()` builder + phase-tree rendering when active path is `/ubb*`. |
| `src/components/game/SectionsPanel.tsx` | Doorway row variant: shows `{lockedCount} / 18 sharp` when collapsed. |
| `src/components/game/GameShellV2.tsx` | Already maps `/ubb` → `build` space. No change unless seam 1 forces a wrapper. |
| `src/modules/unique-business-builder/components/ImproveReviewDrawer.tsx` | Reposition right-edge on desktop; portal to body. |
| `src/modules/unique-business-builder/UniqueBusinessContext.tsx` | Expose `lockedCount` + `phaseProgress(phase)` for pane 2 consumption. |
| `src/App.tsx` | Wrap `/ubb*` routes in GameShell (not `UniqueBusinessLayout` solo). |

---

## What this design deliberately does NOT do

- ❌ Doesn't pre-build the phase tree for non-UBB BUILD items. Mission Discovery and Asset Mapper stay doorway-only until they have their own internal navigation needs.
- ❌ Doesn't surface dossier or landing-page in pane 2. Those are exit artifacts, reached from Canvas Overview, not navigation siblings.
- ❌ Doesn't change the focus-mode "minimal chrome" intent — focus mode now means "GameShell with collapsed sibling phases," not "no shell at all."
- ❌ Doesn't introduce a 4th pane or a sub-rail. The 3-pane shell is the contract.

---

## Open questions (parked)

1. **Animations.** Phase tree expand/collapse — instant, or 200ms ease? Park until the rest is wired.
2. **Specificity-based ordering.** Should incomplete artifacts float to the top of their phase to focus attention? Or strictly playbook-order? Default: playbook-order, no float.
3. **Drawer width on tablet (768–1024px).** Take the full pane 3, or stay 440px and let pane 3 squeeze? Park.

---

## Acceptance criteria

- [ ] Visiting `/ubb` while authenticated lands user inside GameShell, BUILD active, pane 2 showing doorway + expandable phase tree, pane 3 showing Canvas Overview.
- [ ] Clicking an artifact in the phase tree navigates to `/ubb/{slug}`, pane 3 swaps to that screen, the active artifact highlights gold-pill in pane 2.
- [ ] Clicking ME or JOURNEY in pane 1 from inside `/ubb` cleanly navigates away — no Improve drawer ghost remains.
- [ ] Improve drawer opens right-edge of pane 3 on desktop, full-screen on mobile, with pane 1 + pane 2 still visible/interactive on desktop.
- [ ] No duplicate sticky headers — `UniqueBusinessLayout` no longer renders its own header.
- [ ] Locking an artifact updates `lockedCount` in pane 2 doorway in real time.

---

*End of design. Roast gate before implementation.*
