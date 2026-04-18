# Email Gate + Zone-of-Genius — Both Inside the Platform Shell

## Status: PENDING

## Priority: P0 — funnel UX continuity

This brief covers two tightly-coupled UX integrations. Both surfaces currently break the "one shell, one field" illusion that the rest of the platform maintains. Fixing them together because the first (email gate) hands the user to the second (ZoG entry) and both must land the user in the same chrome without a page flash or a theme shift.

## Context

Sasha tested the flow on 2026-04-18 (Day 44) from the preview URL and flagged:

1. **The email-gate screen (`Auth.tsx` claim-mode, `?claim=true`)** after `Claim your gift` is a **full standalone page** with a light gradient background, a centered white card, a long heading ("Enter your email — your free result stays safe there."), and a two-sentence explainer. It does **not** render inside `GameShellV2`. It reads like a third-party checkout page, not a native moment of the platform. Too much text. Too much ceremony. The user doesn't need an "explanation of the magic link" — they just need a frictionless way to leave an email so their result is not lost and so we have a unique ID + a comms channel. The right primitive is a **thin inline capture** inside the shell (inline form, or modal over the shell, or a non-blocking side panel), not a whole-screen interstitial with its own theme.

2. **The `/zone-of-genius` page** (`ZoneOfGeniusEntry.tsx`, public route on `App.tsx:196`) technically already imports `GameShellV2`, but the route behaves differently from how the logged-in shell behaves: the public version renders in a way that loses the left rail / top chrome, or the styling drifts, or the sub-screens of the ZoG assessment (`Step1SelectTop10Talents`, `Step2SelectTop3CoreTalents`, `Step3OrderTalents`, `Step4GenerateSnapshot`, etc.) don't fully inherit the shell frame. Sasha wants the entire Zone of Genius experience — entry, all assessment sub-steps, result — to live **natively inside the platform shell**, same chrome as `/game/me`, with **all built-in logic and sub-screens** intact.

## Guiding Principle

> *"Smooth and almost invisible to the user."*
>
> The user should feel they entered the platform when they clicked `Claim your gift`, and the platform is simply asking a quiet "where should we send your result?" as one bead on the string. They should **never** feel they were dropped onto a marketing-looking interstitial, then a separate product-looking page, then a separate result page. One shell, three moments.

## What to Change

### Part 1 — Email gate: replace the full-screen claim-mode view with an inline/modal capture inside `GameShellV2`

**Target files:**
- `src/pages/Auth.tsx` (claim-mode block, lines ~302–353) — either remove or gate behind a feature flag and route traffic away from it.
- `src/components/auth/SignupModal.tsx` — existing signup modal; may be the right primitive to extend.
- New component: `src/components/auth/ClaimEmailInline.tsx` (or reuse `SignupModal` in a "minimal" variant).
- `src/pages/LandingPage.tsx` / `src/pages/MethodologyLandingPage.tsx` — wherever `Claim your gift` CTA lives; change target from `/auth?claim=true` to a flow that opens the inline capture inside the shell.

