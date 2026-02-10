import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEEPEN_TP_PROMPT = `You are a world-class copywriter who crystallizes Transformational Promises.

Given ICP (Ideal Client Profile) and Pain data, create a razor-sharp Point A → Point B transformation.

RULES:
- Point A: 2-3 vivid sentences describing their CURRENT painful reality. Use emotion, not demographics. Write in 2nd person ("You...").
- Point B: 2-3 vivid sentences describing their DESIRED future state AFTER the transformation. Specific, aspirational, believable.
- Core Promise: ONE powerful sentence in the format "I help [simple descriptor] [achieve specific transformation]." Maximum 15 words. No jargon.

ANTI-PATTERNS (never do these):
- Do NOT paste the ICP description into the promise. "I help This is a founder or CEO..." is WRONG.
- Do NOT use demographic details (age, company size) in the core promise.
- Do NOT write generic promises like "achieve their full potential" or "transform their business."
- Keep it short and punchy. If it's longer than 15 words, rewrite it shorter.

GOOD examples:
- "I help visionary founders turn chaotic ideas into executable empires."
- "I help burnt-out experts build businesses that run without them."
- "I help coaches package their genius into products that sell while they sleep."

BAD examples:
- "I help This is a founder or CEO, likely in their late 30s to 50s..." (pasting ICP data)
- "I help people who feel stuck achieve their full potential" (too generic)

Return ONLY this JSON:
{
  "pointA": "string - 2-3 sentences, 2nd person, present tense",
  "pointB": "string - 2-3 sentences, 2nd person, present tense",  
  "corePromise": "string - ONE sentence, max 15 words"
}

Return ONLY the JSON. No explanation.`;

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { icp, pain } = await req.json();

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
IDEAL CLIENT:
- Who: ${icp.who || 'Unknown'}
- Struggles: ${icp.struggles || 'Unknown'}
- Desires: ${icp.desires || 'Unknown'}

PAIN LANDSCAPE:
- Pressure: ${pain?.pressure || 'Unknown'}
- Consequences: ${pain?.consequences || 'Unknown'}
- Cost of Inaction: ${pain?.costOfInaction || 'Unknown'}
- Stakes: ${pain?.stakes || 'Unknown'}
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
                    { role: "system", content: DEEPEN_TP_PROMPT },
                    { role: "user", content: `Crystallize the transformational promise:\n\n${context}` }
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

        const deepTP = JSON.parse(content);

        return new Response(
            JSON.stringify(deepTP),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error in deepen-tp:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
