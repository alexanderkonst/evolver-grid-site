# Funnel v2 — Matching-as-Hero (Product Spec)

> *Reshape the public funnel to serve two audiences cleanly: matching-seekers and venture-builders. ONE platform with ONE canonical JOURNEY sequence (T-M-A-Q-Build) underneath; TWO landing pages on top, query-param routed via `?path=`. Existing BuildLanding stays largely intact (one small surgical change — Direct-Ignite CTA removed); new MatchLanding component created with matching-first copy. BUILD space holds the venture-path content; Ignite Session lives only inside BUILD.*

**Status:** Draft, ready for execution.
**Date opened:** May 20, 2026 (Day 77).
**Spec author:** Alexander Konstantinov with AI assistance.
**Executor:** TBD (Lovable session + targeted human review).
**Estimated total effort:** ~1 day of focused work (most of it prompt-driven).

---

## 1. What we're doing

We are reshaping the JOURNEY space and **adding a second landing page** so the platform serves two audiences cleanly: venture-building founders AND matching-seeking collaborators. ONE platform underneath, TWO landing pages on top, differentiated by a `?path=` query parameter. Per-skin mirroring stays trivial — each skin has its two landings configured the same way.

The matching-onboarding sequence (Talent → Mission → Assets → QoL → bridge-to-Build) becomes the single canonical JOURNEY space ordering for everyone. The unique-business / venture-building content (which used to live inside JOURNEY) moves into the BUILD space, where it becomes the deeper layer accessible to all users.

**Critical:** there is ONE platform with ONE journey sequence. The two landings are *two marketing entrances*, not two products. After a user passes through either landing into the assessment, they are in the same platform with the same modules accessible via the same routes. The only thing that varies post-landing is which CTA is foregrounded after the Top Talent reveal — driven by the `?path=` parameter the user carried in.

Ignite Session is **no longer linked from either public landing or the post-Top-Talent screen.** It remains accessible at `/ignite` and is surfaced only from inside the BUILD space, as the premium step for members who graduate into venture-building work with Alexander.

---

## 2. Why we're doing it

Three converging reasons:

