# Funnel v2 — Matching-as-Hero (Product Spec)

> *Add a second landing page (MatchLanding) for the matching-collaboration audience. The existing BuildLanding and its entire funnel STAY COMPLETELY UNCHANGED in production. ONE platform with ONE canonical JOURNEY sequence (T-M-A-Q-Build) underneath; TWO landing pages on top, query-param routed via `?path=`. Match-path users see new CTAs at each completion step (Top Talent / Mission / Assets / QoL); build-path users see their existing CTAs untouched.*

**Status:** Draft, ready for execution.
**Date opened:** May 20, 2026 (Day 77).
**Spec author:** Alexander Konstantinov with AI assistance.
**Executor:** TBD (Lovable session + targeted human review).
**Estimated total effort:** ~1 day of focused work (most of it prompt-driven).

---

## 1. What we're doing

We are reshaping the JOURNEY space and **adding a second landing page** so the platform serves two audiences cleanly: venture-building founders AND matching-seeking collaborators. ONE platform underneath, TWO landing pages on top, differentiated by a `?path=` query parameter. Per-skin mirroring stays trivial — each skin has its two landings configured the same way.

The matching-onboarding sequence (Talent → Mission → Assets → QoL → bridge-to-Build) becomes the single canonical JOURNEY space ordering for everyone. The unique-business / venture-building content (which used to live inside JOURNEY) moves into the BUILD space, where it becomes the deeper layer accessible to all users.

**Critical:** there is ONE platform with ONE journey sequence. The two landings are *two marketing entrances*, not two products. After a user passes through either landing into the assessment, they are in the same platform with the same modules accessible via the same routes. The match path adds new conditional CTAs at four completion steps (Top Talent reveal, Mission, Assets, QoL) — surfaced only when `?path=match` is carried in context. The build path's existing flow is preserved without any changes.

