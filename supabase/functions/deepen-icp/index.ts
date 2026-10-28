import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { resolveOutputLanguage, languageDirective } from "../_shared/language.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEEPEN_ICP_PROMPT = `You are an ICP Deepening Agent that takes a basic Ideal Client Profile and enriches it using Pain Theory v2.0.

Begin with empathy: first understand WHO this person is and what they truly DESIRE, before naming any pain.
Then slice their pain in this exact order, each layer going deeper, in the client's own self-language:
1. PRESSURE: What external and internal forces are pushing them toward a decision now?
2. CONSEQUENCES: What do they experience daily because of this problem?
3. COST OF INACTION: What happens in 6 months if nothing changes?
4. URGENCY: What countdown is already running?
5. STRUGGLE SYNTHESIZED (last): from all layers above, the one sentence that would make them freeze and say "...yes, that's exactly it".

Return a JSON object, filling fields in this order:
{
  "who": "string - 2-3 sentences describing exactly who this person is",
  "desires": "string - 2-3 sentences about what they truly want",
  "pressure": "string - forces pushing them toward a decision now",
  "consequences": "string - what they experience daily",
  "costOfInaction": "string - what happens in 6 months if nothing changes",
  "urgency": "string - the countdown already running",
  "stakes": "string - what's really at risk beyond the surface",
  "struggles": "string - the synthesized struggle: 1-2 sentences in their own words, written last from all layers above"
}

Return ONLY the JSON. No explanation.`;

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { excalibur, target_language } = await req.json();
        const outputLanguage = resolveOutputLanguage(target_language);

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
                model: "google/gemini-3.1-flash-lite",
                messages: [
                    { role: "system", content: DEEPEN_ICP_PROMPT + languageDirective(outputLanguage) },
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
