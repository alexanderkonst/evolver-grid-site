# Unique Business Builder v2.0 — UI Spec

*Phase 3 output · 2026-04-23*

> **Source playbooks:** `docs/03-playbooks/ui_playbook.md` (Parts I–VII) · `docs/05-reference/brandbook.md` (Parts I–III) · `docs/01-vision/new_ui_paradigm_vision.md`
> **Derives from:** Product Spec + Architecture Spec.
> **Approach:** delegate shared design concerns to UI Playbook; define only what v2.0 introduces new (6 components + specific screen behaviors). No duplication of token JSON.

---

## 3.1 Visual Rules

### Commitments (module-wide)

- ✅ No hardcoded `#hex` or `rgb()` in any v2.0 file. All colors from token palette.
- ✅ Typography from the 9-level scale in UI Playbook Part VI.
- ✅ Spacing strictly on 8px grid.
- ✅ Border radius from defined tokens (sm/md/lg/xl/2xl/full).
- ✅ Shadows from defined set (sm/md/lg/xl/glow).
- ✅ Animation durations from tokens (instant/fast/normal/slow/gentle).
- ✅ Surface treatment: **light-surface (PremiumCard, `--glass-bg`)** — v2.0 lives inside GameShell.
  - Public `/ubd/{slug}` and `/ubl/{slug}-v{n}` MAY use dark-surface liquid glass per the landing-page pattern.

### Semantic color mapping (module-specific)

