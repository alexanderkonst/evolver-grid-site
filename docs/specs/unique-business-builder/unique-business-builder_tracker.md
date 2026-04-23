# Unique Business Builder v2.0 — Progress Tracker

**Started:** 2026-04-23
**Status:** ✅ Phase 1 COMPLETE · ⏳ Phase 2 (Architecture) ready to start
**Owner:** Alexander
**Approach:** Recursive. Applying the Integrated Product Building Workflow to build the tool that delivers it. First holon tests everything.

**Source of truth hierarchy:**
- **Constitution:** `/playbook` → `unique_business_playbook.md` (supreme authority)
- **Federal laws:** domain playbooks in `docs/03-playbooks/` (integrated_product_building_workflow · marketing · distribution · communications)
- **This spec:** one module's derivation from constitution + federal laws

**Predecessor:** v1.0 Genius Product Builder at `src/modules/product-builder/`. Kept live. Not migrated.
**This module:** `src/modules/unique-business-builder/` — new duplicate, built from the playbooks.
**AI runtime:** `google/gemini-2.5-flash` via Lovable AI Gateway. ~$0.02–$0.06 per full Dossier pass. Swap to GPT-5.2 per-function later if Flash's reasoning ceiling proves thin.

---

## INPUT ✅ COMPLETE (5/5)

- [x] 1. **ICP:** Founder who has top talent named (ZoG snapshot exists) but no structured business around it. Can name the gift but can't price, pitch, sell, or distribute it.
- [x] 2. **Transformation:** From "I have a named gift" → "I have an 18-artifact Unique Business canvas with a versioned Landing Page live and a Golden DM ready to send today."
- [x] 3. **Pain of Point A:** Every new conversation = explaining from scratch. Pricing arbitrary. Patterns don't get paid. Work stays local.
- [x] 4. **Dream Outcome:** "Business on one page. First 10 moves obvious. Tuning Fork already written. Landing Page live at a URL I can share."
- [x] 5. **Action:** Click through 18 artifacts. Press **Improve** on each — the 27-perspective holonic roast auto-iterates and bumps specificity monotonically. Each Improve acceptance creates a new version. End: Landing Page live + Dossier URL.

---

## Paramount concept: SPECIFICITY (not "precision")

- Specificity is a **monotonic** score. Each Improve must raise it — if it can't, no new version is proposed.
- Every accepted Improve creates a **new version** in `user_business_artifacts`. Previous versions are never overwritten. Versioning is the founder's memory of how the business sharpened itself.
- There is **no threshold**. No "done." Only "enough for now." The module always invites further Improve.

---

## PHASE 1: PRODUCT ✅ COMPLETE

- [x] 1.1 Master Result — *"From named gift to published Landing Page + Golden DM in one guided click-through."*
- [x] 🔥 ROAST 1.1 (applied in product spec §"27-perspective roast on this spec")
- [x] 1.2 Sub-Results — 12 felt wins mapped to 18 artifacts across 4 phases (Canvas / Session / Market / Publication)
- [x] 🔥 ROAST 1.2
- [x] 1.3 Screens — 15 screens (overview + 7 canvas + 1 session + 3 compound market + 1 landing page + 1 dossier + 1 improve review)
- [x] 🔥 ROAST 1.3
- [x] 1.4 Screen Details — Heart/Mind/Gut per screen (spec §1.4)
- [x] 🔥 ROAST 1.4
- [x] 1.5 Extensions — artifacts, emotional states, completion, skip paths, bridges
- [x] 🔥 ROAST 1.5
- [x] 1.6 Wireframes — 5 ASCII screens (overview · generic artifact · improve review · landing page · dossier)
- [x] 🔥 ROAST 1.6
- [x] 🔥 **ROAST GATE 1** — ✅ passed with Sasha 2026-04-23

### Roast Gate 1 resolutions

| Question | Resolution |
|---|---|
| Artifact count / screen split | **18 artifacts, 15 screens.** Compound screens where playbooks compound (Session Bridge, Marketing, Distribution, Communications). |
| Precision bar (uniform or tiered)? | **Neither.** Replaced with **Specificity** — monotonic, versioned, no ceiling, no threshold. Paramount. |
| Improve button: pure or with note field? | **Pure button.** Holonic roast is baked in. |
| Terminal output? | **Landing Page (versioned artifact, improvable, publishable) + composed Dossier view.** Both are key outputs. |

