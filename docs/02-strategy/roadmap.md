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
| F1 | Landing hero: add second CTA "See the Playbook" next to "Claim your gift" | Claude Code | 🔴 | Scrolls to the circle infographic OR routes to `/playbook/discover` — pick one, A/B later |
| **EMAIL-BEFORE-ZoG (progressive profile)** | | | | |
| F2 | Capture email *before* the ZoG quiz, not after. Magic-link auth on completion; user returns signed-in with a "set password" prompt as optional follow-up | Claude Code | 🔴 | Current flow gates email at save time (`Auth.tsx` stashes to sessionStorage). Invert: email gate first, then quiz, then write snapshot against already-known user via anon claim OR pre-created profile |
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
| **Phase** | ACTIVATION → EMANATION → **COLLECTIVE**. 31 contacts. CRM v3.4. **$1,377 cash** · **$1,931 total (cash + in-kind + rev share)**. 3/9 social surfaces. **7 founders** (Alexander · Oyi · Sergey · Alexa · Sandra · Karime · Kirill). Mexico intensive delivered. Hacker-house format proven. Licensing in negotiation |
| **Cycle** | April 14-20 (Waxing). **79 Phase Shift Domains. 14 Playbook Principles.** Day 44 of the active sprint. Oyi Mexico intensive WRAPPED Apr 17. Kirill joined the collective Apr 18 as 7th founder |
| **Holomap center** | **"Emanation"** → **"Collective"** (emerging post-Mexico-wrap). The signal that now travels without the apparatus is being *carried* by 7 originals who co-identify as a "we." Heart row complete (P5, P6, P7 ≥ 9/10). P3 + P7 transitioned Stage 3→4 (Maturation). *Next holomap reading should surface the P2+P8 shift — Sasha alone → Sasha inside a collective.* |
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
| 14 | Silent account creation + magic link (backend) | Infra | 🔴 |
| 15 | ZoG result persistence | Infra | 🔴 |
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
| **CORPUS / INSTRUMENT** |
| 27 | **Holomap redesign 12×6 → 27×7 with masculine/feminine axis** — structural upgrade to the Morphogenetic Navigation Holo Map to align with Domain 66 (27th Perspective), Domain 63 (Seven Number-Prisms), and the April 18 scaffold-engineering masculine/feminine framing. Brief at `ai_tasks/NEW_CHAT_27x7_holomap_redesign.md`. Do in a fresh chat with full context | Corpus / Navigation | 🟡 |

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
