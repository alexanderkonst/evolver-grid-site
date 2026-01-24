import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEEPEN_PAIN_PROMPT = `You are a Pain Theory Expert that maps the deep pain landscape of an ideal client.

Using Pain Theory, analyze the client's situation and reveal:

1. PRESSURE - External forces pushing them toward change right now
   - Life events, deadlines, comparisons, expectations
   
2. CONSEQUENCES - What they experience daily because of this problem
   - Emotions, energy drain, relationship impact, missed opportunities
   
3. COST OF INACTION - The price they pay if nothing changes
   - 1 year from now, 5 years from now, the compounding cost
   
4. STAKES - What's really at risk beyond the surface
   - Identity, legacy, relationships, health, potential

Make it vivid. Make it feel true. This should resonate deeply.

Return a JSON object:
{
  "pressure": "string - 2-3 sentences about external forces",
  "consequences": "string - 2-3 sentences about daily experience", 
  "costOfInaction": "string - 2-3 sentences about price of staying",
  "stakes": "string - 2-3 sentences about what's really at risk"
}

Return ONLY the JSON. No explanation.`;

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { icp } = await req.json();

        if (!icp) {
            return new Response(
                JSON.stringify({ error: "Missing ICP data" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) {
            throw new Error("LOVABLE_API_KEY is not configured");
        }

        const context = `
IDEAL CLIENT PROFILE:
- Who they are: ${icp.who || 'Unknown'}
- Their struggles: ${icp.struggles || 'Unknown'}
- What they desire: ${icp.desires || 'Unknown'}
`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                    { role: "system", content: DEEPEN_PAIN_PROMPT },
                    { role: "user", content: `Map the pain landscape for this client:\n\n${context}` }
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI gateway error:", response.status, errorText);
            throw new Error(`AI gateway error: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content?.trim();

        if (!content) {
            throw new Error("No content in AI response");
        }

        // Parse JSON
        if (content.startsWith("```json")) content = content.slice(7);
        if (content.startsWith("```")) content = content.slice(3);
        if (content.endsWith("```")) content = content.slice(0, -3);
        content = content.trim();

        const deepPain = JSON.parse(content);

        return new Response(
            JSON.stringify(deepPain),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error in deepen-pain:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
