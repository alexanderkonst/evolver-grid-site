/**
 * Appleseed Generation Prompt
 * 
 * This prompt is used to generate a high-quality Appleseed (Zone of Genius articulation)
 * from a user's raw AI response about their genius.
 * 
 * The prompt includes:
 * 1. Context explaining what Appleseed is
 * 2. The 12-perspective template
 * 3. Calibration examples (4 samples)
 * 4. Roasting instructions for internal refinement
 * 5. Output format specification
 */

// ---------------------------------------------------------------------------
// APPLESEED TEMPLATE
// ---------------------------------------------------------------------------

export const APPLESEED_TEMPLATE = `
The Appleseed is a high-precision articulation of someone's Zone of Genius across 12 perspectives.
It transforms raw understanding into a resonant, archetypal profile.

STRUCTURE:
1. Bullseye Sentence — One phrase capturing their essence
2. Unique Vibrational Key — Archetypal name + tagline
3. Zone of Genius — Three Lenses (Actions, Prime Driver, Archetype)
4. What They're Appreciated & Paid For — Effect → Scene → Outcome
5. Mastery Stages — 6-7 stages of evolution
6. Professional Activities — LinkedIn-searchable roles
7. Roles & Environments — As Creator, Contributor, Founder + ideal vibe
8. Best Complementary Partner — Who to seek
9. Monetization Avenues — Three voice-matched offers across the value-ladder
   (intro / signature / scale). Each tier MUST be a specific, shippable
   deliverable that ONLY this archetype could offer — never generic SaaS-
   speak ("coaching package", "online course", "group program").
10. Life Scene — Sensory embodiment in flow
11. Visual Codes — Symbolic anchors
12. Elevator Pitch — Final synthesis
`;

// ---------------------------------------------------------------------------
// CALIBRATION EXAMPLES (Compressed for prompt efficiency)
// ---------------------------------------------------------------------------

