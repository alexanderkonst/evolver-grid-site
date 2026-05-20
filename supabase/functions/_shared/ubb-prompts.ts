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

6. ARTIFACT-SPECIFIC ANTI-PATTERNS — by artifact_key:

   • myth: distillation MUST be a claim about REALITY / THE WORLD, NOT a mission statement.
     - MUST NOT begin with "I", "We", or "My/Our [service]" in the founder's voice.
     - MUST NOT take the shape "I help [tribe] do [thing] so they can [outcome]".
     - MUST be falsifiable — a stranger could state what would have to be true for the myth to be FALSE.
     - Canonical shape: "The [paradigm] has it backwards because [structural truth]." / "[Y] was never the problem — [Z] was."

   • uniqueness: distillation MUST name the founder's IRREDUCIBLE CREATIVE SIGNAL, NOT their service.
     - "I help [tribe] do [thing]" is a service description, downstream from uniqueness. Rewrite to name the signal beneath the delivery.
     - Target ~7 words. Each word load-bearing.

   • tribe: distillation MUST describe the tribe by SITUATIONAL lived-experience, NOT identity labels.
     - Banned words unless redirected into lived-experience form: "founder", "entrepreneur", "coach", "consultant", "expert".
     - Canonical shape: "People who [lived state] — [the structural gap they carry]".

   • pain: distillation MUST come from EMPATHY, not fear-mongering.
     - Sandra's test: precision WITHOUT empathy = manipulation; empathy WITHOUT precision = therapy; precision WITH empathy = tuning fork.
     - If the distillation makes the reader feel attacked, weaponized, or poked-at, rewrite from empathy.

   • core_belief: distillation MUST follow shape "We believe that [TRUTH about world]…".
     - NOT a mission statement, NOT a value statement, NOT vague aspiration.

   • tuning_fork: distillation reads as a LIFE UPDATE register, not a launch.
     - "I finally focused on / I finally got clear on…" — first-person, present-tense, peer voice.
     - NO CTA energy. Would feel good to send even with zero response.

   For all OTHER artifacts: the "[Product] helps [who] [do what] so they can [transformation]" shape may be acceptable when it's literally what the artifact IS (e.g. packaging.one_liner, session_bridge.transformational_result, promise.promise_sentence). Only ban it where it betrays the artifact's actual function (myth, uniqueness, tribe, core_belief, tuning_fork).
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
    sourcePlaybook: "unique_business_playbook.md — Copernican Inversion · Uniqueness Articulation",
    specificityCriteria: [
      "The sentence couldn't be said about anyone else — friction-points specific to THIS founder's voice remain",
      "No insider jargon — a teenager grasps it fully on first read",
      "Target ~7 words. Load-bearing: remove any word, meaning breaks",
      "Key_phrase is irreducible (cannot be split into two phrases without loss)",
      "NOT a service description ('I help X do Y') — that's downstream. Uniqueness names the irreducible signal BENEATH the service",
      "NOT a job title or identity label (founder / coach / consultant / architect)",
      "Stranger test: read in a group chat without context, someone immediately grasps the essence",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence — the founder's IRREDUCIBLE CREATIVE SIGNAL in their domain language. NOT a service description. See UBB_DISTILLATION_DIRECTIVE rule 6.",
      "sentence": "the Talent Sentence — ~7 words in universal language naming what the founder does in their zone of genius. Each word earns its place. A teenager understands it.",
      "key_phrase": "the irreducible phrase at the heart of the sentence — the Vibrational Key. Compresses the founder's core pattern into the shortest sayable form. Cannot be split.",
      "why_this_names_it": "one sentence explaining why THIS wording captures the intersection other framings miss — origin/principle, not a re-paraphrase"
    }`,
    generationGuidance: `The Talent Sentence is the founder's irreducible creative signal in universal language — the master key from which every downstream artifact (myth, tribe, pain, promise, value ladder) is derived.

WHAT IT IS NOT (hard guards — apply before returning):
  • NOT a service description ("I help founders build businesses") — that's an offer, downstream. Uniqueness names what the founder IS at their brightest, not what they sell.
  • NOT a job title or identity label (founder, coach, consultant, architect, strategist).
  • NOT generic enough to apply to many people — friction-points specific to THIS founder's voice must remain.
  • NOT interchangeable with synonyms — if you can swap "architect" for "builder" without anyone noticing, the wording isn't load-bearing.

CONSTRUCTION:
  Read the founder's ZoG snapshot for what they actually DO when fully in their gift. TRANSLATE framework jargon ('top talent', 'archetype', 'zone of genius') into the founder's domain language. The output uses the founder's vocabulary, not the assessment framework's.

