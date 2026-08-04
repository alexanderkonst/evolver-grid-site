# Where Are You (the transition quiz) — Product Spec

*Module tracker: `docs/specs/quiz/quiz_tracker.md`. Source map: `docs/holomaps/transition_holomap.md` (Phase Shift Technology 124). Feeds the Ripeness Vector, Technology 123. Social physics of the mirror: Technology 125.*

---

## 0. AS-BUILT — vNext (lean 3-question edition), refreshed August 3, 2026 (Day 142)

**This section describes what is actually live at `/quiz` today, verified against `engine.ts` and `TransitionQuizPage.tsx` on Day 142.** Everything below §0 (Phase 1 through the wireframes) documents the *original* 7-question / 9-aspect-question design and its roast history. That design was superseded before Phase 2 shipped by a leaner edition ("vNext") — the earlier content is preserved verbatim below as genealogy (per corpus convention: quote, don't delete), not as the current build. An external quiz architect reading this file should treat §0 as ground truth and everything after it as historical design record.

**Edition history:** vNext shipped as a 4-question edition (July 29). Q4 (the "clarity unlock" question) was cut the same day, making the live quiz a **three-question** edition. The Day 142 pass then replaced the two-screen commercial qualifier (Buying Frame + Means) with a **single soft threshold question**, removed the Recognition Delta reflection widget, tightened result copy, and ran the visual/UX design pass that §0.6 had previously deferred. This §0 reflects all of that.

**Governing sentence** (from the vNext SOW baked into `engine.ts`): *"A few questions are enough to locate the crossing. The conversation exists to see what is actually crossing."*

### 0.1 The three questions

| # | Question | Answer type | Purpose |
|---|---|---|---|
| Q1 | Stage placement — 7 first-person statements, pick the one that sounds like now | `Stage` (1-7) | Where they are on the transition arc. Stages 1-3 branch immediately to a no-ask ending (see §0.2); stages 4-7 continue. |
| Q2 | "How far has your uniqueness made it into the world?" — the Uniqueness classifier | `UniquenessCategory`: `discovery` \| `recognition` \| `integration` \| `vehicle` \| `transmission` \| `scaling` | Names which of the six uniqueness-articulation problems is live for them right now. |
| Q3 | Developmental position of the emerging work | `EmergingWorkStage`: `not_visible` → `suspected` → `felt` → `named` → `built` → `working` → `delivering` (7 values) | How far the "new thing" has actually gotten, independent of how they feel about it. |

Q1 alone determines the not-yet branch. Q2-Q3 (asked only at stages 4-7) are the **core answers** (`CoreAnswers` in `engine.ts`) that drive both the result copy and the routing decision.

**Q4 was cut** (2026-07-29). The former `ClarityUnlock` question no longer exists in the flow; the `clarity_unlock` DB column and any historical rows are untouched, the client simply stops sending it. Do not treat Q4 as live.

A post-result **threshold question** (`BuyingFrame`: `open` \| `open_no_history` \| `mixed` \| `closed`, shown in that order) appears only when `meetsDirectionCallGate()` already holds (see §0.3). It replaced (Day 142) the earlier two-screen sequence — a blunt paid-help-history question followed by a separate "is investing realistic?" Means question — with one soft question ("People cross this threshold alone or with real help. Where are you with that?"). History, openness, and means now read from that single choice. Every answer except `closed` leads to the Direction Call; `closed` ends in the honest no-pitch ending. The `Means` type and its DB column remain in the codebase for dataset continuity but **the Means screen no longer renders**.

The earlier 17-question / discriminator design (visible in the design conversation this SOW comes from) and the Phase-1 nine-aspect-question design documented from §1 onward in this file were both explicitly rejected by Sasha as overkill in favor of this lean edition. One thing carried forward unchanged from the earlier design: **"Money" not "Economy"** in all user-facing copy, and no internal jargon on screen.

### 0.2 Endings matrix

Five distinct endings, not one generic result screen:

| Ending | Who gets it | What it looks like |
|---|---|---|
| **Settled** (not-yet, stage 1) | Q1 = 1 | One honest line: nothing is broken, no ask, no CTA. Optional low-key email capture ("send me the full map") was added later (see the tracker's "Decisions Sasha resolved" — Settled does get an optional email, contrary to the original Phase-1 wireframe). |
| **Itch** (not-yet, stage 2) | Q1 = 2 | Stage-matched gift: what the feeling usually turns into + the sign it's becoming real. Optional email, skippable, skipping is a real undamaged exit. |
| **Tremors** (not-yet, stage 3) | Q1 = 3 | Same shape as Itch, content tuned to stage 3. |
| **Full-read** (standard result) | Stages 4-7, not crossed-peer | The 3-beat lean result (Chapter / Real Problem / What Comes Next, §0.4), then the threshold question, then the Direction Call door — unless the threshold answer is `closed`, which ends in the honest no-pitch ending. Because the gate is now `stage >= 4` (see §0.3), every non-peer full-read reaches the threshold question; the "no CTA at the result itself" branch is no longer reachable. |
| **Crossed-peer** | `isCrossedPeer()` — see below | A different conversation than a Direction Call, offered as such: for someone whose uniqueness already monetizes (`scaling`), or who is at stage 7 with the work already `working` or `delivering`, or the remaining friction being `transmission`-shaped. Replaces the standard result body, the Direction Call bridge, and the threshold question entirely. |

`isCrossedPeer()` fires independent of stage when `uniqueness === "scaling"` — someone whose positioning already converts is a peer regardless of which stage statement they picked.

### 0.3 The two engines

Both live in `src/modules/transition-quiz/engine.ts` (pure functions, no React/i18n/Supabase):

1. **Placement + routing engine** — `meetsDirectionCallGate()`, `isCrossedPeer()`, `computeRouting()`, `routeAfterBuyingFrame()`. Decides which of the five endings above applies and whether the threshold question gets shown at all. **The Direction Call gate is now simply `stage >= 4 && stage <= 7`** (widened 2026-07-29). It no longer conditions on uniqueness, work stage, or clarity — those are still computed and logged for the dataset, they just no longer gate the Direction Call. `isCrossedPeer()` short-circuits to the peer door before the gate; a `closed` threshold answer routes to `none` (honest ending) via `routeAfterBuyingFrame()`.
2. **Result-copy key engine** — `chapterKeyForStage()`, `resultTemplateKey()`, `workStageClauseKey()`. Picks which locale keys to render for the 3-beat result: Beat 1 (Chapter) is keyed by stage, Beats 2-3 (Real Problem / What Comes Next) are keyed by uniqueness category with a short supporting clause from the work-stage answer. (The former `clarityClauseKey()` is gone with Q4.)

A third small utility pair, `encodeShareState()` / `decodeShareState()`, round-trips a completed answer set through a base64 `?r=` URL param so a result can be shared or resumed with no server call — Supabase is write-only, for the dataset, never read to render the free result.

### 0.4 Current copy source

All user-facing text lives in the three locale files, not in code: `src/locales/en/common.json`, `src/locales/ru/common.json`, `src/locales/es/common.json`, under the `quiz.*` key namespace (`quiz.stageNames`, `quiz.result.chapter.<stage>`, `quiz.result.beats.<uniqueness>`, `quiz.result.workStageClause.<workStage>`, `quiz.buyingFrame.*`, `quiz.directionCall.*`, `quiz.notYet.settled.*`, `quiz.notYet.itchTremors.*`, `quiz.crossedPeer.*`). Locale JSON uses `returnObjects: true` (arrays/objects, not flattened indexed keys) — the array lengths and key sets are kept identical across en/ru/es. Day 142 copy edits (shortened integration-beat body, the `continueCta` "Turn your projects into one direction", the reworded threshold `quiz.buyingFrame` prompt/options, and Q1 option 6) were applied across all three locales in sync. Two key sets are now **orphaned** — present in the locale files but no longer rendered: `quiz.result.clarityClause.*` (Q4 cut) and `quiz.recognitionDelta.*` + `quiz.result.takeWhatNote` (delta widget removed, §0.6). Left in place per quote-don't-delete; safe to prune later.

### 0.5 Data schema (as-built)

Two Supabase tables feed the dataset, both RLS-on with zero client policies (service-role-only writes via edge functions):

**`transition_quiz_results`** (migration `20260728140000_transition_quiz_results.sql`, extended by `20260729120000_transition_quiz_vnext_columns.sql`) — one row per quiz completion, including not-yet completions:
- Base columns (Phase-1 design, still populated): `id`, `stage`, `identity_score`, `economy_score`, `fit_score`, `bottleneck_aspect`, `driver_aspect`, `pattern`, `route_shown`, `email`, `not_yet`, `locale`, `completed_at`, `created_at`. The three aspect-score columns are nullable and, in the vNext build, are no longer written by the current UI (they were Phase-1's nine-aspect-question output) — kept for schema continuity with any historical rows and because the edge function still accepts them.
- vNext columns (additive, all nullable so older deployments degrade gracefully): `uniqueness_category`, `emerging_work_stage`, `clarity_unlock`, `buying_frame`, `means`, `recognition_delta`, `direction_call_shown`, `result_template`. Of these, `clarity_unlock` (Q4 cut), `means` (Means screen removed), and `recognition_delta` (widget removed, §0.6) are **no longer written by the current UI** — kept for schema/historical-row continuity; the edge function still accepts them.
- Written by the `save-quiz-result` edge function (public, no-auth, `verify_jwt = false`), fire-and-forget from the client. Since data-hygiene batch #22 (2026-07-30) one person's passage is **one row, updated in place** (not additive inserts): the row is created at the not-yet ending or the full-read result, then updated by `id` when the threshold answer arrives.

**`quiz_email_signups`** (new, migration `20260729210000_quiz_email_signups.sql`) — one row per "send me the map" email capture, kept separate from the per-completion dataset above so there is one clean list of emails: `id`, `created_at`, `email` (not null), `stage`, `locale`, `source` (default `'transition_quiz'`). Written by the new `save-quiz-email` edge function, called alongside (not instead of) the existing email-on-completion-row logging, so both records exist independently. Same fire-and-forget contract: the quiz UI shows success optimistically regardless of whether the call lands.

Both tables are readable by the AI partner (never by the browser client) through the token-gated `quiz-results-export` edge function — see `docs/specs/lovable_redeploy_prompt.md` for the token setup.

### 0.6 Design pass (Day 142, August 1-3, 2026 — SUPERSEDES the "Phase 3 not run" note)

The visual/UX pass this section previously deferred **has now been run.** It was scoped by roasting the result page through the 27-perspective instrument (three rounds: meaning, mechanics, aesthetics) before any code, then shipped in five waves. Full detail lives in `quiz_experience_sow.md` → "Design pass (Day 142)"; the summary:

1. **Result ceremony, three acts.** The result had one visual event (the reveal card) and then a wall of undifferentiated serif. Now: the trajectory arc labels the previous/current/next chapter (was 6 empty label slots); the central read is the one framed body below the fold, carrying the reveal card's ivory + gold down; the witness quote gets its own margin voice; the progress thread completes to 100% on the read (was dying at 95%); a closing star seal ends the page instead of two grey links dissolving. Stages 1-3 gained the same chapter ceremony (name + arc) the full read has.
2. **Text halved, one soft question.** Result copy went ~230 → ~130 words; the Recognition Delta reflection widget and the "take what is accurate" hedge line were removed entirely (Sasha: "eats prime real estate, a halfway excuse"). The two blunt commercial screens collapsed to one soft threshold question (§0.1).
3. **Typography unified to three voices.** The client-facing read had mixed six sizes and two families (some lines fell through to DM Sans). Now exactly three: display serif (Cormorant, headings) · one reading voice (Source Serif 4, 1.02rem, one color, no opacity steps) · one smallcaps meta voice (eyebrows, witness name, quiet links).
4. **The lapis field.** `/quiz` was the only funnel surface on a flat wash while `/` has the house watercolor ground. It now renders the same `lapis-still-background.webp` as a fixed layer under the paper grain and phase vignette — the funnel is one continuous space.
5. **The field breathes; the arc is a constellation.** The lapis field recedes during questions (opacity ~0.55, desaturated), returns luminous at the reveal, settles at ~0.75 for integration (600ms, reduced-motion-safe). The trajectory arc gains quiet gold hairline threads sweeping in from beyond the reveal card into both ends of the track, with small star dots — the line of chapters reads as continuing past the visible seven.

Design tokens live in `TransitionQuizPage.css` (`--tq-gold` and one gradient; three type voices; `.tq-phase-*` driving the field). Accessibility carried through: `prefers-reduced-motion` disables every animation added here; focus states preserved.

The standing shadow-tripwire (§0.8) governed this pass: the CTA was strengthened only as much as the read was, and no sacred-language dressing was added to the qualifier.

### 0.7 Per-stage Top Talent reveal gift (as-built)

The **not-yet endings (stages 1-3)** each carry a stage-tuned pointer to the free Top Talent reveal (`/zone-of-genius`) — a quiet inline link woven into the ending copy ("the itch gets clearer when you can see what's itching…"), not a generic "sign up to see more" prompt. Intent: make the free reveal itself feel like it is already reading them accurately (see `docs/03-playbooks/unique_business_playbook.md` Part 0, "Precision Gap IS Product"). The **full read (stages 4-7)** does not currently surface a promoted profile element inline — an open backlog item (memory: "promote most-resonant deep-profile element into free Top Talent box") proposes lifting the single most-resonant field into the full read to lift activation, not yet built.

### 0.8 The quiz as sensory membrane (external 27-perspective review, July 30, 2026)

An external review framed the quiz as the platform's threshold organ: it senses a person's developmental position before the system offers a relationship. Standalone design (its own route, its own build, decoupled from the main app shell) is correct for exactly this reason — a membrane has to work before anyone has joined anything.

The review also named the standing shadow-warning for this design, recorded here verbatim as a tripwire to check against on every future change: *"At its worst, it could become a lead qualifier dressed in sacred language."*

The review's crystallization — claimable results seeding JOURNEY state, profile, and platform memory — has already shipped, in the Step 0 / claim / user_id batch (see §0.5 above for the data schema this produced).

### 0.9 Input-quality feedback from a paying client (July 31, 2026)

A paying client reported "no resonance" with his written articulation — the recognition click never fired in the moment — then self-authored his own accurate synthesis within 48 hours, unprompted, crediting the session's output as a springboard even though the final words had to be his own. Two product lessons follow, filed as open items, not yet built:

1. **Seed-data quality matters more than model quality.** His read was traced to a thin, resume-shaped import (a couple of factual lines) that skewed the whole articulation sideways. Thin input anchors the read wrong regardless of how good the downstream model is.
2. **Proposed fix: a free-form self-narration input.** Offer a 30-60 minute free self-narration (voice or text) as an input option alongside or instead of resume-shaped facts, for a "more global study of the person" before generating the articulation.

Open item, not scheduled: evaluate a self-narration input mode against the current fact-import path.

---

## PHASE 1 DESIGN RECORD (historical — superseded by §0 above)

*Everything from here through the wireframes documents the original 7-question / 9-aspect-question design (stage placement + 3 questions each for Identity/Economy/Fit) and its roast history. It shipped once, then was replaced before Phase 2 completed by the leaner vNext 4-question edition described in §0. Preserved verbatim for genealogy — do not treat any screen count, question count, or route name below as current.*

## 1.1 Master Result

**v1 (pre-roast draft, superseded):**
> "The quiz takes a person from 'something is off and I can't name it' to 'I know exactly where I am on my own journey, which part of my life is holding the rest back, and what moves next.'"

### 🔥 ROAST 1.1 (Deep, 3×3) — findings

**Cycle 1 — Clarity**
- 1.1a Point A specific enough? Mostly — "something is off and I can't name it" is a real, recognizable line. But it undersells Rupture (stage 4): someone who just got fired knows exactly *what happened*, they just don't know who they are now. "Can't name it" reads truest for stages 2-3; for 4-7 the gap is "I know something broke, I don't know what's next," not "I can't name it." Point A needs to cover the felt range, not just the itch.
- 1.1b Point B measurable? Yes, but it bundles three different outputs (position, bottleneck, next move) into one clause each, and "which part of my life is holding the rest back" is vaguer than what the product actually delivers (a named aspect: Identity, Economy, or Fit — not "part of my life").
- 1.1c One sentence? Yes.

**Cycle 2 — Honesty**
- 1.1d Does it actually deliver? Yes — S3/S4/S5/S6/S7 deliver stage, bottleneck, and next move in full.
- 1.1e Explainable to a 12-year-old? Yes: "you answer some questions and it shows you exactly where you're stuck and what to do next."
- 1.1f Do they want this, or do we think they should? They want it — it is the exact inverse of the liminality pain ("I carry something real, I can't say what it is, every method already requires the answer as input").

**Cycle 3 — What 1-2 missed**
- 1.1g Read aloud: "which part of my life is holding the rest back" trips on the tongue and is abstract. "What's actually holding me back" is plainer and matches how a person actually talks.
- 1.1h More visceral Point A available: borrow the precision already nailed in the ICP pain (Input #3) — the struggle is not just vagueness, it's that every framework assumes you already know the answer it's asking for.
- 1.1i More specific Point B available: name the actual outputs — stage, bottleneck, next move — instead of the vaguer "moves next."

**→ Fix applied.**

### v2 (current)

> **"The quiz takes you from 'something is off and I can't even say what' to 'I know exactly where I am, what's actually holding me back, and what happens next.'"**

Passes all 9 checks. Plainer, drops the abstract "on my own journey" and "part of my life," keeps one sentence, still explainable to a 12-year-old, still lands spoken aloud.

---

## 1.2 Sub-Results

Four felt wins, in sequence:

1. **Placed** — "I know which stage I'm in." The relief of an accurate name for a state they have been unable to describe.
2. **Read** — "I see which part is behind, and what it is costing me." The three aspects (Identity, Economy, Fit) placed on the arc; the spread between them IS the diagnosis.
3. **Met** — "Someone described my situation better than I could." The pain layers computed for their exact position rather than generic copy.
4. **Pointed** — "I know the next move and the trap at my stage." Direction plus the named danger, then one door or none.

### 🔥 ROAST 1.2 (Deep, 3×3) — findings

**Cycle 1 — Completeness**
- 1.2a Do the four, together, deliver the Master Result v2? Yes for stages 4-7 (the practitioner's zone). But for stages 1-3, sub-results 2-4 don't apply — those users get Placed and then stop, per the key design decision (Settled = no ask; Itch/Tremors = a matched gift, no CTA). This is not a missing sub-result, it's a **branch**: the chain is Placed → (stages 4-7: Read → Met → Pointed) / (stages 1-3: honest stop, optionally gifted). Documented in 1.3/1.5 below rather than adding a fifth sub-result — it would be dishonest to call the not-yet stop a "felt win" in the same register as Pointed.
- 1.2b Anything missing between A and B? No — Placed/Read/Met/Pointed map cleanly onto the three Master-Result clauses (Read+Met = "what's holding me back," Pointed = "what happens next").
- 1.2c Anything not contributing? No — all four earn their place.

**Cycle 2 — Sequence & felt experience**
- 1.2d Natural sequence? Yes: name it → see the shape → feel understood → get direction. Nobody would want Met before Read (you can't feel understood about a position you haven't been shown yet).
- 1.2e Each a win, not homework? Yes — even Read, which sounds analytical, is a recognition win ("I see it too"), not a task.
- 1.2f Nameable in 3 words? All four are single words already — passes clean.

**Cycle 3 — What 1-2 missed**
- 1.2g Any two secretly the same? Read (macro: three-aspect spread, bottleneck named) and Met (micro: the felt pain description zoomed on the bottleneck) could look redundant on paper but are different registers — one is structural recognition, one is emotional recognition. Keep separate.
- 1.2h Any needing a split? No.
- 1.2i Momentum check, walked as a user: after Placed I want to know what it's costing me → Read. After seeing the shape I want the "yes, exactly" gut-punch → Met. After feeling met I want to know what to do → Pointed. Momentum holds.

**→ No rewrite needed.** One documentation addition: the not-yet branch (stages 1-3) is now explicit — Placed is universal, Read/Met/Pointed are gated to stages 4-7.

---

## 1.3 Screens

### Draft (pre-roast)

- **S1 Entry** (before-screen) — names the transformative result, one CTA whose label is the result.
- **S2 Placement** — seven first-person statements, they pick the one that sounds like now.
- **S3 Stage Read** — their stage named and described, plus what is true at this stage. **This screen is the gate.**
- **S3a Not-Yet path** (stages 1-3) — something true and useful for their stage, explicitly NO call to action, no channel links, no offer. The honest dead end that earns the return visit.
- **S4 Aspect Questions** — nine questions, three per aspect (Identity, Economy, Fit).
- **S5 The Spread** — three stages shown, bottleneck named (the lagging aspect), growth driver named (the leading aspect).
- **S6 The Zoom** — the full pain read for the lagging aspect at their stage.
- **S7 The Path** (after-screen) — what happens next on the arc, the trap at their stage, and the route (Direction Call / session / BUILT / node / nothing).

### 🔥 ROAST 1.3 — findings (also resolves the four open questions carried from the draft)

- **Is S4 one screen or three?** Resolved: **three screens**, one per aspect (S4a Identity, S4b Economy, S4c Fit), three questions each. Nine questions on one screen is two jobs disguised as one ("answer Identity" + "answer Economy" + "answer Fit"); splitting by aspect keeps one purpose per screen, lets each screen carry its own micro-frame ("Reading your Identity now"), and builds momentum through three short screens instead of one long scroll.
- **Is stage placement one question or three?** Resolved: **one question, self-report, seven options** — this is already what S2 describes ("seven first-person statements, pick the one that sounds like now"). Triangulation (corroborating questions) would add friction and isn't in scope; the nine aspect questions in S4a-c already triangulate the *aspect* read, so the *stage* read doesn't need its own second pass.
- **Does the free version show all three aspects or only the bottleneck?** Resolved by standing decision: **everything.** The quiz shows all three aspect positions, the bottleneck, the driver, and the full zoom — nothing is gated. Only derivation (turning the read into an offer/business) is paid.
- **Does S3a route to nothing or to an email capture?** Resolved by standing decision, and it's stage-conditional, which means S3a is really **two content variants of one screen**, not one:
  - **S3a-1 (Settled, stage 1)** — one honest line, nothing is broken, no ask, no email field.
  - **S3a-2 (Itch/Tremors, stages 2-3)** — what the feeling usually turns into + the sign it's becoming real, matched to their exact stage, with an *optional* email to receive the full map.

- **Any screen doing two things?** S3 (Stage Read) both reveals the stage and functions as the branch point. That's fine — the branching is routing logic, not a second on-screen job; the screen itself only ever shows one thing (the stage read).
- **Any two screens doing the same thing?** No, after the S4 split each screen has exactly one job.
- **Missing between screens?** The transition between S4c (last aspect question) and S5 (The Spread) involves scoring/aggregation. Roast finding: this does **not** need its own screen — it's a brief loading state on the way into S5 (see 1.6), not a seventh atomic view. Adding a dedicated "calculating" screen would be an unnecessary screen per Nielsen's economy heuristic.

### Final screen list (10 screens/variants)

| # | Screen | Purpose (one sentence) |
|---|---|---|
| S1 | Entry (before-screen) | Names the transformative result; one CTA, labeled as the result. |
| S2 | Placement | User self-reports their stage from seven first-person statements. |
| S3 | Stage Read (the gate) | Reveals the named stage and what's true at it; branches to S3a or S4a. |
| S3a-1 | Not-Yet — Settled | One honest line for stage 1: nothing is broken, no ask. |
| S3a-2 | Not-Yet — Itch/Tremors | Stage-matched gift (what the feeling turns into + the sign it's real) with optional email. |
| S4a | Identity Questions | Three questions read the Identity aspect. |
| S4b | Economy Questions | Three questions read the Economy aspect. |
| S4c | Fit Questions | Three questions read the Fit aspect. |
| S5 | The Spread | Shows all three aspects positioned on the arc; names bottleneck and driver. |
| S6 | The Zoom | Delivers the full pain read for the lagging (bottleneck) aspect. |
| S7 | The Path (after-screen) | States the next move and the trap at their stage; one route CTA. |

---

## 1.4 Screen Details (Heart / Mind / Gut)

*Gut is always a result-verb CTA, never "Continue" — per the Transformative-Result Pattern.*

**S1 Entry**
- 🫀 Heart: Hope without pressure — "maybe something will finally see me."
- 🧠 Mind: This is free, ~3 minutes, no obligation; the result is a named position, not a pitch.
- 🔥 Gut: **"See where I am →"**

**S2 Placement**
- 🫀 Heart: The click of recognition mid-read — one line among seven suddenly sounds like this week.
- 🧠 Mind: These seven lines are not personality types, they're stages of one arc everyone crosses.
- 🔥 Gut: **"That's me →"** (appears once a statement is selected)

**S3 Stage Read (the gate)**
- 🫀 Heart: Named, maybe unsettled — a verdict, not a compliment or an insult.
- 🧠 Mind: Understands their stage and the one thing that's true at it right now.
- 🔥 Gut (stages 4-7): **"Show me what's behind"** → S4a · (stages 1-3): **"See what this usually means"** → S3a

**S3a-1 Not-Yet — Settled**
- 🫀 Heart: Quiet relief — nothing is being sold to them, nothing is wrong.
- 🧠 Mind: Understands that "nothing broken" is itself accurate information, not a non-answer.
- 🔥 Gut: none — no CTA, per standing decision. (Optional low-key "Retake later" link only, not a CTA.)

**S3a-2 Not-Yet — Itch / Tremors**
- 🫀 Heart: Seen without being sold to — "someone just told me where this goes before I asked."
- 🧠 Mind: Understands what the feeling usually turns into next, and the specific sign that it's becoming real.
- 🔥 Gut: **"Send me the full map"** (optional email; skippable, and skipping is a real, undamaged exit — not a soft dark pattern)

**S4a Identity Questions**
- 🫀 Heart: Slight exposure — being asked about self-concept, energy, legitimacy in one pass.
- 🧠 Mind: Understands these three questions are reading who they are in the work, separate from money or belonging.
- 🔥 Gut: **"Read my Economy →"**

**S4b Economy Questions**
- 🫀 Heart: Practical, a little exposing in a different way — money questions land differently than identity ones.
- 🧠 Mind: Understands these three questions read how money actually moves for them right now.
- 🔥 Gut: **"Read my Fit →"**

**S4c Fit Questions**
- 🫀 Heart: Social exposure — belonging and recognition are the most tender of the three aspects for most people.
- 🧠 Mind: Understands these three questions read where they belong and who recognizes them accurately.
- 🔥 Gut: **"Show me the spread →"**

**S5 The Spread**
- 🫀 Heart: The "oh — that's exactly the gap" moment; structural recognition, slightly clinical, satisfying.
- 🧠 Mind: Understands their three aspects sit at different points on the arc, and the gap between them IS the diagnosis.
- 🔥 Gut: **"Show me what it's costing me →"**

**S6 The Zoom**
- 🫀 Heart: Being met — "someone described my situation better than I could."
- 🧠 Mind: Understands, in specific and not generic language, what the lagging aspect is costing them right now.
- 🔥 Gut: **"Show me what's next →"**

**S7 The Path (after-screen)**
- 🫀 Heart: Oriented — foggy on the details, clear on the direction; ground under their feet.
- 🧠 Mind: Understands the next move at their stage and the specific trap that catches people there.
- 🔥 Gut: the route CTA, stage/pattern-dependent — always a result verb, never "Continue": **"Book a Direction Call"** / **"See the session"** / **"Meet BUILT"** / **"Find a node"** / or, honestly, no CTA at all when the pattern is "all three at 5" with no clean single door yet — just **"Retake anytime"**.

### 🔥 ROAST 1.4 — findings
- Generic Hearts? Checked each against "be specific HOW" — all name the specific felt texture (exposure by aspect, structural vs. emotional recognition) rather than a generic label like "curious" or "excited." Pass.
- Every Mind teaches one thing? Yes — each Mind entry is a single sentence, single insight. S3's Mind was originally two ideas (the stage + the branch); rewritten so the branch lives in the Gut row, not the Mind row.
- Every Gut a result verb? All pass except S3a-1, which correctly has none (per standing decision — Settled gets no ask at all). S7's fallback for "all three at 5" was originally going to force a CTA ("Book a call") to avoid an empty gut — rewritten to **"Retake anytime"** instead, because forcing a session CTA onto someone with no clean bottleneck would violate the no-pitch-if-not-ready spirit that governs S3a. **This is the one rewrite ROAST 1.4 produced.**

---

## 1.5 Extensions

**Artifacts produced** — one quiz-attempt record per completion:
- `stage` (1-7, from S2/S3)
- `identity_score`, `economy_score`, `fit_score` (from S4a-c, three questions each)
- `bottleneck_aspect`, `driver_aspect` (derived at S5 from the three scores)
- `pattern` (one of the six rows in the diagnostic-engine table)
- `route_shown` (which S7 CTA was displayed)
- `email` (optional, S3a-2 only, stages 2-3)
- `completed_at`, `not_yet` (boolean — did they stop at S3a)

This record is the dataset feeding the Ripeness Vector (Technology 123) — every completion, including not-yet completions, is a scored position, not just the ones that convert.

**Emotional states, end to end** — curiosity (S1) → recognition (S2-S3) → light exposure ×3 (S4a-c) → structural recognition (S5) → being met (S6) → oriented resolve (S7). For the not-yet branch: curiosity (S1) → recognition (S2-S3) → relief or quiet acknowledgment, no urgency manufactured (S3a).

**Completion criteria** — not "screen viewed," but **record persisted**:
- Stages 1-3: complete when the S3a record is written (stage + `not_yet: true`, email if given).
- Stages 4-7: complete when the S7 record is written (stage + three aspect scores + pattern + route shown).

**Skip paths** — a user can leave after S3 without answering S4a-c. Nothing is lost that can't be regained: no login is required, the quiz is retakeable any time, and the only persistent asset (email, stages 2-3 only) is opt-in. Leaving mid S4a-c simply means no record is written yet — there is no half-saved state to resume, by design (keeps the data model honest: a record exists only once a real read exists).

**Bridges to other modules** — S7's route CTA is the only bridge, and it is stage/pattern-dependent, never generic:
- Direction Call (Economy-behind or all-at-5 ripe patterns)
- 1:1 session (Fit-behind-both — "the purest session case")
- BUILT (Economy-bottleneck, post-session)
- node/community (Identity-behind, needs field before individual work)
- nothing (explicit, honest — no forced bridge)
- Backward bridge: the optional email from S3a-2 re-opens the quiz as a nurture touchpoint later, inviting a retake once "the sign" they were told to watch for shows up.

### 🔥 ROAST 1.5 — findings
- Completion criteria specific enough (data, not feeling)? Yes — pinned to record persistence, not screen views.
- Skip path fair? Yes — no data is dangled then withheld; the record simply doesn't exist until a real read exists, and retake is free and unlimited.
- Bridges bidirectional? Four of five are one-way by design (Direction Call, session, BUILT, node are external destinations, not modules the user "returns from" into the quiz). The one true bridge that needs to be bidirectional — the email nurture loop back into a retake — is already specified. No fix needed; the apparent one-directionality is honest, not an oversight, because the quiz's job ends at diagnosis.

---

## 1.6 Wireframes

*ASCII, mobile-first at 375px. CTA always above the fold. One column, generous vertical rhythm.*

```
S1 ENTRY                    S2 PLACEMENT                 S3 STAGE READ (gate)
┌─────────────────┐         ┌─────────────────┐          ┌─────────────────┐
│                 │         │  Which sounds    │          │   Your stage:   │
│   [eyebrow]     │         │  like now?       │          │                 │
│  See exactly    │         │                  │          │   TREMORS       │
│  where you are  │         │  ○ "This is what │          │                 │
│  on your own    │         │    I do."         │          │  What's true    │
│  journey.       │         │  ○ "I'm fine...   │          │  right now:     │
│                 │         │    something's    │          │  [1-2 lines]    │
│  [1 line: free, │         │    off."          │          │                 │
│  3 min, no      │         │  ○ "I just need   │          │  ┌────────────┐│
│  pitch]         │         │    to push        │          │  │ Show me    ││
│                 │         │    through."      │          │  │ what's     ││
│  ┌────────────┐ │         │  ○ "It's over."    │          │  │ behind →   ││
│  │ See where  │ │         │  ○ ...(7 total)    │          │  └────────────┘│
│  │ I am →     │ │         │                    │          │                │
│  └────────────┘ │         │  (auto-advances    │          └─────────────────┘
└─────────────────┘         │   on tap)          │
                             └─────────────────┘

S3a-1 NOT-YET (Settled)      S3a-2 NOT-YET (Itch/Tremors)   S4a IDENTITY (of 3)
┌─────────────────┐         ┌─────────────────┐          ┌─────────────────┐
│                 │         │  What this       │          │  Reading your   │
│  You're settled. │         │  usually turns   │          │  Identity       │
│                  │         │  into:            │          │  ●○○           │
│  [one honest     │         │  [1-2 lines]      │          │                 │
│  line — nothing  │         │                    │          │  1. [question]  │
│  is broken]      │         │  The sign it's    │          │  ○ ○ ○ ○ ○      │
│                  │         │  becoming real:    │          │                 │
│  (no button)     │         │  [1 line]          │          │  2. [question]  │
│                  │         │                    │          │  ○ ○ ○ ○ ○      │
│                  │         │  ┌────────────┐    │          │                 │
│                  │         │  │ Send me    │    │          │  3. [question]  │
│                  │         │  │ the full   │    │          │  ○ ○ ○ ○ ○      │
│                  │         │  │ map (opt.) │    │          │                 │
│                  │         │  └────────────┘    │          │  ┌────────────┐│
└─────────────────┘         │  [skip →]          │          │  │ Read my    ││
                             └─────────────────┘          │  │ Economy →  ││
                                                            │  └────────────┘│
                                                            └─────────────────┘

S5 THE SPREAD                S6 THE ZOOM                   S7 THE PATH (after)
┌─────────────────┐         ┌─────────────────┐          ┌─────────────────┐
│  Your spread:    │         │  What this is     │          │  Done · Your    │
│                  │         │  costing you:      │          │  read is        │
│  Identity  ●───  │         │                    │          │  complete       │
│  Economy   ●──── │         │  [the full pain    │          │                 │
│  Fit       ●──   │         │   read for the     │          │  Your stage:    │
│  (arc, stage 1-7)│         │   lagging aspect,   │          │  TREMORS        │
│                  │         │   specific not      │          │  Bottleneck:    │
│  Bottleneck:      │         │   generic]          │          │  ECONOMY        │
│  [aspect name]    │         │                    │          │                 │
│  Driver:          │         │                    │          │  What happens   │
│  [aspect name]    │         │  ┌────────────┐    │          │  next: [text]   │
│                  │         │  │ Show me    │    │          │  The trap here: │
│  ┌────────────┐ │         │  │ what's     │    │          │  [text]         │
│  │ Show me    │ │         │  │ next →     │    │          │                 │
│  │ what it's  │ │         │  └────────────┘    │          │  ┌────────────┐│
│  │ costing →  │ │         └─────────────────┘          │  │ [route CTA]││
│  └────────────┘ │                                        │  └────────────┘│
└─────────────────┘                                        │  Retake anytime │
                                                             └─────────────────┘
```

### 🔥 ROAST 1.6 — findings
- CTA above the fold on mobile? Yes on all screens — each screen carries one CTA (or none, S3a-1) placed within the first viewport at 375px; no screen requires a scroll to act.
- Enough breathing room? S5 and S7 carry the most information density (three aspects + bottleneck + driver, or stage + bottleneck + next + trap). Roast finding: both need generous vertical spacing between the data block and the CTA so they don't read as a dashboard dump — noted for Phase 3 (spacing tokens), not a Phase 1 blocker.
- Anything deletable? S4a-c's progress dots (●○○) were checked against "could this be deleted" — kept, because without them the three-screen split from the S4 roast would feel directionless (no sense of "2 more to go").

**→ Fix applied to findings above; no structural rewrite required.**

---

## The diagnostic engine

| Pattern | Meaning | Bottleneck | Route |
|---|---|---|---|
| Identity ahead, Economy behind | knows who they are, cannot monetize it | Economy | session then BUILT |
| Economy ahead, Identity behind | money comes from something that is not them | Identity | high friction until surrender; nurture |
| Fit behind both | knows it, could sell it, nobody can repeat it | Fit | the purest session case |
| Fit ahead, Identity behind | recognized for something that is not their real thing | Identity | trapped by reputation; common in coaches |
| All three at 5 | full liminality | all | maximum ripeness |
| All three at 1-2 | settled | none | not yet: truth, no CTA |

**Rule:** the lagging aspect is the bottleneck; the leading aspect is the growth driver to pull the others through.

---

## Awareness-level note

Transition stage and Eugene Schwartz's awareness level are different axes. A person can be at stage 5 and still problem-unaware. The quiz's real conversion mechanism is that it moves the person up the awareness ladder (unaware → problem-aware → layer-aware → solution-aware) inside a single sitting, which is why it can convert without selling.

---

## Strategic shape

One artifact doing five jobs — naming machine (free high-precision articulation), filter (routes the not-yet away honestly), diagnostic (positions for the practitioner), dataset (scored positions feeding the ripeness thesis), and initiation (naming a stage begins to change it).

---

## Source material pointers

The seven stages, their narrations, the six shifts, the shock taxonomy, the 63-cell grid, the 54 shifts and stages 8-10 all live in `docs/holomaps/transition_holomap.md`. The three parent aspects (Identity, Economy, Fit) through the seven stages are in the same map. The instrument is Phase Shift Technology 123; the map is Technology 124.

---

## Open questions for Phase 1 roast — RESOLVED (see §1.3 ROAST 1.3)

All four resolved during ROAST 1.3, not carried forward:

- Does S3a route to nothing or to a "come back when" email capture? → **Stage-conditional.** Settled: nothing. Itch/Tremors: optional email for the full map.
- Are the nine questions one screen or three? → **Three** — one per aspect (S4a/b/c).
- Is the stage placement one question or three (self-report versus triangulated)? → **One**, self-report, seven options (already what S2 was).
- Does the free version show all three aspects or only the bottleneck? → **Everything.** Only derivation is paid.

---

## 🔥 ROAST GATE 1 — status: ready for Sasha

Flow walked screen by screen (S1→S2→S3→[S3a-1/S3a-2 or S4a→S4b→S4c→S5→S6→S7]). No redundant screens found; no missing screens found beyond the loading-state note in §1.6. Usability, CTA clarity, edge cases (not-yet branch, skip paths, no-clean-bottleneck pattern) and emotional flow all walked and hold. See `quiz_tracker.md` "FOR SASHA AT ROAST GATE 1" for the short list of genuine forks left open.