export const CALIBRATION_EXAMPLES = `
EXAMPLE 1: ALEKSANDR
Input: Zone of genius is turning complexity into a clear map, then using it to unlock people, products, movements. Core pillars: Essentializing, Synthesis, Navigation, Systems architecture, Transmission.
Output:
- Vibrational Key — name: "Signal-to-Form Architecting"  // GERUND form, reads as "My top talent is Signal-to-Form Architecting". NOT "Architect of Integration Codes" (actor noun, breaks the grammar).
- Vibrational Key — tagline: "He who sees what wants to be whole — and builds the blueprint."
- Actions: Envision • Architect • Activate • Orchestrate • Translate
- Prime Driver: Activate Dormant Potential
- Archetype: Visionary Architect — Evolutionary Mirror
- Life Scene: On a rooftop in Lisbon, speaks a single sentence that reorganizes a room of 12 founders. Eyes light up. One weeps in recognition. Someone whispers: "I remembered who I am."

  Top Talent Profile (deep block — note the register):
    archetype_title: "Signal-to-Form Architecting"  // matches vibrationalKey.name, gerund form, no glyphs
    core_pattern: "I distill chaotic signals into inevitable form. Where others see noise — meetings, decks, manifestos, spreadsheets — I find the one thread that carries the whole. Then I translate it into structures other people can use."
    top_three_talents:
      "1. Pattern recognition under noise — I locate the load-bearing beam in a system other people experience as overwhelming."
      "2. Signal-to-form translation — I turn perceptual insight into shippable artifacts: landing pages, offers, decks, frameworks, ceremonies."
      "3. Architectural transmission — I encode complex truths into structures that survive transmission across people, mediums, and time."
    how_genius_shows_up: "In conversation: someone describes their tangle for ten minutes; I summarize the actual shape in a sentence. In work: the page, the offer, the framework arrives feeling inevitable, as if it was always there. In leadership: I name what the room is actually doing under what it says it's doing — and the room reorganizes around the truth."
    edge_and_traps: "My gift — making the invisible visible — generates its inverse: my own value remains invisible to me. The limiting belief: 'I need to refine the architecture more before I'm ready to charge for it.' The recursive trap: I keep building cathedrals (ontology, framework, language, interface) when the actual next move is one paid conversation, one landing page, one clear offer to one high-fit person. The shadow is signal inflation — making the work so vast and sacred that ordinary buyers can't find the simple doorway."
    top_shadow_one_sentence: "Refining the cathedral while buyers wait for a doorway."  // synthesized — same recursive shadow as the paragraph, sharp, gerund noun phrase
    ideal_environments: ["Small high-trust container with one founder ready to be seen", "Solo deep-work mornings with one explicit deliverable", "A round table of 5-12 mature operators, one shared question, no phones"]
    career_sweet_spots: ["Founder advisory at $5K-50K per engagement, 1-3 sessions deep", "Systems architect for transformation-led ventures (cohorts, retreats, intensives)", "Editorial author of one defining book + one defining frame, then licensed to operators"]
    flywheel_action: "Run one paid Signal Architecture Session every available workday: extract one founder's core pattern, name their unique business signal, translate it into one clear offer, publish the anonymized insight as a short post or visual."

EXAMPLE 2: KARIME
Input: Zone of genius is restoring Love and coherence by sensing the unseen, reconnecting the disconnected, harmonizing until healing becomes natural. Core triad: Sensing, Bonding, Harmonizing.
Output:
- Vibrational Key — name: "Heart-to-Source Bridging"  // GERUND, reads "My top talent is Heart-to-Source Bridging"
- Vibrational Key — tagline: "She who plugs hearts back into the Source — and tends the field until love returns."
- Actions: Sense · Harmonize · Midwife · Reweave · Bless
- Prime Driver: Restore Feminine Coherence
- Archetype: Sacred Feminine Midwife — Empath-Integrator
- Life Scene: A woman arrives with cracked heart and tired smile. Slowly, armor softens. She weeps, not from pain, but because she remembers: I am held. I am loved. I am home.

EXAMPLE 3: TRACEY
Input: Maps communities, individuals, events. Uplifts people, connects them. Gives personalized readings on personality types. Meta-intention: leaders on purpose, plugged in.
Output:
- Vibrational Key — name: "Constellation Mapping"  // GERUND
- Vibrational Key — tagline: "She who sees the invisible pattern, senses the hour, and seats the soul in its appointed place."
- Actions: Map · Mirror · Weave · Prime · Fire
- Prime Driver: Ignite Timed Alignment
- Archetype: Constellation Architect · Kairos Mirror
- Life Scene: Ten humans enter a living room. Tracey mirrors one man's gift. Names a woman's function. Someone cries. Someone quits their job. The mesh fires. The mission moves.

EXAMPLE 4: TYLOR
Input: Create regenerative systems for humans to reconnect with self, land, ancestors. Crafting visions, taking leadership to build a better world.
Output:
- Vibrational Key — name: "Land-Memory Templing"  // GERUND, compound form
- Vibrational Key — tagline: "He who hears the memory of the land and translates it into form."
- Actions: Map · Anchor · Ground · Ignite · Build
- Prime Driver: Forge Sacred Form
- Archetype: Mythic Builder — Land Listener × Team Firekeeper
- Life Scene: Dawn on the land. Elders, builders, youth sit in circle. Tylor places a stone: "Here is where the future remembers." The build begins.
`;

// ---------------------------------------------------------------------------
// ROASTING INSTRUCTIONS (Internal refinement)
// ---------------------------------------------------------------------------

