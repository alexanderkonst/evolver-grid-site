import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { Target, Sparkles, Users, TrendingUp, Briefcase, DollarSign, Eye, Palette, MessageSquare, Heart, Zap, Quote } from "lucide-react";

// Day 54+ (Sasha 2026-04-28 night): full restyle of the ME · Top Talent
// perspective views. Was a violet/purple palette (#8460ea, #a4a3d0,
// #c8b7d8 → #e7e9f5 gradient) that didn't match the rest of the brand.
// Now in the Aurora editorial register: cream cardSurface + gold
// hairline + amber halo for cards, Cormorant titles, DM Sans tabular
// numerals, gold-uppercase eyebrows, navy text via skin tokens. Same
// pattern used on /admin and /dashboard so the ME space reads as part
// of the same building.

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

// ─── Shared editorial style fragments ─────────────────────────────────

const titleStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    color: "var(--skin-text-primary, #0b2a5a)",
    textShadow:
        "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
};

const bodyStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    color: "var(--skin-text-primary, #0b2a5a)",
    textShadow:
        "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
};

const mutedStyle: React.CSSProperties = {
    fontFamily: "'Source Serif 4', serif",
    fontStyle: "italic",
    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.65))",
};

const eyebrowStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: "10.5px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    fontWeight: 600,
    color: "var(--skin-accent-gold, #b8860b)",
};

const cardSurface: React.CSSProperties = {
    background: "var(--skin-card-bg, rgba(255, 255, 255, 0.65))",
    border: "0.5px solid rgba(212, 175, 55, 0.42)",
    boxShadow:
        "0 0 22px -8px rgba(212, 175, 55, 0.22), 0 16px 40px -20px rgba(10, 22, 40, 0.18)",
};

const accentCardSurface: React.CSSProperties = {
    background:
        "linear-gradient(135deg, rgba(244, 212, 114, 0.10) 0%, rgba(212, 175, 55, 0.06) 100%), var(--skin-card-bg, rgba(255, 255, 255, 0.65))",
    border: "0.5px solid rgba(212, 175, 55, 0.65)",
    boxShadow:
        "0 0 28px -6px rgba(244, 212, 114, 0.32), 0 16px 40px -20px rgba(10, 22, 40, 0.2)",
};

// Reusable labeled-row card used across many perspectives.
const FieldCard = ({
    label,
    children,
    accent = false,
}: {
    label: string;
    children: React.ReactNode;
    accent?: boolean;
}) => (
    <div
        className="rounded-2xl px-5 py-4"
        style={accent ? accentCardSurface : cardSurface}
    >
        <p style={eyebrowStyle} className="mb-1.5">
            {label}
        </p>
        <div style={bodyStyle} className="leading-relaxed">
            {children}
        </div>
    </div>
);

