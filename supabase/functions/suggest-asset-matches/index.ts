import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Asset Matchmaking
 * 
 * Logic: Given user A's assets, find other users whose assets are complementary.
 * We use common "needs" patterns to determine complementarity:
 * - Someone with "Capital" needs "Projects" or "Expertise"
 * - Someone with "Network" can help those with "Product/Service"
 * - Someone with "Expertise" pairs well with "Platform" or "Community"
 */

const ASSET_COMPLEMENTARITY: Record<string, string[]> = {
    // Type: Types that would benefit from this
    "capital": ["expertise", "project", "platform", "community", "brand"],
    "expertise": ["capital", "platform", "community", "network"],
    "network": ["product-service", "project", "brand", "community"],
    "platform": ["content", "community", "expertise", "capital"],
    "community": ["content", "product-service", "platform", "capital"],
    "brand": ["network", "platform", "community", "capital"],
    "product-service": ["network", "community", "capital", "brand"],
    "project": ["capital", "expertise", "network", "community"],
    "content": ["platform", "community", "network", "brand"],
};

interface UserAsset {
    typeId: string;
    title: string;
    description?: string;
}

interface AssetMatch {
    userId: string;
    firstName: string;
    lastName?: string;
    avatarUrl?: string;
    matchReason: string;
    theirAssets: UserAsset[];
    complementaryTo: string[];
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { userAssets, userId } = await req.json() as {
            userAssets: UserAsset[];
            userId: string;
        };

        if (!userAssets || userAssets.length === 0 || !userId) {
            return new Response(
                JSON.stringify({ error: "Missing userAssets or userId" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get user's asset types
        const userAssetTypes = userAssets.map(a => a.typeId.toLowerCase());

        // Determine what they could benefit from
        const needsTypes = new Set<string>();
        userAssetTypes.forEach(type => {
            const complements = ASSET_COMPLEMENTARITY[type] || [];
            complements.forEach(c => needsTypes.add(c));
        });

        console.log("User has:", userAssetTypes);
        console.log("Could benefit from:", Array.from(needsTypes));

        // Get all other users' profiles with their asset data
        // For now, since assets are in localStorage, we'll use a simplified approach
        // This will work when assets are migrated to database
        const { data: profiles, error } = await supabase
            .from('game_profiles')
            .select('id, user_id, first_name, last_name, avatar_url')
            .neq('user_id', userId)
            .limit(50);

        if (error) {
            console.error("Failed to fetch profiles:", error);
            throw error;
        }

        // For now, return a message about the feature being in development
        // Real matching will happen when assets are stored in database
        const matches: AssetMatch[] = [];

        // When assets are in DB, the logic would be:
        // 1. For each profile, get their assets
        // 2. Check if any of their asset types are in our needsTypes
        // 3. Score and rank matches

        return new Response(
            JSON.stringify({
                matches,
                message: "Asset matchmaking will be fully operational when assets are stored in database. Currently assets are in localStorage.",
                debug: {
                    userAssetTypes,
                    lookingFor: Array.from(needsTypes)
                }
            }),
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
