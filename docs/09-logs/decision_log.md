# Decision Log

> Architectural and product decisions. Append-only chronicle. Newest entry at top.
>
> Each entry: **Date · Decision · Rationale · Reversibility · Cross-references.** Entries here are decisions that bind the architecture (or commit explicitly to NOT binding it). They're reasoned-and-shipped; if a decision is reversed later, the new entry references the old.

---

## 2026-05-04 / 2026-05-05 (Day 61-62)

### D-2026-05-05-01 — Funnel monogamy as enforced architectural principle

**Decision:** Every entry path into the funnel converges on the reveal page (`/zone-of-genius`) as the single anchor. Free users never enter `/game/me/*`. The persuasive surface (offer cards, resonance check, top shadow, dodecahedron) lives only at the reveal.

**Implementation:**
- `MeGate` retired as general signup gate (guests redirect to `/zone-of-genius`)
- `AuthCallback` default `next` shifted `/playbook/discover` → `/zone-of-genius`
- `save-anonymous-zog` magic-link redirect target same shift
- `save-zog-result` email link converted to deposit-slip URL pointing back at `/zone-of-genius?result=<token>`
- Email body content stripped — no archetype, no bullseye, no fields. Email is a deposit slip, not a delivery vehicle.
- Both reveal pages (AI + assessment) converged on canonical 4-CTA bottom sequence: $555 build a business · $37 leverage top talent · playbook card · "Or just email me my result" button-to-input

**Rationale:** Free-user platform leakage was diluting the singular post-reveal CTA (book the session) and producing "circling for years" instead of progress. The roadmap Parked entry "Platform Onboarding Pathway" already named this principle (April 28 / Day 54): *"the funnel after Top Talent reveal is monogamous. The platform is post-session delivery infrastructure, not a self-serve discovery surface for cold leads."* Day 61-62 enforced it architecturally.

**Reversibility:** Reversible per surface (each redirect is one line, MeGate retirement is one component). Architecturally non-reversible without reintroducing the leak — but that's the point. The principle holds across the platform.

**Cross-references:** `roadmap.md` Sprint History Day 61-62 · `alexanders_unique_business.md` Lived User Journey section · `session_log.md` Day 61-62 · `morphogenetic_holomap.md` Day 61-62 Addendum (P4 advance)

---

### D-2026-05-05-02 — Deposit-slip email pattern

**Decision:** Save-result emails contain a single CTA back to the website. They do NOT contain the result content (no archetype, no bullseye, no fields). The persuasive surface lives only at the reveal.

**Rationale:** If the email body contains the full result, the user has an off-platform alternative that competes with the website visit. The email becomes a substitute for the reveal page, draining funnel returns. The deposit-slip pattern keeps the email's only job pure: bring the user back to the reveal.

**Reversibility:** One file (`supabase/functions/save-zog-result/index.ts`). Trivial revert.

**Cross-references:** `session_log.md` Day 61-62 lesson 5 · `morphogenetic_holomap.md` Day 61-62 Addendum (P3+P15 fidelity)

---

### D-2026-05-05-03 — `MeGate` retirement (with narrow bridges)

**Decision:** `MeGate` no longer renders an inline signup form for general visitors to `/game/me/*`. Guests get redirected to `/zone-of-genius`. Two narrow bridges remain: (1) post-Stripe-payment URL (`?payment=success`) renders SaveProfileCard so paying buyers can create their account; (2) `coupon_activated` sessionStorage flag converged on the same `?payment=success` URL convention so coupon redemption goes through signup too.

**Rationale:** The inline signup form was the source of repeated regressions all of Day 61 (missing migration call, password rejection, silent-account collision, race conditions). It also contradicted the funnel monogamy principle. The narrow bridges preserve the legitimate paid-user paths without leaking access to free users.

