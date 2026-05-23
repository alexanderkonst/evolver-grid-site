import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import {
    type ProfileForMatching,
    type SubScores,
    type RationalePayload,
    type CollaborationProposal,
    type QolVector,
    type AssetRow,
    scoreAssetFit,
    scoreQolSimilarity,
    composeResonance,
    buildGiftSignature,
    buildRationalePrompt,
    parseSimilarityScore,
    TOP_TALENT_RUBRIC_PROMPT,
    MISSION_SIMILARITY_RUBRIC_PROMPT,
} from "../_shared/matchScoring.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Matching Engine v3 — Day 80, Sasha 2026-05-22.
 *
 * Implements docs/02-strategy/matchmaking_strategy.md §5 (canonical
 * 4-input scoring with geometric-mean composition).
 *
 * Pipeline:
 *   1. Fetch all profiles + their ZoG snapshots + missions + assets + QoL.
 *   2. Build ProfileForMatching composites.
 *   3. Compute deterministic sub-scores (assets, qol) for current user × every candidate.
 *   4. ONE batched LLM call: Top Talent complementarity + Mission similarity
 *      for every candidate pair, returned as a JSON array (cost-efficient).
 *   5. Compose geometric-mean resonance scores; sort; filter to top 8 with score ≥ 40.
 *   6. ONE batched LLM call: rationale prose for the surviving matches.
 *   7. Return enriched matches with sub-scores visible (admin-debuggable).
 *
 * Model choice lives at MODEL_ID below. Sasha owns model upgrades via
 * Lovable; this constant is the one-line swap target.
 */

