import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a practical energy advisor. You understand planetary days, moon phases, and daily energy rhythms.

You receive cycle data about the current moment. Your job is to write ONE sentence (max 25 words) telling the person SPECIFICALLY what to do right now. Be concrete — name actual activities. Make it feel like wise advice from a friend who deeply understands natural rhythms.

RULES:
- Name specific actions, not abstract energies
- Never use the words "energy", "alignment", "flow", or "vibration"
- Never mention planets, astrology, or esoteric terms
- The person should read your sentence and immediately know what to do
- Use the dominant phase to determine the ACTION TYPE:
    will = planning, choosing, strategizing
    emanation = building, creating, executing
    digestion = sharing, exchanging, communicating
    enrichment = resting, integrating, reviewing
- Use dayEnergy for the FLAVOR of that action
- Use moonEnergy for the SEASON (beginning/middle/end of a larger cycle)

GOOD examples:
"Finish any half-written messages and clear your inbox — your mind is sharp for wrapping up communication tonight."
"Step away from planning and go build something with your hands — this afternoon rewards action, not thinking."
"Journal about what you want to start this month — the cycle is fresh and your instinct for direction is strong."
"Review what you shipped this week and write down what worked — tonight is for consolidating, not creating."

BAD examples (too vague):
"Clarity, release, and communication"
"Build + communicate energy"
"Integration and reflection time"

Return JSON: { "insight": "your one actionable sentence", "activities": ["2-word activity", "2-word activity", "2-word activity"] }`;

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