**Reversibility:** Per-bridge reversible. The dead `SaveProfileCard` JSX block is preserved in the file with a `// LEGACY DEAD CODE` marker — easy to revive if a future requirement needs it.

**Cross-references:** `MeGate.tsx` lines 105–225 · `session_log.md` Day 61-62 themes · `morphogenetic_holomap.md` Day 61-62 (P11 advance)

---

### D-2026-05-05-04 — Token URL convention for returning users

**Decision:** Returning-user URLs use the pattern `/zone-of-genius?result=<game_profiles.access_token>`. The token is the access mechanism — no auth session required. The same `ZoneOfGeniusEntry` component renders for live-quiz, return-via-email, and post-magic-link entry. No replica page (`MyResult.tsx` kept mounted as legacy URL handler for historical inbox links, not the canonical return path).

**Rationale:** Day-47's earlier decision (replace `/my-result?token=...` with magic-link → `/game/me`) created two problems: (1) magic-link → `/game/me` was a platform leak; (2) `MyResult.tsx` rendered RevelatoryHero in a duplicate code path, drift inevitable. The token URL on the same `ZoneOfGeniusEntry` component solves both — funnel monogamy preserved, single render path no drift.

**Reversibility:** Reversible per email-generator file. The Mode A logic in `ZoneOfGeniusEntry` could be kept disabled if reverted.

**Cross-references:** `ZoneOfGeniusEntry.tsx` Mode A + Mode B · `session_log.md` Day 61-62 lesson 4 (architectural complexity) · supersedes the Day-47 magic-link decision

---

### D-2026-05-05-05 — Master Legibility Parameter

**Decision:** Legibility is treated as a single intensity dial with three named levels — Subtle (1.0×), Standard (1.25×), **Strong (1.5×) = de-facto default for this product**. Five levers calibrated per level: weight bump, muted-alpha lift, halo-deep token (white lift + navy under-stroke for variable-luminance bg), italic letter-spacing, scrim escalation.

**Rationale:** Recurring "hard to read" feedback from real users (Karime + others) on the landing hero exposed that the editorial italic-Cormorant body was fighting variable-luminance backgrounds. Three rounds of legibility passes converged on a structured framework. Codifying as a single parameter prevents each future surface from rediscovering the values.

**Reversibility:** Reversible per surface (each cocktail application is a single edit). The master parameter itself lives in `ui_playbook.md` Part VIII as documentation; if the brand voice ever needs to drop back to Standard or Subtle, the framework supports it.

**Cross-references:** `ui_playbook.md` Part VIII "Legibility — When Brand Meets Readability" + Master Legibility Parameter subsection · `index.css` `--skin-text-halo-deep` token + light-skin muted alpha bumps · `session_log.md` Day 61-62 themes

---

### D-2026-05-05-06 — Defensive heal-on-read for orphaned data pointers

**Decision:** When a foreign-key pointer (e.g., `game_profiles.last_zog_snapshot_id`) is read by multiple consumers and can be NULL while the underlying data exists, the architecture provides BOTH: (a) a backfill migration that heals existing affected rows at deploy time, AND (b) defensive read-site fallback that re-queries by the underlying foreign key + heals the pointer in-place if missing. The pattern applies to any "read by foreign-key pointer" surface.

**Rationale:** A NULL pointer where data exists creates a silent data-loss illusion — pages show empty state for users who actually have data. Backfill alone misses future regressions; read-site fallback alone leaves existing affected accounts broken until they touch the page. Both together = self-healing.

**Reversibility:** The migration is idempotent (re-running safe). The defensive fallback adds ~10 lines per read site, fully revertible.

**Cross-references:** `supabase/migrations/20260504200000_backfill_last_zog_snapshot_id.sql` · `ZoneOfGeniusOverview.tsx` + `ZoGPerspectiveView.tsx` defensive blocks · `session_log.md` Day 61-62 lesson 9

---

### D-2026-05-05-07 — Day-1/2/8 nurture email sequence killed in code (not deleted)

