# Funnel v2 — Matching-as-Hero (Product Spec)

> *Reshape the public funnel to lead with precision matching for collaboration. The JOURNEY space becomes the matching onboarding; the BUILD space holds the venture-path content for those who graduate from matching into venture-building. Landing page rewrites text only — same shell, new copy.*

**Status:** Draft, ready for execution.
**Date opened:** May 20, 2026 (Day 77).
**Spec author:** Alexander Konstantinov with AI assistance.
**Executor:** TBD (Lovable session + targeted human review).
**Estimated total effort:** ~1 day of focused work (most of it prompt-driven).

---

## 1. What we're doing

We are reshaping the JOURNEY space and the public landing page so that **precision matchmaking for collaboration** is the hero of the funnel — replacing the previous hero, which was *"build your unique business."*

The matching-onboarding sequence (Talent → Mission → Assets → QoL → bridge-to-Build) lives in the JOURNEY space and gates the user's path to becoming matchable. The unique-business / venture-building content (which used to live inside JOURNEY) moves into the BUILD space, where it becomes the deeper layer for members who graduate from matching into building.

The landing page keeps the same shell (layout, fonts, gradients, components, testimonial structure) but every line of text changes to reflect the matching-first frame.

Ignite Session ($555) is **no longer linked from the public landing or the post-Top-Talent screen.** It remains accessible at `/ignite` and is now surfaced only from inside the BUILD space, as the premium step for members who completed the matching triad and want hands-on venture-building work with Alexander.

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

A founder lands on `findyourtoptalent.com`. The hero says **"Stop building alone."** The page reads in under 30 seconds and ends with one CTA: *"Find your top talent →"*.

The founder clicks. They walk through the Top Talent assessment (~10–15 min) and see their reveal. The post-reveal screen replaces the old binary fork (*Build / Unlock / Playbook*) with a single forward CTA: *"Discover your mission — free, 10 minutes."*

They continue into JOURNEY item #2 (Mission), then #3 (Assets). Each takes ~10 min. After completing #3, they are **matchable**. The matching surface unlocks. They can also see #4 (QoL — marked as *"Improve your match quality"*) and #5 (Build a business — a bridge into the BUILD space).

If they go into BUILD, they find the deeper venture-path content: *The Path to Your Unique Business*, *See the Dashboard*, *Take the exact playbook* — and the Ignite Session option for hands-on work with Alexander.

That's the entire user journey. Matching is the gravity well; venture-building is the deeper room for those who want it.

---

## 4. Specifications

### 4.1 Landing page

**File:** `src/pages/LandingPage.tsx`
**Change type:** text only. Shell, layout, fonts, gradients, components stay identical.

| Element | New copy |
|---|---|
| **Eyebrow** | *"Precision matchmaking for collaboration"* |
| **Hero (h1)** | *"Stop building alone."* |
| **Sub paragraph** | *"Your people are already in this network. Ten minutes to be seen — we surface them. Real introductions follow."* |
| **Italic line** | *"You've met cool people. You still haven't found your people."* |
| **CTA button** | *"Find your top talent →"* |
| **CTA route** | `/start` (unchanged — the ZoG entry) |

**Remove from the landing entirely:**
- The two-paths split (free-ZoG / direct-Ignite) — collapse to a single CTA.
- The five-founder testimonial section (Oyi, Sergey, Sandra, Alexa, Karime). These move to a new `/founders` sub-page or inside the BUILD space (see §4.5).

**Why single CTA, not two paths:** funnel monogamy. One forward motion per stage. Strangers no longer convert to $555 Ignition directly; the only Day-1 conversion is *"start the matching onboarding."*

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
| *Ignite Session* (premium $555 step) | Surfaced inside BUILD space — accessible to members who completed the matching triad |
| *The five-founder testimonials* (Oyi, Sergey, Sandra, Alexa, Karime) | Moved from landing — see §4.5 |
| `/path` value-ladder page | Moved from JOURNEY (where it was last item) |