1. **The Day 76–77 strategic crystallization** ([`monetization_strategies.md` → Strategic Crystallization](../../02-strategy/monetization_strategies.md#strategic-crystallization-day-7677-may-1920-2026)) repositioned the product: matching is what the market buys; unique-business methodology is the engine that makes matching deep. Lead with the buyable layer.
2. **The first $555 from a stranger via the old funnel is still unfired** after months of trying. The unique-business-as-hero positioning hasn't converted strangers. The matching pivot is the strategic response.
3. **Community ecosystem leaders (Balaji, Carolina, vnest, venture studios) need a coherent matching-first surface to land on** when Alexander reaches out. Without this funnel reshape, the v6 Balaji message points at a unique-business landing that contradicts its own positioning.

Full strategic context lives in three load-bearing docs:
- [`docs/02-strategy/monetization_strategies.md`](../../02-strategy/monetization_strategies.md) — commercial framing
- [`docs/02-strategy/unique-businesses/alexanders_unique_business.md`](../../02-strategy/unique-businesses/alexanders_unique_business.md) — funnel architecture v2 section
- [`docs/03-playbooks/leonardo_strategy_instances/balaji_srinivasan.md`](../../03-playbooks/leonardo_strategy_instances/balaji_srinivasan.md) — first pilot target

---

## 3. The new user experience (narrative)

Two entry points, one product underneath.

**Match path entry:** A potential collaborator arrives via Balaji's Discord message at `findyourtoptalent.com/?path=match`. The matching-landing component renders. Hero says **"Stop building alone."** Eyebrow: *"Precision matchmaking for collaboration."* Single CTA: *"Find your top talent →"*.

**Build path entry:** An aspiring founder arrives via Alexander's existing venture-angle outreach at `findyourtoptalent.com/?path=build` (or just `/`, defaulting to build). The existing venture-landing component renders almost unchanged — the only modification is that the Direct-Ignite CTA is removed (single CTA only: the Free ZoG). Hero: *"Your genius is already there. It just hasn't been named."* The five-founder testimonials stay. Single CTA: *"Discover your genius first →"*.

**Both paths converge into the same Top Talent assessment.** ~10–15 min. Same component, same flow, same outcome.

**After the reveal, the post-Top-Talent CTA branches significantly based on `?path=`:**

- **Match-path users (`?path=match`):**
  - **PRIMARY CTA:** *"Discover your mission — free, 2 minutes →"* → routes to Mission Discovery (JOURNEY item 2)
  - Secondary (less prominent): *"Unlock the full Top Talent profile"*
  - The user continues through JOURNEY: Mission → Assets → QoL → matchable
- **Build-path users (`?path=build` or no param):**
  - **PRIMARY CTA:** *"Build a Business off your top talent →"* → routes **directly to BUILD space** (bypassing JOURNEY locks)
  - Secondary (less prominent): *"Or discover your mission first — 2 min →"*
  - The user enters BUILD immediately for venture-building content

**The two flows DIFFER substantially after Top Talent.** Not just secondary-link emphasis (earlier draft had this wrong) — the PRIMARY CTA target is different. Match-path goes into JOURNEY; build-path goes into BUILD space.

After landing in their chosen destination, both users have **full access to all modules** via direct navigation. JOURNEY locks are *advisory* (visual guidance), not access-gating. A build-path user who decides they want to be matchable can navigate to Mission Discovery anytime — JOURNEY just shows it as the visual "next step" only after Top Talent completion. A match-path user can peek into BUILD anytime via sidebar navigation.

The BUILD space holds *The Path to Your Unique Business*, *See the Dashboard*, *Take the exact playbook*, and the Ignite Session for hands-on work with Alexander.

**Why this works as ONE product:** both users have access to everything. The path just colors which destination feels primary right after Top Talent. No one is locked out of anything. No mode toggle needed.

---

## 4. Specifications

### 4.1 Landing pages — two of them, query-param routed

**Two landing components, one router decision:**

**(a) `src/pages/LandingPage.tsx` — the BUILD-path landing (existing, ONE surgical change)**

The current venture-building landing stays in almost all respects. Copy stays. Hero (*"Your genius is already there. It just hasn't been named."*) stays. Five-founder testimonials stay.

**The ONE change:** remove the Direct-Ignite CTA from the existing two-paths split. The landing becomes single-CTA (Free ZoG only, routes to `/start?path=build`). Strangers no longer convert to $555 Ignition directly — consistent with the principle stated in §1 that Ignite lives only inside BUILD space.

Everything else on BuildLanding (gradient, paper-grain texture, paths-styling, testimonial structure) is preserved verbatim.

**(b) `src/pages/MatchLanding.tsx` — the MATCH-path landing (new)**

Created new. Same shell, layout, fonts, gradient backgrounds, component patterns as `LandingPage.tsx`. Different copy:

| Element | Copy |
|---|---|
| **Eyebrow** | *"Precision matchmaking for collaboration"* |
| **Hero (h1)** | *"Stop building alone."* |
| **Sub paragraph** | *"Your people are already in this network. We surface them. Real introductions follow."* |
| **Italic line** | *"You've met cool people. You still haven't found your people."* |
| **CTA button** | *"Find your top talent →"* |
| **CTA route** | `/start?path=match` |
| **Founder testimonials** | NOT present (they're venture-outcome testimonials, not matching-outcome — stay on BuildLanding only) |
| **Two-paths split** | NOT present (single CTA on this landing) |

*Sub copy compressed: removed the "ten minutes" reference because Top Talent is ~10-15 min and Mission is 2 min — putting a single time on the landing risked misleading. The CTA itself tells the story (Find your top talent → leads to matches).*

**Routing logic at `findyourtoptalent.com/`:**

The root route (`/`) reads the `?path=` query parameter:
- `?path=match` → renders `<MatchLanding />`
- `?path=build` → renders `<LandingPage />` (the existing one)
- **No param → defaults to `<LandingPage />`** (existing venture landing) — **decision: BuildLanding is the default.** Rationale: preserves existing behavior for bookmarked / organic / search traffic; the matching audience always arrives via outreach links with `?path=match` explicitly. Reversible later if the strategic balance shifts.

**For outreach:**
- Balaji's Discord message: link to `findyourtoptalent.com/ns/?path=match` (NS skin + match landing)
- Other ecosystem-leader outreaches: link to `/?path=match` or `/[skin]/?path=match` as appropriate
- Sasha's existing venture-angle outreach / social audience: link to `/` (defaults to build landing) or `/?path=build` for explicit attribution

**The query param's lifecycle:**
- Held in URL on landing (drives which component renders)
- Carried forward into the CTA route (`/start?path=match` or `/start?path=build`)
- **Persists through the multi-step Top Talent assessment** — see persistence approach below
- Read post-Top-Talent (drives CTA branching — see §4.4)
- Stripped from URL after post-Top-Talent screen (its job is done)
- Not persisted to the database. No `preferred_path` column.

**Persistence approach through the assessment flow (implementation detail):**

The cleanest pattern is a small React context provider (`<EntryPathProvider>`) wrapping the assessment routes:

1. On the first route that reads `?path=` (the landing or `/start`), the context captures the value
2. The context value is also written to `sessionStorage` (so it survives accidental refreshes/back-navigation but doesn't leak across sessions)
3. Every assessment route (Top Talent, reveal page, etc.) reads from context, not the URL — so URL doesn't need to carry the param on every step
4. The post-Top-Talent screen reads context to determine CTA branching
5. After the post-Top-Talent screen, the context can be cleared (and sessionStorage cleaned up)

This is ~20 lines of React. No external dependencies. Fully testable.

**Why no DB persistence:** keeps complexity low; the path is just a marketing-entry signal, not a structural user attribute. All modules are accessible to all users via the same routes regardless of entry path. The path just colors the initial framing.

### 4.2 JOURNEY space — new sequence + lock logic

**File:** `src/components/game/SectionsPanel.tsx` (the JOURNEY space pane).

**New order (5 items):**

| # | Label | State logic |
|---|---|---|
| 1 | *Start by finding your top talent* | Always unlocked. Entry point. |
| 2 | *Discover your mission* | Locked (crossed out) until #1 is completed. Unlocks on #1 completion. |
| 3 | *Map your assets* | Locked (crossed out) until #2 is completed. Unlocks on #2 completion. |
| 4 | *Assess your quality of life* | Locked (crossed out) until #3 is completed. Unlocks on #3 completion. **Badge:** *"Improves your match quality"* — signals it's load-bearing but not strictly gating. |
| 5 | *Build a business off your top talent* | Locked (crossed out) until #3 is completed. Unlocks on #3 completion (in parallel with #4). **Badge:** *"→ Build space"* — visually signals this is a bridge to a different surface, not another step. |

**Lock-state visual treatment:**
- Locked = label rendered with strikethrough + dimmed (current "crossed out" treatment from the screenshot Sasha shared)
- Unlocked = label rendered in full color, clickable
- Completed = label rendered with checkmark or completion indicator (existing pattern)

**Matchable threshold:** user becomes matchable after #3 (Map your assets) is completed. T-M-A is the triad that opens the matching surface. QoL (#4) refines match precision but is not required for the first match wave.

**Critical: JOURNEY locks are advisory, not access-gating.** The lock state controls how items render in the JOURNEY pane (crossed out vs. unlocked) — guidance. The actual routes (Mission Discovery, Asset Mapping, QoL, BUILD space, etc.) are NOT access-gated by JOURNEY. Any authenticated user can navigate directly to any of them anytime. This is what enables build-path users to go straight from Top Talent reveal → BUILD space via their primary CTA, without first completing Mission / Assets / QoL.

**Removed from JOURNEY (moved to BUILD space — see §4.3):**
- *Take the exact playbook* (was JOURNEY #2)
- *See the shortcut path to your business* (was JOURNEY #3) — **renamed** to *"The Path to Your Unique Business"*
- *See how we're building this* (was JOURNEY #4) — **renamed** to *"See the Dashboard"*

### 4.3 BUILD space — new contents + navigation

The BUILD space already exists in the codebase. This spec only changes:

1. **Which items live inside it.**
2. **Where users enter from.**

**New BUILD space contents:**

| Item | Source |
|---|---|
| *The Path to Your Unique Business* | Renamed from JOURNEY's *"See the shortcut path to your business"* |
| *See the Dashboard* | Renamed from JOURNEY's *"See how we're building this"* |
| *Take the exact playbook* | Moved from JOURNEY |
| *Ignite Session* (premium step) | Surfaced inside BUILD space — accessible to members who completed the matching triad |
| `/path` value-ladder page | Moved from JOURNEY (where it was last item) |

**Note on founder testimonials:** they STAY on BuildLanding (see §4.5). They are NOT moved into BUILD space. Earlier draft suggested moving them; that was retracted.

**Navigation in:**
- From JOURNEY item #5 (*Build a business off your top talent*), clicking enters the BUILD space.
- `/ignite` URL stays valid (direct links don't 404) but is **not linked from landing or post-Top-Talent screen.**

**Visual treatment of BUILD entry from JOURNEY:**
- JOURNEY item #5 should feel like a doorway, not another sequential step. Subtle visual differentiation (badge, arrow, divider) so users understand they're transitioning surfaces.

### 4.4 Post-Top-Talent CTA — branches significantly based on `?path=`

**Current state:** After the Top Talent reveal page, the user sees a binary-fork screen: *Build a business / Unlock deeper profile / See the playbook.*

**New state:** The post-Top-Talent screen reads the `?path=` value (from React context / sessionStorage, per §4.1 persistence approach) and shows DIFFERENT primary CTAs per flow. **This is a substantive branch, not just visual emphasis.**

**Match-path users** (came in via `?path=match`):
- **PRIMARY CTA:** *"Discover your mission — free, 2 minutes →"*
  - **Routes to:** Mission Discovery (JOURNEY item 2)
  - **Why:** match-path users came to find collaborators; Mission is the next step toward becoming matchable
- **Secondary (less prominent):** *"Unlock the full Top Talent profile"* — sidepath, not the primary forward motion

**Build-path users** (came in via `?path=build` or no param):
- **PRIMARY CTA:** *"Build a Business off your top talent →"*
  - **Routes to:** BUILD space directly (bypasses JOURNEY locks)
  - **Why:** build-path users came to build a venture from their unique talent; BUILD is the destination
- **Secondary (less prominent):** *"Or discover your mission first — 2 min →"* — routes to Mission Discovery, for users who want to walk the matching foundation first

**Critical timing note:** Mission Discovery is **2 minutes** (not 10). The CTA copy must say 2 minutes. Even 1 minute is defensible — the step is genuinely fast.

**Critical architecture note:** the build-path primary CTA bypasses JOURNEY's lock logic. JOURNEY items 2 (Mission), 3 (Assets), 4 (QoL) remain visually locked in the JOURNEY pane for that user until they choose to complete them. The user is in BUILD space; JOURNEY is just visually showing them what *would be* the matching path if they wanted it. They can come back to JOURNEY anytime — locks aren't access gates, they're guidance markers.

**Why this branches substantively (not just secondary emphasis):** the two audiences want different things first. Match-path wants matches. Build-path wants venture. Giving them the SAME primary CTA would be a half-measure that serves neither well. The branch IS the product working for both audiences.

### 4.5 Founder testimonials — stay on BuildLanding only

**The five-founder testimonials (Oyi, Sergey, Sandra, Alexa, Karime, optionally Kirill) STAY on `LandingPage.tsx` (the build-path landing) where they currently are.**

They are true statements about the unique-business work those founders did with Alexander. They are NOT matching-outcome testimonials. Their natural home is the venture-angle landing.

**Do NOT:**
- Move them off the build landing
- Re-narrate them as matching outcomes
- Put them on the new MatchLanding (it has no real social proof yet — accept that absence honestly)

**The new MatchLanding has no testimonials** until real matching outcomes exist. Better to ship a landing with honest absence-of-proof than to misrepresent existing proof.

### 4.6 User state migration

**Goal:** Existing users who completed any item in the old JOURNEY ordering keep their completion state. No one's progress resets.

**Approach:**
- Completion flags are stored per-item, not per-position. Migration is a simple relabeling of which items live where — the user's completion record carries over verbatim.
- Users who previously completed *"Take the exact playbook"* (old JOURNEY #2) see it as completed inside the BUILD space, not in JOURNEY.
- Users who previously completed *"Map your assets"* (old JOURNEY #5) but not *"Discover your mission"* (old JOURNEY #8): their Assets completion still counts. The matching system checks for T + M + A as a set. If they have T + A but not M, they need to do M before matching opens. (This is the only case that requires user-facing communication: a brief notice on first visit post-migration if they're in this state.)

**SQL / data work:**
- **Verification step (do before any change):** read current `game_profiles` and progress-tracking tables. Confirm completion flags are per-item, not per-position. If any per-position assumptions are baked in (e.g., a `current_step: 5` integer), refactor to per-item booleans/timestamps before proceeding with the funnel reshape.
- No schema changes required if the above verification passes clean.
- Cohort sanity check: pick at least one test user from each cohort state (new, T-only, T+M, T+M+A, T+M+A+QoL, fully completed) and verify their post-migration view renders correctly.

### 4.6b Cross-skin auto-propagation

The NS skin (`/ns/*`) shares the same `SectionsPanel.tsx` and component tree as the canonical surface. **Structural changes in this build (JOURNEY reorder, post-Top-Talent CTA, BUILD wiring) will auto-propagate to the NS skin without separate work.**

**The MatchLanding component MUST also be reachable under `/ns/?path=match`** — this is the literal URL Sasha will send Balaji. Two ways to implement:

- **Option A (recommended):** the route logic that reads `?path=` and chooses between MatchLanding and BuildLanding lives at the root level (`/` and `/ns/` and `/[any-skin]/`). One shared routing component picks the landing based on `?path=`, and the skin context applies on top. This means the routing logic auto-propagates to every skin without separate work.
- **Option B (more work):** each skin has its own landing-routing that decides match-vs-build per skin. More flexible (e.g., a skin could only show match landing) but more maintenance.

**Recommendation: Option A.** Implement once at the root level; every skin inherits.

Where the NS skin DOES need separate edits:
- The NS-skinned landing's hero / sub / italic copy — currently hardcoded per skin (will be addressed by §4.7 if included in this build, otherwise manual NS-specific update). **This applies to BOTH BuildLanding-under-NS and MatchLanding-under-NS** — each has its own copy that needs the NS register.
- Any NS-specific CSS overrides for the new BUILD-space surface — verify visual register matches NS editorial style.

**Verification:** walk the new JOURNEY at `/`, then at `/ns`, then on mobile (375px) for both. Confirm parity. **Specifically test `/ns/?path=match` end-to-end** — this is Balaji's exact link.

### 4.7 Config-driven labels and copy (optional but recommended)

**Why this matters:** Future skins (Carolina, vnest, venture-studio instances) should not require manual edits to label strings every time content changes. Make JOURNEY labels + landing hero copy **config-driven per skin** — read from a per-community theme/copy config rather than hardcoded.

**Scope:** ~half a day of refactor work, one-time. Every future skin benefits.

**Out of scope for this build** if time is tight — can be deferred to the Carolina-skin build. But strongly recommended to do it now while touching this surface anyway.

### 4.8 Analytics + share-preview metadata

Two small but important additions when shipping:

**1. Entry-path attribution tracking.** Each landing impression should fire an analytics event including:
- `landing_type`: `'build'` or `'match'`
- `skin`: `'aurora'` / `'network-school'` / etc.
- `path_param_present`: boolean (did the user arrive with `?path=` set, or organic)
- `referrer`: standard

Useful for measuring: which landing is converting better, where Balaji's traffic lands, what organic users do when they hit the default. Use whatever event-tracking infrastructure already exists in the codebase; if none, a single PostHog / Plausible event is enough.

**2. OpenGraph / share-preview metadata per landing.** When Sasha drops `findyourtoptalent.com/ns/?path=match` into the Balaji Discord message, the link preview should render correctly:

- MatchLanding under default skin: title *"Find Your Top Talent — Precision matchmaking for collaboration"*, description *"Stop building alone."*, OG image with the matching-frame visual
- MatchLanding under NS skin: NS-branded OG image, NS-register title
- BuildLanding (default): keep current OG (no change)

If the existing meta-tag system reads from per-page config, this is ~15 min. If it doesn't, fall back to a generic OG image for MatchLanding for V1 — fix in a follow-up. Don't block the build on perfect OG.

---

## 5. Scope of Work

Honest time estimates (most prompt-driven via Lovable + targeted review):

| # | Item | Estimate |
|---|---|---|
| 1 | Create `MatchLanding.tsx` (§4.1) — duplicate shell of `LandingPage.tsx`, swap copy per the table | 1 hour |
| 2 | Root-route routing logic — read `?path=` and render the right landing | 15 min |
| 3 | JOURNEY reorder + renames + lock logic (§4.2) in `SectionsPanel.tsx` | 1–2 hours |
| 4 | BUILD space wiring (§4.3) — route items in, surface Ignite, link from JOURNEY #5 | ~1 hour |
| 5 | Post-Top-Talent CTA (§4.4) — conditional secondary-link emphasis based on `?path=` | 1 hour |
| 6 | Founder testimonials stay on BuildLanding (§4.5) — no relocation needed | 0 (no-op) |
| 7 | User state migration (§4.6) — verify completion-flag carryover; brief notice for edge case | ~1 hour |
| 8 | Auth flow + mobile audits across skins (already-mandatory per [`white_label_strategy.md`](../../02-strategy/white_label_strategy.md)) | 30 min per skin |
| 9 | (Optional but recommended) Labels + landing copy config-driven per skin (§4.7) | ~half a day |
| 10 | Verify NS skin auto-propagates: both landings render correctly under `/ns/?path=match` and `/ns/?path=build` | 30 min |

**Total: ~1 day of focused work** without #9, ~1.5 days with #9.

Items #3 + #4 + #5 are the visible product change inside the platform. Items #1 + #2 + #10 are the public-face change. Item #7 is the data-safety check. Items #8 + #9 are the cross-skin durability layer.

**No `preferred_path` column. No inside-platform mode toggle. No conditional JOURNEY ordering.** ONE platform, TWO landings, query-param routed. Simpler than the previous spec draft.

---

## 5b. Rollback strategy

The funnel reshape is non-destructive (no data is deleted, no schema is broken). Rollback path if the new funnel underperforms in the first 1–2 weeks of soft launch:

- Revert the three component-level changes (`LandingPage.tsx`, `SectionsPanel.tsx`, post-Top-Talent screen) — single git revert per file
- User state migration is non-destructive — completion flags survive the revert
- BUILD space changes can stay (no harm in items being available there); JOURNEY just goes back to old ordering

**Recommended:** ship behind a feature flag (e.g., `FUNNEL_V2_ENABLED`) for the first 48–72 hours so the revert is a flag toggle, not a code revert. Flag can default ON for new users and OFF for existing users with old-ordering progress until manual cutover.

If a feature flag adds more complexity than value at this scale, skip it — the revert is small enough that direct code revert is acceptable.

## 5c. Match-quality testing strategy (pre-launch)

The matching mechanic itself is already shipped (active-intro layer). But this is the first time the new funnel routes real users into it at meaningful volume. Before public launch:

1. **Self-test:** Alexander + 3–5 collaborators (Oyi, Sergey, Sandra, etc.) complete the new T-M-A-Q profile in the new funnel order. Verify the profiles produce sensible matches between the seven of them.
2. **Manual override window:** for the first 30 days of any new community pilot, Alexander personally reviews each match before the heads-up email fires. Catches false positives early; allows tuning before scale.
3. **Match-feedback loop:** after each match fires, capture a simple thumbs-up/down + free-text response from both parties. Use this to tune the matching algorithm in the first 90 days.

This is not part of the code build, but is a hard prerequisite for the pilot to land well.

---

## 6. Out of scope (deliberately)

These are NOT part of this build:

- **No `preferred_path` DB column.** Path is a marketing-entry signal carried in URL during the onboarding flow only. Not persisted as a user attribute. All modules accessible to all users via the same routes regardless of entry path.
- **No inside-platform mode toggle.** ONE product, not two. Users who enter via build-path have full access to matching modules and vice versa. No toggle is needed because there's nothing to toggle between — it's all one platform.
- **No conditional JOURNEY ordering.** Single canonical sequence (T-M-A-Q-Build) for everyone. The match path and build path do NOT see different JOURNEY orderings.
- **No new pages.** The BUILD space already exists. `MatchLanding.tsx` is a new component, but it's just a duplicate shell of `LandingPage.tsx` with different copy — not architecturally a new page in the sense of new routes / new layouts.
- **No backend / matching algorithm changes.** The matching infrastructure is already shipped (active-intro layer, consent tokens, `match-consent` edge function). This build is funnel + UI only.
- **No new branding work for skins.** The NS skin is already 99.9% ready. This build does not introduce new skins.
- **No pricing changes in code.** Pricing is currently bespoke per engagement; implementing payment rails is a separate downstream build.
- **No ecosystem-leader landing pages.** Per Sasha's decision, ecosystem leaders (Balaji-type buyers) get personalized outreach (Discord, email — *"their landing page is my message to them"*), not a public landing. No B2B landing page is built here.

---

## 7. DoD / Verification

Before merging:

- [ ] **Both landings render correctly:** `/?path=match` shows `<MatchLanding />` with new copy verbatim; `/?path=build` and `/` (no param) show `<LandingPage />` with the ONE surgical change (Direct-Ignite CTA removed) applied.
- [ ] **Direct-Ignite CTA removed from BuildLanding.** Single CTA (Free ZoG) only. Verified.
- [ ] Match landing has NO founder testimonials, NO two-paths split, NO Ignite link. Single CTA only.
- [ ] **No `/ignite` link visible** on either landing, on the post-Top-Talent screen, or anywhere in the unauthenticated public flow. Verified by walking both flows end-to-end.
- [ ] Both landings work on desktop + mobile (375px width).
- [ ] Both landings work under all active skins: `/?path=match` and `/ns/?path=match` both render MatchLanding in their respective skin registers; same for `?path=build`.
- [ ] **`?path=` persistence through the assessment flow works:** user lands at `/ns/?path=match` → clicks CTA → `/start?path=match` → completes Top Talent → post-Top-Talent screen reads `path=match` (via context or sessionStorage) → shows match-flavored CTAs correctly. Verified end-to-end.
- [ ] JOURNEY space shows 5 items in the new order with correct lock/unlock visual treatment for: new user, user mid-onboarding, fully-completed user.
- [ ] Item #5 (*Build a business*) navigates correctly into the BUILD space when clicked.
- [ ] BUILD space contains the three moved items (*The Path to Your Unique Business*, *See the Dashboard*, *Take the exact playbook*) + Ignite Session option + `/path` value-ladder page.
- [ ] Post-Top-Talent screen reads `?path=` (via context) and shows correct primary + secondary CTAs per §4.4 logic:
  - Match-path: primary *"Discover your mission — free, 2 minutes →"* routes to Mission Discovery
  - Build-path (and default): primary *"Build a Business off your top talent →"* routes directly to BUILD space
  - Verified end-to-end for both paths.
- [ ] **Time references use "2 minutes" for Mission Discovery** (not 10 minutes). Verified across CTAs, JOURNEY labels if any, and any progress copy.
- [ ] **Build-path user can navigate directly to BUILD space from post-Top-Talent CTA without completing Mission/Assets/QoL.** JOURNEY items 2-5 remain visually locked in JOURNEY pane but BUILD route is fully accessible. Verified.
- [ ] **JOURNEY locks are advisory, not enforced.** A user can navigate directly to `/mission-discovery`, `/asset-mapping`, `/quality-of-life-map`, `/build/*` at any time as authenticated user — regardless of JOURNEY lock state. Verified.
- [ ] Existing users with partial progress under the old ordering retain their completion flags. Verified on at least one test account from the cohort.
- [ ] Auth flow verified per skin (`/auth`, `/ns/auth`) — both read in their skin register.
- [ ] **Entry-path analytics event fires** on landing impression with `landing_type` and `skin` and `path_param_present` (per §4.8).
- [ ] **OG / share-preview metadata renders correctly** when pasting `findyourtoptalent.com/ns/?path=match` into Discord / Slack / Twitter (or at minimum, doesn't render a broken preview).
- [ ] If §4.7 is included: a new skin's labels + landing copy can be changed by editing the per-skin config, no source edits required.
- [ ] **NS-skinned match landing (`/ns/?path=match`) is the link Sasha will send Balaji** — verified it lands correctly, looks editorial, the CTA continues into the matching onboarding flow, the link preview when pasted into Discord renders cleanly.

---

## 8. Open implementation decisions

These are deliberately left for the executing thread to resolve in conversation with Sasha:

1. **Visual treatment of JOURNEY item #5 as bridge into BUILD space:** subtle arrow / badge / divider — what's the design that signals "this is a doorway, not a step"?
2. **Whether to include §4.7 (config-driven labels) in this build, or defer to the next-skin build:** strongly recommended now; depends on time pressure.
3. **Whether the migration edge case (users with Assets but no Mission completed) needs an in-product notice, or whether the matching surface itself can just say "complete Mission to unlock matching."** Recommendation: the surface itself handles it; no separate notice needed.
4. ✅ **Default landing when no `?path=` is present** — RESOLVED: BuildLanding is the default. See §4.1.
5. **Whether `?path=` should be stripped from URL after the post-Top-Talent screen** to keep URLs clean post-onboarding, or persist until the user logs out. Recommendation: strip after post-Top-Talent (its job is done by then). Confirm.
6. **Sasha's amendments to the Scope of Work** — to be added as he reviews this spec.

---

## Cross-references

- Strategic context: [`docs/02-strategy/monetization_strategies.md` → Strategic Crystallization](../../02-strategy/monetization_strategies.md#strategic-crystallization-day-7677-may-1920-2026)
- Funnel architecture: [`docs/02-strategy/unique-businesses/alexanders_unique_business.md` → Funnel Architecture v2](../../02-strategy/unique-businesses/alexanders_unique_business.md#funnel-architecture-v2--matching-as-hero-day-77-may-20-2026)
- White-label commercial role: [`docs/02-strategy/white_label_strategy.md` → Strategic Role in the Commercial Model](../../02-strategy/white_label_strategy.md#strategic-role-in-the-commercial-model-day-77-may-20-2026)
- First pilot target (Balaji NS): [`docs/03-playbooks/leonardo_strategy_instances/balaji_srinivasan.md`](../../03-playbooks/leonardo_strategy_instances/balaji_srinivasan.md)
- Active-intro layer (already shipped — the matching mechanic this funnel feeds into): [`docs/specs/match-mechanic/active-intro_product_spec.md`](../match-mechanic/active-intro_product_spec.md)

---

*v0.4 · May 20, 2026 (Day 77 night) · Sasha-correction pass. Critical fixes: (1) Post-Top-Talent CTAs branch SUBSTANTIVELY, not just by secondary emphasis. Match-path primary = "Discover your mission — 2 minutes" → Mission Discovery. Build-path primary = "Build a Business off your top talent" → BUILD space directly. (2) Mission time corrected from 10 min → 2 min across all references; sub-paragraph compressed to remove ambiguous "ten minutes" reference. (3) JOURNEY locks made explicitly advisory, not access-gating — build-path users can navigate directly to BUILD without completing T-M-A; routes are not gated by JOURNEY completion. (4) Default landing decision resolved: BuildLanding (preserves organic traffic, matching audience always uses ?path=match link). (5) DoD expanded with 4 new items covering the flow differences. Still LOW RISK, still ~1 day total. Ready for handoff.*

*v0.3 · May 20, 2026 (Day 77 late evening) · Final scrutiny pass. Fixes from re-read: (1) Opening blockquote rewritten to reflect the two-landings architecture, not "text only / same shell." (2) Ignite contradiction resolved — BuildLanding loses its Direct-Ignite CTA (ONE surgical change), so the §1 principle that Ignite lives only inside BUILD is consistent across both landings. (3) Stale founder-testimonials row removed from §4.3 BUILD-space table (testimonials stay on BuildLanding per §4.5; the table previously contradicted this). (4) `?path=` persistence approach made explicit — React context + sessionStorage, ~20 lines. (5) NS-skin routing clarified: root-level routing component picks landing per `?path=`, auto-propagates to every skin. (6) New §4.8 added: entry-path analytics tracking + OG/share-preview metadata for the Balaji-message-link. (7) DoD expanded with seven new verification items covering the additions above. Still LOW RISK, still ~1 day total. Ready for handoff.*

*v0.2 · May 20, 2026 (Day 77 evening) · Simplified architecture: ONE platform, TWO landings (BuildLanding + MatchLanding), query-param routed via `?path=`. No `preferred_path` DB column. No inside-platform mode toggle. No conditional JOURNEY ordering — single canonical T-M-A-Q-Build sequence for everyone. Founder testimonials stay on BuildLanding (where they belong). Post-Top-Talent CTA branches only on secondary-link emphasis. Scope of Work updated to 10 items, ~1 day. LOW RISK: all standard React patterns, no new schema, no new auth flows, no experimental APIs.*

*v0.1 · May 20, 2026 (Day 77) · Product spec for the matching-as-hero funnel reshape. Ready for execution. Sasha to amend Scope of Work per his review; executing thread to resolve §8 open decisions in dialogue.*
