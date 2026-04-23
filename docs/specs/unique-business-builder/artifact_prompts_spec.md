# Artifact Prompts Spec — 17 artifacts

*Per-artifact generation input, output shape, and precision definition. Injected into both `generate-artifact` and `improve-artifact` edge functions.*

**Two edge functions, both parametrized by `artifact_key`:**
- `generate-artifact` — first draft from seed context (ZoG + any locked siblings)
- `improve-artifact` — applies roast + iterates (see `improve_roast_prompt.md`)

---

## Phase A — Canvas (7 artifacts)

### 1. `uniqueness` — Talent Sentence

| | |
|---|---|
| **What** | One sentence naming what the founder actually does when they're in their zone of genius. |
| **Input** | ZoG snapshot (top 3 talents, archetype, core pattern, flywheel action) |
| **Output shape** | `{ sentence: string, key_phrase: string, why_this_names_it: string }` |
| **Precision 9.5+ means** | The founder reads it and says "that names what I've been doing my whole life." No insider jargon. Would land on a stranger. |
| **Source** | `unique_business_playbook.md` (Copernican Inversion · Naming the gift) |

### 2. `myth` — The Photon of Truth

| | |
|---|---|
| **What** | One sentence that can't be broken down further. The atom. If true, everything downstream is self-evident. |
| **Input** | `uniqueness` + ZoG pattern |
| **Output shape** | `{ photon: string, three_layers: { attack: string, reframe: string, invitation: string } }` |
| **Precision 9.5+ means** | The sentence survives the irreducibility test — can't be split into two. The three layers hold. At least one feels inevitable after reading. |
| **Source** | `marketing_playbook.md` Phase 0 Step 0.4 (Myth as Resonance Filter) |

### 3. `tribe` — Who This Is For

| | |
|---|---|
| **What** | Situational identity (not job title). The person described so precisely they can't NOT recognize themselves. |
| **Input** | `uniqueness` + `myth` |
| **Output shape** | `{ situational_description: string, lived_experience_markers: string[], anti_tribe: string }` |
| **Precision 9.5+ means** | Uses zero identity labels ("founder", "entrepreneur", "coach"). Reads like overhearing someone describe their 2am state. Anti-tribe named cleanly. |
| **Source** | `marketing_playbook.md` Situational Identity Principle |

### 4. `pain` — The 5-Layer Pain

| | |
|---|---|
| **What** | Forensic articulation of where the tribe is in Point A — described so precisely they feel seen, not sold to. |
| **Input** | `tribe` + `myth` |
| **Output shape** | `{ pressure: string, consequences: string, stakes: string, cost_of_inaction: string, root_cause: string }` |
| **Precision 9.5+ means** | Tribe reader winces at pressure. Feels the consequences in body. Cost of inaction is time-bound. Root cause is the thing they can't name themselves. |
| **Source** | `marketing_playbook.md` Phase 4 ICP + Controlled Collapse (Confabulation layer) |

### 5. `promise` — Transformational Promise

| | |
|---|---|
| **What** | Point A → Point B stated as one deliverable sentence. Exact inverse of pain. |
| **Input** | `pain` + `myth` + `uniqueness` |
| **Output shape** | `{ point_a: string, point_b: string, promise_sentence: string, guarantee?: string }` |
| **Precision 9.5+ means** | Promise sentence = exact inverse of pain at same precision. The transformational result feels inevitable. If guarantee present, it's time-bound and specific. |
| **Source** | `integrated_product_building_workflow.md` Bridge Step 1 |

### 6. `lead_magnet` — The Gift Before Payment

| | |
|---|---|
| **What** | Free artifact that delivers real recognition — not teaser, not preview. Entry into the value ladder. |
| **Input** | `promise` + `tribe` + `uniqueness` |
| **Output shape** | `{ format: string, artifact_description: string, recognition_trigger: string, sovereignty_respect: string }` |
| **Precision 9.5+ means** | A stranger could take it and benefit without ever buying. Creates felt precision gap. Doesn't withhold. Sovereignty-respecting CTA. |
| **Source** | `marketing_playbook.md` Playbook-as-Lead-Magnet Pattern |

### 7. `value_ladder` — The Rungs