**Decision:** Both the enqueue path (`save-zog-result` Step 6) and the dispatcher (`process-nurture-emails`) gated by `NURTURE_EMAILS_KILLED = true` and `NURTURE_DISPATCH_KILLED = true` constants. No new sequences enqueue; in-flight queued rows do not dispatch. All template rendering, payload shape, schedule logic, opt-out infrastructure preserved in code.

**Rationale:** The Day-47 sequence was added default-on without explicit opt-in framing on the reveal save form. Legal posture under GDPR is shaky; brand posture under the editorial register is questionable. Sasha's stated intent: *"don't want to spam anybody."* Killing in code (rather than deleting) preserves the apparatus for revival once consent UX is added.

**Reversibility:** To revive: flip both constants to `false` AND add explicit consent UI on save form AND audit any rows in `nurture_email_queue` with stale `scheduled_for`.

**Cross-references:** `roadmap.md` Parked section "Day-1 / 2 / 8 nurture email sequence" · `session_log.md` Day 61-62 themes

---

### D-2026-05-05-08 — `successFired` flag pattern for false-alarm guards

**Decision:** When an async operation has multiple side effects after the primary success (toast, navigation, telemetry, secondary updates), wrap the function body with a `successFired = true` flag set immediately after the success toast. The outer catch checks this flag — if success already fired, log post-success errors silently (the primary operation succeeded); only show the user-facing error toast if success has NOT yet fired (genuine primary failure).

**Rationale:** Without the guard, a side-effect failure (telemetry, redirect, secondary supabase call) bubbles to the outer catch and triggers a misleading "Failed to save" toast on top of a successful render. The user sees both "saved" and "failed" — confusing and wrong.

**Reversibility:** The flag is a 3-line addition per function. Trivial to add or remove.

**Cross-references:** `Step4GenerateSnapshot.tsx` `handleGenerate` + `saveSnapshotToDatabase` · `session_log.md` Day 61-62 lesson 10

---

### D-2026-05-05-09 — `postAuthSideEffects` migrate-before-claim sequencing

**Decision:** The global SIGNED_IN listener in `postAuthSideEffects.ts` runs `migrateGuestDataToProfile()` BEFORE `attemptClaimWithRetry()`. Sequenced via async IIFE (listener callback returns synchronously to not block other listeners). This closes the Case 2 edge case: user retakes quiz unauthed → guest_appleseed_data in localStorage → user signs in via magic-link recovery (already-registered email) → without the global listener migrating, the new quiz data was lost.

**Rationale:** Migration uses SELECT-then-UPDATE-or-INSERT (idempotent). Claim does INSERT-on-find of unclaimed `anonymous_genius_results` row. If both run in parallel for the rare overlap user (both data sources exist), they could both INSERT and produce duplicate snapshots. Sequenced (migrate first → completes → claim runs second), the snapshot row from migrate exists by the time claim's blind INSERT might fire — claim's path still creates an extra row in the rare overlap case (acceptable; `getOrCreateSnapshot` returns most recent), but the much-more-common single-source case never duplicates.

**Reversibility:** Single file (`postAuthSideEffects.ts`), ~15 lines.

**Cross-references:** `postAuthSideEffects.ts` SIGNED_IN handler · `session_log.md` Day 61-62 themes (Case 2 edge case)

---

## 2026-05-05 (Day 62 late evening)

### D-2026-05-05-10 — `UBB_LANGUAGE_GUIDELINES` as cross-artifact vocabulary guard

**Decision:** Every UBB generate + improve system prompt is prepended with a shared `UBB_LANGUAGE_GUIDELINES` constant (defined in `supabase/functions/_shared/ubb-prompts.ts`). The guidelines forbid four classes of leak: (1) framework vocabulary into outputs (`"top talent"`, `"archetype"`, `"zone of genius"`, `"ZoG"`, `"appleseed"`, `"excalibur"`, `"specificity matrix"`, `"holon"`, `"monotonic improve loop"`); (2) calibration-example or other-founder-canvas vocabulary into the current founder's output; (3) sourcing voice from anywhere except the founder's own ZoG snapshot + canvas + pasted texts (translated per rule 1); (4) sanity-check before returning that the sentence reads naturally to someone in the founder's actual domain.

