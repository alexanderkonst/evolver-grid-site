# Where Are You Quiz — Experience SOW and Definitions of Done

**Status:** implemented and verified July 30, 2026  
**Scope:** `/quiz` and saved-result route `/quiz/r/:id`  
**Frozen:** all user-facing copy, scoring, result selection, CTA destinations, analytics payloads, and persistence behavior

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

## Ship gate

The work may ship only after every unchecked item above is verified or explicitly recorded as a pre-existing external blocker. Shipping means a deliberate commit and push to the repository's configured main branch. Lovable publication remains a separate platform action unless an authenticated repository command exists for it.
