import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { getQolLevel, type QolLevel } from "@/lib/characterSheet";

/**
 * useCharacterSheet — reads the player's save file (the profile corpus) for
 * the Character Sheet at `/game/me/overview`.
 *
 * Read-only: no new tables, no writes. Every module already writes its data;
 * this hook only gathers what they wrote (game_profiles, zog_snapshots,
 * qol_snapshots, user_assets, mission_participants).
 *
 * PRIVATE: `qol` is the player's own level. It is returned to the sheet and
 * nowhere else; never feed it to matchmaking, marketplace or public profiles.
 */

export type SheetAsset = { id: string; title: string };

export type CharacterSheetData = {
    userId: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    avatarUrl: string | null;
    soulColors: string[] | null;
    archetypeTitle: string | null;
    missionTitle: string | null;
    qol: QolLevel | null;
    assetCount: number;
    topAssets: SheetAsset[];
};

const EMPTY: CharacterSheetData = {
    userId: null,
    firstName: null,
    lastName: null,
    email: null,
    avatarUrl: null,
    soulColors: null,
    archetypeTitle: null,
    missionTitle: null,
    qol: null,
    assetCount: 0,
    topAssets: [],
};

const TOP_ASSETS = 3;

export function useCharacterSheet() {
    const [data, setData] = useState<CharacterSheetData>(EMPTY);
    const [isLoading, setIsLoading] = useState(true);
    const [nonce, setNonce] = useState(0);

    const reload = useCallback(() => setNonce((n) => n + 1), []);
    const setAvatarUrl = useCallback(
        (avatarUrl: string) => setData((prev) => ({ ...prev, avatarUrl })),
        [],
    );

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [{ data: userRes }, profileId] = await Promise.all([
                    supabase.auth.getUser(),
                    getOrCreateGameProfileId(),
                ]);
                const user = userRes.user;

                const [profileRes, zogRes, qolRes, assetsRes, missionRes] = await Promise.all([
                    supabase.from("game_profiles").select("*").eq("id", profileId).maybeSingle(),
                    supabase
                        .from("zog_snapshots")
                        .select("archetype_title")
                        .eq("profile_id", profileId)
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .maybeSingle(),
                    supabase
                        .from("qol_snapshots")
                        .select("*")
                        .eq("profile_id", profileId)
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .maybeSingle(),
                    user
                        ? supabase
                              .from("user_assets")
                              .select("id, title", { count: "exact" })
                              .eq("user_id", user.id)
                              .order("created_at", { ascending: false })
                              .limit(TOP_ASSETS)
                        : Promise.resolve({ data: null, count: 0 }),
                    user
                        ? supabase
                              .from("mission_participants")
                              .select("mission_title")
                              .eq("user_id", user.id)
                              .order("created_at", { ascending: false })
                              .limit(1)
                              .maybeSingle()
                        : Promise.resolve({ data: null }),
                ]);

                if (cancelled) return;

                // soul_colors isn't in the generated types; CharacterHub reads it the same way.
                const profile = profileRes.data as
                    | (NonNullable<typeof profileRes.data> & { soul_colors?: string[] | null })
                    | null;
                const colors = profile?.soul_colors;

                setData({
                    userId: user?.id ?? null,
                    firstName: profile?.first_name ?? null,
                    lastName: profile?.last_name ?? null,
                    email: user?.email ?? null,
                    avatarUrl: profile?.avatar_url ?? null,
                    soulColors: Array.isArray(colors) && colors.length > 0 ? colors : null,
                    archetypeTitle: zogRes.data?.archetype_title ?? null,
                    missionTitle: missionRes.data?.mission_title ?? null,
                    qol: getQolLevel(qolRes.data as Record<string, unknown> | null),
                    assetCount: assetsRes.count ?? 0,
                    topAssets: (assetsRes.data ?? []).map((a) => ({ id: a.id, title: a.title })),
                });
            } catch {
                // A sheet that can't load degrades to empty slots, never an error screen.
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [nonce]);

    return { data, isLoading, reload, setAvatarUrl };
}
