# Result Experience v1 — Day 142

*Written Phase 1 of the Result Experience EXT build (`docs/specs/quiz/ext_implementation_brief.md`), August 3, 2026. Freezes the current production quiz result experience for rollback and dataset continuity. No code was modified to produce this document.*

---

## Overview

The Transition Quiz ("Where Are You") is a public, no-auth, 3-question quiz at `/quiz`, built on `src/modules/transition-quiz/{TransitionQuizPage.tsx, TransitionQuizResultPage.tsx, engine.ts, TransitionQuizPage.css}`. It places a visitor on a 7-stage transition arc (Q1), classifies how their uniqueness currently reaches the world (Q2), and reads how far their emerging work has developed (Q3). Stages 1–3 get a no-ask "not yet" ending (gift content, no CTA). Stages 4–7 get a free 3-beat result (chapter / central read / next move), followed conditionally by a soft "Buying Frame" qualifier question that bridges into a Direction Call booking CTA — unless the person is a "crossed peer" (already past the crossing, per `isCrossedPeer`), in which case a distinct peer-ending replaces the qualifier and bridge entirely. Every result is free; nothing is withheld. Completion, qualifier answers, and email captures are logged fire-and-forget to Supabase (`transition_quiz_results` table via the `save-quiz-result` edge function) for dataset purposes only — persistence never gates or delays the visible result. A result can also be saved/shared via a Supabase-generated id (`/quiz/r/:id`) or via a stateless base64 share token in the URL (`?r=...`).

---

## Current result structure (render order)

### `TransitionQuizPage.tsx` screens (state machine `Screen` type, line 52-61)
`entry → q1 → (notYet | q2 → q3 → loading → result → buyingFrame → means)`

1. **Entry** (`EntryScreen`, line 607) — eyebrow `quiz.entry.eyebrow`, title `quiz.entry.title`, honesty line `quiz.entry.honestyLine`, CTA `quiz.entry.cta`.
2. **Q1 stage placement** (`Q1Screen`, line 629) — prompt `quiz.q1.prompt`, options `quiz.q1.options` (array, index+1 = Stage 1-7).
3. **Not-yet branch** (stages 1–3, `NotYetScreen`, line 747) — see "Crossed-peer and not-yet branches" below.
4. **Q2 uniqueness** (`ChoiceScreen` w/ `i18nKey="quiz.q2"`, line 526) — prompt `quiz.q2.prompt`, optional framing `quiz.q2.framing`, options `quiz.q2.options.{discovery|recognition|integration|vehicle|transmission|scaling}`.
5. **Q3 emerging-work stage** (`ChoiceScreen` w/ `i18nKey="quiz.q3"`, line 536) — prompt `quiz.q3.prompt`, options `quiz.q3.options.{not_visible|suspected|felt|named|built|working|delivering}`.
6. **Loading beat** (`LoadingScreen`, line 953) — `quiz.loading`, fixed 650ms `setTimeout` (line 448) before advancing to `result`. Not a real screen conceptually.
7. **Result** (`ResultScreen`, line 965; rendered by both `TransitionQuizPage` line 548 and reused verbatim by `TransitionQuizResultPage` line 297) — see full breakdown below.
8. **Buying Frame qualifier + bridge** (`BuyingFrameScreen`, line 1185) — shown only when `routing.showBuyingFrame` is true (stages 4-7, non-crossed-peer). Three sub-states inside one screen: (a) unanswered — prompt `quiz.buyingFrame.prompt`, options `quiz.buyingFrame.options.{open|open_no_history|mixed|closed}`; (b) answered + route `directionCall` — `quiz.directionCall.line1`, `line2`, CTA `quiz.directionCall.cta` (opens `DIRECTION_CALL_HREF`, line 98), sub `quiz.directionCall.sub`; (c) answered + route `none` (closed) — `quiz.buyingFrame.closedEnding`.
9. **Means screen** (`Screen` type includes `"means"`, `BUYING_FRAME`/`MEANS` copy exist) — defined in the type/progress maps but **not actually rendered** in the current JSX (no `screen === "means"` branch in the render switch, lines 501-576); the `means` state is instead captured via `onPickMeans` inline inside `BuyingFrameScreen`'s pre-answer state as a companion field, logged via a separate `useEffect` (lines 359-393). `quiz.means.*` keys exist but the dedicated full-screen `means` UI is dead/unused in the current build — retained history only.

