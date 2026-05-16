# Match Interaction Mechanic — Progress Tracker

**Started:** 2026-05-16 (Day 66)
**Status:** PRE-PHASE-1 — awaiting DoD sign-off
**Build mode:** EXTEND existing code (NOT rewrite). See [matchmaking_strategy.md §8.5](../../02-strategy/matchmaking_strategy.md#85-implementation-reality--extending-not-rewriting) for justification.

Strategy reference: [`docs/02-strategy/matchmaking_strategy.md`](../../02-strategy/matchmaking_strategy.md), specifically §8 (mechanic spec) and §8.5 (implementation reality).

Workflow reference: [`docs/03-playbooks/integrated_product_building_workflow.md`](../../03-playbooks/integrated_product_building_workflow.md).

---

## INPUT — 5/5 required before Phase 1

- [ ] **1. ICP:** Authenticated users on the platform who have completed Top Talent reveal (have data to match on) and have entered the Matchmaking surface.
- [ ] **2. Transformation (A → B):** From "I see matches in front of me but can't act on them, or my action sends a one-way request to a stranger" → "I express interest privately, get introduced when the interest is mutual, and the platform produces real collaborations I can act on."
- [ ] **3. Pain of Point A:** The current Connect button fires an email to the receiver regardless of whether they've expressed any interest back — feels like cold outreach. Asymmetric. No "the system found us both interested" trust signal.
- [ ] **4. Dream Outcome:** Mutual-opt-in introductions arrive in the inbox already framed by the platform — both sides chose, both sides know the why, both sides feel the system worked for them.
- [ ] **5. Action:** Click "I'd like to meet" on a match card → if the other side has already opted in, intro email fires to both; if not, your interest is held quietly until they reciprocate (or expires after some window).

---

## PHASE 1: PRODUCT  `[░░░░░░░░]`  0%

- [ ] 1.1 Master Result
- [ ] 🔥 ROAST 1.1 (Deep: 3 cycles × 3 sub-cycles)
- [ ] 1.2 Sub-Results (3-7 felt wins)
- [ ] 🔥 ROAST 1.2 (Deep)
- [ ] 1.3 Screens (which existing screens change, which states are new)
- [ ] 🔥 ROAST 1.3
- [ ] 1.4 Screen Details (Heart 🫀, Mind 🧠, Gut 🔥 per screen)
- [ ] 🔥 ROAST 1.4
- [ ] 1.5 Extensions (artifacts, completion, skip paths, bridges)
- [ ] 🔥 ROAST 1.5
- [ ] 1.6 Wireframes (the MatchCard's new states + any new sub-page)
- [ ] 🔥 ROAST 1.6
- [ ] 🔥 ROAST GATE 1 — Product spec complete

---

## PHASE 2: ARCHITECTURE  `[░░░░░░░░]`  0%

- [ ] 2.1 Module Boundaries — what extends, what's new, what stays untouched
- [ ] 2.2 Routing — no new routes expected (reuse `/matchmaking`)
- [ ] 2.3 Data Schema — `match_interests` + `match_intros` tables; decision on legacy `connections` table
- [ ] 2.4 Shell & Layout — already in place
- [ ] 2.5 State Management — local state on card; DB for persistence; cross-tab sync via realtime channel?
- [ ] 🔥 ROAST GATE 2 — Architecture spec complete

---

## PHASE 3: UI  `[░░░░░░░░]`  0%

- [ ] 3.1 Visual Rules — Aurora already applied, audit no rogue tokens
- [ ] 3.2 Building Blocks — existing MatchCard extended; new state indicators
- [ ] 3.3 Layout Templates — existing
- [ ] 3.4 Brandbook Integration — voice for "I'd like to meet" CTA + intro email copy
- [ ] 3.5 Micro-interactions — state transition animations on the card (interest expressed, mutual detected)
- [ ] 3.6 Accessibility — WCAG audit on new CTAs and state indicators
- [ ] 3.7 Component States — all 9 states for the modified card (especially: "interest expressed," "mutual interest — intro sent," "they expressed first")
- [ ] 3.8 Design Tokens Audit
- [ ] 3.9 Design Critique (Nielsen 10)
- [ ] 🔥 ROAST GATE 3 — UI complete

---

## PHASE 4: VIBE-CODING  `[░░░░░░░░]`  0%

- [ ] 4.1 Create files — migration SQL, new edge function (or extend existing), prompt template
- [ ] 4.2 Implement — refactor `handleAiConnect` → `handleExpressInterest`; new mutual-detection logic; new intro email template
- [ ] 4.3 Connect routes — none new
- [ ] 4.4 Connect data — wire new tables; deprecate/coexist decision on `connections`
- [ ] 4.5 Verification — build clean, TS clean, manual smoke test
- [ ] 4.6 AI Self-Test (optional)
- [ ] 🔥 ROAST GATE 4 — Code complete

---

## OUTPUT — 4/4 required for "done"

- [ ] User Journey (this tracker + product spec)
- [ ] UX/UI (refactored MatchCard, intro email template)
- [ ] Software Architecture (migration applied, new tables live, scoring engine extended with compound metadata)
- [ ] Working Code (deployed, intro emails fire on mutual interest only)

---

**Completed:** _________

---

## Key decisions made during build (log as they land)

_(append as Phase 1/2/3/4 progresses; this is the audit trail for v3 of the strategy doc when it lands)_
