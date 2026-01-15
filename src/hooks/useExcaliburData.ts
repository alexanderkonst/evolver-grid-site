import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";

export interface ExcaliburData {
    businessIdentity?: {
        name: string;
        tagline: string;
    };
    essenceAnchor?: {
        geniusAppleSeed: string;
        primeDriver: string;
        archetype: string;
    };
    offer?: {
        statement: string;
        form: string;
        deliverable: string;
    };
    idealClient?: {
        profile: string;
        problem: string;
        ahaRealization: string;
    };
    transformationalPromise?: {
        fromState: string;
        toState: string;
        journey: string;
    };
    channels?: {
        primary: string;
        secondary: string;
        content: string;
    };
    biggerArc?: {
        mission: string;
        movement: string;
        legacy: string;
    };
}

/**
 * Hook to load Excalibur data from zog_snapshots
 * Properly handles the two-step lookup: profile -> snapshot
 */
export function useExcaliburData() {
    const [loading, setLoading] = useState(true);
    const [excaliburData, setExcaliburData] = useState<ExcaliburData | null>(null);
    const [profileId, setProfileId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const resolvedProfileId = await getOrCreateGameProfileId();
                if (!resolvedProfileId) {
                    setError("No profile found");
                    setLoading(false);
                    return;
                }
                setProfileId(resolvedProfileId);

                // Get the profile to find the zog snapshot ID
                const { data: profileData } = await supabase
                    .from("game_profiles")
                    .select("last_zog_snapshot_id")
                    .eq("id", resolvedProfileId)
                    .single();

                if (!profileData?.last_zog_snapshot_id) {
                    setLoading(false);
                    return;
                }

                // Load excalibur_data from zog_snapshots
                const { data: snapshotData } = await supabase
                    .from("zog_snapshots")
                    .select("excalibur_data")
                    .eq("id", profileData.last_zog_snapshot_id)
                    .single();

                if (snapshotData?.excalibur_data) {
                    setExcaliburData(snapshotData.excalibur_data as unknown as ExcaliburData);
                }
            } catch (err) {
                console.error("Error loading Excalibur data:", err);
                setError(err instanceof Error ? err.message : "Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return { loading, excaliburData, profileId, error };
}