CANONICAL SHAPE (Sasha's own — for SHAPE only, NEVER copy the words):
  "I turn vague thoughts into exact words people can use to decide and act."
  ~7 words. Verb + specific object + outcome or recipient. No jargon. Teenager-readable.

TESTS — run before returning:
  1. Stranger test: would someone in a group chat say "Oh — you do THAT" without context?
  2. Teenager test: would a 14-year-old grasp it fully on first read?
  3. Load-bearing test: remove any word — does meaning break? If not, tighten.
  4. Service-trap test: does it describe what the founder DELIVERS to clients? If yes, rewrite to name the irreducible signal beneath the delivery.

If the ZoG snapshot is thin, v1 will be thin — that is correct. Do not pad with framework language.`,
  },
  myth: {
    label: "The Photon of Truth",
    sourcePlaybook: "unique_business_playbook.md — The Myth: Anatomy of a World-Changing Claim (canonical) · marketing_playbook.md — Phase 0 Step 0.4 (legacy ref)",
    specificityCriteria: [
      "Photon is a claim about THE WORLD, not about the founder or the client — falsifiable, world-level cosmology, not personal counsel",
      "Photon survives the Collapse Test: if disproved, the founder's entire business collapses (Nike: if human potential is NOT unlimited → just shoes)",
      "Three layers each hold independently AND pass distinct tests: attack makes ENEMIES (no comfort), reframe inverts the dominant PARADIGM (no personal coaching), invitation CREATES THE TRIBE through self-selection (no service pitch, no 'I'll help you')",
      "Voice is world-claim, NOT founder-claim. ZERO 'I architect / I help / I transform / for [client type]' shapes — those are mission statements, NOT myths",
      "Master Lie ↔ Master Belief polarity is structurally present (the lie the world runs on, the truth the business is built on). For Teal/consciousness-domain founders, the Paradox Reframe variant applies — two sides of one paradox illuminated, not enemy-vs-truth",
      "Photon survives irreducibility: cannot be split into two sentences without losing the claim",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence — a CLAIM ABOUT REALITY, not a mission statement. Must not begin with 'I' or describe what the founder does. See UBB_DISTILLATION_DIRECTIVE rule 6.",
      "photon": "the single falsifiable claim about REALITY this business depends on — one sentence that, if disproved, collapses the entire business. About THE WORLD, not about the founder, not about the client.",
      "three_layers": {
        "attack": "claim about THE WORLD that makes enemies — names what is structurally wrong with the dominant paradigm. NOT 'you struggle with X' (that is coaching). IS 'the entire [industry/paradigm] has it backwards because [structural truth]' (that is a myth). If it doesn't stop the scroll by making someone uncomfortable, it is an affirmation.",
        "reframe": "the 2am moment — once seen, can't be unseen. A STRUCTURAL inversion of the dominant paradigm. Often shape: 'What if [thing everyone optimizes] is downstream of [thing nobody names]?' NOT a personal-coaching reframe ('what if the breakthrough isn't about you needing X but about Y' — that is therapy framing, not myth).",
        "invitation": "the line that CREATES THE TRIBE through self-selection. The stance a right-fit reader hears and says 'that's me, I'm in.' Often imperative or declarative. NOT a CTA. NOT a service offer. NOT 'I'll help you…' — that shape is the FAILURE mode (it makes the myth into a sales pitch). Canonical shape examples (do not copy): 'Get your FMF first. PMF follows.' / 'Stop grinding. Trust the dream.' / 'You forgot you ARE the PMF.'"
      }
    }`,
    generationGuidance: `The myth is the CLAIM ABOUT REALITY that makes the founder's business inevitable if true. It is the bridge between the founder's uniqueness and the world's need — but it is addressed TO THE WORLD, not to the founder and not to the client. The right people then self-select by hearing it and recognizing themselves inside the claim.

FOUR THINGS A MYTH IS NOT — apply as hard guards before returning:
  • Not a tagline. A tagline sells. A myth recruits.
  • Not a mission statement. A mission describes what you DO. A myth describes what is WRONG with the world.
  • Not advice. "Follow your passion" is advice. "Human potential is unlimited" (Nike) is a myth.
  • Not about the individual. Anything addressed to YOU as a client is COUNSEL, not COSMOLOGY. Myths claim about THE WORLD; the tribe then self-selects.

THE COLLAPSE TEST. If the photon's core claim is proven false, does the entire business collapse?
  ✅ Nike: if human potential is NOT unlimited → Nike is just shoes.
  ✅ Apple: if the crazy ones DON'T change the world → Apple is just computers.
  If the myth can be disproved without the business collapsing, it is not a myth — it is marketing copy.

THREE LAYERS — DISTINCT FUNCTIONS (do NOT collapse them into one tone):
  • Attack: makes enemies. Names what is structurally wrong with the dominant paradigm. If the attack does not make enemies, it is an affirmation, not a movement.
  • Reframe: the 2am moment. A structural inversion of the paradigm. Not a coaching reframe.
  • Invitation: CREATES THE TRIBE through self-selection. The line that makes the right reader say "that is me." Never a service offer.

CANONICAL EXAMPLES (for SHAPE only — never copy the words):
  Attack:     "The entire startup industry is a billion-dollar workaround for not knowing yourself."
  Reframe:    "What if you ARE the PMF, but your self-knowledge is the bottleneck?"
  Invitation: "Get your FMF first. PMF follows."

MASTER LIE / MASTER BELIEF POLARITY. Every myth has a backbone:
  • Master Lie — the false belief the world runs on ("who you are is not enough")
  • Master Belief — the truth the founder's business is built on ("your uniqueness IS your business")
Both must be present in the myth's gestalt. Lie alone = critic. Belief alone = affirmation. Both = polarity = energy.

PARADOX REFRAME (Teal-level upgrade, apply when the founder's domain is integrative / healing / consciousness work). Replace "enemy vs. truth" with "one side of the paradox the world already sees ↔ the other side, now illuminated." Same magnetization, zero separation energy. Backward-compatible — Orange-level businesses use the lie/truth form, Teal-level businesses use the paradox form. Choose based on the founder's actual register.

ANTI-PATTERN AUDIT — before returning, check each:
  1. Does the photon begin with "I" or describe what the founder does? → REWRITE as a world-claim.
  2. Does the attack speak to "you" (the reader as client) about their personal struggle? → REWRITE as claim about the paradigm/industry.
  3. Does the invitation offer the founder's service or help ("I'll help you / step out of the haze / I architect / together we…")? → REWRITE as a tribe-self-selection line.
  4. Could the photon be cleanly inverted into a Master Lie? If no → there is no polarity yet, the myth is incomplete.
  5. Does the distillation read as "I help [tribe] do [thing] so [outcome]"? → That is a mission statement. REWRITE.

If the founder's ZoG snapshot is sparse or generic, the v1 myth will be thin — that is correct. Do NOT pad with framework language to hide thinness. The Improve loop sharpens from there.`,
  },
  tribe: {
    label: "Who This Is For",
    sourcePlaybook: "marketing_playbook.md — Situational Identity Principle + Myth-Revealed-Tribe",
    specificityCriteria: [
      "Zero identity labels in body copy ('founder', 'entrepreneur', 'coach', 'consultant', 'expert')",
      "Reads like overhearing someone describe their own 2am state — first-person inner dialogue, not third-person diagnosis",
      "Anti-tribe named cleanly without contempt — they're not wrong, just not THIS tribe",
      "Chest-tightens test: state the description to 10 strangers — the ones whose chest tightens are the tribe (the ones who nod politely are not)",
      "Tribe is REVEALED by the myth, not designed independently — qualifiers map back to the myth's truth-claims",
      "NOT persuaded into belonging — if you have to convince someone they're the tribe, they're not",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence describing the tribe as a SITUATION, not a label. See UBB_DISTILLATION_DIRECTIVE rule 6 (no founder/entrepreneur/coach unless redirected into lived-experience).",
      "situational_description": "the tribe described as a CURRENT LIVED SITUATION — their state, their relationship to the work, what's true about them right now. NOT a job title.",
      "lived_experience_markers": ["5-10 things the tribe carries IN THEIR BODY — 2am thoughts, recurring dread, the thing they say privately but not publicly. Their self-language, not your description of them."],
      "anti_tribe": "who this is NOT for — named cleanly, without contempt. They're a different tribe, not a wrong one."
    }`,
    generationGuidance: `The tribe is revealed BY the myth — its truth-claims, reversed, become the qualifiers. Then the founder's lived experience furnishes the segments and life-pressures.

LANGUAGE RULE (Situational Identity Principle): describe the tribe by LIVED EXPERIENCE, not identity label. Labels cause self-exclusion ("founder = that's not me yet"; "entrepreneur = overused") and read as third-person diagnosis. Lived-experience phrasing causes self-recognition.

LABEL → SITUATIONAL — translation shapes (do NOT copy verbatim; use SHAPE):
  • "Founders in transition" → "People who know they're meant to build something of their own — but don't yet have the structure that lets the world meet it"
  • "Entrepreneurs who are stuck" → "People whose work is real — but doesn't translate into a business yet"
  • "Coaches and consultants" → "People who are already valuable — but it's not structured into income"

TESTS — run before returning:
  1. Chest-tightens test: would the right reader's chest tighten reading this, while the wrong reader nods politely and scrolls?
  2. Self-talk test: do the lived_experience_markers read as things the tribe would say PRIVATELY at 2am, not things you'd say ABOUT them?
  3. Label scrub: search the draft for "founder", "entrepreneur", "coach", "consultant", "expert" — if present in body copy (not redirected), rewrite as situational.

ANTI-TRIBE: name who this is NOT for, cleanly. (E.g. "People still committed to the grind paradigm" / "People who haven't felt the dream yet".) Not contempt — different tribe.

If the myth is thin or generic, the tribe will be thin. Tribe quality is downstream of myth quality.`,
  },
  pain: {
    label: "5-Layer Pain",
    sourcePlaybook: "pain_theory_playbook.md (5-Layer Pain Slicer) · marketing_playbook.md Phase 4 + Controlled Collapse",
    specificityCriteria: [
      "Tribe reader WINCES at pressure — recognition, not abstraction",
      "Consequences felt in the BODY (a bad day, inner dialogue, relationship strain, energy leak, the mask)",
      "Cost of inaction is TIME-BOUND and PERMANENT (what gets lost in 6-12 months, not delayed)",
      "Stakes name the worst the tribe can't admit aloud",
      "Root cause is the CONFABULATION LAYER — what they cannot accurately name themselves; often structurally identical to the founder's gift, inverted",
      "Comes from EMPATHY, not fear-mongering — the founder's heart opens when describing it",
      "Layer 5 (root_cause) is arrived at LAST, after 1-4 — sequencing matters",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence carrying the pain's essence — from EMPATHY, not fear-mongering. See UBB_DISTILLATION_DIRECTIVE rule 6.",
      "pressure": "the closing window — what external/internal forces are compounding NOW. Map the LOOP (financial stress → partner tension → self-doubt → slower progress → more stress), not just sources. Not 'someday' — imminent.",
      "consequences": "the felt texture of living inside it daily — body, inner dialogue, key relationship, energy leak, the mask they wear and for whom. Visceral, not abstract.",
      "stakes": "what is REALLY at stake beyond the surface — countdown already running, compounding cost per month, upcoming life event forcing self-assessment, the worst stake they can't admit",
      "cost_of_inaction": "project 6-12 months forward — what gets PERMANENTLY LOST (not delayed). Usually not bankruptcy but RESIGNATION — settling for a misaligned life. The abyss they won't say aloud.",
      "root_cause": "struggle synthesized — the structural pattern beneath layers 1-4. One sentence that makes them freeze and say '...yes, that's exactly it.' Often the SHADOW of the founder's gift, inverted. The thing they cannot accurately name themselves (confabulation layer)."
    }`,
    generationGuidance: `Pain is FIVE SEQUENTIAL LAYERS, each revealing structural truth more deeply. Generate in order: pressure → consequences → stakes → cost_of_inaction → root_cause. Arriving at root_cause through 1-4 produces structural truth; starting with root_cause produces surface complaint.

THE SANDRA EMPATHY TEST (load-bearing):
  • Precision WITHOUT empathy = MANIPULATION (reader feels seen AND used — backs away)
  • Empathy WITHOUT precision = THERAPY (warm but vague — trust built, no recognition fired)
  • Precision WITH empathy = TUNING FORK (reader feels seen, held, AND moved)
  If the founder's heart does not open writing this, the pain card is a weapon. Rewrite from empathy.

THE 3-FREQUENCY DEPTH LADDER for each layer:
  • Intellectual: "This hasn't turned into income" — reader nods but doesn't act
  • Felt consequence: "People will keep getting value without paying" — reader winces, already happening
  • Identity threat: "You will keep circling this for another year" — stomach tightens, non-optional
  Target identity-threat for stakes + cost_of_inaction.

THE RECURSIVE SHADOW PATTERN (root_cause guide):
  The tribe's root cause is often structurally identical to the founder's gift, INVERTED.
  • Founder's gift = "making the invisible visible" → tribe's shadow = "my value is invisible to me"
  • Founder's gift = "naming what people can't see" → tribe's shadow = "I can't name what I do"
  Look for this inversion when synthesizing root_cause.

THE CONFABULATION LAYER:
  The tribe CANNOT accurately name their own root cause — they confabulate plausible explanations ("the market wasn't ready", "funding dried up"). The root_cause field gives them the language they don't have yet.

PER-FIELD CONSTRUCTION QUESTIONS:
  pressure — What's making this urgent NOW? What clocks tick? What self-image is eroding? Map the LOOP.
  consequences — What does a bad day feel like in their body? Inner dialogue when alone? Impact on most important relationship? Where is energy leaking? What mask, for whom?
  stakes — What countdown is running? Compounding cost/month? Upcoming life event? The worst stake they can't admit?
  cost_of_inaction — 6-12 months forward, what gets PERMANENTLY lost? The real cost is resignation, not bankruptcy. The abyss not said aloud.
  root_cause — What would they say if forced honest about full picture? The REAL conflict (different from first-named). Pattern repeating across attempts. One sentence: "...yes, that's exactly it."

ANTI-PATTERNS:
  • NOT generic ("stress", "overwhelm")
  • NOT feature-absence ("you don't have the right software")
  • NOT base-needs language for affluent tribes (status, emotional emptiness — already metabolized; their drivers are insecurity / faker-fear / faux-pas dread)
  • NOT starting with root_cause — sequence matters`,
  },
  promise: {
    label: "Transformational Promise",
    sourcePlaybook: "integrated_product_building_workflow.md — Bridge Step 1 · pain_theory_playbook.md — Inversion Principle",
    specificityCriteria: [
      "Promise sentence = exact inverse of pain at MATCHING DETAIL (visceral A → tangible B)",
      "Point A described in the tribe's EXACT pain language — visceral, felt, specific (someone reads and says 'that's me')",
      "Point B is MEASURABLE — how would you KNOW the tribe got there? (a 12-year-old could verify it)",
      "Read aloud, it lands and excites — not dry, not therapy language",
      "Comes from empathy (inherits from pain) — promises from fear-mongering ring hollow",
      "If guarantee present, time-bound and specific",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence carrying the promise — readable by a 12-year-old. NOT mission statement, NOT features list, NOT therapy language.",
      "point_a": "current state in the tribe's EXACT pain language — visceral, felt, specific (extract from pain layer 5 / root_cause; not abstract)",
      "point_b": "transformed state in the tribe's EXACT dream-outcome language — tangible, measurable. How would you KNOW they got there?",
      "promise_sentence": "'From [point_a] to [point_b]' as ONE deliverable sentence — readable aloud, lands and excites, no semicolon-stuffed compound",
      "guarantee": "optional — what's IRREVERSIBLY shifted after the transformation (not a feature, a structural state change like 'they can never un-see what they do'). Time-bound and specific if used. null if not applicable."
    }`,
    generationGuidance: `The promise is the INVERSION of pain. If pain is at 9+ specificity, the promise writes itself — you DISCOVER it, you don't invent it.

CONSTRUCTION:
  1. Take pain.root_cause and invert the shadow ("hiding the sight" → "delivering the sight").
  2. point_a = pain.root_cause restated viscerally in tribe's exact language.
  3. point_b = inverted state stated tangibly, measurably.
  4. promise_sentence = "From [A] to [B]" — ONE sentence, read aloud.

CANONICAL SHAPES (for SHAPE only, do NOT copy):
  • "From doing your best work for free and not knowing what to charge for, to a named craft, a clear business, and paying clients."
  • "From hiding the sight behind tech wrappings to delivering the raw seeing as the product — and getting paid for it."

TESTS — run before returning:
  1. 12-year-old test: explain to a 14-year-old. If they don't get it, simplify.
  2. Read-aloud test: does it land and excite, or land flat and dry?
  3. Inversion test: does point_b match point_a at MATCHING detail (not vague vs specific)?
  4. Measurability test: how would the tribe KNOW they got to point_b? If unverifiable, sharpen.
  5. Empathy inheritance: does it carry the same heart-open energy as the pain artifact? Promises that don't trace back to empathetic pain ring hollow.

ANTI-PATTERNS:
  • NOT a mission statement ("Helping founders thrive")
  • NOT a features list ("5 modules, 12 worksheets")
  • NOT therapy language (warm but vague — "deeper alignment", "fuller expression")
  • NOT surface complaint inverted — must be STRUCTURAL truth inverted`,
  },
  lead_magnet: {
    label: "Lead Magnet",
    sourcePlaybook: "marketing_playbook.md — Playbook-as-Lead-Magnet Pattern · unique_business_playbook.md — Principle 15 (Specificity Loop)",
    specificityCriteria: [
      "Format = COMPLETE methodology given away, NOT a teaser. The deeper the free content, the higher the trust",
      "Default canonical format = multi-slide carousel (Instagram-native, mobile, swipeable, binge-friendly). Other formats (assessment / audit / PDF / video) acceptable when carousel doesn't match the founder's surface",
      "Structure = sequential episodes following the methodology in BUILD ORDER (mindset shift → each artifact → cliffhanger to next)",
      "Per-episode 5-beat structure: WHY NOW → BIG INSIGHT → TRAP → HOW TO APPLY → CLIFFHANGER",
      "CTA placement: ONLY in the final episode, as logical conclusion — not a pitch. All prior episodes are pure gift",
      "Permanent profile content (not stories) — new followers find and binge the library",
      "Articulates the transformational result sequence — pain → promised land — as a straight line (Specificity Loop / Principle 15)",
      "Each waypoint mirrors the user back to themselves (matrix-shaped reveal moments)",
      "Sovereignty-respecting CTA — no urgency, no scarcity, no pressure",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence — what the tribe receives and what precision gap it produces",
      "format": "default 'multi-slide carousel'. Acceptable alternatives: 'PDF playbook', 'assessment', 'audit', 'tool', 'video series'. Choose based on the founder's strongest surface.",
      "artifact_description": "what the tribe receives — the methodology revealed, not held back",
      "recognition_trigger": "what the tribe recognizes about themselves as they apply it (the precision gap that follows)",
      "sovereignty_respect": "why the CTA doesn't pressure — what gives the reader the unforced 'next step'",
      "transformational_result_sequence": [
        "ordered waypoints from pain to promised land — each named in tribe language, each one a reveal moment that mirrors the user back to themselves (Specificity Matrix-shaped, even if not literally invoking the matrix)"
      ]
    }`,
    generationGuidance: `LEAD MAGNET = THE FOUNDER'S MEDICINE IN MOTION. It is not a downloadable resource — it is the founder's transformation made visible and shareable. A TRUE GIFT, no holding back.

THE MECHANISM ("jar can't read its own label"):
  Reader understands the architecture by reading the lead magnet → tries to apply it to themselves → discovers "I can see the framework but not myself in it" → the felt precision gap pulls them toward the paid offer. The gap is FELT, not manufactured.

THE ASSUMPTION FLIP (load-bearing):
  Default fear: "If I give away the how-to, nobody will pay."
  Reality: the person who can DIY the methodology was never going to pay. The person who needs the mirror was never going to DIY. ZERO cannibalization. Withholding creates SUSPICION, not value.

DEFAULT CANONICAL FORMAT — multi-slide carousel:
  • Mobile-native, swipeable, binge-friendly
  • Posted as PERMANENT profile content (not stories) — new followers find and binge
  • Batch-produced in one session with ceremony — NOT a daily posting habit
  • 5 beats per episode: WHY NOW → BIG INSIGHT → TRAP → HOW TO APPLY → CLIFFHANGER
  • Sequential episodes following the methodology in build order
  • CTA appears ONLY in the final episode — as logical conclusion, never a pitch ("If you want this done in 90 minutes — [link]")

NON-CAROUSEL FORMATS (when the founder's surface calls for it):
  • Assessment / audit: produces a personal result that triggers recognition + share
  • PDF playbook: works when audience is desktop-heavy / B2B
  • Video series: when founder's strongest surface is video
  In all cases the principles hold: complete methodology, sequential structure, CTA only at end.

THE TRANSFORMATIONAL RESULT SEQUENCE (Specificity Loop / Principle 15):
  Each waypoint = a moment the user could rate "how specific to me is this?" The founder's voice answers each not with instruction but with recognition: "What if [this stage] IS [the next thing you're already becoming]?"
  The sibling artifact specificity_matrix, if present, IS the canonical voice for those reveal moments.

ANTI-PATTERNS:
  • NOT "basic free, deep paid" — the deeper the free content, the higher the trust
  • NOT withholding the best frameworks — withholding creates suspicion
  • NOT a daily posting habit — batch-produced, deployed deliberately
  • NOT a sales piece in disguise — CTA is conspicuously absent until the last piece
  • NOT a precision-gap manufactured by holding back — the precision gap is the user trying to apply the complete methodology and discovering "I can't see myself in it from inside"`,
  },
  value_ladder: {
    label: "Value Ladder",
    sourcePlaybook: "marketing_playbook.md — Direct-Response Pricing Lineage (Dan Kennedy, 2008)",
    specificityCriteria: [
      "Each rung has an outcome in the tribe's own words (not feature lists)",
      "Prices 'reassuringly expensive' — a $555 price signals 'not the $49 course'; a $197 price reads as 'that course again'",
      "Acquisition room numerically plausible per rung (Kennedy Transaction Size principle)",
      "Slack adjuster (if present) is ANCHOR, not volume — 1-4 times/year, ≥80% margin",
      "Anchoring uses DISSIMILAR-CATEGORY anchor (Kennedy Anchoring Corollary) — same-category invites shopping around",
      "Acquisition budget per rung trails revenue — don't outspend before rung earns it; don't underspend once it does",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence — the ladder's strategic shape in the founder's domain language",
      "rungs": [
        { "name": "string", "price": "number or 'free'", "outcome": "what the buyer walks away with — in tribe language, not features", "acquisition_room": "number — acceptable CAC at this rung, scaled by transaction size" }
      ],
      "slack_adjuster": {
        "price": "number — the rare ultra-premium anchor",
        "description": "1-4 times/year, ≥80% margin. Three functions: anchor that re-prices everything below + PR/bragging rights + runway funding. NOT meant to be climbed by most buyers — only SEEN."
      }
    }`,
    generationGuidance: `Free → low → mid → high (+ optional slack adjuster). Each rung named in tribe language; prices carry positioning weight.

KENNEDY TRANSACTION SIZE PRINCIPLE (load-bearing):
  Higher transaction size requires the SAME effort to sell, often less, and funds exponentially better acquisition.
  • $1,111 rung → can fund $200-500/seat in acquisition
  • $10K+ rung → can fund $1-2K/sale (white-glove everything)
  $10K to 100 people is easier than $1K to 1,000.

REASSURINGLY EXPENSIVE (for affluent / program-fatigued audiences):
  Low price creates SUSPICION. A $555 signals "not the $49 course that did nothing." A $197 signals "that course again." Approachability reads as "more of the same cheap thing."

ANCHORING COROLLARY:
  • Weak (same-category) anchor: "$555 is less than most coaching sessions" → invites shopping
  • Strong (dissimilar-category) anchor: "$555 is recovered by the first paying client this session names for you" → collapses comparison

SLACK ADJUSTER (top rung):
  Rare, ultra-premium. 1-4 sales per year. ≥80% margin. NOT a volume rung.
  Three functions: (1) ANCHOR that re-prices everything below, (2) PR / bragging rights, (3) runway funding.
  Don't activate before the tier below is proven. If the top becomes volume, the anchoring effect collapses.

ANTI-PATTERNS:
  • NOT undercutting for "approachability" with affluent tribes
  • NOT activating Slack Adjuster before mid-rung proven
  • NOT same-category anchors in landing copy
  • NOT outspending acquisition budget before the rung's revenue justifies it`,
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
  excalibur.resonant: "What if this offer IS the way your gift wants to be paid?"
  icp.resonant:       "What if these ARE the people you've been quietly built for?"
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
      "Trinity has 3 distinct mini A→B transits — each a felt win the client experiences in the session",
      "Guaranteed results named in UNIVERSAL LANGUAGE — landing-page test: a stranger reads each felt_win_name and immediately knows what they get (no glossary)",
      "Silhouette is palpable but FOGGY — too much clarity → overwhelm freezes them; too little → no traction; just right → ground under feet AND horizon ahead",
      "Founder can deliver this session tomorrow (no methodology that doesn't exist yet)",
      "Session is PROOF OF CONCEPT, not the full transformation — clients gain traction in 90 min, see the journey ahead",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence — the session's transformational result in the tribe's exact A→B language",
      "transformational_result": "A→B sentence (derived from pain + promise) — what the client moves from / to in this single session. Read aloud, lands and excites.",
      "trinity_sub_results": [
        { "mini_a": "starting state for this sub-result, in tribe language", "mini_b": "outcome state — measurable, felt", "felt_win_name": "3 words or less, universal language (no methodology jargon) — passes the landing-page-stranger test" }
      ],
      "first_session": {
        "guaranteed_results": ["3-5 concrete wins in universal language — what they walk away with"],
        "silhouette": "the shape of the full journey beyond this session — foggy but palpable. Client should feel 'I can't see every step, but this is going somewhere real.'",
        "universal_language_check": "confirm every result name passes the landing-page-stranger test (no insider jargon, no glossary needed)"
      }
    }`,
    generationGuidance: `Pain + Promise → Transformational Result → Trinity → 1st Session. The founder must be able to deliver this session TOMORROW.

