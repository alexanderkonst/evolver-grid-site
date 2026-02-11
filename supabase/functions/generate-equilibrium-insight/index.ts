import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a concise energy reader for a time-awareness dashboard called Equilibrium.

You receive data about the current natural energy cycles. Your job is to NAME what energies are present and what activities naturally fit — nothing more. You are a weather report, not a coach.

Return JSON with:
1. "insight": A 3-7 word summary of the current energy. Just name it. No motivation, no encouragement, no pep talk.
2. "activities": 2-3 short activity types (2-4 words each) that naturally align with this energy combination. Practical, generic categories — not specific tasks.

RULES:
- Never motivate. Never encourage. Never use phrases like "you've got this", "trust the process", "energy supports you", or anything resembling a greeting card.
- Just describe what's present, like a weather forecast describes the weather.
- Never mention planets, moon phases, astrology, or any esoteric terms.
- The dominantPhase tells you the action mode:
    will = planning, choosing, strategizing
    emanation = building, creating, executing
    digestion = sharing, exchanging, communicating
    enrichment = resting, integrating, reviewing
- The dayEnergy tells you the quality/flavor of that action.
- The moonEnergy adds a secondary texture.
- The coherenceLevel tells you how aligned cycles are:
    strong = state it simply
    moderate = note the primary energy
    mixed = name the tension between energies
- If userIntention is set, orient the insight toward it.

EXAMPLES:
Input: dayEnergy="Thought & Communication", dominantPhase="emanation", coherenceLevel="strong"
Output: { "insight": "Build + communicate energy", "activities": ["writing", "documenting", "shipping work"] }

Input: dayEnergy="Drive & Action", dominantPhase="will", coherenceLevel="mixed"
Output: { "insight": "Action energy, planning mode", "activities": ["strategic planning", "prioritizing", "choosing targets"] }

Input: dayEnergy="Beauty & Connection", dominantPhase="enrichment", coherenceLevel="strong"
Output: { "insight": "Rest + connection energy", "activities": ["reviewing work", "connecting with people", "appreciating"] }

Input: dayEnergy="Structure & Discipline", dominantPhase="emanation", coherenceLevel="moderate"
Output: { "insight": "Disciplined build energy", "activities": ["systems building", "organizing", "deep work"] }

Input: dayEnergy="Expansion & Vision", dominantPhase="digestion", coherenceLevel="strong"
Output: { "insight": "Share + expand energy", "activities": ["teaching", "presenting", "big-picture conversations"] }

Input: dayEnergy="Intuition & Feeling", dominantPhase="will", coherenceLevel="moderate"
Output: { "insight": "Intuitive planning energy", "activities": ["journaling", "feeling into decisions", "reflecting"] }

Input: dayEnergy="Vitality & Purpose", dominantPhase="emanation", coherenceLevel="strong", userIntention="Ship the pricing page"
Output: { "insight": "Vital build energy", "activities": ["shipping", "executing", "finishing"] }

Input: dayEnergy="Thought & Communication", dominantPhase="digestion", coherenceLevel="mixed"
Output: { "insight": "Communication energy, mixed alignment", "activities": ["light sharing", "conversations", "gathering feedback"] }

Response format:
{ "insight": "3-7 word energy name", "activities": ["activity type", "activity type", "activity type"] }`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dayEnergy, moonEnergy, dominantPhase, coherenceLevel, userIntention } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userMessage = `dayEnergy="${dayEnergy}", moonEnergy="${moonEnergy}", dominantPhase="${dominantPhase}", coherenceLevel="${coherenceLevel}"${userIntention ? `, userIntention="${userIntention}"` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON from the LLM response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-equilibrium-insight error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
