# Where Are You Quiz — Experience SOW and Definitions of Done

**Status:** implemented and verified July 30, 2026; **design pass shipped August 1-3, 2026 (Day 142)** — see "Design pass (Day 142)" below  
**Scope:** `/quiz` and saved-result route `/quiz/r/:id`  
**Frozen (as of the July 30 freeze):** scoring, result selection logic, CTA destinations, analytics payloads, and persistence behavior. The Day 142 pass deliberately reopened *copy and visual form* (result text shortened, the two-screen qualifier collapsed to one soft question, the reflection widget removed, the full design/UX pass run) with Sasha's sign-off — the north star below governed it and is unchanged.

## Experience north star

The quiz should feel like a contemporary observatory made from ivory paper, lapis ink, one fine line of gold, and a single moving point of light. Its rhythm is:

1. **Threshold** — spacious invitation.
2. **Concentration** — quiet, instrument-like questions.
3. **Reveal** — a ceremonial moment of recognition.
4. **Integration** — grounded reading, agency, and a next door.

The interface should disappear while the visitor recognizes themselves and appear only at transitions.

## Phase 1 — Planning

### Scope of work

- Translate the experience north star into one quiz-specific visual and interaction grammar.
- Preserve the standalone quiz decision: no game shell and no persistent platform navigation.
- Establish the four experience phases and map every existing screen to one phase.
- Define responsive behavior for mobile, tablet, and desktop.
- Define accessibility, motion, focus, and interaction-state requirements.
- Establish explicit non-goals so the work cannot drift into copy, scoring, result, route, or data changes.

### Definition of done

- [x] Four-phase journey is documented and mapped to the current screen state machine.
- [x] Copy, scoring, results, destinations, analytics, and persistence are explicitly frozen.
- [x] The quiz has one local corridor header, one progress grammar, and one answer-control grammar.
- [x] The result is specified as two beats: reveal, then integration.
- [x] Mobile, tablet, desktop, reduced-motion, keyboard, and screen-reader behavior are in scope.
- [x] Implementation and QA acceptance criteria are recorded before code changes begin.

## Phase 2 — Implementation

### Scope of work

- Replace the global floating wordmark collision with a local quiz corridor header.
- Give each state a phase identity without adding visual noise or changing copy.
- Turn answer stacks into a precise calibration instrument with clear selected, hover, focus, and disabled states.
- Give the result a distinct reveal beat followed by a quieter integration surface.
- Present the existing CTA as a door, not an oversized capsule.
- Put reflection before conversion so the visitor can register accuracy before choosing a next step.
- Improve functional contrast and focus behavior while retaining the ivory, lapis, and gold system.
- Tune widths, spacing, typography, and touch targets across mobile, tablet, and desktop.

### Definition of done

- [x] `/quiz` owns its header and never collides with the global logo.
- [x] Entry, question, loading, result, and follow-up states visibly belong to one system.
- [x] Answer controls are legible, keyboard operable, at least 44px tall, and visibly focused.
- [x] Auto-advanced screens announce/focus the new content without trapping focus.
- [x] Progress exposes a meaningful accessible value and does not depend on color alone.
- [x] Result hierarchy reads in this order: chapter, trajectory, central read, reflection, next door.
- [x] No frozen copy, scoring, result, route, persistence, or analytics behavior changes.
- [x] Layout has no clipping, collision, or horizontal overflow at 375px, 768px, 1024px, and 1440px.
- [x] Reduced-motion preference removes nonessential transitions.

## Phase 3 — Testing and debugging

### Scope of work

- Run static checks, unit tests, production build, and lint.
- Exercise the complete quiz path and representative branches in a real browser.
- Verify back navigation, selection locking, refresh/resume, retake, shared results, and saved-result rendering.
- Inspect desktop, tablet, and mobile screenshots for hierarchy, alignment, clipping, contrast, and visual continuity.
- Test keyboard-only operation, visible focus, screen transitions, reduced motion, and basic screen-reader semantics.
- Fix in-scope defects and rerun the affected checks.

### Definition of done

