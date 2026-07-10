# Progressive Onboarding Shell — Strategy Spec

> **Status:** Planning only. Not yet approved for implementation.
> **Origin:** Founder pulse feedback (Tom Norwood, 2026-07-09, Day 119 — see `session_log.md` Day 119 wave 6) + Sasha's response, 2026-07-09/10: *"We do need to be MAXIMALLY simple for the beginning of the journey. And hand hold the person throughout the whole journey. And more elements of the system should open up as they go along the SAME path at first. And know exactly what the next step is."*
> **Continuity note:** this is not a new idea. `docs/05-specs/onboarding/onboarding_spec.md` (2026-01-27, "Final v1.0") already stated the same intent verbatim: *"Like iOS — ZoG, QoL, Tour, boom: you're in."* / "iOS = screen-by-screen flow, one thing at a time, progressive unlock." That doc describes a specific 5-screen `/start` flow that has since been superseded by the Funnel v2 reshape (Day 77) — the SCREENS are stale, the PRINCIPLE isn't. This spec is a return to the stated intent, not a pivot.

---

## 1. The problem, precisely

The 3-pane shell (rail + sections + content) renders **in full, from the very first pixel of `/`**, before signup, before any onboarding. There is no staged reveal today. A brand-new visitor sees 8 space icons, a sections panel, a music player, a chat button, and a settings gear before they've done anything.

Tom's complaint (verbatim, WhatsApp 2026-06-21): *"there is a lot going on here... it can be a bit overwhelming with so much going on in the visual field."* His proposed fix: one focused journey per screen, plus a single homepage listing available journeys — not three panes always on.

## 2. What already exists vs. what's dormant vs. what's missing

This matters a lot for scope — most of this is **wiring and consolidation, not new construction.**

| Piece | State | Evidence |
|---|---|---|
| `hideNavigation` shell mode (hides pane 1 + 2 entirely) | **Built, but dead on the live funnel** | `GameShellV2.tsx` supports it; `ZoneOfGeniusEntry.tsx:113` hardcodes `const hideNav = false;` on the actual signup/ZoG path. `/` is also explicitly excluded from the auto-hide branch (`earlyOnboardingHide`) via `isPublicSurface`. |
| Hide-don't-lock progressive space reveal (pane 1) | **Fully live and working** | `hiddenSpaces` in `GameShellV2.tsx` — spaces you haven't unlocked yet don't render at all. GROW/BUILD/COLLABORATE already gate on `tmaComplete` (shipped this same week). |
| JOURNEY as "the one guided path" | **Exists, but locks are cosmetic only** | `SectionsPanel.tsx` comment states explicitly: any authenticated user can navigate directly to `/mission-discovery`, `/asset-mapping`, etc. regardless of lock state — locks only dim the row. |
| A Tour/walkthrough | **Exists, but disconnected from the live path** | `TourStepsScreen` only runs inside `/start` → `OnboardingFlow.tsx`, which nothing in the real `/` → `/zone-of-genius` signup funnel links to. Also: the Tour renders the FULL shell first, then narrates it — backwards from progressive disclosure. |
| "What's next" guidance | **Exists in 4 different half-forms, 2 live, 2 dormant** | `UpNext` (Playbook, live) and `ReadNextSectionButton` (paid deep-ZoG pages, live) both work. `myNextMoveLogic.ts`/`CoreLoopHome` and the `suggest-next-quest`/`suggest-main-quest` edge functions are built but **orphaned** — no nav links, no route in one case. |
| Mobile single-focus pattern | **Partially exists** | Mobile already toggles between a combined nav screen (pane 1+2) and a content-only screen — closer to Tom's ask than desktop, but pane 1 and 2 are still bundled together, and it's not onboarding-aware. |

