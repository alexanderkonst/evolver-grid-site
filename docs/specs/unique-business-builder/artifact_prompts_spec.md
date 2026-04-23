# Artifact Prompts Spec — 18 artifacts

*Per-artifact generation input, output shape, and specificity criteria. Injected into `generate-artifact` and `improve-artifact` edge functions.*

**Model:** `google/gemini-2.5-flash` via Lovable AI Gateway.
**Two edge functions, both parametrized by `artifact_key`:**
- `generate-artifact` — produces v1 from seed context (ZoG + any locked siblings)
- `improve-artifact` — applies the 27-perspective roast + iterates (see `improve_roast_prompt.md`)

**Specificity criteria** replace the former "precision 9.5+ means" framing. Each artifact has criteria describing what makes THIS version more distinguishable from a generic version — never a threshold.

---

## Phase A — Canvas (7 artifacts)

### 1. `uniqueness` — Talent Sentence

| | |
|---|---|
| **What** | One sentence naming what the founder actually does in their zone of genius. |
| **Input** | ZoG snapshot (top 3 talents, archetype, core pattern, flywheel action) |
| **Output shape** | `{ sentence: string, key_phrase: string, why_this_names_it: string }` |
| **Specificity rises when** | The sentence couldn't be said about anyone else. No insider jargon. A stranger reads it and immediately sees what the founder does. The key_phrase is irreducible. |
| **Source** | `unique_business_playbook.md` (Copernican Inversion · Naming the gift) |

### 2. `myth` — The Photon of Truth

| | |
|---|---|
| **What** | One sentence that can't be broken down further. The atom. If true, everything downstream is self-evident. |
| **Input** | `uniqueness` + ZoG pattern |
| **Output shape** | `{ photon: string, three_layers: { attack: string, reframe: string, invitation: string } }` |
| **Specificity rises when** | The photon survives the irreducibility test — cannot be split into two. The three layers hold independently. At least one layer feels inevitable after reading. |
| **Source** | `marketing_playbook.md` Phase 0 Step 0.4 (Myth as Resonance Filter) |

### 3. `tribe` — Who This Is For

| | |
|---|---|
| **What** | Situational identity (not job title). The person described so precisely they can't NOT recognize themselves. |
| **Input** | `uniqueness` + `myth` |
| **Output shape** | `{ situational_description: string, lived_experience_markers: string[], anti_tribe: string }` |
| **Specificity rises when** | Zero identity labels ("founder", "entrepreneur", "coach"). Reads like overhearing someone describe their 2am state. Anti-tribe named cleanly. |
| **Source** | `marketing_playbook.md` Situational Identity Principle |

### 4. `pain` — The 5-Layer Pain

| | |
|---|---|
| **What** | Forensic articulation of where the tribe sits in Point A — described so precisely they feel seen, not sold to. |
| **Input** | `tribe` + `myth` |
| **Output shape** | `{ pressure: string, consequences: string, stakes: string, cost_of_inaction: string, root_cause: string }` |
| **Specificity rises when** | Tribe reader winces at pressure. Feels consequences in body. Cost of inaction is time-bound. Root cause is the thing they can't name themselves (confabulation layer). |
| **Source** | `marketing_playbook.md` Phase 4 ICP + Controlled Collapse |

### 5. `promise` — Transformational Promise

| | |
|---|---|
| **What** | Point A → Point B as one deliverable sentence. Exact inverse of pain. |
| **Input** | `pain` + `myth` + `uniqueness` |
| **Output shape** | `{ point_a: string, point_b: string, promise_sentence: string, guarantee?: string }` |
| **Specificity rises when** | Promise sentence = exact inverse of pain at matching detail. Transformational result feels inevitable. If guarantee present, it's time-bound and specific. |
| **Source** | `integrated_product_building_workflow.md` Bridge Step 1 |

### 6. `lead_magnet` — The Gift Before Payment

| | |
|---|---|
| **What** | Free artifact that delivers real recognition — not a teaser. Entry into the value ladder. |
| **Input** | `promise` + `tribe` + `uniqueness` |
| **Output shape** | `{ format: string, artifact_description: string, recognition_trigger: string, sovereignty_respect: string }` |
| **Specificity rises when** | A stranger could take it and benefit without ever buying. Creates felt precision gap. Nothing withheld. Sovereignty-respecting CTA (no pressure). |
| **Source** | `marketing_playbook.md` Playbook-as-Lead-Magnet Pattern |

### 7. `value_ladder` — The Rungs

