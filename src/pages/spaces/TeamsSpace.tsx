import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Loader2 } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import MatchCard from "@/components/matchmaking/MatchCard";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { areComplementary, getComplementarityLabel } from "@/lib/archetypeMatching";
import ErrorBoundary from "@/components/ErrorBoundary";

type FilterMode = "all" | "mission" | "local" | "cofounders";
type MatchMode = "genius" | "assets";
type AssetGroup = "audience" | "product" | "skill" | "distribution" | "need" | "resource";

interface StoredAsset {
    typeId?: string;
    subTypeId?: string;
    categoryId?: string;
    title: string;
    description?: string;
}

interface AssetSignal {
    label: string;
    group: AssetGroup;
}

interface MatchCandidate {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    archetype: string;
    tagline?: string | null;
    matchReason: string;
    assetMatchReason?: string | null;
    assetMatchScore?: number | null;
    complementary: boolean;
}

const cleanLabel = (value: string) => value.replace(/\s+/g, " ").trim();

const clampLabel = (value: string, maxLength = 72) => {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
};

const classifyAssetSignal = (asset: StoredAsset): AssetSignal => {
    const title = (asset.title || "").toLowerCase();

    if (asset.typeId === "networks" || title.includes("community") || title.includes("audience")) {
        return { label: asset.title, group: "audience" };
    }
    if (asset.typeId === "influence" || title.includes("newsletter") || title.includes("podcast") || title.includes("channel")) {
        return { label: asset.title, group: "distribution" };
    }
    if (asset.typeId === "ip" || title.includes("course") || title.includes("program") || title.includes("offer")) {
        return { label: asset.title, group: "product" };
    }
    if (asset.typeId === "resources" || title.includes("capital") || title.includes("funding")) {
        return { label: asset.title, group: "resource" };
    }
    if (asset.typeId === "expertise" || title.includes("strategy") || title.includes("coach")) {
        return { label: asset.title, group: "skill" };
    }

    return { label: asset.title, group: "skill" };
};

const buildAssetSignals = (assets: StoredAsset[]) =>
    assets
        .filter((asset) => asset.title)
        .map((asset) => classifyAssetSignal({ ...asset, title: cleanLabel(asset.title) }))
        .filter((signal) => signal.label.length > 0);

const buildCandidateSignals = (appleseed: AppleseedData | null | undefined): AssetSignal[] => {
    if (!appleseed) return [];

    const signals: AssetSignal[] = [];
    const activities = appleseed.professionalActivities || [];
    const monetization = appleseed.monetizationAvenues || [];

    activities.forEach((activity) => {
        if (activity.activity) {
            signals.push({ label: activity.activity, group: "product" });
        }
        if (activity.targetAudience) {
            signals.push({ label: activity.targetAudience, group: "audience" });
        }
    });

    monetization.forEach((avenue) => {
        if (avenue) {
            signals.push({ label: avenue, group: "distribution" });
        }
    });

    if (appleseed.complementaryPartner?.skillsWise) {
        signals.push({ label: appleseed.complementaryPartner.skillsWise, group: "need" });
    }

    if (signals.length === 0) {
        if (appleseed.elevatorPitch) {
            signals.push({ label: appleseed.elevatorPitch, group: "product" });
        } else if (appleseed.vibrationalKey?.tagline) {
            signals.push({ label: appleseed.vibrationalKey.tagline, group: "product" });
        } else if (appleseed.vibrationalKey?.name) {
            signals.push({ label: appleseed.vibrationalKey.name, group: "skill" });
        }
    }

    return signals
        .filter((signal) => signal.label)
        .map((signal) => ({ ...signal, label: clampLabel(cleanLabel(signal.label)) }));
};

const scoreAssetPair = (yourGroup: AssetGroup, theirGroup: AssetGroup) => {
    if (
        (yourGroup === "product" && theirGroup === "audience") ||
        (yourGroup === "audience" && theirGroup === "product")
    ) {
        return 3;
    }
    if (
        (yourGroup === "distribution" && theirGroup === "product") ||
        (yourGroup === "product" && theirGroup === "distribution")
    ) {
        return 2;
    }
    if (yourGroup === "skill" && theirGroup === "need") {
        return 2;
    }
    if (yourGroup === "resource" && theirGroup === "product") {
        return 2;
    }
    return 1;
};

const pickAssetOpportunity = (yourAssets: AssetSignal[], theirAssets: AssetSignal[]) => {
    if (yourAssets.length === 0 || theirAssets.length === 0) return null;

    let best: { your: AssetSignal; their: AssetSignal; score: number } | null = null;
    for (const your of yourAssets) {
        for (const their of theirAssets) {
            const score = scoreAssetPair(your.group, their.group);
            if (!best || score > best.score) {
                best = { your, their, score };
            }
        }
    }

    return best;
};