**Bottom line: the infrastructure for "maximally simple at the start, opens up as you go" was already built once (Jan 2026) and partially rebuilt since (hide-don't-lock, `tmaComplete` gating) — it just never got connected end-to-end, and a hardcoded `false` currently defeats the one piece that would hide the shell at all.**

## 3. Proposed model — three stages, one path

```
STAGE 0 — GUIDED            STAGE 1 — OPENING UP         STAGE 2 — FULL SHELL
(pre-shell)                 (progressive reveal)          (established)
─────────────────           ─────────────────────         ────────────────
Single column.               Pane 1 appears, but only      Full 3-pane shell,
No rail, no pane 2.          the unlocked spaces show      as today.
One step visible.            (already works — hide-
"Step N of M."                don't-lock).
Explicit next-step CTA.       New spaces appear as
Locks ENFORCED, not           milestones clear (already
cosmetic.                     works — tmaComplete etc).
```

- **Stage 0 → Stage 1 trigger (recommended):** Top Talent complete (`topTalentComplete`, the same signal that already gates the ME/GROW space). This is the first real "win" — a good place for "boom, you're in."
- **Stage 1 → Stage 2:** no hard trigger needed — Stage 1 IS Stage 2 with fewer spaces visible; it already grows into the full shell automatically as `tmaComplete`, `activationDone`, etc. resolve. Nothing new to build here.
- Tom's "single homepage listing all journeys" isn't a new screen to design — it's what pane 1 already becomes once Stage 1 starts revealing spaces. The gap was never the homepage; it was the absence of Stage 0 in front of it.

## 4. Open decisions (need Sasha's call before implementation)

1. **Enforce JOURNEY locks during Stage 0, or leave them cosmetic?** Today a curious user can type `/mission-discovery` directly and skip ahead; the row just shows dim. "Hand hold... know exactly what the next step is" reads as wanting real enforcement during Stage 0 specifically (redirect back to the current step). Recommendation: enforce during Stage 0 only; leave Stage 2 exactly as free-roaming as it is today.
2. **Revive `myNextMoveLogic.ts`/`suggest-next-quest`, or extend the simpler proven `UpNext` pattern?** The dormant sequencer is smarter (multi-source recommendation engine) but unproven and references pre-GROW-rename naming. `UpNext` is simple, live, and already trusted in the Playbook. Recommendation: ship Stage 0 with the `UpNext`-style pattern first; revisit the smarter engine later if the simple version isn't enough.
3. **What happens to `/start` and the existing Tour?** They're not reachable from the live funnel today, so they're not actively hurting anyone — but they're also not nothing (real screens, real copy, real work). Options: (a) retire them once Stage 0 ships, since Stage 0 replaces their purpose; (b) repurpose `TourSpotlight` as an optional "show me around the full shell" moment offered at the Stage 1→2 boundary, for users who want a tour of what just opened up. Recommendation: (b) — reuse rather than discard, but move it to the point where there's actually something to tour.
4. **Does Stage 0 apply to the `?path=match` entry (MatchHero) the same way as the default build-path entry?** Funnel v2 already has two distinct JOURNEY heroes; Stage 0 needs to wrap both, not just one.

## 5. Recommended sequencing (pending sign-off)

| # | Step | Type | Depends on |
|---|---|---|---|
| 1 | Stop hardcoding `hideNav = false` in `ZoneOfGeniusEntry.tsx`; make `/` and `/zone-of-genius*` actually respect a real Stage-0 flag | Fix (small) | — |
| 2 | Build the Stage-0 layout: single column, "Step N of M," next-step CTA (extend `UpNext`'s pattern, don't rebuild) | Build (small-medium) | 1 |
| 3 | Wire the Stage 0 → 1 transition on `topTalentComplete` | Wiring | 1, 2 |
| 4 | Decide + implement enforced-vs-cosmetic locks for Stage 0 (open decision #1) | Build (small) | Sasha's call |
| 5 | Decide fate of `/start` + Tour (open decision #3); if repurposing, move `TourSpotlight` trigger to Stage 1→2 boundary | Build or retire | Sasha's call |
| 6 | QA: mobile Stage 0, i18n (en/ru/es), deep-link mid-flow behavior, match-path entry (open decision #4) | Test | 1-5 |

Nothing in this list has been touched yet. This spec is the planning deliverable; next step is Sasha confirming the 3-stage model and the 4 open decisions before any code changes.
