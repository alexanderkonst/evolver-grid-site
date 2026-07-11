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

## 4. Decisions (2026-07-10, Sasha, in conversation)

1. **JOURNEY locks during Stage 0.** Resolved via a concrete scenario, not the abstract framing (which didn't land — noted for future planning docs: lead with the scenario, not the policy question). Scenario: someone types `/mission-discovery` directly, or closes the tab mid-assessment, before finishing Top Talent. **Decision: they land on a one-line "let's finish this first" screen with a single button back to where they left off — no dead end, no half-built page.** Applies during Stage 0 only; Stage 2 stays exactly as free-roaming as it is today.
2. **Next-step guidance engine.** *"No, let's not revive any dormant engines, we stay clean... let's just build from scratch."* Checked `myNextMoveLogic.ts` (261 lines) directly: the sequencing SHAPE is fine (ordered priority list, one primary + one optional nudge) but the DATA is stale — pre-GROW-rename space names, dead routes (`/game/build` instead of `/ubb`, `/quality-of-life-map/assessment` instead of `/game/me/quality-of-life`). **Decision: build the next-step strip fresh, small, and deliberately simple — extending the already-live `UpNext` (Playbook) pattern, not this file.** `myNextMoveLogic.ts`, `CoreLoopHome.tsx`, and the `suggest-next-quest`/`suggest-main-quest` edge functions stay untouched — not deleted, not built on top of, just left alone unless a specific piece is worth pulling out on its own later.
3. **`/start` and the existing Tour.** Not explicitly re-confirmed this round — carrying forward the working recommendation (repurpose `TourSpotlight` as an optional "show me around" at the Stage 1→2 boundary, once there's actually something to tour) since it follows the same "look at it, take what's useful, otherwise don't touch it" principle Sasha just applied to decision #2. Flag this one for an explicit yes/no before building it.
4. **Every entry path.** *"Yes, we should apply this to every entry path."* Confirmed — Stage 0 wraps both the default build-path JOURNEY hero and the `?path=match` MatchHero. Same mechanics, different landing copy/hero underneath.

## 5. The walk-through — every touchpoint, screen by screen

Built and reviewed as a visual storyboard first (screen text, action, response, transformation, emotion per touchpoint) so decisions could be made against something concrete instead of abstractions. Condensed here for the durable record:

| # | Touchpoint | Stage | On screen (literal) | Action → response | Transformation | Target emotion |
|---|---|---|---|---|---|---|
| 1 | Landing | Before stage 0 | Wordmark, one headline ("Find your top talent."), one subhead, one button ("Start"). No rail, no pane 2, no music player, no chat bubble. | Clicks Start → straight into assessment step 1, no fork screen | None yet — the invitation | Curious, low-pressure |
| 2 | Assessment, steps 1-4 | Stage 0 | One question per screen, 4-dot progress, nothing else | Answers, taps Next ×4 | Small compounding commitments | Light momentum |
| 3 | Synthesis moment | Stage 0 | Full screen, brand mark pulsing, "Reading what you told us…" | Waits ~2-3s → flows into reveal | Deliberate anticipation, not just a spinner | Suspense |
| 4 | The reveal | Stage 0 | Their Top Talent sentence, large serif/gold, one supporting line, one button ("Save this") | Reads, clicks Save → email capture opens immediately | Now has something real and specific that didn't exist 5 min ago | Recognition, quiet pride |
| 5 | Claim it | Stage 0 | Light form over a dimmed, still-visible result. Headline: "Don't lose this." (reuses the existing ownership-first email-gate pattern) | Enters email, submits → account created silently, result attaches | Result goes from "something I saw" to "something I own" | Ownership |
| 6 | "Boom, you're in" | Transition | Full-screen, ~1.5s, no button. Rail slides in with exactly 2 icons (JOURNEY, ME). Pane 2 shows the guided path, item 1 already checked | Watches → lands on touchpoint 7 | Single-purpose tool becomes a system — but only 2 pieces, not 8 | Arrival, controlled expansion |
| 7 | Next-step strip | Stage 1 | Persistent single-line strip, pinned in pane 3: "Your next step: Discover your mission →" | Clicks strip or the highlighted pane-2 row → Mission Discovery | "What do I do now?" never needs asking | Clarity |
| 8 | Mission, then Assets | Stage 1 | Same one-thing-at-a-time pattern — these screens already exist | Completes both → JOURNEY rows check off, strip updates | Profile becomes 3-D: talent, mission, resources | Steady progress |
| 9 | Something new opens | Milestone | One quiet banner ("New: Collaborate, Build, and Grow are open") + 2-3 icons animate into the rail with a soft glow | Notices, keeps going | System got bigger BECAUSE of something they did | Earned expansion |
| 10 | Full shell | Stage 2 | Today's 3-pane experience, unchanged | Navigates freely | Arrived by building up to it, not being dropped into it | Mastery |

Full visual version (with per-card copy blocks and the concrete locks scenario) was reviewed live in this session — not re-attached here since artifacts aren't git-tracked; this table is the durable record of what was approved.

## 6. Recommended sequencing (pending sign-off)

| # | Step | Type | Depends on |
|---|---|---|---|
| 1 | Stop hardcoding `hideNav = false` in `ZoneOfGeniusEntry.tsx`; make `/` and `/zone-of-genius*` actually respect a real Stage-0 flag, for both entry paths (build + match) | Fix (small) | — |
| 2 | Build the Stage-0 layout per touchpoints 1-6 above (fresh components, no legacy reuse except the existing email-gate pattern at touchpoint 5) | Build (small-medium) | 1 |
| 3 | Build the next-step strip (touchpoint 7) fresh, extending `UpNext`'s pattern | Build (small) | 1, 2 |
| 4 | Wire the Stage 0 → 1 transition on `topTalentComplete`; build the "let's finish this first" redirect screen for out-of-order URL access during Stage 0 | Wiring + build (small) | 1, 2 |
| 5 | Build the milestone "something new opens" moment (touchpoint 9) | Build (small) | 3, 4 |
| 6 | Decide + build (or explicitly skip) the Tour repurposing (decision #3) | Build or retire — Sasha's call | 4 |
| 7 | QA: mobile Stage 0, i18n (en/ru/es), deep-link mid-flow behavior on both entry paths | Test | 1-6 |

Nothing in this list has been touched yet. This spec is the planning deliverable.
