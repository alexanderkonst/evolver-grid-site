/**
 * Unique Business Builder v2.0 — shared prompt configs.
 *
 * Sourced from:
 *   - docs/specs/unique-business-builder/artifact_prompts_spec.md
 *   - docs/specs/unique-business-builder/improve_roast_prompt.md
 *
 * Each artifact has:
 *   - generationPrompt: instructions for v1 initial draft
 *   - specificityCriteria: what makes THIS artifact more distinguishable vs generic
 *   - outputSchema: JSON shape the model must return
 *
 * Used by:
 *   - supabase/functions/generate-artifact/index.ts
 *   - supabase/functions/improve-artifact/index.ts
 */

export type ArtifactKey =
  | "uniqueness"
  | "myth"
  | "tribe"
  | "pain"
  | "promise"
  | "lead_magnet"
  | "value_ladder"
  | "session_bridge"
  | "core_belief"
  | "packaging"
  | "frictionless_purchase"
  | "reach"
  | "delivery"
  | "spread"
  | "surface_inventory"
  | "tuning_fork"
  | "golden_dm"
  | "landing_page";

export type ArtifactConfig = {
  label: string;
  sourcePlaybook: string;
  specificityCriteria: string[];
  outputSchema: string;
  generationGuidance: string;
};

export const ARTIFACT_CONFIGS: Record<ArtifactKey, ArtifactConfig> = {
  uniqueness: {
    label: "Talent Sentence",
    sourcePlaybook: "unique_business_playbook.md — Copernican Inversion",
    specificityCriteria: [
      "The sentence couldn't be said about anyone else",
      "No insider jargon — a stranger immediately sees what the founder does",
      "The key_phrase is irreducible (can't be split)",
    ],
    outputSchema: `{
      "sentence": "one sentence naming what the founder does in their zone of genius",
      "key_phrase": "the irreducible phrase at the heart of it",
      "why_this_names_it": "one sentence explaining why this phrasing works"
    }`,
    generationGuidance: "Name what the founder does when they're fully in their zone of genius. Use the ZoG top talent and archetype as seed. The sentence should make a stranger say 'Oh — you do THAT.'",
  },
  myth: {
    label: "The Photon of Truth",
    sourcePlaybook: "marketing_playbook.md — Phase 0 Step 0.4",
    specificityCriteria: [
      "Photon survives irreducibility: cannot be split into two sentences",
      "Three layers (attack/reframe/invitation) hold independently",
      "At least one layer feels inevitable after reading",
    ],
    outputSchema: `{
      "photon": "one sentence that can't be broken down further",
      "three_layers": {
        "attack": "what's wrong with the status quo",
        "reframe": "what if the real answer is the opposite",
        "invitation": "what specifically is offered"
      }
    }`,
    generationGuidance: "Find the photon of truth under the founder's uniqueness. The atom. If true, everything downstream is self-evident.",
  },
  tribe: {
    label: "Who This Is For",
    sourcePlaybook: "marketing_playbook.md — Situational Identity Principle",
    specificityCriteria: [
      "Zero identity labels ('founder', 'entrepreneur', 'coach')",
      "Reads like overhearing someone describe their 2am state",
      "Anti-tribe named cleanly",
    ],
    outputSchema: `{
      "situational_description": "the tribe described as a situation, not a label",
      "lived_experience_markers": ["5-10 things the tribe carries in their body"],
      "anti_tribe": "who this is NOT for — named cleanly"
    }`,
    generationGuidance: "Describe the tribe by their lived experience, not by job title. Use phrasing they'd use about themselves at 2am.",
  },
  pain: {
    label: "5-Layer Pain",
    sourcePlaybook: "marketing_playbook.md — Phase 4 ICP + Controlled Collapse",
    specificityCriteria: [
      "Tribe reader winces at pressure",
      "Feels consequences in body",
      "Cost of inaction is time-bound",
      "Root cause is what they can't name themselves",
    ],
    outputSchema: `{
      "pressure": "the daily felt experience",
      "consequences": "what keeps happening because this isn't solved",
      "stakes": "what's at risk if this continues",
      "cost_of_inaction": "time-bound, numeric where possible",
      "root_cause": "the thing they can't name themselves (confabulation layer)"
    }`,
    generationGuidance: "Forensic articulation of Point A. Describe so precisely the tribe feels seen, not sold to.",
  },
  promise: {
    label: "Transformational Promise",
    sourcePlaybook: "integrated_product_building_workflow.md — Bridge Step 1",
    specificityCriteria: [
      "Promise sentence = exact inverse of pain at matching detail",
      "Transformational result feels inevitable",
      "If guarantee present, it's time-bound and specific",
    ],
    outputSchema: `{
      "point_a": "current state — restated in their exact pain language",
      "point_b": "transformed state — in their exact dream-outcome language",
      "promise_sentence": "'From [A] to [B]' as one deliverable sentence",
      "guarantee": "optional — time-bound, specific. null if not applicable"
    }`,
    generationGuidance: "Take pain and invert it. The promise is A→B stated cleanly. If pain is at 9+ specificity, the promise writes itself.",
  },
  lead_magnet: {
    label: "Lead Magnet",
    sourcePlaybook: "marketing_playbook.md — Playbook-as-Lead-Magnet Pattern",
    specificityCriteria: [
      "A stranger could take it and benefit without ever buying",
      "Creates felt precision gap",
      "Nothing withheld",
      "Sovereignty-respecting CTA (no pressure)",
    ],
    outputSchema: `{
      "format": "e.g. PDF playbook, assessment, audit, tool",
      "artifact_description": "what the tribe receives",
      "recognition_trigger": "what the tribe will recognize about themselves",
      "sovereignty_respect": "why the CTA doesn't pressure"
    }`,
    generationGuidance: "A true gift. Real value delivered freely. The precision gap creates the pull toward the paid offer — without manufacturing urgency.",
  },
  value_ladder: {
    label: "Value Ladder",
    sourcePlaybook: "marketing_playbook.md — Kennedy pricing lineage",
    specificityCriteria: [
      "Each rung has an outcome in the tribe's own words",
      "Prices 'reassuringly expensive' (no cheap-course signals)",
      "Acquisition room numerically plausible per rung",
      "Slack adjuster (if present) is anchor, not volume",
    ],
    outputSchema: `{
      "rungs": [
        { "name": "string", "price": "number or 'free'", "outcome": "what buyer walks away with", "acquisition_room": "number — acceptable CAC" }
      ],
      "slack_adjuster": {
        "price": "number",
        "description": "rare ultra-premium anchor — not a volume product"
      }
    }`,
    generationGuidance: "Free → low → mid → high (+ optional slack adjuster). Each rung named in tribe language. Prices carry positioning weight.",
  },
  session_bridge: {
    label: "1st Session Design",
    sourcePlaybook: "integrated_product_building_workflow.md — The Bridge",
    specificityCriteria: [
      "Trinity has 3 clear mini A→B transits",
      "Guaranteed results named in universal language (no insider jargon)",
      "Silhouette palpable but not overwhelming",
      "Founder can deliver this tomorrow",
    ],
    outputSchema: `{
      "transformational_result": "A→B sentence (derived from pain + promise)",
      "trinity_sub_results": [
        { "mini_a": "start state", "mini_b": "end state", "felt_win_name": "3 words or less" }
      ],
      "first_session": {
        "guaranteed_results": ["concrete wins in universal language"],
        "silhouette": "foggy but palpable glimpse of the full journey",
        "universal_language_check": "confirm no jargon remains"
      }
    }`,
    generationGuidance: "Pain + Promise → Transformational Result → Trinity → 1st Session. The founder must be able to deliver this session tomorrow.",
  },
  core_belief: {
    label: "Core Belief (Marketing Pillar 1)",
    sourcePlaybook: "marketing_playbook.md — Phase 0",
    specificityCriteria: [
      "Passes Jobs filter (values, not features)",
      "Filter test executable — can be applied to any marketing decision",
    ],
    outputSchema: `{
      "we_believe_statement": "We believe that...",
      "what_we_are_for": "string",
      "what_we_are_against": "string",
      "filter_test": "one question that can be asked of any future marketing decision"
    }`,
    generationGuidance: "Steve Jobs principle: marketing is about values, not features. What does this business stand FOR? What will it never do?",
  },
  packaging: {
    label: "Packaging (Marketing Pillar 2)",
    sourcePlaybook: "marketing_playbook.md — Phase 1",
    specificityCriteria: [
      "Each tier has a concrete artifact the buyer holds",
      "One-liner: [Product] helps [who] [do what] so they can [transformation]",
    ],
    outputSchema: `{
      "format_ladder": [
        { "tier": "free/low/mid/high", "format": "what it looks like", "artifact": "what the buyer receives" }
      ],
      "one_liner": "[Product] helps [who] [do what] so they can [transformation]"
    }`,
    generationGuidance: "How the offer is shaped and named. The format ladder echoes the value ladder but names delivery form.",
  },
  frictionless_purchase: {
    label: "Frictionless Purchase (Marketing Pillar 3)",
    sourcePlaybook: "marketing_playbook.md — Phase 2 + Controlled Collapse",
    specificityCriteria: [
      "Anchor is dissimilar-category (Kennedy)",
      "All top-3 objections pre-answered",
      "One-click mechanism concrete",
      "All 4 controlled-collapse elements present and tribe-specific",
    ],
    outputSchema: `{
      "price_anchoring": { "dissimilar_anchor": "anchor from a different category entirely" },
      "objections_answered": [ { "objection": "string", "answer": "string" } ],
      "one_click_mechanism": "Stripe/Cal.com/custom",
      "controlled_collapse_elements": {
        "consequence_block": "felt cost of inaction",
        "non_optionality_frame": "eliminates the neutral option",
        "micro_commitment": "1-question self-diagnostic before offer",
        "identity_shift_cta": "button copy = identity snap, not 'Buy now'"
      }
    }`,
    generationGuidance: "Everything needed for the sale to collapse into inevitability at the right moment. Not manipulation — clarity.",
  },
  reach: {
    label: "Reach (Distribution Pillar 1)",
    sourcePlaybook: "distribution_playbook.md — Myth-Driven Distribution + Dual-Frequency",
    specificityCriteria: [
      "3+ upstream partner types named with concrete examples",
      "Content frequency = signal-first",
      "Cold-start path realistic",
    ],
    outputSchema: `{
      "upstream_partners": [
        { "type": "string", "named_examples": ["string"], "what_they_deliver": "string", "their_wall": "where their work ends and ours begins" }
      ],
      "content_frequency": "daily/weekly/monthly + signal-first rhythm",
      "cold_start_path": "realistic first 30 days"
    }`,
    generationGuidance: "Where the right people are. Partnership-driven, signal-first content, realistic cold start.",
  },
  delivery: {
    label: "Delivery (Distribution Pillar 2)",
    sourcePlaybook: "distribution_playbook.md — Friction section",
    specificityCriteria: [
      "Lean stack: 5 concrete tools/URLs named",
      "Friction audit: each step has a concrete fix, not just a problem",
    ],
    outputSchema: `{
      "lean_stack": {
        "landing": "URL",
        "payment": "Stripe/other",
        "delivery": "how artifact reaches buyer",
        "warm_channel": "owned email/community",
        "passive_channel": "evergreen content"
      },
      "friction_audit": {
        "discovery_to_landing": { "friction": "string", "fix": "string" },
        "landing_to_decision": { "friction": "string", "fix": "string" },
        "decision_to_payment": { "friction": "string", "fix": "string" },
        "payment_to_access": { "friction": "string", "fix": "string" }
      }
    }`,
    generationGuidance: "After purchase, how does the thing reach them? Lean stack + friction audit. Concrete fixes, not just problems.",
  },
  spread: {
    label: "Spread (Distribution Pillar 3)",
    sourcePlaybook: "marketing_playbook.md — Curiosity Gap + communications_playbook.md Referral Threshold",
    specificityCriteria: [
      "Shareable output is personal (not branded), curiosity-gap enabled",
      "Referral threshold (satisfaction ≠ enthusiasm) named",
      "Algorithmic signals listed with expected amplification",
    ],
    outputSchema: `{
      "shareable_output": "what user shares — personal, not an ad",
      "referral_mechanics": "how enthusiastic clients become referrers",
      "viral_coefficient": {
        "algorithmic_signals": ["signals the content triggers"],
        "expected_amplification": "reach multiplier estimate"
      },
      "curiosity_gap_implementation": "how the gap is structurally present"
    }`,
    generationGuidance: "Every client = potential distribution channel. Enthusiasm (not satisfaction) drives referrals. Curiosity gap is structural.",
  },
  surface_inventory: {
    label: "Digital Surface Inventory",
    sourcePlaybook: "communications_playbook.md §1 + Digital Surface Holomap",
    specificityCriteria: [
      "All active surfaces inventoried",
      "Each tiered (billboard / broadcast / targeted strike)",
      "Leverage Score = clout ÷ energy",
      "Action needed concrete",
    ],
    outputSchema: `{
      "surfaces": [
        { "name": "string", "subscriber_count": "number", "tier": "static_billboard|warm_broadcast|targeted_strike", "leverage_score": "number 0-10", "action_needed": "string" }
      ]
    }`,
    generationGuidance: "Map every digital surface the founder has access to. Score by leverage. Concrete next actions.",
  },
  tuning_fork: {
    label: "Tuning Fork",
    sourcePlaybook: "communications_playbook.md §3 + Domain 65 Epicenter Broadcast",
    specificityCriteria: [
      "Three beats present (declaration / credibility / philosophy-gift)",
      "No CTA — URL is the gift",
      "Declaration is a life update, not a launch",
      "Founder reads aloud and says 'yes, that's what I'd actually say'",
    ],
    outputSchema: `{
      "tuning_fork_text": "the full broadcast text",
      "three_beats": {
        "declaration": "life update",
        "credibility": "years of work, just now packaged",
        "philosophy_gift": "'In my paradigm... so I made...'"
      },
      "language": "en"
    }`,
    generationGuidance: "The founder's first broadcast. Says what's true. Offers the gift. No pitch. The URL at the end IS the gift.",
  },
  golden_dm: {
    label: "Golden DM (seed only — founder personalizes before sending)",
    sourcePlaybook: "communications_playbook.md §5 + Golden DM Handwriting Principle",
    specificityCriteria: [
      "Passes Dinner Table Test",
      "Passes 5 Purity Check criteria (no fear-based / no scarcity / founder's voice / gift-energy)",
      "Reads as founder's voice, not AI slop",
      "Feels good to send even with zero response",
    ],
    outputSchema: `{
      "golden_dm_text": "the seed DM — founder WILL edit before sending",
      "dinner_table_test_notes": "would I say this at a dinner table?",
      "purity_check": {
        "fear_based": false,
        "scarcity_manipulation": false,
        "founders_voice": true,
        "gift_or_extraction": "gift"
      }
    }`,
    generationGuidance: "Seed the DM structure only. The founder MUST personalize before sending. Warm, peer tone. No CTA pressure. No urgency.",
  },
  landing_page: {
    label: "Landing Page (public sales surface)",
    sourcePlaybook: "marketing_playbook.md — Controlled Collapse + Decision Language + Situational Identity",
    specificityCriteria: [
      "Headline stops the scroll (not generic)",
      "Pain section uses tribe's exact phrasing",
      "CTA is identity-shift language ('I'm done circling this' > 'Learn more')",
      "Meta is set — shareable on any surface",
    ],
    outputSchema: `{
      "headline": "stop-the-scroll headline",
      "subheadline": "supporting one-liner",
      "pain_section": "the consequence block",
      "promise_section": "the transformation",
      "proof_section": ["testimonial or before-after"],
      "value_ladder_section": "pricing tiers",
      "cta": { "text": "identity-shift language", "mechanism": "stripe|calcom|custom", "url": "string" },
      "meta": { "slug": "url-safe slug", "og_image": "optional url" }
    }`,
    generationGuidance: "Compose from frictionless_purchase + pain + promise + value_ladder + tuning_fork. Controlled collapse structure. Identity-shift CTA. Public — must work for strangers.",
  },
};

