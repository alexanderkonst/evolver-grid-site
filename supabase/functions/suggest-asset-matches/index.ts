import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Asset Matchmaking — Win-Win Collaboration Engine
 * 
 * Given user A's assets, find other users whose assets are COMPLEMENTARY,
 * meaning together they form a stronger unit. The optimization goal is
 * win-win collaborations:
 * 
 * - Someone with Expertise needs Resources or Networks
 * - Someone with IP needs Influence or Resources  
 * - Someone with Networks benefits those with IP or Expertise
 * - etc.
 */

// Type-level complementarity map
// Key = what you HAVE → Value = what types would pair well with yours
const TYPE_COMPLEMENTARITY: Record<string, string[]> = {
    "expertise":    ["resources", "networks", "influence", "ip"],
    "experiences":  ["expertise", "networks", "influence"],
    "networks":     ["expertise", "ip", "resources", "influence"],
    "resources":    ["expertise", "ip", "networks"],
    "ip":           ["resources", "networks", "influence", "expertise"],
    "influence":    ["ip", "expertise", "resources", "networks"],
};

interface UserAssetRow {
    id: string;
    user_id: string;
    type_id: string;
    sub_type_id: string | null;
    category_id: string | null;
    title: string;
    description: string | null;
}

interface AssetMatch {
    userId: string;
    firstName: string;
    lastName: string;
    archetype: string | null;
    tagline: string | null;
    matchScore: number;
    matchReasons: string[];
    theirAssets: { typeId: string; title: string }[];
    yourComplementaryTypes: string[];
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { userId } = await req.json() as { userId: string };

        if (!userId) {
            return new Response(
                JSON.stringify({ error: "Missing userId" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Get the requesting user's assets
        const { data: myAssets, error: myError } = await supabase
            .from("user_assets")
            .select("id, user_id, type_id, sub_type_id, category_id, title, description")
            .eq("user_id", userId);

        if (myError) {
            console.error("Failed to fetch user assets:", myError);
            throw myError;
        }

        if (!myAssets || myAssets.length === 0) {
            return new Response(
                JSON.stringify({ matches: [], message: "No assets found. Map your assets first." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 2. Determine what types the user has and what would complement them
        const myTypes = new Set(myAssets.map((a: UserAssetRow) => a.type_id));
        const mySubTypes = new Set(myAssets.map((a: UserAssetRow) => a.sub_type_id).filter(Boolean));
        const myCategories = new Set(myAssets.map((a: UserAssetRow) => a.category_id).filter(Boolean));
        
        const complementaryTypes = new Set<string>();
        myTypes.forEach(type => {
            const complements = TYPE_COMPLEMENTARITY[type] || [];
            complements.forEach(c => complementaryTypes.add(c));
        });

        // 3. Get all other users' assets
        const { data: otherAssets, error: otherError } = await supabase
            .from("user_assets")
            .select("id, user_id, type_id, sub_type_id, category_id, title, description")
            .neq("user_id", userId);

        if (otherError) {
            console.error("Failed to fetch other assets:", otherError);
            throw otherError;
        }

        if (!otherAssets || otherAssets.length === 0) {
            return new Response(
                JSON.stringify({ matches: [], message: "No other users with assets yet." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 4. Group other assets by user
        const userAssetMap = new Map<string, UserAssetRow[]>();
        for (const asset of otherAssets) {
            const existing = userAssetMap.get(asset.user_id) || [];
            existing.push(asset);
            userAssetMap.set(asset.user_id, existing);
        }

        // 5. Score each user
        const scoredUsers: { userId: string; score: number; reasons: string[]; assets: UserAssetRow[]; complementaryTo: string[] }[] = [];

        for (const [otherUserId, assets] of userAssetMap.entries()) {
            let score = 0;
            const reasons: string[] = [];
            const complementaryTo: string[] = [];

            for (const asset of assets) {
                // Type complementarity: they have what we need
                if (complementaryTypes.has(asset.type_id)) {
                    score += 40;
                    complementaryTo.push(asset.type_id);
                }

                // Subtype overlap: shared domain expertise → collaboration on same domain
                if (asset.sub_type_id && mySubTypes.has(asset.sub_type_id)) {
                    score += 20;
                    reasons.push(`Shared domain: ${asset.sub_type_id}`);
                }

                // Category match: exact same specialty → direct peer collaboration
                if (asset.category_id && myCategories.has(asset.category_id)) {
                    score += 15;
                    reasons.push(`Shared specialty: ${asset.category_id}`);
                }
            }

            if (score > 0) {
                // Build human-readable reason
                const uniqueComplementaryTypes = [...new Set(complementaryTo)];
                if (uniqueComplementaryTypes.length > 0) {
                    const myTypesList = [...myTypes].join(", ");
                    const theirTypes = uniqueComplementaryTypes.join(", ");
                    reasons.unshift(`You have ${myTypesList} — they bring ${theirTypes}`);
                }

                scoredUsers.push({
                    userId: otherUserId,
                    score: Math.min(score, 100),
                    reasons: [...new Set(reasons)].slice(0, 3),
                    assets,
                    complementaryTo: uniqueComplementaryTypes,
                });
            }
        }

        // 6. Sort by score, take top 10
        scoredUsers.sort((a, b) => b.score - a.score);
        const topUsers = scoredUsers.slice(0, 10);

        // 7. Fetch profile + ZoG data for matched users
        const matchedUserIds = topUsers.map(u => u.userId);
        
        if (matchedUserIds.length === 0) {
            return new Response(
                JSON.stringify({ matches: [], message: "No complementary matches found yet." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const { data: profiles } = await supabase
            .from("game_profiles")
            .select("user_id, first_name, last_name, last_zog_snapshot_id")
            .in("user_id", matchedUserIds);

        // Get ZoG snapshots for archetypes
        const snapshotIds = (profiles || [])
            .map(p => p.last_zog_snapshot_id)
            .filter(Boolean) as string[];

        let snapshotMap = new Map<string, { name: string; tagline: string | null }>();
        if (snapshotIds.length > 0) {
            const { data: snapshots } = await supabase
                .from("zog_snapshots")
                .select("id, appleseed_data")
                .in("id", snapshotIds);

            for (const snap of (snapshots || [])) {
                if (snap.appleseed_data) {
                    const data = snap.appleseed_data as any;
                    snapshotMap.set(snap.id, {
                        name: data.vibrationalKey?.name || "Unknown",
                        tagline: data.vibrationalKey?.tagline || null,
                    });
                }
            }
        }

        const profileMap = new Map<string, { firstName: string; lastName: string; archetype: string | null; tagline: string | null }>();
        for (const p of (profiles || [])) {
            const zogData = p.last_zog_snapshot_id ? snapshotMap.get(p.last_zog_snapshot_id) : null;
            profileMap.set(p.user_id, {
                firstName: p.first_name || "",
                lastName: p.last_name || "",
                archetype: zogData?.name || null,
                tagline: zogData?.tagline || null,
            });
        }

        // 8. Build final matches
        const matches: AssetMatch[] = topUsers.map(scored => {
            const profile = profileMap.get(scored.userId);
            return {
                userId: scored.userId,
                firstName: profile?.firstName || "Community Member",
                lastName: profile?.lastName || "",
                archetype: profile?.archetype || null,
                tagline: profile?.tagline || null,
                matchScore: scored.score,
                matchReasons: scored.reasons,
                theirAssets: scored.assets.map(a => ({ typeId: a.type_id, title: a.title })),
                yourComplementaryTypes: scored.complementaryTo,
            };
        });

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
