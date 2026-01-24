import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GENERATE_LANDING_PROMPT = `You are a Landing Page Copywriter that creates high-converting, emotionally resonant landing page copy.

Using the ICP, Pain, and Transformational Promise, create:

1. HEADLINE - The main attention-grabber (8-12 words, speaks to transformation)
2. SUBHEADLINE - Expands on the headline (15-20 words, specific benefit)
3. PAIN SECTION - "Sound Familiar?" (2-3 sentences that make them nod)
4. PROMISE SECTION - "There's Another Way" (2-3 sentences of hope)
5. CTA TEXT - Button text (3-5 words, action-oriented)

The copy should:
- Speak directly to ONE person
- Lead with pain, end with possibility
- Be conversational, not corporate
- Create urgency without manipulation

Return a JSON object:
{
  "headline": "string - main headline",
  "subheadline": "string - supporting subheadline",
  "painSection": "string - the pain acknowledgment",
  "promiseSection": "string - the hope and solution",
  "ctaText": "string - call to action button text"
}

Return ONLY the JSON. No explanation.`;

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { icp, pain, tp } = await req.json();

        if (!icp || !tp) {
            return new Response(
                JSON.stringify({ error: "Missing ICP or TP data" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) {
            throw new Error("LOVABLE_API_KEY is not configured");
        }

        const context = `
IDEAL CLIENT:
- Who: ${icp.who || 'Unknown'}
- Struggles: ${icp.struggles || 'Unknown'}
- Desires: ${icp.desires || 'Unknown'}

PAIN:
- Pressure: ${pain?.pressure || 'Unknown'}
- Consequences: ${pain?.consequences || 'Unknown'}
- Stakes: ${pain?.stakes || 'Unknown'}

TRANSFORMATION:
- Point A: ${tp.pointA || 'Unknown'}
- Point B: ${tp.pointB || 'Unknown'}
- Core Promise: ${tp.corePromise || 'Unknown'}
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
                    { role: "system", content: GENERATE_LANDING_PROMPT },
                    { role: "user", content: `Generate landing page copy:\n\n${context}` }
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

        const landing = JSON.parse(content);

        return new Response(
            JSON.stringify(landing),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error in generate-landing:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
