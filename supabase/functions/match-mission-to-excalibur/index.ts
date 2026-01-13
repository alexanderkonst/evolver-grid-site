import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sample of mission titles/statements for matching (full list loaded from client)
const MISSION_MATCHING_PROMPT = `You are a Mission Matcher. Given a person's Unique Offering (Excalibur), recommend the 3 most aligned missions from the provided list.

MATCHING CRITERIA:
1. The mission should leverage the person's core strengths (from their archetype/prime driver)
2. The mission should align with the transformation they provide (from their Excalibur offer)
3. The mission should feel like a natural extension of their genius

OUTPUT FORMAT:
Return ONLY a JSON array with exactly 3 mission IDs and reasoning:
[
  { "missionId": "string", "resonanceScore": 1-10, "reason": "Why this mission fits their genius" },
  { "missionId": "string", "resonanceScore": 1-10, "reason": "Why this mission fits their genius" },
  { "missionId": "string", "resonanceScore": 1-10, "reason": "Why this mission fits their genius" }
]

Sort by resonanceScore descending.
`;

interface ExcaliburData {
    essenceAnchor?: {
        coreVibration?: string;
        primeDriver?: string;
        archetype?: string;
    };
    sword?: {
        offer?: string;
        promise?: string;
    };
    value?: {
        whoBenefitsMost?: string;
        survivalBlock?: string;
    };
}

interface Mission {
    id: string;
    title: string;
    statement: string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { excalibur, missions } = await req.json() as {
            excalibur: ExcaliburData;
            missions: Mission[];
        };

        if (!excalibur || !missions || missions.length === 0) {
            return new Response(
                JSON.stringify({ error: "Missing excalibur data or missions list" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) {
            throw new Error("LOVABLE_API_KEY is not configured");
        }

        // Build summary of the person's genius
        const geniusSummary = `
PERSON'S GENIUS PROFILE:
- Archetype: ${excalibur.essenceAnchor?.archetype || 'Unknown'}
- Core Vibration: ${excalibur.essenceAnchor?.coreVibration || 'Unknown'}
- Prime Driver: ${excalibur.essenceAnchor?.primeDriver || 'Unknown'}
- Unique Offer: ${excalibur.sword?.offer || 'Unknown'}
- Promise: ${excalibur.sword?.promise || 'Unknown'}
- Who Benefits: ${excalibur.value?.whoBenefitsMost || 'Unknown'}
`;

        // Build missions list (limit to prevent token overflow)
        const missionsSummary = missions.slice(0, 200).map(m =>
            `ID: ${m.id} | Title: ${m.title} | Statement: ${m.statement}`
        ).join('\n');

        const prompt = `${MISSION_MATCHING_PROMPT}

${geniusSummary}

AVAILABLE MISSIONS:
${missionsSummary}

Return ONLY the JSON array. No explanation.`;

        console.log("Matching missions to Excalibur, missions count:", missions.length);

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                    {
                        role: "system",
                        content: "You are a Mission Matcher. Output ONLY valid JSON array. No markdown, no code blocks."
                    },
                    { role: "user", content: prompt }
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI gateway error:", response.status, errorText);
            throw new Error(`AI gateway error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("No content in AI response");
        }

        // Parse JSON from response
        let jsonContent = content.trim();
        if (jsonContent.startsWith("```json")) {
            jsonContent = jsonContent.slice(7);
        } else if (jsonContent.startsWith("```")) {
            jsonContent = jsonContent.slice(3);
        }
        if (jsonContent.endsWith("```")) {
            jsonContent = jsonContent.slice(0, -3);
        }
        jsonContent = jsonContent.trim();

        const matches = JSON.parse(jsonContent);

        console.log("Mission matches found:", matches.length);

        return new Response(
            JSON.stringify({ matches }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error in match-mission-to-excalibur:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
