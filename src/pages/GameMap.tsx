import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Clock, Zap, Leaf } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import GameDodecahedron from "@/components/GameDodecahedron";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { cn } from "@/lib/utils";

interface ActiveQuest {
    title: string;
    practiceType: string;
    durationMinutes: number;
    pathId: string;
}

const ENERGY_TYPES = [
    { id: "relaxing", label: "Relaxing", icon: Leaf, color: "#4361ee" },
    { id: "balanced", label: "Balanced", icon: Sparkles, color: "#f5a623" },
    { id: "energizing", label: "Energizing", icon: Zap, color: "#ff6b35" },
];

const TIME_OPTIONS = [
    { value: 5, label: "5 min" },
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 60, label: "60+ min" },
];

const GameMap = () => {
    const navigate = useNavigate();
    const [playerName, setPlayerName] = useState<string>("");
    const [playerLevel, setPlayerLevel] = useState<number>(1);
    const [playerXP, setPlayerXP] = useState<number>(0);
    const [activeQuest, setActiveQuest] = useState<ActiveQuest | null>(null);
    const [showQuestFilter, setShowQuestFilter] = useState(false);
    const [selectedTime, setSelectedTime] = useState<number | null>(null);
    const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null);
    const [pathProgress, setPathProgress] = useState<Record<string, number>>({});

    useEffect(() => {
        loadPlayerData();
    }, []);

    const loadPlayerData = async () => {
        const profileId = await getOrCreateGameProfileId();
        const { data: profile } = await supabase
            .from("game_profiles")
            .select("first_name, xp_total, level, xp_body, xp_mind, xp_emotions, xp_spirit, xp_uniqueness, last_quest_title")
            .eq("id", profileId)
            .maybeSingle();

        if (profile) {
            setPlayerName(profile.first_name || "Player");
            setPlayerLevel(profile.level || 1);
            setPlayerXP(profile.xp_total || 0);

            // Calculate path progress (simplified - based on XP ratios)
            const totalPathXP = (profile.xp_body || 0) + (profile.xp_mind || 0) +
                (profile.xp_emotions || 0) + (profile.xp_spirit || 0) +
                (profile.xp_uniqueness || 0);

            if (totalPathXP > 0) {
                setPathProgress({
                    "body": Math.min(100, ((profile.xp_body || 0) / 500) * 100),
                    "mind": Math.min(100, ((profile.xp_mind || 0) / 500) * 100),
                    "emotions": Math.min(100, ((profile.xp_emotions || 0) / 500) * 100),
                    "spirit": Math.min(100, ((profile.xp_spirit || 0) / 500) * 100),
                    "uniqueness": Math.min(100, ((profile.xp_uniqueness || 0) / 500) * 100),
                });
            }

            if (profile.last_quest_title) {
                setActiveQuest({
                    title: profile.last_quest_title,
                    practiceType: "Practice",
                    durationMinutes: 10,
                    pathId: "spirit",
                });
            }
        }
    };

    const handleGetQuest = () => {
        if (!selectedTime || !selectedEnergy) {
            setShowQuestFilter(true);
        } else {
            // TODO: Call quest recommendation with filters
            navigate(`/game?time=${selectedTime}&energy=${selectedEnergy}`);
        }
    };

    const handleFilterSubmit = () => {
        setShowQuestFilter(false);
        if (selectedTime && selectedEnergy) {
            navigate(`/game?time=${selectedTime}&energy=${selectedEnergy}`);
        }
    };

    return (
        <div className="min-h-dvh flex flex-col bg-slate-950">
            <Navigation />

            <main className="flex-grow pt-20 pb-20 px-4">
                <div className="container mx-auto max-w-2xl">
                    {/* Back to home */}
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span className="text-sm">Home</span>
                    </button>

                    {/* Player Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                            Welcome back, <span className="text-amber-400">{playerName}</span>
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Level {playerLevel} · {playerXP.toLocaleString()} XP
                        </p>
                    </div>

                    {/* The Dodecahedron Map */}
                    <div className="mb-8">
                        <GameDodecahedron
                            progress={pathProgress}
                            onPathClick={(pathId) => navigate(`/growth-paths?path=${pathId}`)}
                        />
                    </div>

                    {/* Instruction */}
                    <p className="text-center text-slate-400 text-sm mb-6">
                        Tap a path to explore your journey
                    </p>

                    {/* Active Quest or Get Quest */}
                    {activeQuest ? (
                        <Card className="bg-slate-900/80 border-slate-700">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Your Current Quest</p>
                                        <h3 className="text-white font-medium">{activeQuest.title}</h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {activeQuest.durationMinutes} min · {activeQuest.practiceType}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate("/game")}
                                        >
                                            Continue
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="text-center">
                            <Button
                                onClick={handleGetQuest}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium px-6"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Get a Quest
                            </Button>
                        </div>
                    )}

                    {/* Quest Filter Modal */}
                    {showQuestFilter && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal flex items-end sm:items-center justify-center p-4">
                            <Card className="bg-slate-900 border-slate-700 w-full max-w-md animate-in slide-in-from-bottom-4">
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-semibold text-white mb-4">
                                        <BoldText>FIND YOUR QUEST</BoldText>
                                    </h2>

                                    {/* Time Selection */}
                                    <div className="mb-6">
                                        <p className="text-sm text-slate-400 mb-3">How much time do you have?</p>
                                        <div className="flex flex-wrap gap-2">
                                            {TIME_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setSelectedTime(option.value)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
                                                        selectedTime === option.value
                                                            ? "bg-amber-500/20 border-amber-500 text-amber-400"
                                                            : "border-slate-600 text-slate-400 hover:border-slate-500"
                                                    )}
                                                >
                                                    <Clock className="w-4 h-4" />
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Energy Selection */}
                                    <div className="mb-6">
                                        <p className="text-sm text-slate-400 mb-3">What kind of experience?</p>
                                        <div className="flex flex-wrap gap-2">
                                            {ENERGY_TYPES.map((energy) => {
                                                const Icon = energy.icon;
                                                return (
                                                    <button
                                                        key={energy.id}
                                                        onClick={() => setSelectedEnergy(energy.id)}
                                                        className={cn(
                                                            "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
                                                            selectedEnergy === energy.id
                                                                ? "border-current"
                                                                : "border-slate-600 text-slate-400 hover:border-slate-500"
                                                        )}
                                                        style={{
                                                            color: selectedEnergy === energy.id ? energy.color : undefined,
                                                            backgroundColor: selectedEnergy === energy.id ? `${energy.color}20` : undefined,
                                                            borderColor: selectedEnergy === energy.id ? energy.color : undefined,
                                                        }}
                                                    >
                                                        <Icon className="w-4 h-4" />
                                                        {energy.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setShowQuestFilter(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900"
                                            onClick={handleFilterSubmit}
                                            disabled={!selectedTime || !selectedEnergy}
                                        >
                                            Find Quest
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Other Moves */}
                    <div className="mt-12 pt-8 border-t border-slate-800">
                        <h3 className="text-sm font-medium text-slate-400 mb-4 text-center">
                            Other moves
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/game")}
                                className="border-slate-700 text-slate-300"
                            >
                                Character Home
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/growth-paths")}
                                className="border-slate-700 text-slate-300"
                            >
                                All Growth Paths
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default GameMap;
