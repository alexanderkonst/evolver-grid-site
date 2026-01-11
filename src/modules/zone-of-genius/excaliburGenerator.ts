/**
 * Excalibur Generation Prompt
 * 
 * Transforms Appleseed (Zone of Genius) into a Unique Genius Offering.
 * 
 * The prompt includes:
 * 1. Excalibur philosophy
 * 2. Layers of Monetization
 * 3. Template structure
 * 4. Calibration examples (3 samples)
 * 5. Roasting instructions
 * 6. Output format
 */

import { AppleseedData } from './appleseedGenerator';
import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// EXCALIBUR PHILOSOPHY
// ---------------------------------------------------------------------------

export const EXCALIBUR_PHILOSOPHY = `
EXCALIBUR OS — Core Principle:
One sword, not many. The power comes from absurd simplicity, singular focus, and undeniable sharpness.

GUIDING TENETS:
1. Simplicity is Sacred — If it can't be said in one breath, it's not Excalibur.
2. Essence Over Form — The sword cuts at the level of truth, not decoration.
3. Survival Unlock First — It must pierce survival fog immediately.
4. Immediate Usability — User knows exactly: what to do, when, with whom.
5. Absurd Focus — One offer, one audience, one transformation.
6. Delight Standard — Must feel inevitable, obvious, elegant.

TEST OF SHARPNESS:
1. Is it one sword or a bundle of sticks?
2. Does it cut survival fog immediately?
3. Would someone pay for it today?
4. Does the user walk away saying: "This is mine. Let's go."?
`;

// ---------------------------------------------------------------------------
// LAYERS OF MONETIZATION
// ---------------------------------------------------------------------------

export const LAYERS_OF_MONETIZATION = `
Seven layers that convert essence into offer:

① Signal — What truth, genius, or frequency wants to come through now?
② Ideal Client — Who, in which life situation, is this frequency most useful?
③ Form — What is the natural shape? (session, sprint, container, tool)
④ Value — What transformation does the ideal client receive?
⑤ Exchange — What is the right energy exchange (price, equity, gift)?
⑥ Channel — What is the most natural flow of connection?
⑦ Convergence — What moonshot is bridged by this offer?
`;

// ---------------------------------------------------------------------------
// EXCALIBUR TEMPLATE
// ---------------------------------------------------------------------------

export const EXCALIBUR_TEMPLATE = `
The Excalibur contains 7 sections:

1. Essence Anchor (from AppleSeed)
   - Core Vibration
   - Prime Driver (3-word formula)
   - Compound Archetype

2. Excalibur (The Sword)
   - Excalibur Offer (1 sentence — absurdly clear)
   - Form: Session / Sprint / Container / Tool
   - Promise (what transformation)
   - Deliverable (what they walk away with)

3. Value (Survival Unlock)
   - Who benefits most? (specific profile)
   - What survival-block does this cut?
   - Immediate Aha (their internal realization)

4. Exchange (Energy Flow)
   - Pricing (specific numbers)
   - Optional Pathways (rev-share, equity, gift)

5. Channel (Connection Flow)
   - Primary Channel (where clients come from)
   - Secondary Channel
   - Message / Hook (1 sentence)

6. Convergence Point
   - How this offer fits the bigger arc
   - Next portal (venture / moonshot)

7. Immediate Next Step
   - Action (specific)
   - When (timeframe)
   - With Whom (specific people or profiles)
`;

// ---------------------------------------------------------------------------
// CALIBRATION EXAMPLES
// ---------------------------------------------------------------------------

export const EXCALIBUR_EXAMPLES = `
EXAMPLE 1: KARIME
AppleSeed: Sacred Mirror · Mother Healer · Feminine Leader Midwife. Prime Driver: Reconnect · Restore · Remember
Excalibur:
- Offer: "I guide high-performing women out of burnout and back into sovereign, sacred wholeness—so they can lead from deep inner connection, not overextension."
- Form: 3-month Container (8 sessions + rituals + voice support)
- Price: $1,111–$1,777 sliding scale
- Who: Women leaders burned out, hyper-responsible, afraid of not being enough
- Survival Unlock: The need to earn love through doing. Unhooks inner orphan from chasing approval.
- Aha: "My performance isn't who I am. I am loved as I am."
- Channel: Instagram @karimeawakens + referrals
- Hook: "You don't have to keep performing to be loved — come home to the sacred within."
- Next Step: Reach out to 5 women this week

EXAMPLE 2: TRACEY
AppleSeed: Network Cartographer • Timing Oracle. Prime Driver: Align Purpose with Position
Excalibur:
- Offer: "I work with people between chapters to help them choose the few rooms and roles that are truly theirs, leave what isn't, and step into right settings with warm introductions — so they don't drift into another 2–3-year detour."
- Form: 2-session Right Rooms, Real Role process
- Price: $1,500–$3,000
- Who: Leaders who've built things, are in many rooms, between chapters
- Survival Unlock: The pattern "if I stay in everything, I'll be safe and won't miss out"
- Aha: "I don't need more options. I need to choose my real place."
- Channel: Personal invitations + LinkedIn honest shares
- Hook: "You're in many good rooms, but not clearly in your place — let's choose your real game."
- Next Step: Invite 3–5 people into pilot within 30 days

EXAMPLE 3: TYLOR
AppleSeed: Temple Builder of Futures · Land Listener · Team Firekeeper. Prime Driver: Forge Sacred Form
Excalibur:
- Offer: "For Visionary Stewards whose New Earth land project is stuck between vision and construction, I serve as Sacred Architect to distill a Project Soulprint and translate it into a buildable roadmap."
- Form: Structural Reset — 6–7 hour Land Vision Architecture Sprint
- Price: Starting $3,333, scaling to $7,500+
- Who: Land stewards with land, purpose, some funding, stuck in Money–Motion Gap
- Survival Unlock: Paralysis between "we have the dream" and "we know what to build first"
- Aha: "I don't have to hold this alone. This is a real, buildable project now."
- Channel: Warm intros from regenerative investors + From The Ashes platform
- Hook: "Stop letting your land project live only in ceremonies — make it a buildable blueprint."
- Next Step: Reach out to 3 people with stuck land projects within 30 days
`;