// Day 80 (Sasha 2026-05-22): the single point of model control. Swap
// here to upgrade the matching model via Lovable AI Gateway. Anything
// the gateway supports is valid. Examples:
//   "google/gemini-2.5-flash-lite"    — current cheap default
//   "google/gemini-2.5-pro"           — reasoning step-change
//   "anthropic/claude-sonnet-4-5"     — best editorial voice fit
//   "openai/gpt-4o"                   — strong all-rounder
const MODEL_ID = "google/gemini-2.5-flash-lite";

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { userId } = await req.json();
        if (!userId) {
            return jsonResponse({ error: "Missing userId" }, 400);
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        const supabase = createClient(supabaseUrl, supabaseKey);

        // ── 1. Profiles ──────────────────────────────────────────────
        const { data: allProfiles } = await supabase
            .from("game_profiles")
            .select(
                "user_id, first_name, last_name, location, spoken_languages, last_zog_snapshot_id, visibility, mission_statement, avatar_url",
            )
            .neq("visibility", "hidden");

        if (!allProfiles || allProfiles.length === 0) {
            return jsonResponse({ matches: [], message: "No profiles found." });
        }

        // ── 2. ZoG snapshots (Top Talent data) ───────────────────────
        const snapshotIds = allProfiles
            .map((p: any) => p.last_zog_snapshot_id)
            .filter(Boolean);

        const { data: snapshots } = await supabase
            .from("zog_snapshots")
            .select("id, appleseed_data")
            .in("id", snapshotIds);

        const snapshotMap = new Map<string, any>();
        for (const snap of snapshots || []) snapshotMap.set(snap.id, snap);

        // ── 3. Missions ──────────────────────────────────────────────
        const userIds = allProfiles
            .map((p: any) => p.user_id)
            .filter(Boolean);

        const { data: missionRows } = await supabase
            .from("mission_participants")
            .select("user_id, mission_title")
            .in("user_id", userIds)
            .order("created_at", { ascending: false });

        const missionMap = new Map<string, string>();
        for (const row of missionRows || []) {
            if (row.user_id && !missionMap.has(row.user_id)) {
                missionMap.set(row.user_id, row.mission_title || "");
            }
        }

        // ── 4. Assets (FULL taxonomy, not just type+title) ───────────
        const assetMap = new Map<string, AssetRow[]>();
        const { data: assetRows } = await supabase
            .from("user_assets")
            .select("user_id, type_id, sub_type_id, category_id, title, description")
            .in("user_id", userIds);

        for (const row of assetRows || []) {
            const existing = assetMap.get(row.user_id) || [];
            existing.push({
                type_id: row.type_id,
                sub_type_id: row.sub_type_id,
                category_id: row.category_id,
                title: row.title,
                description: row.description,
            });
            assetMap.set(row.user_id, existing);
        }

        // ── 5. QoL snapshots (Day 80 — newly wired into matching) ────
        // Each profile gets the LATEST qol_snapshots row. The QoL table
        // is keyed by profile_id (game_profiles.id), not user_id, so
        // we resolve profile_id from the game_profiles lookup we
        // already did above. Schema may evolve — see migrations for
        // current state.
        const qolMap = new Map<string, QolVector>();
        // game_profiles.id is the profile_id used by qol_snapshots
        const { data: gpRows } = await supabase
            .from("game_profiles")
            .select("id, user_id")
            .in("user_id", userIds);
        const profileIdToUserId = new Map<string, string>();
        for (const row of gpRows || []) {
            if (row.id && row.user_id) profileIdToUserId.set(row.id, row.user_id);
        }
        const profileIds = Array.from(profileIdToUserId.keys());
        if (profileIds.length) {
            const { data: qolRows } = await supabase
                .from("qol_snapshots")
                .select(
                    "profile_id, health_stage, wealth_stage, love_relationships_stage, social_ties_stage, growth_stage, impact_stage, happiness_stage, home_stage, created_at",
                )
                .in("profile_id", profileIds)
                .order("created_at", { ascending: false });
            // First (latest) per profile_id.
            for (const row of qolRows || []) {
                const uid = row.profile_id
                    ? profileIdToUserId.get(row.profile_id)
                    : null;
                if (!uid || qolMap.has(uid)) continue;
                qolMap.set(uid, {
                    health_stage: row.health_stage ?? 0,
                    wealth_stage: row.wealth_stage ?? 0,
                    love_relationships_stage: row.love_relationships_stage ?? 0,
                    social_ties_stage: row.social_ties_stage ?? 0,
                    growth_stage: row.growth_stage ?? 0,
                    impact_stage: row.impact_stage ?? 0,
                    happiness_stage: row.happiness_stage ?? 0,
                    home_stage: row.home_stage ?? 0,
                });
            }
        }

        // ── 6. Build composites ──────────────────────────────────────
        const composites: ProfileForMatching[] = [];
        for (const profile of allProfiles) {
            const uid = profile.user_id;
            if (!uid) continue;
            const snap = profile.last_zog_snapshot_id
                ? snapshotMap.get(profile.last_zog_snapshot_id)
                : null;
            const appleseed = snap?.appleseed_data;

            composites.push({
                userId: uid,
                archetype: appleseed?.vibrationalKey?.name || null,
                primeDriver: appleseed?.threeLenses?.primeDriver || null,
                topThreeTalents:
                    appleseed?.topTalentProfile?.top_three_talents_compact ||
                    [],
                missionStatement: profile.mission_statement || null,
                missionTitle: missionMap.get(uid) || null,
                assets: assetMap.get(uid) || [],
                qol: qolMap.get(uid) || null,
            });
        }

        // Side-table for surfacing name/avatar in the response (the
        // ProfileForMatching shape stays lean, focused on scoring inputs).
        const profileMeta = new Map<
            string,
            { firstName: string; lastName: string; avatarUrl: string | null; tagline: string | null }
        >();
        for (const p of allProfiles) {
            if (!p.user_id) continue;
            const snap = p.last_zog_snapshot_id
                ? snapshotMap.get(p.last_zog_snapshot_id)
                : null;
            const appleseed = snap?.appleseed_data;
            profileMeta.set(p.user_id, {
                firstName: p.first_name || "Community",
                lastName: p.last_name || "Member",
                avatarUrl: (p as any).avatar_url || null,
                tagline: appleseed?.vibrationalKey?.tagline || null,
            });
        }

        const currentUser = composites.find((c) => c.userId === userId);
        if (!currentUser) {
            return jsonResponse({
                matches: [],
                message: "Profile not found.",
            });
        }

        const candidates = composites.filter((c) => c.userId !== userId);
        if (candidates.length === 0) {
            return jsonResponse({
                matches: [],
                message: "No other members yet.",
            });
        }

        // ── 7. Minimum-data gate ─────────────────────────────────────
        // Current user needs at least Top Talent OR Mission to produce
        // meaningful matches. Without those two, scoring collapses to
        // (0.5 × 0.5 × ?asset × ?qol) which is mostly noise.
        const hasTopTalent =
            currentUser.topThreeTalents.length > 0 || !!currentUser.archetype;
        const hasMission =
            !!currentUser.missionStatement || !!currentUser.missionTitle;
        if (!hasTopTalent && !hasMission) {
            return jsonResponse({
                matches: [],
                message:
                    "Complete your Top Talent reveal and mission discovery to unlock matches.",
            });
        }

        // ── 8. Deterministic sub-scores: assets + qol ────────────────
        // Per §5.4 + §5.5. Computed locally, no LLM cost.
        const partialScores = candidates.map((cand) => ({
            userId: cand.userId,
            assets: scoreAssetFit(currentUser.assets, cand.assets),
            qol: scoreQolSimilarity(currentUser.qol, cand.qol),
        }));

        // ── 9. LLM sub-scores: top_talent + mission ──────────────────
        // Per §5.2 + §5.3. Batched into one call: ask the model to
        // return a JSON array of {idx, topTalent, mission} for every
        // candidate. Falls back to 0.5 neutral on parse failure so the
        // pipeline remains robust to model misbehavior.
        let llmSubScores: { idx: number; topTalent: number; mission: number }[] = [];

        if (LOVABLE_API_KEY) {
            const currentSignature = buildGiftSignature(currentUser);
            const currentMission =
                currentUser.missionStatement || currentUser.missionTitle || "";
            const candidateBlocks = candidates.map((c, i) => {
                const sig = buildGiftSignature(c);
                const mission = c.missionStatement || c.missionTitle || "";
                return `[${i}] Top Talent: ${sig}\n[${i}] Mission: ${
                    mission || "(no mission)"
                }`;
            });
            const batchPrompt =
                `You score two semantic similarity dimensions across multiple candidate pairs.

YOU (Person A):
Top Talent: ${currentSignature}
Mission: ${currentMission || "(no mission)"}

For each candidate below, return:
  - topTalent: a 0.0-1.0 score per this rubric.
${TOP_TALENT_RUBRIC_PROMPT}

  - mission: a 0.0-1.0 score per this rubric.
${MISSION_SIMILARITY_RUBRIC_PROMPT}

Output ONLY a JSON array, one entry per candidate:
[{"idx": 0, "topTalent": 0.7, "mission": 0.4}, {"idx": 1, "topTalent": 0.2, "mission": 0.9}, ...]
No markdown, no explanation, no extra fields.

CANDIDATES:
${candidateBlocks.join("\n\n")}`;

            try {
                const subScoreResp = await fetch(
                    "https://ai.gateway.lovable.dev/v1/chat/completions",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${LOVABLE_API_KEY}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            model: MODEL_ID,
                            messages: [{ role: "user", content: batchPrompt }],
                            temperature: 0.1,
                        }),
                    },
                );
                if (subScoreResp.ok) {
                    const r = await subScoreResp.json();
                    const content = r.choices?.[0]?.message?.content || "[]";
                    const jsonMatch = content.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        if (Array.isArray(parsed)) {
                            llmSubScores = parsed.map((row: any) => ({
                                idx: Number(row.idx),
                                topTalent: parseSimilarityScore(
                                    String(row.topTalent ?? "0.5"),
                                ),
                                mission: parseSimilarityScore(
                                    String(row.mission ?? "0.5"),
                                ),
                            }));
                        }
                    }
                } else {
                    console.warn(
                        "[matching] sub-score LLM call failed:",
                        subScoreResp.status,
                    );
                }
            } catch (err) {
                console.warn("[matching] sub-score LLM call threw:", err);
            }
        }

        // Build per-candidate sub-score lookup with fallbacks.
        const llmByIdx = new Map<number, { topTalent: number; mission: number }>();
        for (const row of llmSubScores) {
            llmByIdx.set(row.idx, { topTalent: row.topTalent, mission: row.mission });
        }

        // ── 10. Compose resonance + rank ─────────────────────────────
        type ScoredCandidate = {
            idx: number;
            candidate: ProfileForMatching;
            subScores: SubScores;
            resonance: number;
        };
        const scored: ScoredCandidate[] = candidates.map((cand, i) => {
            const partial = partialScores[i];
            const llm = llmByIdx.get(i) || { topTalent: 0.5, mission: 0.5 };
            const subScores: SubScores = {
                topTalent: llm.topTalent,
                mission: llm.mission,
                assets: partial.assets,
                qol: partial.qol,
            };
            return {
                idx: i,
                candidate: cand,
                subScores,
                resonance: composeResonance(subScores),
            };
        });

        // Day 80 (Sasha 2026-05-23): threshold relaxed + always-surface
        // fallback. The previous `>= 40` cutoff filtered out almost
        // everyone when the candidate pool was sparsely populated.
        // Threshold lowered to 25; if zero pairs clear it, surface the
        // top by score regardless.
        //
        // Day 80 (Sasha 2026-05-23, second pass): portion logic. The
        // surface cap drops from 8 to 3 per session per
        // matchmaking_strategy.md §8.8. Three is below cognitive
        // fatigue, signals scarcity = value, and leaves headroom for
        // the weekly digest to bring fresh matches. The "See more
        // matches" button on the page surfaces "fresh matches Monday"
        // rather than loading more from the same pool.
        const sortedByScore = [...scored].sort(
            (a, b) => b.resonance - a.resonance,
        );
        const aboveThreshold = sortedByScore.filter((s) => s.resonance >= 25);
        const survivors =
            aboveThreshold.length > 0
                ? aboveThreshold.slice(0, 3)
                : sortedByScore.slice(0, 3);

        if (survivors.length === 0) {
            // Genuinely empty pool (no candidates at all).
            return jsonResponse({
                matches: [],
                message:
                    "No other members are far enough into their profiles yet. As more people join, this will fill in.",
            });
        }

        // ── 11. Rationale prose (one LLM call per match) ─────────────
        // Per §5.7. Done per-match (not batched) so each prose block
        // gets a full attention budget on that specific pair.
        const matches: any[] = [];
        for (const s of survivors) {
            const meta = profileMeta.get(s.candidate.userId);
            // Day 80 (Sasha 2026-05-23): pass actual first names to
            // the rationale writer so it produces "you / [their name]"
            // prose instead of "Profile A / Profile B".
            const currentMeta = profileMeta.get(currentUser.userId);
            const currentFirstName = currentMeta?.firstName || "you";
            const candidateFirstName = meta?.firstName || "they";
            const rationale = LOVABLE_API_KEY
                ? await fetchRationale(
                      LOVABLE_API_KEY,
                      currentUser,
                      s.candidate,
                      s.subScores,
                      s.resonance,
                      currentFirstName,
                      candidateFirstName,
                  )
                : fallbackRationale(s.subScores);

            matches.push({
                userId: s.candidate.userId,
                firstName: meta?.firstName || "Community",
                lastName: meta?.lastName || "Member",
                archetype: s.candidate.archetype,
                tagline: meta?.tagline || null,
                avatarUrl: meta?.avatarUrl || null,
                resonanceScore: s.resonance,
                subScores: s.subScores,
                matchType: rationale.matchType,
                proposals: rationale.proposals,
                // Day 80 (Sasha 2026-05-23): legacy fields kept so the
                // current UI doesn't break before its triplet-aware
                // update lands. UI can read the first proposal via
                // `proposals[0]` or fall back to the legacy strings.
                collaborationProposal: rationale.proposals[0]?.proposal || "",
                evolutionLine: rationale.proposals[0]?.evolutionLine || "",
                suggestedAction: rationale.suggestedAction,
                alignment: rationale.alignment,
                complementarity: rationale.complementarity,
                friction: rationale.friction,
                theirAssets: s.candidate.assets.slice(0, 5).map((a) => ({
                    typeId: a.type_id,
                    title: a.title || "",
                })),
            });
        }

        return jsonResponse({ matches });
    } catch (error) {
        console.error("Error in suggest-asset-matches:", error);
        return jsonResponse(
            { error: error instanceof Error ? error.message : "Unknown error" },
            500,
        );
    }
});

