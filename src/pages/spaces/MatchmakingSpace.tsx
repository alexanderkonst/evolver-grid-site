import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Loader2 } from "lucide-react";
import GameShell from "@/components/game/GameShell";
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

type FilterMode = "all" | "mission" | "local" | "cofounders";

interface MatchCandidate {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    archetype: string;
    tagline?: string | null;
    matchReason: string;
    complementary: boolean;
}

const MatchmakingSpace = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [matches, setMatches] = useState<MatchCandidate[]>([]);
    const [filterMode, setFilterMode] = useState<FilterMode>("all");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [connectMessage, setConnectMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<MatchCandidate | null>(null);

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
                .select("user_id, first_name, last_name, avatar_url, last_zog_snapshot_id")
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
                .filter((row) => row.user_id && !connectedIds.has(row.user_id))
                .map((row) => {
                    const snapshot = row.last_zog_snapshot_id
                        ? snapshotMap.get(row.last_zog_snapshot_id)
                        : null;
                    const archetype = snapshot?.vibrationalKey?.name || "Unknown archetype";
                    const tagline = snapshot?.vibrationalKey?.tagline || null;
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
        if (filterMode === "cofounders") {
            return matches.filter((match) => match.complementary);
        }
        return matches;
    }, [matches, filterMode]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [filterMode]);

    const currentMatch = filteredMatches[currentIndex];

    const handlePass = () => {
        setCurrentIndex((prev) => Math.min(prev + 1, filteredMatches.length));
    };

    const handleConnect = () => {
        if (!currentMatch) return;
        setSelectedMatch(currentMatch);
        setConnectMessage("");
        setConnectModalOpen(true);
    };

    const handleSendRequest = async () => {
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
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Could not send request.",
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <GameShell>
            <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-6 h-6 text-slate-700" />
                        <h1 className="text-2xl font-bold text-slate-900">Matchmaking Space</h1>
                    </div>
                    <p className="text-slate-600">Find your people. Connect with complementary geniuses.</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">No matches yet</h2>
                        <p className="text-slate-500 max-w-md mx-auto">
                            {filterMode === "cofounders"
                                ? "No complementary matches right now. Try a different filter."
                                : "We will surface new matches as your community grows."}
                        </p>
                    </div>
                )}

                {!loading && !error && currentMatch && (
                    <MatchCard
                        user={currentMatch}
                        matchReason={currentMatch.matchReason}
                        onPass={handlePass}
                        onConnect={handleConnect}
                    />
                )}
            </div>

            <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
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
            </Dialog>
        </GameShell>
    );
};

export default MatchmakingSpace;
