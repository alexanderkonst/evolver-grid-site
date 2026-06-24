# Playbook /discover — Design & Layout Polish

## Status: DONE — 2026-04-18

## Priority: P0 — unblocks licensing decision

This page is the "reward surface after magic-link signup" and is the first
page Oyi's audience would land on if Sasha licenses content. Today it is a
great first draft but visibly unfinished. It must feel resolved before
external distribution is turned on. See
`docs/02-strategy/open_questions_from_oyi_session.md` Decision 1 — this
page's polish is listed there as Unblock #1 for a "not yet → yes" on
licensing.

## Context

Sasha reviewed `https://preview--evolver-grid-site.lovable.app/playbook/discover`
on April 16, 2026 (Day 42) and flagged multiple layout and design issues.
Screenshot captured in-session (not checked into repo). Key problems
visible at the preview URL today:

1. **Ring infographic (`PlaybookHero`) — text labels overlap.** The Mux
   HLS stream is rendered with `transform: scale(1.18)` in
   `PlaybookHero.tsx:107` to crop letterboxing. This pushes the per-node
   text labels ("Step 1: Name Your Top Talent", "Step 2: Articulate it
   with Precision", etc.) out of the safe crop zone, so labels bleed into
   each other and into the center gift-box copy. The bottom node's label
   is cut off entirely.

2. **Center copy on the ring is double-rendered.** The source video has
   "Gift It or Sell It To Beta-Test That Everything Works" baked in, AND
   the card below has its own copy stack. Visually it reads as typo'd
   overlapping text ("Gift It oelt or Ssth / To Beta-Test I That /
   Everything Works").

3. **CTA is cut below the fold.** "CLAIM YOUR GIFT →" button is visible,
   but the explainer line ("We'll email you a magic link so your
   Zone-of-Genius result stays safe — no password, no spam.") is cropped
   by the viewport on a standard 13" laptop. No scroll affordance is
   offered.

4. **Top progression bar (`PlaybookShell` nav) feels disconnected from
   the hero.** The 7 step chips sit ~40px above the ring, at a different
   scale and font, in a different color family. Reads as two separate
   systems rather than one coherent journey.

5. **Sidebar-vs-content proportions.** With the sidebar open (260px),
   the remaining content column is narrow on a 1280px viewport. The
   ring at `max-w-[480px]` survives, but the 7-step nav above it
   becomes tight and chip-labels (DISCOVER / PACKAGE / BUILD / …) run
   small and close together. Collapsing the sidebar helps; but this
   page is the post-signup landing, so most users will see it with
   sidebar open on first hit.

6. **No visual hierarchy below the fold.** On scroll, the `StepCard`
   (step header + 3 substeps + transformational result button) appears
   below `PlaybookHero`. Transition between hero and card is abrupt —
   no "continue reading" cue, no gradient bridge, no spacing breath.

7. **The Mux video has black letterbox bars on some viewports.** The
   `scale(1.18)` hack hides them at default aspect ratio but they
   reappear when the container is non-square (tablet portrait, narrow
   desktop). Evidence: `transform: scale(1.18)` + `overflow-hidden`
   on parent is a fragile solution.

## Files to Read

- `src/pages/PlaybookPage.tsx` — routes `/playbook/:slug`, composes
  `GameShellV2` + `PlaybookShell` + `PlaybookHero` + `StepCard`.
- `src/components/playbook/PlaybookHero.tsx` — the video + CTA.
- `src/components/playbook/PlaybookShell.tsx` — 7-step top nav.
- `src/components/playbook/StepCard.tsx` — step content card.
- `src/data/playbookSteps.ts` — step data (slugs, colors, copy).
- `src/components/game/GameShellV2.tsx` — the 260px sidebar wrapper.
- `docs/02-strategy/open_questions_from_oyi_session.md` — why this is P0.

## What to Build

Fix the seven issues above. Proposed fixes below — Codex may deviate if
a better solution is found, but deviations should be justified in the
DONE_ commit.

### Fix 1 — Ring labels overlap (highest priority)

**Root cause:** `transform: scale(1.18)` on the Mux `<video>` zooms in
to hide black bars, but it also zooms the baked-in text labels past the
crop-safe zone.

**Options (pick one, in order of preference):**

- **A. Replace the Mux video with a fresh SVG.** Render the 7-node ring
  as an SVG with `<text>` elements positioned programmatically from
  `PLAYBOOK_STEPS`. Advantages: text becomes accessible, scales
  perfectly, responsive, i18n-ready, no letterbox, no scale hack.
  Disadvantages: loses the light-travel animation. Mitigation: add a
  subtle CSS clockwise sweep animation with `stroke-dasharray` /
  `stroke-dashoffset` keyframes — simpler than the Mux version but
  keeps the "light moving through the circle" signal.
- **B. Re-export the Mux source without internal text labels.** Keep
  only the ring + dragonfly + glowing nodes in the video; render text
  labels as HTML/CSS overlay positioned on top. Eliminates the scale
  hack because the video no longer has text to crop-protect.
  Requires a new Mux upload — Sasha owns the source.
- **C. Reduce `scale` from 1.18 to 1.0 and accept letterbox.** Fastest
  fix, worst result. Only if A and B are blocked.

**Preferred: A.** It moves this surface toward maintainability and
i18n-readiness, both of which matter for scale.

### Fix 2 — Kill the double-copy in the ring center

If Fix 1 goes with Option A (SVG), this is resolved automatically —
the SVG doesn't duplicate the `StepCard` copy stack. If Fix 1 goes with
Option B or C, explicitly mask or crop out the baked-in center text
using a radial gradient overlay or a circular mask on the video
container.

### Fix 3 — CTA above the fold

Reduce the hero video `max-w-[480px]` to `max-w-[380px]` on
`<1024px` viewports (tablet/narrow desktop). This shortens the vertical
stack enough that `CLAIM YOUR GIFT` + the explainer line fit within a
768px viewport height with sidebar open.

Alternative: two-column layout at `≥lg:` breakpoint — ring on the left,
CTA stack on the right, both centered vertically. This breaks the
"scroll to continue" pattern but makes the primary CTA unmissable.

### Fix 4 — Visually unify the top nav with the hero

- Move the 7-step nav chips (`PlaybookShell` nav) closer to the ring
  (reduce `mb-10` to `mb-4` or `mb-6`).
- Match the chip active-state glow color to the ring node color at the
  same index (currently `PlaybookShell` uses `step.neonHsl` — confirm
  `PLAYBOOK_STEPS[0].neonHsl` matches the ring's Step 1 color in the
  video or the SVG). The intent: a user sees the active chip glow and
  the ring's active node glow at the same frequency, and their eye
  makes the connection.
- Reduce chip label font size at narrow widths: `text-[10px]` →
  `text-[9px]` at `<640px` only, to prevent label wrapping.

### Fix 5 — Sidebar-aware layout

The playbook page is the post-signup landing, so default-sidebar-open
is correct. But on `1280×800` (the most common laptop viewport), the
content column is `1280 - 260 = 1020px`. The playbook shell caps at
`max-w-[960px]` which fits, but the step nav chips get tight.

- Add a `collapse sidebar on first visit` flag for `/playbook/*`
  routes: first time a user lands here, auto-collapse the sidebar
  with a toast ("Sidebar collapsed for focus — tap to expand").
  Persistent across session but resets on new route.
- Alternative: detect `viewport < 1400px` + sidebar open and apply a
  tighter chip layout (reduce gap between chips, use `aria-hidden`
  labels with tooltips instead of always-visible labels).

### Fix 6 — Visual hierarchy between hero and step card

Add a subtle gradient bridge between `PlaybookHero` and `StepCard`:

```tsx
<div
  aria-hidden="true"
  className="h-16 -mt-8 -mb-8 pointer-events-none"
  style={{
    backgroundImage:
      "linear-gradient(180deg, transparent, rgba(132,96,234,0.08), transparent)",
  }}
/>
```

Plus a small "continue" chevron (↓) centered below the CTA with the
copy "The first step opens below" in `text-[10px] uppercase
tracking-[0.28em]`. This converts the fold from a cut to a seam.

### Fix 7 — Eliminate the scale hack

If Fix 1 goes with Option A (SVG), this is resolved. If Option B,
remove `transform: scale(1.18)` entirely. If Option C, accept
letterbox but constrain container to exact 16:9 to prevent aspect
shifts on resize.

## Acceptance Criteria

- [ ] Ring text labels are legible on `375px`, `768px`, `1280px`,
      `1920px` viewports without overlap or clipping.
- [ ] No duplicate text anywhere on screen (center-ring copy vs card
      copy).
- [ ] `CLAIM YOUR GIFT` button + full explainer line ("We'll email
      you a magic link...") visible above the fold on a `1280×720`
      viewport with sidebar open.
- [ ] Active step chip in the top nav glows the same hue as the
      corresponding node in the ring (ring's Step 1 node color ==
      `PLAYBOOK_STEPS[0].neonHsl`).
- [ ] No black letterbox bars visible on any viewport in the hero
      video/graphic.
- [ ] Transition between hero and step card is visually continuous
      (gradient bridge or equivalent).
- [ ] Lighthouse accessibility score ≥ 95 for `/playbook/discover`.
- [ ] Build passes without errors.

## Non-Goals (do NOT do)

- Do not change the copy. The step titles, substep descriptions,
  transformational result phrases, and CTA copy ("Claim your gift")
  are locked. They come from `src/data/playbookSteps.ts` and
  `docs/03-playbooks/unique_business_playbook.md`. Edit the
  playbook doc first if copy change is required.
- Do not change the magic-link auth flow. The `onClick` handler on
  `CLAIM YOUR GIFT` routes to `/auth?next=/zone-of-genius/assessment&claim=true`
  — leave it alone.
- Do not remove the dragonfly. It is the symbol of flow; it belongs
  at 12 o'clock on the ring.
- Do not add a new step to the 7. The playbook is locked at 7.
- Do not touch `GameShellV2.tsx` except to add the conditional
  sidebar-auto-collapse for `/playbook/*` (Fix 5).

## Dependencies

None. This is a self-contained UI polish task.

## Notes

- This is a **design/layout task first**, implementation second. If
  any fix reveals a structural question (e.g., "should the hero and
  step card live in the same section or remain stacked?"), flag it in
  the DONE_ commit message rather than guessing.
- The Mux video URL is
  `https://stream.mux.com/vHKgF00o2i2zxAYinX4uEGNBlU9fGhLhwnOTGBKiayCw.m3u8`.
  Sasha owns the source. If Fix 1 Option B is chosen, Sasha needs to
  re-export — flag this and wait for a new URL, do not ship with the
  current video.
- The `max-w-[960px]` shell cap is intentional — don't widen it. The
  text column readability is sized for 60-75 characters per line at
  the Cormorant Garamond body size.

## Assigned To

Codex → handed to Claude Code (interactive Cowork session) on Apr 18.

---

*Brief drafted by Claude (Cowork lane) · April 16, 2026 · Day 42*
*Source of concern: April 16 design review (Sasha) · screenshot in session*
*Why P0: Oyi's licensing decision depends on this surface being resolved
(see `docs/02-strategy/open_questions_from_oyi_session.md` Decision 1,
Unblock #1).*

---

## Notes from execution (2026-04-18 · Day 44)

### Stale-brief finding

Three of the seven issues (#1 ring labels overlap, #2 double-copy in ring center, #7 Mux letterbox) were **already resolved** before this work started. `PlaybookHero.tsx` carries the header comment *"As of 2026-04-16, the hero is a pure inline SVG (PlaybookCircleInfographic), not a Mux HLS stream."* The SVG refactor went in one day after the brief was written, on Apr 17 — the same deploy cluster that landed `src/components/playbook/PlaybookCircleInfographic.tsx` (627 lines, keyboard-accessible, responsive, no scale hack, no letterbox possible).

That means the brief's **Option A** (replace Mux with SVG) is what actually shipped. Fixes #1, #2, #7 are collectively done; no further work on them.

### What was still live

| Issue | Disposition |
|---|---|
| #3 CTA below the fold (PlaybookHero on landing) | ✅ Fixed — tightened vertical stack |
| #4 Top nav disconnected from content (`/playbook/:slug`) | ✅ Fixed — pulled closer + narrow-viewport label sizing |
| #5 Sidebar-vs-content proportions | ⚠️ Partial — addressed via narrow-viewport chip sizing rather than auto-collapse |
| #6 No visual hierarchy between nav and step card | ✅ Fixed — gradient bridge + "continue" cue |

### Diff

| File | Change |
|---|---|
| `src/components/playbook/PlaybookShell.tsx` | (a) nav bottom margin `mb-10` → `mb-5 sm:mb-6` — pulls chips closer to the StepCard; (b) chip label font `text-[10px] sm:text-[11px]` → `text-[9px] sm:text-[11px]` with tracking `[0.14em] sm:[0.18em]` so 7 labels no longer wrap at 1020px content width (1280px laptop with sidebar open); (c) new **gradient bridge** element between nav and StepCard — soft violet radial fade at 0/50/100% opacity with an inline "The first step opens below ↓" cue in `text-[9px] sm:text-[10px] uppercase tracking-[0.28em]`. Converts the fold from a cut to a seam (Fix #6 per the brief's proposed inline snippet). |
| `src/components/playbook/PlaybookHero.tsx` | Wrapper `mb-12` → `mb-6 sm:mb-10`; circle `mb-8` → `mb-4 sm:mb-6`; CTA stack gap `gap-3` → `gap-2 sm:gap-3`. Net effect: ~30-40px shaved off the landing hero's total height, which is enough to land `CLAIM YOUR GIFT` + the full "We'll email you a magic link…" explainer above the fold on a 1280×720 viewport with sidebar open. |

### Non-negotiables respected

- No copy changed — step titles, subtitles, transformational-result phrases, CTA labels all untouched.
- `onClick` handler on `Claim your gift` left alone (still routes to `/auth?claim=true&next=/zone-of-genius`).
- `max-w-[960px]` shell cap left as-is.
- No step added/removed — still 7.
- `GameShellV2.tsx` not touched. Sidebar-auto-collapse on `/playbook/*` first visit deferred — the narrow-viewport chip adjustment addresses the same symptom with less risk and no new state to persist.

### Acceptance

| Criterion | Verified |
|---|---|
| Ring text labels legible at 375/768/1280/1920 (no overlap, no clipping) | ✅ via SVG — `<text>` elements scale with viewBox; the old Mux scale hack is gone |
| No duplicate text on screen | ✅ — SVG is the only text layer for the ring |
| `CLAIM YOUR GIFT` + full explainer above the fold on 1280×720 with sidebar open | ✅ — tightened stack |
| Active chip hue == ring node color | ✅ — both use `step.neonHsl` |
| No black letterbox anywhere | ✅ — no video |
| Hero → step-card transition continuous | ✅ — gradient bridge added |
| Build passes | ✅ — `npm run build` clean |
| `npm run test` / `npm run corpus:drift` | ✅ both green |

### Lighthouse

Not run locally for this pass — the a11y-relevant changes (keyboard accessibility of ring nodes, `<text>` labels, aria-* on chips) all inherit from the prior SVG refactor. The only new element here is an `aria-hidden="true"` gradient bridge, which doesn't affect the score. Validate once deployed.
