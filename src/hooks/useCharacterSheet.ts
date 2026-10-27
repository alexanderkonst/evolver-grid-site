import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useJourneyCompletion } from "@/hooks/useJourneyCompletion";
import {
    JOURNEY_ITEM_COMPLETED_EVENT,
    JOURNEY_LAST_SEEN_KEY,
    JOURNEY_SEQUENCE,
    type JourneyItemId,
} from "@/data/journeySequence";
import { computeQolLevel, type QolLevel } from "@/lib/qolLevel";

/**
 * useCharacterSheet — read-only data layer for the Character Sheet
 * (/game/me/overview). The sheet is the save file made visible
 * (docs/02-strategy/game_of_being_you.md §13): every module already writes its
 * data, this hook only reads it. No new tables, no writes.
 *
 * Presentation-free on purpose: the layout consumes this and decides how to
 * show it.
 *
 * PRIVACY: `qol` is private to the player (§13.2). Do not pass it to any public
 * profile, matchmaking or marketplace surface.
 */

export type CharacterSheetAsset = { id: string; title: string };

export type CharacterSheetSlot = {
    id: JourneyItemId;
    label: string;
    path: string;
    done: boolean;
    /** Shown for quiet slots that cannot be started yet. */
    lockedHint?: string;
    /** True once, right after this slot flips to done. Drives the one-time glow. */
    justCompleted: boolean;
};

export type CharacterSheetData = {
    userId: string | null;
    profileId: string | null;
    firstName: string | null;
    avatarUrl: string | null;
    /** Hex colors of the soul crystal; null until generated. */
    soulColors: string[] | null;
    /** Archetype from the latest zog_snapshot; null = not discovered yet. */
    topTalent: string | null;
    missionTitle: string | null;
    /** Weakest-domain level + 8 domain scores; null = no QoL snapshot yet. */
    qol: QolLevel | null;
    assets: { count: number; top: CharacterSheetAsset[] };
};

const EMPTY: CharacterSheetData = {
    userId: null,
    profileId: null,
    firstName: null,
    avatarUrl: null,
    soulColors: null,
    topTalent: null,
    missionTitle: null,
    qol: null,
    assets: { count: 0, top: [] },
};

const TOP_ASSETS = 3;

const readLastSeen = (): Partial<Record<JourneyItemId, boolean>> | null => {
    try {
        const raw = window.localStorage.getItem(JOURNEY_LAST_SEEN_KEY);
        return raw ? (JSON.parse(raw) as Partial<Record<JourneyItemId, boolean>>) : null;
    } catch {
        return null;
    }
};

const writeLastSeen = (state: Record<string, boolean>) => {
    try {
        window.localStorage.setItem(JOURNEY_LAST_SEEN_KEY, JSON.stringify(state));
    } catch {
        // Private mode / quota: the glow is cosmetic, ignore.
    }
};

async function loadSheet(): Promise<CharacterSheetData> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return EMPTY;

    // Read-only lookup; the sheet never creates a profile.
    const { data: profile } = await supabase
        .from("game_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    const profileId = profile?.id ?? null;
    // soul_colors is not in the generated types (CharacterHub casts the same way).
    const row = (profile ?? {}) as { first_name?: string | null; avatar_url?: string | null; soul_colors?: string[] | null };

    const [zog, qol, assets, mission] = await Promise.all([
        profileId
            ? supabase
                  .from("zog_snapshots")
                  .select("archetype_title")
                  .eq("profile_id", profileId)
                  .order("created_at", { ascending: false })
                  .limit(1)
                  .maybeSingle()
            : null,
        profileId
            ? supabase
                  .from("qol_snapshots")
                  .select("*")
                  .eq("profile_id", profileId)
                  .order("created_at", { ascending: false })
                  .limit(1)
                  .maybeSingle()
            : null,
        supabase
            .from("user_assets")
            .select("id, title", { count: "exact" })
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(TOP_ASSETS),
        supabase
            .from("mission_participants")
            .select("mission_title")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
    ]);

    return {
        userId: user.id,
        profileId,
        firstName: row.first_name ?? null,
        avatarUrl: row.avatar_url ?? null,
        soulColors: row.soul_colors && row.soul_colors.length > 0 ? row.soul_colors : null,
        topTalent: zog?.data?.archetype_title ?? null,
        missionTitle: mission.data?.mission_title ?? null,
        qol: computeQolLevel(qol?.data),
        assets: {
            count: assets.count ?? assets.data?.length ?? 0,
            top: (assets.data ?? []).map((a) => ({ id: a.id, title: a.title })),
        },
    };
}

export function useCharacterSheet() {
    const [data, setData] = useState<CharacterSheetData>(EMPTY);
    const [isLoading, setIsLoading] = useState(true);
    const [justCompleted, setJustCompleted] = useState<Set<JourneyItemId>>(new Set());
    const { completion, isLoading: chainLoading, recheck } = useJourneyCompletion();
    // Completion state we have already shown; seeded from the cross-visit cache.
    const seen = useRef<Partial<Record<JourneyItemId, boolean>> | null>(null);

    const refresh = useCallback(async () => {
        try {
            setData(await loadSheet());
        } catch {
            // Silent fail, as ProfileOverview always did: an empty sheet is a valid sheet.
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // The seam: a completed item re-evaluates the chain and re-reads the save.
    useEffect(() => {
        const onCompleted = () => {
            recheck();
            refresh();
        };
        window.addEventListener(JOURNEY_ITEM_COMPLETED_EVENT, onCompleted);
        return () => window.removeEventListener(JOURNEY_ITEM_COMPLETED_EVENT, onCompleted);
    }, [recheck, refresh]);

    // Diff against what the player last saw: false→true lights once. With no
    // cache (first ever visit) nothing glows; the chain just appears as it is.
    useEffect(() => {
        if (chainLoading) return;
        const previous = seen.current ?? readLastSeen();
        if (previous) {
            const fresh = JOURNEY_SEQUENCE.filter((i) => completion[i.id] && previous[i.id] === false).map((i) => i.id);
            if (fresh.length > 0) setJustCompleted((s) => new Set([...s, ...fresh]));
        }
        seen.current = { ...completion };
        writeLastSeen(completion);
    }, [completion, chainLoading]);

    const chain: CharacterSheetSlot[] = JOURNEY_SEQUENCE.map((item) => ({
        id: item.id,
        label: item.label,
        path: item.path,
        done: completion[item.id],
        lockedHint: item.lockedHint,
        justCompleted: justCompleted.has(item.id),
    }));

    return { ...data, chain, isLoading: isLoading || chainLoading, refresh };
}