const TeamsSpace = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [matches, setMatches] = useState<MatchCandidate[]>([]);
    const [filterMode, setFilterMode] = useState<FilterMode>("all");
    const [matchMode, setMatchMode] = useState<MatchMode>("genius");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [connectMessage, setConnectMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<MatchCandidate | null>(null);
    const [currentUserAssets, setCurrentUserAssets] = useState<StoredAsset[]>([]);

    useEffect(() => {
        const loadMatches = async () => {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError("Sign in to view matches.");
                setLoading(false);
                return;
            }

            const assetsKey = `user_assets_${user.id}`;
            const storedAssets = JSON.parse(localStorage.getItem(assetsKey) || "[]");
            setCurrentUserAssets(storedAssets);

            const { data: profile } = await supabase
                .from("game_profiles")
                .select("user_id, last_zog_snapshot_id, first_name")
                .eq("user_id", user.id)
                .maybeSingle();

            const { data: currentMission } = await supabase
                .from("mission_participants")
                .select("mission_id, mission_title, share_consent")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!currentMission?.mission_id) {
                setMatches([]);
                setLoading(false);
                return;
            }

            const { data: participants } = await supabase
                .from("mission_participants")
                .select("user_id, mission_id, mission_title, share_consent")
                .eq("mission_id", currentMission.mission_id)
                .eq("share_consent", true)
                .neq("user_id", user.id);

            const participantIds = (participants || []).map((row) => row.user_id).filter(Boolean) as string[];
            if (participantIds.length === 0) {
                setMatches([]);
                setLoading(false);
                return;
            }

            const { data: profileRows } = await supabase
                .from("game_profiles")
                .select("user_id, first_name, last_name, avatar_url, last_zog_snapshot_id, visibility")
                .in("user_id", participantIds);

            const snapshotIds = (profileRows || [])
                .map((row) => row.last_zog_snapshot_id)
                .filter(Boolean) as string[];

            const { data: snapshots } = await supabase
                .from("zog_snapshots")
                .select("id, appleseed_data")
                .in("id", snapshotIds);

            const snapshotMap = new Map<string, AppleseedData>();
            (snapshots || []).forEach((snapshot) => {
                if (snapshot.appleseed_data) {
                    snapshotMap.set(snapshot.id, snapshot.appleseed_data as unknown as AppleseedData);
                }
            });

            const { data: connections } = await supabase
                .from("connections")
                .select("requester_id, receiver_id")
                .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

            const connectedIds = new Set<string>();
            connections?.forEach((row) => {
                if (row.requester_id && row.requester_id !== user.id) {
                    connectedIds.add(row.requester_id);
                }
                if (row.receiver_id && row.receiver_id !== user.id) {
                    connectedIds.add(row.receiver_id);
                }
            });

            let currentUserArchetype = "";
            const userAssetSignals = buildAssetSignals(storedAssets);
            if (profile?.last_zog_snapshot_id) {
                const { data: currentSnapshot } = await supabase
                    .from("zog_snapshots")
                    .select("appleseed_data")
                    .eq("id", profile.last_zog_snapshot_id)
                    .maybeSingle();
                if (currentSnapshot?.appleseed_data) {
                    const appleseed = currentSnapshot.appleseed_data as unknown as AppleseedData;
                    currentUserArchetype = appleseed.vibrationalKey?.name || "";
                }
            }

            const nextMatches: MatchCandidate[] = (profileRows || [])
                .filter((row) => row.user_id && row.last_zog_snapshot_id)
                .filter((row) => row.visibility !== "hidden")
                .filter((row) => row.user_id && !connectedIds.has(row.user_id))
                .map((row) => {
                    const snapshot = row.last_zog_snapshot_id
                        ? snapshotMap.get(row.last_zog_snapshot_id)
                        : null;
                    const archetype = snapshot?.vibrationalKey?.name || "Unknown archetype";
                    const tagline = snapshot?.vibrationalKey?.tagline || null;
                    const candidateSignals = buildCandidateSignals(snapshot);
                    const assetPair = pickAssetOpportunity(userAssetSignals, candidateSignals);
                    const assetMatchReason = assetPair
                        ? `Your ${assetPair.your.label} + Their ${assetPair.their.label} = opportunity.`
                        : null;
                    const complementary = currentUserArchetype
                        ? areComplementary(currentUserArchetype, archetype)
                        : false;
                    const complementaryLabel = currentUserArchetype
                        ? getComplementarityLabel(currentUserArchetype, archetype)
                        : null;
                    const missionLabel = currentMission.mission_title
                        ? `Same mission: ${currentMission.mission_title}`
                        : "Same mission";
                    const reason = complementaryLabel
                        ? `${missionLabel}. ${complementaryLabel}.`
                        : `${missionLabel}.`;

                    return {
                        id: row.user_id!,
                        firstName: row.first_name || "Community",
                        lastName: row.last_name || "Member",
                        avatarUrl: row.avatar_url || null,
                        archetype,
                        tagline,
                        matchReason: reason,
                        assetMatchReason,
                        assetMatchScore: assetPair?.score ?? null,
                        complementary,
                    };
                });

            setMatches(nextMatches);
            setCurrentIndex(0);
            setLoading(false);
        };

        loadMatches();
    }, []);

    const filteredMatches = useMemo(() => {
        const baseMatches = (() => {
            if (filterMode === "cofounders") {
                return matches.filter((match) => match.complementary);
            }
            return matches;
        })();

        if (matchMode === "assets") {
            return [...baseMatches].sort(
                (a, b) => (b.assetMatchScore ?? 0) - (a.assetMatchScore ?? 0)
            );
        }

        return baseMatches;
    }, [matches, filterMode, matchMode]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [filterMode, matchMode]);

    const currentMatch = filteredMatches[currentIndex];
    const primaryReason = currentMatch
        ? matchMode === "assets"
            ? currentMatch.assetMatchReason || currentMatch.matchReason
            : currentMatch.matchReason
        : "";
    const secondaryReason = currentMatch
        ? matchMode === "assets"
            ? currentMatch.matchReason
            : currentMatch.assetMatchReason || null
        : null;
    const primaryLabel = matchMode === "assets" ? "Asset opportunity" : "Genius alignment";
    const secondaryLabel = matchMode === "assets" ? "Genius alignment" : "Asset opportunity";

    const handlePass = useCallback(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, filteredMatches.length));
    }, [filteredMatches.length]);

    const handleConnect = useCallback(() => {
        if (!currentMatch) return;
        setSelectedMatch(currentMatch);
        setConnectMessage("");
        setConnectModalOpen(true);
    }, [currentMatch]);

    const handleSendRequest = useCallback(async () => {
        if (!selectedMatch) return;
        setSending(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error: insertError } = await supabase
                .from("connections")
                .insert({
                    requester_id: user.id,
                    receiver_id: selectedMatch.id,
                    message: connectMessage || null,
                });

            if (insertError) {
                throw insertError;
            }

            toast({
                title: "Request sent",
                description: `Your connection request was sent to ${selectedMatch.firstName}.`,
            });

            setConnectModalOpen(false);
            setSelectedMatch(null);
            setMatches((prev) => prev.filter((match) => match.id !== selectedMatch.id));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Could not send request.";
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    }, [connectMessage, selectedMatch]);

    return (
        <GameShellV2>
            <ErrorBoundary>
                <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-6 h-6 text-slate-700" />
                            <h1 className="text-2xl font-bold text-slate-900">Teams</h1>
                        </div>
                        <p className="text-slate-600">Find your people. Connect with complementary geniuses.</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center rounded-full bg-slate-100 p-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setMatchMode("genius")}
                                    className={`rounded-full px-3 py-1 font-medium transition ${matchMode === "genius"
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500"
                                        }`}
                                >
                                    Genius Match
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMatchMode("assets")}
                                    className={`rounded-full px-3 py-1 font-medium transition ${matchMode === "assets"
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500"
                                        }`}
                                >
                                    Match by Assets
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="match-filter" className="text-xs text-slate-500">
                                    Filter
                                </label>
                                <select
                                    id="match-filter"
                                    value={filterMode}
                                    onChange={(e) => setFilterMode(e.target.value as FilterMode)}
                                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                                >
                                    <option value="all">All Matches</option>
                                    <option value="mission">Same Mission</option>
                                    <option value="local">Near Me</option>
                                    <option value="cofounders">Co-founders</option>
                                </select>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => navigate("/connections")}>
                            View Connections
                        </Button>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {!loading && !error && !currentMatch && (
                        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                            <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-slate-700 mb-2">No matches yet</h2>
                            <p className="text-slate-500 max-w-md mx-auto">
                                {filterMode === "cofounders"
                                    ? "No complementary matches right now. Try a different filter."
                                    : "We will surface new matches as your community grows."}
                            </p>
                        </div>
                    )}

                    {!loading && !error && matchMode === "assets" && currentUserAssets.length === 0 && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-semibold text-amber-800">Add assets to unlock smarter matches.</p>
                                <p>Map what you can offer so we can pair you by collaboration potential.</p>
                            </div>
                            <Button variant="outline" onClick={() => navigate("/asset-mapping")}>
                                Map Assets
                            </Button>
                        </div>
                    )}

                    {!loading && !error && currentMatch && (
                        <MatchCard
                            user={currentMatch}
                            matchReason={primaryReason}
                            matchLabel={primaryLabel}
                            secondaryReason={secondaryReason || undefined}
                            secondaryLabel={secondaryReason ? secondaryLabel : undefined}
                            onPass={handlePass}
                            onConnect={handleConnect}
                        />
                    )}
                </div>

                <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
                    <ErrorBoundary>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {selectedMatch ? `Connect with ${selectedMatch.firstName}` : "Connect"}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <label htmlFor="connect-message" className="text-sm text-slate-600">
                                    Add a message (optional)
                                </label>
                                <Textarea
                                    id="connect-message"
                                    value={connectMessage}
                                    onChange={(e) => setConnectMessage(e.target.value)}
                                    placeholder="Introduce yourself..."
                                />
                            </div>
                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setConnectModalOpen(false)} disabled={sending}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSendRequest} disabled={sending}>
                                    {sending ? "Sending..." : "Send Request"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </ErrorBoundary>
                </Dialog>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default TeamsSpace;
