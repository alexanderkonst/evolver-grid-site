import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Equilibrium v2 — Strategy Alignment Scoring
 *
 * Sasha 2026-05-17: "I want to compare strategies on alignment with my
 * highest expression so that I can myself see the score to then prioritize."
 *
 * Takes the user's Lifelong Dedication (verb-form of being at life scale),
 * Role (unique talent in one sentence), and a list of Current Strategies.
 * Returns a 0-100 alignment score + one-sentence reasoning per strategy.
 *
 * The score is the user's signal — they decide what to do with it. UI
 * shows scores as small badges next to each strategy; drag-reorder
 * remains under the user's control.
 *
 * Tone / anti-fluff rules: same as synthesis. Concrete reasoning, no
 * grand-narrative invention, "what does that even mean?" test applies.
 */

const SYSTEM_PROMPT = `You are an alignment scorer for Equilibrium. The user has a Lifelong Dedication (the verb-form of their being — what they keep doing at life scale) and a Role (their unique talent in one first-person sentence). They've named some Current Strategies — direction-choices for their next personal cycle.

Your job: for each strategy, return a 0-100 alignment score AND a one-sentence reasoning, judged by how well the strategy expresses the user's unique talent in service of their lifelong direction.

═══ WHAT ALIGNMENT MEANS ═══

HIGH alignment (80-100):
  • The strategy directly engages the user's unique talent.
  • The work the strategy describes is a vehicle for the dedication.
  • The strategy has a clear, fast feedback loop where the user's gift
    can build momentum.
  • Specific and acted-upon, not aspirational.

MEDIUM alignment (50-79):
  • The strategy touches the dedication but isn't the most direct line.
  • Requires translation through intermediate work before the user's
    gift can be expressed.
  • Adjacent to the talent rather than a vehicle for it.

LOW alignment (0-49):
  • The strategy is generic — could belong to anyone.
  • The strategy is downstream chore-work (admin, ops, cleanup) rather
    than the dedication itself.
  • The strategy doesn't engage the user's specific gift.
  • The strategy is in conflict with the dedication / role.

═══ REASONING RULES (the "what does that even mean?" test) ═══

ONE sentence per reasoning. 10-20 words. Concrete: name WHY the score is what it is, in plain language a smart friend with no context could grok in 5 seconds.

REJECTED examples:
  ❌ "Strong resonance with the soul's calling." — abstract fluff.
  ❌ "Aligned with the manifest expression of your unique vibration." — banned words + zero specificity.
  ❌ "This strategy aligns with your North Star." — generic, no concrete reference.

ACCEPTED examples:
  ✅ "Direct translation of the dedication into action — frameworks reach users fast."
  ✅ "Adjacent to the talent but the feedback loop runs through too many intermediaries before output."
  ✅ "Generic admin chore — doesn't engage the unique talent at all."
  ✅ "Same domain as the dedication but the angle is backwards: you'd be selling rather than building."

BANNED WORDS (never use in reasoning): "energy", "alignment" (as decoration — "aligned with X" is fine but "aligns with your alignment" is not), "vibe", "flow", "manifest", "abundance", "soul's calling", "North Star" (as cliche), "resonance" (as decoration), "essence", "vibration".

═══ OUTPUT ═══

Return JSON with the scores in the SAME ORDER as the input strategies:

{
  "scores": [
    { "score": 92, "reasoning": "..." },
    { "score": 76, "reasoning": "..." }
  ]
}

If a strategy is empty or unparseable, score it 0 with reasoning "Empty strategy — nothing to score yet."`;

interface ScoreInput {
  lifelong_dedication?: string | null;
  role?: string | null;
  strategies: string[];
}

interface ScoreOutput {
  scores: { score: number; reasoning: string }[];
}

function buildUserMessage(input: ScoreInput): string {
  const lines: string[] = [];
  lines.push("=== USER'S HIGHEST EXPRESSION ===\n");
  lines.push(
    `Lifelong Dedication: ${input.lifelong_dedication?.trim() || "(not set)"}`,
  );
  lines.push(`Role: ${input.role?.trim() || "(not set)"}`);
  lines.push("\n=== STRATEGIES TO SCORE (in order) ===\n");
  input.strategies.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.trim() || "(empty)"}`);
  });
  return lines.join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as ScoreInput;
    const strategies = Array.isArray(body?.strategies) ? body.strategies : [];

    if (strategies.length === 0) {
      return new Response(
        JSON.stringify({ scores: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userMessage = buildUserMessage(body);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          temperature: 0.4,
        }),
      },
    );

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    let parsed: ScoreOutput;
    try {
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { scores: [] };
    } catch {
      parsed = { scores: [] };
    }

    // Defensive: clamp scores to 0-100 integers, fill missing entries with
    // a 0-score "couldn't score" placeholder so client always gets one
    // entry per input strategy.
    const scores = strategies.map((_, i) => {
      const s = parsed.scores?.[i];
      const rawScore = typeof s?.score === "number" ? s.score : 0;
      const score = Math.max(0, Math.min(100, Math.round(rawScore)));
      const reasoning =
        typeof s?.reasoning === "string" && s.reasoning.trim()
          ? s.reasoning.trim()
          : "Couldn't score this strategy — try again.";
      return { score, reasoning };
    });

    return new Response(JSON.stringify({ scores }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("score-equilibrium-strategies error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
