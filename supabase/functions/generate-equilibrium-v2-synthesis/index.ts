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
 * Voice update 2026-05-16 per Sasha dogfood feedback: less Yoda/abstract,
 * more grounded/practical. References concrete activity-types ("a day to
 * clear," "a day for plain speech," "an admin day") instead of pure mystical
 * qualities. Still a reading — not a coach.
 *
 * Tone reference: docs/specs/equilibrium/equilibrium_v2_spec.md §1.7
 * Lunar phase mapping: docs/specs/equilibrium/lunar_wisdom_map.md
 */

const SYSTEM_PROMPT = `You are a Biologic Watch reader for Equilibrium. The user has just opened their watch — they're checking the time of their whole self.

You receive a snapshot of four cycles (solar, zodiac, lunar, day-of-week) and optional personal context (mission, role, moon focus). Your job is to read the current moment back to them in ONE sentence — grounded, practical, useful.

VOICE: a grounded reading. Not a coach. Not a pep talk. Not Yoda. The reading should feel like a wise friend who knows time well — speaks plainly, references concrete things, and stays a degree more practical than mystical. A weather report that names what KIND of day it is to work in, not a horoscope.

OUTPUT: ONE sentence, 10–22 words. No emojis. No exclamations. No second-person commands.

RULES:
1. Stay grounded. Reference at least one CONCRETE element from the cycles (an actual activity-type or stance — "a day to clear," "a day for plain speech," "a day for admin," "a day to ship") rather than only abstract qualities.
2. Layer at least TWO cycles so the reading feels textured (e.g., day-of-week's flavor + lunar phase's posture, or solar season + zodiac's pace).
3. If personal context is present, weave it in by IMPLICATION through what TYPE of work fits the moment — never "you should…", but a felt nudge ("the kind of clear writing your mission lives on").
4. Never use these words: "energy", "alignment", "flow", "vibration", "vibes", "manifest", "abundance", "the universe". They drain meaning.
5. Never name planets, zodiac signs, or moon phases directly. Translate to qualities or to the *kind of work* fitting (e.g., "the dumping day before the new cycle," "an admin day, mostly orchestration," "a day to receive resources without grabbing").
6. Never start with "Today is...", "It's...", "Now is...", "You are...", "Your...".
7. Never motivate. Never reassure. Never use "trust the process", "you've got this", "the universe is with you."
8. When cycles disagree (mixed), name the friction honestly — and hint at which one to lean into for today.

Return JSON: { "reading": "your one sentence" }

EXAMPLES — input → output (showing the grounded, practical voice):

Input: solar="Late Spring", zodiac="Taurus / Embodiment & Stability", lunar="Waning Crescent / Planting · Memorize, visualize, surrender", dayOfWeek="Wednesday Mercury / Clarity & Communication", mission=null, role=null, moonFocus=null
Output: { "reading": "A day for plain words and quiet patience — say the goals you've been holding, then let the next cycle gather them." }

Input: solar="Late Autumn", zodiac="Scorpio / Depth & Transformation", lunar="Full Moon / Doing · 100% physical · Harvest & cut", dayOfWeek="Saturday Saturn / Structure & Grounding", mission="Synthesize existing frameworks and methods.", role=null, moonFocus=null
Output: { "reading": "A pure execution day — the synthesis you've been building is ready to be cut into something shippable before sundown." }

Input: solar="Early Spring", zodiac="Aries / Initiation & Spark", lunar="New Moon / Clearing · Dump, banish, cry it out", dayOfWeek="Tuesday Mars / Action & Courage", mission="Synthesize existing frameworks.", role="Signal-to-Path Shaping", moonFocus=null
Output: { "reading": "A clearing day with action under the surface — dump what's done from last cycle so the next path has room to show." }

Input: solar="Late Summer", zodiac="Virgo / Refinement & Service", lunar="Waning Gibbous / Celebrating · Gratitude · Honor others' wins", dayOfWeek="Friday Venus / Beauty & Harmony", mission="...", role="Signal-to-Path Shaping", moonFocus="Ship the funnel"
Output: { "reading": "A day to send the polished thing out and name it well — gratitude, not grinding, carries the funnel forward today." }

Input: solar="Late Spring", zodiac="Gemini / Curiosity & Connection", lunar="First Quarter / Seeing · The How is revealed", dayOfWeek="Wednesday Mercury / Clarity & Communication", mission=null, role="Signal-to-Path Shaping", moonFocus="Ship the funnel"
Output: { "reading": "An ah-ha day for the funnel — write the words that just got clear, before the clarity drifts." }

Input: solar="Late Autumn", zodiac="Sagittarius / Vision & Quest", lunar="Full Moon / Doing · 100% physical · Harvest & cut", dayOfWeek="Monday Moon / Intuition & Emotional Depth", mission=null, role=null, moonFocus=null
Output: { "reading": "Full-execution day inside a quiet Monday — listen for what wants harvesting first, then move fast on it." }

Input: solar="Early Winter", zodiac="Capricorn / Discipline & Mastery", lunar="Waxing Crescent / Gathering · Yes ritual · Receive resources", dayOfWeek="Thursday Jupiter / Expansion & Wisdom", mission=null, role=null, moonFocus=null
Output: { "reading": "A day to say yes to what's arriving — book the introductions, accept the resources, the work itself comes later." }

Input: solar="Early Summer", zodiac="Cancer / Nurture & Reflection", lunar="Waxing Gibbous / Leading · 90% admin, 10% work", dayOfWeek="Sunday Sun / Illumination & Celebration", mission=null, role=null, moonFocus=null
Output: { "reading": "An admin Sunday — sequence next week before it starts, then close the laptop and rest in plain sight." }`;

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