| | |
|---|---|
| **What** | Tier structure: free → low → mid → high → (slack adjuster). Named in universal language. |
| **Input** | `lead_magnet` + `promise` + `uniqueness` |
| **Output shape** | `{ rungs: Array<{ name: string, price: number \| 'free', outcome: string, acquisition_room: number }>, slack_adjuster?: { price, description } }` |
| **Specificity rises when** | Each rung has an outcome in the tribe's own words. Prices "reassuringly expensive." Acquisition room numerically plausible. Slack adjuster (if present) is anchor, not volume. |
| **Source** | `marketing_playbook.md` Kennedy pricing lineage |

---

## Phase B — Session bridge (1 compound artifact)

### 8. `session_bridge` — 1st Session Design

| | |
|---|---|
| **What** | Compound: Transformational Result (A→B) + Trinity Sub-Results (3 felt wins) + 1st Session Design (guaranteed results + silhouette). |
| **Input** | `pain` + `promise` + `uniqueness` + `value_ladder` |
| **Output shape** | `{ transformational_result: string, trinity_sub_results: Array<{ mini_a: string, mini_b: string, felt_win_name: string }>, first_session: { guaranteed_results: string[], silhouette: string, universal_language_check: string } }` |
| **Specificity rises when** | Trinity has 3 clear mini A→B transits. Guaranteed results in universal language (no insider jargon). Silhouette palpable but not overwhelming. Founder can deliver this tomorrow. |
| **Source** | `integrated_product_building_workflow.md` "The Bridge" |

---

## Phase C — Market path (9 artifacts)

### 9. `core_belief` — Marketing Pillar 1

| | |
|---|---|
| **Input** | `myth` + `uniqueness` |
| **Output** | `{ we_believe_statement: string, what_we_are_for: string, what_we_are_against: string, filter_test: string }` |
| **Specificity rises when** | "We believe..." passes Jobs filter (values, not features). Filter test is executable — can be applied to any marketing decision. |
| **Source** | `marketing_playbook.md` Phase 0 |

### 10. `packaging` — Marketing Pillar 2

| | |
|---|---|
| **Input** | `value_ladder` + `promise` + `core_belief` |
| **Output** | `{ format_ladder: Array<{ tier: string, format: string, artifact: string }>, one_liner: string }` |
| **Specificity rises when** | Each tier has a concrete artifact the buyer holds. One-liner: `[Product] helps [who] [do what] so they can [transformation]`. |
| **Source** | `marketing_playbook.md` Phase 1 |

### 11. `frictionless_purchase` — Marketing Pillar 3

| | |
|---|---|
| **Input** | `packaging` + `pain` + `promise` |
| **Output** | `{ price_anchoring: { dissimilar_anchor: string }, objections_answered: Array<{ objection: string, answer: string }>, one_click_mechanism: string, controlled_collapse_elements: { consequence_block: string, non_optionality_frame: string, micro_commitment: string, identity_shift_cta: string } }` |
| **Specificity rises when** | Anchor is dissimilar-category (Kennedy). All top-3 objections pre-answered. One-click mechanism concrete (Stripe link / Cal.com). All 4 collapse elements present and tied to the specific tribe. |
| **Source** | `marketing_playbook.md` Phase 2 + Controlled Collapse Conversion Pattern + Anchoring Corollary |

### 12. `reach` — Distribution Pillar 1

| | |
|---|---|
| **Input** | `tribe` + `myth` + `uniqueness` |
| **Output** | `{ upstream_partners: Array<{ type: string, named_examples: string[], what_they_deliver: string, their_wall: string }>, content_frequency: string, cold_start_path: string }` |
| **Specificity rises when** | 3+ upstream partner types named with concrete examples. Content frequency = signal-first (Dual-Frequency). Cold-start path realistic per Part V of distribution_playbook. |
| **Source** | `distribution_playbook.md` Myth-Driven Distribution + Partnership Model + Dual-Frequency |

### 13. `delivery` — Distribution Pillar 2

| | |
|---|---|
| **Input** | `packaging` + `value_ladder` |
| **Output** | `{ lean_stack: { landing: string, payment: string, delivery: string, warm_channel: string, passive_channel: string }, friction_audit: { discovery_to_landing, landing_to_decision, decision_to_payment, payment_to_access } }` |
| **Specificity rises when** | Lean stack: 5 concrete tools/URLs named. Friction audit: each step has a concrete fix, not just a problem. |
| **Source** | `distribution_playbook.md` Friction section |

### 14. `spread` — Distribution Pillar 3

| | |
|---|---|
| **Input** | `tribe` + `lead_magnet` + `packaging` |
| **Output** | `{ shareable_output: string, referral_mechanics: string, viral_coefficient: { algorithmic_signals: string[], expected_amplification: string }, curiosity_gap_implementation: string }` |
| **Specificity rises when** | Shareable output is personal (not branded), curiosity-gap enabled. Referral threshold (satisfaction ≠ enthusiasm) named. Algorithmic signals listed with expected amplification numbers. |
| **Source** | `marketing_playbook.md` Curiosity Gap Sharing + `communications_playbook.md` Referral Threshold |