### `ResultScreen` (line 965) internal render order — full read (stages 4-7, non-crossed-peer)
1. Reveal block: eyebrow `quiz.result.stageLabel`, stage name from `quiz.stageNames.{n}`, `Ornament`, `StageArc` (7-node trajectory arc, current stage starred, only adjacent stage names labeled), chapter copy `chapterKeyForStage(stage)` → `quiz.result.chapter.{4-7}`.
2. Central read: heading/body/workClause from `resultTemplateKey(uniqueness)` → `quiz.result.beats.{uniqueness}.{heading,body,nextMove}` plus `workStageClauseKey(emergingWorkStage)` → `quiz.result.workStageClause.{stage}`.
3. `BelievabilityQuote` (line 1165) — one testimonial quote, see "Testimonial behavior" below.
4. Next-move block: eyebrow `quiz.result.nextLabel`, body `beats.nextMove`.
5. CTA block: if `showBuyingFrame` — quiet note `quiz.result.selectionNote` + `EditorialCta` button `quiz.result.continueCta` (advances to `buyingFrame` screen); else — `quiz.result.honestEnding` (plain text, no CTA).
6. `SaveMyRead` (line 666) — permalink save widget, see below.
7. Retake button `quiz.notYet.retake`.
8. Closing `Ornament` seal.

### `ResultScreen` — crossed-peer branch (line 984)
1. Reveal block (same as above) with `StageArc crossed` (forces stage 7 marker, adds `is-crossed` styling).
2. Central read: heading `quiz.result.crossedPeer.heading`, body `quiz.result.crossedPeer.body1` + `body2`.
3. CTA block: single link CTA `quiz.result.crossedPeer.cta` → `DIRECTION_CALL_HREF`, tracked `quiz_cta_click` / `crossed_peer_cta`.
4. `SaveMyRead`, retake, closing ornament (same as full read).

### `TransitionQuizResultPage.tsx` (`/quiz/r/:id`)
Fetches the saved row from the `get-quiz-result` edge function (GET, no auth), then reconstructs `CoreAnswers` and re-renders the exact same `ResultScreen` component (imported, not reimplemented) plus a `ClaimReadLine` (line 46) that lets a logged-in viewer with no `user_id` on the row claim it (calls `claim-quiz-result` edge fn). Not-yet stages (1-3) render a stripped-down single paragraph (`quiz.notYet.settled.line` or `itchTremors.{stage}.why/turnsInto`) instead of the full ceremony. `onContinue` on the permalink opens `DIRECTION_CALL_HREF` in a new tab directly (no interactive qualifier flow on the permalink). `onRetake` navigates to `/quiz`.

---

## Current copy modules — `quiz.*` locale key inventory

All three locales (`src/locales/{en,ru,es}/common.json`) have **identical key sets** — 141 leaf keys each under `quiz.*`, verified via structural diff (no keys present in one locale and absent in another).

Grouped by function:

