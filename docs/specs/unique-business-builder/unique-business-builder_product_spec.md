# Unique Business Builder v2.0 — Product Spec

*Phase 1 output · 2026-04-23 · Status: awaiting Roast Gate 1*

> **Source of truth:** the 5 playbooks (unique_business / integrated_product_building / marketing / distribution / communications).
> **Predecessor:** v1.0 Product Builder at `src/modules/product-builder/` — kept live, not migrated.
> **This module:** `src/modules/unique-business-builder/` — new duplicate, built from playbooks.

---

## The Core Shift (v1.0 → v2.0)

| | v1.0 Product Builder | v2.0 Unique Business Builder |
|---|---|---|
| **Seed** | Excalibur (pre-built business) | ZoG top talent |
| **Spine** | 7-step linear wizard | 17-artifact holonic canvas |
| **Output** | Marketplace landing page | Unique Business Dossier (canvas + session + market path + Golden DM) |
| **Refine** | 3 sharpen buttons (UI stubs only) | "Improve" per artifact — 27-perspective holonic roast with auto-iteration |
| **Precision** | Unmeasured | Scored 0–10, target ≥ 9.5 |
| **Scope** | Product only | Product + 1st Session + Marketing + Distribution + Communications |

The landing page becomes one section inside the Dossier, not the destination.

---

## 1. Input (5 elements)

| # | Element | Details |
|---|---------|---------|
| 1 | **ICP** | Founder with top talent named (ZoG done) but no structured business. Can name the gift but can't price, pitch, sell, distribute. |
| 2 | **Transformation** | A → B: "I have a gift" → "I have a full Dossier with a Golden DM ready to send today." |
| 3 | **Pain of Point A** | Every conversation = explaining from scratch. Pricing arbitrary. Patterns don't get paid. Work stays local. The jar can't read its own label. |
| 4 | **Dream Outcome** | Business on one page. First 10 moves obvious. Tuning Fork already written. Precision gap named before walking into any conversation. |
| 5 | **Action** | Click through 17 artifacts. Press **Improve** until precision ≥ 9.5. Lock. Continue. End: shareable Dossier. |

---

## 1.1 Master Result

**From named gift to Golden DM in one guided click-through session.**

- **Point A:** Founder has top talent named but no structured unique business.
- **Point B:** Founder has 17-artifact Dossier + 1st session designed + Golden DM sendable today.

*Precision bar for this Master Result:* a founder who started the session at 10am can send their first Golden DM by 12:30pm — because every artifact has been through the Improve loop until 9.5+, and the Golden DM is the last artifact in the chain.

---

## 1.2 Sub-Results

12 user-felt wins, grouped into 4 phases, mapped to 17 artifacts.

### Phase A — Canvas (7 wins · 7 artifacts)
1. **My gift is named** → `uniqueness`
2. **My myth is clear (the photon of truth)** → `myth`
3. **I know who my tribe is** → `tribe`
4. **I know their pain at 9.5+ precision** → `pain`
5. **I know the promise I deliver** → `promise`
6. **I have a lead magnet that converts** → `lead_magnet`
7. **I have a value ladder that makes sense** → `value_ladder`

### Phase B — Session bridge (1 win · 1 compound artifact)
8. **I can deliver my 1st session today** → `session_bridge` (contains: transformational_result + trinity_sub_results + first_session_design)

### Phase C — Market path (3 wins · 9 artifacts)
9. **I know what I believe, how I package it, how the sale happens** → `core_belief` + `packaging` + `frictionless_purchase`
10. **I know where my tribe is, how I deliver, how word spreads** → `reach` + `delivery` + `spread`
11. **I know exactly where to show up and what to send today** → `surface_inventory` + `tuning_fork` + `golden_dm`

### Phase D — Crystallization (1 win · 1 composite)
12. **My business is alive on one page** → `dossier` (composed from the 17 above)

**Sequence:** Phase A → B → C → D. Phase B is gated on Pain + Promise ≥ 9.5. Phase C is gated on A + B complete. Phase D is auto-composed once all are locked.

---

## 1.3 Screens