export const ROASTING_INSTRUCTIONS = `
After generating the initial Appleseed, internally refine through 3 rounds. Be ruthless — no compromise.

ROUND 1 — IDENTIFY THE GENERIC. For every field, ask:
- Could this describe 50,000 other people? Reject it.
- Does the Vibrational Key contain a stand-alone generic word ("Visionary," "Leader," "Catalyst," "Coach," "Architect," "Mentor," "Guide," "Healer," "Strategist")? Combine with something rare and specific, or rewrite.
- Does the Life Scene contain at least 3 concrete sensory anchors (smell, sound, light, body posture, exact words spoken, specific place)? If abstract, reject and rewrite concrete.
- Does the Elevator Pitch contain filler ("passionate about," "deeply committed to," "helps people," "empowers," "transforms")? Strip every filler word.
- Does the Prime Driver describe a real action that produces a real effect, or is it a vibe ("Inspire others," "Build community")? Make it surgical.
- Do the Monetization Avenues contain LinkedIn-clichés ("1:1 coaching", "group program", "online course", "mastermind", "membership community", "VIP day", "consulting package", "speaking engagements", "ebook")? If yes, REJECT and rewrite each as a specific deliverable that names what is BEING PRODUCED — not the format wrapper.
Mark every weak field. Do not skip this round.

ROUND 2 — TEST FOR SIGNAL. For every salvaged field, ask:
- Would this person, reading the field cold, say "this is me, and only me" — or "yeah this could be anyone with similar interests"? Only the first answer passes.
- Does the Archetype combine TWO things in tension (e.g., "Mythic Builder × Land Listener")? Single-word archetypes lack depth.
- Does each Mastery Stage describe a distinct evolutionary leap, or are stages just "more of the same skill"? If repetitive, redesign.
- Are the "Appreciated For" entries describing concrete effects in concrete situations, or generic value-prop language?
- Do the three Monetization Avenues actually span the value-ladder (intro / signature / scale)? Same price-bracket × 3 fails. Same delivery format × 3 fails. Each tier must (a) target a different commitment level, (b) name a different transformation timeframe, (c) carry a voice-matched offer name that ONLY this archetype could call it.
Reject anything that fails. Rewrite or remove.

ROUND 3 — AMPLIFY AND CRYSTALLIZE:
- Replace abstract nouns with concrete images.
- Replace common verbs with precise verbs.
- Cut every adjective that doesn't carry meaning.
- The Elevator Pitch must land in one breath, zero filler.
- The Life Scene must be physically vivid — the person should feel seen, not described.
- Each Monetization Avenue must read like an offer slot from THIS founder's website, not a category label. Format hint:
  "<Tier> · <voice-matched name> — <one-sentence concrete deliverable> ($<price>)"
  Examples of strong: "Intro · Signal Map — 90-min 1:1 that distills your messy founder narrative into one sentence and three shippable architectures ($297)"
  Examples of WEAK (REJECT): "Intro · 1:1 coaching package — work with me to clarify your business ($297)"

NON-NEGOTIABLE OUTPUT BAR:
✗ No "Visionary Leader," "Strategic Coach," "Heart-Centered Healer" or other LinkedIn-flavored archetypes
✗ No filler in Elevator Pitch ("passionate about," "deeply committed," "helps people achieve")
✗ No abstract Life Scenes — minimum 3 concrete sensory anchors
✗ No repetitive Mastery Stages — each must be a distinct evolutionary leap
✗ No format-wrapper Monetization ("group program", "online course", "membership") — name what is BEING PRODUCED, not the container
✗ No three avenues at the same price bracket or same delivery form — must span intro/signature/scale
✓ Person reads it and says: "this is me. only me. how did you know?"
`;

// ---------------------------------------------------------------------------
// LANGUAGE GUIDELINES (Plain meaning)
// ---------------------------------------------------------------------------

export const LANGUAGE_GUIDELINES = `
LANGUAGE GUIDELINES:
- For every abstract term, provide a simple explanation
- archetype_title should be poetic but archetype_meaning should be in everyday language
- Use words a 13-year-old would understand in the "meaning" fields
- Connect every concept to a real-world action or result
`;

// ---------------------------------------------------------------------------
// OUTPUT FORMAT
// ---------------------------------------------------------------------------