- **Chrome/shared**: `quiz.back`, `quiz.progressLabel`, `quiz.loading`, `quiz.stageNames.{1-7}`.
- **Entry**: `quiz.entry.{eyebrow,title,honestyLine,cta}`.
- **Q1**: `quiz.q1.{order,prompt,options}` (options is an array).
- **Q2**: `quiz.q2.{order,framing,prompt,options.discovery,options.recognition,options.integration,options.vehicle,options.transmission,options.scaling}`.
- **Q3**: `quiz.q3.{order,prompt,framing,options.not_visible,options.suspected,options.felt,options.named,options.built,options.working,options.delivering}`.
- **Not-yet (stages 1-3)**: `quiz.notYet.settled.{title,line,channelsLine,channelsLinkLabel,giftLinePre,giftLinkLabel,giftLinePost,emailPrompt,emailPlaceholder,emailCta,skip,emailSuccess}`; `quiz.notYet.itchTremors.{turnsIntoLabel,signLabel,whyLabel,nextLabel,2.turnsInto,2.sign,2.giftPre,2.giftLinkLabel,2.giftPost,3.why,3.next,3.giftPre,3.giftLinkLabel,3.giftPost,emailPrompt,emailPlaceholder,emailCta,skip,emailSuccess}`; `quiz.notYet.retake` (shared with full result).
- **Result — chapter/stage**: `quiz.result.stageLabel`, `quiz.result.chapter.{4,5,6,7}`.
- **Result — beats (per-uniqueness)**: `quiz.result.beats.{discovery|recognition|integration|vehicle|transmission|scaling}.{heading,body,nextMove}` (18 leaf keys).
- **Result — work-stage clause**: `quiz.result.workStageClause.{not_visible,suspected,felt,named,built,working,delivering}`.
- **Result — next/CTA copy**: `quiz.result.nextLabel`, `quiz.result.takeWhatNote` (appears unused in current JSX — grep found no `t("quiz.result.takeWhatNote")` call, retained key), `quiz.result.continueCta`, `quiz.result.selectionNote`, `quiz.result.honestEnding`.
- **Testimonial intro**: `quiz.result.believability.intro`.
- **Crossed-peer**: `quiz.result.crossedPeer.{heading,body1,body2,cta}`.
- **Buying Frame qualifier**: `quiz.buyingFrame.{transitionLine (appears unused — no `t()` call found in JSX),prompt,options.open,options.mixed,options.open_no_history,options.closed,closedEnding}`.
- **Direction Call bridge**: `quiz.directionCall.{line1,line2,cta,sub}`.
- **Save/permalink**: `quiz.saveRead.{label,confirmation (unused — no call found),sendCta,sentConfirmation,orOpenLink}`.
- **Recognition Delta** (dead feature, widget removed Day 142 per code comment at TransitionQuizPage.tsx:740-743, keys retained for dataset history): `quiz.recognitionDelta.{prompt,options.1-5,thankYou}`.
- **Means** (dedicated screen dead/unused per above, keys retained): `quiz.means.{prompt,options.yes_comfortably,options.yes_if_fit,options.maybe_depending,options.not_now}`.
- **Claim-read** (permalink ownership): `quiz.claimRead.{prompt,cta,saving,saved,error}`.

---

## Qualifier behavior — the Buying Frame question

- **What it asks**: `quiz.buyingFrame.prompt` — a single soft threshold question replacing an earlier two-screen pay/means sequence (per code comment TransitionQuizPage.tsx:1204-1208, dated Day 142).
- **Options** (`BUYING_FRAME_VALUES`, engine.ts / TransitionQuizPage.tsx:119): `open`, `open_no_history`, `mixed`, `closed` — display order history → openness → conditional → solo.
- **Implemented in**: `BuyingFrameScreen`, `TransitionQuizPage.tsx:1185-1259`; type `BuyingFrame` in `engine.ts:54`.
- **Gating**: only shown at all when `routing.showBuyingFrame` is true, which requires `meetsDirectionCallGate(answers)` (engine.ts:99-101: stage 4-7) AND not a crossed peer (`isCrossedPeer`, engine.ts:116-124, which checks `uniqueness === "scaling"` or `stage === 7` combined with `emergingWorkStage` in `{working, delivering}` or `uniqueness === "transmission"`).
- **Routing effect**: `routeAfterBuyingFrame(buyingFrame)` (engine.ts:132-134) — every answer except `"closed"` routes to `"directionCall"`; `"closed"` routes to `"none"` (the plain `quiz.buyingFrame.closedEnding` text, no CTA).
- **Companion "Means" question**: shown inline within `BuyingFrameScreen`'s pre-answer branch via `onPickMeans`, only logged, does not change routing (per engine.ts:56-63 doc comment — "Doesn't change routing — it's logged alongside the completion").

---