// ─── Helpers ─────────────────────────────────────────────────────────

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

/**
 * Per-match rationale prose call. Returns a RationalePayload or a
 * fallback if the model misbehaves.
 */
async function fetchRationale(
    apiKey: string,
    current: ProfileForMatching,
    candidate: ProfileForMatching,
    subScores: SubScores,
    resonance: number,
    currentFirstName: string,
    candidateFirstName: string,
): Promise<RationalePayload> {
    const systemPrompt = buildRationalePrompt();
    const profileBlock = (p: ProfileForMatching, label: string) => {
        const lines = [`=== ${label} ===`];
        if (p.archetype) lines.push(`Archetype: ${p.archetype}`);
        if (p.primeDriver) lines.push(`Prime driver: ${p.primeDriver}`);
        if (p.topThreeTalents.length) {
            lines.push(`Top three talents: ${p.topThreeTalents.join(", ")}`);
        }
        const mission = p.missionStatement || p.missionTitle;
        if (mission) lines.push(`Mission: ${mission}`);
        if (p.assets.length) {
            lines.push(
                `Assets: ${p.assets
                    .map((a) => `${a.type_id}: ${a.title || "(untitled)"}${a.description ? ` — ${a.description.slice(0, 120)}` : ""}`)
                    .join(" || ")}`,
            );
        }
        if (p.qol) {
            lines.push(
                `QoL stages: health=${p.qol.health_stage}, wealth=${p.qol.wealth_stage}, love=${p.qol.love_relationships_stage}, social=${p.qol.social_ties_stage}, growth=${p.qol.growth_stage}, impact=${p.qol.impact_stage}, happiness=${p.qol.happiness_stage}, home=${p.qol.home_stage}`,
            );
        }
        return lines.join("\n");
    };

    // Day 80 (Sasha 2026-05-23): blocks labeled by ACTUAL first names
    // instead of "Profile A / Profile B". The system prompt forbids
    // those labels in the output; this is the input-side change that
    // makes the swap reliable.
    const userPrompt = `${profileBlock(current, `YOU (${currentFirstName})`)}

${profileBlock(candidate, `THEM (${candidateFirstName})`)}

Address the requesting user (${currentFirstName}) in second person ("you", "your"). Address the candidate by their first name (${candidateFirstName}). Do NOT use the strings "Profile A", "Profile B", "Person A", "Person B", or any similar label.

SUB-SCORES (already computed; use these as ground truth for your prose):
  top_talent_complementarity: ${subScores.topTalent.toFixed(2)}
  mission_similarity:         ${subScores.mission.toFixed(2)}
  asset_lego_fit:             ${subScores.assets.toFixed(2)}
  qol_similarity:             ${subScores.qol.toFixed(2)}
  composite_resonance:        ${resonance}

Return the JSON.`;

    try {
        const resp = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: MODEL_ID,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt },
                    ],
                    temperature: 0.5,
                }),
            },
        );
        if (!resp.ok) {
            console.warn("[matching] rationale LLM failed:", resp.status);
            return fallbackRationale(subScores);
        }
        const r = await resp.json();
        const content = r.choices?.[0]?.message?.content || "{}";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return fallbackRationale(subScores);
        const parsed = JSON.parse(jsonMatch[0]);
        const rawProposals = Array.isArray(parsed.proposals) ? parsed.proposals : [];
        const proposals: CollaborationProposal[] = rawProposals
            .slice(0, 3)
            .map((p: any) => ({
                type: String(p?.type || "Co-Build").slice(0, 32),
                proposal: String(p?.proposal || "").slice(0, 400),
                evolutionLine: String(p?.evolutionLine || "").slice(0, 200),
            }))
            .filter((p: CollaborationProposal) => p.proposal.length > 0);
        // Ensure we always return 3; pad with the fallback if the model
        // returned fewer than asked.
        while (proposals.length < 3) {
            proposals.push({
                type: "Co-Learn",
                proposal:
                    "Open a single conversation to find the specific shape together.",
                evolutionLine: "",
            });
        }
        return {
            matchType: validMatchType(parsed.matchType) || inferMatchType(subScores),
            proposals,
            suggestedAction: validSuggestedAction(parsed.suggestedAction) || "intro",
            alignment: String(parsed.alignment || "").slice(0, 240),
            complementarity: String(parsed.complementarity || "").slice(0, 240),
            friction: String(parsed.friction || "None identified").slice(0, 240),
        };
    } catch (err) {
        console.warn("[matching] rationale LLM threw:", err);
        return fallbackRationale(subScores);
    }
}

