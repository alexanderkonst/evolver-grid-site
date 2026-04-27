import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Asset Matchmaking v2 — AI-Powered Resonance Matching
 *
 * Synthesizes ALL four data sources per user:
 *   1. Appleseed (archetype, prime driver, actions)
 *   2. Excalibur (offer, ICP, transformational promise)
 *   3. Mission (shared mission commitment)
 *   4. Assets (user_assets table — expertise, resources, IP, etc.)
 *
 * Uses Gemini to score Alignment × Complementarity − Friction
 * and generate concrete collaboration proposals with suggested actions.
 */

interface ProfileComposite {
  userId: string;
  name: string;
  archetype: string | null;
  tagline: string | null;
  primeDriver: string | null;
  actions: string[];
  offer: string | null;
  idealClientProfile: string | null;
  idealClientProblem: string | null;
  fromState: string | null;
  toState: string | null;
  moonshot: string | null;
  missionTitle: string | null;
  assets: { type: string; title: string; description: string | null }[];
  location: string | null;
  languages: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── 1. Gather ALL profiles with ZoG snapshots ──────────────────────

    const { data: allProfiles } = await supabase
      .from("game_profiles")
      .select("user_id, first_name, last_name, location, spoken_languages, last_zog_snapshot_id, visibility")
      .neq("visibility", "hidden");