| Semantic role | Token | Used for |
|---|---|---|
| Success | `--success` (#22c55e) | Locked artifact badge, Lock & Continue confirmation, specificity rise |
| Warning | `--warning` (#f59e0b) | Staleness banner ("Re-Improve?"), diminishing returns notice |
| Error | `--error` (#ef4444) | 402 credit error, failed Improve, publish failure |
| Info | `--info` (#6894d0) | Generating / improving in-progress, version count pill |

### Module-specific visual signatures

- **Specificity badge:** subtle gradient from cool → warm as score rises (4 = cool blue, 10 = warm gold). Bright flash on positive delta.
- **Lock icon:** muted at 0.6 opacity when unlocked; full saturation when locked. Never red. Never aggressive.
- **Improve button:** `⚡` leading glyph, slight inner glow pulse on idle to signal aliveness without demanding attention.

---

## 3.2 Building Blocks

### Reused (no changes)
| Component | Source | Used in |
|---|---|---|
| `PremiumButton` | `@/components/ui` | All primary CTAs (Improve, Lock & Continue, Publish) |
| `PremiumCard` (glass / glass-strong) | `@/components/ui` | Artifact panels, Canvas Overview cards |
| `Button` (shadcn) | `@/components/ui/button` | Secondary actions, reject |
| `Input` / `Textarea` (shadcn) | `@/components/ui/input` | Future: note fields (out of MVP — pure Improve button) |
| `Dialog` (shadcn) | `@/components/ui/dialog` | ImproveReviewDrawer on tablet |
| `Sheet` / `Drawer` | `@/components/ui/sheet` | ImproveReviewDrawer on desktop (right) and mobile (bottom) |
| `Toast` / `Sonner` | `@/components/ui/sonner` | Error surfacing (402, 5xx, stale) |
| `Badge` (shadcn) | `@/components/ui/badge` | Phase tags, version counts |

### New components (v2.0 introduces 6)

| # | Component | Purpose |
|---|---|---|
| 1 | `ArtifactPanel` | Shared container for any artifact's current version + specificity + version history toggle |
| 2 | `ImproveButton` | The one-button trigger. Idle / hover / active / loading / disabled states. Signature component of the module. |
| 3 | `ImproveReviewDrawer` | Diff display + roast findings list + Accept/Reject. Responsive drawer (sheet on mobile/desktop right, dialog on tablet). |
| 4 | `SpecificityBadge` | Pill showing current score + optional delta (`8.5 ↑ 0.6`). Color gradient by score. |
| 5 | `VersionHistoryPanel` | Expandable list of prior versions with "view" tap. Read-only. |
| 6 | `CompoundArtifactCard` | 3-sub-artifact card used in Marketing / Distribution / Communications screens. |

### All 9 states — defined for each new component

| Component | default | hover | focus | active | disabled | loading | error | empty | skeleton |
|---|---|---|---|---|---|---|---|---|---|
| `ImproveButton` | ⚡ + label, subtle glow pulse | slight scale(1.02), glow brighter | focus ring visible | scale(0.98) | opacity 0.4, no pulse | spinner replaces ⚡, label = "Improving…" | red ring + tooltip error | n/a (always relevant if artifact exists) | shimmer pill |
| `ArtifactPanel` | Card with content + badge + CTAs | hover lift 2px | focus ring on card | — | dimmed | shimmer body | red banner top | "Not yet generated" + Generate CTA | skeleton shaped like artifact |
| `ImproveReviewDrawer` | open from right (desktop) / bottom (mobile) | — | focus trap inside | — | — | spinner while saving accept | inline error "save failed" | n/a | — |
| `SpecificityBadge` | pill, score, color-by-value | tooltip "click to see criteria" | focus ring | — | muted gray | pulse | red outline if invalid | shows "—" when no score yet | gray pill |
| `VersionHistoryPanel` | collapsed with count `(3)` | chevron rotate | focus ring | — | — | shimmer | "couldn't load" | "No prior versions" | 3-row skeleton |
| `CompoundArtifactCard` | 3 sub-cards side-by-side (desktop) or stacked (mobile) | individual sub hover | per-sub focus | — | overall dimmed | per-sub shimmer | per-sub error | "Not yet started" | 3-card skeleton |

---

## 3.3 Layout Templates

### Mobile-first, 375px base

### Breakpoints (from brandbook)
- Mobile: `<640px`
- Tablet: `640–1023px`
- Desktop: `1024–1279px`
- Wide: `≥1280px`

### Container widths per screen

| Screen | Container | Why |
|---|---|---|
| CanvasOverviewScreen | `max-w-6xl` | Dashboard layout; needs room for 18 artifact cards grid |
| Artifact screens (7 canvas) | `max-w-2xl` | Reading width; single focused artifact |
| SessionBridgeScreen | `max-w-3xl` | 3 stacked sub-artifacts; more vertical density |
| Marketing / Distribution / Communications | `max-w-5xl` | 3 sub-cards side-by-side desktop, stacked mobile |
| LandingPageScreen | `max-w-4xl` | Live preview iframe + controls |
| DossierScreen | `max-w-4xl` | One-page business document, readable |
| ImproveReviewDrawer (desktop sheet) | `w-[480px]` right sheet | Enough room for diff + findings |
| ImproveReviewDrawer (mobile) | full-screen bottom sheet | Touch-friendly |

### Touch targets
- Minimum 44×44px on mobile (Improve button = 56×56px to honor signature weight)
- CTAs in bottom 40% of mobile viewport

### Responsive behavior per component

| Component | Mobile (<640) | Tablet (640–1023) | Desktop (≥1024) |
|---|---|---|---|
| CanvasOverviewScreen | 1-column card list | 2-column | 3-column with sidebar nav |
| Artifact screen | Full width, Improve at bottom sticky | Centered column | Centered column, Version History right-panel |
| ImproveReviewDrawer | Full bottom sheet | Modal dialog | Right sheet 480px |
| CompoundArtifactCard | Stacked 3× | 2+1 grid | 3× side-by-side |

---

## 3.4 Brandbook Integration

### Emotional mode per screen

| Screen | Mode | Notes |
|---|---|---|
| CanvasOverviewScreen | **Calm** | Dashboard feel, no urgency |
| All artifact screens | **Warm** | Depth-inviting, not clinical |
| ImproveReviewDrawer | **Focused** | Precision moment — decision clarity |
| LandingPageScreen | **Proud** | User's public surface — celebration + control |
| DossierScreen | **Celebration** | Crystallization; business is real |

### Voice matrix applied to v2.0 microcopy

The 4 brandbook voices (Direct · Warm · Precise · Sacred) applied to key UI text:

| Context | Voice | Example |
|---|---|---|
| CTAs on artifact screens | Direct + Precise | "Improve" · "Lock & Continue →" |
| Overview progress | Warm + Precise | "4 of 18 locked — nice rhythm." |
| Diminishing returns notice | Warm + Sacred | *"This version may be at its current ceiling. Try again once surrounding artifacts sharpen."* |
| 402 credit error | Direct + Warm | "AI credit is out. Top up in Settings, then retry." |
| Staleness banner | Warm + Precise | *"Tribe was updated since this was locked — Pain may want a refresh."* |
| ZoG updated banner | Sacred + Direct | *"Your Zone of Genius has shifted. Affected: Uniqueness, Myth."* |
| Dossier publish success | Warm + Celebration | "Your business is live at ubd.app/alex-konst." |
| Empty state (pre-generate) | Warm + Sacred | *"Nothing here yet. When you're ready, name your gift."* |

### Anti-voice (do NOT use in v2.0)
- ❌ Hype: "Level up your unique biz!"
- ❌ Shame: "You haven't locked this yet."
- ❌ Urgency theater: "Only 3 Improves left today!"
- ❌ Consultant jargon: "Holonic optimization pass initiated."

### Imagery
- No stock photos.
- Founder's own photo (from profile) on Dossier + Landing Page.
- Module iconography: subtle, geometric (holonic hexagons / nested circles).
- Wabi-sabi × Apple aesthetic — room for imperfection, high-craft.

### Gradients
- Strip 1 (warm gold / earth tones) for artifact panels' subtle background glow.
- Strip 2 (cool blues / purples) reserved for Dossier hero section.
- Specificity badge uses its own gradient (cool → warm by score).

---

## 3.5 Micro-interactions

| Interaction | Spec | Motion safety |
|---|---|---|
| ImproveButton idle glow pulse | 2s loop, opacity 0.5 → 0.8 → 0.5 | Disabled with `prefers-reduced-motion: reduce` |
| ImproveButton hover | `scale(1.02)`, 200ms, token `duration-fast` | Static on reduce-motion |
| ImproveButton click | `scale(0.98)`, 120ms, token `duration-instant` | Static on reduce-motion |
| Specificity increment on accept | count-up from old → new over 600ms, ease-out | Jump-cut on reduce-motion |
| Specificity delta flash | brief gold flash pill behind score, 800ms | No flash on reduce-motion |
| Version count increment | "v3 → v4" slide-up wheel 300ms | Jump on reduce-motion |
| Lock & Continue checkmark | draw-on SVG 400ms + fade to green | Simple green state on reduce-motion |
| ImproveReviewDrawer open (desktop) | slide in right 300ms, `ease-out-cubic` | Fade-in only on reduce-motion |
| ImproveReviewDrawer open (mobile) | slide up 300ms with backdrop fade | Fade-in only on reduce-motion |
| Staleness banner appear | slide down + fade 250ms | Fade only on reduce-motion |
| Canvas Overview progress bar fill | width animates on Lock, 500ms | Jump on reduce-motion |

**Global rule:** all animation wrapped in `prefers-reduced-motion` check. Default to static on reduce.

**No breathing/aurora/glowing animations beyond the ImproveButton's subtle pulse.** Keep the module alive but not distracting.

---

## 3.6 Accessibility (WCAG 2.2 AA)

### Perceivable
- Color contrast ≥ 4.5:1 for text, ≥ 3:1 for UI elements. Semantic colors already compliant.
- Alt text on all images (founder photo, geometric icons, dossier shares).
- Never rely on color alone — staleness = banner text + warning icon, not just yellow.

### Operable
- Full keyboard navigation for all screens.
- Visible focus ring on every interactive element (uses design system focus token).
- No keyboard traps. ImproveReviewDrawer has proper focus management (focus moves into drawer on open, returns to Improve button on close).
- Skip link at top of each screen: "Skip to artifact content."

### Understandable
- `<html lang="en">` (or `ru` if user locale set).
- All form inputs (future: note field) have associated `<label>`.
- Consistent navigation: Canvas Overview accessible from any screen via header breadcrumb.
- Error text is specific: "AI credit is out" not "Something went wrong."

### Robust
- Valid HTML. Semantic elements (`<main>`, `<section>`, `<nav>`).
- ARIA used minimally:
  - `role="dialog"` + `aria-labelledby` on ImproveReviewDrawer
  - `aria-live="polite"` on Specificity badge (announces delta changes)
  - `aria-busy="true"` during Improve-in-progress
- No custom widget where native element suffices.

### Mobile
- Works portrait + landscape.
- Touch targets 44×44px minimum.
- Supports assistive tech (VoiceOver / TalkBack tested in Phase 4.6).

### Motion safety
- `prefers-reduced-motion: reduce` disables all pulse / slide / count-up animations.
- Critical state changes still communicated (color, text, icon) — just without motion.

### Roast Gate 3 accessibility pass (Phase 4.5)
- Run `npx @axe-core/cli http://localhost:8080/ubb` against Canvas Overview + 2 artifact screens + ImproveReviewDrawer.
- Manual keyboard walkthrough.
- VoiceOver pass on iOS simulator.

---

## 3.7 Component States (detail)

### Empty states (zero-data)

| Component | Empty message |
|---|---|
| Canvas Overview (0/18 locked) | Warm welcome: *"Your canvas is empty. Name your gift first."* → CTA: "Start with Uniqueness" |
| Artifact panel (no version yet) | *"Nothing here yet. Generate your first version."* → CTA: "Generate [Artifact Name]" |
| Version History (no prior versions) | *"This is your first version — no history yet."* |
| Dossier (before any artifact locked) | *"Your business will compose here as you lock artifacts. 0 / 18 so far."* |
| Landing Page (before frictionless_purchase locked) | *"Your landing page will compose once Marketing Pillar 3 is locked."* |

### Loading states

- Initial Improve call: button shows spinner + "Improving…" — typical 15–45s given GPT-5.2 roast depth.
- Generate first-time: button "Generating…" with progress indicator if possible (token stream?) or just spinner.
- Version history load: shimmer skeleton, 3 rows.
- Dossier compose: shimmer over sections as they compose.

### Error states

| Error | UI |
|---|---|
| 402 Payment Required | Toast (warning color) with "Settings" link + "Retry" action |
| 5xx model error | Toast (error color) "AI briefly unavailable, retry in a minute" with "Retry" |
| Invalid JSON (after retry) | Inline banner on ArtifactPanel "Improvement failed — please retry" |
| DB write fail after model success | Critical banner: preserve pending in Context, offer Retry Save |
| Offline | Subtle offline indicator in header, queue Improve until reconnect |

### Disabled states
- Improve button disabled when: artifact not yet generated / generation in progress / reject handler pending / another Improve already in flight for this artifact
- Visual: `opacity-40` + cursor `not-allowed`
- Hover: no scale, no glow pulse
- Tooltip explains why

### Skeleton states
- Canvas Overview: 18 card skeletons in grid
- Artifact Panel: card-shaped skeleton with badge + 3 text rows + button shape
- Version History: 3 row skeletons with varying width
- Dossier: section headings + text blocks as gray bars

---

## 3.8 Design Tokens Audit (commitment)

Before Roast Gate 4 (Phase 4 code verification), run:

```bash
# Find any rogue hex in module code
rg '#[0-9a-f]{3,8}\b' src/modules/unique-business-builder/ --type ts --type tsx

# Find any rogue rgb/rgba
rg 'rgba?\(' src/modules/unique-business-builder/

# Find any rogue pixel values outside 8px grid
rg '\b\d+px\b' src/modules/unique-business-builder/ | grep -v -E '(8|16|24|32|40|48|56|64|72|80|96|128|44|9|10|11|12|14|18|30)px'
```

Commitment: zero rogue hex, zero rogue rgb, spacing values all multiples of 8 (with documented exceptions for typography line heights and the 44×44 touch target minimum).

---

## 3.9 Design Critique (Nielsen's 10, per screen)

Scored 1–5 (5 = passes), applied to the 5 key screens.

### Canvas Overview Screen

| # | Heuristic | Score | Notes |
|---|---|---|---|
| 1 | Visibility of system status | 5 | Progress bar, lock counts, specificity per artifact |
| 2 | Match to real world | 5 | "Canvas", "Lock", "Improve" — familiar terms |
| 3 | User control & freedom | 4 | Can exit anytime to `/game`; no trap. Missing: clear "un-lock" on overview. → fix: add small unlock toggle on locked cards |
| 4 | Consistency & standards | 5 | All cards follow same layout, badges consistent |
| 5 | Error prevention | 4 | Lock is reversible. Missing: confirm when starting fresh on a locked artifact → fix: "This is locked. Unlock to Improve?" prompt |
| 6 | Recognition over recall | 5 | Artifact names + phase grouping visible |
| 7 | Flexibility & efficiency | 3 | Advanced users may want "Improve all remaining" batch — deferred to v2.1 |
| 8 | Aesthetic & minimalist design | 5 | Clean, breathing room |
| 9 | Error recovery | 4 | If Improve fails, user returns to overview. Missing: persistent error log → polish item |
| 10 | Help & documentation | 3 | No inline help. → fix: add ℹ️ icon per artifact linking to playbook source |

### Artifact Screen (generic)

| # | Heuristic | Score | Notes |
|---|---|---|---|
| 1 | Visibility | 5 | Specificity + version count visible |
| 2 | Real world | 4 | "Photon of truth" may confuse first-timers → fix: tooltip from playbook |
| 3 | Control | 5 | Back to Canvas always. Can Reject improvements. |
| 4 | Consistency | 5 | Same layout across 7 canvas screens |
| 5 | Error prevention | 5 | Can't accept a worsening improvement (enforced server-side) |
| 6 | Recognition | 5 | Previous version visible in history |
| 7 | Flexibility | 4 | No keyboard shortcuts. → Phase 5 polish: ⌘+I for Improve |
| 8 | Aesthetic | 5 | Single focus, clean |
| 9 | Error recovery | 5 | Errors surface as toasts, no lost work |
| 10 | Help | 3 | Need "Specificity criteria" drawer showing the playbook-sourced rules per artifact |

### ImproveReviewDrawer

| # | Heuristic | Score | Notes |
|---|---|---|---|
| 1 | Visibility | 5 | Delta + findings prominent |
| 2 | Real world | 5 | "Accept" / "Reject" — clear decisions |
| 3 | Control | 5 | Can close drawer without deciding (saved in pending) |
| 4 | Consistency | 5 | Matches other drawers in app |
| 5 | Error prevention | 5 | Diff view reduces misclick risk |
| 6 | Recognition | 4 | Roast findings use jargon (UL/UR/LL/LR) → fix: plain-language labels next to the quadrant codes |
| 7 | Flexibility | 4 | No keyboard Accept/Reject. → Phase 5: Enter=Accept, Esc=Reject |
| 8 | Aesthetic | 5 | Clean diff, no visual noise |
| 9 | Error recovery | 5 | Reject is trivial |
| 10 | Help | 4 | Each finding has a quadrant but not "why this quadrant" → fix: tooltip per quadrant |

### LandingPageScreen

| # | Heuristic | Score | Notes |
|---|---|---|---|
| 1 | Visibility | 5 | Live preview iframe shows exactly what public sees |
| 2 | Real world | 5 | "Publish v5" — clear |
| 3 | Control | 5 | Can Improve before publishing, can see published version |
| 4 | Consistency | 5 | Same Improve flow as other artifacts |
| 5 | Error prevention | 4 | Publishing while offline? → fix: disable Publish when offline |
| 6 | Recognition | 5 | Shows live version + latest version side-by-side |
| 7 | Flexibility | 4 | No A/B test support — deferred to v3 |
| 8 | Aesthetic | 5 | Preview is the hero |
| 9 | Error recovery | 5 | Publish failures roll back cleanly |
| 10 | Help | 3 | Need "What makes a landing page work?" inline guide |

### DossierScreen

| # | Heuristic | Score | Notes |
|---|---|---|---|
| 1 | Visibility | 5 | All 18 composed, clear gaps for missing |
| 2 | Real world | 5 | "Your Dossier" — document metaphor |
| 3 | Control | 5 | Can copy URL, re-compose, un-publish |
| 4 | Consistency | 5 | Layout echoes artifact screens |
| 5 | Error prevention | 5 | Publish disabled if hard-gates not locked |
| 6 | Recognition | 5 | Gap markers tell user what's missing |
| 7 | Flexibility | 4 | No PDF export in MVP → deferred |
| 8 | Aesthetic | 5 | One-page business feels whole |
| 9 | Error recovery | 5 | Republish overwrites cleanly |
| 10 | Help | 3 | Need "Share playbook" showing how to send Dossier + Golden DM |

### Critical findings (fix in Phase 4)

- Add "Unlock" affordance on locked artifact cards (Overview).
- Add confirm-prompt when user starts fresh on a locked artifact.
- Add plain-language labels next to UL/UR/LL/LR roast quadrant codes.
- Disable Publish button when offline.
- Add tooltip/drawer linking to playbook source per artifact (the "why this artifact matters" panel).

### Important findings (fix by Phase 5 polish)

- Keyboard shortcuts for Improve / Accept / Reject / Lock.
- Specificity criteria drawer per artifact.
- "Specificity by quadrant" tooltip (explains UL/UR/LL/LR).
- Inline guide on LandingPageScreen.

### Polish / deferred (v2.1+)

- Batch "Improve all remaining."
- A/B testing on Landing Page versions.
- PDF export for Dossier.
- Advanced version diff viewer (word-by-word highlight).

---

## Roast Gate 3 — Gestalt Check

### First Impression Test
- **Set reads as one module?** ✅ yes — shared shell, consistent badges, one Improve-button signature.
- **Premium feel?** ✅ yes — light-surface glass, token-driven, no clutter.
- **Breathing room?** ✅ yes — reading-width artifact screens, no 3-column density except on Overview desktop.

### Accessibility pass
- Planned via axe-core in Phase 4.5.
- Motion safety: all animations wrapped.
- Keyboard: Phase 4 must implement full nav + focus trap in drawer.

### Cycle 1 — What looks off?
- Nothing structural. Minor: the compound screens (Marketing / Distribution / Comms) risk feeling cramped on tablet — 2+1 grid layout must be tested.

### Cycle 2 — Compared to Linear / Notion / Stripe
- **Linear** ⇒ matches the "one focused thing at a time" depth feel.
- **Notion** ⇒ matches the "everything versioned, never lost" invariant.
- **Stripe** ⇒ matches the "precise microcopy, no hype" voice.
- Room to grow: Linear's keyboard-first bias (Phase 5 polish).

### Cycle 3 — What did 1–2 miss?
- **Dark mode** not addressed. Decision: inherit whatever GameShell does. Phase 4 verifies parity.
- **Localization** — voice matrix in English only. If Russian is needed (founder may be bilingual per CLAUDE.md), Phase 4 implements i18n keys from day 1.
- **Print/PDF rendering** of Dossier — deferred to v2.1.

---

## What Phase 4 (Vibe-Coding) will do

1. Create `src/modules/unique-business-builder/` file tree (per architecture spec directory layout).
2. Implement the 6 new components (ArtifactPanel, ImproveButton, ImproveReviewDrawer, SpecificityBadge, VersionHistoryPanel, CompoundArtifactCard) with all 9 states.
3. Implement the 14 screens (per Product Spec Heart/Mind/Gut).
4. Wire routes in `App.tsx`.
5. Create 3 Supabase migrations (per schema_delta.md).
6. Create 2 edge functions (`generate-artifact`, `improve-artifact`) with per-artifact prompts loaded from config JSON.
7. Wire state management (Context + realtime subscription).
8. Token audit (rg for rogue hex).
9. Accessibility pass (axe-core + VoiceOver).
10. First-holon test — Sasha runs v2.0 end-to-end on his own business.

**Estimated Phase 4 scope:** substantial. Roughly:
- 1 Context + 1 Layout + 14 screens + 6 new components + 2 edge functions + 3 migrations + 1 routes block
- ~2,500–4,000 lines of new code across ~40 files
- ~$5–$15 in AI costs for the first-holon end-to-end test

---

## Phase 3 status

- [x] 3.1 Visual Rules ✅
- [x] 3.2 Building Blocks (all 9 states) ✅
- [x] 3.3 Layout Templates ✅
- [x] 3.4 Brandbook Integration ✅
- [x] 3.5 Micro-interactions ✅
- [x] 3.6 Accessibility (WCAG 2.2 AA) ✅
- [x] 3.7 Component States ✅
- [x] 3.8 Design Tokens Audit (commitment documented) ✅
- [x] 3.9 Design Critique (Nielsen's 10 × 5 screens, scored) ✅
- [x] 🔥 ROAST GATE 3 — gestalt check + 3 cycles complete

**Drafted. Awaiting Sasha's review walkthrough before starting Phase 4.**

### Open items for Sasha's Roast Gate 3 review
1. Localization: English-only for MVP, or include Russian voice matrix keys from day 1?
2. Dark mode: inherit from GameShell (default), or design v2.0 as dark-mode-only for public surfaces (`/ubd`, `/ubl`)?
3. Any element of the Nielsen critique you disagree with or want to re-prioritize?
