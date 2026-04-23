# Unique Business Builder v2.0 — Product Spec

*Phase 1 output · 2026-04-23 · Status: Phase 1 COMPLETE · Phase 2 (Architecture) ready to start*

---

## Hierarchy of source truth

```
CONSTITUTION      /playbook  →  unique_business_playbook.md
                  The master playbook. Supreme authority. If a derivation
                  conflicts with the constitution, the constitution wins.

FEDERAL LAWS      Domain playbooks in docs/03-playbooks/
                  ├── integrated_product_building_workflow.md (how to build)
                  ├── marketing_playbook.md                   (3 pillars)
                  ├── distribution_playbook.md                (3 pillars)
                  └── communications_playbook.md              (surfaces, Tuning Fork, Golden DM)

THIS SPEC         derivation of constitution + federal laws for one module.
                  If the playbooks evolve, this spec must re-derive.
```

> **Predecessor:** v1.0 Product Builder at `src/modules/product-builder/` — kept live, not migrated.
> **This module:** `src/modules/unique-business-builder/` — new duplicate, built from the constitution.
> **AI runtime:** `google/gemini-2.5-flash` via Lovable AI Gateway. ~$0.02–$0.06 per full Dossier pass.

---

## The Core Shift (v1.0 → v2.0)

| | v1.0 Product Builder | v2.0 Unique Business Builder |
|---|---|---|
| **Seed** | Excalibur (pre-built business) | ZoG top talent |
| **Spine** | 7-step linear wizard | 18-artifact holonic canvas |
| **Refine** | 3 UI-stub buttons, no pipeline | **Improve** button per artifact — 27-perspective holonic roast + auto-iteration |
| **Feedback metric** | Unmeasured | **Specificity** — monotonic, versioned, always increases |
| **Versioning** | Snapshot of WIP state | Every Improve creates a new version. Nothing ever lost. Paramount. |
| **Scope** | Product only | Product + 1st Session + Marketing + Distribution + Communications |
| **Output** | Marketplace landing page | **Versioned Landing Page + composed Dossier URL** |

---

## Specificity (the paramount concept)

**Specificity** replaces "precision" in v2.0 vocabulary. The difference matters:

| Precision (old framing) | **Specificity (v2.0 framing)** |
|---|---|
| Binary — hit the target or not | Continuous — there is no ceiling |
| Implies a threshold (9.5+) | Monotonic — each iteration INCREASES it |
| "Done" state | "Enough-for-now" state; can always go deeper |
| Lost when you iterate | **Always versioned. Every version preserved.** |

**The invariant:** if an Improve iteration cannot increase specificity, the system returns `diminishing_returns: true` and does NOT save a new version. A version is only created when specificity actually rose.

**The scale:** 0–10, float. Typical starting draft ≈ 5–7. Two or three Improve passes push it to 8.5–9.5+. Further iterations add detail indefinitely — Sasha's own Myth artifact may sit at 9.4 today and reach 9.7 after one more pass next week.

**Why versioning is paramount:** the founder can always see v1 → v2 → v3. The lineage is the memory of how the business sharpened itself. Never rewrite in place.

---

## 1. Input (5 elements)

| # | Element | Details |
|---|---------|---------|
| 1 | **ICP** | Founder with top talent named (ZoG done) but no structured business. Can name the gift but can't price, pitch, sell, distribute. |
| 2 | **Transformation** | A → B: "I have a gift" → "I have a Dossier with a Landing Page and a Golden DM ready to send today." |
| 3 | **Pain of Point A** | Every conversation = explaining from scratch. Pricing arbitrary. Patterns don't get paid. The jar can't read its own label. |
| 4 | **Dream Outcome** | Business on one page. First 10 moves obvious. Tuning Fork already written. Landing Page live. |
| 5 | **Action** | Click through 18 artifacts. Press **Improve** until specificity feels enough. Lock. Continue. Publish Landing Page + Dossier. |

---

## 1.1 Master Result

**From named gift to published Landing Page + Golden DM in one guided click-through session.**

- **Point A:** Founder has top talent named (ZoG) but no structured unique business around it.
- **Point B:** Founder has 18-artifact canvas + 1st session design + versioned Landing Page live at a public URL + Golden DM ready to send.

