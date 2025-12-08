import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Auth check - allowing anonymous access for guest users');
      // Allow anonymous access for guest users who aren't logged in
      // The game supports both authenticated and guest modes
    }

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

    const systemPrompt = `You are a concise, compassionate coach helping someone evolve their quality of life across several dimensions.

You are given, for each life dimension:
- its name,
- the user's current stage (title + description),
- the next developmental stage (title + description).
If there is no higher stage (already at the top), the "next stage" will repeat the same stage and you should focus on refinement and deepening.

Your job:
For EACH dimension, give **two short lines of guidance**:
1) an OUTER action line (visible world), and
2) an INNER shift line (invisible world: beliefs, emotions, identity, relationship to that area).

Think of:
- OUTER = behavior, habits, money flows, routines, conversations, concrete decisions.
- INNER = beliefs, self-worth, emotional patterns, safety, trust, relationship with self/others/life, deeper intention.

OUTPUT FORMAT:

For each dimension, output **exactly** this pattern in Markdown:

[Dimension name] — from [currentStageTitle] to [nextStageTitle]
- Outer: [one concise sentence about the key practical change or experiment]
- Inner: [one concise sentence about the key inner shift / realization / practice]

Add a blank line between dimensions.

GUIDELINES:

- Be specific, not generic. It should feel like "this is really describing my situation".
- Use the stage descriptions to understand the developmental movement.
- For **Wealth/Finances**, outer might include saving, debt, earning, structure; inner might include self-worth, safety, relationship to money, permission to receive.
- For **Health/Body**, outer might include sleep, movement, nutrition; inner might include listening to the body, releasing perfectionism, tending to stress.
- For **Relationships**, outer might include boundaries, quality time, conversations; inner might include vulnerability, trust, feeling worthy of love.
- For **Purpose/Work**, outer might include projects, learning, networking; inner might include owning talents, clarity of contribution, courage to be seen.

- ONE outer sentence and ONE inner sentence per dimension.
  - Aim for max ~20–22 words per sentence.
- Keep the whole response compact (no intros or summaries, just the blocks described).
- Avoid jargon or spiritual clichés; use simple, grounded language.
- Never guilt or shame the user. Speak as an ally.

Output ONLY the Markdown blocks described above. Do not add explanations or extra sections.`;

    const userPrompt = `Here are the dimensions and stages:\n${JSON.stringify(domains, null, 2)}\n\nNow output the guidance blocks.`;

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
    
    // Split by double newlines to get blocks, then trim each block
    const blocks = guidanceText
      .split("\n\n")
      .map((block: string) => block.trim())
      .filter((block: string) => block.length > 0);

    return new Response(
      JSON.stringify({ guidance: blocks }),
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