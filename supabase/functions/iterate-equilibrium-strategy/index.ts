import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Equilibrium v2 — Strategy Iteration Button
 *
 * Converts one saved strategy into a sharper next articulation. The
 * result is ephemeral until the user accepts it in the UI.
 */

const SYSTEM_PROMPT = `You are the Strategy Iteration Button inside Equilibrium.

The user has already written a Current Strategy. It may be long because it captures live strategic context. They are probably in love with it because it came from their own conviction. Your job is to illuminate it: synthesize the current articulation at high fidelity with an optimally high signal-to-noise ratio, make the exact strategy clear, kill the version that would die in the real world, identify what survives, and compress the next sharper articulation.

This is not brainstorming. This is one iteration pass.

Use these lenses internally:
- crystallize the actor, target, wedge, mechanism, promise, immediate motion, buyer/user, and success signal;
- roast the language for founder-invented abstraction, vague optimism, overbuilt concepts, and private excitement;
- test attention + pain + agency overlap;
- slice pain by pressure, consequence, cost of inaction, urgency, and buyer-native recognition;
- assume real humans are busy, distracted, defensive, under-resourced, skeptical, status-sensitive, avoidant, and slow to act;
- assume the current version failed, then extract what still survived.

Do not output the full analysis. Return only the result needed by the UI.

OUTPUT STRICT JSON ONLY:
{
  "strategyTagline": "2-5 WORD ALL-CAPS NAME FOR THE STRATEGY",
  "bottomLine": "This strategy was really about [surviving seed], but it failed because [core death mechanism], so the next iteration should [next sharper move].",
  "proposedStrategy": "TAGLINE — one replacement strategy articulation, preserving the real meaning with less noise and more action."
}

Rules:
- strategyTagline must be 2-5 words, all caps, concrete, scannable, and not clever for its own sake.
- bottomLine must be one sentence.
- proposedStrategy must start with the exact strategyTagline, then " — ", then the improved strategy articulation.
- proposedStrategy must preserve the useful substance of the current strategy, not reduce it to a generic slogan.
- proposedStrategy should be compact enough to scan but complete enough to act on.
- Prefer buyer/user-native language over founder language.
- Prefer concrete behavior over conceptual elegance.
- Preserve the living seed; kill only the fantasy version.
- No markdown. No bullets. No code fences. JSON only.`;

interface IterateStrategyInput {
  strategy?: string | null;
  lifelong_dedication?: string | null;
  role?: string | null;
}

interface IterateStrategyOutput {
  strategyTagline: string;
  bottomLine: string;
  proposedStrategy: string;
}

function buildUserMessage(input: IterateStrategyInput): string {
  return [
    "=== CURRENT STRATEGY ===",
    input.strategy?.trim() || "(empty)",
    "",
    "=== OPTIONAL CONTEXT ===",
    `Lifelong Dedication: ${input.lifelong_dedication?.trim() || "(not set)"}`,
    `Role: ${input.role?.trim() || "(not set)"}`,
  ].join("\n");
}

function stripCodeFence(content: string): string {
  let cleaned = content.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

function parseOutput(content: string): IterateStrategyOutput {
  const cleaned = stripCodeFence(content);
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
  const rawTagline =
    typeof parsed.strategyTagline === "string"
      ? parsed.strategyTagline.trim()
      : "";
  const strategyTagline = rawTagline.toUpperCase();
  const bottomLine =
    typeof parsed.bottomLine === "string" ? parsed.bottomLine.trim() : "";
  let proposedStrategy =
    typeof parsed.proposedStrategy === "string"
      ? parsed.proposedStrategy.trim()
      : "";
  if (!strategyTagline || !bottomLine || !proposedStrategy) {
    throw new Error(
      "AI response missing strategyTagline, bottomLine, or proposedStrategy",
    );
  }
  if (!proposedStrategy.toUpperCase().startsWith(strategyTagline)) {
    proposedStrategy = `${strategyTagline} — ${proposedStrategy}`;
  }
  return { strategyTagline, bottomLine, proposedStrategy };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as IterateStrategyInput;
    const strategy = body?.strategy?.trim();
    if (!strategy) {
      return new Response(JSON.stringify({ error: "Strategy is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
            { role: "user", content: buildUserMessage(body) },
          ],
          temperature: 0.45,
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
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const output = parseOutput(content);

    return new Response(JSON.stringify(output), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("iterate-equilibrium-strategy error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
