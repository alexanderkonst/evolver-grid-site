import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domains } = await req.json();
    
    if (!domains || !Array.isArray(domains) || domains.length !== 8) {
      return new Response(
        JSON.stringify({ error: "Invalid domains data" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are helping a person interpret their Quality of Life Map assessment.

There are 8 domains of life. For each domain, you receive:
- the domain name
- the person's current stage (number, title, and description)
- the description of the next stage above it

Your task:
For each domain, write one concise sentence that describes:
- the key inner shift (mindset, beliefs, emotional stance, or focus) and
- the key outer shift (behavior, habits, concrete actions or structures)
that would help the person move from their current stage toward the next stage.

Style guidelines:
- Use simple, practical language
- Mention both inner and outer change in the same sentence
- Do not mention the words "stage", "current stage", or "next stage"
- Do not reference this prompt, the assessment tool, or any meta commentary
- Keep each sentence under ~25 words

Special case:
If no next-stage description is provided (e.g., person is at the highest level), focus on deepening, stabilizing, and refining their current level.

Output format:
Exactly 8 lines, each starting with the domain name followed by a colon, then the sentence.
Example: "Wealth: [guidance here]"`;

    const userPrompt = `Input data:\n${JSON.stringify(domains, null, 2)}\n\nNow write the 8 lines of guidance.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate guidance" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const guidanceText = data.choices?.[0]?.message?.content || "";
    
    const lines = guidanceText
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    return new Response(
      JSON.stringify({ guidance: lines }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