## Routing engine functions (`engine.ts`)

| Function | Signature | Purpose | Called from |
|---|---|---|---|
| `isNotYetStage(stage)` | `(Stage) => boolean` | stage ≤ 3 | `TransitionQuizPage.tsx:508` (Q1 pick), `TransitionQuizResultPage.tsx:262` |
| `notYetVariant(stage)` | `(Stage) => "settled"\|"itch"\|"tremors"\|null` | maps stage 1/2/3 to not-yet content variant | `NotYetScreen` (TransitionQuizPage.tsx:766), `TransitionQuizResultPage.tsx:267` |
| `meetsDirectionCallGate(answers)` | `(CoreAnswers) => boolean` | stage 4-7 eligibility for the qualifier/bridge | `computeRouting` internally |
| `isCrossedPeer(answers)` | `(CoreAnswers) => boolean` | detects the peer-ending route | `computeRouting` internally |
| `routeAfterBuyingFrame(buyingFrame)` | `(BuyingFrame) => Route` | resolves final route once qualifier answered | `TransitionQuizPage.tsx:234,338,351,375,389,573`; `TransitionQuizResultPage.tsx` indirectly via `computeRouting` |
| `computeRouting(answers)` | `(CoreAnswers) => RouteResult` | full pre-qualifier routing decision (`{showBuyingFrame, route}`) | `TransitionQuizPage.tsx:228`; `TransitionQuizResultPage.tsx:293` |
| `chapterKeyForStage(stage)` | `(Stage) => string` | `quiz.result.chapter.{4-7}` key (clamps 4-7) | `ResultScreen` line 1025 |
| `resultTemplateKey(uniqueness)` | `(UniquenessCategory) => string` | `quiz.result.beats.{uniqueness}` key | `ResultScreen` line 1026 |
| `workStageClauseKey(stage)` | `(EmergingWorkStage) => string` | `quiz.result.workStageClause.{stage}` key | `ResultScreen` line 1031 |
| `encodeShareState(state)` / `decodeShareState(token)` | see below | stateless URL share token | `TransitionQuizPage.tsx:425` (encode), `loadInitial` line 146 (decode) |

`Route` type = `"directionCall" | "crossedPeer" | "none"`.

---

## Saved-result behavior end to end

### Share token (`?r=...`, stateless, no server round-trip)
- `encodeShareState` (engine.ts:190-194): JSON-stringifies `QuizShareState { stage, uniqueness?, emergingWorkStage?, buyingFrame?, means?, email? }`, base64-encodes (UTF-8 safe).
- `decodeShareState` (engine.ts:196-206): reverses, validates `stage` is a number 1-7, else returns `null`.
- Written to the URL via `window.history.replaceState` whenever screen is `result`/`notYet`/`buyingFrame` (TransitionQuizPage.tsx:437-441).
- Read on load in `loadInitial` (line 140-167): a valid `r` param takes priority over `localStorage`, restores to `result` screen if core answers present, else `notYet`.

### Server-saved permalink (`/quiz/r/:id`)
- Every completion (not-yet or full result) is logged fire-and-forget to `save-quiz-result` (Supabase edge function → `transition_quiz_results` table), returning a row `id` (TransitionQuizPage.tsx:238-320).
- That `id` is stored in local component state `resultId` and used to (a) build the `SaveMyRead` permalink `${origin}/quiz/r/${resultId}`, (b) target subsequent update-in-place calls (Buying Frame answer, Means answer, email) onto the same row rather than inserting duplicates ("data hygiene #22" per comments at lines 322-393).
- `/quiz/r/:id` (`TransitionQuizResultPage.tsx`) fetches via `GET /functions/v1/get-quiz-result?id=...` (no auth), 404 → not-found state, reconstructs `CoreAnswers` from `{stage, uniqueness_category, emerging_work_stage}` and re-renders `ResultScreen`.