| | |
|---|---|
| **What** | The tier structure: free → low → mid → high → (slack adjuster). Named in universal language. |
| **Input** | `lead_magnet` + `promise` + `uniqueness` |
| **Output shape** | `{ rungs: Array<{ name: string, price: number \| 'free', outcome: string, acquisition_room: number }>, slack_adjuster?: { price, description } }` |
| **Precision 9.5+ means** | Each rung has an outcome the tribe wants in their own language. Prices "reassuringly expensive" at each tier. Acquisition room numerically plausible. Slack adjuster if present is anchor, not volume. |
| **Source** | `marketing_playbook.md` Kennedy pricing lineage (Transaction Size · Reassuringly Expensive · Slack Adjuster) |

---

## Phase B — Session bridge (1 compound artifact)

### 8. `session_bridge` — 1st Session Design

| | |
|---|---|
| **What** | Compound: Transformational Result (A→B sentence) + Trinity Sub-Results (3 felt wins) + 1st Session Design (guaranteed results + silhouette). |
| **Input** | `pain` + `promise` + `uniqueness` + `value_ladder` |
| **Output shape** | `{ transformational_result: string, trinity_sub_results: Array<{ mini_a: string, mini_b: string, felt_win_name: string }>, first_session: { guaranteed_results: string[], silhouette: string, universal_language_check: string } }` |
| **Precision 9.5+ means** | Trinity has 3 clear mini A→B transits. Guaranteed results named in universal language (no insider jargon). Silhouette is palpable but not overwhelming. Founder can deliver this tomorrow. |
| **Source** | `integrated_product_building_workflow.md` "The Bridge: Pain + Promise → 1st Session" |

---

## Phase C — Market path (9 artifacts)

### 9. `core_belief` — Marketing Pillar 1

| | |
|---|---|
| **Input** | `myth` + `uniqueness` |
| **Output** | `{ we_believe_statement: string, what_we_are_for: string, what_we_are_against: string, filter_test: string }` |
| **Precision 9.5+** | The "We believe..." sentence passes Steve Jobs filter (values, not features). Filter test is executable (can be applied to any decision). |
| **Source** | `marketing_playbook.md` Phase 0 |

### 10. `packaging` — Marketing Pillar 2

| | |
|---|---|
| **Input** | `value_ladder` + `promise` + `core_belief` |
| **Output** | `{ format_ladder: Array<{ tier: string, format: string, artifact: string }>, one_liner: string }` |
| **Precision 9.5+** | Each format tier has a concrete artifact the buyer holds. One-liner: `[Product] helps [who] [do what] so they can [transformation]`. |
| **Source** | `marketing_playbook.md` Phase 1 |

### 11. `frictionless_purchase` — Marketing Pillar 3

| | |
|---|---|
| **Input** | `packaging` + `pain` + `promise` |
| **Output** | `{ price_anchoring: { dissimilar_anchor: string }, objections_answered: Array<{ objection: string, answer: string }>, one_click_mechanism: string, controlled_collapse_elements: { consequence_block: string, non_optionality_frame: string, micro_commitment: string, identity_shift_cta: string } }` |
| **Precision 9.5+** | Anchor is dissimilar-category (Kennedy). All top-3 objections pre-answered. One-click mechanism concrete (Stripe link / Cal.com / etc.). Collapse elements all present. |
| **Source** | `marketing_playbook.md` Phase 2 + Controlled Collapse Conversion Pattern + Anchoring Corollary |

### 12. `reach` — Distribution Pillar 1

| | |
|---|---|
| **Input** | `tribe` + `myth` + `uniqueness` |
| **Output** | `{ upstream_partners: Array<{ type: string, named_examples: string[], what_they_deliver: string, their_wall: string }>, content_frequency: string, cold_start_path: string }` |
| **Precision 9.5+** | At least 3 upstream partner types named with concrete examples. Content frequency = signal-first (Dual-Frequency principle). Cold-start path realistic per Part V of distribution_playbook. |
| **Source** | `distribution_playbook.md` Myth-Driven Distribution + Partnership Model + Dual-Frequency |

### 13. `delivery` — Distribution Pillar 2

| | |
|---|---|
| **Input** | `packaging` + `value_ladder` |
| **Output** | `{ lean_stack: { landing: string, payment: string, delivery: string, warm_channel: string, passive_channel: string }, friction_audit: { discovery_to_landing, landing_to_decision, decision_to_payment, payment_to_access } }` |
| **Precision 9.5+** | Lean stack: 5 concrete tools/URLs named. Friction audit: each step has a fix, not just a problem. |
| **Source** | `distribution_playbook.md` Friction section |

