import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";

/**
 * ExcaliburData interface - MUST match excaliburGenerator.ts exactly
 * See: src/modules/zone-of-genius/excaliburGenerator.ts lines 208-245
 */
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
        aha: string;  // NOTE: was incorrectly 'ahaRealization'
    };
    transformationalPromise?: {
        fromState: string;
        toState: string;
        journey: string;
    };
    channels?: {
        primary: string;
        secondary: string;
        hook: string;  // NOTE: was incorrectly 'content'
    };
    biggerArc?: {
        vision: string;    // NOTE: was incorrectly 'mission'
        moonshot: string;  // NOTE: was incorrectly 'legacy'
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
                const { data: profileData, error: profileError } = await supabase
                    .from("game_profiles")
                    .select("last_zog_snapshot_id")
                    .eq("id", resolvedProfileId)
                    .single();

                if (profileError) {
                    console.error("[useExcaliburData] Profile fetch error:", profileError);
                }

                if (!profileData?.last_zog_snapshot_id) {
                    console.log("[useExcaliburData] No last_zog_snapshot_id found");
                    setLoading(false);
                    return;
                }

                console.log("[useExcaliburData] Fetching snapshot:", profileData.last_zog_snapshot_id);

                // Load excalibur_data from zog_snapshots
                const { data: snapshotData, error: snapshotError } = await supabase
                    .from("zog_snapshots")
                    .select("excalibur_data")
                    .eq("id", profileData.last_zog_snapshot_id)
                    .single();

                if (snapshotError) {
                    console.error("[useExcaliburData] Snapshot fetch error:", snapshotError);
                }

                console.log("[useExcaliburData] Snapshot data:", snapshotData);

                if (snapshotData?.excalibur_data) {
                    setExcaliburData(snapshotData.excalibur_data as unknown as ExcaliburData);
                } else {
                    console.log("[useExcaliburData] No excalibur_data in snapshot");
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
