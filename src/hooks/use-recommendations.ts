import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upgrade, getPlayerUpgrades } from "@/lib/upgradeSystem";
import { PATH_NAMES, PATH_COLORS, PATH_TO_XP_COLUMN } from "@/lib/domains";

interface RecommendedQuest {
    id: string;
    title: string;
    path: string;
    pathColor: string;
    xp: number;
    duration: string;
}

interface RecommendedUpgrade {
    id: string;
    title: string;
    path: string;
    pathColor: string;
    description: string;
    unlocksCount: number;
}

interface Recommendations {
    quest: RecommendedQuest | null;
    upgrade: RecommendedUpgrade | null;
    loading: boolean;
}

/**
 * Hook to get personalized quest and upgrade recommendations
 * Uses path balance to suggest the least-developed path
 */
export function useRecommendations(profileId: string | null): Recommendations {
    const [recommendations, setRecommendations] = useState<Recommendations>({
        quest: null,
        upgrade: null,
        loading: true,
    });

    useEffect(() => {
        if (!profileId) {
            setRecommendations({ quest: null, upgrade: null, loading: false });
            return;
        }

        const fetchRecommendations = async () => {
            try {
                // Get player's current XP per path
                const { data: profile } = await supabase
                    .from("game_profiles")
                    .select("xp_body, xp_mind, xp_emotions, xp_spirit, xp_uniqueness")
                    .eq("id", profileId)
                    .single();

                // Map XP to paths (using canonical domain slugs)
                const pathXp: Record<string, number> = {
                    "spirit": (profile as any)?.xp_spirit || 0,
                    "mind": (profile as any)?.xp_mind || 0,
                    "emotions": (profile as any)?.xp_emotions || 0,
                    "uniqueness": (profile as any)?.xp_uniqueness || 0,
                    "body": (profile as any)?.xp_body || 0,
                };

                // Find the path with lowest XP (needs most attention)
                const sortedPaths = Object.entries(pathXp).sort((a, b) => a[1] - b[1]);
                const suggestedPath = sortedPaths[0][0]; // lowest XP path

                // Get player's completed upgrades
                const completedUpgrades = await getPlayerUpgrades(profileId);
                const completedIds = new Set(completedUpgrades.map((u) => u.upgradeId));

                // Get all upgrades from the suggested path
                const { data: pathUpgrades } = await supabase
                    .from("upgrade_catalog")
                    .select("*")
                    .eq("path_slug", suggestedPath)
                    .order("sort_order", { ascending: true });

                // Find first uncompleted upgrade (quest-like)
                const availableUpgrades = (pathUpgrades || []).filter(
                    (u: any) => !completedIds.has(u.id)
                );

                // Quest: First available practice (quick, free)
                const questUpgrade = availableUpgrades.find(
                    (u: any) => !u.is_paid && u.xp_reward <= 50
                ) || availableUpgrades[0];

                // Upgrade: First available paid or larger unlock
                const upgradeOption = availableUpgrades.find(
                    (u: any) => u.is_paid || u.xp_reward > 50
                ) || availableUpgrades[1];

                // Build recommendations
                const quest: RecommendedQuest | null = questUpgrade
                    ? {
                        id: questUpgrade.id,
                        title: questUpgrade.title,
                        path: PATH_NAMES[suggestedPath] || suggestedPath,
                        pathColor: PATH_COLORS[suggestedPath] || "#888",
                        xp: questUpgrade.xp_reward,
                        duration: "5 min",
                    }
                    : null;

                const upgrade: RecommendedUpgrade | null = upgradeOption
                    ? {
                        id: upgradeOption.id,
                        title: upgradeOption.title,
                        path: PATH_NAMES[suggestedPath] || suggestedPath,
                        pathColor: PATH_COLORS[suggestedPath] || "#888",
                        description: upgradeOption.short_label || upgradeOption.description,
                        unlocksCount: 3, // Placeholder - could be calculated from dependencies
                    }
                    : null;

                setRecommendations({
                    quest,
                    upgrade,
                    loading: false,
                });
            } catch (error) {
                setRecommendations({ quest: null, upgrade: null, loading: false });
            }
        };

        fetchRecommendations();
    }, [profileId]);

    return recommendations;
}
