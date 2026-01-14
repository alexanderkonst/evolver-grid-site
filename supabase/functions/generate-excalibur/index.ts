import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---------------------------------------------------------------------------
// EXCALIBUR PHILOSOPHY & TEMPLATES (inlined for edge function)
// ---------------------------------------------------------------------------

const EXCALIBUR_PHILOSOPHY = `
GENIUS BUSINESS OS — Core Principle:
Transform your Zone of Genius into a clear, actionable business that serves your ideal clients.

GUIDING TENETS:
1. Simplicity is Sacred — If it can't be said in one breath, refine it.
2. Essence Over Form — The offering cuts at the level of truth, not decoration.
3. Transformation Focus — Clear Point A to Point B journey for clients.
4. Immediate Usability — User knows exactly: what to offer, to whom, how.
5. Absurd Focus — One offer, one audience, one transformation.
6. Delight Standard — Must feel inevitable, obvious, elegant.
7. Plain Language Rule — Every poetic term must have a plain-language twin.
8. 13-Year-Old Test — If a smart 13-year-old wouldn't understand it, add a simpler version.
9. Practical Anchor — Every description must connect to what the person actually DOES.

TEST OF CLARITY:
1. Is the 3-word business name memorable and clear?
2. Does the tagline pass the Product Hunt test (7 words max, "Uber for X" clarity)?
3. Is the transformational promise crystal clear (Point A → Point B)?
4. Would someone understand your offer in 5 seconds?
`;

const LAYERS_OF_MONETIZATION = `
Seven layers that convert essence into offer:

① Signal — What truth, genius, or frequency wants to come through now?
② Ideal Client — Who, in which life situation, is this frequency most useful?
③ Form — What is the natural shape? (session, sprint, container, tool)
④ Value — What transformation does the ideal client receive?
⑤ Exchange — What is the right energy exchange (price, equity, gift)?
⑥ Channel — What is the most natural flow of connection?
⑦ Convergence — What moonshot is bridged by this offer?
`;

const EXCALIBUR_TEMPLATE = `
The Genius Business contains these sections:

1. Business Identity (NEW - synthesized from AppleSeed)
   - Business Name (exactly 3 words - memorable, clear)
   - Tagline (7 words max - Product Hunt style, "Uber for X" clarity)

2. Essence Anchor (from AppleSeed)
   - Genius Apple Seed (the core vibration/essence)
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

const EXCALIBUR_EXAMPLES = `
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

EXAMPLE 4: PLAIN LANGUAGE DEMO
AppleSeed: Coherent Alchemist
- coreVibration: "Coherent Alchemist"
- coreVibration_plain: "I turn chaos into harmony"
- primeDriver: "Align · Transform · Integrate"
- primeDriver_plain: "I help people and systems find their natural order"
- archetype: "Temple Builder of Futures"
- archetype_plain: "I create structures where people can grow"
`;

const EXCALIBUR_ROASTING = `
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

const EXCALIBUR_OUTPUT_FORMAT = `
Return a JSON object with this exact structure:
{
  "businessIdentity": {
    "name": "string - exactly 3 words, memorable business name",
    "tagline": "string - 7 words max, Product Hunt style (e.g., 'Executive coaching for burnt-out founders')"
  },
  "essenceAnchor": {
    "geniusAppleSeed": "string - the core vibration/essence",
    "geniusAppleSeed_plain": "string - simple explanation",
    "primeDriver": "string - 3-word formula",
    "primeDriver_plain": "string - what I do",
    "archetype": "string - compound archetype",
    "archetype_plain": "string - simple explanation"
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
// PROMPT BUILDER
// ---------------------------------------------------------------------------

interface AppleseedData {
  vibrationalKey: {
    name: string;
    tagline: string;
  };
  threeLenses: {
    primeDriver: string;
    archetype: string;
    actions: string[];
  };
  elevatorPitch: string;
  appreciatedFor: Array<{ effect: string }>;
  monetizationAvenues: string[];
}

const buildExcaliburPrompt = (appleseed: AppleseedData): string => {
  const appleseedSummary = `
APPLESEED (Zone of Genius):
- Vibrational Key: ${appleseed.vibrationalKey?.name || 'Unknown'}
- Tagline: "${appleseed.vibrationalKey?.tagline || ''}"
- Prime Driver: ${appleseed.threeLenses?.primeDriver || 'Unknown'}
- Archetype: ${appleseed.threeLenses?.archetype || 'Unknown'}
- Actions: ${appleseed.threeLenses?.actions?.join(' • ') || 'Unknown'}
- Elevator Pitch: ${appleseed.elevatorPitch || 'Unknown'}
- Appreciated For: ${appleseed.appreciatedFor?.map(a => a.effect).join(', ') || 'Unknown'}
- Monetization Avenues: ${appleseed.monetizationAvenues?.join(', ') || 'Unknown'}
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
// EDGE FUNCTION
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appleseed, prompt } = await req.json();

    if (!prompt && !appleseed) {
      return new Response(
        JSON.stringify({ error: "Missing prompt or appleseed data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build prompt from appleseed if not provided directly
    const finalPrompt = prompt || buildExcaliburPrompt(appleseed);

    console.log("Generating Excalibur with prompt length:", finalPrompt.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a Genius Business Generator that outputs ONLY valid JSON. No markdown, no code blocks. You MUST include: 1) A memorable 3-word business name, 2) A Product Hunt style tagline (7 words max), 3) Clear Point A to Point B transformational promise. For every poetic term, also provide a plain-language explanation."
          },
          { role: "user", content: finalPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response received, parsing JSON...");

    // Parse JSON from the response, handling potential markdown code blocks
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith("```")) {
      jsonContent = jsonContent.slice(0, -3);
    }
    jsonContent = jsonContent.trim();

    const excalibur = JSON.parse(jsonContent);

    console.log("Excalibur generated successfully");

    return new Response(
      JSON.stringify({ excalibur }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-excalibur:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