    if (!allProfiles || allProfiles.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: "No profiles found." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Fetch ZoG snapshots (Appleseed + Excalibur) ─────────────────

    const snapshotIds = allProfiles
      .map((p: any) => p.last_zog_snapshot_id)
      .filter(Boolean);

    const { data: snapshots } = await supabase
      .from("zog_snapshots")
      .select("id, appleseed_data, excalibur_data")
      .in("id", snapshotIds);

    const snapshotMap = new Map<string, any>();
    for (const snap of (snapshots || [])) {
      snapshotMap.set(snap.id, snap);
    }

    // ── 3. Fetch missions ──────────────────────────────────────────────

    const userIds = allProfiles.map((p: any) => p.user_id).filter(Boolean);

    const { data: missionRows } = await supabase
      .from("mission_participants")
      .select("user_id, mission_title")
      .in("user_id", userIds)
      .order("created_at", { ascending: false });

    // Latest mission per user
    const missionMap = new Map<string, string>();
    for (const row of (missionRows || [])) {
      if (row.user_id && !missionMap.has(row.user_id)) {
        missionMap.set(row.user_id, row.mission_title || "");
      }
    }

    // ── 4. Fetch assets ────────────────────────────────────────────────

    const assetMap = new Map<string, { type: string; title: string; description: string | null }[]>();
    const { data: assetRows, error: assetError } = await supabase
      .from("user_assets")
      .select("user_id, type_id, title, description")
      .in("user_id", userIds);

    if (!assetError && assetRows) {
      for (const row of assetRows) {
        const existing = assetMap.get(row.user_id) || [];
        existing.push({ type: row.type_id, title: row.title, description: row.description });
        assetMap.set(row.user_id, existing);
      }
    }

    // ── 5. Build profile composites ────────────────────────────────────

    const composites: ProfileComposite[] = [];

    for (const profile of allProfiles) {
      const uid = profile.user_id;
      if (!uid) continue;

      const snap = profile.last_zog_snapshot_id
        ? snapshotMap.get(profile.last_zog_snapshot_id)
        : null;

      const appleseed = snap?.appleseed_data as any;
      const excalibur = snap?.excalibur_data as any;

      composites.push({
        userId: uid,
        name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Community Member",
        archetype: appleseed?.vibrationalKey?.name || null,
        tagline: appleseed?.vibrationalKey?.tagline || null,
        primeDriver: appleseed?.threeLenses?.primeDriver || null,
        actions: appleseed?.threeLenses?.actions || [],
        offer: excalibur?.offer?.statement || null,
        idealClientProfile: excalibur?.idealClient?.profile || null,
        idealClientProblem: excalibur?.idealClient?.problem || null,
        fromState: excalibur?.transformationalPromise?.fromState || null,
        toState: excalibur?.transformationalPromise?.toState || null,
        moonshot: excalibur?.biggerArc?.moonshot || null,
        missionTitle: missionMap.get(uid) || null,
        assets: assetMap.get(uid) || [],
        location: profile.location || null,
        languages: Array.isArray(profile.spoken_languages) ? profile.spoken_languages : [],
      });
    }

    // Find the requesting user
    const currentUser = composites.find(c => c.userId === userId);
    if (!currentUser) {
      return new Response(
        JSON.stringify({ matches: [], message: "Profile not found." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const candidates = composites.filter(c => c.userId !== userId);
    if (candidates.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: "No other members yet." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 6. Check if we have enough data + AI available ──────────────────

    const hasAssets = currentUser.assets.length > 0;
    const hasExcalibur = !!currentUser.offer;
    const hasMinimumData = hasAssets || hasExcalibur || !!currentUser.archetype;

    if (!hasMinimumData) {
      return new Response(
        JSON.stringify({ matches: [], message: "Complete your Zone of Genius or map your assets first." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 7. Build AI prompt ──────────────────────────────────────────────

    const formatComposite = (c: ProfileComposite, label: string): string => {
      const lines = [`=== ${label}: ${c.name} ===`];
      if (c.archetype) lines.push(`Archetype: ${c.archetype}`);
      if (c.primeDriver) lines.push(`Prime Driver: ${c.primeDriver}`);
      if (c.actions.length) lines.push(`Actions: ${c.actions.join(", ")}`);
      if (c.offer) lines.push(`Offer: ${c.offer}`);
      if (c.idealClientProfile) lines.push(`Ideal Client: ${c.idealClientProfile}`);
      if (c.idealClientProblem) lines.push(`Client Problem: ${c.idealClientProblem}`);
      if (c.fromState && c.toState) lines.push(`Transformation: "${c.fromState}" → "${c.toState}"`);
      if (c.moonshot) lines.push(`Moonshot: ${c.moonshot}`);
      if (c.missionTitle) lines.push(`Mission: ${c.missionTitle}`);
      if (c.assets.length) {
        lines.push(`Assets: ${c.assets.map(a => `${a.type}: ${a.title}`).join("; ")}`);
      }
      if (c.location) lines.push(`Location: ${c.location}`);
      return lines.join("\n");
    };

    const userProfile = formatComposite(currentUser, "YOU");
    const candidateProfiles = candidates
      .map((c, i) => formatComposite(c, `CANDIDATE_${i}`))
      .join("\n\n");

    const systemPrompt = `You are the Matchmaking Engine for an evolutionary coordination platform.

Your job: Given a user's full profile and a set of candidates, identify the best collaboration matches.

SCORING DIMENSIONS (from the Resonance Formula):
- Alignment: shared mission, values, archetype compatibility
- Complementarity: their Capacity fills your Need, and vice versa (Offer ↔ ICP cross-reference, Asset gaps filled)
- Friction: timezone/location mismatch, language barriers, timing conflicts

MATCH TYPES (pick the most fitting):
- "co-founder" — deep complementary genius, could build together
- "collaborator" — specific asset/skill exchange opportunity
- "peer" — similar stage, mutual accountability
- "mentor" — further along a similar trajectory
- "client-fit" — their ICP matches you, or yours matches them

SUGGESTED ACTIONS (pick one per match):
- "intro" — Facilitated introduction
- "micro-collab" — Small shared project to test fit
- "practice-together" — Joint practice or session
- "wait" — Timing not right, revisit later

RULES:
- Only return matches with resonance score >= 40
- Maximum 8 matches
- Each collaboration proposal must be SPECIFIC: name what they could build/do together
- If someone's Offer matches another's ICP problem, that's a high-signal match
- Consider asset complementarity: expertise + resources, IP + influence, networks + expertise
- Be honest about friction — don't force matches

Return ONLY a JSON array. No markdown, no explanation:
[
  {
    "candidateIndex": 0,
    "resonanceScore": 82,
    "matchType": "collaborator",
    "collaborationProposal": "Specific proposal of what these two should do together",
    "suggestedAction": "micro-collab",
    "alignment": "One sentence on values/mission alignment",
    "complementarity": "One sentence on capacity/need fit",
    "friction": "One sentence on potential friction or 'None identified'"
  }
]`;

    // ── 8. Call Gemini ──────────────────────────────────────────────────

    if (!LOVABLE_API_KEY) {
      // Fallback: return empty matches if no API key
      console.warn("LOVABLE_API_KEY not set, cannot run AI matching");
      return new Response(
        JSON.stringify({ matches: [], message: "AI matching not configured." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${userProfile}\n\n${candidateProfiles}` },
        ],
        temperature: 0.4,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ matches: [], message: "Rate limited. Try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI matching failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "[]";

    // Parse AI response
    let aiMatches: any[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiMatches = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      aiMatches = [];
    }

    // ── 9. Enrich with profile data and return ──────────────────────────

    const matches = aiMatches
      .filter((m: any) => typeof m.candidateIndex === "number" && m.candidateIndex < candidates.length)
      .map((m: any) => {
        const candidate = candidates[m.candidateIndex];
        return {
          userId: candidate.userId,
          firstName: candidate.name.split(" ")[0] || "Community",
          lastName: candidate.name.split(" ").slice(1).join(" ") || "Member",
          archetype: candidate.archetype,
          tagline: candidate.tagline,
          resonanceScore: Math.min(m.resonanceScore || 0, 100),
          matchType: m.matchType || "collaborator",
          collaborationProposal: m.collaborationProposal || "",
          suggestedAction: m.suggestedAction || "intro",
          alignment: m.alignment || "",
          complementarity: m.complementarity || "",
          friction: m.friction || "None identified",
          theirAssets: candidate.assets.slice(0, 5).map(a => ({ typeId: a.type, title: a.title })),
        };
      })
      .sort((a: any, b: any) => b.resonanceScore - a.resonanceScore);

    return new Response(
      JSON.stringify({ matches }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in suggest-asset-matches:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