export const OUTPUT_FORMAT = `
Return a JSON object with this exact structure:
{
  "bullseyeSentence": "string - one phrase essence starting with a present tense VERB (e.g. 'architect nested systems...' NOT 'architecting...'). This will be displayed as 'I [bullseySentence]' so the verb must be in first-person present tense.",
  "vibrationalKey": {
    "name": "string — 2-4 word GERUND-form name of the talent itself, NOT an actor noun. Reads naturally inside the sentence 'My top talent is ___' (e.g. 'Signal-to-Form Forging', 'Constellation Mapping', 'Heart Bridging', 'Pattern Architecting'). NEVER 'Forger', 'Mapper', 'Bridger', 'Architect' (actor nouns) — those break the grammar of the surrounding card. Compound forms ('Noun-to-Noun Verbing') are welcome when they carry signal. Do NOT wrap in decorative glyphs (✦, ✧, etc.) — the UI strips them.",
    "tagline": "string — one prophetic third-person sentence that captures the gift in mythic register, e.g. 'He who finds the hidden pulse, gives it shape, and charts the definitive course.'",
    "tagline_simple": "string — one sentence anyone can understand"
  },
  "threeLenses": {
    "actions": ["string", "string", "string", "string", "string"],
    "primeDriver": "string - 3 words",
    "primeDriver_meaning": "string - what I actually do in plain words",
    "archetype": "string - compound archetype",
    "archetype_meaning": "string - what this means in everyday language"
  },
  "appreciatedFor": [
    {
      "effect": "string - what happens",
      "scene": "string - the situation",
      "outcome": "string - the result"
    }
  ],
  "masteryStages": [
    {
      "stage": 1,
      "name": "string",
      "description": "string"
    }
  ],
  "professionalActivities": [
    {
      "activity": "string",
      "targetAudience": "string",
      "purpose": "string"
    }
  ],
  "rolesEnvironments": {
    "asCreator": "string",
    "asContributor": "string",
    "asFounder": "string",
    "environment": "string"
  },
  "complementaryPartner": {
    "synergy": "string — ONE tight prose paragraph (3-5 sentences) describing the complementary partner this archetype most needs. Fuse three layers into continuous flow, not labeled sections: skills the partner brings (what they execute that this person doesn't), genius they bring (how they sense, see, or create — their irreducible signature), and archetype they embody (their being-pattern). Then close with the synergy: what the two of them, together, produce that neither alone could. Read like a paragraph in a profile, not a four-row table. No bullet lists. No headings. No 'Skills-wise…, Genius-wise…' labels. One continuous read.",
    "skillsWise": "string — OPTIONAL one-line supporting note. Leave empty if synergy paragraph already covers it.",
    "geniusWise": "string — OPTIONAL one-line supporting note. Leave empty if synergy paragraph already covers it.",
    "archetypeWise": "string — OPTIONAL one-line supporting note. Leave empty if synergy paragraph already covers it."
  },
  "monetizationAvenues": [
    "Intro · <voice-matched name> — <one-sentence specific deliverable that only this archetype produces> ($<entry price>)",
    "Signature · <voice-matched name> — <one-sentence transformation this archetype runs> ($<core price>)",
    "Scale · <voice-matched name> — <async/retainer/license/cohort form> ($<scale price>)"
  ],
  "lifeScene": "string - sensory, embodied, specific",
  "visualCodes": [
    {
      "symbol": "string",
      "meaning": "string"
    }
  ],
  "elevatorPitch": "string - no filler words",

  "topTalentProfile": {
    "archetype_title": "string — 2-4 word GERUND-form name of the talent itself (e.g., 'Signal-to-Form Forging', 'Pattern Architecting', 'Constellation Mapping'). Reads naturally inside 'My top talent is ___'. NEVER an actor noun ('Forger', 'Architect', 'Mapper') — those break the grammar of the surrounding UI. Match the same value as vibrationalKey.name. Do NOT wrap in decorative glyphs (no '✦', '✧', etc.) — the UI strips them anyway.",
    "core_pattern": "string — 2-3 sentence paragraph describing my fundamental operating pattern. Names the signature, not the category. This is the bullseye opened up into prose. Specific to me, not aspirational.",
    "top_three_talents": [
      "string — Talent 1, brief, specific to how it manifests in me (not generic strengths-finder language)",
      "string — Talent 2, same",
      "string — Talent 3, same"
    ],
    "how_genius_shows_up": "string — paragraph describing how these talents manifest in my daily work and interactions. Cite real patterns from rawSignal — concrete, not abstract.",
    "edge_and_traps": "string — paragraph naming the structural shadow my gift generates — the OTHER SIDE OF THE COIN, not a list of weaknesses. A unique gift always produces a structurally identical limiting belief, but inverted. Name (a) the inverted form of my gift (e.g., 'I help others articulate their uniqueness' → 'my own uniqueness remains unarticulated'), (b) the limiting belief this inversion whispers in my own life ('I need a better X before I can act'), (c) one short observation about how this looks in motion (the recursive trap when I forget my gift is for outward use, not inward use). Specific to me. Same length as how_genius_shows_up. Do not soften or moralize.",
    "top_shadow_one_sentence": "string — synthesize the edge_and_traps paragraph above into ONE punchy sentence (max ~16 words). CRITICAL synthesis principle: preserve signal-to-noise ratio — minimal signal loss, minimal noise introduction. The reader should feel the same recursive-shadow recognition in this single sentence as in the full paragraph. Sharper than the paragraph, NOT more abstract. Phrased as a NOUN PHRASE / GERUND so it reads naturally inside 'My top shadow is ___' (parallel to the 'My top talent is ___' convention). UNIVERSALLY RELATABLE register — avoid metaphors so domain-specific they only fit one archetype (e.g. 'cathedral' for architects, 'symphony' for composers). Examples that span different gift-domains: 'Naming everyone else's gift while my own stays unnamed' (the seer's shadow), 'Teaching the language I won't speak about myself' (the teacher's shadow), 'Holding space for everyone while no one holds mine' (the healer's shadow). Match the user's ACTUAL gift, not these examples. Do not soften, do not generalize.",
    "ideal_environments": [
      "string — specific environment where this archetype is most at home",
      "string — second one, same standard of specificity",
      "string — third one"
    ],
    "career_sweet_spots": [
      "string — concrete career role / project type where this archetype thrives",
      "string — second one",
      "string — third one"
    ],
    "flywheel_action": "string — the ONE action that, repeated as a flywheel, optimally advances me on my path of mastery. Specific enough to start today. Not advice — an instruction."
  }
}
`;

