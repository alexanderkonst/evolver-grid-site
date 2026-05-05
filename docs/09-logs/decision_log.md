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

## How to read entries above

Each decision is reasoned at the time and shipped. If a decision is later reversed (new evidence, principle shift, scope change), the new entry references the old one explicitly — *"Supersedes D-YYYY-MM-DD-NN."* This is an append-only log; old entries don't get edited. Reading top-to-bottom traces the architectural lineage. Reading bottom-to-top traces the architectural state.