**Rationale:** The Karime MYTH bug surfaced on Day 62 — her artifact contained the literal phrase *"top talent"* despite her domain being quantum medicine. Root cause: the UNIQUENESS prompt (line 61 of `ubb-prompts.ts`) seeded with `"ZoG top talent and archetype"` literally, leaking framework vocabulary into UNIQUENESS for every founder. MYTH derives from UNIQUENESS and inherited the leak. ZoG already had a NO INSIDER JARGON guard (in `src/prompts/user/zoneOfGeniusPrompt.ts` lines 45/54) protecting itself from inventing jargon outward; UBB had no symmetric inward-facing guard, so jargon flowed back in via ZoG outputs unchallenged. Single point of enforcement (one constant, prepended once) prevents this from recurring across 19 artifacts and any future ones added.

**Reversibility:** Single constant in one file. Edge function imports are 1-line. Trivial revert.

**Cross-references:** `_shared/ubb-prompts.ts` `UBB_LANGUAGE_GUIDELINES` constant · `generate-artifact/index.ts` + `improve-artifact/index.ts` system prompt prepend · `session_log.md` Day 62 (late evening) entry

---

### D-2026-05-05-11 — `distillation` as required field on every artifact (the propagation atom)

**Decision:** Every artifact in `ARTIFACT_CONFIGS` has a required `"distillation"` field as the first key in its `outputSchema`. Description: *"one self-sustainable sentence carrying this artifact's essence in the founder's own domain language."* A new `UBB_DISTILLATION_DIRECTIVE` constant (5 rules) is prepended to every generate + improve system prompt to enforce: ONE sentence, self-sustainable, founder-domain-language, may equal a headline-equivalent field if one exists, sticky-note test before returning. The distillation becomes the headline of every artifact card in `/ubb` (rendered as Cormorant-italic gold-accented blockquote via new `DistillationBlock` component) and on `PublicDossier`. It is also designated as the propagation atom for the upcoming markdown export (each new version's distillation appended on top of previous versions in the founder's living unique-business canvas markdown).

**Rationale:** Sasha needed (a) a single hand-editable sentence per artifact for the markdown export's living-chronicle architecture, (b) a way to emphasize the artifact's essence visually at the top of every card, (c) a normalized field across all 19 artifacts (their content shapes vary; many had no headline-equivalent; even those that did — `uniqueness.sentence`, `myth.photon`, `promise.promise_sentence` — had no shared name). Adding ONE shared mandatory field with a strong directive solves all three at once. The distillation may equal a pre-existing headline OR be a tighter synthesis — the model decides.

**Reversibility:** Schema additions are non-breaking (JSONB content accepts arbitrary shape). Removing the directive would leave existing distillations in DB unchanged but stop new ones being generated. UI component reverts cleanly.

**Cross-references:** `_shared/ubb-prompts.ts` `UBB_DISTILLATION_DIRECTIVE` + 19 `outputSchema` updates · `screens/GenericArtifactScreen.tsx` `DistillationBlock` + `ArtifactContentView` peel logic · `pages/PublicDossier.tsx` matching peel + render · `session_log.md` Day 62 (late evening) entry · `markdown_sync_spec.md` (Stage 1 of the markdown export will read this field as the propagation atom)

---

### D-2026-05-05-12 — V1 restore as append-only operation