- [x] Typecheck and production build pass.
- [x] Quiz engine tests remain green (5/5). The repository suite is 170/177: seven unrelated data-snapshot assertions were already stale before this work.
- [x] Scoped lint passes with no errors. Repository-wide lint retains its existing 535-error baseline outside this scope.
- [x] One complete happy path and two distinct result branches pass in-browser.
- [x] Back, retake, refresh/resume, share URL, and saved-result route behavior were exercised. A missing saved ID fails gracefully; a valid production row was unavailable locally.
- [x] No failed first-party requests were observed during the tested journey. The global SoundCloud embed produced its existing third-party 404 noise.
- [x] Keyboard focus is visible and follows the screen transition.
- [x] Mobile, tablet, and desktop visual inspections pass without overflow or collisions.
- [x] Unrelated pre-existing failures are documented here rather than hidden.

## Verification record

- Production build: pass.
- TypeScript: pass.
- Quiz engine: 5/5 pass.
- Scoped ESLint: pass.
- Browser widths: 375 × 812, 768 × 1024, 1280 × 720, plus overflow assertions.
- Branches: stage-1 no-ask, stage-5 Direction Call, stage-7 crossed-peer.
- State: back, answer locking, screen focus, direct share reload, retake, and missing saved-result handling pass.

## Design pass (Day 142) — August 1-3, 2026

The visual/UX pass the original scope deferred to a later "Phase 3" was run here, after Sasha's diagnosis that `/quiz` "was just white — because we never asked ourselves about its design." It was scoped by roasting the result page through the 27-perspective instrument (three rounds: meaning ledger, mechanics/untouchables, aesthetics) before touching code, then shipped in five commits. The north star above was the governing contract throughout; nothing about scoring, routing, or CTA destinations changed.

**What shipped (form and copy only; engine, routes, i18n keys, share token, and Supabase calls untouched):**

1. **Result ceremony, three acts** — arc labels the previous/current/next chapter; central read is the one framed body carrying the reveal card's ivory + gold below the fold; witness quote gets its own margin voice; progress thread completes to 100% on the read; closing star seal ends the page. Stages 1-3 gained the chapter ceremony (name + arc). *(commit: "three-act harmony pass")*
2. **Text halved + one soft threshold question** — result copy ~230 → ~130 words; Recognition Delta widget and the "take what is accurate" line removed; two blunt commercial screens (paid-help history + Means) collapsed to one soft question, "People cross this threshold alone or with real help. Where are you with that?" All copy edits synced across en/ru/es. *(commit: "halve the text, one soft threshold question")*
3. **Typography unified to three voices** — display serif · one reading voice (Source Serif 4, 1.02rem, one color, no opacity steps) · one smallcaps meta voice. Removed six mixed sizes / two families on the client-facing read. *(commit: "unify typography to three voices")*
4. **The lapis field** — `/quiz` now renders the same `lapis-still-background.webp` watercolor + gold-constellation ground as `/`, as a fixed layer under the paper grain and phase vignette. *(commit: "lay the lapis field under the corridor")*
5. **Field breathes; arc becomes a constellation** — the field recedes during questions (opacity ~0.55, desaturated), returns luminous at reveal, settles at ~0.75 for integration (600ms); the arc gains gold hairline threads sweeping in from beyond the reveal card with small star dots, so the chapter line reads as continuing past the visible seven. Both reduced-motion-safe. Implemented by an orchestrated subagent with one rework cycle on visual QA. *(commit: "field breathes with phase; chapter line extends past the card")*

**Verification (Day 142):** `tsc --noEmit` clean and production build pass on every wave; live in-browser walkthrough of stage-5 full read, stage-2 not-yet, and stage-7 crossed-peer at 375px and 1280px; RU locale spot-checked on the result. Each wave committed and pushed to `main` separately.

## Ship gate

The work may ship only after every unchecked item above is verified or explicitly recorded as a pre-existing external blocker. Shipping means a deliberate commit and push to the repository's configured main branch. Lovable publication remains a separate platform action unless an authenticated repository command exists for it.