// ---------------------------------------------------------------------------
// ROASTING INSTRUCTIONS
// ---------------------------------------------------------------------------

export const EXCALIBUR_ROASTING = `
After generating the initial Excalibur, internally refine it:

ROUND 1: Is this one sword or a bundle of sticks? Is the offer absurdly simple?
ROUND 2: Would someone pay TODAY? Is survival fog truly cut?
ROUND 3: Does the person walk away saying "This is mine. Let's go."?

The final output should:
- Have ONE clear offer sentence (not two or three)
- Have SPECIFIC pricing (not "TBD" or "ask")
- Have CONCRETE next step (not "think about it")
- Cut survival fog with immediate aha
`;

// ---------------------------------------------------------------------------
// OUTPUT FORMAT
// ---------------------------------------------------------------------------

export const EXCALIBUR_OUTPUT_FORMAT = `
Return a JSON object with this exact structure:
{
  "essenceAnchor": {
    "coreVibration": "string - from AppleSeed",
    "primeDriver": "string - 3-word formula",
    "archetype": "string - compound archetype"
  },
  "sword": {
    "offer": "string - ONE sentence, absurdly clear",
    "form": "string - Session / Sprint / Container / Tool",
    "promise": "string - what transformation",
    "deliverable": "string - what they walk away with"
  },
  "value": {
    "whoBenefitsMost": "string - specific profile",
    "survivalBlock": "string - what this cuts",
    "immediateAha": "string - their internal realization"
  },
  "exchange": {
    "pricing": "string - specific numbers",
    "optionalPathways": "string - rev-share, equity, gift options"
  },
  "channel": {
    "primary": "string - where clients come from",
    "secondary": "string - backup channel",
    "messageHook": "string - 1 sentence hook"
  },
  "convergence": {
    "biggerArc": "string - how this fits",
    "nextPortal": "string - venture / moonshot"
  },
  "immediateNextStep": {
    "action": "string - specific action",
    "when": "string - timeframe",
    "withWhom": "string - specific people or profiles"
  }
}
`;

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export interface ExcaliburData {
    essenceAnchor: {
        coreVibration: string;
        primeDriver: string;
        archetype: string;
    };
    sword: {
        offer: string;
        form: string;
        promise: string;
        deliverable: string;
    };
    value: {
        whoBenefitsMost: string;
        survivalBlock: string;
        immediateAha: string;
    };
    exchange: {
        pricing: string;
        optionalPathways: string;
    };
    channel: {
        primary: string;
        secondary: string;
        messageHook: string;
    };
    convergence: {
        biggerArc: string;
        nextPortal: string;
    };
    immediateNextStep: {
        action: string;
        when: string;
        withWhom: string;
    };
}

// ---------------------------------------------------------------------------
// FULL PROMPT CONSTRUCTOR
// ---------------------------------------------------------------------------

export const buildExcaliburPrompt = (appleseed: AppleseedData): string => {
    // Extract key info from Appleseed
    const appleseedSummary = `
APPLESEED (Zone of Genius):
- Vibrational Key: ${appleseed.vibrationalKey.name}
- Tagline: "${appleseed.vibrationalKey.tagline}"
- Prime Driver: ${appleseed.threeLenses.primeDriver}
- Archetype: ${appleseed.threeLenses.archetype}
- Actions: ${appleseed.threeLenses.actions.join(' • ')}
- Elevator Pitch: ${appleseed.elevatorPitch}
- Appreciated For: ${appleseed.appreciatedFor.map(a => a.effect).join(', ')}
- Monetization Avenues: ${appleseed.monetizationAvenues.join(', ')}
`;

    return `You are an Excalibur Generator — a system that transforms Zone of Genius (Appleseed) into a Unique Genius Offering.

${EXCALIBUR_PHILOSOPHY}

${LAYERS_OF_MONETIZATION}

${EXCALIBUR_TEMPLATE}

${EXCALIBUR_EXAMPLES}

${EXCALIBUR_ROASTING}

---

Now, generate an Excalibur for this person based on their Appleseed:

${appleseedSummary}

---

${EXCALIBUR_OUTPUT_FORMAT}

Return ONLY the JSON object. No explanation. No preamble.`;
};

// ---------------------------------------------------------------------------
// GENERATION FUNCTION (Placeholder for Lovable AI integration)
// ---------------------------------------------------------------------------

/**
 * Generate an Excalibur from Appleseed.
 * 
 * TODO: LOVABLE AI INTEGRATION
 * This function should call Lovable's built-in AI model.
 * 
 * @param appleseed - The user's Appleseed (Zone of Genius)
 * @returns Promise<ExcaliburData> - The generated Excalibur
 */
export const generateExcalibur = async (appleseed: AppleseedData): Promise<ExcaliburData> => {
    const prompt = buildExcaliburPrompt(appleseed);

    const { data, error } = await supabase.functions.invoke("generate-excalibur", {
        body: { prompt, appleseed },
    });

    if (error) {
        console.error("Excalibur generation error:", error);
        throw new Error(error.message || "Failed to generate Excalibur");
    }

    if (data?.error) {
        throw new Error(data.error);
    }

    if (!data?.excalibur) {
        throw new Error("No excalibur data in response");
    }

    return data.excalibur as ExcaliburData;
};
