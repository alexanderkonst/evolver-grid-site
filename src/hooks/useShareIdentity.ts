import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Who the signed-in player is on their share card: name, photo, link name.
 * Design: docs/02-strategy/game_of_being_you.md §14.12a.
 *
 * Read-only, own row only. A guest, a missing profile or a failed read all mean «no identity»:
 * the card is simply not offered (the guest keeps the homepage QR on the Top Talent reveal).
 */

export type ShareIdentity = {
    name: string;
    avatarUrl: string | null;
    username: string | null;
};

export function useShareIdentity() {
    const [identity, setIdentity] = useState<ShareIdentity | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (!user) return;
                const { data } = await supabase
                    .from("game_profiles")
                    .select("first_name, last_name, avatar_url, username")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: true })
                    .limit(1)
                    .maybeSingle();
                if (!alive || !data) return;
                setIdentity({
                    name: [data.first_name, data.last_name].filter(Boolean).join(" ").trim(),
                    avatarUrl: data.avatar_url ?? null,
                    username: data.username ?? null,
                });
            } catch {
                // no identity: no card
            } finally {
                if (alive) setIsLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    return { identity, isLoading };
}
