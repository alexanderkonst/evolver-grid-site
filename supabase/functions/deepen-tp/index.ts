import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEEPEN_TP_PROMPT = `You are a world-class USP (Unique Selling Proposition) copywriter.

Given ICP (Ideal Client Profile) and Pain data, create a razor-sharp Unique Selling Proposition — the kind of one-liner that makes an ideal client immediately say "THAT'S exactly what I need."

RULES:
- Point A: 2-3 vivid sentences describing their CURRENT painful reality. Use emotion, not demographics. Write in 2nd person ("You..."). Make the reader feel SEEN.
- Point B: 2-3 vivid sentences describing their DESIRED future state AFTER working with you. Specific, aspirational, believable. Make it tangible.
- Core USP: ONE sentence in EXACTLY this format: "I help [who — 2-3 word human descriptor] [do what — specific measurable outcome]." Maximum 12 words. This is an elevator pitch, not a mission statement.

FORMAT RULES FOR CORE USP:
- Start with "I help"
- [who] = simple human label, NOT demographics. Use words like: founders, leaders, coaches, creators, experts, visionaries, professionals
- [do what] = specific VERB + tangible RESULT. Never abstract.
- Maximum 12 words total. Fewer is better. 8-10 words is ideal.

GOOD USP examples:
- "I help visionary founders turn ideas into revenue."
- "I help burnt-out experts build businesses that run without them."
- "I help coaches package genius into products that sell."
- "I help leaders find clarity in chaos."
- "I help creators monetize what makes them unique."

BAD USP examples (NEVER do these):
- "I help This is a founder or CEO, likely in their late 30s to 50s..." (pasting ICP data — FATAL ERROR)
- "I help people who feel stuck achieve their full potential" (too generic, vapid)
- "I help ambitious individuals leverage their innate competencies for synergistic outcomes" (corporate gibberish)
- Anything longer than 12 words (rewrite shorter)
- Anything without a concrete verb ("achieve", "transform" alone are too vague — what SPECIFICALLY?)

Return ONLY this JSON:
{
  "pointA": "string - 2-3 sentences, 2nd person, present tense",
  "pointB": "string - 2-3 sentences, 2nd person, present tense",  
  "corePromise": "string - ONE sentence, max 12 words, starts with 'I help'"
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