A founder who started at 10am can share their Landing Page and send their first Golden DM by 12:30pm.

---

## 1.2 Sub-Results

12 user-felt wins, grouped into 4 phases, mapped to 18 artifacts + 1 composed Dossier view.

### Phase A — Canvas (7 wins · 7 artifacts)
1. **My gift is named** → `uniqueness`
2. **My myth is clear** → `myth` (photon of truth)
3. **I know who my tribe is** → `tribe`
4. **I know their pain specifically** → `pain`
5. **I know the promise I deliver** → `promise`
6. **I have a lead magnet that converts** → `lead_magnet`
7. **I have a value ladder that makes sense** → `value_ladder`

### Phase B — Session bridge (1 win · 1 compound artifact)
8. **I can deliver my 1st session today** → `session_bridge` (transformational_result + trinity_sub_results + first_session_design)

### Phase C — Market path (3 wins · 9 artifacts)
9. **I know what I believe, how I package it, how the sale happens** → `core_belief` + `packaging` + `frictionless_purchase`
10. **I know where my tribe is, how I deliver, how word spreads** → `reach` + `delivery` + `spread`
11. **I know where to show up and what to send today** → `surface_inventory` + `tuning_fork` + `golden_dm`

### Phase D — Publication (1 win · 1 artifact + 1 composed view)
12. **My business is live** → `landing_page` (versioned, Improve-able, public) + composed `dossier` (auto-generated overview of all 18)

**Sequence:** A → B → C → D. Phase B gated on Pain + Promise locked. Phase C gated on A + B complete. Phase D: `landing_page` becomes improvable once Marketing pillars (Phase C) are locked; Dossier auto-composes any time.

---

## 1.3 Screens

**15 screens total:** 1 overview + 7 canvas + 1 session + 3 compound market + 1 landing page + 1 dossier + 1 improve review (modal/drawer).

| # | Screen | Route | Artifacts shown |
|---|--------|-------|-----------------|
| 1 | CanvasOverviewScreen | `/ubb` | All 18 as cards with specificity + version count + lock status |
| 2 | UniquenessScreen | `/ubb/uniqueness` | `uniqueness` |
| 3 | MythScreen | `/ubb/myth` | `myth` |
| 4 | TribeScreen | `/ubb/tribe` | `tribe` |
| 5 | PainScreen | `/ubb/pain` | `pain` (5-layer) |
| 6 | PromiseScreen | `/ubb/promise` | `promise` |
| 7 | LeadMagnetScreen | `/ubb/lead-magnet` | `lead_magnet` |
| 8 | ValueLadderScreen | `/ubb/value-ladder` | `value_ladder` |
| 9 | SessionBridgeScreen | `/ubb/session` | 3 sub-artifacts stacked |
| 10 | MarketingScreen | `/ubb/marketing` | `core_belief` + `packaging` + `frictionless_purchase` (3 cards) |
| 11 | DistributionScreen | `/ubb/distribution` | `reach` + `delivery` + `spread` (3 cards) |
| 12 | CommunicationsScreen | `/ubb/communications` | `surface_inventory` + `tuning_fork` + `golden_dm` (3 cards) |
| 13 | LandingPageScreen | `/ubb/landing-page` | `landing_page` — preview + Improve + publish controls |
| 14 | DossierScreen | `/ubb/dossier` | Composed view. Shareable URL. Copy-to-clipboard. |
| 15 | ImproveReviewScreen | (drawer/modal) | Diff: before vs after. Roast findings. Specificity delta. Accept / Reject. |

**Why this count:** compound artifacts (Session Bridge, Marketing, Distribution, Communications) share a screen because their sub-artifacts are semantically one piece. Surfacing all 18 as flat screens would create UX freeze ("21 screens to click through?"). The data model stays 18 versioned artifact keys; the surface groups where the playbooks group them.

---

## 1.4 Screen Details (Heart / Mind / Gut)