const PERSPECTIVES: Record<PerspectiveId, PerspectiveConfig> = {
    "bullseye": {
        title: "Bullseye Sentence",
        subtitle: "Your essence in one breath",
        icon: Target,
        render: (data) => (
            <div className="text-center py-8">
                <p
                    className="text-2xl sm:text-3xl leading-relaxed font-medium"
                    style={titleStyle}
                >
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
                <h2
                    className="text-3xl sm:text-4xl font-semibold leading-tight"
                    style={titleStyle}
                >
                    <span
                        aria-hidden="true"
                        style={{ color: "var(--skin-accent-gold, #b8860b)", marginRight: "0.5rem" }}
                    >
                        ✦
                    </span>
                    <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
                        {data.vibrationalKey.name}
                    </span>
                    <span
                        aria-hidden="true"
                        style={{ color: "var(--skin-accent-gold, #b8860b)", marginLeft: "0.5rem" }}
                    >
                        ✦
                    </span>
                </h2>
                <p className="text-lg sm:text-xl leading-relaxed" style={mutedStyle}>
                    "{data.vibrationalKey.tagline}"
                </p>
                {data.vibrationalKey.tagline_simple && (
                    <p className="text-sm sm:text-base" style={mutedStyle}>
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
            <div className="space-y-4">
                <FieldCard label="My Top Actions">
                    <p className="font-medium">{data.threeLenses.actions.join(" • ")}</p>
                </FieldCard>
                <FieldCard label="My Prime Driver">
                    <p className="font-semibold text-xl mb-1">{data.threeLenses.primeDriver}</p>
                    {data.threeLenses.primeDriver_meaning && (
                        <p className="text-sm" style={mutedStyle}>
                            {data.threeLenses.primeDriver_meaning}
                        </p>
                    )}
                </FieldCard>
                <FieldCard label="My Archetype">
                    <p className="font-semibold text-xl mb-1">{data.threeLenses.archetype}</p>
                    {data.threeLenses.archetype_meaning && (
                        <p className="text-sm" style={mutedStyle}>
                            {data.threeLenses.archetype_meaning}
                        </p>
                    )}
                </FieldCard>
                <FieldCard label="✦ One Action to Mastery" accent>
                    <p className="font-semibold text-lg mb-1">
                        Put "{data.threeLenses.primeDriver}" on repeat.
                    </p>
                    <p className="text-sm" style={mutedStyle}>
                        This is the single action that, when practiced consistently, leads to full mastery of your genius.
                    </p>
                </FieldCard>
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
                    <div
                        key={index}
                        className="rounded-2xl px-5 py-4 space-y-2"
                        style={cardSurface}
                    >
                        <div>
                            <span style={eyebrowStyle}>Effect</span>
                            <span style={bodyStyle} className="ml-2">{item.effect}</span>
                        </div>
                        <div>
                            <span style={eyebrowStyle}>Scene</span>
                            <span style={bodyStyle} className="ml-2">{item.scene}</span>
                        </div>
                        <div>
                            <span style={eyebrowStyle}>Outcome</span>
                            <span style={bodyStyle} className="ml-2 font-semibold">{item.outcome}</span>
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
                    <div
                        key={stage.stage || index}
                        className="flex gap-4 rounded-2xl px-5 py-4"
                        style={cardSurface}
                    >
                        <div
                            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(244, 212, 114, 0.95) 0%, rgba(212, 175, 55, 0.78) 100%)",
                                color: "#0a1628",
                                fontFamily: "'DM Sans', system-ui, sans-serif",
                                fontVariantNumeric: "tabular-nums lining-nums",
                                border: "0.5px solid rgba(122, 81, 8, 0.45)",
                            }}
                        >
                            {stage.stage || index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p style={bodyStyle} className="font-semibold">{stage.name}</p>
                            <p style={mutedStyle} className="text-sm leading-relaxed">{stage.description}</p>
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
                    <div
                        key={index}
                        className="rounded-2xl px-5 py-4"
                        style={cardSurface}
                    >
                        <p style={bodyStyle} className="font-semibold mb-1">{item.activity}</p>
                        <p style={mutedStyle} className="text-sm">For: {item.targetAudience}</p>
                        <p style={mutedStyle} className="text-sm">Purpose: {item.purpose}</p>
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
                <FieldCard label="As Creator">
                    {data.rolesEnvironments?.asCreator}
                </FieldCard>
                <FieldCard label="As Contributor">
                    {data.rolesEnvironments?.asContributor}
                </FieldCard>
                <FieldCard label="As Founder">
                    {data.rolesEnvironments?.asFounder}
                </FieldCard>
                <FieldCard label="Ideal Environment" accent>
                    <span className="font-medium">{data.rolesEnvironments?.environment}</span>
                </FieldCard>
            </div>
        ),
    },
    "partner": {
        title: "Best Complementary Partner",
        subtitle: "Who to seek for collaboration",
        icon: Users,
        render: (data) => (
            <div className="space-y-4">
                <FieldCard label="Skills-Wise">
                    {data.complementaryPartner?.skillsWise}
                </FieldCard>
                <FieldCard label="Genius-Wise">
                    {data.complementaryPartner?.geniusWise}
                </FieldCard>
                <FieldCard label="Archetype-Wise">
                    {data.complementaryPartner?.archetypeWise}
                </FieldCard>
                <FieldCard label="The Synergy" accent>
                    <span className="font-medium">{data.complementaryPartner?.synergy}</span>
                </FieldCard>
            </div>
        ),
    },
    "monetization": {
        title: "Monetization Avenues",
        subtitle: "How to monetize your genius",
        icon: DollarSign,
        render: (data) => (
            <div className="flex flex-wrap gap-2.5 justify-center">
                {data.monetizationAvenues?.map((avenue, index) => (
                    <span
                        key={index}
                        className="px-4 py-2 rounded-full font-medium text-sm"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            background: "rgba(244, 212, 114, 0.18)",
                            border: "0.5px solid rgba(212, 175, 55, 0.55)",
                            color: "var(--skin-text-primary, #0b2a5a)",
                            letterSpacing: "0.02em",
                        }}
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
            <div className="rounded-2xl px-7 py-8" style={accentCardSurface}>
                <p
                    className="text-lg sm:text-xl leading-relaxed"
                    style={mutedStyle}
                >
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
                    <div
                        key={index}
                        className="rounded-2xl px-5 py-5 text-center"
                        style={cardSurface}
                    >
                        <p className="text-3xl mb-2">{code.symbol}</p>
                        <p style={bodyStyle} className="text-sm">{code.meaning}</p>
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
            <div className="rounded-2xl px-7 py-8" style={accentCardSurface}>
                <Quote
                    className="w-8 h-8 mb-4"
                    style={{ color: "rgba(160, 109, 8, 0.5)" }}
                />
                <p
                    className="text-xl leading-relaxed"
                    style={bodyStyle}
                >
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
                    <p
                        className="italic"
                        style={mutedStyle}
                    >
                        Loading…
                    </p>
                </div>
            </GameShellV2>
        );
    }

    if (!config || !appleseedData) {
        return (
            <GameShellV2>
                <div className="max-w-2xl mx-auto px-5 py-10 text-center">
                    <p className="italic" style={mutedStyle}>
                        {!config
                            ? "Unknown perspective."
                            : "No Top Talent data found yet. Complete the assessment first."}
                    </p>
                </div>
            </GameShellV2>
        );
    }

    return (
        <GameShellV2>
            <div className="max-w-3xl mx-auto px-5 py-8 lg:py-10 space-y-8">
                {/* Header — editorial Aurora register: cream cardSurface,
                    Cormorant title with gold-gradient accent on the
                    operative word, italic subtitle, gold sparkle medallion,
                    Ornament rule. Same rhythm as /admin and /dashboard. */}
                <header
                    className="rounded-2xl px-6 py-8 sm:px-8 sm:py-10 text-center"
                    style={cardSurface}
                >
                    <div className="flex justify-center mb-4">
                        <div
                            className="inline-flex items-center justify-center w-12 h-12 rounded-full"
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(244, 212, 114, 0.32) 0%, rgba(212, 175, 55, 0.18) 100%)",
                                border: "0.5px solid rgba(212, 175, 55, 0.55)",
                                boxShadow:
                                    "0 0 14px -2px rgba(244, 212, 114, 0.45), inset 0 0 8px -2px rgba(244, 212, 114, 0.35)",
                            }}
                        >
                            <Icon
                                className="w-5 h-5"
                                style={{ color: "rgba(160, 109, 8, 0.92)" }}
                            />
                        </div>
                    </div>

                    <h1
                        className="text-2xl sm:text-3xl font-semibold leading-tight tracking-tight"
                        style={titleStyle}
                    >
                        {config.title}
                    </h1>

                    <p
                        className="mt-2 text-base sm:text-lg italic"
                        style={mutedStyle}
                    >
                        {config.subtitle}
                    </p>

                    <Ornament className="mt-5" />
                </header>

                {/* Content */}
                <div>
                    {config.render(appleseedData)}
                </div>
            </div>
        </GameShellV2>
    );
};

export default ZoGPerspectiveView;
