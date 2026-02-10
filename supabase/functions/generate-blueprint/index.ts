import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GENERATE_BLUEPRINT_PROMPT = `You are a Blueprint Generator that creates lead magnets - actionable step-by-step guides.

Using the transformation promise and expertise area, create:

1. TITLE - A compelling blueprint title (e.g., "The Genius Business Blueprint")
2. STEPS - 5 actionable steps the reader can follow
3. CTA SECTION - A bridge to the main offer

Each step should:
- Be actionable (start with a verb)
- Be specific enough to follow
- Build toward the transformation
- Feel achievable

Return a JSON object:
{
  "title": "string - the blueprint title",
  "steps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "ctaSection": "string - text that bridges to main offer"
}

Return ONLY the JSON. No explanation.`;

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { icp, pain, tp } = await req.json();

        if (!tp) {
            return new Response(
                JSON.stringify({ error: "Missing TP data" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) {
            throw new Error("LOVABLE_API_KEY is not configured");
        }

        const context = `
TRANSFORMATION:
- Point A: ${tp.pointA || 'Unknown'}
- Point B: ${tp.pointB || 'Unknown'}
- Core Promise: ${tp.promiseStatement || tp.corePromise || 'Unknown'}

IDEAL CLIENT:
- Who: ${icp?.who || 'Unknown'}
- Desires: ${icp?.desires || 'Unknown'}
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
                    { role: "system", content: GENERATE_BLUEPRINT_PROMPT },
                    { role: "user", content: `Generate a blueprint lead magnet:\n\n${context}` }
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

        const blueprint = JSON.parse(content);

        return new Response(
            JSON.stringify(blueprint),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error in generate-blueprint:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