**Decision:** "Return to v1" creates a new version row whose `content_json` + `specificity_score` are copies of v1's, with `parent_version_id` pointing at the current latest, `what_changed: "Restored from v1"`. Append-only — never overwrites or deletes existing rows. UI surface: `↺ Return to v1` link in the artifact metadata row of `GenericArtifactScreen`, hidden when `latest.version === 1`, disabled while an Improve is in flight, requires `window.confirm` before firing.

**Rationale:** Founders need a recoverable anchor — Day 51's bulk-seed shipped 16/18 artifacts as locked v1 @ specificity 9.5, and these v1s are real, considered baselines worth preserving. Three options were considered: (A) hard overwrite (deletes v2…vN and restores v1 as canonical — loses history, violates the paramount append-only invariant), (B) new version = copy of v1 (preserves history, no schema change), (C) pointer swap (cleanest semantically but requires schema change to add `current_version_id` column). Sasha approved B. Smallest schema change (none), preserves the entire iteration chain (re-restorable if user wants the iterations back), familiar mental model (Improve adds versions; Restore adds a version).

**Reversibility:** Single context method (~80 lines), single UI link (~30 lines). Trivial revert per surface.

**Cross-references:** `UniqueBusinessContext.tsx` `restoreToV1` action · `screens/GenericArtifactScreen.tsx` UI link · `types.ts` `UniqueBusinessActions.restoreToV1` signature · `session_log.md` Day 62 (late evening) entry

---

## 2026-05-06 (Day 63)

### D-2026-05-06-01 — Idempotency at the data layer beats `isSaved` flags at the component layer

**Decision:** When a `useEffect` fires on remount and produces a write side-effect, dedup must read shared state (DB or sessionStorage), not local component state. Codified in the QoL Results page: before inserting a new `qol_snapshots` row, query the most recent snapshot via `last_qol_snapshot_id` and compare cell-by-cell to the current answers. If they match exactly, no-op and mark saved. Generalize: any component-level "did we save this already?" flag that resets per mount is insufficient for a save-on-mount effect — the dedup question must be answerable from data the component doesn't own.

**Rationale:** The QoL Results page had a local `useState` flag (`isSaved`) that was supposed to prevent duplicate inserts. It worked WITHIN a mount but resets on every remount (refresh, navigate-away-and-back, double-mount in Strict Mode). Result: every visit produced another row in `qol_snapshots`. The XP-award guard (`xp_awarded` boolean on each row) prevented double-XP correctly, but no row-level dedup existed. Cell-by-cell comparison is the cheapest correct dedup that requires no schema change. Pattern applies to any save-on-mount effect anywhere in the codebase: `acceptImprovement` (UBB) is similar but uses explicit user click as the trigger, so doesn't have the same risk; `saveSnapshotToDatabase` (QoL) had the issue because the trigger was an effect-on-state-change.

**Reversibility:** The idempotency check is ~15 lines + a helper function. Removing it restores the previous (buggy) behavior. No schema change to revert.

**Cross-references:** `QualityOfLifeMapResults.tsx` `answersMatchSnapshot` helper + idempotency block · `session_log.md` Day 63 (continued) entry · related pattern: `successFired` flag in `Step4GenerateSnapshot.tsx` (Day 61-62 D-2026-05-05-08 — false-alarm guard, different shape, similar lesson)

---

### D-2026-05-06-02 — `?fresh=true` URL param as the cross-mount "skip the load" signal

**Decision:** When a context provider's mount-effect populates state from a DB read, and the user has an action that genuinely wants to bypass that read (e.g., "Retake Assessment"), use a URL search param read at provider-mount time as the skip signal. Implementation: navigate to the entry route with `?fresh=true`; the provider's load effect checks `URLSearchParams(location.search).get("fresh") === "true"` and short-circuits (sets `isLoading: false`, returns). Captured at mount only — subsequent URL changes within the same mount don't re-trigger.

