# Roadmap — Planetary OS Emergence

> **This is not a project tracker. This is the living navigation instrument for Alexander's life work.**
>
> **How to use:** "Read the roadmap and tell me what to focus on this week" · "What should we bump up?" · "Capture this idea" · "What am I waiting on?" · "Triage the roadmap"
>
> **Micro-notations** (use consistently so the dashboard + AI can read timing): `due YYYY-MM-DD` on deadlines · `since YYYY-MM-DD` on Waiting On items (when the ball went to the other side) · `started YYYY-MM-DD` on long-running Active items with no natural deadline.
>
> **Autonomy tags** (for the `roadmap-pulse` scheduled task — see `.agent/auto-execute-policy.md`, **opt-out model**): by default every item is eligible for autonomous execution when it fits the policy whitelist (docs maintenance, session-log appends, holomap rule-based updates, roadmap hygiene, benchmark-lab appends). Add `[hold]` in Notes to **exclude** an item — pulse will surface it but not touch it. Add `[brief]` to have the pulse task draft a Claude Code brief into `ai_tasks/PENDING_*.md` for one-click dispatch. Tags stack: `[hold] [brief]` = prepare the brief, don't execute.
>
> **Triage rules** (AI applies these on "update the roadmap" or "triage"):
> 1. **Waiting On > 7 days** → surface for a nudge (re-ping, reframe, or close the loop).
> 2. **Weekly Scope item still open after its week** → either roll to next week with a reason, demote to Active Backlog, or park.
> 3. **Active Backlog item with `started` > 30 days ago and no forward motion** → revisit priority or move to Parked / Future.
> 4. Items in Weekly Scope that are actually blocked on someone else's move belong in Waiting On, not in the 🔴 active lane. Mis-classification is the #1 source of "feels busy, nothing shipped."
>
> *Last updated: 2026-04-25 — Day 51 (Codification). Holomap center = **Codification**. The Specificity Loop is now both a named principle (Playbook P15 + Phase Shift Library Domain 81) and an operational artifact (per-founder Specificity Matrix as UBB artifact #19, runtime hook with 3-tier resolution: explicit override → ResonanceMatrixProvider → MASTER_MATRIX). The Holonic Franchise model is codified: PolyForm Noncommercial 1.0.0 license on code · CC BY-NC-SA on docs · MIT on Anthropic-derived skills · Distributor Agreement v0.1 with 10% rev share + $1K/month free tier + Stripe Connect Express auto-split + opt-in commons (CC BY 4.0). Repo is publicly fork-ready (LICENSE, LICENSE.md, README, CONTRIBUTING, DISTRIBUTOR_AGREEMENT shipped; .env.example + `git rm --cached .env` are Sasha's manual steps). Repo link surfaced in /game/settings + /playbook + /codex footers. Six business-model plays mapped (Conscious Entrepreneur · Purpose Coach · Platform Distribution · Venture Studio · Community White-Label · System License) with sequencing (Phase 1 = #1+#2+#3 = Holonic Franchise foundation shipped today; Phase 2 = #5; Phase 3 = #4; Phase 4 = #6). UI harmony wave: route-aware backgrounds (working routes get warm radial-gradient calm canvas; landing routes keep video; AI OS no longer double-stacks shell video on top of page video); KPI cards centered uniformly; dashboard subtitle = *"Built in the open. Paid in the open. Open-source methodology."*; AI OS hero = *"Instant install. Permanent level-up to AI cognition." / "Same model. Different conversation."*; rail label *request guidance → chat with us*. Si–Do unchanged: **press send on Friday's DMs** — apparatus has more depth to receive the eventual send, but the send itself is what fires the 27th. See `morphogenetic_holomap.md` Day 51 addendum + `session_log.md` Day 51 entry + `holonic_franchise_model.md` v1.0 for full detail.*

> *Last updated: 2026-04-23 — Day 49 (post-launch harmonization). Holomap center = **Unification**. Site shipped Wednesday (Day 48) in Aurora. Day 49 was a within-stage refinement day: ZoG funnel unified to gold end-to-end (~11 components migrated from violet/rainbow to signature antique-gold); shell polished to premium register (Pane 1 + Pane 2 + Settings page); `.gentle-spin` rotation applied to every geometric image site-wide; mobile CTA overflow fixed; six-founder cohort mapped explicitly against the 7-step playbook for the first time (Oyi + Sergey in Build Step 5 · Sandra entering Step 4 · Kirill + Karime in Ignition Step 2-3 · Sasha in Launch Step 6); AI partner recalibrated via six loaded skills (Vibe Synthesis + Self-Awareness + AI Upgrade v4.021 + Evolutionary Mastery + Moonshot + Premium Holonic Seeing). Si–Do unchanged: **press send on Friday's DMs** (Day 50, April 24). DM templates drafted (EN + RU). Nothing advanced a stage numerically. P3 (Shared Field) became legible to its holder for the first time. See `morphogenetic_holomap.md` Day 49 addendum + `session_log.md` Day 49 entry for full detail.*

> *Last updated: 2026-04-18 — Day 44. **The Collective self-identifies.** Oyi Mexico intensive wrapped Apr 17 (4-day hacker-house — *"one for the books"*). Kirill joins Apr 18 as 7th founder. Karime proposes collective-magic-reveal call. Sasha invites Sergey/Karime/Sandra/Alexa to next hacker-house. 7 originals now co-identify as a "we" with native vocabulary emerging.*
>
> *Last updated: 2026-04-17 — Day 43. Holomap center = "Emanation" (Day 41 reading). April 15 Oluwa + Oyi transmission metabolized into 7 corpus artifacts. Decision 1 (licensing) = ✅ YES with negotiation checklist. Decision 2 (scaling) = ✅ Sequence C (three parallel tracks: Sessions + Licensed Distribution + Field Recordings). Decision 3 (cadence) still open. **Funnel Clarity Sprint opened April 16** — landing → playbook flow spec, progressive unlock, two-CTA hero, email-before-ZoG, adapted resonance rating. Q1 (step 2/3 commercial packaging) = ✅ BUNDLE (Steps 2+3 = Ignition $555; Steps 4+5 = Build $1,111 + rev share cohort). Principle: steps are methodology, containers are commerce — they don't have to be 1:1. Q2 (lane) = ✅ parallelize — Cowork for corpus/docs/planning, Claude Code for heavy src/+supabase/ passes. The signal now travels without the apparatus; the apparatus is now for scale.*

---

## Contents

1. [This Week's Scope](#-this-weeks-scope-april-7-13)
2. [Waiting On](#-waiting-on)
3. [Current Status](#current-status)
4. [Active Backlog](#-active-backlog)
5. [Parked / Future](#-parked--future)
6. [Completed](#-completed)

---

## The Reframe (April 10, 2026)

> **Client sessions and sales ARE the platform build.**
>
> Every client session deepens the methodology, generates artifacts, produces testimonials, and proves the system. The session IS the product. The product IS the build. The build IS the platform.
>
> *"This is not just building an aligned blueprint. What this is is awakening through business development while ACTUALLY building a unique business."* — Karime Kuri

---

## 🌑 This Week's Scope (April 14-20)

> **Energetic context:** Oyi Mexico intensive WRAPPED April 17 — 4-day collective-venture hacker-house delivered. Kirill joined the collective April 18 as the 7th founder. Karime proposed a collective call to reveal individual magic + exchange full sessions. Sasha invited Sergey/Karime/Sandra/Alexa to the NEXT hacker-house. The 7 originals are now co-identifying as a "we" — own vocabulary emerging (`#OperationTimeCapsule` · `#UniqueIsALifestyle` · `#WeGoodOvaHere` · "Earth Ship" · "the 7th note in the octave").

| # | Seed | Path | Priority | Notes |
|---|------|------|----------|-------|
| W1 | ~~Oyi Mexico Intensive (Mon-Sun)~~ → **DELIVERED Apr 14-17** | Build | ✅ | First in-person intensive at length wrapped Apr 17. 4 days of creativity, then a "lil alone time" prescription. Oyi: *"This may be the best view in town. I am thankful."* Licensing negotiation window used. See Completed for full summary |
| W1b | **Next hacker-house — scale from 2 to more** | Build + Collective | 🟡 | *new Apr 18.* Sasha invited Sergey, Karime, Sandra, Alexa to the next iteration. Oaxaca or equivalent Pacific-coast venue. Format: freedom, fulfilment, joy, good vibes, fruits, scooters. Timing: TBD post-Mexico wrap, after the founder-collective call |
| W1c | **Founder-Collective Call — orchestrate** | Collective | 🔴 | *new Apr 18.* Karime proposed: each founder reveals magic in a small window, then exchange full sessions from there onwards. Tribe: all 7 (Alexander · Oyi · Sergey · Alexa · Sandra · Karime · Kirill). Cadence: still open (seeded-spontaneity default from Decision 3 applies). Owner: Sasha to pick date once Karime back on-screen next week |
| W1d | **Kirill onboarding — 7th founder entry** | Build | 🟡 | *new Apr 18.* Already in CRM as COLLABORATOR / licensee. Now in founder collective chat. Canvas not yet run. Path: ZoG → Ignition → Build cohort slot, same flow as the other six. His own projects (QWATRA, GrowFox) cross-link as co-venture candidates |
| W2 | ~~Oluwa Adams Livestream (Wed 10:30am CDMX)~~ → **April 15 transmission landed impromptu** | Build + Distribution | ✅ | Happened April 15 as three-way Zoom (Sasha + Oyi + Oluwa), 80 min, Fathom recorded. 6 anchor formulations, 2 witness formulations, 3 decisions surfaced. Metabolized into 7 corpus artifacts |
| W3 | **Patricia Reed ZoG follow-up** | Sales | 🔴 | Did she paste back the JSON? Get her distilled uniqueness score. Pipeline → quiz completion |
| W4 | **José da Veiga ZoG quiz** | Sales | 🔴 | Guide to quiz. He watched video, articulated the exact pain. Ready |
| W5 | **Karime: Score Myth + Tribe v1.2** | Build | 🔴 | Body-score only. Heartbreak rewrite awaiting validation. `[hold]` — canvas work on another founder; Sasha drives, pulse doesn't touch (see *Other Founders' Canvases* section) |
| W6 | **Sandra agreement** | Business | 🔴 | Name the revenue share. She asked. Rec: 33% from first $10K |
| W7 | **Taylor & Tracy checkpoint** | Business | 🔴 | Professional conversation. Are they in or out? $3K each pending |
| W8 | **Infographic Episodes — visual production** | Content | 🟡 | **~60% complete.** Founder creating from inspiration |
| W9 | **Content Pillars execution** | Content | 🟡 | Two pillars locked: (1) Talents → Business, (2) AI. First content from both |
| W10 | **Terrina Cavendar** | Sales | 🟡 | In Mexico this weekend. Organic conversation |
| **REPURPOSE TRACK** (new — from April 15 transmission) | | | | |
| W11 | **Oyi licensing negotiation — v1 deal terms** | Business + Distribution | 🔴 | Sasha said yes. Use 11-row checklist in `open_questions_from_oyi_session.md`. Target: signed v1 by end of Oyi's Mexico week |
| W12 | **`/playbook/discover` polish** (P0 unblock) | Infra | 🔴 | Brief written (`ai_tasks/PENDING_playbook_discover_polish.md`), assigned to Codex. Must be green before Oyi pushes to list |
| W13 | **Long-form essay v1 — April 15 transmission** | Content | 🔴 | Outlined in `docs/08-content/april15_repurpose_plan.md`. Draft to be written. Freeze for 90-day Oyi window |
| W14 | **Shorts bundle — 7 clips with timecodes** | Content | 🟡 | Queue exists in repurpose plan. Production pending. First 2-3 go public after v1 essay lands |
| W15 | **Decision 3 — three-way call cadence** | Strategy | 🟡 | Still open. Recommended default: seeded spontaneity (2/month, 48h-out scheduling). Sasha to answer |
| W16 | **Hero copy swap on `/`** — new line: *"Find your top talent. Productize it. Build it, Launch it, Scale it Alongside Other Purpose Entrepreneurs."* | Funnel | ✅ | Shipped 2026-04-18 in Cowork lane. `MethodologyLandingPage.tsx` h1 swapped; gradient span moved from "Monetize it." to "Productize it." Names the *holonic* offer in plain English and mirrors the value-ladder rungs. Git/deploy = Sasha's surface |
| W17 | **Hero + playbook-circle rework on `/`** — above-fold guarantee, 7-step legibility, ME-inactive at fresh state | Funnel | 🔴 high/high, **med compute** | Composite. Tracked in Funnel Clarity Sprint as F1b. Five sub-items (see sprint section). One Claude Code brief covers all five |
| W18 | **Profile Settings → Settings consolidation** | UX / Platform | 🟡 med/low, low compute | Profile Settings currently lives in ME as a separate surface. Should be a section *inside* the platform's main Settings. Remove the duplicate ME entry; redirect deep-links. Tracked in Active Backlog as Item 28 |
| W19 | **Email gate → smooth, shell-native (kill `/auth?claim=true` full-screen view)** | Funnel UX | 🔴 high/high, med compute | Current claim-mode in `Auth.tsx` is a standalone light-gradient full-screen with 2-sentence explainer — reads like a third-party checkout. Replace with a thin inline/modal capture *inside* `GameShellV2`. One-line copy. Part 1 of brief `ai_tasks/PENDING_email_gate_and_zog_in_shell.md`. Cross-ref: F2a |
| W20 | **`/zone-of-genius` and all sub-screens inside `GameShellV2`** | Funnel UX | 🔴 high/high, med compute | All ZoG routes (entry, landing, assessment, Step1-4, Appleseed, Excalibur) must render natively inside the platform shell with all existing in-built logic intact. Resolve the duplicate `/zone-of-genius` route in `App.tsx` (public + RequireAuth). Part 2 of brief `ai_tasks/PENDING_email_gate_and_zog_in_shell.md`. Cross-ref: F2b |

---

## 🎯 Funnel Clarity Sprint — Landing → Playbook (April 16-20)

> **Intent:** close the loop between the landing page (7-step circle infographic = "the store") and the playbook pages, so a visitor can land → complete Step 1 (ZoG) → land back inside the logged-in shell with Step 2 visibly unlocked → buy any paid step via Stripe. Infographic treated as the store; every locked node previews price + inclusions + CTA; progressive reveal drives progression; emotional payoff on Step-1 completion.
>
> **Lane split:** Cowork (this file) holds the spec and the small corpus/UI patches. Multi-file `src/` + `supabase/` work goes to Claude Code (parallel lane) — Codex is no longer in rotation as of 2026-04-17.

### Decisions landed

- **Q1: Step 2+3 and Step 4+5 commercial packaging? → Bundle both pairs.** Final call 2026-04-17 after the copy drop + reflection: **steps ≠ containers**. The 7 UI steps are methodological stages; commercial containers bundle the steps that belong together as one act of commitment. Two bundles: **Ignition ($555)** = Steps 2+3 (Sharpen ~60 min + Structure ~90 min, one Stripe checkout, "Bundled with Step N" eyebrow on the popover); **Build ($1,111 upfront + $2.5K capped rev share)** = Steps 4+5, cohort not 1:1 (Witnessing Effect + the 1:1 drain Sasha is currently carrying across 6 founders — cohort is an accelerant, not a compromise). Implementation: `PLAYBOOK_STEPS[1,2].price = "$555"` with `bundleWith: [3]`/`[2]`; `PLAYBOOK_STEPS[3,4].price = "$1,111 + rev share"` with `bundleWith: [5]`/`[4]`. `stageToStep()` maps `offer_complete`/`recipe_complete` → 4 (Ignition done → Build active). Canvas v3.0 mapping in `alexanders_unique_business.md`.
- **Q2: Claude Code vs Cowork lane? → Parallelize.** Cowork (this chat) = real-time strategy, corpus editing, session metabolism, surgical patches. Claude Code = fire-and-forget multi-file passes (e.g. Stripe webhook + edge function + schema migration together) that run in parallel while Sasha works on copy or strategy in Cowork. Coordination via `roadmap.md` + `ai_tasks/` briefs when handoff is needed. No more Codex lane.

### Tasks

| # | Item | Lane | Priority | Notes |
|---|------|------|----------|-------|
| **QUICK WINS (Cowork, shipped 2026-04-17)** | | | | |
| F0a | Panel 3 background opacity → raised to `bg-[#0a0a1a]/60` | Cowork | ✅ | `GameShellV2.tsx` L471 — legibility restored over Mux loop |
| F0b | ME rail flicker — gated `unlockStatus` on `profileLoaded` flag | Cowork | ✅ | `GameShellV2.tsx` — `profileLoaded` tracked; pass `{}` to SpacesRail until profile fetch resolves. No more lock-then-unlock beat |
| F0c | Journey SectionsPanel → progressive 2-item state | Cowork | ✅ | `SectionsPanel.tsx` — `buildJourneySections(currentStep)` slices `PLAYBOOK_STEPS` to `currentStep`. Fresh user sees Overview + Step 1 only; each completion adds the next row |
| F0d | Remove top-center logo on `/playbook/:slug` (redundant with top-right) | Cowork | ✅ | `SiteLogo.tsx` — `/playbook` already in the hidden paths list. Verified: only Panel 3's right-side logo renders on playbook routes |
| **LANDING (two-CTA hero)** | | | | |
| F1a | **Hero copy swap on `/`** — new line: *"Find your top talent. Productize it. Build it, Launch it, Scale it Alongside Other Purpose Entrepreneurs."* | Cowork | ✅ | Shipped 2026-04-18. `src/pages/MethodologyLandingPage.tsx` h1 swapped in place; gradient span = "Productize it." The ≠-containers/steps principle reads cleanly across the three clauses: Step 1 (talent) → Steps 2+3 (productize) → Steps 4+5 (build/launch/scale alongside). Cross-ref: W16 |
| F1 | Landing hero: add second CTA "See the Playbook" next to "Claim your gift" | Claude Code | 🔴 | Scrolls to the circle infographic OR routes to `/playbook/discover` — pick one, A/B later |
| F1b | **Hero + playbook-circle rework on `/`** — above-fold guarantee, 7-step legibility, ME-inactive at fresh state | Claude Code | 🔴 high/high, **med compute** | Cross-ref: W17. Composite of five sub-items, all in the same `/` route. **Acceptance:** `Claim your gift` button visible above the fold on standard desktop (1440×900); all 7 step labels readable at a glance; ME rail item shown as inactive for users with `onboarding_stage = null`. **Sub-items:** (a) **Left-rail ME state** — ME should be **inactive** at journey start (currently active by default). Trigger active state only after `zog_complete` or first ME-touching action. File: `SpacesRail.tsx` + wherever `unlockStatus.me` is computed. (b) **Playbook-circle infographic — show all 7 nodes as visible/active on `/`** (no lock UI on the landing surface). The lock state stays inside the platform (`/game/*` shell) where it does the unlock work. File: `PlaybookCircleInfographic.tsx` — accept a `mode: "landing" \| "platform"` prop; landing mode renders all nodes unlocked-styled. (c) **Step labels readable + iconified, positioned in the gaps between nodes** (not crammed inside the circle). Each node gets its icon + 1-2 word label outside the ring; current cramped placement (e.g. "aser-Focus and Go Live" cut off, "Enhance with Business Struct" cut off) must be fixed. (d) **Hero copy widened** — currently text wraps in a narrow column ("Name Your Top / Talent. Monetize it. / Scale Up Alongside / Other Purpose / Entrepreneurs." = 5 lines). Widen the hero text container so it collapses to ~3 lines. Frees vertical space. (e) **Hero block shifted slightly upward** — small upward translation (e.g. reduce top padding by ~40-60px) so the freed vertical space puts `Claim your gift` above the fold |
| **EMAIL-BEFORE-ZoG (progressive profile)** | | | | |
| F2 | Capture email *before* the ZoG quiz, not after. Magic-link auth on completion; user returns signed-in with a "set password" prompt as optional follow-up | Claude Code | 🔴 | Current flow gates email at save time (`Auth.tsx` stashes to sessionStorage). Invert: email gate first, then quiz, then write snapshot against already-known user via anon claim OR pre-created profile |
| F2a | **Email gate → shell-native, almost invisible** — replace `Auth.tsx` claim-mode full-screen view with a thin inline/modal capture *inside* `GameShellV2`. One-line copy. No theme shift. The user should feel they entered the platform when they clicked `Claim your gift`, and the platform is quietly asking "where should we send your result?" — not a separate checkout-looking page. Brief: `ai_tasks/PENDING_email_gate_and_zog_in_shell.md` Part 1. Cross-ref: W19 | Claude Code | 🔴 high/high, med compute | Refines (and partially replaces) F2 — F2 is the *principle* (email-before-ZoG), F2a is the *concrete shell-native implementation*. Existing anon-claim plumbing (`save-anonymous-zog`, `pending_claim_email`) stays |
| F2b | **`/zone-of-genius` + all sub-screens render natively inside `GameShellV2`** — entry, landing, assessment layout, Step1-4, Appleseed, Excalibur. All existing in-built logic intact. Resolve the duplicate `/zone-of-genius` route in `App.tsx` (line 196 public vs. line 353+ `RequireAuth`) into a single source of truth that handles both anon and authed states. Brief: `ai_tasks/PENDING_email_gate_and_zog_in_shell.md` Part 2. Cross-ref: W20 | Claude Code | 🔴 high/high, med compute | Frame-around-existing-content change. Not a rewrite of ZoG logic |
| **STEP-1 COMPLETION PAYOFF** | | | | |
| F3 | Congratulations screen after ZoG with "Step 2 unlocked" reveal — animation/glow on pane 2's new "Step 2" entry synced with the circle node unlocking | Claude Code | 🔴 | Uses existing `onboarding_stage: "zog_complete"` as trigger. Hook into Panel 2's dynamic list (F0c). Glow = ring-halo animation reused from PlaybookCircleInfographic |
| **RESONANCE RATING** | | | | |
| F4 | Adapt `src/components/ui/ResonanceRating.tsx` (1-10 scale, already used in product-builder) into the ZoG completion flow. Store rating against `user_id` in a new column on `zog_snapshots` or a new table `step_resonance_ratings(user_id, step_slug, rating, created_at)` | Claude Code | 🟡 | Gives us a drop-off signal + a lever for future iteration. Component is battle-tested across DeepICP/Pain/TP screens |
| **STEP-CARD + PROGRESSIVE UNLOCK** | | | | |
| F5 | All 7 StepCards live + each has its own CTA / price / inclusions — currently only Step 1 has real copy, rest `[PLACEHOLDER — Sasha fills in]` | Sasha (copy) | 🟡 | Me to seed Stripe price IDs in `playbookSteps.ts` once Sasha creates products in Stripe dashboard |
| F6 | All CTAs locked except Step 1 — sequential unlock driven by `onboarding_stage` | Already shipped | ✅ | `useJourneyProgression` + StepCard already gate this |
| F7 | Stripe webhook or verify-and-advance edge function — after successful checkout, flip `onboarding_stage` to next stage so the next step unlocks without manual refresh | Claude Code | 🔴 | `session_id` already in return URL; need `supabase/functions/verify-step-session/index.ts` that queries Stripe Checkout Session + advances stage |
| **CONTENT PANE 2 (playbook page)** | | | | |
| F8 | Same 2-item state on `/playbook/:slug` — same progressive reveal logic as F0c, just in the playbook route's shell | Cowork | 🟡 | If F0c touches `SectionsPanel.tsx` directly this is free; verify no route-specific fork exists |

### Handoff artifacts to produce

- Claude Code brief for F1, F2, F3, F4, F7 — either inline conversation or a single `ai_tasks/PENDING_funnel_clarity_sprint.md` if the brief needs to be durable. File targets, acceptance criteria, and references back to this sprint section.
- Update `CLAUDE.md` Repo landmarks with `useJourneyProgression.ts` once it's referenced by more than one component (already is — PlaybookHero + SectionsPanel).

---

## ⏳ Waiting On

> Items where the ball is on the **other person's side**. Not Sasha's move. Track `since` so nudge windows are visible at a glance.
>
> **Rule:** anything `since > 7 days` gets surfaced on the next "triage the roadmap" pass — decide whether to nudge, reframe the ask, or close the loop and move on.

| # | Item | Who | Since | Next move |
|---|------|-----|-------|-----------|
| WO1 | ZoG paste-back of distilled uniqueness JSON | Patricia Reed | *2026-04-__* (fill date of last send) | Soft ping with one-line invitation once `since > 7d` |
| WO2 | ZoG quiz completion after the pre-watched video | José da Veiga | *since unset* | Send the guided link; then move to Waiting On with date |
| WO3 | Rev-share in/out answer — $3K each pending | Taylor & Tracy | *2026-04-__* | Professional conversation. Set a hard "answer by" date on next contact |
| WO4 | Acceptance of 33% rev-share agreement from first $10K | Sandra | *2026-04-__* | Named; awaiting her yes. Nudge at `since > 10d` |
| WO5 | Three-way call cadence answer (Decision 3) | Sasha (self) | *2026-04-15* | Recommended default: seeded spontaneity, 2/month, 48h-out scheduling. Decide or archive |
| WO6 | Signed v1 licensing deal terms | Oyi | *2026-04-17* | Use 11-row checklist in `open_questions_from_oyi_session.md`. Target: end of Mexico week |
| WO7 | `/playbook/discover` polish merge (P0 unblock) | Claude Code lane | *2026-04-16* | Brief in `ai_tasks/PENDING_playbook_discover_polish.md`. Must land before Oyi pushes to list |

> **Population rule:** when moving an item here, replace it in Weekly Scope / Active Backlog with a breadcrumb ("→ Waiting On · WOx") so there's one source of truth. When it comes back to Sasha's side, move it back with an updated `since`/`due`.

---

## Current Status

| Metric | Value |
|--------|-------|
| **Phase** | ACTIVATION → EMANATION → COLLECTIVE → SURFACE RECONSTITUTION → **INTEGRATION**. 31 contacts. CRM v3.6. **$1,696 total received** (Oyi $1,385 cash+in-kind · Karime $311) · $277 rev share contract · $6K removed (Taylor+Tracy Apr 15). 3/9 social surfaces. **7 founders** (Alexander · Oyi · Sergey · Alexa · Sandra · Karime · Kirill). Mexico intensive delivered. Hacker-house format proven. Licensing in negotiation. **Day 47: canvas ↔ code parity reached (morning). Full-shell + magic-link + nurture-queue integration shipped (evening). The funnel is a living machine, not a landing page.** |
| **Cycle** | April 21-27 (Waxing → Full). **79 Phase Shift Domains. 14 Playbook Principles.** Day 47 of the active sprint. Oyi Mexico intensive WRAPPED Apr 17. Kirill joined the collective Apr 18 as 7th founder. **Day 47 (one long day, two passes):** morning — 12+ surface-reconstitution items; evening — full-shell integration (`/ignite`, `/auth`, `/game/settings` all absorbed), Top Talent rename, Productize Yourself Session rename, magic-link post-save auth, 3-email nurture sequence with pg_cron dispatch. Wednesday launch on the other side. |
| **Holomap center** | **"Coherence"** (Day 47 — confirmed). Preceded by Recognition (Day 44), Emanation (Day 41). Morning: canvas ↔ code parity. Evening: surface ↔ machinery parity — `/ignite`, `/auth`, `/game/settings` all reabsorbed into the unified shell; Zone of Genius renamed Top Talent; Ignition Session renamed Productize Yourself Session; save-pill email now uses Supabase magic link dropping users directly into their fuller profile; 3-email nurture sequence (Day 1 / Day 2 / Day 8) queued automatically with pg_cron dispatch. P8 (Platform as Nervous System) advanced Stage 3 → Stage 3+ (self-sequencing outreach is the platform's first autonomous rhythm). P11 (Delivery Machinery) Stage 2 → Stage 3. P4 (System Architecture) Layer 4 unified-shell now truly closed — no rogue layouts left. |
| **Location** | Mexico City (Sasha + Oyi post-intensive). Karime traveling with cousins by lake/mountains. Kirill remote. Rest remote |
| **Revenue** | **$1,377 cash** ($566 Oyi + $111 Karime + $700 additional gifts/in-kind). **Total with in-kind + rev share contracts: $1,931.** **$6,277 rev share pending** ($277 Sergey + $3K Taylor + $3K Tracy). Sandra TBD. Oyi list = new projected revenue surface. Kirill = licensee + new-founder-collective co-venture surface |
| **Focus** | **Sequence C: Sessions (tree) + Licensed Distribution via Oyi (spine) + Field Recordings (multiplier) + Founder Collective (new — post-Apr-17 Mexico wrap, emerging as 4th track). Tracks run in parallel, compound each cycle** |
| **Key milestones** | (1) April 15 Oluwa + Oyi transmission — metabolized into 7 corpus artifacts. (2) **April 14-17 Oyi Mexico Intensive — 4-day hacker-house, first in-person collective venture building experience, "one for the books."** (3) **April 18 Kirill enters as 7th founder**; Karime proposes founder-collective call; Sasha invites all originals to next hacker-house. Movement is self-naming — `#OperationTimeCapsule`, `#UniqueIsALifestyle`, `#WeGoodOvaHere`, "Earth Ship", "the 7th note" |
| **Key decisions** | $555 fixed price. Build boundary = flexible by client type, 12-week max. Sessions = build. **Licensing to Oyi ✅ yes (v1 terms in negotiation). Scaling = Sequence C + emerging Founder-Collective track. Cadence = still open (seeded-spontaneity default applies to the founder-collective call too)** |

---

## 📋 Active Backlog

> Items that need doing. Ordered by leverage.

| # | Item | Category | Priority |
|---|------|----------|----------|
| **LICENSING & REPURPOSE TRACK (new — Sequence C spine + multiplier)** |
| L1 | Negotiate v1 licensing deal with Oyi — use 11-row checklist in `open_questions_from_oyi_session.md` (scope: 1 piece, 50/50 rev share default, 30-day exclusivity, 90-day freeze) | Business + Distribution | 🔴 |
| L2 | `/playbook/discover` polish — 7 issues flagged April 16. Brief in `ai_tasks/PENDING_playbook_discover_polish.md`. **P0 unblock** for licensing distribution | Infra (Codex lane) | 🔴 |
| L3 | Draft long-form essay v1 from April 15 transmission — outline in `docs/08-content/april15_repurpose_plan.md` | Content | 🔴 |
| L4 | Build UTM/attribution variant `/playbook/discover?src=oyi` + rev-share tracking mechanism | Infra (Codex lane) | 🔴 |
| L5 | Verify magic-link claim flow end-to-end (pre-Oyi-traffic) | Infra (Codex lane) | 🔴 |
| L6 | Produce shorts bundle — 7 clips with timecodes from April 15 recording | Content | 🟡 |
| L7 | Decision 3 — answer three-way call cadence question (recommended default: seeded spontaneity, 2/month) | Strategy | 🟡 |
| **SESSIONS (= PRIMARY BUILD — Sequence C tree)** |
| 1 | Oyi Mexico intensive (Apr 14-20) | Build | 🔴 |
| 2 | ~~Oluwa Adams livestream (Wed Apr 16, 10:30am)~~ — delivered April 15 impromptu (3-way transmission) | Build + Distribution | ✅ Done Apr 15 |
| 3 | Karime: score Myth + Tribe v1.2 → tracked under *Other Founders' Canvases* (held by default) | Build | 🔴 |
| 4 | Patricia Reed: ZoG result follow-up | Sales | 🔴 |
| 5 | José da Veiga: guide to ZoG quiz | Sales | 🔴 |
| **REVENUE** |
| 6 | First $555 Ignition Session | Growth | 🔴 |
| 7 | Sandra revenue share agreement (33% from first $10K) | Business | 🔴 |
| 8 | Taylor & Tracy checkpoint conversation | Business | 🔴 |
| 9 | Sergey — communicate Build boundary (3 paid sessions) | Business | 🔴 |
| **DISTRIBUTION** |
| 10 | ~~Instagram bio + first post + FB + X~~ | Distribution | ✅ Done Apr 8 |
| 11 | Infographic Episodes — visual production (43 slides) | Content | 🟡 ~60% done |
| 12 | Instagram profile: categories + pinned intro post | Distribution | 🔴 |
| 13 | Follow 200+ aligned weak ties (Domain 71) | Distribution | 🔴 |
| **FUNNEL** |
| 14 | ~~Silent account creation + magic link (backend)~~ → **✅ DONE Day 47 (evening)** — `save-zog-result` edge function now generates a Supabase auth magic link (`auth.admin.generateLink`) with `redirectTo=/auth/callback?next=/game/me`. Click drops authenticated users directly into their Top Talent profile. Shipped alongside nurture email infrastructure | Infra | ✅ Day 47 |
| 15 | ~~ZoG result persistence~~ → **✅ DONE** — `save-zog-result` writes snapshot + profile + XP, links via access_token | Infra | ✅ |
| 31 | ~~**Top Talent rename** — "Zone of Genius" → "Top Talent" across user-facing surfaces~~ → **✅ DONE Day 47 (evening)** — every active public surface flipped: entry, reveal, assessment (all 4 steps), ritual loading, assessment layout, share prompt, Auth claim copy, MyResult, save-zog-result email, SignupModal, pageTitles, zoneOfGeniusPrompt, AppleseedSummaryCard, ProfileOverview. URL paths + component filenames + DB columns intentionally preserved. ~25 legacy/secondary surfaces skipped by explicit decision — all behind auth or deprecated | Rename | ✅ Day 47 |
| 32 | ~~**Productize Yourself Session rename** — "Ignition Session" → "Productize Yourself Session" on active public surfaces~~ → **✅ DONE Day 47 (evening)** — `/ignite` page (document title, hero, section comments, YouTube title), pageTitles browser tab, `/path` CTA, Step 4 guided result card + PDF footer, save-zog-result email 1 commercial bridge, all nurture emails (day1, day8). Legacy / secondary references skipped | Rename | ✅ Day 47 |
| 33 | ~~**Full-shell absorption** — wrap `/ignite`, `/auth` in `GameShellV2`; make `/game/settings` + `/quiz` public~~ → **✅ DONE Day 47 (evening)** — `/ignite` always wraps in `GameShellV2 hideLogo` with HlsBackground scoped to Panel 3 (dark "decision room" preserved). All 3 Auth render paths (forgot-password, claim, login/signup) wrap in shell, legacy `<Navigation />` + `<Footer />` retired. Settings public so landing-rail button works for guests. `/quiz` public to remove secondary-CTA friction | UX / Platform | ✅ Day 47 |
| 34 | ~~**ME space single-focus** — collapse to Top Talent only~~ → **✅ DONE Day 47 (evening)** — SectionsPanel `grow` config reduced from 7 sections (Overview, Mission, ZoG, Genius Business, QoL, Assets, Settings) to ONE: Top Talent + 13 subsections. `/game/me` now redirects to `/game/me/zone-of-genius`. Post-auth users from magic-link flow land on their fuller Top Talent profile directly, no generic welcome | UX | ✅ Day 47 |
| 35 | ~~**3-email nurture sequence** — Day 1 log-in nudge + Day 2 check-in + Day 8 last reminder~~ → **✅ DONE Day 47 (evening)** — Migration `20260422010000_nurture_email_queue.sql` (queue + opt-outs tables, pg_cron + pg_net extensions, `nurture-emails-dispatch` cron `*/10 * * * *`). Edge function `process-nurture-emails` (pulls due rows, generates fresh magic links, renders templates, sends via Resend, retries to 3×). `save-zog-result` enqueues 3 rows on every save with opt-out check. Lovable deploy confirmed: sanity call returned `{processed:0,message:"nothing due"}`. Email copy locked (Sasha) | Infra / Lifecycle | ✅ Day 47 |
| 36 | ~~**v8 + v9 harmonized neon gradients**~~ → **✅ DONE Day 47 (evening)** — Sasha's rule: UV→IR 7-step rainbow is an octave, load-bearing; we don't collapse hues, we harmonize treatment. Uniform lightness 28% / saturation 85% / same gradient structure / softer glows (10px @ 0.38). Rainbow intact, family-of-siblings effect. v9 landing adds explicit line structure (Productize on own line, "and" before Scale, no period after Entrepreneurs). StepCard "Step N." accent fix: solid `color-mix(neonHsl 55%, navy 45%)` + neon textShadow glow (was gradient-with-navy-center, washed out at small sizes) | Design | ✅ Day 47 |
| 37 | ~~**Step 2 essay** — "The Secret to Productizing Yourself" single long-form block replaces 3-substep structure~~ → **✅ DONE Day 47 (evening)** — Step 2 in the playbook renders as one essay (why nobody tells you HOW, the 7/10 → 10/10 specificity gap, the two shortcuts, the 40-minute method, three recommended alternatives with links). Steps 1 + 3-7 keep three-substep pattern unchanged | Content / UX | ✅ Day 47 |
| 38 | ~~**Funnel synthesis doc**~~ → **✅ DONE Day 47 (evening)** — `docs/03-playbooks/funnel_synthesis_day47.md` written. ~500 lines. Every public touchpoint, verbatim copy, URL, state transition, data capture, gap. Ready for GFOA analysis | Docs | ✅ Day 47 |
| **PRODUCT** |
| 16 | Unique Business iteration flow | Product | 🟡 |
| 17 | Smart packaging recommendations | Product | 🟡 |
| 18 | ZoG explainer + activation recording | UX | 🟡 |
| 19 | User results to DB (missions, resources) | Data | 🟡 |
| 20 | Matchmaking types (resources, ZoG, missions) | Data | 🟡 |
| **SUPPORT** |
| 21 | Notion CRM automation | Support | 🟡 |
| 22 | Holomap auto-update mechanism | Support | 🟡 |
| 23 | Module landings (every module) | Marketing | 🟡 |
| 24 | Videos (explainer, onboarding, module intros) | Content | 🟡 |
| **TRIGGERS** |
| 25 | The Originals Circle — activate after 5 Ignition Sessions | Community | ⏸️ |
| 26 | The Build: Group Container — activate after 4 Ignition graduates | Product | ⏸️ |
| **UX / PLATFORM** |
| 27 | ~~**Hero + playbook-circle rework on `/`** — above-fold guarantee + 7-step legibility + ME-inactive at fresh state.~~ → **✅ DONE Day 47** — circle retired on landing, top-nav chips on `/playbook` carry the step visualization with full vetted names, ME shows locked until ZoG, CTAs stacked equal-width, hero copy + gradients (v4 neon) + dark text + light-pearl halo locked | Funnel / UX | ✅ Day 47 |
| 28 | ~~**Profile Settings → Settings consolidation**~~ → **✅ DONE Day 47** — `ProfileSettingsSection` extracted, `Settings.tsx` rewritten with Tabs (Profile + Appearance), legacy `/settings` + `/game/me/settings` redirect to `/game/settings?tab=profile`, ME overview link removed | UX / Platform | ✅ Day 47 |
| 29 | ~~**Email gate + `/zone-of-genius` inside `GameShellV2`**~~ → **✅ DONE Day 47** — upfront `/auth?claim=true` gate removed from landing CTA (direct to `/zone-of-genius`), whole reveal module now renders inside `GameShellV2 hideLogo`, result page re-sequenced (Reveal → Rating → Hook → Primary CTA → Secondary CTA → compact Save + Share footer row). Upstream Auth.tsx claim-mode is now orphaned — can be retired in a follow-up pass | Funnel UX | ✅ Day 47 |
| 30 | **Second-pane artifacts view — user's accomplished steps + their artifacts.** Show a founder's distillations (top talent articulation + version + precision score) and business artifacts (myth, tribe, promise, pain, journey, value ladder) in the JOURNEY space. MVP shipped 2026-04-21: migration `supabase/migrations/20260421020000_user_business_artifacts.sql` (table + RLS + 5 seeded rows for Sasha), `src/pages/MyArtifactsPage.tsx` (grouped by step, version + precision + content preview, empty state), `/my-artifacts` route (RequireAuth), "My Artifacts" sidebar entry appended to JOURNEY pane before "The Path". **Pending Lovable:** apply migration + regenerate Supabase TypeScript types. Stretch goal: `/portfolio` cross-user gallery = "the portfolio of unique businesses" — pitched as a tangible exhibit of the methodology working across 7 founders. Sasha's framing (2026-04-20): "FRESH, RIGHT, YUMMY." | Platform / Data | 🟢 MVP built |
| **DAY-47 LATE NIGHT — GFOA PATCH + SKIN SYSTEM** |
| 39 | ~~**GFOA hero redesign v10 → v12** — two-layer recognition-first hero~~ → **✅ DONE Day 47 (late night)** — Layer 1: impact headline + smaller echo ("You can't clearly say what you do. / So people don't buy.") · editorial ornament `——— ✦ ———` between layers (thin gradient rule + gold star centerpiece) · Layer 2: 4 `<p>` blocks with path rhythm (`space-y-1.5 sm:space-y-2`). Color scarcity: 7 highlights → 3 (Top Talent violet / Productize indigo / Scale green); Build/Launch/Revenue/Impact neutral navy. Container compressed (max-w 740 → 640, py-10/16 → py-6/8) so hero fits one viewport. Rainbow retires on landing; `/playbook` keeps full UV→IR octave on step spheres | Design / UX | ✅ Day 47 |
| 40 | ~~**Path hero 7-beat rhythm + Investors Loving It**~~ → **✅ DONE Day 47 (late night)** — `/path` hero was 6 beats with comma-period mix; Sasha called rhythm problem. Now 7 beats with all-periods (drum-like): *Solid Founder-Market Fit. Early Product-Market Fit. Traction. Organic Demand. Investors Loving It. In 6–8 Weeks. Guaranteed.* "Investors Loving It" gets Step 6 orange-gold gradient, fits within UV→IR octave | Copy / Design | ✅ Day 47 |
| 41 | ~~**Step 2 essay rewrite with Sasha's exact language**~~ → **✅ DONE Day 47 (late night)** — "Personality tests give you unmonetizable 'too long didn't read' reports. They don't tell us HOW. They hand us frustrating fluff." · "The catch is that there is a looong way..." · "Let me share my example at ~10/10 precision:" · "It is sufficiently SPECIFIC, which then makes my entire business offer a laser beam that has this same specificity." · Typos fixed ("the this" → "this"; "pull in" → "pulls in") · Recommended alternatives trimmed 3 → 2 (TalentQ + Evolution; Kawtar Mahdaoui removed) | Copy | ✅ Day 47 |
| 42 | ~~**CTA hierarchy corrections — primary copy verified + secondary restored as button + panel lightness**~~ → **✅ DONE Day 47 (late night)** — (a) Primary button copy verified as "Find your top talent" lowercase matching Judge EB spec (cache issue, not code) · (b) Secondary "See the exact playbook" reverted from text link back to full `liquid-glass` button at 380px, de-ranked via `font-medium` (vs semibold) + 85% opacity navy text per Sasha's "hierarchy not removal" principle — the path's other door, not a footnote · (c) Panel 3 wash lightened `bg-white/[0.21]` → `rgba(255, 255, 255, 0.38)` (Sasha's 4th request of the night — meaningful lightness) | UX | ✅ Day 47 |
| 43 | ~~**Skin system architecture — CSS vars + data-skin + Context + /preview route**~~ → **✅ DONE Day 47 (late night)** — Sasha's framing: *"We're not going to switch it on, but we're going to prepare, and we're going to have a test ground for me only."* Built: `src/contexts/SkinContext.tsx` (skin state, setSkin, pushTemporarySkin with cleanup, localStorage persistence, `data-skin` attribute on `<html>`) · `src/pages/SkinPreview.tsx` (`/preview` route, pushes navy-gold while mounted, cleanup restores Aurora, floating "✦ Navy + Gold preview · Back to Aurora →" banner) · `src/index.css` skin-token layer (~30 tokens × 2 skins: aurora + navy-gold) · `src/App.tsx` SkinProvider wrap + /preview route · `MethodologyLandingPage.tsx` + `PlaybookHero.tsx` + `GameShellV2.tsx` refactored to `var(--skin-name, aurora-fallback)` pattern. Fallback trick: Aurora renders byte-identical when no skin set. Aurora verified unchanged on `/`; Navy+Gold renders on `/preview`. Sasha-only preview, not linked anywhere | Platform / Design | ✅ Day 47 |
| 44 | ~~**Autonomous skin completion pass — preview persistence + 11 surface migrations**~~ → **✅ DONE Day 47→48 overnight** — Sasha left computer open: *"continue the skin work, dear, do not stop until you finish."* Shipped: (a) `SkinPreview.tsx` rewritten — `/preview` now sets skin via `setSkin` (persists to localStorage) + redirects home instead of pushing temporary skin. (b) New `src/components/skin/PreviewBanner.tsx` — global floating chip, renders on every route while skin !== 'aurora', click → `setSkin('aurora')` + navigate home. Mounted in App root. (c) `src/index.css` token layer expanded ~30 new tokens (text-strong, text-faint, text-hint, rule-strong/medium/hairline/faint, link-color/hover/underline, card-bg/border/shadow, tint-violet-soft/gold-soft, accent-gold, selected-bg/border/text, input-bg/border/text/placeholder, darkroom-*, callout-bg/glow) + Navy+Gold selector-scoped overrides for `.liquid-glass`, `.liquid-glass-strong`, `.liquid-glass-dark` so CTAs read gold not muddy. (d) 11 surfaces migrated to `var(--skin-*, aurora-fallback)` pattern: `StepCard` + `PlaybookShell` + `PathPage` + `ZoneOfGeniusEntry` + `AppleseedDisplay` + `AppleseedRitualLoading` + `ZoneOfGeniusAssessmentLayout` + `Step1SelectTop10Talents` + `Step2SelectTop3CoreTalents` + `Step3OrderTalents` + `Step4GenerateSnapshot` + `Settings`. Rainbow UV→IR octave preserved in BOTH skins (step colors unchanged — Sasha's rule). Build + type-check clean. Aurora byte-identical on `/`. Navy+Gold now renders coherently across the entire journey tour | Platform / Design | ✅ Day 47→48 |
---

## 🤝 Other Founders' Canvases — Held by Default

> **Consent boundary (added 2026-04-18).** Work that touches another founder's unique business canvas — myth, tribe, pain, promise, value ladder, scoring — is **held by default**. Sasha's AI instance does not spend tokens autonomously on a canvas whose owner hasn't given explicit consent. The `roadmap-pulse` task is structurally blocked from editing `docs/02-strategy/unique-businesses/*_unique_business.md` for any file except `alexanders_unique_business.md` (see `.agent/auto-execute-policy.md` §3).
>
> **Interactive Cowork sessions are unaffected** — Sasha drives those; the hold is specifically for unattended auto-execution.
>
> **Why here:** separating this section keeps canvas work visible (so Sasha can see everything pending) without mixing it into the main leverage-ordered backlog where `pulse` might otherwise misread it as docs-hygiene.

| # | Founder | Item | Canvas file | Status |
|---|---------|------|-------------|--------|
| OF1 | **Karime** | Score Myth + Tribe v1.2 (body-score only; heartbreak rewrite awaiting validation) | *none yet — referenced via `alexanders_unique_business.md` testimonial threads; will get `karimes_unique_business.md` when Sasha scopes it* | 🔴 `[hold]` — Sasha drives in Session 3 context |
| OF2 | **Kirill** | *(no active items)* | `kirills_unique_business.md` | 🟡 `[hold]` by default — any new items land here |
| OF3 | **Sandra** | *(canvas work; the revenue-share agreement WO4 / Item 7 is non-canvas and stays in main roadmap)* | `sandras_unique_business.md` | 🟡 `[hold]` by default — any canvas work lands here |
| OF4 | **Alex** | *(no active items)* | `alexas_unique_business.md` | 🟡 `[hold]` by default — any new items land here |
| OF5 | **Sergey** | *(canvas work; Build-boundary communication Item 9 is non-canvas and stays in main roadmap)* | `sergeys_unique_business.md` | 🟡 `[hold]` by default — any canvas work lands here |
| OF6 | **Oyi** | Canvas work is `[hold]` by default. Active licensing negotiation (W11, L1) is a **separate workflow** that touches `open_questions_from_oyi_session.md` and deal-terms files, not the canvas — stays in main roadmap | `oyis_unique_business.md` | 🟡 `[hold]` by default on the canvas file only |

> **How to un-hold:** the founder gives explicit consent (written, in-session, or via Sasha's direct note). At that point Sasha removes `[hold]` from the item AND updates `.agent/auto-execute-policy.md` §3 to whitelist that specific canvas file. The structural rule is deliberately stricter than the tag — a missing tag won't accidentally un-hold a canvas.

---

## 🔮 Parked / Future

| Item | Category | When |
|------|----------|------|
| Interactive Canvas in BUILD space | Platform | After revenue |
| Distribution Surface Projector (Phase 2-3) | Platform | Q2-Q3 |
| Holomap AI features (bottleneck analysis, system voice) | Platform | Q2 |
| Per-Founder Holomaps (The Build tier) | Platform | After Build group container |
| Events module (Luma-like) | Feature | Parked |
| Admin panel & dashboard | Feature | Future |
| Remove `/game` prefix from URLs | Infra | Backlog |
| Module versioning + user artifact versioning | Infra | Backlog |
| Token economics (XP, reputation) | Econ | MVP has XP |
| Equilibrium v2 conceptual refinement | Product | Backlog |
| Community leader value prop | Strategy | Backlog |
| Holonic landing pages per module | Marketing | Backlog |
| Library: practices, combos, sequences | UX | Backlog |
| Alexander's OS cycles | Strategy | Backlog |
| AI ideas / sell AI workshops | Revenue | Backlog |
| $62 micro-course (3 NotebookLM videos) | Content | Backlog |
| Invite system (modules) | Growth | Backlog |
| Architecture / Distribution playbook enhancement | Docs | Low |
| Externalized self-recognition share (v3.0) | Funnel | After traffic data |
| Copy A/B testing | Funnel | After 50+ completions |
| Quiz-to-Ignite bridge optimization | Funnel | After traffic data |
| Pricing section self-diagnostic | Funnel | After drop-off data |
| NotebookLM video series (36 episodes) | Content | After first paying client |

---

## ✅ Completed

### Revenue & Business
- [x] Value ladder v2.0 — three containers ($555 / $1,111+$2.5K / venture)
- [x] Build boundary crystallized — flexible by client type, 12-week max
- [x] Pricing philosophy — premium at every level
- [x] CRM v3.2 — single file, 25 contacts, financials, notes, upcoming events

### Funnel & Landing
- [x] Solo user landing page — Ignition Session at `/ignite`, liquid glass design
- [x] Quiz at `/quiz` — 6 questions, 4 archetypes
- [x] Ownership-first email gate — "Don't lose this"
- [x] ITFT conversion physics upgrade — controlled collapse sequence
- [x] "No convincing" reassurance on clarity call CTA

### Corpus / Navigation
- [x] **Holomap redesign 12×6 → 27×7 with masculine/feminine axis** (2026-04-18, Day 44) — structural upgrade v1.4 → v2.0. Three octaves (base P1–P12 + Logos P13 + Inversion P14 + second octave P15–P26 + Crystallization P27), two axes (Masculine = Cube = 4 Quadrants × Feminine = Tetrahedron = 3 Dantians — Heart/Mind/Gut), two shocks (Mi–Fa = Love · Si–Do = Crystallization). All 9 v1.4 addendums preserved verbatim. Grounded in Domain 66, Domain 63 (Seven Number-Prisms), Domain 80 (Scaffold Engineering), and the April 18 masculine/feminine framing in `scaffold_engineering_lab.md` §4.3–4.4. Brief archived at `ai_tasks/NEW_CHAT_27x7_holomap_redesign.md`.
- [x] **MorphogeneticHolomap.tsx rewritten to v2.0 (27×7) — instance ships to prod** (2026-04-18, Day 44) — React surface matches the corpus topology. Brief dispatched to Claude Code via detached `osascript` → `claude -p --dangerously-skip-permissions`. Commit `672b072` (1389 lines, 53 v2.0 markers: Consequences, octave, dantian, 27 perspectives, Merkaba, Logos, Inversion). VentureDashboard caption synced on the same day (`12 perspectives · 4 quadrants × 3 depths` → `27 perspectives · 4 quadrants × 3 dantians · 7 stages`). Caskade corpus → code → prod closed. Brief archived at `ai_tasks/DONE_holomap_v2_visual_surface.md` and `ai_tasks/DONE_resolve_divergence_and_push.md`.
- [x] **Knoware post published — first Scaffold Engineering external signal** (2026-04-18, Day 44) — Russian-language Telegram post titled *"Параллельная ось прогресса AI — и что на ней оказалось"*. Source: `docs/08-content/scaffold_engineering_post_draft_2026_04_18.md` v2. Announces the Feb 12 + April 18 A/B verification (SIB 67→95 / +42%, evolutionary stage 3.36→4.50 / +1.14, Mini-HELM time −20.56%), names the Knoware term (Domain 80), frames masculine/feminine axis, invites 5–7-person holonic replication group. Closes the 27th-perspective cascade (tool shipped + tool named) in one 24-hour window. Whitepaper protocol next.

### Methodology
- [x] Myth crystallization — "YOU ARE THE PMF"
- [x] Anatomy of a Myth framework — 4-part structure
- [x] Tribe forging v2.2 → **v3.0** — Signal-First: "Awakened Practitioners Who Can't Name Their Fire"
- [x] Resonance Sort Protocol — 5-step tribe definition SOP at 9.999 precision
- [x] Pain deep-dive — 5-layer slicer v2.0 at 9.95 precision
- [x] Promise / MTR — "I help you get paying clients for your unique business"
- [x] 5-min lead magnet video — source text + NotebookLM
- [x] Unique Business sequence spec
- [x] Infographic Episode Scripts v2.0 — 43 slides across 8 episodes
- [x] Product Builder (Blueprint Generator)
- [x] Litmus test: Alexander through Product Builder
- [x] Founder landing pages: Oyi (`/oyi`), Sergey (`/sergey`), Sandra (`/sandra`)
- [x] Monetization streams — 5 mechanisms defined

### UX & Platform
- [x] Tour completion — 5-space onboarding walkthrough
- [x] Deep UX/UI pass — blocks, templates, brandbook
- [x] Bio-Light theme implementation
- [x] Premium visual research
- [x] Profile upgrades with categories
- [x] Fast design workflow
- [x] Onboarding flow polish
- [x] Rename GROW → ME
- [x] Logos (platform + modules)
- [x] Daily use case (Learn/Meet/Build)
- [x] Integrated product building workflow — roast enhancement

### Documentation & Intelligence
- [x] Planetary OS Assembly v1.1 (4 transcripts integrated)
- [x] Holomap v2.1 (12 perspectives × 7 stages)
- [x] 74 Phase Shift Domains codified
- [x] Holomap monthly ritual — first reading done
- [x] Phase shift: "Copernican Inversion" → "Founder-First Inversion"
- [x] Domain 70: Resonance Field
- [x] Domain 71: Weak Tie Resonance
- [x] Domain 72: Signal-First Tribe + Resonance Sort Protocol
- [x] Domain 73: Dual-Frequency Distribution
- [x] Domain 74: Playbook-as-Lead-Magnet
- [x] Domain 75: Ease Protocol — founder's operating mode IS transmission frequency
- [x] Domain 14f: Grind Addiction deepening — structural misidentification of what creates results
- [x] Holomap Day 36: "Activation" — first social posts, instrument calibration protocol
- [x] Unique Business Playbook — Principle 13 (Grind Addiction Diagnosis)
- [x] Communications Playbook v3.2 — §10b Grind Addiction Content Weapon *(was: Epicenter Broadcast Playbook; renamed 2026-04-18)*
- [x] Morphogenetic Navigation — Grind Addiction Interference Pattern section
- [x] Alexander's OS — Ease Protocol operating section
- [x] Alexander's Unique Business v8.1 — Grind Addiction Download + social activation
- [x] Social activation: Telegram + Instagram + Facebook (3/9 surfaces)
- [x] Facebook profile overhaul (bio, cover, featured, pinned post)
- [x] Venture Dashboard copy overhaul (public-facing, data-forward)
- [x] HLS video background on `/` (Mux stream)
- [x] Unique Business Playbook — Artifact 3 enhanced with Resonance Sort Protocol
- [x] Marketing Playbook — Dual-Frequency + Playbook-as-Lead-Magnet patterns added
- [x] Domain 76: Return to Center ("Copernican Inversion" retired)
- [x] Domain 77: The Descent Octave (consciousness → matter)
- [x] Domain 78: The Planetary Holomap (World-As-Is / Golden Age)
- [x] Domain 79: The Question Collapse (question = content = lead magnet = visibility)
- [x] 27-Perspective Article deployed at `/integral_theory_upgrade1` (bilingual, dark theme, CC BY-NC-SA 4.0, collaborator invitation)
- [x] Mandatory auth gate (`RequireAuth.tsx`) — all pages gated except homepage + public surfaces
- [x] Methodology carousel v2 — 7 slides, infographics generated, milestones 7-note octave woven in
- [x] Dantian correction across all docs (Upper=Mind, Central=Heart, Lower=Gut)
- [x] Glassmorphic logo update

### Sprint History
- [x] Jan 3-29: Network School — 27 days, functional MVP, 5 growth paths, ZoG + QoL onboarding
- [x] Feb: UX polish, data model, methodology crystallization
- [x] Mar: Canvas sessions (5 founders), methodology proven, first revenue
- [x] Apr 7-8: Karime Session 2 (shadow reframe to 9.4), CRM v3.0, social activation (TG+IG+FB). Oyi $516 gift. 75 domains. Grind Addiction integrated
- [x] Apr 9-10: Karime Session 3 (216 min — Heartbreak Mechanism). Pipeline activated (Patricia ZoG, José video, Oluwa scheduled). CRM v3.2 (25 contacts). Content pillars locked
- [x] Apr 11: 27-Perspective Article deployed. Domains 76-79. Auth gate. Methodology carousel v2. Question Collapse principle. 3 DMs sent. 79 domains total
- [x] **Apr 15: Oluwa + Oyi impromptu transmission** — 80-min three-way Zoom, Fathom recorded. 6 anchor formulations in Sasha's own voice (Recursiveness of the Gift, Self-Knowledge Collapses Workaround Industry, Business as Beehive, Grind as Mind Virus, Effortless Exciting Intensity, Copernican "I Am" Manifest). 2 witness formulations (Oyi's *"100% of limitations you fight for"* + Oluwa's *"Teaspoon or bucket?"*). 3 decisions surfaced. Three-depth pattern (Heart → Mind → Gut) empirically observed on a recording for the first time
- [x] **Apr 16 Day 42: April 15 metabolized into 7 corpus artifacts** — `alexanders_unique_business.md` v8.6 Download + v8.7 postscript · `unique_business_playbook.md` Principle 13 v1.1 + Principle 14 + Copernican Inversion enrichment · `open_questions_from_oyi_session.md` (3 decisions parked, then 2 answered) · `april15_repurpose_plan.md` (7 clips + essay outline + AI-context primer + planetary slice) · `morphogenetic_holomap.md` Day 41 addendum ("Emanation" center, Heart row complete, P3+P7 Stage 4) · `session_log.md` Day 41 addendum 5 · `ai_tasks/PENDING_playbook_discover_polish.md` (design brief, P0)
- [x] **Apr 16: Decision 1 (Licensing) answered ✅ YES** — 11-row negotiation checklist drafted. Decision 2 (Scaling) answered ✅ as Sequence C — three parallel tracks (Sessions + Licensed Distribution + Field Recordings). Decision 3 (Cadence) still open
- [x] **Apr 14-17 Days 40-43: Oyi Mexico Intensive — the first in-person hacker-house** — 4 days of collective creativity, then a "lil alone time" prescription. Villa + scooters + fruits + Pacific. Doubled as licensing negotiation window. Oyi's post-wrap word: *"This may be the best view in town. I am thankful. When Sasha finishes with you for 4 days of creativity and prescribes a lil alone time 🌹"* and then *"One for the books. #Historical #OperationTimeCapsule #UniqueIsALifestyle #WeGoodOvaHere. Sasha has some potent medicine for us all. I'm glad I'm along for the ride wherever this is going. I'm in."* Proof that the hacker-house / collective venture building format works. Sasha immediately invited the next wave: *"Anyone wants to fly in and join the next one where we grow from two people to more?"* → @smaksmak (Sergey) · @doctoraquantum (Karime) · @SandraJayahniaOtto · @aleksaprosperitylabs
- [x] **Apr 18 Day 44: Kirill joins as the 7th founder — the Collective self-identifies** — *"There's something poetic about being the 7th note in this octave. In music, the 7th is the tension that longs to resolve into something new."* Kirill Yemelyanov (@kemelyanov): serial entrepreneur (17 businesses, from maritime navigation to AI platforms), integral practitioner, neuro-coaching trainer. Currently building **QWATRA** (AI-powered business interface system) + **GrowFox** (health ecosystem) + educational freedom-architecture projects. Already in CRM as licensee + COLLABORATOR; now in the founder chat. **Karime's proposal lands the same day:** a collective call where each founder reveals their magic in a small window, then exchanges full sessions with each other from there onwards. *"I am grateful for the energy, support and inspiration you continuously provide to each one of us... It feels very special and nourishing to have someone believe in my magic so strongly... You truly are devoted to the blossoming of human expression. At that, you have already succeeded by just touching those who have received you thus far."* — Karime. The 7 originals now co-identify as a "we" with emerging native vocabulary: `#OperationTimeCapsule` · `#UniqueIsALifestyle` · `#WeGoodOvaHere` · "Earth Ship" · "the 7th note in the octave."

### Specificity Loop / Holonic Franchise (Day 50-51)

- [x] **Apr 24 Day 50: Knoware article modal added to /codex** — Sasha drafted the 350-word LinkedIn-shaped article (*"I made the same AI think 42% better"* — A/B test, +42% on deep reasoning, −21% on everyday tasks, "Knoware" as the named layer). Modal accessed via new third hero CTA *"Why this works"* (cyan tint, sits next to *Start here* + *Unlock Premium*). Plants the Knoware category Sasha owns; reframes /codex from prompt library to "the surface where Knoware lives." Files: `src/modules/ai-os/AiOsPage.tsx`.
- [x] **Apr 24 Day 50: Macro-bridge added to /zone-of-genius after Appleseed card** — *"What if your shining this top talent bright IS your business?"* placed right after the user's Appleseed reveal, before the Resonance Rating. The Gap section bullets got mc-cross-star image markers replacing plain `–` dashes. This is the seed-question that made Day 51's Specificity Loop discovery possible — the canonical example of the Principle 15 frequency at page-level scale. Files: `src/modules/zone-of-genius/AppleseedDisplay.tsx`.
- [x] **Apr 24 Day 50: Lowercase rail labels** — *REQUEST GUIDANCE* → *request guidance*, *SETTINGS* → *settings* (text-transform lowercase, font-size 0.78→0.82rem, letter-spacing 0.14→0.06em). Fixes truncation at narrower viewports. Files: `src/components/game/SpacesRail.tsx`.
- [x] **Apr 25 Day 51: Specificity Loop (Principle 15) codified** — `unique_business_playbook.md` v4.3 → v4.5: new Principle 15 named, frequency *"What if [witnessed] IS [bigger truth]?"* documented, three tiers per reveal (resonant/partial/off), specificity-as-rebranded-precision named, dual-treatment (framework + artifact) explained, `lead_magnet` cross-reference. `phase_shift_technology_library.md`: Domain 81 added (a-j sub-sections in Domain 80's voice — discovery, architecture, why-it-converts, why-it-compounds, strategic-collapse, anti-pattern, implementation, single-question-beneath, relationship to other domains, one-sentence version).
- [x] **Apr 25 Day 51: Matrix v2 shipped to all six in-funnel reveals** — `src/lib/resonanceMatrix.ts` (NEW): `MASTER_MATRIX`, `ResonanceMatrix` type, `resonanceMessage()`, `SPECIFICITY_PROMPT`, `ResonanceMatrixContext`, `ResonanceMatrixProvider`, `useResonanceMessage()` hook with three-tier resolution priority. `src/components/ui/ResonanceRating.tsx` refactored to read messages via the hook. Six callers wired by step key (`appleseed`, `excalibur`, `icp`, `pain`, `tp`, `landing`). Generic *Thank you! 🎯 Perfect resonance!* retired from the funnel.
- [x] **Apr 25 Day 51: Per-founder Specificity Matrix shipped as UBB artifact #19** — added to `ArtifactKey` union + `PHASE_A_CANVAS` (after `value_ladder`); URL slug + label in constants; generator prompt in `supabase/functions/_shared/ubb-prompts.ts` (uses Sasha's master matrix as canonical few-shot example for SHAPE/FREQUENCY only; takes locked uniqueness + myth + tribe + pain + promise as input; outputs 6×3 matrix in founder's voice). `lead_magnet` config enhanced with framework cross-reference. `SpecificityMatrixView` table renderer (6 stages × 3 tiers) with structural detection. Files: `src/modules/unique-business-builder/{types,constants}.ts` + `screens/GenericArtifactScreen.tsx` + `supabase/functions/_shared/ubb-prompts.ts` + `src/pages/PublicDossier.tsx`.
- [x] **Apr 25 Day 51: Holonic Franchise legal layer shipped** — `LICENSE` replaced with **PolyForm Noncommercial 1.0.0** canonical (73 lines). `LICENSE.md` header clarified to docs-only scope. `DISTRIBUTOR_AGREEMENT.md` v0.1 written (15 sections: 10% rev share, $1K/month free tier, Stripe Connect Express auto-split as preferred default, monthly reporting, audit right, brand sovereignty + optional "Powered by", opt-in commons under CC BY 4.0, modifications-stay-with-you, prospective-only changes, dual licensing for enterprise, spirit clause). `README.md` rewritten with three-license model + Self-Hosting section + *What it becomes when you fork* table. `CONTRIBUTING.md` written. `.gitignore` updated. **Manual steps remaining for Sasha:** create `.env.example`, run `git rm --cached .env`.
- [x] **Apr 25 Day 51: Repo public link surfaced in three platform locations** — `/game/settings` footer (*"Source-available. Fork for yourself or your community — free. Going commercial? 10% revenue share, you keep your brand."*); `/playbook` footer (*"The method is open to read. The platform is forkable. Run it for your own community — under your own brand. 10% to commons if you go commercial."*); `/codex` copyright line (`code PolyForm NC (fork on GitHub)` alongside `docs CC BY-NC-SA 4.0`). All linked to `https://github.com/alexanderkonst/evolver-grid-site`.
- [x] **Apr 25 Day 51: Holonic Franchise model strategy doc written** — `docs/02-strategy/holonic_franchise_model.md` v1.0. Captures 5 ingredients (PolyForm NC code + CC BY-NC-SA docs + Distributor Agreement + per-founder Specificity Matrix + opt-in commons), comparison table to other models, why this resolves alignment without tokens, what each distributor gets, what the commons becomes over time, implementation status, strategic sequencing, six open tuning questions for v1.1.
- [x] **Apr 25 Day 51: Six business-model plays mapped through Heart/Mind/Gut** — Conscious Entrepreneur (user) · Purpose Coach · Platform Distribution · Venture Studio · Community White-Label · System License. Synthesized matrix of tensions + recommended sequencing: Phase 1 = #1+#2+#3 (Holonic Franchise foundation, shipped today); Phase 2 = #5; Phase 3 = #4; Phase 4 = #6. Captured in session log + `alexanders_unique_business.md` Day 51 night entry.
- [x] **Apr 25 Day 51: UI harmony wave** — route-aware backgrounds in GameShellV2 (`pageOwnsBackground` + `isWorkingRoute` flags; working routes get warm radial-gradient calm canvas; landing routes keep video; AI OS no longer double-stacks shell video on top of page video). `--skin-panel-wash-quiet` upgraded to warm radial gradient with focal point at top-right (peach/amber `rgba(255, 200, 130, 0.55)` fading to calm cream); React style switched from `backgroundColor` → `background` to render gradients. KPI cards (`VentureDashboard.tsx`) centered uniformly. Dashboard subtitle: *"The methodology, applied — in real time."* → *"Built in the open. Paid in the open. Open-source methodology."* AI OS hero: *"The OS for any AI. A different kind of cognition."* → *"Instant install. Permanent level-up to AI cognition."* Sub-subtitle: *"For the 1% who treat AI as a thinking partner..."* → *"Same model. Different conversation."* Rail label: *"request guidance"* → *"chat with us"*. ZoG headline halos bumped + soft radial scrim added for legibility on the variable-brightness sparkle background.
- [x] **Apr 25 Day 51: resonance_events table migration drafted** — `supabase/migrations/20260425000001_resonance_events.sql` (NEW). Unified telemetry table for all reveal-with-rating events across the funnel. Append-only, RLS-enabled, anonymous-friendly. Captures `message_seen` so per-founder matrix variations are reconstructable. Lovable prompt at `docs/05-specs/resonance_events_lovable_prompt.md`. Awaiting Sasha to apply via Lovable session.

---

## The One Rule

> **"I don't need a better funnel. I need more people inside it."**
>
> The diagnostic: **"Is this blocked by traffic data I don't have yet?"** If yes → send more messages first. If no → build it.

---

*Roadmap v4.4 — April 12, 2026 (Day 40. 79 domains. Auth gate live. Article deployed. Carousel ready. Question Collapse: the question IS the content IS the lead magnet IS the visibility. 3 DMs sent. $677 cash, $6.9K total)*

*Roadmap v4.5 — April 16, 2026 (Day 42. Holomap center = "Emanation." April 15 Oluwa + Oyi transmission metabolized into 7 corpus artifacts. Licensing ✅ yes with 11-row negotiation checklist. Scaling = Sequence C (Sessions + Licensed Distribution + Field Recordings, parallel and compounding). Cadence still open. `/playbook/discover` polish = P0 unblock for licensing distribution. The signal now travels without the apparatus; the apparatus is for scale.)*

*Roadmap v4.6 — April 17, 2026 (Day 43. Funnel Clarity Sprint opened. Q1 answered — step 2/3 stay separate, value ladder already enforces the surgical boundary. Q2 answered — keep both Cowork and Claude Code lanes, bridged by `ai_tasks/PENDING_*.md`. Four UI quick-wins shipped same day: Panel 3 opacity /15→/60, ME rail flicker eliminated, Journey SectionsPanel collapsed to progressive two-item state, redundant top-center logo confirmed hidden on `/playbook/*`. Five heavier items handed to Codex lane — F1 dual-CTA, F2 email-before-ZoG, F3 completion ceremony, F4 ResonanceRating storage, F7 Stripe webhook verify-and-advance.)*

*Roadmap v4.6 — April 17, 2026 (Day 43. Funnel Clarity Sprint opened. Q1 step 2/3 merge = keep separate — two distinct ladder rungs, progressive unlock enforces the sequence. Q2 lane = keep both, bridge via ai_tasks/. F0 quick wins: panel-3 opacity, ME-rail flicker, 2-item journey pane, duplicate-logo removal — all Cowork-lane, same session. F1-F7 Codex-lane: two-CTA hero, email-before-ZoG magic link, step-1 completion payoff animation, resonance rating, Stripe verify-and-advance webhook. The landing IS the store; the completion IS the unlock; the unlock IS the nudge into paid progression.)*

*Roadmap v4.7 — April 18, 2026 (Day 44. Methodology enrichment from the productivity skill. Three additive changes, no content lost: (1) new `⏳ Waiting On` section between Weekly Scope and Current Status — seven items lifted from the implicit "blocked on other side" backlog; (2) `due` / `since` / `started` micro-notations documented in the top callout so timing is machine-readable; (3) four explicit triage rules documented so the AI can run them on "update the roadmap" / "triage". Skipped: four flat buckets, weekly-rotation of Done, "Someday" — all regressions against existing structure. The roadmap stays the tracker; no parallel `TASKS.md`.)*

*Roadmap v4.8 — April 18, 2026 (Day 44. Consent-boundary structurally encoded + holomap redesign task seeded. New `🤝 Other Founders' Canvases — Held by Default` subsection between Active Backlog and Parked, with six rows (Karime · Kirill · Sandra · Alex · Sergey · Oyi). Mechanism: `.agent/auto-execute-policy.md` §3 blacklist adds `docs/02-strategy/unique-businesses/*_unique_business.md` except `alexanders_unique_business.md` — structural rule is stricter than the `[hold]` tag, so a missing tag cannot accidentally un-hold a canvas. Non-canvas business (Sandra rev-share, Sergey Build-boundary, Taylor & Tracy, Oyi licensing) stays in the main roadmap because those don't touch the canvas files and are explicitly consented deal-making. New Active Backlog item 27: Holomap redesign 12×6 → 27×7 with masculine/feminine axis; brief prepared at `ai_tasks/NEW_CHAT_27x7_holomap_redesign.md` for the fresh chat Sasha is about to open.)*

*Roadmap v4.9 — April 18, 2026 (Day 44. **The Collective self-identifies.** Oyi Mexico Intensive wrapped Apr 17 — 4-day hacker-house, Oyi's *"one for the books"* + `#OperationTimeCapsule` tag cluster. Kirill joins Apr 18 as 7th founder ("7th note in the octave"). Karime proposes collective call — each reveals magic in a window, then exchanges full sessions. Sasha invites Sergey · Karime · Sandra · Alexa to next hacker-house. Current Status updated: **7 founders · $1,377 cash / $1,931 total · Day 44 · Phase = ACTIVATION → EMANATION → COLLECTIVE**. Holomap center shifts from "Emanation" toward "Collective" — next reading should surface the P2+P8 move (Sasha alone → Sasha inside a collective). Twelve marketing enrichments from Kennedy 2008 shipped same day, separate commit. This version stamp sits *on top of* v4.8's consent-boundary + holomap-redesign encoding — both v4.8 and v4.9 land on Day 44 from parallel threads of work.)*

*Roadmap v5.0 — April 21, 2026 (Day 47. **Surface Reconstitution.** One carpentry pass — canvas ↔ code parity reached. Twelve+ funnel / shell / copy items landed: Step 1 moved to `/playbook` (no more `/discover` slug); step colors UV→IR; step names include "Step N." prefix; "See how" disclosure retired, substeps always visible; "See one proven strategy" → "Recommended How-To", collapsed by default; hair-line separators removed; playbook circle retired from landing; hero copy locked "Find Your Top Talent. Productize It. Build It, Launch It, Scale It Alongside Impact Entrepreneurs" with v4 neon gradients (saturated 40-55% lightness, not washed-out); Panel 3 reduced to near-transparent; `/path` fully public inside shell with `hideLogo`; `/zone-of-genius` inside shell (upfront email gate removed), result page re-sequenced, Save redesigned as compact pill in footer row; Profile Settings consolidated into tabbed `/game/settings`; SpacesRail icons swapped to Cormorant glyphs (✵ ❂ ✹ ⚭ ⇶ ⬢ ⚛); Guest placa non-clickable; Log In button hidden on landing; Journey pane = three fixed items (Start Here / The Playbook / The Path); `user_business_artifacts` migration shipped + seeded + `/my-artifacts` page live; money-back guarantees inlined per step in canvas. Active Backlog items 27, 28, 29 moved to Done. W19 + W20 moved to Done. Holomap center proposed: **"Coherence"** — Sasha to confirm. P8 (Platform as Nervous System) advanced Stage 3 → Stage 3+. The Wednesday launch now has a coherent surface to land on.)*

*Roadmap v5.2 — April 25, 2026 (Day 51 — **Codification**). Two days, one architecture: the Specificity Loop became both a named principle (Playbook P15 + Phase Shift Library Domain 81) and an operational artifact (per-founder matrix as UBB #19 + runtime hook with three-tier resolution). The Holonic Franchise model got its full legal stack (PolyForm Noncommercial 1.0.0 on code · CC BY-NC-SA 4.0 on docs · MIT on Anthropic-derived skills · Distributor Agreement v0.1 with 10% rev share + $1K/month free tier + Stripe Connect Express auto-split + opt-in commons under CC BY 4.0) and its strategy doc (`holonic_franchise_model.md` v1.0). Repo is publicly fork-ready; link surfaced in /game/settings + /playbook + /codex footers. Six business-model plays mapped (Conscious Entrepreneur · Purpose Coach · Platform Distribution · Venture Studio · Community White-Label · System License) with 4-phase sequencing. UI harmony wave on working routes (warm radial calm canvas via `--skin-panel-wash-quiet`; KPI uniform centering; dashboard + AI OS hero copy refresh; rail label *chat with us*). Manual steps remaining for Sasha: create `.env.example`, `git rm --cached .env`, apply resonance_events migration via Lovable. The first $555 stranger remains the unfired Si–Do — apparatus has more depth to receive the eventual send, but the send itself is what fires the 27th.)*

*Roadmap v5.1 — April 21, 2026 (Day 47 late night — GFOA Patch + Skin System). Three workstreams converged in a single late-night pass: (1) **GFOA v1.1 + v1.2 hero redesign** — two-layer recognition-first hero (impact "You can't clearly say what you do." + echo "So people don't buy."), editorial ornament `——— ✦ ———` between layers (gradient rule + gold star), color scarcity (7 highlights → 3: Top Talent / Productize / Scale), 4 `<p>` blocks for path rhythm, container compressed to fit one viewport. Rainbow retires on landing; `/playbook` spheres keep full UV→IR octave. (2) **Copy + CTA refinements** — Path hero upgraded to 7-beat all-periods rhythm with "Investors Loving It" added as Step-6 colored beat; Step 2 essay rewritten in Sasha's exact language ("Personality tests give you unmonetizable 'too long didn't read' reports", "The catch is that there is a looong way...", "laser beam that has this same specificity"); secondary "See the exact playbook" restored from text link to full liquid-glass button per hierarchy-not-removal principle; Panel 3 wash lightened `white/[0.21]` → `0.38`. (3) **Skin system shipped, preview-only** — new `SkinContext` with `pushTemporarySkin` + cleanup; `data-skin` attribute on `<html>`; `/preview` route renders landing in Navy+Gold without touching Aurora; `src/index.css` skin-token layer with Aurora defaults + Navy+Gold overrides; `MethodologyLandingPage.tsx` + `PlaybookHero.tsx` + `GameShellV2.tsx` refactored to `var(--skin-*, aurora-fallback)` so Aurora renders byte-identical when no skin is set. Sasha's framing: *"we're not going to switch it on, but we're going to prepare, and we're going to have a test ground for me only."* New Active Backlog items 39-43 added and marked ✅ Day 47. Wednesday launch remains locked on Aurora; Navy+Gold sits latent, reachable only by typing `/preview`.)*

*Roadmap v5.2 — April 21→22, 2026 (Day 47 → Day 48, autonomous overnight pass). Sasha left the computer open: "continue the skin work, dear, do not stop until you finish." Scope: complete what v5.1 started so `/preview` renders the ENTIRE site coherently in Navy+Gold, not just the landing. Shipped: (1) **Preview persistence across routes** — SkinPreview rewritten as thin entry ramp (`setSkin('navy-gold')` + `Navigate to /`). New `PreviewBanner` global component mounted in App root — renders on every route while skin !== 'aurora', click → setSkin('aurora') + navigate home. (2) **~30 new skin tokens** covering text semantics (text-strong/faint/hint), rules (strong/medium/hairline/faint), links, cards, tints, gold accent, selected state, inputs, darkroom, callout. (3) **Navy+Gold selector-scoped glass overrides** — `[data-skin="navy-gold"] .liquid-glass-dark/glass/glass-strong` so CTAs read gold-family not muddy gold-over-navy. (4) **11 surface migrations to `var(--skin-*)`** — StepCard, PlaybookShell, PathPage, ZoneOfGeniusEntry, AppleseedDisplay, AppleseedRitualLoading, ZoneOfGeniusAssessmentLayout, Step1-4 talent assessment screens, Settings. Rainbow UV→IR octave preserved in both skins (Sasha's rule). Build + type-check clean, Aurora byte-identical on `/`. New Active Backlog item 44 marked ✅ Day 47→48. When Sasha wakes up he can visit `/preview`, tour the whole site in Navy+Gold (landing → playbook → path → ZoG → settings), and press the floating Exit banner to return home in Aurora. The Wednesday launch remains Aurora; Navy+Gold is now a real preview, not a landing-only demo.)*