/**
 * Deterministic fallback for the rationale shape when the LLM is
 * unavailable. Keeps the page functional in a degraded mode.
 */
function fallbackRationale(subScores: SubScores): RationalePayload {
    return {
        matchType: inferMatchType(subScores),
        proposals: [
            {
                type: "Co-Learn",
                proposal:
                    "Open a single conversation to feel the resonance and decide what shape fits.",
                evolutionLine: "",
            },
            {
                type: "Co-Distribute",
                proposal:
                    "Swap audiences via a single guest appearance to test the fit at low commitment.",
                evolutionLine: "",
            },
            {
                type: "Co-Resource",
                proposal:
                    "Trade one warm introduction each as the lightest possible first move.",
                evolutionLine: "",
            },
        ],
        suggestedAction: "intro",
        alignment:
            subScores.mission >= 0.6
                ? "You're moving in similar directions."
                : "Mission directions differ; alignment may be circumstantial.",
        complementarity:
            subScores.topTalent >= 0.6 || subScores.assets >= 0.6
                ? "Your gifts and assets compose into something neither could build alone."
                : "Modest complementarity; the strongest connection is elsewhere.",
        friction: "None identified",
    };
}

function inferMatchType(s: SubScores): RationalePayload["matchType"] {
    // Heuristic shape-recognition used when LLM doesn't label the pair.
    if (s.topTalent >= 0.7 && s.mission >= 0.7) return "co-founder";
    if (s.assets >= 0.7) return "collaborator";
    if (s.topTalent <= 0.4 && s.mission >= 0.6) return "peer";
    if (s.qol >= 0.8 && s.topTalent >= 0.6) return "mentor";
    return "collaborator";
}

function validMatchType(v: unknown): RationalePayload["matchType"] | null {
    const valid = ["co-founder", "collaborator", "peer", "mentor", "client-fit"];
    return typeof v === "string" && valid.includes(v)
        ? (v as RationalePayload["matchType"])
        : null;
}

function validSuggestedAction(v: unknown): RationalePayload["suggestedAction"] | null {
    const valid = ["intro", "micro-collab", "practice-together", "wait"];
    return typeof v === "string" && valid.includes(v)
        ? (v as RationalePayload["suggestedAction"])
        : null;
}
