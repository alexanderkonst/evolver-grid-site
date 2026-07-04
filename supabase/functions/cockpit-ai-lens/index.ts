import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CockpitLensId = "project-becoming" | "founder-shadow";

interface LensSpec {
  label: string;
  instruction: string;
}

const ADMIN_EMAILS = new Set(["alexanderkonst@gmail.com", "konst@alum.mit.edu", "me@sloan.mit.edu"]);

const LENSES: Record<CockpitLensId, LensSpec> = {
  "project-becoming": {
    label: "What Is the Project Becoming?",
    instruction:
      "Read the provided context as one living project field. Name what the project is actually becoming now, not what Sasha hopes it becomes. Use Equilibrium, pulse, CRM, and holomap context. Distinguish real trajectory from aspiration. Surface the consequence of this becoming and one concrete next move.",
  },
  "founder-shadow": {
    label: "Current Founder Shadow",
    instruction:
      "Identify the current key founder shadow at play in blocking progress. Read the whole stack, especially the holomap context, plus Equilibrium, pulse, and CRM. Do not moralize or psychologize vaguely. Distinguish a true founder shadow from an ordinary operational constraint. Name one corrective move that preserves the useful signal while removing noise.",
  },
};

const SYSTEM_PROMPT = `
You are the Founder Cockpit AI lens for Sasha's Founder Life's Work Navigation system.

You read context as a living project field: strategy, relationships, pulses, tasks, bottlenecks, and holomap meaning.

Rules:
- Be concrete and decision-useful.
- Do not flatter.
- Do not write generic coaching advice.
- Do not invent facts that are not implied by the context.
- Prefer one clear read over many weak possibilities.
- Preserve signal; remove noise.

Return JSON only with this exact shape:
{
  "title": "short title",
  "bottomLine": "the strongest conclusion in 1-2 sentences",
  "evidence": ["3-5 concrete signals from the provided context"],
  "consequence": "what follows if this is true",
  "recommendedMove": "one concrete next move",
  "confidence": "low|medium|high",
  "markdown": "a clean markdown version of the answer"
}
`.trim();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function compact(value: unknown, maxLength = 18000) {
  const text = JSON.stringify(value ?? {}, null, 2);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}\n...[truncated]`;
}

function parseJsonObject(content: string) {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  const candidate = fenced ?? trimmed.match(/\{[\s\S]*\}/)?.[0] ?? trimmed;
  return JSON.parse(candidate);
}

function bearerToken(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  return auth.match(/^Bearer\s+(.+)$/i)?.[1] ?? null;
}

async function requireAdmin(req: Request) {
  const token = bearerToken(req);
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!token || !supabaseUrl || !anonKey) return false;

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await authClient.auth.getUser();
  if (error || !data.user) {
    return false;
  }

  return ADMIN_EMAILS.has(String(data.user.email ?? "").toLowerCase());
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!(await requireAdmin(req))) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const { lensId, context } = await req.json();
    const spec = LENSES[lensId as CockpitLensId];
    if (!spec) {
      return jsonResponse({ error: "Unknown cockpit lens." }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return jsonResponse({ error: "LOVABLE_API_KEY is not configured." }, 500);
    }

    const userMessage = `
Lens: ${spec.label}

Instruction:
${spec.instruction}

Context:
${compact(context)}
`.trim();

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
        temperature: 0.45,
      }),
    });

    if (response.status === 429) {
      return jsonResponse({ error: "Rate limit exceeded." }, 429);
    }
    if (response.status === 402) {
      return jsonResponse({ error: "AI credits exhausted." }, 402);
    }
    if (!response.ok) {
      const text = await response.text();
      console.error("[cockpit-ai-lens] AI gateway error", response.status, text);
      return jsonResponse({ error: "AI gateway error." }, 500);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseJsonObject(content);

    return jsonResponse({
      title: String(parsed.title ?? spec.label),
      bottomLine: String(parsed.bottomLine ?? ""),
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence.map(String).slice(0, 5) : [],
      consequence: String(parsed.consequence ?? ""),
      recommendedMove: String(parsed.recommendedMove ?? ""),
      confidence: ["low", "medium", "high"].includes(parsed.confidence) ? parsed.confidence : "medium",
      markdown: String(parsed.markdown ?? `# ${parsed.title ?? spec.label}\n\n${parsed.bottomLine ?? ""}`),
    });
  } catch (error) {
    console.error("[cockpit-ai-lens] fatal", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown error." }, 500);
  }
});