**Rationale:** The QoL "Retake" button was silently lying. `reset()` cleared local answers, but on any provider remount during the retake (refresh, navigate-away-and-back), the load effect re-fired and re-populated the answers from the saved snapshot. Three options considered: (A) delete the snapshot row (destructive — loses retake-from-X-to-Y telemetry potential), (B) sessionStorage flag (works cross-tab, risks staleness), (C) URL param (declarative, debuggable, scoped to the navigation event). Picked C. The URL captures the user's intent — "I'm retaking, skip the load" — and travels with refreshes and bookmarks. Subsequent navigation within the retake (Assessment → Results → Priorities) clears the param naturally; the next normal mount loads from DB as expected.

**Reversibility:** ~6 lines added to the provider effect; ~5 chars added to one navigate call. Trivial revert.

**Cross-references:** `QolAssessmentContext.tsx` load effect with `?fresh=true` check · `QualityOfLifeMapResults.tsx` `handleRetake` navigate call · `session_log.md` Day 63 (continued) entry

---

## 2026-05-07 (Day 64)

### D-2026-05-07-01 — Trace-every-surface rule (operating protocol)

**Decision:** When a user-visible symptom is reported, trace EVERY surface that could contribute to it BEFORE claiming the fix is shipped. Three concrete symptom classes have been documented in `.agent/session-protocol.md` with the surfaces to trace for each: (1) **duplicate brand-mark / logo / wordmark** — `GameShellV2.hideLogo` + `SiteLogo` global + page-internal lockups + every brand-asset import; (2) **database save / "Could not save" toasts** — schema migration first, then application insert, then RLS, then post-insert side effects; (3) **rasterization / html2canvas / PDF generation** — inline styles + parent classes + `::before`/`::after` pseudo-elements + properties html2canvas can't rasterize (`mask-composite`, `backdrop-filter`, `filter`, `clip-path`, CSS variables in offscreen render context). Operating rule: *"if you can't enumerate the surfaces traced, the fix isn't ready to ship."* Response template: *"I traced [N] surfaces: [A, B, C]. Cause is [specific]. Fix: [diff]. Other [N-1] surfaces were [clean / also-fixing]."*

**Rationale:** Across the QoL module thread (Days 63–64), my fixes were repeatedly CORRECT but PARTIAL. I'd identify ONE contributing cause, ship the fix, claim done, and Sasha would still see the symptom because OTHER contributing causes remained. Examples: the duplicate logo had TWO different elements at similar Y positions (`GameShellV2`'s top-right home icon controlled by `hideLogo`, AND the `SiteLogo` global wordmark with its own opt-in suppression list); the "Could not save" toast was a schema mismatch (`overall_score` undefined column) but my first fix was an architecture-level refactor; the PDF download was THREE-layer: backdrop-filter scrub (Day 63) + CSS-var resolution (Day 64 first pass) + `::before` pseudo-element with `mask-composite: exclude` strip (Day 64 second pass). Codifying the rule transforms what was a recurring pattern of "found the fix → ship → still broken" into "trace surfaces → enumerate → fix is comprehensive." The rule was applied in real-time the same day a `/asset-mapping` entry was added to `SiteLogo.tsx`'s hidden array — applying the rule across the codebase, not just to QoL.

**Reversibility:** Codified as an anti-pattern + checklist in session-protocol.md. Removable by editing that file. The pattern itself (multi-surface symptoms requiring multi-surface fixes) is real regardless of whether the rule is documented; the doc just makes it explicit and reusable.

**Cross-references:** `.agent/session-protocol.md` "Trace-every-surface checklist" section · `session_log.md` Day 64 (final pass) entry · related lessons logged in earlier session_log entries (D-2026-05-05-08 `successFired` flag pattern, D-2026-05-06-01 idempotency-at-data-layer)

---

### D-2026-05-07-02 — `mask-composite` pseudo-element strip in html2canvas onclone