### SaveMyRead / email-save flow (`SaveMyRead`, TransitionQuizPage.tsx:666-738)
1. UI trigger: quiet link button `quiz.saveRead.label`, appears under the result once `resultId` is set (component returns `null` if no `resultId`).
2. Click opens an inline email field.
3. Submit (`handleSend`, line 688-699): validates email contains `@`; fires `trackCTAClick("quiz_permalink_saved", "save_my_read_email")`; invokes `save-quiz-email` edge function with `{ email, stage, locale, source: "save_read:${resultId}" }`, fire-and-forget (`.catch(() => {})`).
4. Confirmation copy: `quiz.saveRead.sentConfirmation` + a link `quiz.saveRead.orOpenLink` → the permalink itself.
5. Analytics fired during save: `quiz_permalink_saved` (CTA event, label `save_my_read_email`).

### Separate general email-capture (`NotYetScreen`, `submitEmail` in `TransitionQuizPage.tsx:395-420`)
- Not the same widget as SaveMyRead. Used on not-yet screens for the "gift" email capture.
- Updates the existing `resultId` row with `email` if known, else inserts via `logCompletion`.
- Also separately calls `save-quiz-email` with `{ email, stage, locale }` (no `source` prefix), fire-and-forget.
- Rate-capped server-side per commit `50171e1f` ("Rate-cap save-quiz-email outbound sends to curb arbitrary-recipient spam" — not inspected in Phase 1, flagged as recent change to the same edge function).

### Claim flow (`ClaimReadLine`, `TransitionQuizResultPage.tsx:46-144`)
- Shown only on `/quiz/r/:id` when the row has no owner (`!alreadyOwned`).
- Guest state → prompts sign-up, redirect param carries `buildQuizClaimPath(resultId)`.
- Logged-in eligible state → button invokes `claim-quiz-result` edge function with bearer token; also auto-fires if the URL carries `?claim=1` (post-auth redirect).

---

## Testimonial behavior

- Source of truth: `src/data/testimonials.ts`, exported array `TESTIMONIALS: TestimonialData[]` — shared with `IgniteSession` and `MethodologyLandingPage` (not quiz-specific).
- Consumed in the quiz only by `BelievabilityQuote` (`TransitionQuizPage.tsx:1165-1181`), full-read result only (never shown on crossed-peer or not-yet branches).
- Selection: `stage <= 5 ? TESTIMONIALS[0] : TESTIMONIALS[5]` — index 0 = Sergey Jay Makarov ("applying force, wrong vector, now everything clicks" — matches stages 4-5, still-crossing flavor); index 5 = a later entry keyed as the "built, already working" flavor for stages 6-7 (per code comment lines 1166-1170).
- Rendered verbatim, original language, never machine-translated; only the intro line `quiz.result.believability.intro` is localized.

---

## CTA behavior