### Ground of truth confirmed

- **Constitution:** `/playbook` → `unique_business_playbook.md` (supreme authority)
- **Federal laws:** domain playbooks (marketing, distribution, communications, integrated_product_building_workflow)
- If a domain law conflicts with the constitution, the constitution wins.

---

## PHASE 2: ARCHITECTURE ✅ COMPLETE

- [x] 2.1 Module Boundaries — `/ubb` entry, 4 public exit points, data in = ZoG + sibling artifacts, data out = versioned artifact rows + Dossier + Landing Page publications
- [x] 2.2 Routing — flat `/ubb/*`. Guards: RequireAuth + RequireZoG + RequireSiblingLocks. Public routes: `/ubd/{slug}` + `/ubl/{slug}-v{n}`.
- [x] 2.3 Data Schema — all 5 open questions resolved. Append-only. `canvas_snapshots` kept as read model. Dossier + Landing Page share `unique_business_dossiers` table.
- [x] 2.4 Shell & Layout — focus mode ON for artifact screens. Canvas Overview + Dossier keep full nav.
- [x] 2.5 State Management — React Context (mirrors v1.0). Supabase Realtime subscription per user. URL holds current screen.
- [x] Lovable AI Gateway 402 handling — toast with Settings link. No DB write on failure. Documented in architecture spec §"Error & Failure Modes."
- [x] 🔥 **ROAST GATE 2** — ✅ passed with 5 default decisions (below)

### Roast Gate 2 resolutions

| Question | Default chosen | Why |
|---|---|---|
| 1. Focus mode for artifact screens? | **ON** — sidebar hidden during artifact flow; full nav on Overview + Dossier | Depth requires focus. Matches v1.0 `ProductBuilderLayout` pattern. |
| 2. Mid-Improve refresh → persist? | **Stateless — lose pending improvement** | Re-Improve costs ~$0.02. Persisting unaccepted rows is messy. Simpler model wins. |
| 3. Landing Page slug pattern? | **`{custom}-v{n}`** with auto-suffix on collision | Clean URLs. Collisions rare. Matches v1.0's approach (`{genius-TIMESTAMP}`). |
| 4. Cost-aware UI indicator? | **Hidden by default.** Settings toggle to enable | Transparency is good; iteration friction is worse. Founder shouldn't hesitate. |
| 5. ZoG-updated staleness? | **Per-artifact banners, non-blocking** with "Re-Improve?" CTA | Sovereignty respect. User decides when to re-derive. |

All decisions documented in [architecture spec](./unique-business-builder_architecture_spec.md) and reflected in Phase 3 UI spec.

---

## PHASE 3: UI ✅ DRAFTED — awaiting Roast Gate 3 walkthrough

- [x] 3.1 Visual Rules — tokens + semantic color mapping + surface = light-glass
- [x] 3.2 Building Blocks — reuse shadcn/ui + PremiumCard/Button; 6 new components defined with all 9 states
- [x] 3.3 Layout Templates — mobile-first, 4 breakpoints, per-screen container widths
- [x] 3.4 Brandbook Integration — emotional mode + voice matrix + anti-voice per screen
- [x] 3.5 Micro-interactions — Improve pulse, specificity count-up, drawer motion, all with reduced-motion fallbacks
- [x] 3.6 Accessibility (WCAG 2.2 AA) — perceivable/operable/understandable/robust/mobile/motion
- [x] 3.7 Component States — empty/loading/error/disabled/skeleton per new component
- [x] 3.8 Design Tokens Audit — commitment documented (rg commands for Phase 4 verification)
- [x] 3.9 Design Critique — Nielsen's 10 scored across 5 key screens, 5 Critical + 4 Important + 4 Deferred findings
- [x] 🔥 ROAST GATE 3 — gestalt + 3 cycles complete internally

**3 open items for Sasha's Gate 3 review:**
1. Localization: English-only for MVP, or Russian voice matrix keys from day 1?
2. Dark mode on public surfaces (`/ubd`, `/ubl`): inherit GameShell default, or dark-only?
3. Any Nielsen critique finding to re-prioritize?

