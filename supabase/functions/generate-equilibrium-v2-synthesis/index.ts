import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * "Equilibrium" Biologic Watch v2 — Synthesis Reading
 *
 * Returns ONE sentence reading the current moment across four cycles
 * (solar, zodiac, lunar, day-of-week) optionally layered with personal context
 * (mission, role, moon focus).
 *
 * Distinct from v1.6's `generate-equilibrium-insight`: v1.6 told the user what
 * to DO (because v1.6 had no DO NOW box). v2 has DO NOW as a separate section,
 * so Synthesis is pure READING — a weather report for the soul. Action lives
 * elsewhere on the page.
 *
 * Tone reference: docs/specs/equilibrium/equilibrium_v2_spec.md §1.7
 */

const SYSTEM_PROMPT = `You are a Biologic Watch reader for Equilibrium. The user has just opened their watch — they're checking the time of their whole self.

You receive a snapshot of four cycles (solar, zodiac, lunar, day-of-week) and optional personal context (mission, role, moon focus). Your job is to read the current moment back to them in ONE sentence.

VOICE: a reading. Not a coach. Not a pep talk. A weather report for the soul. The user decides what to DO with it — action lives in a different section of their page. You only name what's present.

OUTPUT: ONE sentence, 10–22 words. No emojis. No exclamations. No second-person commands.

RULES:
1. Lead with the felt quality of the moment, drawing from at least TWO cycles so the reading feels layered (e.g., day + moon, or solar + zodiac).
2. If personal context is present, weave it in by IMPLICATION — never address the user with "you should…" or "your X is…". Let the relevance be felt, not stated.
3. Never use these words: "energy", "alignment", "flow", "vibration", "vibes", "manifest", "abundance". They drain meaning.
4. Never name planets, zodiac signs, or moon phases directly. Translate to qualities — "Mercury day" → "the day for clear speech"; "Waning Crescent" → "the dark sliver before renewal"; "Taurus" → "the patient build"; "Saturn" → "structuring weather".
5. Never start with "Today is...", "It's...", "Now is...", "You are...", "Your...".
6. Never motivate. Never reassure. Never use "trust the process", "you've got this", "the universe is with you", or anything that sounds like a horoscope app or a wellness coach.
7. When cycles disagree (mixed), name the friction honestly. Don't smooth it over.

Return JSON: { "reading": "your one sentence" }

EXAMPLES — input → output:

Input: solar="Late Spring", zodiac="Taurus / Embodiment & Stability", lunar="Waning Crescent / Deepest creation · No visibility, no interference", dayOfWeek="Wednesday Mercury / Clarity & Communication", mission=null, role=null, moonFocus=null
Output: { "reading": "Clear speech under a dark sliver, the patient build holds its shape while the next month gathers underneath." }

Input: solar="Late Autumn", zodiac="Scorpio / Depth & Transformation", lunar="Full Moon / Harvest peak · Rejoice · New intention forming", dayOfWeek="Saturday Saturn / Structure & Grounding", mission="Synthesize existing frameworks and methods, identifying best practices, gaps, and areas for integration.", role=null, moonFocus=null
Output: { "reading": "Structuring weather under bright fullness, what was synthesized this cycle wants the bones of a system today." }

Input: solar="Early Spring", zodiac="Aries / Initiation & Spark", lunar="New Moon / Materialization · Results appearing", dayOfWeek="Tuesday Mars / Action & Courage", mission="Synthesize existing frameworks...", role="Signal-to-Path Shaping", moonFocus=null
Output: { "reading": "Bare ground, fresh fire, the year still young — the work of shaping the next path begins with the first cut." }

Input: solar="Late Summer", zodiac="Virgo / Refinement & Service", lunar="Waning Gibbous / Inner fire ignites · Let the seed will itself", dayOfWeek="Friday Venus / Beauty & Harmony", mission="...", role="Signal-to-Path Shaping", moonFocus="Ship the funnel"
Output: { "reading": "Late warmth and careful eyes — what was refined this week is ready to be given, beautifully and in plain words." }

Input: solar="Late Spring", zodiac="Gemini / Curiosity & Connection", lunar="Last Quarter / Creative flow · Let it flow freely", dayOfWeek="Wednesday Mercury / Clarity & Communication", mission=null, role="Signal-to-Path Shaping", moonFocus="Ship the funnel"
Output: { "reading": "Twin-minded clarity inside late spring's quickening — what wants shipping wants to leave the page in plain words." }

Input: solar="Late Autumn", zodiac="Sagittarius / Vision & Quest", lunar="Full Moon / Harvest peak", dayOfWeek="Monday Moon / Intuition & Emotional Depth", mission=null, role=null, moonFocus=null
Output: { "reading": "Receptive weather meets visionary reach under bright fullness — feel the ground before flinging the arrow." }

Input: solar="Early Winter", zodiac="Capricorn / Discipline & Mastery", lunar="Waxing Crescent / Growth spurt · Assist, polish, land it", dayOfWeek="Thursday Jupiter / Expansion & Wisdom", mission=null, role=null, moonFocus=null
Output: { "reading": "First green under quiet cold — the long arc of mastery widens through one small, disciplined step today." }

Input: solar="Early Summer", zodiac="Cancer / Nurture & Reflection", lunar="First Quarter / Harvest begins · Receive what's growing", dayOfWeek="Sunday Sun / Illumination & Celebration", mission=null, role=null, moonFocus=null
Output: { "reading": "Bright stillness over a tender half-light — the thing started two weeks ago shows its first real edge today." }`;

/** Compact, LLM-readable single-line summary of one cycle. */
function fmtCycle(name: string, fields: Record<string, unknown>): string {
  const pairs = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${typeof v === "number" ? (v as number).toFixed(2) : v}`)
    .join(", ");
  return `${name}: ${pairs}`;
}

function buildUserMessage(cycles: Record<string, Record<string, unknown>> | undefined, context: Record<string, unknown> | undefined): string {
  const lines: string[] = [];
  if (cycles?.solar) lines.push(fmtCycle("Solar", cycles.solar));
  if (cycles?.zodiac) lines.push(fmtCycle("Zodiac", cycles.zodiac));
  if (cycles?.lunar) lines.push(fmtCycle("Lunar", cycles.lunar));
  if (cycles?.dayOfWeek) lines.push(fmtCycle("DayOfWeek", cycles.dayOfWeek));
  if (context) {
    const ctx = Object.entries(context)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    if (ctx) lines.push("\nPersonal context:\n" + ctx);
  }
  return lines.join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { cycles, context } = body ?? {};

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userMessage = buildUserMessage(cycles, context);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        temperature: 0.85,
      }),
    });

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
    const parsed = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { reading: content.trim() };

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-equilibrium-v2-synthesis error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
