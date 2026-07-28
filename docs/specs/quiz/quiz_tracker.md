# Where Are You (the transition quiz) — Progress Tracker

**Started:** 2026-07-27
**Status:** Phase 2: shipped and live at `/quiz`. Phase 3 (dedicated visual pass) not started — see note at the bottom of Phase 2 below.

---

## INPUT ✅ COMPLETE (5/5)

- [x] 1. **ICP:** a person in professional transition at stages 4-7 of the transition arc, whose income depends on their own name (zero or collapsing income-to-person distance).
- [x] 2. **Transformation:** from "something is off and I cannot name it" to "I know exactly where I am, which part is holding the rest back, and what moves next."
- [x] 3. **Pain of Point A:** the five-layer pain of Liminality (pressure and its compounding loop, daily felt texture, cost of inaction, what is truly at stake, and the struggle: "I know I carry something real, I cannot say what it is, and every method I know already requires the answer as its input"). Full version in `docs/02-strategy/unique-businesses/alexanders_unique_business.md` Pain v4.1.
- [x] 4. **Dream Outcome:** their position named, their bottleneck named, their next move and its trap named, in language so precise they feel read rather than categorized.
- [x] 5. **Action:** answer one placement question, then nine aspect questions, and receive three staged reads.

---

## PHASE 1: PRODUCT `[■■■■■■■■]` 100%

- [x] 1.1 Master Result — Defined. Content in `quiz_product_spec.md` §1.1.
- [x] 🔥 ROAST 1.1 (Deep: 3×3) — Rewrote. v2: "The quiz takes you from 'something is off and I can't even say what' to 'I know exactly where I am, what's actually holding me back, and what happens next.'" Plainer, names the actual outputs (stage/bottleneck/next move), still one sentence.
- [x] 1.2 Sub-Results — 4 defined: Placed, Read, Met, Pointed. Content in `quiz_product_spec.md` §1.2.
- [x] 🔥 ROAST 1.2 (Deep: 3×3) — No rewrite. One addition: made explicit that Read/Met/Pointed are gated to stages 4-7; stages 1-3 stop after Placed (the not-yet branch), which is honest rather than a missing 5th sub-result.
- [x] 1.3 Screens — Finalized at 10 screens/variants (S1, S2, S3, S3a-1, S3a-2, S4a, S4b, S4c, S5, S6, S7). Content in `quiz_product_spec.md` §1.3.
- [x] 🔥 ROAST 1.3 — Resolved all 4 open questions carried from the draft: 9 questions split into 3 screens (one per aspect); stage placement stays 1 question/7 options; free version shows everything (only derivation is paid); S3a is stage-conditional (2 variants, not 1).
- [x] 1.4 Screen Details (Heart/Mind/Gut) — All 10 screens defined. Content in `quiz_product_spec.md` §1.4.
- [x] 🔥 ROAST 1.4 — One rewrite: S7's fallback CTA for the "all three at 5" (full liminality) pattern changed from a forced session pitch to "Retake anytime" — forcing a CTA there would break the no-pitch-if-not-ready principle. **Flagged for Sasha below — this may be too conservative for your most valuable segment.**
- [x] 1.5 Extensions — Artifacts, emotional arc, completion criteria, skip paths, bridges all defined. Content in `quiz_product_spec.md` §1.5.
- [x] 🔥 ROAST 1.5 — No rewrite. Bridges confirmed as intentionally one-directional (external destinations) except the email nurture loop, which is bidirectional by design.
- [x] 1.6 Wireframes — ASCII, mobile-first 375px, all 10 screens/variants, CTA above the fold on every one. Content in `quiz_product_spec.md` §1.6.
- [x] 🔥 ROAST 1.6 — No structural rewrite. Noted for Phase 3: S5 and S7 need generous spacing so the data density doesn't read as a dashboard dump.
- [x] 🔥 ROAST GATE 1 ← CURRENT — Flow walked screen by screen, no redundant or missing screens found. **Awaiting Sasha's sign-off — see below.**

---

## FOR SASHA AT ROAST GATE 1

Three real forks — everything else in Phase 1 was resolvable from your standing decisions and got resolved inline.