**Decision:** When rasterizing any subtree that uses Apple iOS 26 Liquid Glass treatment (`.liquid-glass` / `.liquid-glass-strong` per `docs/03-playbooks/glassmorphism_blueprint.md`), the html2canvas `onclone` callback MUST inject a `<style>` tag that overrides those classes with solid backgrounds AND hides their `::before` pseudo-elements. The `::before` uses `mask-composite: exclude` for the asymmetric edge-light effect — html2canvas can't rasterize mask-composite, which produces black/empty/glitched output and surfaces as "Could not generate PDF" failure. The override pattern:

```typescript
const styleOverride = clonedDoc.createElement('style');
styleOverride.textContent = `
  .liquid-glass, .liquid-glass-strong {
    background: rgba(255, 255, 255, 0.94) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 0.5px solid rgba(26, 30, 58, 0.12) !important;
    box-shadow: 0 4px 16px -4px rgba(10, 22, 40, 0.08), 0 16px 40px -20px rgba(10, 22, 40, 0.16) !important;
  }
  .liquid-glass::before, .liquid-glass-strong::before {
    display: none !important;
  }
`;
clonedDoc.head.appendChild(styleOverride);
```

The live UI is untouched; only the cloned doc gets the override. The PDF reads as a clean printable card.

**Rationale:** The QoL Results page used `liquid-glass` per the glassmorphism blueprint. PDF download kept failing despite (a) Day 63's backdrop-filter scrub, (b) Day 64's CSS-var resolution. The actual blocker was the `::before` pseudo-element. Pattern applies to ANY rasterization of liquid-glass surfaces (Top Talent reveal, /ubb dossier, future modules using the playbook).

**Reversibility:** Self-contained in the onclone callback. Removing it just restores the broken behavior — easy to revert if liquid-glass styling changes such that the strip becomes unnecessary.

**Cross-references:** `src/pages/QualityOfLifeMapResults.tsx` `handleDownloadPdf` onclone · `docs/03-playbooks/glassmorphism_blueprint.md` (the spec that defines the `::before` mask-composite trick) · `session_log.md` Day 64 (final pass) entry

---

### D-2026-05-07-03 — Schema-correct INSERT (the `overall_score` smoking gun)

**Decision:** `qol_snapshots` table schema (per migration `20251130150920_fba5bd03-65a0-4435-adc8-4fe281d70de7.sql`) has columns: `id`, `profile_id`, `created_at`, 8 `*_stage` SMALLINTs, plus `xp_awarded` BOOLEAN (added by `20251130154626`). There is NO `overall_score` column. The application code was sending `overall_score: overallAverage` in the INSERT payload, which Postgres rejected with error code 42703 (undefined column). Removed the field from the insert; overall is computed client-side on render.

**Rationale:** The QoL Results page's "Could not save your results" toast was firing on every visit. Day 63 evening I refactored `saveSnapshotToDatabase` into the two-phase pattern (`successFired` discipline) thinking the toast was post-save side effects throwing into the same try/catch as the actual write. The architecture was correct but the bug was simpler — the INSERT itself was malformed against schema. Reading the migration file FIRST would have surfaced the cause in 30 seconds (this is now codified as part of D-2026-05-07-01's "schema-before-architecture" rule).

**Reversibility:** Removing one field from the insert payload; trivial to revert if `overall_score` is ever added as a real column via migration.

**Cross-references:** `src/pages/QualityOfLifeMapResults.tsx` `saveSnapshotToDatabase` · `supabase/migrations/20251130150920_fba5bd03-65a0-4435-adc8-4fe281d70de7.sql` (the actual schema) · `session_log.md` Day 64 morning entry

---

## How to read entries above

Each decision is reasoned at the time and shipped. If a decision is later reversed (new evidence, principle shift, scope change), the new entry references the old one explicitly — *"Supersedes D-YYYY-MM-DD-NN."* This is an append-only log; old entries don't get edited. Reading top-to-bottom traces the architectural lineage. Reading bottom-to-top traces the architectural state.