### 15. `surface_inventory` — Communications Artifact 1

| | |
|---|---|
| **Input** | (user input with AI suggestions based on `tribe`) |
| **Output** | `{ surfaces: Array<{ name: string, subscriber_count: number, tier: 'static_billboard' \| 'warm_broadcast' \| 'targeted_strike', leverage_score: number, action_needed: string }> }` |
| **Specificity rises when** | All active surfaces inventoried. Each tiered. Leverage Score = clout ÷ energy. Action needed concrete (e.g., "update LinkedIn banner"). |
| **Source** | `communications_playbook.md` §1 + Digital Surface Holomap |

### 16. `tuning_fork` — Communications Artifact 2

| | |
|---|---|
| **Input** | `myth` + `pain` + `uniqueness` + `promise` |
| **Output** | `{ tuning_fork_text: string, three_beats: { declaration: string, credibility: string, philosophy_gift: string }, language: 'ru' \| 'en' \| 'both' }` |
| **Specificity rises when** | Three beats present. No CTA — the URL IS the gift. Declaration is a life update, not a launch announcement. Founder reads aloud and says "yes, that's what I'd actually say." |
| **Source** | `communications_playbook.md` §3 + Domain 65 |

### 17. `golden_dm` — Communications Artifact 3

| | |
|---|---|
| **Input** | `tuning_fork` + `tribe` + `pain` |
| **Output** | `{ golden_dm_text: string, dinner_table_test_notes: string, purity_check: { fear_based: boolean, scarcity_manipulation: boolean, founders_voice: boolean, gift_or_extraction: 'gift' \| 'extraction' } }` |
| **Specificity rises when** | Passes Dinner Table Test. Passes all 5 Purity Check criteria. Reads as founder's voice (no AI slop). Feels good to send even with zero response expected. |
| **Source** | `communications_playbook.md` §5 + Golden DM Handwriting Principle |

**⚠️ Golden DM handwriting rule:** per the playbook, the FINAL message sent to a real human must be handwritten by the founder. This artifact generates the *seed structure* — the DossierScreen explicitly prompts the founder to personalize before sending. AI drafts; founder ships.

---

## Phase D — Publication (1 artifact + 1 composed view)

### 18. `landing_page` — Public Surface (versioned)

| | |
|---|---|
| **What** | The public-facing sales page. Composed from `frictionless_purchase` + `pain` + `promise` + `value_ladder` + `tuning_fork`. Improvable and versioned like any other artifact. |
| **Input** | All Phase C artifacts (especially `frictionless_purchase`) + `pain` + `promise` + `value_ladder` + `tuning_fork` + (optional) founder's photo/logo URL |
| **Output shape** | `{ headline: string, subheadline: string, pain_section: string, promise_section: string, proof_section: Array<string>, value_ladder_section: string, cta: { text: string, mechanism: 'stripe' \| 'calcom' \| 'custom', url: string }, rendered_html?: string, meta: { slug: string, og_image?: string } }` |
| **Specificity rises when** | Headline stops the scroll (not generic). Pain section uses the tribe's exact phrasing. CTA is identity-shift language, not curiosity ("I'm done circling this" > "Learn more"). Meta is set — shareable on any surface. |
| **Versioning** | Every accepted Improve → new version row. Every publish event → snapshot recorded in `unique_business_dossiers` (or parallel `unique_business_landing_pages` table — Phase 2 decides). |
| **Source** | `marketing_playbook.md` Controlled Collapse + Decision Language CTAs + Situational Identity |

### `dossier` — Composed Overview (not user-improved)

| | |
|---|---|
| **What** | One-page rendering of all 18 artifacts at their current locked versions. Founder-facing working document + shareable URL. |
| **Input** | All 18 artifacts (latest locked version per key) |
| **Output shape** | `{ slug: string, rendered_html: string, specificity_avg: number, artifact_snapshot: Record<ArtifactKey, { version: number, content: Json, specificity: number }>, published_at: timestamp }` |
| **Not directly improved** | Dossier is auto-composed; Improve flows back to individual artifacts. Snapshotted at publish. |
| **Source** | All 5 playbooks converge here |

---

## Prompt injection pattern

Per-artifact specificity criteria are externalized to:
`docs/specs/unique-business-builder/specificity_criteria.json`

(Phase 2 deliverable — one JSON file, 18 keys, each with `criteria: string[]`, `source: string`, `example_high_specificity: string`, `example_low_specificity: string`.)

Edge functions load this JSON at cold start and inject the matching block into the prompt per call.

Rationale: keep content out of code. When the playbooks evolve, the JSON is updated without touching the edge function.