THE GOLDILOCKS RULE (silhouette balance):
  • Too much clarity → overwhelming, client freezes ("there's so much to do")
  • Too little clarity → no traction, client drifts ("I don't see how this leads anywhere")
  • Just right → ground under feet (the trinity they JUST experienced) AND horizon ahead (the silhouette)

THE PROOF-OF-CONCEPT PRINCIPLE:
  The session is NOT the full transformation. It is where the proof is delivered — client gains traction, sees they CAN move, sees the shape of where they're going. Don't try to deliver the whole journey in 90 minutes.

UNIVERSAL LANGUAGE TEST (per felt_win_name):
  Would a stranger reading the felt_win_name on a landing page immediately know what they'd walk away with?
  • "Name your craft" ✅ (stranger gets it)
  • "Zone of Genius extraction" ❌ (needs glossary — methodology language)
  • "See your business" ✅ (clear felt state)
  • "Person-perspective development" ❌ (insider jargon)

CANONICAL SHAPE — Sasha's Ignition Session trinity (for SHAPE only, never copy):
  1. Name your craft — from "I don't know what I do" to "I see what was always there"
  2. See your business — from "I have a gift but no structure" to "I have a clear product, tribe, and path"
  3. Know your first move — from "I don't know where to start" to "I know exactly who to talk to and what to say"

