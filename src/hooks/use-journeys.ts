import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUpgradesByBranch, getPlayerUpgrades, type Upgrade } from "@/lib/upgradeSystem";

export interface JourneyNode {
    id: string;
    code: string;
    title: string;
    description: string;
    xpReward: number;
    status: "locked" | "available" | "in_progress" | "completed";
    position: { x: number; y: number };
    sortOrder: number;
}

export interface PathData {
    id: string;
    name: string;
    branch: string;
    nodes: JourneyNode[];
    totalNodes: number;
    completedNodes: number;
}

/**
 * Hook to fetch journey nodes for a path from the upgrade_catalog
 */
export function usePathJourneys(pathSlug: string, branch: string) {
    const [nodes, setNodes] = useState<JourneyNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [completedCodes, setCompletedCodes] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadJourneys();
    }, [pathSlug, branch]);

    const loadJourneys = async () => {
        setLoading(true);
        try {
            // Get upgrades from catalog
            const upgrades = await getUpgradesByBranch(pathSlug, branch);

            // Get user's profile and completed upgrades
            const { data: { user } } = await supabase.auth.getUser();
            let completed = new Set<string>();

            if (user) {
                const { data: profile } = await supabase
                    .from("game_profiles")
                    .select("id")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (profile) {
                    const playerUpgrades = await getPlayerUpgrades(profile.id);
                    completed = new Set(playerUpgrades.map(pu => pu.code));
                }
            }
            setCompletedCodes(completed);

            // Convert upgrades to journey nodes with calculated positions
            const journeyNodes: JourneyNode[] = upgrades.map((upgrade, index) => {
                const total = upgrades.length;
                // Position nodes in a vertical tree pattern
                const y = 85 - (index * (70 / Math.max(total - 1, 1)));
                const x = 50 + (index % 2 === 0 ? 0 : (index % 4 === 1 ? 15 : -15));

                // Determine status
                let status: JourneyNode["status"] = "locked";
                if (completed.has(upgrade.code)) {
                    status = "completed";
                } else if (index === 0 || upgrades.slice(0, index).some(u => completed.has(u.code))) {
                    // Available if first node or any previous node is completed
                    status = "available";
                }

                return {
                    id: upgrade.id,
                    code: upgrade.code,
                    title: upgrade.title,
                    description: upgrade.description,
                    xpReward: upgrade.xp_reward,
                    status,
                    position: { x, y },
                    sortOrder: upgrade.sort_order,
                };
            });

            setNodes(journeyNodes);
        } catch (error) {
            console.error("Error loading journeys:", error);
        } finally {
            setLoading(false);
        }
    };

    return { nodes, loading, completedCodes, refetch: loadJourneys };
}

/**
 * Hook to get all paths with their progress
 */
export function useAllPathsProgress() {
    const [progress, setProgress] = useState<Record<string, { completed: number; total: number }>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: profile } = await supabase
                .from("game_profiles")
                .select("id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (!profile) {
                setLoading(false);
                return;
            }

            // Get all path progress based on completed upgrades
            const playerUpgrades = await getPlayerUpgrades(profile.id);
            const completedCodes = new Set(playerUpgrades.map(pu => pu.code));

            // For now, we're loading uniqueness_work path - can expand later
            const masteryUpgrades = await getUpgradesByBranch("uniqueness_work", "mastery_of_genius");
            const entrepreneurialUpgrades = await getUpgradesByBranch("uniqueness_work", "entrepreneurial_path");

            const allUpgrades = [...masteryUpgrades, ...entrepreneurialUpgrades];
            const completedCount = allUpgrades.filter(u => completedCodes.has(u.code)).length;

            setProgress({
                "showing-up": { completed: completedCount, total: allUpgrades.length },
                // Other paths would be added here when they have upgrades
                "waking-up": { completed: 0, total: 7 },
                "growing-up": { completed: 0, total: 5 },
                "cleaning-up": { completed: 0, total: 6 },
                "grounding": { completed: 0, total: 7 },
            });
        } catch (error) {
            console.error("Error loading path progress:", error);
        } finally {
            setLoading(false);
        }
    };

    return { progress, loading, refetch: loadProgress };
}