**Critical findings that Phase 4 must implement:**
- Unlock affordance on locked artifact cards (Overview)
- Confirm prompt when starting fresh on a locked artifact
- Plain-language labels next to UL/UR/LL/LR roast quadrants
- Disable Publish when offline
- Playbook-source tooltip ("why this artifact matters") per screen

---

## PHASE 4: VIBE-CODING `[■■■░░░░░░░]` ~30% (foundation landed 2026-04-23)

### Foundation landed
- [x] 3 Supabase migrations written:
  - `20260423000001_ubb_artifact_versioning.sql` — extends `user_business_artifacts` (content_json JSONB, specificity_score, parent_version_id, roast_findings, what_changed, is_locked). Drops restrictive artifact_key CHECK.
  - `20260423000002_ubb_artifact_improvements.sql` — audit log (every Improve event, append-only, immutable).
  - `20260423000003_ubb_dossiers.sql` — published Dossier + Landing Page snapshots, public read by slug.
- [x] Shared prompt config: `supabase/functions/_shared/ubb-prompts.ts` — all 18 artifact configs (label, source, specificity criteria, output schema, generation guidance) + the 27-perspective roast protocol + model constants.
- [x] Edge function: `supabase/functions/improve-artifact/index.ts` — applies the roast, enforces monotonic specificity, handles 402 gracefully.
- [x] Edge function: `supabase/functions/generate-artifact/index.ts` — produces v1 drafts from ZoG seed + sibling context.
- [x] Module scaffold: `src/modules/unique-business-builder/types.ts` + `constants.ts` + `index.ts` — all TypeScript types, route helpers, artifact labels, phase mapping, specificity bands, version helpers.

### Still ahead in Phase 4
- [ ] 4.1 — Complete module scaffold: `UniqueBusinessContext.tsx`, `UniqueBusinessLayout.tsx`, `UniqueBusinessRoutes.tsx`, hooks (useArtifact / useImprove / useGenerate / useVersionHistory / useDossier / usePublishLandingPage)
- [ ] 4.2 — 6 shared components: `ArtifactPanel`, `ImproveButton`, `ImproveReviewDrawer`, `SpecificityBadge`, `VersionHistoryPanel`, `CompoundArtifactCard`
- [ ] 4.2 — 14 screens (Canvas Overview + 7 canvas + Session + 3 market compound + Landing Page + Dossier)
- [ ] 4.3 — Wire routes in `App.tsx` + public `/ubd/:slug` + `/ubl/:slugWithVersion`
- [ ] 4.4 — Data wiring verified end-to-end (migrations applied → edge fn callable → Context reads/writes work)
- [ ] 4.5 — Verification: build, TS clean, console clean, browser walkthrough
- [ ] 4.6 — AI Self-Test (optional)
- [ ] 🔥 ROAST GATE 4

---

## PHASE 5: POLISH `[░░░░░░░░░░]` 0%

- [ ] First-holon run: Sasha dogfoods v2.0 end-to-end on his own business. Every artifact through at least 2 Improve iterations. Landing Page published.
- [ ] Second-holon runs: Oyi / Sergey / Karime / Sandra / Alexa / Kirill. Each leaves with a Landing Page live + Golden DM they actually send within 48h.
- [ ] Ship criterion: a founder can go from "top talent named" → "Landing Page published + Golden DM sent" in one session.
- [ ] 🔥 ROAST GATE 5

**Cost envelope for polish phase (6 founder runs):** ~$0.15–$0.50 total on Gemini 2.5 Flash.

---

## Supporting spec files

- [unique-business-builder_product_spec.md](./unique-business-builder_product_spec.md) — Phase 1 output
- [unique-business-builder_architecture_spec.md](./unique-business-builder_architecture_spec.md) — Phase 2 output
- [unique-business-builder_ui_spec.md](./unique-business-builder_ui_spec.md) — Phase 3 output
- [improve_roast_prompt.md](./improve_roast_prompt.md) — The Improve template
- [artifact_prompts_spec.md](./artifact_prompts_spec.md) — 18 artifact generation + specificity criteria
- [schema_delta.md](./schema_delta.md) — Supabase schema changes needed

---

**Next action:** Phase 2.1 — Module Boundaries. Define entry, exit, data in/out for `src/modules/unique-business-builder/`. Produce `unique-business-builder_architecture_spec.md` before any code.