**New behaviour:**
- `Claim your gift` → user is immediately dropped into `GameShellV2` at `/zone-of-genius` (or `/game/me/zone-of-genius` depending on final route — see Part 2), and the email capture renders as a **thin inline prompt or a modal overlay** inside that shell.
- Copy trim: kill the 2-sentence explainer. Just `Where should we keep your result safe?` (or similar — Sasha's call on final copy, but one line max). Single field. Single button. Single sub-line of reassurance.
- No theme shift — same dark shell backdrop, same type system, same glassmorphic card style used elsewhere in `/game/*`.
- The email capture does **not** block the ZoG assessment from starting. User can begin the assessment while the backend sends the magic link (anon claim already supports this via `save-anonymous-zog` + `PENDING_CLAIM_EMAIL_KEY`). The capture is a quiet "leave your email so we hold your result"; the assessment is the main event.
- Magic-link auth still sent server-side, still links back to the anon session on click — same plumbing as today, different surface.

**Acceptance:**
- Clicking `Claim your gift` on `/` does **not** navigate to a standalone `/auth?claim=true` full-screen page. Either the URL stays on `/` and opens a shell-native overlay, or it navigates into `/zone-of-genius` with the capture rendered inline inside the shell.
- The light-gradient claim-mode card in `Auth.tsx` is no longer reachable from the landing-page flow.
- Visually indistinguishable in chrome from the rest of `/game/*`.
- Email capture copy is one short heading + one short field + one button. No explainer paragraph.
- Existing anon-claim plumbing (`save-anonymous-zog`, `pending_claim_email` sessionStorage key) still works end-to-end: anon user finishes ZoG, clicks magic link in email, lands back signed-in with result attached.

### Part 2 — `/zone-of-genius` and all sub-screens render inside `GameShellV2`

**Target files:**
- `src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx` — already imports `GameShellV2`, verify it fully wraps.
- `src/modules/zone-of-genius/ZoneOfGeniusLandingPage.tsx`
- `src/modules/zone-of-genius/ZoneOfGeniusAssessmentLayout.tsx`
- `src/modules/zone-of-genius/Step1SelectTop10Talents.tsx`
- `src/modules/zone-of-genius/Step2SelectTop3CoreTalents.tsx`
- `src/modules/zone-of-genius/Step3OrderTalents.tsx`
- `src/modules/zone-of-genius/Step4GenerateSnapshot.tsx`
- `src/modules/zone-of-genius/AppleseedDisplay.tsx`
- `src/modules/zone-of-genius/ExcaliburDisplay.tsx`
- `src/App.tsx` — route definitions for `/zone-of-genius/*` (currently split between public `Route` at line 196 and `RequireAuth` routes at lines 353-357+; resolve the duplication).

**New behaviour:**
- All ZoG routes — entry, landing, assessment layout, Step1/2/3/4, Appleseed, Excalibur — render with `GameShellV2` as the outer wrapper. Left rail visible (with ME active as the current space). Top chrome visible. Same theme as the rest of `/game/*`.
- Public (unauth) access still works for the assessment flow — users arrive before creating an account. The shell renders for unauth users with the left rail in its "prospect" state (only Journey + ME unlocked, etc.).
- Sub-screens keep their existing in-built logic (selection UI, ordering UI, snapshot generation, Appleseed/Excalibur displays). This is a frame-around-existing-content change, not a rewrite.
- Remove the duplicate `/zone-of-genius` route in `App.tsx` (one public, one `RequireAuth`) — consolidate to a single route that handles both states cleanly.

**Acceptance:**
- `/zone-of-genius` loads with `GameShellV2` visible (left rail + top chrome) for both anon and authed users.
- Stepping through `Step1` → `Step2` → `Step3` → `Step4` → Appleseed → Excalibur never loses the shell frame. No full-page theme flashes between steps.
- The route duplication in `App.tsx` (line 196 public vs. line 353+ RequireAuth) is resolved — single source of truth.
- All existing ZoG assessment logic still works end-to-end (talent selection, ordering, snapshot generation, save to DB, Appleseed/Excalibur generation).

## Out of Scope (explicitly)

- Any change to the magic-link email template or the magic-link authentication plumbing itself.
- Any change to the `Auth.tsx` non-claim modes (signup, login, forgot-password) — those stay as they are.
- Any change to the ZoG assessment logic itself (talent matching, scoring, prompts). Only the frame around it.

## Notes

- Sasha's phrasing: "smooth and almost invisible for the user." Interpret anywhere this brief leaves ambiguity.
- If the cleanest implementation means collapsing the two parts (email capture + ZoG entry) into a single route like `/zone-of-genius` where the capture appears as a dismissible overlay on first visit, that's fine. Ship what reads as "one shell, one field, one moment."

## Cross-refs

- Roadmap Weekly Scope: W19 (email gate) + W20 (ZoG in shell)
- Roadmap Funnel Clarity Sprint: F2a (replaces/refines F2), F2b
- Roadmap Active Backlog: Item 29
- Related shipped: F0c (progressive Journey sections), F0b (ME rail flicker), F2 (email-before-ZoG principle — this brief is the concrete implementation)