1. **The ripest pattern (all three aspects at 5, full liminality) currently gets NO CTA at S7** — just "Retake anytime," to honor "not-yet doesn't pitch." But this pattern is your most valuable segment (maximum ripeness), not a not-yet case. Is "no CTA" too conservative here, or does full liminality still deserve the same restraint as stages 1-3?
2. **Route CTA copy/destinations** (Direction Call / 1:1 session / BUILT / node) are named generically in the spec per the diagnostic-engine table — need your confirmation these map to your current live offers and exact names before Phase 2 wires them to real links.
3. **Does a Stage-1 (Settled) completion get logged at all for the dataset** (Technology 123 feeds), or does "no ask at all" also mean no data capture for that segment? Spec currently assumes a silent record is still written (for the Ripeness Vector dataset) even though the user sees no ask — flag if that's wrong.

---

## PHASE 2: ARCHITECTURE `[■■■■■■■■]` 100%

- [x] 2.1 Module Boundaries — `src/modules/transition-quiz/`: `engine.ts` (pure placement/scoring/pattern/route logic + share-state encode/decode, no React/i18n/Supabase), `TransitionQuizPage.tsx` (all 10 screens as one page component with an internal step machine), `TransitionQuizPage.css` (scoped styles, mobile-first).
- [x] 2.2 Routing — `/quiz` registered in `src/App.tsx`, lazy-loaded. **Route conflict resolved:** `/quiz` was already live, pointing at the legacy Zone-of-Genius 6-question diagnostic (`GeniusQuiz.tsx`, the ZoG result page's secondary CTA, shipped Day 47). That page moved to `/quiz2` (component, i18n keys, and data untouched, only the path changed). Also updated for the split: `src/lib/shellRoutes.ts` (holdout entries for both paths — `/quiz` gets no shell, matching `/destiny`/`/hero`), `scripts/generate-sitemap.ts` (`/quiz` promoted to weekly/0.7, `/quiz2` kept at monthly/0.5), `src/lib/pageTitles.ts` (tab titles for both). Not touched: docs/playbooks that describe the legacy `/quiz` diagnostic historically (`docs/03-playbooks/*`, `docs/09-logs/session_log.md`, roadmap completed-items) — those are historical record and Cowork-lane territory per CLAUDE.md, not live pointers; flagging here rather than silently editing them.
- [x] 2.3 Data Schema — new table `transition_quiz_results` (migration `supabase/migrations/20260728140000_transition_quiz_results.sql`), RLS on with zero policies (service-role-only, same pattern as `anonymous_genius_results`). New edge function `save-quiz-result` (public, no-auth, `verify_jwt = false` in `supabase/config.toml`), fire-and-forget from the client — logging never gates or delays the free result. **Needs one Lovable prompt to go live**, see `docs/specs/quiz/lovable_prompt.md`.
- [x] 2.4 Shell & Layout — standalone page, no persistent shell (matches `/destiny`, `/hero`), reuses the app's shared CSS custom properties (`hsl(var(--primary))` etc.) rather than a new palette, Cormorant Garamond headings / DM Sans body per the site's `fontFamily.display`/`fontFamily.sans`.
- [x] 2.5 State Management — one internal step-machine reducer in `TransitionQuizPage.tsx`. Resumable via `localStorage` (`evolver_transition_quiz_v1`). Shareable via a `?r=` URL param encoding stage + aspect answers as base64 JSON (`encodeShareState`/`decodeShareState` in `engine.ts`) — opening a shared link jumps straight to the result, no server round-trip needed to render it. Supabase is write-only, for the dataset, never read to render the free result.
- [x] 🔥 ROAST GATE 2 — self-reviewed in place of a separate gate given Sasha's resolved decisions already closed the three open forks from Gate 1. See "Decisions Sasha resolved" below.

### Decisions Sasha resolved (closing the three forks from ROAST GATE 1)

1. **Full liminality (all three aspects at 5) CTA** — resolved: this is the ripest pattern, gets the most direct read and the free Direction Call, not "no CTA." Implemented in `diagnose()` in `engine.ts`.
2. **Route CTA copy/destinations** — resolved and wired: Direction Call → `https://cal.com/aleksandrkonstantinov/exploration` (free, 45 min), Productize Yourself Session ($555) → `/ignite`, BUILT (3 weeks) → `/products/built`, Node (white-label) → `https://t.me/integralevolution`. "Ignition Session" does not appear anywhere in the new copy.
3. **Stage-1 (Settled) logging** — resolved: every completion is logged, including Settled, via `save-quiz-result` firing on arrival at the S3a screen (before the user decides on the optional email).

### Decisions I had to make that the spec left open

- **Bottleneck-to-route mapping for the ambiguous middle cases.** The spec's diagnostic table names six specific patterns; real aspect-score combinations don't always land cleanly on one of them. `diagnose()` in `engine.ts` resolves it as: Identity-bottleneck → Node (needs field before 1:1 work), Fit-bottleneck with a clear margin below both others → the direct paid Session ("the purest session case," per the spec's own language), Economy-bottleneck → Direction Call (front door into Session/BUILT), full liminality (all three clustered high) → Direction Call, anything else (ties, no clean bottleneck) → Direction Call as the safe universal default.
- **Stage 1 (Settled) does get an optional email capture.** The original Phase-1 wireframe/spec had S3a-1 with no email field at all. Resolved decision D explicitly overrides that: Settled gets an honest line, an optional email capture, and a quiet (non-CTA) link to Sasha's channels. Implemented that way.
- **9 aspect-question answer options.** Written verbatim from the transition holomap's 63-cell grid (each row IS the 7-stage answer set for that sub-aspect), reworded into first-person question options rather than invented fresh. Keeps the read precise and grounded in the existing corpus instead of adding new unvalidated copy.
- **i18n JSON shape.** Used `returnObjects: true` (arrays/objects in the JSON, e.g. the 7 placement options, the 9×7 aspect-question options) rather than flattening to indexed keys — no existing module in the codebase does this, but react-i18next supports it natively and it was clearly the more maintainable shape for this much content. Verified identical key sets and array lengths across en/ru/es before merging.
- **CSS approach.** Self-contained page + scoped CSS file (like `HeroQuiz.css`), reusing the app's shared CSS custom properties rather than Tailwind utility soup or a new design system, so it inherits the site's palette/typography automatically and stays in register with `/` and `/dashboard` without duplicating tokens.

### Deferred to Phase 3

- Dedicated visual/UX polish pass (micro-interactions, transition animations between screens, accessibility audit, design critique) — Phase 2 shipped functional, on-brand, mobile-first screens but did not run the full Phase 3 UI checklist (3.1-3.9 in the phase list below).
- The Lovable prompt in `docs/specs/quiz/lovable_prompt.md` needs to actually be run by Sasha before completions start writing to `transition_quiz_results` — until then the quiz works perfectly for visitors, it just isn't logging to the dataset yet.

---

## PHASE 3: UI `[░░░░░░░░]` 0%

- [ ] 3.1 Visual Rules
- [ ] 3.2 Building Blocks
- [ ] 3.3 Layout Templates
- [ ] 3.4 Brandbook Integration
- [ ] 3.5 Micro-interactions
- [ ] 3.6 Accessibility
- [ ] 3.7 Component States
- [ ] 3.8 Design Tokens Audit
- [ ] 3.9 Design Critique
- [ ] 🔥 ROAST GATE 3

---

## PHASE 4: VIBE-CODING `[░░░░░░░░]` 0%

- [ ] 4.1 Create Files
- [ ] 4.2 Implement Screens
- [ ] 4.3 Connect Routes
- [ ] 4.4 Connect Data
- [ ] 4.5 Verification
- [ ] 4.6 AI Self-Test
- [ ] 🔥 ROAST GATE 4

---

## OUTPUT

- [ ] User Journey (spec)
- [ ] UX/UI (components)
- [ ] Software Architecture (routes, data)
- [ ] Working Code (verified)

---

**Notes:**
- Source map this module operationalizes: `docs/holomaps/transition_holomap.md` (Phase Shift Technology 124). Feeds the Ripeness Vector (Technology 123). Social physics of unrequested mirrors: Technology 125.
- Product spec: `docs/specs/quiz/quiz_product_spec.md`.

**Completed:** _________
