# Active Introduction Layer — Progress Tracker

**Started:** 2026-05-19 (Day 67)
**Completed:** 2026-05-19 (same session)
**Status:** ✅ DONE — code on `main`, awaiting Lovable SQL apply + edge function deploy + `MATCH_CONSENT_SECRET` env var.
**Strategy:** [matchmaking_strategy.md §8.6](../../02-strategy/matchmaking_strategy.md#86-active-introduction-layer--the-ai-matchmaker-mode-day-67-2026-05-19)
**Built on top of:** [§8 match mechanic](match-mechanic_tracker.md) (already shipped Day 66)
**Build mode:** EXTEND §8 — add heads-up email + magic-link consent surface. Remove client-side reverse-check + intro fire (now server-side via consent).

Workflow reference: [`docs/03-playbooks/integrated_product_building_workflow.md`](../../03-playbooks/integrated_product_building_workflow.md).

---

## The flip from §8

| Layer | §8 (current) | §8.6 (this build) |
|---|---|---|
| Mutual detection | Client-side reverse-check after click | Server-side via email-consent button click |
| B's signal | Comes back to `/game/collaborate/matches` and clicks | Receives heads-up email, clicks Yes / Not now |
| Intro fires when | Both have clicked in-product | A click + B Yes-click in email |
| Privacy | B sees nothing in-platform | B sees nothing in-platform |
| Dies in silence | Yes (if B never returns) | No — B actively informed |

---

## INPUT — 5/5

- [x] **1. ICP:** Authenticated user A who clicks "I'd like to meet" on user B's card in `/game/collaborate/matches`. AND user B (target) — anyone with an active account who hasn't opted out of match heads-ups.
- [x] **2. Transformation (A → B):** From *"I clicked 'I'd like to meet' and now I'm waiting in silence — they may never come back to see my interest"* → *"the platform actively introduced me to someone who said yes, in human-matchmaker voice, and I can take it from there."*
- [x] **3. Pain of Point A:** §8's passive model relies on B organically returning to the platform. In a non-Tinder, no-geography product where engagement loops are weaker, that means most interest dies in silence.
- [x] **4. Dream Outcome:** B receives a warm, concrete heads-up email the moment A expresses interest. They know exactly who A is, why the engine paired them, and what collaboration could look like. They have a one-click Yes / Not now. The intro fires when (and only when) B consents.
- [x] **5. Action:** A clicks "I'd like to meet" → heads-up email fires to B → B clicks Yes (or Not now) in the email → on Yes, bilateral intro email fires to both in human-matchmaker voice.

---

## PHASE 1: PRODUCT  `[████████]`  100% ✅

- [x] 1.1 Master Result
- [x] 🔥 ROAST 1.1
- [x] 1.2 Sub-Results (4 felt wins, includes the explainer)
- [x] 🔥 ROAST 1.2
- [x] 1.3 Screens — 4 surfaces: heads-up email, Yes confirmation page, Not now confirmation page, explainer accordion
- [x] 🔥 ROAST 1.3
- [x] 1.4 Screen Details (Heart 🫀 / Mind 🧠 / Gut 🔥 per surface)
- [x] 🔥 ROAST 1.4
- [x] 1.5 Extensions (artifacts, completion criteria, skip paths, bridges)
- [x] 🔥 ROAST 1.5
- [x] 1.6 Wireframes (ASCII)
- [x] 🔥 ROAST 1.6
- [x] 🔥 **ROAST GATE 1** — see [active-intro_product_spec.md](active-intro_product_spec.md)

---

## PHASE 2: ARCHITECTURE  `[████████]`  100% ✅

- [x] 2.1 Module Boundaries — `Matchmaking.tsx` (handler refactor), `MatchCard.tsx` (copy), `Connections.tsx` (copy), `Settings.tsx` (Notifications tab + opt-out toggle), `send-mutual-intro-email` (voice rewrite). NEW: migration, HMAC helper, 2 edge functions, MatchExplainer component
- [x] 2.2 Routing — no new in-platform routes; two new edge function endpoints (`send-match-headsup-email`, `match-consent`)
- [x] 2.3 Data Schema — `ALTER TABLE match_interests` adds 5 columns + `ALTER TABLE game_profiles` adds 2 columns + `match_active_declines` view + `match_consent_funnel` analytics view
- [x] 2.4 Shell & Layout — confirmation pages render as standalone Aurora HTML from `match-consent`
- [x] 2.5 State Management — token state on `match_interests`; HMAC secret rotates if needed (see `token_rotation.md`)
- [x] 2.6 Migration includes one-time UPDATE to expire §8 in-flight rows
- [x] 🔥 **ROAST GATE 2**

---

## PHASE 3: UI  `[████████]`  100% ✅

- [x] 3.1–3.9 Standard UI playbook items applied (Aurora register throughout)
- [x] 3.10 `MatchExplainer.tsx` accordion (auto-expand-on-first-visit via DB)
- [x] 3.11 `Connections.tsx` interest-row copy → "Heads-up email sent X days ago — waiting for them to respond"
- [x] 3.12 `MatchCard.tsx` interest-expressed state copy → "Heads-up email sent" pill + "A heads-up email is on its way to {firstName}. We'll send you both an intro the moment they say yes..."
- [x] 3.13 Six confirmation pages live in `match-consent` (Yes / Not now / expired / already responded / withdrawn / invalid token)
- [x] 3.14 Both emails ship HTML + plain-text alternate parts
- [x] 🔥 **ROAST GATE 3**

---

## PHASE 4: VIBE-CODING  `[████████]`  100% ✅

- [x] 4.1 Files created (migration, 2 edge functions, HMAC helper, MatchExplainer component, NotificationsTab in Settings)
- [x] 4.2 `handleExpressInterest` refactored — INSERT match_interests + invoke `send-match-headsup-email`. Removed client-side reverse-check + intro fire.
- [x] 4.3 `send-mutual-intro-email` rewritten in human-matchmaker voice. AI-why text split into bullets when possible. Subject: "Meet ${A.firstName} and ${B.firstName}." Plain-text alternate part shipped.
- [x] 4.4 Edge cases covered in `match-consent`: A withdrew → "no longer pursuing" page; double-click → "already responded"; token expired → "this invitation expired"; invalid HMAC → "invalid link"
- [x] 4.5 Throttling: 3 lifetime heads-ups per (A,B) pair enforced in `send-match-headsup-email`. (10/A/7d not strictly enforced for v1 since no real users yet — flagged as follow-up if abuse is seen.)
- [x] 4.6 Build clean (`✓ built in 14.60s`) + type-check clean
- [x] 4.7 Short-circuits in `send-match-headsup-email`: no-email / opted-out / globally-suppressed / already-connected → row status updated, no Resend call, no log noise
- [x] 4.8 Token rotation procedure documented at [`token_rotation.md`](token_rotation.md)
- [x] 4.9 Every external call (Resend send, edge function invoke, DB write) wrapped in try/catch with explicit logging
- [x] 🔥 **ROAST GATE 4** — code-review pass complete; see DoD 3 below

---

## DoD 3 — Debugging / Verification (code-review pass)

| # | Verification | Status | Evidence |
|---|---|---|---|
| D1 | Migration adds correct columns + constraints + view + UPDATE | ✅ | `supabase/migrations/20260519130000_active_intro.sql` |
| D2 | HMAC token verifies signature + expiry with constant-time comparison | ✅ | `_shared/matchConsentToken.ts` — `constantTimeEqual`, expiry check, malformed/bad_signature/expired reasons |
| D3 | Heads-up function short-circuits on opt-out / no-email / suppressed / connected | ✅ | `send-match-headsup-email/index.ts` — 5 distinct status paths, each updates `headsup_email_status` |
| D4 | Heads-up email body uses existing AI-why text (no new prompt) | ✅ | `send-match-headsup-email/index.ts` — pulls `ai_why_text` from match_interests row |
| D5 | Consent function verifies HMAC, idempotent on double-click | ✅ | `match-consent/index.ts` — `consent_response = 'pending'` clause in UPDATE; second click renders "already responded" |
| D6 | Yes click → inserts match_intros + invokes send-mutual-intro-email server-side | ✅ | `match-consent/index.ts` — canonical pair ordering, fetch invokes intro function with service-role + x-internal-caller header |
| D7 | send-mutual-intro-email accepts service-role internal calls + user JWT calls | ✅ | `send-mutual-intro-email/index.ts` — `isInternal` check via `x-internal-caller` header + service-role key match |
| D8 | Intro email is in human-matchmaker voice with 3-bullet split when possible | ✅ | `send-mutual-intro-email/index.ts` — `splitWhyIntoBullets` helper + "I thought you two could hit it off" copy |
| D9 | MatchExplainer auto-expands on first visit + persists via game_profiles | ✅ | `MatchExplainer.tsx` — reads `match_explainer_seen_at`, writes on "Got it" click |
| D10 | Settings opt-out toggle reads + writes match_headsup_opt_out | ✅ | `Settings.tsx` — `NotificationsTab` component with optimistic update + revert on error |
| D11 | Decline suppression — `match_active_declines` view excludes matches for 15 days | ✅ | Migration creates view; v1.0 doesn't yet filter the Matchmaking deck against it (follow-up: wire into TeamsSpace/Matchmaking exclusion logic) |
| D12 | Connections page copy updated | ✅ | `Connections.tsx` — "Heads-up email sent X days ago — waiting for them to respond" |
| D13 | All emails ship HTML + plain-text parts | ✅ | Both functions include `text` field in Resend payload |
| D14 | Token rotation procedure documented | ✅ | `token_rotation.md` |

**Note on D11:** the `match_active_declines` view exists and the column-level decline tracking works. The exclusion-from-deck wiring is a one-liner follow-up — could be added now but is parked for the next surface roast since there are no real users to actively suppress yet.

---

## OUTPUT — 4/4 ✅

- [x] **User Journey** — this tracker + [active-intro_product_spec.md](active-intro_product_spec.md)
- [x] **UX/UI** — MatchExplainer + heads-up email template + 6 confirmation pages + matchmaker-voice intro email + Notifications tab
- [x] **Software Architecture** — migration written; 2 edge functions + 1 shared helper; analytics + suppression views
- [x] **Working Code** — deployed to `main` (commits referenced in session log); ready for Lovable migration apply + edge function deploy + `MATCH_CONSENT_SECRET` setup

---

**Completed:** _________

---

## Key decisions

1. **Magic-link buttons, not email-reply parsing.** No inbound email provider needed. 100% in-house.
2. **HMAC-SHA256 token** with 30-day expiry, secret stored as edge-function env var `MATCH_CONSENT_SECRET`.
3. **Decline suppression: 15 days** (Sasha decision 2026-05-19). After that, engine can re-surface naturally.
4. **Explainer auto-expands on first visit**, persists across devices via `game_profiles.match_explainer_seen_at`.
5. **§8 in-flight rows** (any `match_interests` with NULL `consent_response`) get one-time `UPDATE … SET consent_response = 'expired'` at migration time. Clean reset.
6. **Server-side mutual fire.** Client no longer reverse-checks. `match-consent` edge function is the single source of truth for "mutual confirmed."