14 screens. 1 overview + 12 artifact + 1 diff review (modal) + 1 dossier.

| # | Screen | Route | Artifacts shown |
|---|--------|-------|-----------------|
| 1 | CanvasOverviewScreen | `/ubb` | All 17 as cards with precision + lock status |
| 2 | UniquenessScreen | `/ubb/uniqueness` | `uniqueness` |
| 3 | MythScreen | `/ubb/myth` | `myth` |
| 4 | TribeScreen | `/ubb/tribe` | `tribe` |
| 5 | PainScreen | `/ubb/pain` | `pain` (5-layer structure) |
| 6 | PromiseScreen | `/ubb/promise` | `promise` |
| 7 | LeadMagnetScreen | `/ubb/lead-magnet` | `lead_magnet` |
| 8 | ValueLadderScreen | `/ubb/value-ladder` | `value_ladder` |
| 9 | SessionBridgeScreen | `/ubb/session` | `transformational_result` + `trinity_sub_results` + `first_session_design` (stacked) |
| 10 | MarketingScreen | `/ubb/marketing` | `core_belief` + `packaging` + `frictionless_purchase` (3 cards) |
| 11 | DistributionScreen | `/ubb/distribution` | `reach` + `delivery` + `spread` (3 cards) |
| 12 | CommunicationsScreen | `/ubb/communications` | `surface_inventory` + `tuning_fork` + `golden_dm` (3 cards) |
| 13 | ImproveReviewScreen | (drawer/modal) | Diff: before vs after. Roast findings. Accept / Reject. |
| 14 | DossierScreen | `/ubb/dossier` | The composed output. Shareable URL. Copy-to-clipboard. |

---

## 1.4 Screen Details (Heart / Mind / Gut)

| Screen | 🫀 Heart | 🧠 Mind | 🔥 Gut (CTA) |
|--------|---------|---------|--------------|
| CanvasOverviewScreen | Grounded. *"My whole business on one canvas."* | Sees all 17 artifacts, lock status, precision. | "Continue with [first unlocked]" |
| UniquenessScreen | Seen. *"My gift has a name."* | Understands the talent sentence is the spine of everything downstream. | ⚡ Improve · Lock & Continue → |
| MythScreen | Aligned. *"This is what I actually believe."* | Sees the photon of truth (irreducible statement). | ⚡ Improve · Lock & Continue → |
| TribeScreen | Clarity. *"These are MY people."* | Understands self-selection > persuasion. | ⚡ Improve · Lock & Continue → |
| PainScreen | Visceral. *"This is EXACTLY what my tribe carries."* | Sees 5-layer pain (pressure · consequences · stakes · cost of inaction · root cause). | ⚡ Improve · Lock & Continue → |
| PromiseScreen | Bold. *"This is the transformation I guarantee."* | Sees A → B at 9.5+ precision. | ⚡ Improve · Lock & Continue → |
| LeadMagnetScreen | Generous. *"This is what I give before they pay."* | Understands lead magnet = entry into value ladder. | ⚡ Improve · Lock & Continue → |
| ValueLadderScreen | Spacious. *"Free → $555 → $1,111 → slack adjuster."* | Sees rungs + transaction-size logic (Kennedy). | ⚡ Improve · Lock & Continue → |
| SessionBridgeScreen | Ready. *"I can deliver this session today."* | Sees Pain → Promise → Trinity Sub-Results → 1st Session design. | ⚡ Improve · Lock & Continue → |
| MarketingScreen | Aligned. *"My values, my packaging, my one-click purchase."* | 3 pillars as one integrated frame. | ⚡ Improve · Lock & Continue → |
| DistributionScreen | Activated. *"I know where my people are."* | Reach × Delivery × Spread as one system. | ⚡ Improve · Lock & Continue → |
| CommunicationsScreen | Embodied. *"I know what to send today."* | Surface inventory + Tuning Fork + Golden DM. | ⚡ Improve · Lock & Continue → |
| ImproveReviewScreen | Witnessed. *"The roast found what I couldn't see."* | Reads roast findings, diff, reasoning. | Accept ✓ · Reject ✗ |
| DossierScreen | Crystallized. *"My business is alive on one page."* | Sees the composed Dossier. | Copy Dossier URL · Send First Golden DM |