- **`continueCta`** (`quiz.result.continueCta`) — shown in `ResultScreen`'s CTA block only when `showBuyingFrame` is true; an `EditorialCta` button that calls `onContinue`, which fires `trackCTAClick("quiz_cta_click", "direction_call_continue")` then advances to the `buyingFrame` screen (TransitionQuizPage.tsx:555-560).
- **`directionCall.cta`** (`quiz.directionCall.cta`) — shown inside `BuyingFrameScreen` once `route === "directionCall"`; an anchor to `DIRECTION_CALL_HREF` (`https://cal.com/aleksandrkonstantinov/direction-choice-call`, TransitionQuizPage.tsx:98), `target="_blank"`, fires `trackCTAClick("quiz_cta_click", "direction_call_book")`.
- **`crossedPeer.cta`** (`quiz.result.crossedPeer.cta`) — shown only on the crossed-peer result branch; same `DIRECTION_CALL_HREF` target, fires `trackCTAClick("quiz_cta_click", "crossed_peer_cta")`.
- **`honestEnding`** (`quiz.result.honestEnding`) — plain text shown instead of any CTA when `showBuyingFrame` is false (stage doesn't meet the gate).
- **`closedEnding`** (`quiz.buyingFrame.closedEnding`) — plain text shown instead of a CTA when the qualifier answer was `"closed"`.

---

## Crossed-peer and not-yet branches

### Crossed-peer (route `"crossedPeer"`)
- **Trigger** (`isCrossedPeer`, engine.ts:116-124): `uniqueness === "scaling"` (independent trigger, any stage) OR (`stage === 7` AND (`emergingWorkStage` in `{working, delivering}` OR `uniqueness === "transmission"`)).
- **Renders differently**: skips the qualifier/bridge entirely; skips the standard beats/workClause content; shows `quiz.result.crossedPeer.{heading,body1,body2}` instead; `StageArc` is forced to `crossed` mode (always shows stage 7 as active, `is-crossed` styling); single direct CTA straight to `DIRECTION_CALL_HREF` (no Buying Frame qualifier step at all).
- **Logging**: `resultTemplate` set to `"crossed_peer"` instead of the uniqueness value (TransitionQuizPage.tsx:302).

### Not-yet (stages 1-3, `isNotYetStage`)
- **Trigger**: Q1 answer (stage) ≤ 3 — routes directly from Q1, skipping Q2/Q3 entirely (TransitionQuizPage.tsx:503-511).
- **Renders differently**: no Q2/Q3, no result beats, no qualifier, no Direction Call CTA at all. Instead: a chapter "ceremony" (stage name + arc, same visual treatment as the full result reveal) followed by per-variant gift content — `settled` (stage 1): title/line/channels-link/gift-link/email capture; `itch`/`tremors` (stages 2/3): "turns into"/"sign" (itch) or "why"/"next" (tremors) content blocks + gift link + email capture. Ends in `SaveMyRead` + retake, same as full result.
- **Logging**: `logCompletion({ stage, not_yet: true })` — no uniqueness/emergingWorkStage/buyingFrame/route fields sent.

---

## Analytics — every `funnelAnalytics` call in this module

`trackPageView` and `trackCTAClick` imported from `@/lib/funnelAnalytics` (`FunnelStep` union defined there, `src/lib/funnelAnalytics.ts:19-57`).

| Call site | Event | `source`/label | Fires when |
|---|---|---|---|
| `TransitionQuizPage.tsx:455` | `trackPageView(step)` | — | on every screen mount, via `SCREEN_TO_ANALYTICS_STEP` map (line 89-95): `entry→quiz_entry`, `q1→quiz_q1`, `q2→quiz_q2`, `q3→quiz_q3`, `means→quiz_means`. `notYet`, `loading`, `buyingFrame`, `result` (as a screen) are intentionally unmapped here. |
| `TransitionQuizPage.tsx:318` | `trackPageView("quiz_result", "quiz_result_${resultTemplate}")` | template = uniqueness or `"crossed_peer"` | when `screen === "result"` and not yet logged for this stage |
| `TransitionQuizPage.tsx:557` | `trackCTAClick("quiz_cta_click", "direction_call_continue")` | | `ResultScreen`'s `continueCta` clicked |
| `TransitionQuizPage.tsx:691` | `trackCTAClick("quiz_permalink_saved", "save_my_read_email")` | | `SaveMyRead` email submitted |
| `TransitionQuizPage.tsx:1007` | `trackCTAClick("quiz_cta_click", "crossed_peer_cta")` | | crossed-peer CTA clicked |
| `TransitionQuizPage.tsx:1238` | `trackCTAClick("quiz_cta_click", "direction_call_book")` | | Direction Call CTA (post-qualifier) clicked |

Note: `FunnelStep` also declares `quiz_start`, `quiz_complete`, `quiz_delta_answered` (Recognition Delta, dead feature) as legacy/reserved values not currently fired from this module's code paths inspected above.

`TransitionQuizResultPage.tsx` (the permalink page) fires **no** `funnelAnalytics` calls of its own — it reuses `ResultScreen`, whose only analytics are the CTA click handlers above, which still fire when clicked from the permalink.

---

## Date superseded

August 3, 2026 (Day 142).

## Reason for supersession

Replaced by Result Experience EXT per the strategic review brief (`docs/specs/quiz/ext_implementation_brief.md`).

---

This document freezes Result Experience v1 for rollback and dataset continuity. No code in this phase was modified.