### 14. `spread` — Distribution Pillar 3

| | |
|---|---|
| **Input** | `tribe` + `lead_magnet` + `packaging` |
| **Output** | `{ shareable_output: string, referral_mechanics: string, viral_coefficient: { algorithmic_signals: string[], expected_amplification: string }, curiosity_gap_implementation: string }` |
| **Precision 9.5+** | Shareable output is personal (not branded), curiosity-gap enabled. Referral threshold (satisfaction ≠ enthusiasm — Kennedy) named. Algorithmic signals listed. |
| **Source** | `marketing_playbook.md` Curiosity Gap Sharing + `communications_playbook.md` Referral Threshold |

### 15. `surface_inventory` — Communications Artifact 1

| | |
|---|---|
| **Input** | (user data — manual entry with AI suggestions) |
| **Output** | `{ surfaces: Array<{ name: string, subscriber_count: number, tier: 'static_billboard' \| 'warm_broadcast' \| 'targeted_strike', leverage_score: number, action_needed: string }> }` |
| **Precision 9.5+** | All active surfaces inventoried. Each tiered. Leverage Score = clout ÷ energy. Action needed concrete (e.g., "update LinkedIn banner"). |
| **Source** | `communications_playbook.md` §1 + Digital Surface Holomap |

### 16. `tuning_fork` — Communications Artifact 2

| | |
|---|---|
| **Input** | `myth` + `pain` + `uniqueness` + `promise` |
| **Output** | `{ tuning_fork_text: string, three_beats: { declaration: string, credibility: string, philosophy_gift: string }, language: 'ru' \| 'en' \| 'both' }` |
| **Precision 9.5+** | Three beats present. No CTA — URL IS the gift. Declaration is life update, not launch announcement. Founder reads aloud and says "yes, that's what I'd say." |
| **Source** | `communications_playbook.md` §3 + Domain 65 (Epicenter Broadcast) |

### 17. `golden_dm` — Communications Artifact 3

| | |
|---|---|
| **Input** | `tuning_fork` + `tribe` + `pain` + (optional: specific recipient context) |
| **Output** | `{ golden_dm_text: string, dinner_table_test_notes: string, purity_check: { fear_based: boolean, scarcity_manipulation: boolean, founders_voice: boolean, gift_or_extraction: 'gift' \| 'extraction' } }` |
| **Precision 9.5+** | Passes Dinner Table Test. Passes all 5 Purity Check criteria. Reads as founder's voice (not AI-generated slop). Feels good to send even with zero response expected. |
| **Source** | `communications_playbook.md` §5 + Golden DM Handwriting Principle (!! — AI drafts the structure, founder edits before sending) |

**⚠️ Golden DM special rule:** Per the Golden DM Handwriting Principle, the FINAL message sent to a real person must be written by the founder. This artifact generates the *structure and seed* — but the DossierScreen explicitly prompts the founder to personalize before sending. AI drafts. Founder ships.

---

## Phase D — Crystallization (1 composite)

### 18. `dossier` — The Unique Business Dossier

| | |
|---|---|
| **What** | One-page composed rendering of all 17 artifacts. Shareable URL, exportable. |
| **Input** | All 17 artifacts at precision ≥ 8.0 (high-stakes 4 at ≥ 9.5) |
| **Output shape** | `{ slug: string, rendered_html: string, precision_avg: number, high_stakes_check: { myth: number, pain: number, promise: number, golden_dm: number }, published_at: timestamp }` |
| **Not improved separately** | Dossier is auto-composed, not iterated. Improve flows back to individual artifacts. |
| **Source** | All 5 playbooks converge here |

---

## Prompt injection pattern (per edge function)

For `improve-artifact`, the block from `improve_roast_prompt.md` is fixed. The artifact-specific precision bar is injected from the table above. Example:

```
PRECISION BAR FOR myth:
{
  "definition": "One sentence that can't be broken down further. The atom. If true, everything downstream is self-evident.",
  "9.5_criteria": [
    "Sentence survives irreducibility test — cannot be split into two",
    "Three layers (attack/reframe/invitation) hold independently",
    "At least one layer feels inevitable after reading"
  ],
  "source": "marketing_playbook.md Phase 0 Step 0.4"
}
```

This block is stored per-artifact as JSON in `docs/specs/unique-business-builder/precision_bars.json` (Phase 2 deliverable) — keeping content out of code and maintainable as playbooks evolve.
