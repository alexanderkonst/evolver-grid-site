import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEEPEN_ICP_PROMPT = `You are an ICP Deepening Agent that takes a basic Ideal Client Profile and enriches it using Pain Theory.

Your job is to take the initial ICP from a Genius Business (Excalibur) and create a DEEP understanding of:
1. WHO they are - specific demographics, psychographics, life situation
2. What they STRUGGLE with - concrete daily struggles
3. What they truly DESIRE - their deepest wants

Use the Pain Theory framework:
- PRESSURE: What external forces are pushing them toward change?
- CONSEQUENCES: What do they experience daily because of this problem?
- COST OF INACTION: What price do they pay if they don't change?
- STAKES: What's really at risk beyond the surface?

Return a JSON object:
{
  "who": "string - 2-3 sentences describing exactly who this person is",
  "struggles": "string - 2-3 sentences about their struggles",
  "desires": "string - 2-3 sentences about what they truly want",
  "pressure": "string - external forces pushing them",
  "consequences": "string - what they experience daily",
  "costOfInaction": "string - price of not changing",
  "stakes": "string - what's really at risk"
}

Return ONLY the JSON. No explanation.`;

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { excalibur } = await req.json();

        if (!excalibur) {
            return new Response(
                JSON.stringify({ error: "Missing excalibur data" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) {
            throw new Error("LOVABLE_API_KEY is not configured");
        }

        const icpContext = `
EXCALIBUR DATA:
- Business: ${excalibur.businessIdentity?.name || 'Unknown'}
- Tagline: ${excalibur.businessIdentity?.tagline || 'Unknown'}
- Offer: ${excalibur.offer?.statement || 'Unknown'}
- Ideal Client: ${excalibur.idealClient?.profile || 'Unknown'}
- Problem: ${excalibur.idealClient?.problem || 'Unknown'}
- Transformation: ${excalibur.transformationalPromise?.fromState || ''} → ${excalibur.transformationalPromise?.toState || ''}
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
                    { role: "system", content: DEEPEN_ICP_PROMPT },
                    { role: "user", content: `Deepen this ICP:\n\n${icpContext}` }
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

        const deepICP = JSON.parse(content);

        return new Response(
            JSON.stringify(deepICP),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error in deepen-icp:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
