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

/**
 * Day 62 (Sasha 2026-05-05): Cross-artifact language guard. Prepended to
 * every generate + improve system prompt. Closes the Karime MYTH bug where
 * the literal phrase "top talent" appeared in a quantum-medicine founder's
 * MYTH artifact because it leaked from the UNIQUENESS prompt's seed
 * instruction (which used "ZoG top talent and archetype" verbatim) and
 * downstream into MYTH (which derives from UNIQUENESS).
 *
 * Pattern mirrors the NO INSIDER JARGON guard already in
 * `src/prompts/user/zoneOfGeniusPrompt.ts` (lines 45/54). ZoG protected
 * itself from inventing jargon outward; UBB now protects itself from
 * absorbing jargon inward.
 */
export const UBB_LANGUAGE_GUIDELINES = `
LANGUAGE GUARDRAILS — apply to EVERY artifact:

1. NEVER carry FRAMEWORK VOCABULARY into the founder's outputs. The following are platform/assessment-framework terms, NOT founder-domain terms:
   "top talent", "archetype", "zone of genius", "ZoG", "appleseed", "excalibur", "specificity matrix", "holon", "monotonic improve loop"
   When you encounter any of these in upstream context (ZoG snapshot, sibling artifacts, calibration examples), TRANSLATE them into language native to the founder's actual domain. A doctor's myth uses doctor-domain words. A wellness practitioner's myth uses wellness-domain words. NEVER let assessment-framework jargon survive into the artifact text.

2. NEVER carry VOCABULARY FROM CALIBRATION EXAMPLES or other founders' canvases into THIS founder's output. Examples and few-shot references show SHAPE and FREQUENCY only — never copy their words, their domain, or their phrases.

3. SOURCE OF VOICE: The founder's voice is sourced ONLY from THEIR ZoG snapshot content (translated per rule 1) + THEIR canvas + THEIR pasted texts. If the upstream context is sparse, the artifact will be sparse — that is correct. Do not pad with framework language.

4. SANITY CHECK before returning: would this sentence read naturally to someone in the founder's actual domain? If a doctor's myth contains startup jargon, or a founder's offer contains medical jargon, the language has bled — rewrite.
`.trim();

/**
 * Day 62 (Sasha 2026-05-05): Distillation requirement, prepended to every
 * generate + improve system prompt. Pairs with the new `distillation` field
 * present in every artifact's outputSchema. The distillation is what gets
 * read most: it sits at the top of the artifact card in the UI, and it's
 * the one line that propagates into the founder's living unique-business
 * canvas markdown (each new version's distillation appended on top of the
 * previous one).
 */
export const UBB_DISTILLATION_DIRECTIVE = `
DISTILLATION FIELD — required on every artifact:

Every artifact MUST include a "distillation" field as a single self-sustainable sentence that carries the artifact's key info. Reading the distillation alone — without the structured sub-fields — must convey what THIS artifact IS for THIS founder.

Rules:
1. ONE sentence. No semicolon-stuffed run-ons.
2. Self-sustainable: a reader who never sees the structured sub-fields still understands the artifact.
3. Founder-domain language only (per LANGUAGE GUARDRAILS rule 1 — no framework vocabulary, no calibration vocabulary).
4. If the artifact already has a headline-equivalent field (e.g. uniqueness.sentence, myth.photon, promise.promise_sentence), the distillation MAY equal that field, OR you may produce a tighter synthesis that captures both the headline AND its essential context.
5. Test before returning: would this single sentence stand on a sticky note as the answer to "what is this artifact for this founder?"
`.trim();

