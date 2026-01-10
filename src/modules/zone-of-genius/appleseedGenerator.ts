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
After generating the initial Appleseed, internally refine it:

ROUND 1: Roast with tough love. What's generic? What's imprecise? Where did you play safe?
ROUND 2: Continue roasting. What else is flat? Where is signal diluted?
ROUND 3: Now synthesize. Fix what's weak. Amplify signal. Cut noise.

The final output should:
- Have a Vibrational Key that is UNIQUE (not generic like "Visionary Leader")
- Life Scene should be SENSORY and SPECIFIC
- No filler words in the Elevator Pitch
- Person would recognize themselves instantly
`;

// ---------------------------------------------------------------------------
// OUTPUT FORMAT
// ---------------------------------------------------------------------------

export const OUTPUT_FORMAT = `
Return a JSON object with this exact structure:
{
  "bullseyeSentence": "string - one phrase essence",
  "vibrationalKey": {
    "name": "string - e.g. Architect of Integration Codes",
    "tagline": "string - e.g. He who sees what wants to be whole..."
  },
  "threeLenses": {
    "actions": ["string", "string", "string", "string", "string"],
    "primeDriver": "string - 3 words",
    "archetype": "string - compound archetype"
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
// FULL PROMPT CONSTRUCTOR
// ---------------------------------------------------------------------------

export const buildAppleseedPrompt = (rawSignal: string): string => {
    return `You are an Appleseed Generator — a system that transforms raw understanding of someone's genius into a high-precision, archetypal profile.

${APPLESEED_TEMPLATE}

${CALIBRATION_EXAMPLES}

${ROASTING_INSTRUCTIONS}

---

Now, generate an Appleseed for this person based on the following input:

${rawSignal}

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
    };
    threeLenses: {
        actions: string[];
        primeDriver: string;
        archetype: string;
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
// GENERATION FUNCTION (Placeholder for Lovable AI integration)
// ---------------------------------------------------------------------------

/**
 * Generate an Appleseed from raw signal.
 * 
 * TODO: LOVABLE AI INTEGRATION
 * This function should call Lovable's built-in AI model.
 * When implementing in Lovable, this is where the AI call goes.
 * 
 * @param rawSignal - The user's pasted AI response about their genius
 * @returns Promise<AppleseedData> - The generated Appleseed
 */
export const generateAppleseed = async (rawSignal: string): Promise<AppleseedData> => {
    const prompt = buildAppleseedPrompt(rawSignal);

    // =========================================================================
    // 🔮 LOVABLE AI INTEGRATION POINT
    // =========================================================================
    // 
    // Lovable: Please integrate your built-in AI model here.
    // 
    // The prompt is ready in the 'prompt' variable.
    // Call your AI with this prompt and parse the JSON response.
    // 
    // Expected: AI returns a JSON object matching AppleseedData interface.
    // 
    // Example integration pattern:
    // const response = await lovableAI.generate({ prompt, type: 'json' });
    // const appleseed = JSON.parse(response);
    // return appleseed;
    // 
    // =========================================================================

    // TEMPORARY: Return mock data until Lovable integrates AI
    console.log('Appleseed prompt ready:', prompt.substring(0, 200) + '...');

    throw new Error('AI integration pending. Please integrate Lovable AI model here.');
};