**Ignite Session:** the existing Direct-Ignite CTA on BuildLanding stays untouched (build path's production flow is preserved as-is). The MatchLanding has no Ignite link. Inside the platform, Ignite is surfaced inside the BUILD space as the premium step for venture-building work.

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

**Build path entry:** An aspiring founder arrives via Alexander's existing venture-angle outreach at `findyourtoptalent.com/?path=build` (or just `/`, defaulting to build). The existing venture-landing component renders **completely unchanged from current production.** All existing copy, all existing CTAs (including the two-paths split with Direct-Ignite), all existing testimonials, all existing structure — preserved verbatim. The user then proceeds through the existing funnel as it stands today. **No changes to the build-path landing or its downstream funnel are part of this build.**

**Both paths converge into the same Top Talent assessment.** ~10–15 min. Same component, same flow, same outcome.

**After the reveal, the two paths diverge — but ONLY the match path gets new behavior. Build path is completely untouched.**

- **Match-path users (`?path=match`):** see a NEW post-reveal CTA progression at each completion step (Top Talent → Mission → Assets → QoL). Details in §4.4.
- **Build-path users (`?path=build` or no param):** see the **existing post-Top-Talent reveal screen with existing CTAs, unchanged.** They continue through the existing funnel exactly as it works in production today. No new behavior is added; no existing behavior is removed.

The match-path CTAs at each step (Mission "in 1 minute" → Map your assets → See your matches + Assess your quality of life as secondary → See your refined matches) are conditionally rendered: shown only when the user carries `?path=match` in context. Build-path users never encounter them.

After Mission/Assets/QoL completion, match-path users arrive at a matching surface (the matching mechanic is already shipped — active-intro layer, consent tokens, etc.). JOURNEY pane shows their progress accordingly.

The BUILD space holds *The Path to Your Unique Business*, *See the Dashboard*, *Take the exact playbook*, and the Ignite Session — accessible to any authenticated user via direct navigation. Build-path users get there via their existing funnel (unchanged); match-path users can navigate via JOURNEY item 5 (the bridge) or directly via sidebar.

**Why this works as ONE product:** both users have access to every module via direct navigation. JOURNEY locks are *advisory* (visual guidance), not access-gating. The path just colors which CTAs the user sees on completion screens. The build-path flow is preserved as-is in production; the match-path flow is purely additive.

---

## 4. Specifications

### 4.1 Landing pages — two of them, query-param routed

**Two landing components, one router decision:**

**(a) The BUILD-path landing — `src/pages/MethodologyLandingPage.tsx` (inside `GameShellV2` via `JourneyPage.tsx`) — UNCHANGED**

> **Implementation-reality correction (Day 77, end-of-day):** earlier drafts of this spec named `src/pages/LandingPage.tsx` as the production BuildLanding. That file is **dead code** — imported but never rendered. The actual production landing at `/` is `MethodologyLandingPage` wrapped in `GameShellV2` via `JourneyPage` (`/` and `/game/journey` both render it). Day 75-iterated. The "do not touch" rule applies to **`MethodologyLandingPage.tsx` + `JourneyPage.tsx` + `GameShellV2.tsx` + `PlaybookHero.tsx`** — the chain that paints the current `/`. `LandingPage.tsx` itself can be safely deleted in a future cleanup pass.

**The current venture-building landing stays exactly as it is in production. No changes to its pane-3 content.**

- All copy stays (`MethodologyLandingPage.tsx` — Cormorant headline + manifesto + `PlaybookHero` CTAs)
- All CTAs stay (Find Your Top Talent → `/zone-of-genius`; See the exact playbook → `/playbook`)
- Hero, italic echo, ornament, manifesto rows — all stay
- The entire downstream funnel from this landing stays unchanged

This landing is what existing venture-angle audiences see, what bookmarked/organic/search traffic sees, what social-media followers see. It works in production. We are not modifying it.

**(b) The MATCH-path hero — `src/components/landing/MatchHero.tsx` (new, swapped inside the same `GameShellV2`)**

Created new as a hero component, NOT a separate page. `JourneyPage` reads `EntryPathContext.path` and renders either `<MethodologyLandingPage />` (default / `?path=build` / organic) or `<MatchHero />` (when `?path=match`). Shell stays identical — JOURNEY rail, spaces rail, NS-skin auto-propagation all behave the same; only the pane-3 hero swaps. Same shell tokens, layout family, fonts, gradient backgrounds as `MethodologyLandingPage`. Different copy:

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
- **Only `?path=match` is carried forward** — via the MatchLanding's new CTA which routes to `/start?path=match`. **`?path=build` is NOT carried forward** because doing so would require modifying BuildLanding's existing CTAs (which is forbidden — see §4.1a). Build-path users click existing CTAs that route to existing places without the param. This is fine because their flow doesn't depend on path state.
- The EntryPathProvider effectively tracks a boolean: *"did the user enter via `?path=match`?"* — yes for match-path users, no/missing for everyone else (including `?path=build` users since the param was lost at the first click).
- **Persists through the multi-step Top Talent assessment** for match-path users — see persistence approach below
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

**Critical: JOURNEY locks are advisory, not access-gating.** The lock state controls how items render in the JOURNEY pane (crossed out vs. unlocked) — guidance. The actual routes (Mission Discovery, Asset Mapping, QoL, BUILD space, `/path`, `/dashboard`, `/playbook`, `/ignite`, etc.) are NOT access-gated by JOURNEY. Any authenticated user can navigate directly to any of them anytime. This is critical because:

- Build-path users may currently reach `/path`, `/dashboard`, `/playbook` via JOURNEY in production (those items are being MOVED out of JOURNEY into BUILD space in this build). The routes themselves must continue to resolve and render unchanged.
- Build-path users' existing CTAs and existing flow continue to work — they may not need to interact with JOURNEY at all.
- Match-path users walk T-M-A via JOURNEY items 1–3, then have BUILD space accessible via JOURNEY #5 (visually unlocked after #3) OR directly via sidebar.

**Removed from JOURNEY (moved to BUILD space — see §4.3):**
- *Take the exact playbook* (was JOURNEY #2)
- *See the shortcut path to your business* (was JOURNEY #3) — **renamed** to *"The Path to Your Unique Business"*
- *See how we're building this* (was JOURNEY #4) — **renamed** to *"See the Dashboard"*

**UX shift for build-path users — acknowledge.** Build-path users in production today may have been interacting with the OLD JOURNEY pane (which surfaced Path / Playbook / Dashboard at positions 2-4). After this build, they see the NEW JOURNEY pane (which surfaces Mission / Assets / QoL at positions 2-4). The items they used to click are now in BUILD space, not JOURNEY. This is a real UX change for build-path users even though their existing funnel is otherwise untouched. They can still reach those items via:
- Existing CTAs on the build-path post-Top-Talent screen (whatever those route to — those routes still resolve)
- The new sidebar BUILD entry (per §4.3)
- Direct URL navigation

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
| *Ignite Session* (premium step) | Surfaced inside BUILD space as one access path. Note: the existing Direct-Ignite CTA on BuildLanding remains untouched as a separate access path for build-path users. |
| `/path` value-ladder page (the existing soft-gated `/path` route, distinct from the renamed *"The Path to Your Unique Business"* item above) | Moved from JOURNEY (where it was the last item) into BUILD space |

**Note on founder testimonials:** they STAY on BuildLanding (see §4.5). They are NOT moved into BUILD space.

**Note on existing routes:** `/path`, `/dashboard`, `/playbook`, `/ignite` all stay valid as URLs and continue to render their existing content unchanged. This build only changes WHICH NAVIGATION SURFACE points to them (JOURNEY pane → BUILD space for the items being moved). Direct links and any existing CTAs pointing at these routes continue to function.

**Navigation in:**
- From JOURNEY item #5 (*Build a business off your top talent*), clicking enters the BUILD space — but only once it's unlocked (after T-M-A completion).
- **Sidebar entry to BUILD space — verify or create.** The current sidebar (JOURNEY / AI OS / ME / COLLABORATE) does not have an explicit BUILD entry. **Action for executing thread:** check whether BUILD space is reachable from the sidebar today. If not, add a sidebar entry for BUILD (matching the existing sidebar visual register) so users can access BUILD's contents without needing to complete T-M-A first. This is especially important for build-path users who may never complete T-M-A but should still be able to reach BUILD's venture content.
- `/ignite` URL stays valid. NOT linked from MatchLanding. Existing Direct-Ignite CTA on BuildLanding stays (build path untouched). Also accessible from inside BUILD space.

**Visual treatment of BUILD entry from JOURNEY:**
- JOURNEY item #5 should feel like a doorway, not another sequential step. Subtle visual differentiation (badge, arrow, divider) so users understand they're transitioning surfaces.

### 4.4 Match-path CTAs at each completion step (build-path is untouched)

**Build-path users:** see existing CTAs at every completion page in production. **No changes.** This section does not apply to them.

**Match-path users** (carrying `?path=match` in React context per §4.1 persistence) see a sequence of new CTAs at each completion step, conditionally rendered:

#### 4.4.1 — After Top Talent reveal

- **PRIMARY:** *"Discover your mission in 1 minute →"* → routes to Mission Discovery
- Secondary (less prominent, optional): *"Unlock the full Top Talent profile"*

Mission Discovery is genuinely fast — **1 minute.** Copy must reflect this; under-promising risks reducing click-through.

#### 4.4.2 — After Mission Discovery completion

- **PRIMARY:** *"Map your assets →"* → routes to Asset Mapping
- No secondary CTA required.

#### 4.4.3 — After Asset Mapping completion (the unlock moment)

This is the critical moment. The user becomes matchable. Make this **visually clear**:

- **Unlock message (above or beside the CTA):** something like *"You've unlocked collaboration matches. Your people are now visible to you."* (Final copy to be calibrated by Sasha during placement review.)
- **PRIMARY:** *"See your matches →"* → routes to the matching surface (existing matchmaking route)
- **SECONDARY:** *"Assess your quality of life →"* → routes to Quality of Life Map (deepens match precision)

The secondary CTA gives users who want to go further before seeing matches a clear option; the primary CTA respects users who came to find collaborators and want them now.

#### 4.4.4 — After Quality of Life completion (optional step)

- **PRIMARY:** *"See your refined matches →"* → routes to the matching surface
- The matching algorithm uses QoL to refine results, so the framing acknowledges the deepening rather than just repeating the previous CTA.

#### Conditional rendering — implementation

Each completion page reads the `?path=` value from React context (per §4.1 persistence). When it equals `'match'`, render the match-flow CTAs above. Otherwise, render the existing CTAs unchanged (or no new CTAs if none currently exist on that page).

**Build-path users never see these CTAs.** They proceed through their existing funnel.

### 4.4b Process for identifying CTA placement on each completion page

The CTAs in §4.4 must be placed thoughtfully on each existing completion page. The match flow's success depends on these CTAs being discoverable, clear, and visually well-integrated with the existing design.

**Process for the executing thread:**

1. **Open each completion page in the live app** to understand its current structure:
   - Top Talent reveal: `/zone-of-genius?result=<token>` (the reveal page after assessment)
   - Mission Discovery completion: `/mission-discovery` (post-completion state)
   - Asset Mapping completion: `/asset-mapping` (post-completion state)
   - Quality of Life completion: `/quality-of-life-map/assessment` (post-completion state)

2. **Identify the natural attention flow on each page.** Where does the user's eye land after consuming the completion result? Typically: below the main result content, above any tertiary info or links.

3. **For pages that already have a CTA region** (e.g., Top Talent reveal has the existing fork): place the match-flow CTAs in the SAME visual zone. Substitute when `?path=match` is in context; show original CTAs otherwise.

4. **For pages that don't currently have a forward CTA** (e.g., Mission/Assets/QoL completion screens may not have one): introduce a new CTA region using the platform's primary button styling. Place it below the main result content, with generous vertical padding (32–48px above and below) for visual breathing room.

5. **Visual hierarchy for primary vs secondary:**
   - Primary: filled button, brand-prominent color, larger size
   - Secondary: outlined or text-link styling, smaller or same size, less prominent
   - Spacing: secondary below or beside primary, never above

6. **Mobile (375px) check:** verify CTAs render cleanly at narrow viewports — stack vertically if needed, primary above secondary.

7. **Iterate with Sasha for visual approval** before merge. Don't ship without his explicit sign-off on placement, since the visual integration with existing pages affects the felt sense of the product.

This process is part of the build, not a one-time decision. Each page requires its own placement judgment.

### 4.5 BuildLanding social proof — DO NOT TOUCH

BuildLanding stays exactly as it is in production. This includes any social proof / testimonials / founder mentions that currently live on it. Nothing about BuildLanding is in scope for this build.

**The new MatchLanding has no testimonials** yet — accept that absence honestly. When real matching outcomes exist, MatchLanding can grow its own social proof.

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
| 1 | Create `MatchHero.tsx` (§4.1) — hero component matching `MethodologyLandingPage`'s shell tokens (Cormorant Garamond + GOLD_TEXT_STYLE + Ornament + EditorialCta), swap copy per the table. Swapped in via `JourneyPage` reading `EntryPathContext.path`. NOT a separate page — shell stays identical. | 1 hour |
| 2 | Root-route routing logic — read `?path=` and render the right landing | 15 min |
| 3 | JOURNEY reorder + renames + lock logic (§4.2) in `SectionsPanel.tsx` | 1–2 hours |
| 4 | BUILD space wiring (§4.3) — route items in, surface Ignite, link from JOURNEY #5 | ~1 hour |
| 5 | Match-path CTAs at each completion step (§4.4) — conditionally rendered when `?path=match` is in context. Includes Top Talent reveal, Mission completion, Asset Mapping completion, QoL completion. | 2–3 hours |
| 6 | CTA placement review (§4.4b) — walk each completion page with Sasha, place CTAs, get visual sign-off | 1–2 hours |
| 7 | **No changes to BuildLanding (§4.1a / §4.5)** — explicit no-op | 0 |
| 8 | User state migration (§4.6) — verify completion-flag carryover; brief notice for edge case | ~1 hour |
| 9 | Auth flow + mobile audits across skins (already-mandatory per [`white_label_strategy.md`](../../02-strategy/white_label_strategy.md)) | 30 min per skin |
| 10 | (Optional but recommended) Labels + landing copy config-driven per skin (§4.7) | ~half a day |
| 11 | Verify NS skin auto-propagates: both landings render correctly under `/ns/?path=match` and `/ns/?path=build` | 30 min |
| 12 | Analytics + OG metadata (§4.8) | ~30 min |
| 13 | Verify/add BUILD sidebar entry (per §4.3 navigation note) so users can reach BUILD without completing T-M-A | 30 min |

**Total: ~1 day of focused work** without #10, ~1.5 days with #10.

Items #3 + #4 + #5 are the visible product change inside the platform. Items #1 + #2 are the public-face change. Item #8 is the data-safety check. Items #9 + #11 are the cross-skin durability layer. Item #10 is the optional cross-skin config refactor.

**No `preferred_path` column. No inside-platform mode toggle. No conditional JOURNEY ordering. No changes to BuildLanding or to the build-path post-Top-Talent screen.** ONE platform, TWO landings, query-param routed.

---

## 5b. Rollback strategy

The funnel reshape is non-destructive (no data is deleted, no schema is broken, `MethodologyLandingPage.tsx` is not modified). Rollback path if the new funnel underperforms in the first 1–2 weeks of soft launch:

- Revert the component-level changes: `SectionsPanel.tsx` (JOURNEY reorder + BUILD additions), `JourneyPage.tsx` (the `?path=` hero swap), `App.tsx` (the `EntryPathProvider` wrap), `GameShellV2.tsx` (BUILD chip unlock), delete the new `EntryPathContext.tsx` / `MatchHero.tsx` / `MatchFlowCta.tsx`, and revert the four one-line `<MatchFlowCta />` insertions on completion surfaces — single git revert per file.
- **`MethodologyLandingPage.tsx` was not modified, so nothing to revert there. The build-path pane-3 hero is untouched.**
- User state migration is non-destructive — completion flags survive the revert.
- BUILD space changes can stay (no harm in items being available there); JOURNEY just goes back to old ordering.

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
- **No new pages.** The BUILD space already exists. `MatchHero.tsx` is a new component, but it's a hero swap inside the same `GameShellV2` as the build-path landing — not a separate page, not a new route, not a new layout. `JourneyPage` picks which hero renders based on `EntryPathContext.path`.
- **No backend / matching algorithm changes.** The matching infrastructure is already shipped (active-intro layer, consent tokens, `match-consent` edge function). This build is funnel + UI only.
- **No new branding work for skins.** The NS skin is already 99.9% ready. This build does not introduce new skins.
- **No pricing changes in code.** Pricing is currently bespoke per engagement; implementing payment rails is a separate downstream build.
- **No ecosystem-leader landing pages.** Per Sasha's decision, ecosystem leaders (Balaji-type buyers) get personalized outreach (Discord, email — *"their landing page is my message to them"*), not a public landing. No B2B landing page is built here.

---

## 7. DoD / Verification

Before merging:

- [ ] **Both landings render correctly:** `/?path=match` shows `<MatchLanding />` with new copy verbatim; `/?path=build` and `/` (no param) show `<LandingPage />` exactly as it is in production today, with NO changes whatsoever to its copy, CTAs, testimonials, or structure.
- [ ] **`MethodologyLandingPage.tsx` (the actual production BuildLanding pane-3 content) untouched.** Confirmed by git diff that no changes were made to `src/pages/MethodologyLandingPage.tsx`. `JourneyPage.tsx` gained a 3-line conditional to swap the hero based on entry-path context, but `MethodologyLandingPage`'s render output is byte-for-byte identical for any non-match-path entry. (The legacy `src/pages/LandingPage.tsx` is dead code never rendered; it remains untouched too but is irrelevant to the live funnel.)
- [ ] **Build-path users see the existing post-Top-Talent reveal screen with existing CTAs untouched.** No new CTAs, no changes to existing CTAs, no changes to existing copy. Verified end-to-end by walking the build flow.
- [ ] Match landing has NO testimonials, NO two-paths split, NO Ignite link. Single CTA only.
- [ ] Both landings work on desktop + mobile (375px width).
- [ ] Both landings work under all active skins: `/?path=match` and `/ns/?path=match` both render MatchLanding in their respective skin registers; same for `?path=build`.
- [ ] **`?path=` persistence through the assessment flow works:** user lands at `/ns/?path=match` → clicks CTA → `/start?path=match` → completes Top Talent → post-Top-Talent screen reads `path=match` (via context or sessionStorage) → shows match-flavored CTAs correctly. Verified end-to-end.
- [ ] JOURNEY space shows 5 items in the new order with correct lock/unlock visual treatment for: new user, user mid-onboarding, fully-completed user.
- [ ] Item #5 (*Build a business*) navigates correctly into the BUILD space when clicked.
- [ ] BUILD space contains the three moved items (*The Path to Your Unique Business*, *See the Dashboard*, *Take the exact playbook*) + Ignite Session option + `/path` value-ladder page.
- [ ] **Match-path CTAs render correctly at each completion step (§4.4):**
  - After Top Talent reveal: primary *"Discover your mission in 1 minute →"* routes to Mission Discovery
  - After Mission completion: primary *"Map your assets →"* routes to Asset Mapping
  - After Assets completion: primary *"See your matches →"* + visible unlock message + secondary *"Assess your quality of life →"*
  - After QoL completion: primary *"See your refined matches →"*
  - Verified end-to-end for the match flow.
- [ ] **Build-path users see NONE of the match-path CTAs.** They proceed through their existing funnel with existing CTAs. Verified end-to-end.
- [ ] **Time references say "1 minute" for Mission Discovery** (not 2, not 10). Verified.
- [ ] **CTA placement on each completion page approved by Sasha** (per §4.4b process). No CTAs shipped without visual sign-off.
- [ ] **JOURNEY locks are advisory, not enforced.** A user can navigate directly to `/mission-discovery`, `/asset-mapping`, `/quality-of-life-map`, `/build/*` at any time as authenticated user — regardless of JOURNEY lock state. Verified.
- [ ] Existing users with partial progress under the old ordering retain their completion flags. Verified on at least one test account from the cohort.
- [ ] **Existing routes `/path`, `/dashboard`, `/playbook`, `/ignite` all resolve and render unchanged content.** These routes are not modified — only their navigation surface changes (moved from JOURNEY into BUILD space). Direct links from outside or from existing build-path CTAs continue to work. Verified.
- [ ] **Build-path users' existing in-product flow still works end-to-end.** No regressions introduced by the JOURNEY pane reorder or the BUILD space relocation. Verified by walking the build flow from landing → Top Talent → existing post-reveal CTAs → wherever they currently lead.
- [ ] **BUILD space is reachable from the sidebar** (not just via JOURNEY #5 unlock). Verified that any authenticated user can navigate to BUILD via sidebar regardless of T-M-A completion.
- [ ] **JOURNEY #5 (*Build a business*) lock behavior matches the chosen approach** (open decision #6) — verified for both build-path and match-path users.
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
6. **JOURNEY #5 (*Build a business*) lock logic for build-path users.** Currently locked until T-M-A completed. This means build-path users see *"Build a business off your top talent"* — the thing they came for — as a locked item in JOURNEY indefinitely (since they don't go through T-M-A). Two options:
   - **(a)** Accept this as a quirk — build-path users have their existing funnel and the BUILD sidebar entry, they don't need JOURNEY #5 to access BUILD.
   - **(b)** Unlock JOURNEY #5 from the start for everyone (no T-M-A gate). The match-path user still walks T-M-A naturally via the post-Top-Talent CTAs; the build-path user just has earlier visual access.
   - Recommendation: **(b)** — less confusing, costs nothing.
7. **Verify BUILD space sidebar entry exists** (per §4.3) — if not, add one. Without it, build-path users can't reach BUILD content via the in-app navigation without completing T-M-A.
8. **Sasha's amendments to the Scope of Work** — to be added as he reviews this spec.

---

## Cross-references

- Strategic context: [`docs/02-strategy/monetization_strategies.md` → Strategic Crystallization](../../02-strategy/monetization_strategies.md#strategic-crystallization-day-7677-may-1920-2026)
- Funnel architecture: [`docs/02-strategy/unique-businesses/alexanders_unique_business.md` → Funnel Architecture v2](../../02-strategy/unique-businesses/alexanders_unique_business.md#funnel-architecture-v2--matching-as-hero-day-77-may-20-2026)
- White-label commercial role: [`docs/02-strategy/white_label_strategy.md` → Strategic Role in the Commercial Model](../../02-strategy/white_label_strategy.md#strategic-role-in-the-commercial-model-day-77-may-20-2026)
- First pilot target (Balaji NS): [`docs/03-playbooks/leonardo_strategy_instances/balaji_srinivasan.md`](../../03-playbooks/leonardo_strategy_instances/balaji_srinivasan.md)
- Active-intro layer (already shipped — the matching mechanic this funnel feeds into): [`docs/specs/match-mechanic/active-intro_product_spec.md`](../match-mechanic/active-intro_product_spec.md)

---

*v0.8 · May 20, 2026 (Day 77 end-of-day, IMPLEMENTATION SHIPPED) · Implementation-reality corrections rolled into the spec after the build landed. Specifically: (1) The "BuildLanding = `src/pages/LandingPage.tsx`" premise of every prior version was WRONG — that file is dead code, imported but never rendered. The actual production landing at `/` is `MethodologyLandingPage` wrapped in `GameShellV2` via `JourneyPage`. The "don't touch" rule was preserved by applying it to the actual live chain (`MethodologyLandingPage` + `JourneyPage` + `GameShellV2` + `PlaybookHero`) instead. (2) MatchLanding shipped as `MatchHero.tsx` — a hero-swap component inside the SAME `GameShellV2`, not a separate page. `JourneyPage` picks between `<MethodologyLandingPage />` and `<MatchHero />` based on `EntryPathContext.path`. Cleaner: shell stays identical (NS skin, mobile, JOURNEY rail) without per-route duplication. (3) `EntryPathContext.tsx` (new context provider, ~80 lines) captures `?path=match`, strips URL, persists via sessionStorage. Wraps app at the root inside `BrowserRouter`. (4) Four `<MatchFlowCta />` insertions on completion surfaces (one-line each, gated by `path === "match"`) — build-path users see nothing new. (5) BUILD chip in `SpacesRail` was previously gated by `deepProfileActivated`; unlocked unconditionally because Path/Playbook/Dashboard moved into BUILD and must be reachable via sidebar for all auth users (DoD requirement). `/ubb` route's own MeGate still gates the actual AVB. (6) MatchHero CTA routes to `/zone-of-genius?path=match` (the public assessment entry), NOT `/start?path=match` — `/start` is auth-gated and would have walled cold Balaji traffic. (7) `funnelAnalytics.ts` gained a new `match_landing_view` FunnelStep; fires on MatchHero mount with `landing_type` / `skin` / `path_param_present` metadata. Build-path analytics tracking remains absent (would have touched the protected build chain). Status: DOD §7 verified in browser preview (default + NS skins, desktop + mobile 375px, end-to-end `?path=match` persistence, all moved routes resolving 200, zero console errors). Auth-gated surfaces (Mission/Assets/QoL completion CTAs) code-verified but not yet walked end-to-end — requires an authed dogfood session.*

*v0.7 · May 20, 2026 (Day 77 deep night, second debugging pass) · Four more issues caught: (1) `?path=build` is NOT carried forward — doing so would require modifying BuildLanding's CTAs, which is forbidden. Only `?path=match` is carried forward via MatchLanding's new CTA. The EntryPathProvider tracks a boolean ("did user enter via `?path=match`?"), not a two-valued state. (2) BUILD space sidebar entry — verified-or-created. Without it, build-path users and pre-T-M-A match-path users have no in-app navigation to BUILD other than completing T-M-A. New item #13 in Scope of Work. New DoD verification. (3) UX-shift acknowledgment added to §4.2: build-path users now see Mission/Assets/QoL in JOURNEY 2-4 instead of the items they used to see there (which are now in BUILD space). Real change, even though build funnel is untouched. (4) JOURNEY #5 lock for build-path users — they'd see "Build a business" (what they came for) as locked indefinitely. Added as open decision #6 with recommendation to unlock from start. Spec now self-consistent. Still LOW RISK, still ~1-1.5 days.*

*v0.6 · May 20, 2026 (Day 77 deep night, debugging pass) · Stale references from the v0.4 build-path-changes draft cleaned. Specifically: (1) §1 line about "only CTA after Top Talent varies" updated to reflect that 4 completion steps vary, not 1. (2) §1 Ignite statement clarified: existing Direct-Ignite on BuildLanding stays untouched (build path preserved); only MatchLanding has no Ignite link. (3) §4.2 stale claim about "build-path users going straight from Top Talent reveal → BUILD space via their primary CTA" removed; build path has UNCHANGED CTAs, no such routing. (4) §4.3 Ignite gating note clarified: BUILD-space access is one path; existing BuildLanding Direct-Ignite is another path. (5) §4.3 disambiguation between "The Path to Your Unique Business" (renamed JOURNEY item) and `/path` (the soft-gated value-ladder route) — both live in BUILD space but they're different. (6) §5b rollback list corrected — LandingPage.tsx is NOT in the revert list (not modified). (7) §5 item-numbering references cleaned. (8) DoD: added verification that existing routes (/path, /dashboard, /playbook, /ignite) still resolve and render unchanged, and that the build-path end-to-end flow has no regressions. Still LOW RISK, still ~1 day. Spec is now self-consistent.*

*v0.5 · May 20, 2026 (Day 77 night, second Sasha-correction pass) · CRITICAL: build-path is COMPLETELY UNTOUCHED. Previous draft incorrectly proposed modifications to BuildLanding (removing Direct-Ignite CTA) and to the post-Top-Talent reveal screen (new "Build a Business" CTA for build-path). Both were wrong and would have damaged a working production funnel. Reverted: BuildLanding stays as-is in every respect (copy, CTAs, testimonials, structure). Build-path users continue through their existing funnel unchanged. The match path is purely additive: new MatchLanding, plus new CTAs that render conditionally at each completion step (Top Talent reveal, Mission completion, Asset Mapping completion, QoL completion). Match-flow CTA progression: "Discover your mission in 1 minute" → "Map your assets" → "See your matches" (with unlock message) + "Assess your quality of life" (secondary) → "See your refined matches". Mission time corrected to 1 minute (was 2, originally was 10). New §4.4b added: process for identifying CTA placement on each completion page — must be walked with Sasha for visual sign-off before merge. Scope of Work updated to 12 items, still ~1 day. DoD updated to verify build path is untouched. Ready for handoff.*

*v0.4 · May 20, 2026 (Day 77 night) · Sasha-correction pass. Critical fixes: (1) Post-Top-Talent CTAs branch SUBSTANTIVELY, not just by secondary emphasis. Match-path primary = "Discover your mission — 2 minutes" → Mission Discovery. Build-path primary = "Build a Business off your top talent" → BUILD space directly. (2) Mission time corrected from 10 min → 2 min across all references; sub-paragraph compressed to remove ambiguous "ten minutes" reference. (3) JOURNEY locks made explicitly advisory, not access-gating — build-path users can navigate directly to BUILD without completing T-M-A; routes are not gated by JOURNEY completion. (4) Default landing decision resolved: BuildLanding (preserves organic traffic, matching audience always uses ?path=match link). (5) DoD expanded with 4 new items covering the flow differences. Still LOW RISK, still ~1 day total. Ready for handoff.*

*v0.3 · May 20, 2026 (Day 77 late evening) · Final scrutiny pass. Fixes from re-read: (1) Opening blockquote rewritten to reflect the two-landings architecture, not "text only / same shell." (2) Ignite contradiction resolved — BuildLanding loses its Direct-Ignite CTA (ONE surgical change), so the §1 principle that Ignite lives only inside BUILD is consistent across both landings. (3) Stale founder-testimonials row removed from §4.3 BUILD-space table (testimonials stay on BuildLanding per §4.5; the table previously contradicted this). (4) `?path=` persistence approach made explicit — React context + sessionStorage, ~20 lines. (5) NS-skin routing clarified: root-level routing component picks landing per `?path=`, auto-propagates to every skin. (6) New §4.8 added: entry-path analytics tracking + OG/share-preview metadata for the Balaji-message-link. (7) DoD expanded with seven new verification items covering the additions above. Still LOW RISK, still ~1 day total. Ready for handoff.*

*v0.2 · May 20, 2026 (Day 77 evening) · Simplified architecture: ONE platform, TWO landings (BuildLanding + MatchLanding), query-param routed via `?path=`. No `preferred_path` DB column. No inside-platform mode toggle. No conditional JOURNEY ordering — single canonical T-M-A-Q-Build sequence for everyone. Founder testimonials stay on BuildLanding (where they belong). Post-Top-Talent CTA branches only on secondary-link emphasis. Scope of Work updated to 10 items, ~1 day. LOW RISK: all standard React patterns, no new schema, no new auth flows, no experimental APIs.*

*v0.1 · May 20, 2026 (Day 77) · Product spec for the matching-as-hero funnel reshape. Ready for execution. Sasha to amend Scope of Work per his review; executing thread to resolve §8 open decisions in dialogue.*
