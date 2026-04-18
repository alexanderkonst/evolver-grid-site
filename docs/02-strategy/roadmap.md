# Roadmap — Planetary OS Emergence

> **This is not a project tracker. This is the living navigation instrument for Alexander's life work.**
>
> **How to use:** "Read the roadmap and tell me what to focus on this week" · "What should we bump up?" · "Capture this idea"
>
> *Last updated: 2026-04-17 — Day 43. Holomap center = "Emanation" (Day 41 reading). April 15 Oluwa + Oyi transmission metabolized into 7 corpus artifacts. Decision 1 (licensing) = ✅ YES with negotiation checklist. Decision 2 (scaling) = ✅ Sequence C (three parallel tracks: Sessions + Licensed Distribution + Field Recordings). Decision 3 (cadence) still open. **Funnel Clarity Sprint opened April 16** — landing → playbook flow spec, progressive unlock, two-CTA hero, email-before-ZoG, adapted resonance rating. Q1 (step 2/3 commercial packaging) = ✅ BUNDLE (Steps 2+3 = Ignition $555; Steps 4+5 = Build $1,111 + rev share cohort). Principle: steps are methodology, containers are commerce — they don't have to be 1:1. Q2 (lane) = ✅ parallelize — Cowork for corpus/docs/planning, Claude Code for heavy src/+supabase/ passes. The signal now travels without the apparatus; the apparatus is now for scale.*

---

## Contents

1. [This Week's Scope](#-this-weeks-scope-april-7-13)
2. [Current Status](#current-status)
3. [Active Backlog](#-active-backlog)
4. [Parked / Future](#-parked--future)
5. [Completed](#-completed)

---

## The Reframe (April 10, 2026)

> **Client sessions and sales ARE the platform build.**
>
> Every client session deepens the methodology, generates artifacts, produces testimonials, and proves the system. The session IS the product. The product IS the build. The build IS the platform.
>
> *"This is not just building an aligned blueprint. What this is is awakening through business development while ACTUALLY building a unique business."* — Karime Kuri

---

## 🌑 This Week's Scope (April 14-20)

> **Energetic context:** Oyi in Mexico. Oluwa transmission landed April 15 (impromptu, not Wed livestream). Sequence C now the operating scaling model. Licensing negotiation in-flight.

| # | Seed | Path | Priority | Notes |
|---|------|------|----------|-------|
| W1 | **Oyi Mexico Intensive** (Mon-Sun) | Build | 🔴 | Villa + deep Build work. First in-person intensive at length. Now doubles as licensing negotiation window |
| W2 | ~~Oluwa Adams Livestream (Wed 10:30am CDMX)~~ → **April 15 transmission landed impromptu** | Build + Distribution | ✅ | Happened April 15 as three-way Zoom (Sasha + Oyi + Oluwa), 80 min, Fathom recorded. 6 anchor formulations, 2 witness formulations, 3 decisions surfaced. Metabolized into 7 corpus artifacts |
| W3 | **Patricia Reed ZoG follow-up** | Sales | 🔴 | Did she paste back the JSON? Get her distilled uniqueness score. Pipeline → quiz completion |
| W4 | **José da Veiga ZoG quiz** | Sales | 🔴 | Guide to quiz. He watched video, articulated the exact pain. Ready |
| W5 | **Karime: Score Myth + Tribe v1.2** | Build | 🔴 | Body-score only. Heartbreak rewrite awaiting validation |
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

## Current Status

| Metric | Value |
|--------|-------|
| **Phase** | ACTIVATION → EMANATION. 25 contacts. CRM v3.2. $677 cash. 3/9 social surfaces. April 15 transmission delivered. Licensing in negotiation |
| **Cycle** | April 14-20 (Waxing). **79 Phase Shift Domains. 14 Playbook Principles.** Oyi in Mexico. April 15 impromptu transmission landed. Day 42 of the active sprint |
| **Holomap center** | **"Emanation"** (Day 41 reading). The signal now travels without the apparatus. Heart row complete (P5, P6, P7 ≥ 9/10). P3 + P7 transitioned Stage 3→4 (Maturation) |
| **Location** | Mexico City |
| **Revenue** | **$677 cash** ($566 Oyi + $111 Karime). **$6,277 rev share pending** ($277 Sergey + $3K Taylor + $3K Tracy). Sandra TBD. Oyi list = new projected revenue surface |
| **Focus** | **Sequence C: Sessions (tree) + Licensed Distribution via Oyi (spine) + Field Recordings (multiplier). Tracks run in parallel, compound each cycle** |
| **Key milestone** | April 15 Oluwa + Oyi transmission — 6 anchor formulations, 2 witness formulations, 3 decisions surfaced. First artifact of native emanation. Cowork captured into 7 downstream corpus artifacts |
| **Key decisions** | $555 fixed price. Build boundary = flexible by client type, 12-week max. Sessions = build. **Licensing to Oyi ✅ yes (v1 terms in negotiation). Scaling = Sequence C (both scales, in parallel). Cadence = still open** |

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
| 3 | Karime: score Myth + Tribe v1.2 | Build | 🔴 |
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
- [x] Epicenter Broadcast Playbook v3.2 — §10b Grind Addiction Content Weapon
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
