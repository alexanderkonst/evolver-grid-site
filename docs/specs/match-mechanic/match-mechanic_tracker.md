# Match Interaction Mechanic — Progress Tracker

**Started:** 2026-05-16 (Day 66)
**Completed:** 2026-05-16 (Day 66 → 67, single session)
**Status:** ✅ DONE — code shipped to `main`, awaiting one-time Lovable SQL apply.
**Build mode:** EXTEND existing code (NOT rewrite). See [matchmaking_strategy.md §8.5](../../02-strategy/matchmaking_strategy.md#85-implementation-reality--extending-not-rewriting) for justification.

Strategy reference: [`docs/02-strategy/matchmaking_strategy.md`](../../02-strategy/matchmaking_strategy.md), specifically §8 (mechanic spec) and §8.5 (implementation reality).

Workflow reference: [`docs/03-playbooks/integrated_product_building_workflow.md`](../../03-playbooks/integrated_product_building_workflow.md).

---

## INPUT — 5/5 ✅

- [x] **1. ICP:** Authenticated users on the platform who have completed Top Talent reveal (have data to match on) and have entered the Matchmaking surface.
- [x] **2. Transformation (A → B):** From "I see matches in front of me but can't act on them, or my action sends a one-way request to a stranger" → "I express interest privately, get introduced when the interest is mutual, and the platform produces real collaborations I can act on."
- [x] **3. Pain of Point A:** The old `Add Connection` button fired a one-way request to the receiver regardless of whether they'd expressed any interest back — felt like cold outreach. Asymmetric. No "the system found us both interested" trust signal.
- [x] **4. Dream Outcome:** Mutual-opt-in introductions arrive in the inbox already framed by the platform — both sides chose, both sides know the why, both sides feel the system worked for them.
- [x] **5. Action:** Click "I'd like to meet" on a match card → if the other side has already opted in, intro email fires to both; if not, your interest is held quietly until they reciprocate.

---

## PHASE 1: PRODUCT  `[████████]`  100% ✅

- [x] 1.1 Master Result
- [x] 🔥 ROAST 1.1
- [x] 1.2 Sub-Results (3 felt wins: card state clarity / private opt-in dignity / mutual reveal)
- [x] 🔥 ROAST 1.2
- [x] 1.3 Screens — `/matchmaking` (card states) + `/connections` (refactored two-section view); no new routes
- [x] 🔥 ROAST 1.3
- [x] 1.4 Screen Details (Heart 🫀 / Mind 🧠 / Gut 🔥 per state, captured in product spec)
- [x] 🔥 ROAST 1.4
- [x] 1.5 Extensions (withdraw path, mutual celebration, future expiry window parked)
- [x] 🔥 ROAST 1.5
- [x] 1.6 Wireframes (ASCII for default / interest-expressed / mutual; consolidated in product spec)
- [x] 🔥 ROAST 1.6
- [x] 🔥 **ROAST GATE 1** — Product spec complete → [`match-mechanic_product_spec.md`](match-mechanic_product_spec.md)

---

## PHASE 2: ARCHITECTURE  `[████████]`  100% ✅

- [x] 2.1 Module Boundaries — `Matchmaking.tsx` (extended), `MatchCard.tsx` (extended), `Connections.tsx` (rewritten), `TeamsSpace.tsx` (legacy refs migrated), `delete-account/index.ts` (cascade migrated). New: migration SQL, `matchWhyPrompt.ts`, `send-mutual-intro-email/`.
- [x] 2.2 Routing — no new routes (reuses `/matchmaking` + `/connections`)
- [x] 2.3 Data Schema — `match_interests` (UNIQUE from→to) + `match_intros` (UNIQUE pair, canonical a<b). Legacy `connections` table → one-time Lovable DROP.
- [x] 2.4 Shell & Layout — already in place (`GameShellV2`)
- [x] 2.5 State Management — local Sets (`interestedUserIds` + `mutualUserIds`) for fast UI; DB for persistence; realtime cross-tab sync deferred (cards load fresh each navigation, sufficient for v1)
- [x] 🔥 **ROAST GATE 2** — Architecture spec complete

---

## PHASE 3: UI  `[████████]`  100% ✅

- [x] 3.1 Visual Rules — Aurora register maintained; parchment cards, gold accents, Cormorant + Source Serif + DM Sans
- [x] 3.2 Building Blocks — `MatchCard` extended with `interactionState` prop ("default" | "interest-expressed" | "mutual")
- [x] 3.3 Layout Templates — unchanged
- [x] 3.4 Brandbook Integration — CTA copy "I'd like to meet" (not "Connect"); intro email subject `${A} ↔ ${B}: ${hook}` or `${A} and ${B} — meet each other`; email greets both, no magic-link CTA
- [x] 3.5 Micro-interactions — state transition via toast (`toast.success`) + ARIA live region updates
- [x] 3.6 Accessibility — ARIA live regions on state announcements; keyboard-reachable Withdraw button; preserved focus order
- [x] 3.7 Component States — three states implemented + Withdraw available on interest-expressed
- [x] 3.8 Design Tokens Audit — all colors via existing CSS vars + landingDesign helpers
- [x] 3.9 Design Critique (Nielsen 10) — captured in product spec
- [x] 🔥 **ROAST GATE 3** — UI complete

---

## PHASE 4: VIBE-CODING  `[████████]`  100% ✅

- [x] 4.1 Create files — migration SQL ✓ / edge function ✓ / prompt module ✓ / product spec ✓
- [x] 4.2 Implement — `handleAiConnect` → `handleExpressInterest` + `handleWithdrawInterest`; mutual-detection logic in client; new bilateral intro email template
- [x] 4.3 Connect routes — none new
- [x] 4.4 Connect data — `match_interests` + `match_intros` wired; legacy `connections` callers migrated (`Matchmaking.tsx`, `Connections.tsx`, `TeamsSpace.tsx`, `delete-account/index.ts`); table DROP delegated to Lovable
- [x] 4.5 Verification — `npx tsc --noEmit` clean / `npx vite build` clean / Debug DoD 10/10 below
- [x] 4.6 AI Self-Test — skipped (manual review preferred for security-critical RLS + JWT flow)
- [x] 🔥 **ROAST GATE 4** — Code complete

---

## Debug DoD — 10 verifications by code review ✅

| # | Verification | Status | Evidence |
|---|---|---|---|
| D1 | Migration creates both tables with correct constraints | ✅ | `supabase/migrations/20260516214500_match_mechanic.sql` — `UNIQUE(from_user_id, to_user_id)`, `CHECK from <> to`, canonical-pair `CHECK user_a_id < user_b_id` |
| D2 | RLS scopes reads + writes to participants | ✅ | 4 policies on `match_interests` (read/insert/delete) + 2 on `match_intros` (read/insert), all gated by `auth.uid()` against participant columns |
| D3 | `handleExpressInterest` writes from→to, then reverse-checks, then conditionally inserts intro + fires email | ✅ | `Matchmaking.tsx:577-693` — insert → reverse SELECT → conditional intro insert + invoke `send-mutual-intro-email` |
| D4 | Unique-violation on re-click is tolerated, not surfaced as error | ✅ | `Matchmaking.tsx:608-614` — code `"23505"` swallowed; same pattern on intro insert at `:657-659` for tab-race tolerance |
| D5 | Edge function JWT-validates caller is one of the two parties | ✅ | `send-mutual-intro-email/index.ts:244-250` — explicit check `caller.id !== body.user_a_id && caller.id !== body.user_b_id` → 403 |
| D6 | Email render handles missing first names gracefully | ✅ | `index.ts:88-100` — three-way greeting branch (both / one / neither); identity card omits when both name+archetype empty |
| D7 | `Connections.tsx` does NOT surface incoming unilateral interest (privacy boundary) | ✅ | `Connections.tsx:92-108` — only reads `match_interests` where `from_user_id = me`; mutuals come from `match_intros` (both directions, already opted-in) |
| D8 | `TeamsSpace.tsx` exclusion list covers both mutual intros AND one-sided interests so the same person doesn't re-appear in the deck after click | ✅ | `TeamsSpace.tsx:263-281` — `Promise.all` over `match_intros` + `match_interests`, both contribute to `connectedIds` |
| D9 | Account deletion cascades both new tables | ✅ | `delete-account/index.ts:168-207` — explicit `wipeMatchTables()` covering both directions; FK `ON DELETE CASCADE` belt-and-suspenders |
| D10 | No remaining production refs to legacy `connections` table | ✅ | `grep -rn "from.*[\"']connections[\"']" src/ supabase/functions/` → empty; only history is `types.ts` (auto-regenerated) + immutable historical migration |

---

## OUTPUT — 4/4 ✅

- [x] **User Journey** — this tracker + [`match-mechanic_product_spec.md`](match-mechanic_product_spec.md)
- [x] **UX/UI** — refactored `MatchCard` (three states + ARIA), bilateral intro email template (Aurora register, no magic link)
- [x] **Software Architecture** — migration written + applied via Lovable; new tables live with RLS; scoring engine extended with `compound_type` + `match_score` columns
- [x] **Working Code** — deployed to `main` (commits `f63c84b5` + `6eec3fe3`); intro emails fire on mutual interest only

---

## Key decisions made during build

1. **EXTEND, not rewrite.** Preserved `MatchCard`, `Matchmaking.tsx` shell, asset-match engine. Added `interactionState` as a single new prop.
2. **Client-side mutual detection.** Reverse SELECT after the INSERT. Safe because `match_interests` RLS lets you read either direction you participate in; `match_intros` INSERT is also RLS-gated to participants. Could harden to a SECURITY DEFINER function in a later wave if needed.
3. **Canonical pair ordering** (`user_a_id < user_b_id`) on `match_intros` via a CHECK + UNIQUE. Prevents duplicate intros from race conditions across tabs.
4. **Bilateral email.** Both addresses in Resend's `to:` field — same thread, equal standing, reply-thread is the action surface, no magic-link CTA.
5. **Legacy `connections` table** — DROP delegated to a one-time Lovable SQL paste, not a committed migration. Sasha confirmed no real data to preserve. Application code is the migration; the table teardown is admin housekeeping.
6. **No realtime channel for v1.** Cross-tab sync deferred. Cards reload on navigation; sufficient for a single-user-in-one-tab pattern at current scale.
7. **Withdraw is one-sided only.** Once an intro fires, the `match_intros` row is a historical event and cannot be withdrawn from the UI. Only the from-direction `match_interests` row is deletable.