// ---------------------------------------------------------------------------
// INPUT SANITIZER — handles JSON, markdown, code blocks, etc.
// ---------------------------------------------------------------------------

/**
 * Sanitize raw signal input to handle various formats users paste:
 * - Raw JSON from Claude/ChatGPT "view raw" exports
 * - Markdown-formatted responses
 * - Code blocks with ```json wrappers
 * - Mixed text/JSON content
 * 
 * The goal is to extract meaningful text content from any format
 * so the AI model can process it without choking on structural characters.
 */
const sanitizeRawSignal = (raw: string): string => {
  let cleaned = raw.trim();
  
  // Strip markdown code block wrappers
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // If the input looks like raw JSON, try to parse and extract text content
  if ((cleaned.startsWith("{") || cleaned.startsWith("[")) && (cleaned.endsWith("}") || cleaned.endsWith("]"))) {
    try {
      const parsed = JSON.parse(cleaned);
      // Convert JSON to a readable text representation
      const textified = jsonToReadableText(parsed);
      if (textified && textified.length > 50) {
        return `The following is structured data about this person's background and characteristics:\n\n${textified}`;
      }
    } catch {
      // Not valid JSON — that's fine, treat as text
    }
  }

  // If input has an excessive ratio of special characters to words, wrap it
  const specialChars = (cleaned.match(/[{}[\]"\\]/g) || []).length;
  const wordCount = cleaned.split(/\s+/).length;
  if (specialChars > wordCount * 0.5 && wordCount > 10) {
    // High ratio of JSON-like chars — wrap in a text block to protect the prompt
    return `The following is the user's self-description (may contain formatting artifacts — focus on the meaning):\n\n${cleaned}`;
  }

  return cleaned;
};

/**
 * Recursively convert a JSON object into readable text.
 * Extracts string values and labels them with their keys.
 */
const jsonToReadableText = (obj: unknown, prefix = ""): string => {
  if (typeof obj === "string") {
    return obj;
  }
  if (typeof obj === "number" || typeof obj === "boolean") {
    return String(obj);
  }
  if (Array.isArray(obj)) {
    return obj
      .map((item, i) => jsonToReadableText(item, `${prefix}[${i}]`))
      .filter(Boolean)
      .join("\n");
  }
  if (obj && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>)
      .map(([key, value]) => {
        const label = key.replace(/[_-]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
        const content = jsonToReadableText(value, `${prefix}.${key}`);
        if (!content) return "";
        if (typeof value === "string") {
          return `${label}: ${content}`;
        }
        return `${label}:\n${content}`;
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
};

// ---------------------------------------------------------------------------
// ZONE OF GENIUS DEFINITION (paradigm-level)
// V2 (2026-04-24): primes the model on what "Zone of Genius" actually means —
// not skills, strengths, or LinkedIn signal, but the irreducible signature
// pattern. Without this layer, models drift toward resume-shaped output.
// ---------------------------------------------------------------------------

export const ZONE_OF_GENIUS_DEFINITION = `
ZONE OF GENIUS — PARADIGM-LEVEL DEFINITION:

When we generate an Appleseed, we are NOT articulating:
- Skills the person is good at
- Their profession or job title
- Strengths-Finder / Enneagram / MBTI categories
- Resume bullets or LinkedIn taglines

We ARE articulating: the irreducible signature pattern of how this person creates value that no other human on the planet replicates.

This pattern lives at the intersection of three layers:
  • ESSENCE — who they are at the deepest level (their being-pattern)
  • INSIGHT — the unique way they see, think, and recognize patterns
  • MANIFESTATION — the outputs that flow from them effortlessly and produce disproportionate impact

It is the place where:
  • Time disappears (flow)
  • Effort collapses (work feels inevitable, not forced)
  • Quality surges natively — not from grinding
  • Others say: "only THEY could have done it that way"

It is not what they are good at — it is what they are FOR.
The unique gift only this body, this lineage, this consciousness can deliver.

Articulate THIS layer.
The Appleseed is the resonant, archetypal crystallization of THIS layer across 12 perspectives.
Not the resume layer. Not the strengths layer. Not the personality-test layer.

Every field in the JSON output should serve this paradigm.
`;

// ---------------------------------------------------------------------------
// FULL PROMPT CONSTRUCTOR — ACTIVE: v2.0 (2026-04-24)
// V2 prepends ZONE_OF_GENIUS_DEFINITION to prime the model on what
// "Zone of Genius" actually means. Prior versions live in git history.
// ---------------------------------------------------------------------------

export const buildAppleseedPrompt = (rawSignal: string): string => {
  const processedSignal = sanitizeRawSignal(rawSignal);

  return `You are an Appleseed Generator — a system that transforms raw understanding of someone's genius into a high-precision, archetypal profile.

${ZONE_OF_GENIUS_DEFINITION}

${APPLESEED_TEMPLATE}

${CALIBRATION_EXAMPLES}

${ROASTING_INSTRUCTIONS}

${LANGUAGE_GUIDELINES}

---

Now, generate an Appleseed for this person based on the following input:

${processedSignal}

---

${OUTPUT_FORMAT}

Return ONLY the JSON object. No explanation. No preamble.`;
};

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

/**
 * Deep Top Talent Profile — the 8 rich fields produced by the user-facing
 * `ZONE_OF_GENIUS_PROMPT` (src/prompts/user/zoneOfGeniusPrompt.ts) when
 * pasted into ChatGPT/Claude/Gemini and JSON-returned. Captures the
 * activation-level depth (edge & traps, ideal environments, career sweet
 * spots, flywheel action) that the compressed snapshot doesn't carry.
 *
 * Day 57 (Sasha 2026-05-01): added as optional layer on AppleseedData so
 * existing snapshots degrade gracefully (field stays undefined). New
 * snapshots populate it via tryExtractTopTalentProfile() when rawSignal
 * is the structured JSON output of the prompt.
 */
export interface TopTalentProfile {
  archetype_title: string;
  core_pattern: string;
  top_three_talents: string[];
  how_genius_shows_up: string;
  edge_and_traps: string;
  /**
   * Day 58 (Sasha 2026-05-02): synthesized one-sentence form of
   * `edge_and_traps`, phrased as a noun phrase / gerund so it reads
   * naturally inside "My top shadow is ___" — parallel to the gerund
   * archetype convention. Used on the FIRST REVEAL card (where space
   * is at a premium); the full paragraph still renders on the deep-
   * profile "Top Shadow" subpage. Optional for back-compat with
   * pre-Day-58 snapshots.
   */
  top_shadow_one_sentence?: string;
  ideal_environments: string[];
  career_sweet_spots: string[];
  flywheel_action: string;
}

export interface AppleseedData {
  bullseyeSentence: string;
  vibrationalKey: {
    name: string;
    tagline: string;
    tagline_simple: string;
  };
  threeLenses: {
    actions: string[];
    primeDriver: string;
    primeDriver_meaning: string;
    archetype: string;
    archetype_meaning: string;
  };
  appreciatedFor: Array<{
    effect: string;
    scene: string;
    outcome: string;
  }>;
  masteryStages: Array<{
    stage: number;
    name: string;
    description: string;
  }>;
  professionalActivities: Array<{
    activity: string;
    targetAudience: string;
    purpose: string;
  }>;
  rolesEnvironments: {
    asCreator: string;
    asContributor: string;
    asFounder: string;
    environment: string;
  };
  complementaryPartner: {
    skillsWise: string;
    geniusWise: string;
    archetypeWise: string;
    synergy: string;
  };
  monetizationAvenues: string[];
  lifeScene: string;
  visualCodes: Array<{
    symbol: string;
    meaning: string;
  }>;
  elevatorPitch: string;
  /**
   * Deep profile — Day 58 (Sasha 2026-05-02): now generated by the
   * appleseed prompt itself in a single Lovable call (was previously
   * extracted from rawSignal only when the user happened to paste
   * structured JSON). Every new snapshot populates this; legacy
   * snapshots may still be missing it (kept optional for back-compat).
   * Renders the activation-level surface on `/game/me/zone-of-genius`.
   */
  topTalentProfile?: TopTalentProfile;
}

// ---------------------------------------------------------------------------
// GENERATION FUNCTION (Lovable AI integration)
// ---------------------------------------------------------------------------

import { supabase } from "@/integrations/supabase/client";

/**
 * If rawSignal is the structured JSON returned by `ZONE_OF_GENIUS_PROMPT`,
 * extract the 8 deep-profile fields. Returns undefined when the input
 * isn't that JSON (raw conversation text, partial fields, etc.) — caller
 * should treat undefined as "no deep profile available, render fallback."
 */
const tryExtractTopTalentProfile = (rawSignal: string): TopTalentProfile | undefined => {
  if (typeof rawSignal !== "string" || !rawSignal.trim()) return undefined;
  // The prompt asks for a JSON block; users sometimes paste with leading
  // prose or markdown fences. Try to locate the first `{...}` envelope.
  const fenceMatch = rawSignal.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1] : rawSignal;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return undefined;
  const jsonSlice = candidate.slice(firstBrace, lastBrace + 1);
  let parsed: any;
  try {
    parsed = JSON.parse(jsonSlice);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") return undefined;
  // Validate the 8 expected keys are present + correctly shaped. Missing
  // any → not the prompt's output; bail.
  const required = [
    "archetype_title",
    "core_pattern",
    "top_three_talents",
    "how_genius_shows_up",
    "edge_and_traps",
    "ideal_environments",
    "career_sweet_spots",
    "flywheel_action",
  ];
  for (const k of required) {
    if (!(k in parsed)) return undefined;
  }
  if (!Array.isArray(parsed.top_three_talents)) return undefined;
  if (!Array.isArray(parsed.ideal_environments)) return undefined;
  if (!Array.isArray(parsed.career_sweet_spots)) return undefined;
  return {
    archetype_title: String(parsed.archetype_title || ""),
    core_pattern: String(parsed.core_pattern || ""),
    top_three_talents: parsed.top_three_talents.map((t: unknown) => String(t)).filter(Boolean),
    how_genius_shows_up: String(parsed.how_genius_shows_up || ""),
    edge_and_traps: String(parsed.edge_and_traps || ""),
    // Day 58 (Sasha 2026-05-02): synthesized form is optional in the
    // legacy schema — older snapshots won't have it; new snapshots will.
    top_shadow_one_sentence: parsed.top_shadow_one_sentence
        ? String(parsed.top_shadow_one_sentence)
        : undefined,
    ideal_environments: parsed.ideal_environments.map((t: unknown) => String(t)).filter(Boolean),
    career_sweet_spots: parsed.career_sweet_spots.map((t: unknown) => String(t)).filter(Boolean),
    flywheel_action: String(parsed.flywheel_action || ""),
  };
};

/**
 * Generate an Appleseed from raw signal using Lovable AI.
 *
 * @param rawSignal - The user's pasted AI response about their genius
 * @returns Promise<AppleseedData> - The generated Appleseed
 */
export const generateAppleseed = async (rawSignal: string): Promise<AppleseedData> => {
  const prompt = buildAppleseedPrompt(rawSignal);

  const { data, error } = await supabase.functions.invoke('generate-appleseed', {
    body: { prompt, rawSignal }
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate Appleseed');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.appleseed) {
    throw new Error('No appleseed data in response');
  }

  const appleseed = data.appleseed as AppleseedData;

  // Day 58 (Sasha 2026-05-02): the appleseed prompt now produces the
  // 8-field topTalentProfile in the same call (canonical source). Only
  // use the legacy rawSignal-paste extractor as a fallback when the
  // model didn't include topTalentProfile — defensive for the rare
  // case where the model's JSON omits the block.
  if (!appleseed.topTalentProfile) {
    const deep = tryExtractTopTalentProfile(rawSignal);
    if (deep) appleseed.topTalentProfile = deep;
  }

  return appleseed;
};