---

## 1.5 Extensions

### Artifacts (persistent)
- 17 artifact rows in `user_business_artifacts` (versioned, with precision scores)
- Roast history per artifact (in `artifact_improvements` — see schema_delta)
- Final composed Dossier (computed at request, or materialized on publish)
- Shareable Dossier URL (pattern: `/ubd/{slug}`)

### Emotional arc
- **Entry:** mild overwhelm ("17 artifacts?"). Mitigated by progress bar + "one at a time" UX.
- **Canvas phase:** momentum — each win compounds. Precision scores create gamified feedback.
- **Session bridge:** relief — "I can actually deliver this today."
- **Market path:** excitement — "I have infrastructure, not just theory."
- **Dossier:** crystallization — "My business is real. I can send it."

### Completion criteria
- All 17 artifacts present with precision ≥ 8.0.
- At least 12/17 at precision ≥ 9.0.
- **The high-stakes four** — Myth, Pain, Promise, Golden DM — at precision ≥ 9.5.
- Dossier generated.

### Skip paths
- Can skip any artifact → shown as "gap" on Dossier with red marker.
- **Cannot skip:** Uniqueness, Pain, Promise (hard gates — everything downstream is meaningless without them).
- Can always return to a locked artifact to unlock and re-improve. Downstream artifacts flagged "may be stale" until re-locked.

### Bridges
- **← ZoG:** prerequisite. If user has no ZoG snapshot, redirect to `/zone-of-genius/entry`.
- **← Excalibur:** optional. If present, Uniqueness draft pre-filled.
- **→ v1.0 Product Builder:** Frictionless Purchase artifact can seed v1.0's landing page generation (one-way handoff).
- **→ Ignite / Cal.com:** Golden DM's CTA can link to `/ignite` booking.

---

## 1.6 Wireframes (3 key screens, mobile-first)

### Screen 1: CanvasOverviewScreen

```
┌────────────────────────────────┐
│ Unique Business Builder        │
│ ● ● ● ● ○ ○ ○ ○ ○ ○ ○ ○ 4/17  │
├────────────────────────────────┤
│                                │
│ 🫀 CANVAS (7)                  │
│ ┌────────────────────────────┐ │
│ │ ✓ Uniqueness       9.7/10  │ │
│ │ ✓ Myth             9.5/10  │ │
│ │ ✓ Tribe            9.2/10  │ │
│ │ ● Pain             8.1/10  │ │  ← in progress
│ │ ○ Promise          ─       │ │  ← not started
│ │ ○ Lead Magnet      ─       │ │
│ │ ○ Value Ladder     ─       │ │
│ └────────────────────────────┘ │
│                                │
│ 🌉 SESSION BRIDGE              │
│ ○ 1st Session Design           │
│                                │
│ 🛣️ MARKET PATH (9)             │
│ ○ Marketing  ○ Distribution    │
│ ○ Communications               │
│                                │
│ ┌────────────────────────────┐ │
│ │   Continue with Pain →     │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

### Screen 2: Generic Artifact Screen (e.g. MythScreen)

```
┌────────────────────────────────┐
│ ← Canvas   Myth   2/17  ●●○    │
├────────────────────────────────┤
│                                │
│ 🫀 THE PHOTON OF TRUTH         │
│                                │
│ "There exists a venture so     │
│  structurally yours that       │
│  building it IS your personal  │
│  development."                 │
│                                │
│ Precision: 8.5 / 10            │
│ Version: v2 · 2 improvements   │
│                                │
│ ┌────────────────────────────┐ │
│ │      ⚡ IMPROVE            │ │
│ └────────────────────────────┘ │
│                                │
│ ▸ Why this matters             │
│ ▸ Version history (2)          │
│ ▸ Precision criteria           │
│                                │
│ ┌────────────────────────────┐ │
│ │   Lock & Continue →        │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

### Screen 3: DossierScreen

