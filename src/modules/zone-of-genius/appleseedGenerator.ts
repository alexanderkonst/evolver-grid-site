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
9. Monetization Avenues — How to monetize
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
- Vibrational Key: ✦ Architect of Integration Codes ✦ "He who sees what wants to be whole — and builds the blueprint."
- Actions: Envision • Architect • Activate • Orchestrate • Translate
- Prime Driver: Activate Dormant Potential
- Archetype: Visionary Architect — Evolutionary Mirror
- Life Scene: On a rooftop in Lisbon, speaks a single sentence that reorganizes a room of 12 founders. Eyes light up. One weeps in recognition. Someone whispers: "I remembered who I am."

EXAMPLE 2: KARIME
Input: Zone of genius is restoring Love and coherence by sensing the unseen, reconnecting the disconnected, harmonizing until healing becomes natural. Core triad: Sensing, Bonding, Harmonizing.
Output:
- Vibrational Key: ✦ Bridge of the Love Source ✦ "She who plugs hearts back into the Source — and tends the field until love returns."
- Actions: Sense · Harmonize · Midwife · Reweave · Bless
- Prime Driver: Restore Feminine Coherence
- Archetype: Sacred Feminine Midwife — Empath-Integrator
- Life Scene: A woman arrives with cracked heart and tired smile. Slowly, armor softens. She weeps, not from pain, but because she remembers: I am held. I am loved. I am home.

EXAMPLE 3: TRACEY
Input: Maps communities, individuals, events. Uplifts people, connects them. Gives personalized readings on personality types. Meta-intention: leaders on purpose, plugged in.
Output:
- Vibrational Key: ✦ Constellation Oracle ✦ "She who sees the invisible pattern, senses the hour, and seats the soul in its appointed place."
- Actions: Map · Mirror · Weave · Prime · Fire
- Prime Driver: Ignite Timed Alignment
- Archetype: Constellation Architect · Kairos Mirror
- Life Scene: Ten humans enter a living room. Tracey mirrors one man's gift. Names a woman's function. Someone cries. Someone quits their job. The mesh fires. The mission moves.

EXAMPLE 4: TYLOR
Input: Create regenerative systems for humans to reconnect with self, land, ancestors. Crafting visions, taking leadership to build a better world.
Output:
- Vibrational Key: ✦ Temple Systems Builder ✦ "He who hears the memory of the land and translates it into form."
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
Mark every weak field. Do not skip this round.

ROUND 2 — TEST FOR SIGNAL. For every salvaged field, ask:
- Would this person, reading the field cold, say "this is me, and only me" — or "yeah this could be anyone with similar interests"? Only the first answer passes.
- Does the Archetype combine TWO things in tension (e.g., "Mythic Builder × Land Listener")? Single-word archetypes lack depth.
- Does each Mastery Stage describe a distinct evolutionary leap, or are stages just "more of the same skill"? If repetitive, redesign.
- Are the "Appreciated For" entries describing concrete effects in concrete situations, or generic value-prop language?
Reject anything that fails. Rewrite or remove.

ROUND 3 — AMPLIFY AND CRYSTALLIZE:
- Replace abstract nouns with concrete images.
- Replace common verbs with precise verbs.
- Cut every adjective that doesn't carry meaning.
- The Elevator Pitch must land in one breath, zero filler.
- The Life Scene must be physically vivid — the person should feel seen, not described.

NON-NEGOTIABLE OUTPUT BAR:
✗ No "Visionary Leader," "Strategic Coach," "Heart-Centered Healer" or other LinkedIn-flavored archetypes
✗ No filler in Elevator Pitch ("passionate about," "deeply committed," "helps people achieve")
✗ No abstract Life Scenes — minimum 3 concrete sensory anchors
✗ No repetitive Mastery Stages — each must be a distinct evolutionary leap
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
    "name": "string - e.g. Architect of Integration Codes",
    "tagline": "string - e.g. He who sees what wants to be whole...",
    "tagline_simple": "string - one sentence anyone can understand"
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
    "skillsWise": "string",
    "geniusWise": "string",
    "archetypeWise": "string",
    "synergy": "string"
  },
  "monetizationAvenues": ["string", "string", "string"],
  "lifeScene": "string - sensory, embodied, specific",
  "visualCodes": [
    {
      "symbol": "string",
      "meaning": "string"
    }
  ],
  "elevatorPitch": "string - no filler words"
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
}

// ---------------------------------------------------------------------------
// GENERATION FUNCTION (Lovable AI integration)
// ---------------------------------------------------------------------------

import { supabase } from "@/integrations/supabase/client";

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

  return data.appleseed as AppleseedData;
};
