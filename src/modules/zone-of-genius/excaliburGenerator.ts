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
GENIUS BUSINESS OS — Core Principle:
Transform your Zone of Genius into a clear, actionable business that serves your ideal clients.

GUIDING TENETS:
1. Simplicity is Sacred — If it can't be said in one breath, refine it.
2. Essence Over Form — The offering cuts at the level of truth, not decoration.
3. Transformation Focus — Clear Point A to Point B journey for clients.
4. Immediate Usability — User knows exactly: what to offer, to whom, how.
5. Absurd Focus — One offer, one audience, one transformation.
6. Delight Standard — Must feel inevitable, obvious, elegant.

TEST OF CLARITY:
1. Is the 3-word business name memorable and clear?
2. Does the tagline pass the Product Hunt test (7 words max, "Uber for X" clarity)?
3. Is the transformational promise crystal clear (Point A → Point B)?
4. Would someone understand your offer in 5 seconds?
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
The Genius Business contains these sections:

1. Business Identity (NEW - synthesized from AppleSeed)
   - Business Name (exactly 3 words - memorable, clear)
   - Tagline (7 words max - Product Hunt style, "Uber for X" clarity)

2. Essence Anchor (from AppleSeed)
   - Genius Apple Seed (formerly Core Vibration)
   - Prime Driver (3-word formula)
   - Compound Archetype

3. Your Offer (The Sword)
   - Offer (1 sentence — absurdly clear, merges what you do + for whom + outcome)
   - Form: Session / Sprint / Container / Tool
   - Deliverable (what they walk away with)

4. Ideal Client (Who This Is For)
   - Who benefits most? (specific profile)
   - What problem/block does this solve?
   - Immediate Aha (their internal realization)

5. Transformational Promise
   - From State (Point A - where they start)
   - To State (Point B - where they end up)
   - The Journey (what happens in between)

6. Channels (How to Reach Them)
   - Primary Channel (where clients come from)
   - Secondary Channel
   - Message / Hook (1 sentence)

7. The Bigger Arc (Vision)
   - How this offer fits your bigger purpose
   - The moonshot this bridges toward
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
  "businessIdentity": {
    "name": "string - exactly 3 words, memorable business name",
    "tagline": "string - 7 words max, Product Hunt style (e.g., 'Executive coaching for burnt-out founders')"
  },
  "essenceAnchor": {
    "geniusAppleSeed": "string - the core vibration/essence",
    "primeDriver": "string - 3-word formula",
    "archetype": "string - compound archetype"
  },
  "offer": {
    "statement": "string - ONE sentence combining: what you do + for whom + outcome",
    "form": "string - Session / Sprint / Container / Tool",
    "deliverable": "string - what they walk away with"
  },
  "idealClient": {
    "profile": "string - specific description of who benefits most",
    "problem": "string - what block/struggle this solves",
    "aha": "string - their internal realization moment"
  },
  "transformationalPromise": {
    "fromState": "string - Point A, where they start",
    "toState": "string - Point B, where they end up",
    "journey": "string - what happens in between"
  },
  "channels": {
    "primary": "string - main channel where clients come from",
    "secondary": "string - backup channel",
    "hook": "string - 1 sentence message/hook"
  },
  "biggerArc": {
    "vision": "string - how this fits the bigger purpose",
    "moonshot": "string - the venture/moonshot this bridges toward"
  }
}
`;

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export interface ExcaliburData {
  businessIdentity: {
    name: string;           // 3-word business name
    tagline: string;        // 7 words max, Product Hunt style
  };
  essenceAnchor: {
    geniusAppleSeed: string;    // was: coreVibration
    geniusAppleSeed_plain?: string;
    primeDriver: string;
    primeDriver_plain?: string;
    archetype: string;
    archetype_plain?: string;
  };
  offer: {
    statement: string;      // merged single sentence
    form: string;
    deliverable: string;
  };
  idealClient: {
    profile: string;
    problem: string;
    aha: string;
  };
  transformationalPromise: {
    fromState: string;      // Point A
    toState: string;        // Point B
    journey: string;
  };
  channels: {
    primary: string;
    secondary: string;
    hook: string;
  };
  biggerArc: {
    vision: string;
    moonshot: string;
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
 * Generate an Excalibur (genius-powered offer) based on Appleseed
 * @param appleseed - The user's Appleseed (Zone of Genius)
 * @returns Promise<ExcaliburData> - The generated Excalibur
 */
export const generateExcalibur = async (appleseed: AppleseedData): Promise<ExcaliburData> => {
  const prompt = buildExcaliburPrompt(appleseed);

  // Add 30 second timeout to prevent infinite hangs
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Request timed out after 30 seconds. Please try again.")), 30000);
  });

  const fetchPromise = supabase.functions.invoke("generate-excalibur", {
    body: { prompt, appleseed },
  });

  const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

  if (error) {
    console.error("[generateExcalibur] Error:", error);
    throw new Error(error.message || "Failed to generate Excalibur");
  }

  if (data?.error) {
    console.error("[generateExcalibur] Data error:", data.error);
    throw new Error(data.error);
  }

  if (!data?.excalibur) {
    console.error("[generateExcalibur] No excalibur in response:", data);
    throw new Error("No excalibur data in response");
  }

  return data.excalibur as ExcaliburData;
};
