import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { Target, Sparkles, Users, TrendingUp, Briefcase, DollarSign, Eye, Palette, MessageSquare, Heart, Zap, Quote } from "lucide-react";

type PerspectiveId =
    | "bullseye"
    | "vibrational-key"
    | "three-lenses"
    | "appreciated-for"
    | "mastery"
    | "activities"
    | "roles"
    | "partner"
    | "monetization"
    | "life-scene"
    | "visual-codes"
    | "elevator-pitch";

interface PerspectiveConfig {
    title: string;
    subtitle: string;
    icon: React.ElementType;
    render: (data: AppleseedData) => React.ReactNode;
}

const PERSPECTIVES: Record<PerspectiveId, PerspectiveConfig> = {
    "bullseye": {
        title: "Bullseye Sentence",
        subtitle: "Your essence in one breath",
        icon: Target,
        render: (data) => (
            <div className="text-center py-8">
                <p className="text-2xl font-['Fraunces',serif] text-[#2c3150] leading-relaxed">
                    I {data.bullseyeSentence}
                </p>
            </div>
        ),
    },
    "vibrational-key": {
        title: "Unique Vibrational Key",
        subtitle: "Your archetypal name and tagline",
        icon: Sparkles,
        render: (data) => (
            <div className="space-y-6 text-center py-8">
                <h2 className="text-3xl font-['Fraunces',serif] font-bold text-[#2c3150]">
                    ✦ {data.vibrationalKey.name} ✦
                </h2>
                <p className="text-lg text-[#2c3150]/80 italic">
                    "{data.vibrationalKey.tagline}"
                </p>
                {data.vibrationalKey.tagline_simple && (
                    <p className="text-[#a4a3d0] text-sm">
                        In simple terms: {data.vibrationalKey.tagline_simple}
                    </p>
                )}
            </div>
        ),
    },
    "three-lenses": {
        title: "Zone of Genius — Three Lenses",
        subtitle: "Actions → Prime Driver → Archetype",
        icon: Zap,
        render: (data) => (
            <div className="space-y-6">
                <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                    <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-2">My Top Actions</p>
                    <p className="text-[#2c3150] font-medium">{data.threeLenses.actions.join(" • ")}</p>
                </div>
                <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                    <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-2">My Prime Driver</p>
                    <p className="text-[#2c3150] font-bold text-xl">{data.threeLenses.primeDriver}</p>
                    {data.threeLenses.primeDriver_meaning && (
                        <p className="text-[#a4a3d0] text-sm mt-1">{data.threeLenses.primeDriver_meaning}</p>
                    )}
                </div>
                <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                    <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-2">My Archetype</p>
                    <p className="text-[#2c3150] font-bold text-xl">{data.threeLenses.archetype}</p>
                    {data.threeLenses.archetype_meaning && (
                        <p className="text-[#a4a3d0] text-sm mt-1">{data.threeLenses.archetype_meaning}</p>
                    )}
                </div>
                <div className="p-4 bg-gradient-to-br from-[#8460ea]/10 to-[#a4a3d0]/10 rounded-xl border border-[#8460ea]/30">
                    <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-2">⚡ One Action to Mastery</p>
                    <p className="text-[#2c3150] font-bold text-lg">
                        Put "{data.threeLenses.primeDriver}" on repeat.
                    </p>
                    <p className="text-[#a4a3d0] text-sm mt-1">
                        This is the single action that, when practiced consistently, leads to full mastery of your genius.
                    </p>
                </div>
            </div>
        ),
    },
    "appreciated-for": {
        title: "What You're Appreciated & Paid For",
        subtitle: "Effect → Scene → Outcome",
        icon: Heart,
        render: (data) => (
            <div className="space-y-4">
                {data.appreciatedFor?.map((item, index) => (
                    <div key={index} className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                        <div className="space-y-2">
                            <div>
                                <span className="text-xs text-[#8460ea] uppercase">Effect: </span>
                                <span className="text-[#2c3150]">{item.effect}</span>
                            </div>
                            <div>
                                <span className="text-xs text-[#8460ea] uppercase">Scene: </span>
                                <span className="text-[#2c3150]">{item.scene}</span>
                            </div>
                            <div>
                                <span className="text-xs text-[#8460ea] uppercase">Outcome: </span>
                                <span className="text-[#2c3150] font-medium">{item.outcome}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
    "mastery": {
        title: "Mastery Stages",
        subtitle: "Your 7 stages of evolution",
        icon: TrendingUp,
        render: (data) => (
            <div className="space-y-3">
                {data.masteryStages?.map((stage, index) => (
                    <div key={stage.stage || index} className="flex gap-4 p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#8460ea]/10 text-[#8460ea] font-bold flex items-center justify-center">
                            {stage.stage || index + 1}
                        </div>
                        <div>
                            <p className="text-[#2c3150] font-medium">{stage.name}</p>
                            <p className="text-[#a4a3d0] text-sm">{stage.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
    "activities": {
        title: "Professional Activities",
        subtitle: "LinkedIn-searchable roles",
        icon: Briefcase,
        render: (data) => (
            <div className="space-y-3">
                {data.professionalActivities?.map((item, index) => (
                    <div key={index} className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                        <p className="text-[#2c3150] font-medium">{item.activity}</p>
                        <p className="text-[#a4a3d0] text-sm">For: {item.targetAudience}</p>
                        <p className="text-[#a4a3d0] text-sm">Purpose: {item.purpose}</p>
                    </div>
                ))}
            </div>
        ),
    },
    "roles": {
        title: "Roles & Environments",
        subtitle: "As Creator, Contributor, Founder + ideal vibe",
        icon: Users,
        render: (data) => (
            <div className="space-y-4">
                <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                    <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-1">As Creator</p>
                    <p className="text-[#2c3150]">{data.rolesEnvironments?.asCreator}</p>
                </div>
                <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                    <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-1">As Contributor</p>
                    <p className="text-[#2c3150]">{data.rolesEnvironments?.asContributor}</p>
                </div>
                <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                    <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-1">As Founder</p>
                    <p className="text-[#2c3150]">{data.rolesEnvironments?.asFounder}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#8460ea]/10 to-[#a4a3d0]/10 rounded-xl border border-[#8460ea]/30">
                    <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-1">Ideal Environment</p>
                    <p className="text-[#2c3150] font-medium">{data.rolesEnvironments?.environment}</p>
                </div>
            </div>
        ),
    },
    "partner": {
        title: "Best Complementary Partner",
        subtitle: "Who to seek for collaboration",
        icon: Users,
        render: (data) => (
            <div className="space-y-4">
                <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                    <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-1">Skills-Wise</p>
                    <p className="text-[#2c3150]">{data.complementaryPartner?.skillsWise}</p>
                </div>
                <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                    <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-1">Genius-Wise</p>
                    <p className="text-[#2c3150]">{data.complementaryPartner?.geniusWise}</p>
                </div>
                <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                    <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-1">Archetype-Wise</p>
                    <p className="text-[#2c3150]">{data.complementaryPartner?.archetypeWise}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#8460ea]/10 to-[#a4a3d0]/10 rounded-xl border border-[#8460ea]/30">
                    <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-1">The Synergy</p>
                    <p className="text-[#2c3150] font-medium">{data.complementaryPartner?.synergy}</p>
                </div>
            </div>
        ),
    },
    "monetization": {
        title: "Monetization Avenues",
        subtitle: "How to monetize your genius",
        icon: DollarSign,
        render: (data) => (
            <div className="flex flex-wrap gap-3">
                {data.monetizationAvenues?.map((avenue, index) => (
                    <span
                        key={index}
                        className="px-4 py-2 bg-[#8460ea]/10 text-[#8460ea] rounded-full font-medium"
                    >
                        {avenue}
                    </span>
                ))}
            </div>
        ),
    },
    "life-scene": {
        title: "Life Scene",
        subtitle: "Sensory embodiment in flow",
        icon: Eye,
        render: (data) => (
            <div className="p-6 bg-gradient-to-br from-[#c8b7d8]/20 via-[#d4d1e8]/20 to-[#e7e9f5]/20 rounded-2xl border border-[#a4a3d0]/20">
                <p className="text-[#2c3150] text-lg leading-relaxed italic">
                    "{data.lifeScene}"
                </p>
            </div>
        ),
    },
    "visual-codes": {
        title: "Visual Codes",
        subtitle: "Symbolic anchors for your genius",
        icon: Palette,
        render: (data) => (
            <div className="grid grid-cols-2 gap-4">
                {data.visualCodes?.map((code, index) => (
                    <div key={index} className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20 text-center">
                        <p className="text-3xl mb-2">{code.symbol}</p>
                        <p className="text-[#2c3150] text-sm">{code.meaning}</p>
                    </div>
                ))}
            </div>
        ),
    },
    "elevator-pitch": {
        title: "Elevator Pitch",
        subtitle: "Your genius in 30 seconds",
        icon: MessageSquare,
        render: (data) => (
            <div className="p-6 bg-gradient-to-br from-[#8460ea]/5 to-[#a4a3d0]/5 rounded-2xl border border-[#8460ea]/20">
                <Quote className="w-8 h-8 text-[#8460ea]/30 mb-4" />
                <p className="text-[#2c3150] text-xl leading-relaxed">
                    {data.elevatorPitch}
                </p>
            </div>
        ),
    },
};

const ZoGPerspectiveView = () => {
    const { perspectiveId } = useParams<{ perspectiveId: PerspectiveId }>();
    const [loading, setLoading] = useState(true);
    const [appleseedData, setAppleseedData] = useState<AppleseedData | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const profileId = await getOrCreateGameProfileId();
                if (!profileId) {
                    setLoading(false);
                    return;
                }

                const { data: profileData } = await supabase
                    .from("game_profiles")
                    .select("last_zog_snapshot_id")
                    .eq("id", profileId)
                    .single();

                if (!profileData?.last_zog_snapshot_id) {
                    setLoading(false);
                    return;
                }

                const { data: snapshotData } = await supabase
                    .from("zog_snapshots")
                    .select("appleseed_data")
                    .eq("id", profileData.last_zog_snapshot_id)
                    .single();

                if (snapshotData?.appleseed_data) {
                    setAppleseedData(snapshotData.appleseed_data as unknown as AppleseedData);
                }
            } catch (err) {
                console.error("Error loading perspective data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const config = perspectiveId ? PERSPECTIVES[perspectiveId] : null;
    const Icon = config?.icon || Sparkles;

    if (loading) {
        return (
            <GameShellV2>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-pulse text-[#a4a3d0]">Loading...</div>
                </div>
            </GameShellV2>
        );
    }

    if (!config || !appleseedData) {
        return (
            <GameShellV2>
                <div className="max-w-2xl mx-auto p-6 text-center">
                    <p className="text-[#a4a3d0]">
                        {!config ? "Unknown perspective" : "No Zone of Genius data found. Complete the assessment first."}
                    </p>
                </div>
            </GameShellV2>
        );
    }

    return (
        <GameShellV2>
            <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
                {/* Header */}
                <div className="text-center py-6 bg-gradient-to-br from-[#c8b7d8] via-[#d4d1e8] to-[#e7e9f5] rounded-2xl">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/50 mb-4">
                        <Icon className="w-6 h-6 text-[#8460ea]" />
                    </div>
                    <h1 className="text-2xl font-['Fraunces',serif] font-bold text-[#2c3150] mb-1">
                        {config.title}
                    </h1>
                    <p className="text-[#8460ea] text-sm">{config.subtitle}</p>
                </div>

                {/* Content */}
                <div className="py-4">
                    {config.render(appleseedData)}
                </div>
            </div>
        </GameShellV2>
    );
};

export default ZoGPerspectiveView;