ANTI-PATTERNS:
  • NOT delivering the full transformation in one session
  • NOT methodology language in felt_win_name
  • NOT a linear how-to list — trinity is THREE distinct felt wins discovered through pain+promise, not invented`,
  },
  core_belief: {
    label: "Core Belief (Marketing Pillar 1)",
    sourcePlaybook: "marketing_playbook.md — Phase 0",
    specificityCriteria: [
      "Follows shape 'We believe that [TRUTH about the world]' — explicit, not implied",
      "Passes Jobs filter — names VALUES (what we are FOR / AGAINST), not features",
      "Filter test is EXECUTABLE — can be applied to any marketing/format/channel/pricing decision",
      "Genuinely believed (founder's actual conviction), not aspirational positioning drafted to fit a market",
      "Distinct from but related to the myth — core_belief is the surface position; myth is the deeper underlying truth-claim about reality",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence — the founder's core belief in the canonical 'We believe that…' shape. NOT a mission statement, NOT a value statement, NOT vague aspiration. See UBB_DISTILLATION_DIRECTIVE rule 6.",
      "we_believe_statement": "'We believe that [TRUTH about the world]' — the explicit core position",
      "what_we_are_for": "string — what this business stands FOR (the tribe it leads, the future it serves)",
      "what_we_are_against": "string — what this business stands AGAINST (the enemy it names, the practice it refuses)",
      "filter_test": "one question that can be asked of ANY future marketing/format/channel/pricing decision. 'Does this honor the belief?' If no → don't do it."
    }`,
    generationGuidance: `Steve Jobs principle: marketing is about VALUES, not features. What does this business stand FOR? What will it never do? Without a position, you speak into a void. With a position, you attract tribe.

CANONICAL SHAPES (for SHAPE only, do NOT copy):
  • Apple — "The crazy ones change the world."
  • Nike — "Everyone is an athlete."
  • Evolver — "Everyone has a Unique Gift waiting to be discovered."
  Note: each is a claim about a category of people / how the world works. Not a description of the company.

RELATIONSHIP TO MYTH:
  Core Belief is the SURFACE position. The myth is the deeper underlying truth-claim about reality on which the belief rests. They co-exist:
  • Belief: "Everyone has a Unique Gift waiting to be discovered."
  • Myth (deeper): "Your uniqueness IS your business, and you've always had it."

ANTI-PATTERNS:
  • NOT a mission statement ("Making the world better")
  • NOT a value statement ("We value integrity")
  • NOT vague ("We're customer-focused")
  • NOT aspirational — must be genuinely believed, lived
  • NOT a tagline (taglines sell; beliefs recruit)

FILTER TEST construction:
  The filter_test field is a QUESTION, not a value. Format: "Does this [action / decision] [honor / serve / express] [the belief]?"
  If a future marketing piece, format choice, channel, or price can be evaluated through this question, the filter passes. If it can't, sharpen.`,
  },
  packaging: {
    label: "Packaging (Marketing Pillar 2)",
    sourcePlaybook: "marketing_playbook.md — Phase 1",
    specificityCriteria: [
      "Each tier has a CONCRETE artifact the buyer holds (course, workshop, coaching container, retreat — not 'access' or 'consulting')",
      "One-liner follows: [Product] helps [who] [do what] so they can [transformation] — testable on a landing page",
      "Format ladder maps to value ladder rungs (free / low / mid / high) and each tier has its OWN purpose in the funnel",
      "FREE educates; PAID transforms — don't blur the line",
      "Tiers aren't mixed in a single offer (mixing low+high in one offer kills ladder logic)",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence — the offer's shape, named in tribe language",
      "format_ladder": [
        { "tier": "free/low/mid/high", "format": "what it physically looks like (article, book, course, coaching container, retreat)", "artifact": "what the buyer concretely receives — not 'access', a held thing", "purpose": "this tier's job: free=hook with value, low=first money exchange, mid=core transformation, high=lifetime relationship" }
      ],
      "one_liner": "[Product] helps [who] [do what] so they can [transformation]"
    }`,
    generationGuidance: `Format gives value SHAPE. Without packaging, value is abstract. With packaging, the buyer understands what they're getting and why it costs what it costs.

THE TIER LADDER:
  • FREE (article, assessment, mini-course, video) — hook with value, build trust
  • LOW (book, mini-course, low-ticket workshop) — first money exchange, micro-commitment
  • MID (course, workshop, group container) — core transformation delivered
  • HIGH (1:1 coaching, mastermind, retreat) — lifetime relationship, deepest container

THE FREE/PAID LINE:
  Free educates. Paid transforms. Don't blur — putting transformation behind paid doesn't mean the free content is shallow (the lead_magnet artifact handles depth of free).

WHEN THE FORMAT LADDER FEEDS DOWNSTREAM:
  packaging's format_ladder array becomes the spine that value_ladder.rungs prices and that delivery's lean_stack delivers. Keep tier names consistent across all three.

ANTI-PATTERNS:
  • NOT mixing high-ticket and low-ticket in the same offer (kills the ladder logic)
  • NOT skipping the format ladder (creates confusion about what's included)
  • NOT treating free as a product to sell
  • NOT vague "access" or "consulting" as artifact — what does the buyer HOLD?`,
  },
  frictionless_purchase: {
    label: "Frictionless Purchase (Marketing Pillar 3)",
    sourcePlaybook: "marketing_playbook.md — Phase 2 + Controlled Collapse + Decision Language CTAs",
    specificityCriteria: [
      "Anchor is DISSIMILAR-CATEGORY (Kennedy) — same-category invites shopping",
      "All top-3 objections pre-answered before the button",
      "One-click mechanism concrete (Stripe / Cal.com / custom checkout)",
      "All 4 controlled-collapse elements present and tribe-specific (consequence / non-optionality / micro-commitment / identity-shift CTA)",
      "CTA uses DECISION LANGUAGE — protagonist positioning ('I'm done circling this'), not curiosity language ('Learn more')",
      "Stable pricing — no 'launch discounts' or fake urgency with affluent / program-fatigued audiences",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence — what makes the sale collapse into inevitability for the right buyer",
      "price_anchoring": {
        "dissimilar_anchor": "anchor from a DIFFERENT category — e.g. '$555 is recovered by the first paying client this session names for you', NOT '$555 is less than most coaching sessions'"
      },
      "objections_answered": [ { "objection": "string — top-3 only", "answer": "string — direct, not deflecting" } ],
      "one_click_mechanism": "Stripe / Cal.com / custom — concrete, working today",
      "controlled_collapse_elements": {
        "consequence_block": "felt time-bound cost of inaction — 'If nothing changes → another 6-12 months in the same loop. Not because you're wrong. Because this isn't structured yet.'",
        "non_optionality_frame": "eliminates the neutral option — 'It either becomes a business — or it stays something people benefit from for free.'",
        "micro_commitment": "1-question self-diagnostic before the offer — they self-identify into the tribe before they buy",
        "identity_shift_cta": "button copy = identity snap, not 'Buy now'. E.g. 'I'm done circling this — let's build it' / 'See exactly why this hasn't turned into income'"
      }
    }`,
    generationGuidance: `Everything needed for the sale to collapse into inevitability AT THE RIGHT MOMENT. Not manipulation — clarity. The right buyer reads this and feels relief, not pressure.

DECISION LANGUAGE vs CURIOSITY LANGUAGE (CTA construction):
  • Curiosity ("Watch this", "Take the quiz", "Learn more") — invites browsing, not deciding
  • Decision ("See what's blocking this", "Understand why this hasn't turned into income", "I'm done circling this") — positions the viewer as PROTAGONIST choosing, not OBSERVER browsing

KENNEDY DISSIMILAR-CATEGORY ANCHORING:
  Same-category anchor: "$555 is less than most coaching sessions" → reader compares to other coaching, shops around
  Dissimilar-category anchor: "$555 is recovered by the first paying client this session names for you" → collapses comparison, names the outcome that recovers the cost

CONTROLLED COLLAPSE — the 4 elements work TOGETHER as a sequence on the page:
  1. consequence_block (what staying costs) → felt loss creates motion
  2. non_optionality_frame (eliminates neutral) → "doing nothing" becomes a stance, not a default
  3. micro_commitment (1-question diagnostic) → reader self-identifies into the tribe
  4. identity_shift_cta (button as identity snap) → click = becoming the next version

STABLE PRICING (for affluent / program-fatigued tribes):
  "Launch discounts", "spots filling fast", "founding member rate" — all read as "another marketing course" with this audience. Stable price is reassuring.

ANTI-PATTERNS:
  • NOT multiple CTAs on one page (choice paralysis)
  • NOT curiosity-language CTAs
  • NOT same-category anchors
  • NOT manufactured urgency (the consequence_block IS the urgency)
  • NOT features-instead-of-transformations in objection answers`,
  },
  reach: {
    label: "Reach (Distribution Pillar 1)",
    sourcePlaybook: "distribution_playbook.md — Myth-Driven Distribution + Dual-Frequency",
    specificityCriteria: [
      "3+ upstream partner types named with CONCRETE examples (named publications, named communities, named people if known)",
      "Content frequency = signal-first rhythm (post when there's signal, not on schedule)",
      "Cold-start path is REALISTIC for first 30 days (80% energy → warm network; 20% → new surfaces)",
      "Channels are ACTIVE, not passive — ICP visibility confirmed at each",
      "Distinguishes where ICP SPENDS TIME from where they MAKE DECISIONS (different places)",
      "Precision to ICP stage — not generic visibility",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence — where the right people are and how the founder gets in front of them",
      "upstream_partners": [
        { "type": "string — category of partner", "named_examples": ["concrete named examples — not generic categories"], "what_they_deliver": "string — what flows from them to the founder", "their_wall": "where their work ends and the founder's begins (the handoff seam)" }
      ],
      "content_frequency": "daily/weekly/monthly + signal-first rhythm — post when there's signal worth carrying",
      "cold_start_path": "realistic first 30 days — 80% energy on warm network (existing surfaces), 20% on new"
    }`,
    generationGuidance: `Reach = where the right people ARE, and confirming you're there. Not marketing (which creates desire); reach enables transaction DISCOVERY — the Amazon Search analogy: customer SEES the product before they decide.

WHERE THEY SPEND TIME vs WHERE THEY DECIDE (often different):
  • Spend time = social feeds, podcasts, communities (consumption channels)
  • Make decisions = email, DMs, 1:1 conversations, search at moment-of-need (decision channels)
  A reach strategy that puts the right message in the wrong channel for the stage misfires. Map both.

THE 80/20 COLD START:
  First 30 days: 80% of energy → warm network (people who already know the founder; activate via Tuning Fork to existing surfaces). 20% → new channels (the long bet).
  This is the inversion of what new founders default to: spraying new channels for "discovery." The warm network converts; new channels build.

UPSTREAM PARTNERS — name them concretely:
  Generic ("podcast hosts in our space") is useless. Named ("Tim Ferriss, Lex Fridman, Modern Wisdom") is actionable. Pick 3-5 named entities per partner type.

ANTI-PATTERNS:
  • NOT generic visibility — precision to ICP stage matters
  • NOT posting once and leaving the channel dark
  • NOT spreading energy across many cold channels at launch
  • NOT confusing "where they spend time" with "where they decide"`,
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
    sourcePlaybook: "marketing_playbook.md — Curiosity Gap Sharing Pattern + communications_playbook.md — Referral Threshold",
    specificityCriteria: [
      "Shareable output is PERSONAL (about the user, not the product) — share text contains no brand name, no CTA, no pitch",
      "NO LINK in the shared content — absence creates curiosity; presence kills reach (~10x multiplier from removing 4 characters)",
      "Engagement invitation embedded — an open question that demands a comment ('Do you actually see me this way?'), triggering algorithmic amplification",
      "Referral Threshold is gated — satisfaction ≠ enthusiasm; satisfied clients don't refer; only enthusiastic ones do",
      "Three-stage Viral Loop named (genuine post → engagement → curiosity → warm referral via DM)",
      "Algorithmic signals listed with expected amplification (comments → 2nd/3rd degree reach)",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence — what makes the user WANT to share, and what they actually share",
      "shareable_output": "what the user shares — a PERSONAL result/revelation/output about themselves. NOT an ad, NOT a referral link, NO product name.",
      "referral_mechanics": "how enthusiastic clients become referrers — what storyworthy moment was created, how acknowledgment is tiered (24h handwritten for one-time intros / personal gift for 2-3 referrals / revenue share for evangelists)",
      "viral_coefficient": {
        "algorithmic_signals": ["signals the content triggers — comments, dwell time, profile visits, no-link authenticity bonus"],
        "expected_amplification": "reach multiplier — typical 10x from removing the link, 2-5x from open-question engagement"
      },
      "curiosity_gap_implementation": "how the gap is STRUCTURALLY present — no link, open question, personal not promotional. The 30% conversion in DMs/comments vs 2% on links."
    }`,
    generationGuidance: `Spread = every client is a potential distribution channel. ENTHUSIASM (not satisfaction) drives referrals. Curiosity gap is structural — engineered by what is ABSENT from the share, not by clever copy.

THE NO-LINK RULE (load-bearing — 10x multiplier):
  Shares that include the source link get penalized by the algorithm AND read as ads (~2% conversion of clicks).
  Shares WITHOUT the link get organic reach AND look authentic AND trigger curiosity in the comments (~30% conversion of those conversations).
  Removing 4 characters → 10x reach multiplier. This is the central mechanic of spread.

THE 3-STAGE VIRAL LOOP:
  1. Share as genuine personal post (no link, no brand, no CTA) — algorithm rewards authenticity, post reaches 2nd/3rd-degree connections
  2. Engagement explodes (the open question demands a comment) — algorithm amplifies further
  3. Curiosity → DM / comment exchange → warm referral (30% of conversations convert)

REFERRAL THRESHOLD (operational gate — apply BEFORE deploying any referral language):
  • Satisfied clients (expectations met) → ~zero referrals. Asking burns credit; they feel pressure with no story to carry.
  • Enthusiastic clients (expectations exceeded so thoroughly they have a story to tell at a dinner party) → high referral rate, pure amplification.
  • Evangelists (life-altering, unprompted, repeated) → bridge-type, name them.
  60-DAY DIAGNOSTIC: has this client sent someone WITHOUT being asked, in the last 60 days? If yes → enthusiastic. If no → satisfied. Don't ask satisfied clients for referrals.

TIERED ACKNOWLEDGMENT (recognition ladder):
  • One-time warm intro → handwritten note within 24h
  • 2-3 referrals → personal gift
  • Evangelist → revenue share + named attribution

CANONICAL SHARE SHAPE (for SHAPE only, do NOT copy):
  "Something just named what I do better than I ever could. Apparently my genius is: [Result]. '[Tagline].' Honestly? It hit hard. But I'm curious — do you actually see me this way? 👀"
  Note: no link, no brand name, no CTA, personal language, open question demanding comment.

ANTI-PATTERNS:
  • NOT including the link (kills reach, looks like an ad)
  • NOT product-name-in-share (kills authenticity signal)
  • NOT closed questions (need open invitation for comments to boost reach)
  • NOT asking satisfied clients for referrals (burns credit)
  • NOT treating all referrers the same (tiering acknowledgment matters)
  • NOT scarcity / urgency in referral language (extracts; doesn't amplify)`,
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
      "Three beats present in this order: declaration / credibility / philosophy-gift",
      "No CTA — URL is THE gift; no 'check it out', 'let me know', 'DM me'",
      "Declaration is a LIFE UPDATE ('I finally focused on…'), not a launch announcement",
      "Founder-written voice, not AI slop — must carry the founder's belly frequency, not LLM politeness",
      "Energy test: would feel good to send even with zero response",
      "Founder reads aloud and says 'yes, that's what I'd actually say'",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence — what the tuning fork SAYS in one breath, life-update register. See UBB_DISTILLATION_DIRECTIVE rule 6.",
      "tuning_fork_text": "the full broadcast text — three beats + URL. ~5 short paragraphs. No CTA after the URL.",
      "three_beats": {
        "declaration": "Beat 1 — LIFE UPDATE shape. 'I finally focused on…' / 'I finally got clear on…'. Who you help + what they get (NOT what you do)",
        "credibility": "Beat 2 — depth without pitching. 'X years, just now packaged.' Signals the work has been long and only now landed in a form others can use.",
        "philosophy_gift": "Beat 3 — 'In my paradigm/understanding… so I made/built…'. Worldview explains why the tool exists. Ends in the URL, which IS the gift."
      },
      "language": "en or ru — preserve register from input"
    }`,
    generationGuidance: `The founder's first coherent broadcast. Says what's true. Offers the gift. No pitch. The URL at the end IS the gift.

CANONICAL SHAPE (Sasha's English master tuning fork — for SHAPE only, NEVER copy the words):
  "I finally got clear on what I want to do with my life.
   Help people see their brightest talents — and turn them into a business.
   I've been doing this professionally for 6 years, but only now truly packaged it.
   The way I see it, business grows from self-knowledge — so I built a tool that reveals your #1 talent in a couple of minutes.
   → aleksandrkonstantinov.com"
  Note: 5 short paragraphs. Declaration → who-you-help → years-just-now-packaged → philosophy-to-tool → URL as terminus.

NOT AI SLOP:
  This text must carry the founder's BELLY frequency — their actual voice, not LLM politeness. If it reads as "leverage your bandwidth" / "transformative journey" / "elevate your business", rewrite from the founder's actual speech patterns.

ENERGY TEST:
  Would the founder feel good sending this even if zero people respond? If the energy is hooked to response, it's a pitch.

ANTI-PATTERNS:
  • NOT a pitch ("This will change your life")
  • NOT a feature list ("It has 5 benefits")
  • NOT a CTA ("Check it out", "Reply with", "Only 3 spots")
  • NOT different versions for different people — ONE master text, surface adaptations only
  • NOT AI-generated voice — the language must be the founder's`,
  },
  golden_dm: {
    label: "Golden DM (seed only — founder personalizes before sending)",
    sourcePlaybook: "communications_playbook.md §5 + distribution_playbook.md — Golden DM Handwriting Principle + Frankie Model",
    specificityCriteria: [
      "Passes Dinner Table Test — would the founder say this exact sentence to this person across a dinner table?",
      "Passes all 5 Purity Check criteria (fear-based / scarcity / founder's voice / energy / gift-or-extraction)",
      "Reads as founder's voice, not AI slop ('leverage', 'bandwidth', 'transformative' = rewrite)",
      "Feels good to send even with zero response (energy test)",
      "Context: response to a HAND-RAISER who engaged with the tuning fork (Frankie Step 2), NOT cold outreach",
      "Founder writes the core message; AI personalizes variations for top prospects; founder sends (never AI)",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence — what the DM SAYS, in founder's voice, peer register",
      "golden_dm_text": "the seed DM — founder WILL personalize before sending. Short, warm, peer-to-peer.",
      "dinner_table_test_notes": "would the founder say this exact sentence across a dinner table? If not, rewrite.",
      "purity_check": {
        "fear_based": false,
        "scarcity_manipulation": false,
        "founders_voice": true,
        "energy_test": true,
        "gift_or_extraction": "gift"
      }
    }`,
    generationGuidance: `The Golden DM is the founder's hand at first contact. AI can personalize deliveries; AI cannot write the core message. Authenticity detaches at the first AI-sounding touch.

CONTEXT — Frankie Model Step 2:
  This DM is the response to a HAND-RAISER — someone who engaged with the tuning fork or expressed interest. It is NOT cold outreach. The reader has already self-selected.

THE 5 PURITY CHECKS (apply in order, ALL must pass):
  1. Fear-based? ❌ 'Don't miss', 'Last chance' / ✅ 'If this resonates'
  2. Scarcity manipulation? ❌ 'Only 3 spots' (when untrue) / ✅ Transparent availability
  3. Founder's voice? ❌ 'leverage your bandwidth' / ✅ Founder's actual words spoken aloud
  4. Energy test? ❌ Requires response to feel good / ✅ Already feels good sending
  5. Gift or extraction? ❌ 'You must buy to receive value' / ✅ Reader gets something from reading
  IF ANY CHECK FAILS, REWRITE.

DINNER TABLE TEST:
  Read the DM aloud. Imagine the founder saying this exact sentence to the recipient across a dinner table. If it sounds like corporate email, rewrite. If it makes the founder cringe, rewrite. If they'd say it for real → ship.

CANONICAL SHAPE (Frankie Step 2 — for SHAPE only):
  "Hey [name], thanks for reaching out. Here's a quick 5-min video that explains what I do and who it's for. [link]"
  Note: warm, short, gift-energy, no pitch, no urgency.

WORKFLOW:
  Founder writes core message → AI personalizes top 10 prospect variations based on their public profiles → Founder sends (not AI).

ANTI-PATTERNS:
  • NOT automated send (kills the energetic bridge)
  • NOT a pitch ("Here's what I do…")
  • NOT pressure ("Spots filling fast")
  • NOT complex (simplicity signals confidence)
  • NOT cold-outreach copy — this is response to self-selected hand-raisers`,
  },
  landing_page: {
    label: "Landing Page (public sales surface)",
    sourcePlaybook: "marketing_playbook.md — Controlled Collapse + Decision Language + Situational Identity + Dual-Frequency",
    specificityCriteria: [
      "Pain-first frequency — landing addresses what it COSTS to stay stuck, not what's right about the offer (right-content lives on Instagram/LinkedIn; landing is pain-first)",
      "Headline stops the scroll (not generic 'Transform your business')",
      "Hero contains Proximity Reframe — 'You're not far away. You're one structural layer away.'",
      "Pain section uses tribe's EXACT phrasing (Situational Identity — no 'founder/entrepreneur/coach' labels)",
      "Pricing uses dissimilar-category anchors (Kennedy) — 'Recovered by first paying client' not 'less than coaching'",
      "CTA is identity-shift language ('I'm done circling this'), NOT curiosity ('Learn more')",
      "Pressure line present near final CTA ('Clarity without structure doesn't compound. It leaks.')",
      "Meta is set — slug + OG image — page is shareable on any surface",
    ],
    outputSchema: `{
      "distillation": "one self-sustainable sentence — the landing page's promise + tribe in tribe language (Situational Identity, no labels)",
      "headline": "stop-the-scroll headline in tribe language — names current state, not aspirational positioning",
      "subheadline": "supporting one-liner — proximity reframe shape ('one structural layer away', not 'transform your life')",
      "pain_section": "the consequence block — tribe's exact lived experience + time-bound cost of inaction. Pain-first frequency: what it costs to stay stuck.",
      "promise_section": "the transformation — A→B from the promise artifact, in tribe language",
      "proof_section": ["testimonial or before-after — concrete, named, results-specific"],
      "value_ladder_section": "pricing tiers with dissimilar-category anchors. NOT same-category ('less than coaching') — collapses comparison.",
      "cta": {
        "text": "identity-shift language — 'I'm done circling this — let's build it' / 'See exactly why this hasn't turned into income'. NOT 'Buy now' / 'Get started' / 'Learn more'.",
        "mechanism": "stripe | calcom | custom",
        "url": "string"
      },
      "meta": { "slug": "url-safe slug", "og_image": "optional URL" }
    }`,
    generationGuidance: `The landing page is the operational instantiation of FOUR principles: Controlled Collapse + Decision Language + Situational Identity + Pain-First Frequency.

DUAL-FREQUENCY (load-bearing):
  • Content (Instagram, LinkedIn, podcast) = SIGNAL-FIRST — what's alive in the founder, what's true and being discovered
  • Funnel (landing page, email sequence) = PAIN-FIRST — what it COSTS the tribe to stay stuck, what staying the same destroys over the next 6-12 months
  This is the most-violated principle. Landing pages that sing about "what's right" don't convert. The landing page is where the pain (forensically named in the pain artifact) is mirrored back as STAKES.

SITUATIONAL IDENTITY (in body copy):
  Replace ALL identity labels with lived-experience language:
  • "Founders in transition" → "People who know they're meant to build something of their own…"
  • "Coaches and consultants" → "People who are already valuable — but it's not structured into income"
  Scrub the draft for "founder", "entrepreneur", "coach", "consultant", "expert" — rewrite as situational.

CANONICAL SEQUENCE (top to bottom):
  1. Hero — headline + Proximity Reframe ('You're one structural layer away')
  2. Consequence Block — pain-first: '6-12 months in the same loop. Not because you're wrong. Because this isn't structured yet.'
  3. Social Proof / Video — concrete, named, before-after
  4. Micro-Commitment — 1-question diagnostic so the reader self-identifies into the tribe
  5. Pricing — value ladder with DISSIMILAR-category anchors
  6. Final CTA + Pressure Line — 'Clarity without structure doesn't compound. It leaks.' + identity-shift button

DECISION LANGUAGE CTAs (NOT curiosity):
  • Curiosity ❌: 'Take the quiz', 'Learn more', 'Watch this'
  • Decision ✅: 'See what's blocking this', 'Understand why this hasn't turned into income', 'I'm done circling this — let's build it'

CANONICAL PRESSURE LINE shapes (for SHAPE only, do NOT copy):
  • 'Clarity without structure doesn't compound. It leaks.'
  • 'Patterns don't get paid. Business structure around them does.'
  Note: the pressure line is short, structural, indisputable. It seals the consequence_block emotionally.

ANTI-PATTERNS:
  • NOT signal-first copy on landing (that's content's job)
  • NOT feature-first ('15 modules, 12 worksheets')
  • NOT identity-label-based messaging
  • NOT curiosity-language CTAs
  • NOT same-category price anchors
  • NOT manufactured urgency ('Spots filling fast' to affluent audiences)
  • NOT a content piece — landing is decision-language, not exploratory

COMPOSITION:
  Compose from frictionless_purchase + pain + promise + value_ladder + tuning_fork. Each downstream sibling fed into a section. Don't reinvent — synthesize.`,
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