/**
 * The 27-perspective roast protocol used by improve-artifact.
 * See docs/specs/unique-business-builder/improve_roast_prompt.md for full spec.
 */
export const ROAST_PROTOCOL = `
ROAST PROTOCOL — apply ALL checks internally before producing output:

FOUR QUADRANTS (UL/UR/LL/LR Essence):
• UL-Essence: Does this feel true from the inside? (soul test)
• UR-Essence: Does this work mechanically? (engineering test)
• LL-Essence: Would the tribe recognize themselves in this? (resonance test)
• LR-Essence: Does this serve the system at scale? (architecture test)

13TH PERSPECTIVE:
• Does the CENTER hold? Does the whole see something the parts missed?

DEPTH CHECK:
• Was Essence (what IS this) addressed before Implications (what to change)?
• Was Significance (why it matters) named before suggesting changes?
• Are all 4 quadrants balanced — not just UR/LR mechanics?

27TH CRYSTALLIZATION:
• Is the ONE irreversible next action named that makes this land in reality?
• Is it specific enough to execute immediately?
• Does it feel inevitable — like all 26 perspectives were pointing there?

SPECIFICITY RULES:
1. New version MUST have specificity strictly greater than current.
   If you cannot produce such a version, return diminishing_returns: true.
2. Specificity rises by: adding distinguishing detail, removing generic phrasing,
   naming what only this founder / this tribe would say.
3. Specificity does NOT rise by: adding more words, hedging, adding caveats,
   or moving toward safer generic language.
4. Length is not specificity. Often the more specific version is shorter.

GUARDRAILS:
• Preserve Russian register if current_content is in Russian. Same for English.
• Never invent client names, testimonials, revenue numbers, or dates.
• If current_content has a "locked_phrasing" field, honor it verbatim and improve only surrounding structure.
• Never weaken a phrase the founder already got to 9+ specificity on; build around it.
`.trim();

export const MODEL = "google/gemini-2.5-flash";
export const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
