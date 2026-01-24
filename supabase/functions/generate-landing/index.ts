import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GENERATE_LANDING_PROMPT = `You are an elite Landing Page Copywriter using the Customer Forces Framework.

FIRST, analyze the ideal client using Customer Forces:
- PUSH (Pain): What's pushing them away from status quo? Daily experiences, quiet dread, what's NOT working
- PULL (Benefits): What's pulling them toward the solution? Dream outcome, what they're drawn to
- ANXIETY (Concerns): What stops them from buying? Fears, past failures, identity concerns
- INERTIA (Habits): What keeps them stuck? Default behaviors, sunk costs, familiar moves

THEN, create landing page copy with this structure:

1. FOR [AUDIENCE] - Who this is for
2. HEADLINE (8-15 words) - "Become/Make/Stop/Turn" format, sharp positioning
3. SUBHEADLINE (15-25 words) - Expands headline with specific benefit and "without..." clause
4. CTA BUTTON TEXT (3-5 words)
5. PAIN SECTION HEADER - "When your work sounds like everyone else's" style
6. PAIN BULLETS (4 items) - Each bullet = pain point + consequence, conversational
7. SOLUTION SECTION HEADER - "A clear system to..." style  
8. SOLUTION STEPS (5 items) - Actionable steps with verbs, showing the transformation
9. FINAL CTA HEADLINE - Punchy call to action
10. FINAL CTA SUBHEADLINE - What they get

The copy should:
- Speak to ONE person directly
- Use specific, market-readable language (not vague "transformation")
- Address anxiety/objections implicitly
- Make the offer feel inevitable

Return a JSON object:
{
  "forAudience": "string - who this is for",
  "headline": "string - main headline",
  "subheadline": "string - supporting subheadline",
  "ctaButtonText": "string - button text",
  "painSectionHeader": "string - problem section header",
  "painBullets": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
  "solutionSectionHeader": "string - solution section header",
  "solutionSteps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "finalCtaHeadline": "string - final CTA section headline",
  "finalCtaSubheadline": "string - what they get"
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
TARGET AUDIENCE & ICP:
- Who: ${icp.who || 'Unknown'}
- Struggles: ${icp.struggles || 'Unknown'}
- Desires: ${icp.desires || 'Unknown'}

PAIN LANDSCAPE (Customer Forces - PUSH):
- Pressure: ${pain?.pressure || 'Unknown'}
- Consequences: ${pain?.consequences || 'Unknown'}
- Cost of Inaction: ${pain?.costOfInaction || 'Unknown'}
- Stakes: ${pain?.stakes || 'Unknown'}

TRANSFORMATION (PULL):
- Point A: ${tp.pointA || 'Unknown'}
- Point B: ${tp.pointB || 'Unknown'}
- Core Promise: ${tp.corePromise || 'Unknown'}

Generate landing page copy that makes this person say "Oh—you're the person for THIS."
Make it specific enough that they can repeat your offer to a friend after one read.
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

        // Also return backwards-compatible fields
        const result = {
            ...landing,
            // Backwards compatible
            headline: landing.headline,
            subheadline: landing.subheadline,
            painSection: landing.painBullets?.join(" ") || "",
            promiseSection: landing.solutionSteps?.join(" ") || "",
            ctaText: landing.ctaButtonText
        };

        return new Response(
            JSON.stringify(result),
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