| Screen | 🫀 Heart | 🧠 Mind | 🔥 Gut (CTA) |
|--------|---------|---------|--------------|
| CanvasOverviewScreen | Grounded. *"My whole business on one canvas."* | Sees all 18, specificity, versions, locks. | "Continue with [first unlocked]" |
| UniquenessScreen | Seen. *"My gift has a name."* | Talent sentence is the spine. | ⚡ Improve · Lock & Continue → |
| MythScreen | Aligned. *"This is what I actually believe."* | Sees the photon of truth. | ⚡ Improve · Lock & Continue → |
| TribeScreen | Clarity. *"These are MY people."* | Self-selection > persuasion. | ⚡ Improve · Lock & Continue → |
| PainScreen | Visceral. *"This is EXACTLY what my tribe carries."* | 5-layer pain structure. | ⚡ Improve · Lock & Continue → |
| PromiseScreen | Bold. *"This is the transformation I guarantee."* | A → B stated cleanly. | ⚡ Improve · Lock & Continue → |
| LeadMagnetScreen | Generous. *"This is what I give before they pay."* | Lead magnet = entry to ladder. | ⚡ Improve · Lock & Continue → |
| ValueLadderScreen | Spacious. *"Free → $555 → $1,111 → slack adjuster."* | Rungs + Kennedy pricing. | ⚡ Improve · Lock & Continue → |
| SessionBridgeScreen | Ready. *"I can deliver this today."* | Trinity + 1st Session design. | ⚡ Improve · Lock & Continue → |
| MarketingScreen | Aligned. *"My values, packaging, one-click sale."* | 3 pillars integrated. | ⚡ Improve · Lock & Continue → |
| DistributionScreen | Activated. *"I know where my people are."* | Reach × Delivery × Spread. | ⚡ Improve · Lock & Continue → |
| CommunicationsScreen | Embodied. *"I know what to send today."* | Surfaces + Tuning Fork + Golden DM. | ⚡ Improve · Lock & Continue → |
| LandingPageScreen | Proud. *"My page is alive."* | Sees live preview, version history, public URL. | ⚡ Improve · Publish v{n} → |
| DossierScreen | Crystallized. *"My business is alive on one page."* | Composed Dossier. | Copy Dossier URL · Send First Golden DM |
| ImproveReviewScreen | Witnessed. *"The roast saw what I couldn't."* | Roast findings, diff, specificity +Δ. | Accept ✓ · Reject ✗ |

---

## 1.5 Extensions

### Artifacts (persistent)
- 18 artifact rows in `user_business_artifacts` — every Improve acceptance creates a **new row** (new version). Old rows never deleted. Never updated in place.
- `artifact_improvements` audit log — every Improve attempt (accept OR reject) recorded with roast findings.
- `unique_business_dossiers` — published Dossier snapshots, versioned by publish event.
- `user_business_artifacts.artifact_key='landing_page'` — rendered Landing Page content, versioned like any other artifact.
- Public Landing Page URL: `/ubl/{slug}-v{n}` or similar (Phase 2 decides exact pattern).
- Public Dossier URL: `/ubd/{slug}`.

### Emotional arc
- **Entry:** mild overwhelm ("18 artifacts?"). Mitigated by progress bar + "one at a time" UX + compound screens.
- **Canvas phase:** momentum — specificity rising is gamified feedback.
- **Session bridge:** relief — "I can deliver this today."
- **Market path:** excitement — "I have infrastructure, not theory."
- **Landing Page:** pride — "My page is live at a URL I can share."
- **Dossier:** crystallization — "My business is real."

### Completion criteria (no hard threshold)
- All 18 artifacts have at least v1 present.
- User's own judgment: "specificity is enough for now" on each.
- Landing Page published at least once (`is_live = true` on a version in `unique_business_dossiers` or equivalent).
- Dossier URL generated and copyable.
- *No artifact is ever "done" — only "enough for this iteration of the business."* The module always invites further Improve.