**Navigation in:**
- From JOURNEY item #5 (*Build a business off your top talent*), clicking enters the BUILD space.
- `/ignite` URL stays valid (direct links don't 404) but is **not linked from landing or post-Top-Talent screen.**

**Visual treatment of BUILD entry from JOURNEY:**
- JOURNEY item #5 should feel like a doorway, not another sequential step. Subtle visual differentiation (badge, arrow, divider) so users understand they're transitioning surfaces.

### 4.4 Post-Top-Talent CTA — replace the binary fork

**Current state:** After the Top Talent reveal page, the user sees three options to choose from: *Build a business / Unlock deeper profile / See the playbook.* This is a binary-fork screen requiring user decision.

**New state:** The post-Top-Talent screen presents a single continuous forward CTA:

> *"Discover your mission — free, 10 minutes →"*

Plus one optional secondary link (smaller, less prominent):
- *"Unlock the full Top Talent profile"* — sidepath, not the primary forward motion.

**Why:** continuous matching-onboarding flow replaces decision fatigue. Most users will follow the forward CTA. The deeper Top Talent profile is preserved for those who actively want it.

### 4.5 Founder testimonials — relocation

**Current:** The five founders (Oyi, Sergey, Sandra, Alexa, Karime — plus Kirill if implemented) appear on the public landing as social proof for the unique-business framing.

**Move to:** New `/founders` sub-page, OR inside the BUILD space as social proof for the venture-path tier.

**Do NOT re-narrate the testimonials.** They are true statements about the unique-business work those founders did with Alexander. They are not about matching outcomes. Keep their original framing intact in the new location.

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

The NS skin (`/ns/*`) shares the same `SectionsPanel.tsx` and `LandingPage.tsx` components as the canonical surface. **Structural changes in this build (JOURNEY reorder, post-Top-Talent CTA, BUILD wiring) will auto-propagate to the NS skin without separate work.**

Where the NS skin DOES need separate edits:
- The NS-skinned landing's hero / sub / italic copy — currently hardcoded per skin (will be addressed by §4.7 if included in this build, otherwise manual update for NS).
- Any NS-specific CSS overrides for the new BUILD-space surface — verify visual register matches NS editorial style.

**Verification:** walk the new JOURNEY at `/`, then at `/ns`, then on mobile (375px) for both. Confirm parity.

### 4.7 Config-driven labels and copy (optional but recommended)

**Why this matters:** Future skins (Carolina, vnest, venture-studio instances) should not require manual edits to label strings every time content changes. Make JOURNEY labels + landing hero copy **config-driven per skin** — read from a per-community theme/copy config rather than hardcoded.

**Scope:** ~half a day of refactor work, one-time. Every future skin benefits.

**Out of scope for this build** if time is tight — can be deferred to the Carolina-skin build. But strongly recommended to do it now while touching this surface anyway.

---

## 5. Scope of Work

Honest time estimates (most prompt-driven via Lovable + targeted review):

| # | Item | Estimate |
|---|---|---|
| 1 | Landing page text rewrite (§4.1) — same shell, new copy | 30 min |
| 2 | JOURNEY reorder + renames + lock logic (§4.2) in `SectionsPanel.tsx` | 1–2 hours |
| 3 | BUILD space wiring (§4.3) — route items in, surface Ignite, link from JOURNEY #5 | ~1 hour |
| 4 | Post-Top-Talent CTA change (§4.4) — binary fork → continuous forward | 1–2 hours |
| 5 | Founder testimonials relocation (§4.5) — move off landing to `/founders` or BUILD | 30 min |
| 6 | User state migration (§4.6) — verify completion-flag carryover; brief notice for edge case | ~1 hour |
| 7 | Auth flow + mobile audits across skins (already-mandatory per [`white_label_strategy.md`](../../02-strategy/white_label_strategy.md)) | 30 min per skin |
| 8 | (Optional but recommended) Labels + landing copy config-driven per skin (§4.7) | ~half a day |

**Total: ~1 day of focused work** without #8, ~1.5 days with #8.

Items #2 + #3 + #4 are the visible product change. Item #1 is the public-face change. Item #6 is the data-safety check. Items #7 + #8 are the cross-skin durability layer.

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

- **No new pages.** The BUILD space already exists. The `/founders` sub-page if created is trivial (a small static page).
- **No backend / matching algorithm changes.** The matching infrastructure is already shipped (active-intro layer, consent tokens, `match-consent` edge function). This build is funnel + UI only.
- **No new branding work for skins.** The NS skin is already 99.9% ready. This build does not introduce new skins.
- **No pricing changes in code.** Per-active-member pricing exists in strategy docs; implementing payment rails is a separate downstream build.
- **No ecosystem-leader landing pages.** Per Sasha's decision, ecosystem leaders (Balaji-type buyers) get personalized outreach (Discord, email — *"their landing page is my message to them"*), not a public landing. No B2B landing page is built here.

---

## 7. DoD / Verification

Before merging:

- [ ] Public landing page renders new copy verbatim (eyebrow, hero, sub, italic, CTA) across desktop + mobile + every active skin (default, `/ns`).
- [ ] JOURNEY space shows 5 items in the new order with correct lock/unlock visual treatment for: new user, user mid-onboarding, fully-completed user.
- [ ] Item #5 (*Build a business*) navigates correctly into the BUILD space when clicked.
- [ ] BUILD space contains the three moved items + Ignite Session option + (optionally) the founder testimonials and `/path`.
- [ ] Post-Top-Talent screen shows single forward CTA (*"Discover your mission"*) + optional sidepath link (*"Unlock the full Top Talent profile"*). No binary fork remaining.
- [ ] `/ignite` URL still resolves; not linked from landing or post-Top-Talent.
- [ ] Existing users with partial progress under the old ordering retain their completion flags. Verified on at least one test account from the cohort.
- [ ] Founder testimonials no longer appear on the public landing.
- [ ] Mobile experience verified at 375px width: rail, JOURNEY, landing all render correctly.
- [ ] Auth flow verified per skin (`/auth`, `/ns/auth`) — both read in their skin register.
- [ ] If §4.7 is included: a new skin's labels + landing copy can be changed by editing the per-skin config, no source edits required.

---

## 8. Open implementation decisions

These are deliberately left for the executing thread to resolve in conversation with Sasha:

1. **Founder testimonials destination:** new `/founders` sub-page, OR inside the BUILD space, OR both. Recommendation: `/founders` sub-page (cleaner separation), linked from the BUILD space.
2. **Visual treatment of JOURNEY item #5 as bridge:** subtle arrow / badge / divider — what's the design that signals "this is a doorway, not a step"?
3. **Whether to include §4.7 (config-driven labels) in this build, or defer to the next-skin build:** strongly recommended now; depends on time pressure.
4. **Whether the migration edge case (users with Assets but no Mission completed) needs an in-product notice, or whether the matching surface itself can just say "complete Mission to unlock matching."** Recommendation: the surface itself handles it; no separate notice needed.
5. **Sasha's amendments to the Scope of Work** — to be added as he reviews this spec.

---

## Cross-references

- Strategic context: [`docs/02-strategy/monetization_strategies.md` → Strategic Crystallization](../../02-strategy/monetization_strategies.md#strategic-crystallization-day-7677-may-1920-2026)
- Funnel architecture: [`docs/02-strategy/unique-businesses/alexanders_unique_business.md` → Funnel Architecture v2](../../02-strategy/unique-businesses/alexanders_unique_business.md#funnel-architecture-v2--matching-as-hero-day-77-may-20-2026)
- White-label commercial role: [`docs/02-strategy/white_label_strategy.md` → Strategic Role in the Commercial Model](../../02-strategy/white_label_strategy.md#strategic-role-in-the-commercial-model-day-77-may-20-2026)
- First pilot target (Balaji NS): [`docs/03-playbooks/leonardo_strategy_instances/balaji_srinivasan.md`](../../03-playbooks/leonardo_strategy_instances/balaji_srinivasan.md)
- Active-intro layer (already shipped — the matching mechanic this funnel feeds into): [`docs/specs/match-mechanic/active-intro_product_spec.md`](../match-mechanic/active-intro_product_spec.md)

---

*v0.1 · May 20, 2026 (Day 77) · Product spec for the matching-as-hero funnel reshape. Ready for execution. Sasha to amend Scope of Work per his review; executing thread to resolve §8 open decisions in dialogue.*