```
┌────────────────────────────────┐
│ Your Unique Business Dossier   │
│ Precision: 9.4 avg             │
├────────────────────────────────┤
│                                │
│ [Your photo / logo]            │
│                                │
│ ─ UNIQUENESS ─                 │
│ [talent sentence]              │
│                                │
│ ─ MYTH ─                       │
│ [photon of truth]              │
│                                │
│ ─ TRIBE ─ PAIN ─ PROMISE ─     │
│ ...                            │
│                                │
│ ─ 1ST SESSION ─                │
│ ...                            │
│                                │
│ ─ MARKET PATH ─                │
│ ...                            │
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

## The Improve Loop (the capability that changes everything)

Every artifact screen has one button: **⚡ Improve**.

**What happens on click:**
1. UI sends current artifact + all sibling locked artifacts + ZoG context + (optional) user note to `improve-artifact` edge function.
2. Edge function calls Gemini 2.5 Flash with the roast prompt (see `improve_roast_prompt.md`).
3. Gemini internally applies the 27-perspective holonic roast (4 quadrants × 3 depths + 13th + depth check + 27th crystallization).
4. Returns: improved content, roast findings, what changed, new precision score, crystallized action.
5. UI opens ImproveReviewScreen (drawer/modal) showing diff + findings.
6. User clicks Accept → new version saved to `user_business_artifacts` (v_n+1), old version kept. Or Reject → discard, try again.
7. Precision score updates on overview.

**Why this works:** The founder doesn't have to know what to improve. They just press the button. The roast does the seeing; the AI does the rewriting; the founder does the decision.

**When to stop improving:** when precision plateau is hit (delta < 0.2 for 2 cycles) OR artifact reaches 9.5+. System recommends "lock & continue."

---

## Roast findings applied to this spec itself

*27-perspective check on this document:*

- **UL (Essence from inside):** ✅ Matches the playbooks' register and tone. No bureaucratic drift.
- **UR (Essence mechanical):** ✅ 17 artifacts → 14 screens → 12 felt wins → 1 output. Collapses cleanly.
- **LL (Essence tribe):** ⚠️ "17 artifacts" may trigger freeze. Mitigated by progress bar + one-at-a-time + overview-as-map.
- **LR (Essence system at scale):** ✅ Reuses `user_business_artifacts` (versioned), v1.0's edge function pattern. No forking.
- **13th (center holds):** ✅ The center: named gift → Golden DM sent. Every artifact serves that transit.
- **Depth check:** ✅ Essence (what IS) before Implications (how to build). Significance (why 17) stated before the list.
- **27th (crystallization):** The ONE irreversible action → **create `src/modules/unique-business-builder/` and wire `CanvasOverviewScreen` with the 17 artifact slots.** Everything else compounds from that commit.

---

## What this spec explicitly does NOT decide (Phase 2+)

- Route structure (flat `/ubb/*` vs nested)
- Auth guards (likely: `ZoG snapshot required`)
- State management (Context vs Zustand — v1.0 uses Context)
- Visual design (token set in UI Playbook)
- Edge function signatures (shape drafted in `artifact_prompts_spec.md`)
- Dossier rendering (HTML template? PDF? Both?)
- Publish flow (`/ubd/{slug}` mechanics)

These get decided in Roast Gate 1 review + Phase 2.

---

## Open questions for Roast Gate 1

1. **Artifact count.** 17 feels right to me (matches the 3+3+3+1+7 structure of the playbooks). But if the UX risk is real, we can collapse Marketing / Distribution / Communications to 3 compound screens (already the case — see screens 10, 11, 12). Question: keep 17 internal keys but 3 user-facing screens, or surface all 17 discretely?
2. **Precision bar.** 9.5+ for all, or tiered (9.5 for Myth/Pain/Promise/Golden DM, 8.5 for rest)?
3. **"Improve" agency.** Pure button, or button + optional 1-line note ("make it more visceral")?
4. **Terminal output.** Dossier URL as final artifact, or also auto-compose a v1.0 marketplace landing page?

Answer these, we move to Phase 2.