### Skip paths
- Can skip any artifact → shown as "gap" on Overview + Dossier.
- **Cannot skip:** Uniqueness, Pain, Promise, Landing Page (hard gates — the Dossier doesn't publish without them).
- Can always return to a locked artifact → unlock → Improve → re-lock. Downstream artifacts flagged "may be stale" via `updated_at` comparison.

### Bridges
- **← ZoG:** prerequisite. If no ZoG snapshot, redirect to `/zone-of-genius/entry`.
- **← Excalibur:** optional. If present, Uniqueness draft pre-filled from `zog_snapshots.excalibur_data`.
- **→ v1.0 Product Builder:** `frictionless_purchase` artifact can seed v1.0's landing page flow. One-way handoff.
- **→ Ignite / Cal.com:** Golden DM's CTA can link to `/ignite` booking.

---

## 1.6 Wireframes (mobile-first)

### CanvasOverviewScreen

```
┌────────────────────────────────┐
│ Unique Business Builder        │
│ ●●●●○○○○○○○○○○○○○○  4/18      │
├────────────────────────────────┤
│ 🫀 CANVAS (7)                  │
│ ┌────────────────────────────┐ │
│ │ ✓ Uniqueness    9.7  v3    │ │
│ │ ✓ Myth          9.5  v4    │ │
│ │ ✓ Tribe         9.2  v2    │ │
│ │ ● Pain          8.1  v3 …  │ │
│ │ ○ Promise       —          │ │
│ │ ○ Lead Magnet   —          │ │
│ │ ○ Value Ladder  —          │ │
│ └────────────────────────────┘ │
│                                │
│ 🌉 SESSION BRIDGE              │
│ ○ 1st Session Design           │
│                                │
│ 🛣️ MARKET PATH (9)             │
│ ○ Marketing  ○ Distribution    │
│ ○ Communications               │
│                                │
│ 📣 PUBLICATION                 │
│ ○ Landing Page  · Dossier      │
│                                │
│ ┌────────────────────────────┐ │
│ │   Continue with Pain →     │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

### Generic Artifact Screen (e.g., MythScreen)

```
┌────────────────────────────────┐
│ ← Canvas   Myth   2/18  ●●○    │
├────────────────────────────────┤
│ 🫀 THE PHOTON OF TRUTH         │
│                                │
│ "There exists a venture so     │
│  structurally yours that       │
│  building it IS your personal  │
│  development."                 │
│                                │
│ Specificity:  8.5  (↑ from 7.1)│
│ Versions: v1 → v2 → v3  (3)    │
│                                │
│ ┌────────────────────────────┐ │
│ │      ⚡ IMPROVE            │ │
│ └────────────────────────────┘ │
│                                │
│ ▸ Why this matters             │
│ ▸ Version history (3)          │
│ ▸ Specificity criteria         │
│                                │
│ ┌────────────────────────────┐ │
│ │   Lock & Continue →        │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

### ImproveReviewScreen (drawer)

```
┌────────────────────────────────┐
│ ⚡ Improvement proposed         │
├────────────────────────────────┤
│ Specificity: 8.5 → 9.1  (+0.6) │
│                                │
│ WHAT THE ROAST FOUND:          │
│ • LL — generic; tribe needs    │
│   the lived-body phrasing      │
│ • 27 — irreversible action     │
│   not named in current version │
│                                │
│ WHAT CHANGED:                  │
│ "Rewrote the invitation beat   │
│  from abstract to visceral."   │
│                                │
│ BEFORE                         │
│ ┌────────────────────────────┐ │
│ │ [old content]              │ │
│ └────────────────────────────┘ │
│ AFTER                          │
│ ┌────────────────────────────┐ │
│ │ [new content]  ● highlighted│ │
│ └────────────────────────────┘ │
│                                │
│ ┌──────────────┐ ┌───────────┐ │
│ │  ✗ Reject    │ │ ✓ Accept  │ │
│ └──────────────┘ └───────────┘ │
└────────────────────────────────┘
```

### LandingPageScreen

```
┌────────────────────────────────┐
│ ← Canvas  Landing Page  17/18  │
├────────────────────────────────┤
│ 🫀 YOUR PUBLIC SURFACE         │
│                                │
│ ┌────────────────────────────┐ │
│ │   [Live preview iframe]    │ │
│ │   /ubl/alex-v5             │ │
│ └────────────────────────────┘ │
│                                │
│ Specificity: 8.9   v5          │
│ Published: v4 (live 2d ago)    │
│                                │
│ ┌────────────────────────────┐ │
│ │      ⚡ IMPROVE            │ │
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │   📣 Publish v5 →          │ │
│ └────────────────────────────┘ │
│                                │
│ ▸ Version history (5)          │
│ ▸ Published versions (1)       │
└────────────────────────────────┘
```

### DossierScreen

```
┌────────────────────────────────┐
│ Your Unique Business Dossier   │
│ Specificity avg: 9.1           │
├────────────────────────────────┤
│ [Your photo]                   │
│                                │
│ ─ UNIQUENESS ─                 │
│ [talent sentence]              │
│                                │
│ ─ MYTH ─                       │
│ [photon of truth]              │
│                                │
│ ─ TRIBE · PAIN · PROMISE ─     │
│ ...                            │
│                                │
│ ─ 1ST SESSION ─                │
│ ...                            │
│                                │
│ ─ MARKET PATH ─                │
│ ...                            │
│                                │
│ ─ LANDING PAGE ─ /ubl/alex-v5  │
│ [open live →]                  │
│                                │
│ ─ YOUR GOLDEN DM ─             │
│ "..."                          │
│                                │
│ ┌────────────────────────────┐ │
│ │  📋 Copy Dossier URL       │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │  📨 Send First Golden DM   │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

---

## The Improve Loop

Every artifact screen has one button: **⚡ Improve**. Pure button. No note field. No parameters. (Confirmed Phase 1 decision.)

**On click:**
1. Client calls `improve-artifact` edge function with: current artifact + sibling locked artifacts + ZoG context + up to 3 prior versions.
2. Edge function calls `openai/gpt-5.2` via Lovable AI Gateway with the 27-perspective roast prompt (see `improve_roast_prompt.md`).
3. Model internally applies: 4 quadrants × 3 depths + 13th + depth check + 27th crystallization.
4. Returns: improved content, roast findings, what changed, new specificity score + delta, crystallized action, `diminishing_returns` flag.
5. UI opens **ImproveReviewScreen** showing diff + findings + specificity delta.
6. User clicks **Accept** → new row in `user_business_artifacts` (v_{n+1}) + log row in `artifact_improvements`. Or **Reject** → log row only (no version created).
7. Overview refreshes.

**Monotonic invariant:**
- If `specificity_delta < 0` → model returns `diminishing_returns: true`. No new version offered. UI shows: *"Couldn't increase specificity this pass. This version may be at its current ceiling — try again later after surrounding artifacts sharpen."*
- If `specificity_delta ≥ 0` → new version proposed. User decides.

**Error handling (Lovable AI Gateway):**
- 402 Payment Required (balance exhausted) → graceful toast: *"AI credit limit reached. Top up in Settings → Plans & Credits, then retry."* No version created.
- Invalid JSON / model error → retry once. On second failure, surface generic error. No version created.

**Why "Improve" not "Refine":** Refine can go sideways. Improve, by definition, goes up. The term carries the invariant.

---

## Resolved decisions (from Roast Gate 1 with Sasha)

| Question | Resolution |
|----------|-----------|
| 18 artifacts internal, surface as fewer screens? | Yes — 18 artifact keys, 15 screens (compound where playbooks compound). |
| Specificity threshold (uniform or tiered)? | **No threshold.** Specificity is monotonic. Each Improve must raise it. Versioned. |
| Improve button: pure or with note field? | **Pure button.** Holonic roast is baked in. No user prompting needed. |
| Terminal output: Dossier only, or also Landing Page? | **Both.** Landing Page is 18th artifact — improvable, versioned, publishable. Dossier = composed view of all 18. |

---

## What Phase 2 (Architecture) decides

- Route structure (flat `/ubb/*` vs nested)
- Auth guards (likely: ZoG snapshot required)
- State management (Context vs Zustand — v1.0 uses Context)
- Edge function signatures (drafted in `artifact_prompts_spec.md`)
- Exact publication URL patterns (`/ubl/{slug}-v{n}`? `/ubd/{slug}`?)
- Whether v1.0's `marketplace_products` table is reused or bypassed for Landing Page publishing
- Lovable AI Gateway 402 handling pattern (consistent across all v2.0 edge functions)

See `unique-business-builder_tracker.md` Phase 2 section.