export type ArtifactKey =
  | "uniqueness"
  | "myth"
  | "tribe"
  | "pain"
  | "promise"
  | "lead_magnet"
  | "value_ladder"
  | "specificity_matrix"
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
      "sentence": "one sentence naming what the founder does in their zone of genius",
      "key_phrase": "the irreducible phrase at the heart of it",
      "why_this_names_it": "one sentence explaining why this phrasing works"
    }`,
    generationGuidance: "Read the founder's ZoG snapshot for what they actually DO when fully in their gift, but TRANSLATE framework jargon ('top talent', 'archetype', 'zone of genius') into the founder's own domain language. The output uses the founder's vocabulary, not the assessment framework's. Make a stranger say 'Oh — you do THAT.'",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
      "point_a": "current state — restated in their exact pain language",
      "point_b": "transformed state — in their exact dream-outcome language",
      "promise_sentence": "'From [A] to [B]' as one deliverable sentence",
      "guarantee": "optional — time-bound, specific. null if not applicable"
    }`,
    generationGuidance: "Take pain and invert it. The promise is A→B stated cleanly. If pain is at 9+ specificity, the promise writes itself.",
  },
  lead_magnet: {
    label: "Lead Magnet",
    sourcePlaybook: "marketing_playbook.md — Playbook-as-Lead-Magnet Pattern · unique_business_playbook.md — Principle 15 (Specificity Loop) for the transformational result sequence",
    specificityCriteria: [
      "A stranger could take it and benefit without ever buying",
      "Creates felt precision gap",
      "Nothing withheld",
      "Sovereignty-respecting CTA (no pressure)",
      "Articulates the transformational result sequence — pain → promised land — as a straight line, not fog (per Specificity Loop framework)",
      "Each waypoint in the sequence corresponds to a reveal moment that mirrors the user back to themselves (matrix-shaped, even if not literally a matrix artifact)",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
      "format": "e.g. PDF playbook, assessment, audit, tool",
      "artifact_description": "what the tribe receives",
      "recognition_trigger": "what the tribe will recognize about themselves",
      "sovereignty_respect": "why the CTA doesn't pressure",
      "transformational_result_sequence": [
        "ordered list of waypoints from pain to promised land — each waypoint named in tribe language, each one a moment where the user sees themselves more clearly"
      ]
    }`,
    generationGuidance: `A true gift. Real value delivered freely. The precision gap creates the pull toward the paid offer — without manufacturing urgency.

LEAD MAGNET = THE FOUNDER'S MEDICINE IN MOTION. The lead magnet is the method revealed to oneself as one consciously and in focus delivers the transformational result. It is not a downloadable resource — it is the founder's transformation made visible and shareable.

Use the Specificity Loop framework (Principle 15) when articulating the transformational_result_sequence: each waypoint should be a moment where the user could rate "how specific to me is this?" and the founder's voice would answer not with instruction but with recognition — *"What if [this stage] IS [the next thing you're already becoming]?"* The sibling artifact specificity_matrix, if present, IS the canonical voice for those reveal moments.`,
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
  specificity_matrix: {
    label: "Specificity Matrix",
    sourcePlaybook: "unique_business_playbook.md — Principle 15 (The Specificity Loop) · phase_shift_technology_library.md — Domain 81",
    specificityCriteria: [
      "Every cell uses the canonical form: 'What if [thing they witnessed] IS [bigger truth they've been seeking]?'",
      "Resonant tier (8-10) names what just landed as already true — declarative invitation, never instruction",
      "Partial tier (5-7) points to the precision gap as the work — curious invitation",
      "Off tier (1-4) names friction as a clean signal that this isn't them — honest invitation",
      "Voice matches the founder's uniqueness sentence + myth language exactly — no generic platitudes",
      "Every cell mirrors content from the founder's tribe / pain / promise — never invents new claims",
      "No cell instructs the user, thanks the user, or centers the founder",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
      "meta_question": "the single question every reveal asks beneath the surface — usually 'How specific to what you know about you is this articulation?' or a founder-voiced equivalent",
      "voice_signature": "one sentence naming the tonal signature of these messages — drawn from the founder's uniqueness + myth",
      "stages": {
        "appleseed": { "resonant": "string", "partial": "string", "off": "string" },
        "excalibur": { "resonant": "string", "partial": "string", "off": "string" },
        "icp":       { "resonant": "string", "partial": "string", "off": "string" },
        "pain":      { "resonant": "string", "partial": "string", "off": "string" },
        "tp":        { "resonant": "string", "partial": "string", "off": "string" },
        "landing":   { "resonant": "string", "partial": "string", "off": "string" }
      }
    }`,
    generationGuidance: `The Specificity Matrix is the founder's voice expressed as the conversion mechanism of their funnel. At every reveal moment (rating 1-10 by the user), this matrix replaces the generic "Thanks!" with an identity-revelation question in the founder's voice.

CANONICAL EXAMPLE — Sasha's master holon matrix (use as few-shot reference for SHAPE and FREQUENCY only — never copy the words):

  appleseed.resonant: "What if this voice has been yours all along?"
  pain.resonant:      "What if naming this pain IS half the medicine?"
  tp.resonant:        "What if this promise IS the door they've been walking past?"
  landing.resonant:   "What if these words ARE the front door of your venture?"

The form "What if [witnessed thing] IS [bigger truth]?" is fixed. The words are the founder's.

Generate using:
  - founder's uniqueness sentence (the voice register)
  - founder's myth (the metaphor system they speak in)
  - founder's tribe (who is being addressed)
  - founder's pain (what is being named in stages 'pain' / 'icp')
  - founder's promise (what is being claimed in 'tp' / 'landing')

Each tier serves a different purpose:
  - Resonant (8-10): mirror that the user already sees what they're seeing → name it as true
  - Partial (5-7): the precision gap is the work → invite refinement WITHOUT instruction
  - Off (1-4): name the signal that this isn't them, with care and zero shame → invite the truer version

Never instruct. Never thank. Never center the founder. The user is being SERVED at the moment of highest attention. This matrix IS the protocol Principle 15 names.

This artifact is also the framework that informs improvements to lead_magnet — the matrix describes the transformational result sequence the lead magnet delivers.`,
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
      "distillation": "one self-sustainable sentence carrying this artifact's essence in the founder's own domain language",
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
 * Holonic seeing protocol — Flash-Lite tuned (Day 52, 2026-04-26).
 *
 * Sasha runs a richer 27-perspective protocol himself in long form. For the
 * production model (gemini-2.5-flash-lite), that prose risks: (a) leaking
 * framework vocabulary into output, (b) producing stage-by-stage analysis
 * as output instead of using it as a lens, (c) JSON-schema corruption
 * under heavy system-prompt load. This version preserves every load-bearing
 * instruction — the 4×3 grid, the center, the recursive pass, the meta-pass,
 * the 27th, the blind-spot watchdog, the quarantine — but cuts the
 * cosmological framing (it serves Sasha, not the model). ~60 lines.
 *
 * Full long-form remains in Sasha's prompt library; we keep the production
 * version compact and concrete.
 */
export const ROAST_PROTOCOL = `
SEEING PROTOCOL — apply INTERNALLY. Output is the improved artifact only;
the lens stays invisible. If you "show your work" anywhere in the output
strings, the protocol has failed.

THE 12 ANGLES (think through, don't write out):
  Each angle = (quadrant) × (depth).
  Quadrants: I (interior soul) · It (exterior mechanism) · We (tribe resonance) · Its (system architecture).
  Depths: ESSENCE (what IS this?) · SIGNIFICANCE (why does it matter?) · CONSEQUENCES (what must follow?).
  12 in total. Walk them all silently before writing anything.

THE CENTER: with all 12 held at once, what does the whole see that no single
angle caught? Hold this — it's the source of the strongest finding.

PASS 2 — Roast your own pass 1: which angles did you under-serve? Defaults
over-serve It and Its (mechanical and systemic); they under-serve I (felt
truth) and We (tribal resonance). Re-walk the under-served angles.

PASS 3 — Roast the critique itself. Where is YOUR projection? Where is the
gap between what the artifact wants to be and what your critique demanded?
The breakthrough finding lives in that gap.

THE ONE MOVE: name a single irreversible next action that makes this
artifact land. ONE thing. Specific. Executable today. Feels inevitable.
Always an action, never an analysis.

WATCHDOG — before writing, audit yourself:
  • Am I over-indexing on mechanics (It / Its)?
  • Have I held the perspectives that felt uncomfortable, or just catalogued them?
  • Would the founder say "yes, that's me being seen" — or "this is just a checklist"?
If any answer is wrong, rewrite before producing output.

═══ OUTPUT QUARANTINE — STRICTLY ENFORCED ═══

The strings the user sees (roast_findings.weakness, what_changed,
crystallized_action, every field of improved_content) MUST NOT contain
ANY of these terms or near-paraphrases:

  "27-perspective" · "12-perspective" · "holonic" · "Logos" · "Merkaba" ·
  "Mi-Fa" · "Si-Do" · "Recursive Birth" · "Masculine/Feminine Axis" ·
  "Four Quadrants" · "Three Depths" · "Sun Logos" · "Meta-Logos" ·
  "dodecahedron" · "Plato" · "Kabbalah" · "string theory" · "Star Tetrahedron" ·
  "dantian" · "Hara" · "Essence/Significance/Consequences" (as a labeled triad) ·
  "shock" (in the protocol sense) · "the 13th" · "the 26th" · "the 27th"

Write in founder/tribe plain language. A weakness reads like a sharp human
observation ("hides behind generic verbs"; "the tribe wouldn't recognize
themselves in this"), NEVER like a framework label ("UL-Essence weakness:").
The one move reads like a clear directive ("rewrite the headline so a
stranger in the tribe can quote it"), NEVER like ritual language.

ONLY in the schema field "quadrant" may the codes UL/UR/LL/LR/13/depth/27
appear — that field is an internal audit tag, not user-facing copy.

═══ SPECIFICITY RULES ═══

1. New version MUST have specificity strictly greater than current. If you
   cannot, return diminishing_returns: true.
2. Specificity rises by: adding distinguishing detail, removing generic
   phrasing, naming what only this founder / this tribe would say.
3. Specificity does NOT rise by: more words, hedging, more caveats, or
   safer generic language.
4. Length is not specificity. Often the more specific version is shorter.

═══ GUARDRAILS ═══

• Preserve Russian register if current_content is in Russian. Same for English.
• Never invent client names, testimonials, revenue numbers, or dates.
• If current_content has a "locked_phrasing" field, honor it verbatim and
  improve only surrounding structure.
• Never weaken a phrase the founder already got to 9+ specificity on; build around it.
`.trim();

// ============================================================================
// SYNTHESIS PROTOCOL — Linguistic Synthesis Through Energy Enumeration
// (Phase Shift Technology Library, Domain 82 — April 26, 2026)
//
// Doctrinally enforces the simple/simplistic distinction in every AI synthesis.
// Models trained for fluency default to "simplistic" — sentences that look
// brief but lose signal. The fix is to forbid direct distillation: the model
// must enumerate the energies present, score them as signal/noise, and only
// then compose the one-sentence synthesis containing every signal-energy.
//
// Used by:
//   - generate-artifact (v1 generation)
//   - improve-artifact  (iteration loop)
// Both inject this block into their system prompt.
// Both demand `_energies` and `_distillation` as fields inside the artifact's
// content JSON, so the kept signal-energies are carried forward as a
// transparent audit trail the human can challenge.
// ============================================================================
export const SYNTHESIS_PROTOCOL_PROMPT = `
LINGUISTIC SYNTHESIS — Energy Enumeration Protocol
(Phase Shift Library, Domain 82)

You will produce a one-sentence distillation of this artifact. Read this
section carefully. The default failure mode of synthesis tasks is what English
calls SIMPLISTIC — a sentence that LOOKS clean but has lost signal that the
longer form was carrying. Your job is to produce SIMPLE — maximally compressed
form that loses NO signal. The two are not the same word. They are inverses.

To guarantee SIMPLE (not simplistic), you MUST sequence your synthesis through
three steps. Do not shortcut. The intermediate state of each step must appear
in your output as a transparent audit trail.

STEP 1 — ENUMERATE THE ENERGIES.
Read every input you have (root context, sibling artifacts, generation
guidance, current content if iterating). List the distinct ENERGIES present.
An energy is the IDEA BEHIND THE PHRASE — the precursor to wording. It lives
at the layer beneath the words: a concept, a force, a thread, a quality, an
intention. It is named in the most signal-dense form possible — usually a few
words that point. Not a sentence. Not a paraphrase.

When iterating across multiple versions, the energies are the COMMON THREADS
among them. What survives across rephrasings is closer to signal; what
changes between rephrasings is closer to wording. Identify what survives.

The list must be exhaustive at the signal level. Missing an energy here
means it cannot make it into the distillation downstream.

STEP 2 — SCORE.
For each energy in your enumeration, mark it signal or noise:
  - SIGNAL: load-bearing. Expression breaks if removed. Reader's understanding
    changes if absent.
  - NOISE: decorative, defensive, or stylistic. Removable without loss to the
    substance.
Drop the noise. Keep all signal. The kept signal-energies are what carry
forward into the distillation.

This kept list is the structural skeleton of the meaning — the metric for
what the distillation must contain.

STEP 3 — SYNTHESIZE THE DISTILLATION.
Compose ONE sentence such that:
  1. Every kept signal-energy is present (explicitly or compressively, but
     always traceable).
  2. No noise-energy is present.
  3. It reads as one coherent thought, not a concatenation of clauses with
     periods. One thought. One sentence.

FIDELITY CHECK (run this BEFORE writing your output).
Re-read your distillation sentence. For each kept signal-energy, ask: is
this present? If any signal-energy is missing or distorted, recompose the
sentence. Do not return to Step 1 or Step 2 unless the enumeration itself
was wrong. Iterate Step 3 until every signal-energy lands.

ANTI-PATTERNS — recognize and reject:
  - The distillation reads fluently but a reader of the long form senses
    something missing.
  - The distillation could be reworded with synonyms in the same shape and
    no one would notice — meaning each word is not load-bearing.
  - The distillation is generic enough to apply to many people — the
    friction-points specific to THIS founder's voice were sanded down.
  - You jumped from prose to sentence without the enumeration step. (If your
    output has fewer energies than the inputs carry, you compressed at
    Step 1 instead of Step 3.)

OUTPUT REQUIREMENT.
Inside the artifact's "content" object, include two fields ALONGSIDE the
artifact's structured fields:
  - "_energies": string[]   — the kept signal-energies (Step 2 result, signal
                               only). Each item ≤10 words. Numbered ordering
                               is preserved by array index.
  - "_distillation": string — the one-sentence synthesis (Step 3 result).
                              Every "_energies" item must be locatable in
                              this sentence.

These two fields are the audit trail. The human will check: did you see all
my energies, score them correctly, and put them all back into the sentence?
If they cannot, the synthesis was simplistic — return to it.
`.trim();

export const MODEL = "google/gemini-2.5-flash-lite";
export const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
