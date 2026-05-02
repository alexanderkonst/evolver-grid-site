import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import ActivationSteps from "@/components/ActivationSteps";
import ReadNextSectionButton from "@/components/profile/ReadNextSectionButton";
import { flipToSecondPerson } from "@/lib/zogProfileVoice";
import { Target, Sparkles, Users, TrendingUp, Briefcase, DollarSign, Eye, Palette, MessageSquare, Heart, Zap, Quote } from "lucide-react";

// Day 54+ (Sasha 2026-04-28 night): full restyle of the ME · Top Talent
// perspective views. Was a violet/purple palette (#8460ea, #a4a3d0,
// #c8b7d8 → #e7e9f5 gradient) that didn't match the rest of the brand.
// Now in the Aurora editorial register: cream cardSurface + gold
// hairline + amber halo for cards, Cormorant titles, DM Sans tabular
// numerals, gold-uppercase eyebrows, navy text via skin tokens. Same
// pattern used on /admin and /dashboard so the ME space reads as part
// of the same building.

// Day 58 (Sasha 2026-05-02): Top Talent sub-pane restructured.
// Removed: bullseye / vibrational-key / three-lenses / life-scene
//   (now folded into the rebuilt overview hero box).
// Added: how-it-shows-up / three-key-talents / top-shadow / one-action
//   (sourced from topTalentProfile, the deep 8-field surface).
// Renamed: mastery → "Path of Mastery"; roles → "Ideal Environments"
//   (paths preserved so inbound URLs don't break).
// Legacy IDs kept in the union for backwards compat (perspective view
// still resolves them as fallthrough → "perspective not found"); they
// no longer appear in the side-nav.
type PerspectiveId =
    | "start-here"
    | "how-it-shows-up"
    | "three-key-talents"
    | "top-shadow"
    | "one-action"
    | "appreciated-for"
    | "mastery"
    | "roles"
    | "partner"
    | "monetization"
    // Legacy — no side-nav entry but still resolvable by URL:
    | "bullseye"
    | "vibrational-key"
    | "three-lenses"
    | "life-scene"
    | "activities"
    | "visual-codes"
    | "elevator-pitch";

const MASTERY_CTA_URL = "https://t.me/integralevolution";

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

// Day 58 (Sasha 2026-05-02): switched to Partial<Record> so retired
// perspectives (e.g. "appreciated-for") can be removed from the dict
// without TypeScript erroring. Runtime `if (!config)` handles missing.
const PERSPECTIVES: Partial<Record<PerspectiveId, PerspectiveConfig>> = {
    // ─── Day 58 (Sasha 2026-05-02): "Start Here" — activation home ───
    // First subpage of My Top Talent. Same body as the post-payment
    // /activate/welcome page via the shared <ActivationSteps />
    // component — the user can return here anytime to complete their
    // three-step activation flow.
    "start-here": {
        // Day 58 (Sasha 2026-05-02 evening): copy block from Sasha:
        //   "You're in. Let's begin." + "Three moves." → header.
        // showHeading=false on the body to avoid doubling the heading
        // (perspective layout already renders title + subtitle).
        title: "You're in. Let's begin.",
        subtitle: "Three moves.",
        icon: Sparkles,
        render: () => <ActivationSteps showHeading={false} />,
    },
    // ─── Four deep-profile perspectives ───
    "how-it-shows-up": {
        title: "How It Shows Up",
        subtitle: "Where your genius lights up in real life",
        icon: Sparkles,
        render: (data) => (
            data.topTalentProfile?.how_genius_shows_up ? (
                <div className="rounded-2xl px-6 py-7 sm:px-8 sm:py-8" style={cardSurface}>
                    <p
                        className="text-base sm:text-lg leading-relaxed"
                        style={{
                            fontFamily: "'Source Serif 4', Georgia, serif",
                            color: "var(--skin-text-primary, #0b2a5a)",
                            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                        }}
                    >
                        {flipToSecondPerson(data.topTalentProfile.how_genius_shows_up)}
                    </p>
                </div>
            ) : null
        ),
    },
    "three-key-talents": {
        title: "Three Key Talents",
        subtitle: "What you bring, every time",
        icon: Sparkles,
        render: (data) => (
            <ol className="space-y-4">
                {data.topTalentProfile?.top_three_talents?.map((talent, i) => (
                    <li
                        key={i}
                        className="rounded-2xl px-6 py-5 sm:px-7 sm:py-6 flex gap-4"
                        style={cardSurface}
                    >
                        <span
                            className="flex-shrink-0 w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, rgba(244, 212, 114, 0.95) 0%, rgba(212, 175, 55, 0.78) 100%)",
                                color: "#0a1628",
                                fontFamily: "'DM Sans', system-ui, sans-serif",
                                fontVariantNumeric: "tabular-nums lining-nums",
                                border: "0.5px solid rgba(122, 81, 8, 0.45)",
                            }}
                        >
                            {i + 1}
                        </span>
                        <p
                            className="text-base leading-relaxed flex-1 pt-0.5"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                color: "var(--skin-text-primary, #0b2a5a)",
                                textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                            }}
                        >
                            {talent}
                        </p>
                    </li>
                ))}
            </ol>
        ),
    },
    "top-shadow": {
        title: "Top Shadow",
        subtitle: "The other side of the coin",
        icon: Sparkles,
        // Day 58 (Sasha 2026-05-02): subpage now renders BOTH the
        // synthesized one-sentence form AND the full paragraph. The
        // sentence is the punchy headline; the paragraph is the
        // structural unfolding. Reveal card shows only the sentence.
        render: (data) => {
            const oneSentence = data.topTalentProfile?.top_shadow_one_sentence;
            const fullParagraph = data.topTalentProfile?.edge_and_traps
                ? flipToSecondPerson(data.topTalentProfile.edge_and_traps)
                : undefined;
            if (!oneSentence && !fullParagraph) return null;
            return (
                <div className="space-y-5">
                    {oneSentence && (
                        <div
                            className="rounded-2xl px-6 py-6 sm:px-8 sm:py-7 text-center"
                            style={accentCardSurface}
                        >
                            <p style={eyebrowStyle} className="mb-3">My top shadow is</p>
                            <p
                                className="italic leading-snug"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: "clamp(1.25rem, 3vw, 1.6rem)",
                                    fontWeight: 500,
                                    color: "var(--skin-text-primary, #0b2a5a)",
                                    textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                                }}
                            >
                                {oneSentence}
                            </p>
                        </div>
                    )}
                    {fullParagraph && (
                        <div className="rounded-2xl px-6 py-7 sm:px-8 sm:py-8" style={cardSurface}>
                            <p
                                className="text-base sm:text-lg leading-relaxed"
                                style={{
                                    fontFamily: "'Source Serif 4', Georgia, serif",
                                    color: "var(--skin-text-primary, #0b2a5a)",
                                    textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                                }}
                            >
                                {fullParagraph}
                            </p>
                        </div>
                    )}
                </div>
            );
        },
    },
    "one-action": {
        title: "One Action",
        subtitle: "The single action that, repeated, deepens your mastery",
        icon: Sparkles,
        render: (data) => (
            data.topTalentProfile?.flywheel_action ? (
                <div className="rounded-2xl px-6 py-7 sm:px-8 sm:py-8 space-y-3" style={accentCardSurface}>
                    <p style={eyebrowStyle}>Repeat this</p>
                    <p
                        className="text-base sm:text-lg leading-relaxed font-medium"
                        style={{
                            fontFamily: "'Source Serif 4', Georgia, serif",
                            color: "var(--skin-text-primary, #0b2a5a)",
                            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                        }}
                    >
                        {data.topTalentProfile.flywheel_action}
                    </p>
                </div>
            ) : null
        ),
    },
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
    // "appreciated-for" — Day 58 (Sasha 2026-05-02): retired. Sasha:
    // "let's just delete it." Side-nav entry already removed.
    "mastery": {
        title: "Path of Mastery",
        subtitle: "Your seven stages of evolution",
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
                            <p style={mutedStyle} className="text-sm leading-relaxed">{flipToSecondPerson(stage.description)}</p>
                        </div>
                    </div>
                ))}

                {/* Day 58 (Sasha 2026-05-02): "Accelerate your path of
                    mastery — book a session" CTA, lifted from the old
                    overview surface. Phrasing dropped "with Aleksandr"
                    per Sasha. */}
                <a
                    href={MASTERY_CTA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-full px-5 py-3 mt-2 transition-all hover:scale-[1.01]"
                    style={{
                        background: "linear-gradient(135deg, hsla(40, 75%, 60%, 0.22) 0%, hsla(40, 65%, 50%, 0.10) 100%)",
                        border: "1px solid hsla(40, 70%, 55%, 0.40)",
                        boxShadow: "0 4px 14px -6px rgba(184,134,11,0.28)",
                    }}
                >
                    <div className="flex items-center gap-3">
                        <Sparkles className="h-4 w-4 flex-shrink-0" style={{ color: "#b8860b" }} />
                        <span className="flex-1 text-sm font-medium" style={{ color: "#5d4307" }}>
                            Accelerate your path of mastery — book a session
                        </span>
                    </div>
                </a>
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
        title: "Ideal Environments",
        subtitle: "Where your genius is most at home",
        icon: Users,
        // Day 58 (Sasha 2026-05-02): content swapped from rolesEnvironments
        // to topTalentProfile.ideal_environments — three-bullet editorial
        // list matching the deep-profile register. Falls back to the legacy
        // rolesEnvironments shape for snapshots without the deep field.
        render: (data) => {
            const envs = data.topTalentProfile?.ideal_environments;
            if (envs && envs.length > 0) {
                return (
                    <ul className="space-y-3">
                        {envs.map((env, i) => (
                            <li
                                key={i}
                                className="rounded-2xl px-6 py-5 flex gap-3"
                                style={cardSurface}
                            >
                                <span
                                    aria-hidden="true"
                                    className="flex-shrink-0 mt-1 text-base"
                                    style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                                >
                                    ✦
                                </span>
                                <p
                                    className="text-base leading-relaxed flex-1"
                                    style={{
                                        fontFamily: "'Source Serif 4', Georgia, serif",
                                        color: "var(--skin-text-primary, #0b2a5a)",
                                        textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                                    }}
                                >
                                    {env}
                                </p>
                            </li>
                        ))}
                    </ul>
                );
            }
            // Legacy fallback for pre-Day-57 snapshots.
            return (
                <div className="space-y-4">
                    {data.rolesEnvironments?.environment && (
                        <FieldCard label="Ideal Environment" accent>
                            <span className="font-medium">{data.rolesEnvironments.environment}</span>
                        </FieldCard>
                    )}
                </div>
            );
        },
    },
    "partner": {
        title: "Complementary Partner",
        subtitle: "Who you most need beside you",
        icon: Users,
        // Day 58 (Sasha 2026-05-02): the prompt now asks for ONE fused
        // paragraph in `synergy` rather than four piecemeal fields. We
        // show the paragraph as the primary read; the labeled grid is
        // kept as a legacy fallback for pre-Day-58 snapshots.
        render: (data) => {
            const partner = data.complementaryPartner;
            const synergyParagraph = partner?.synergy?.trim();
            const hasLegacyDetails = Boolean(
                partner?.skillsWise || partner?.geniusWise || partner?.archetypeWise
            );

            // New shape: render the fused synergy paragraph alone.
            if (synergyParagraph && !hasLegacyDetails) {
                return (
                    <div className="rounded-2xl px-6 py-7 sm:px-8 sm:py-8" style={cardSurface}>
                        <p
                            className="text-base sm:text-lg leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                color: "var(--skin-text-primary, #0b2a5a)",
                                textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                            }}
                        >
                            {synergyParagraph}
                        </p>
                    </div>
                );
            }

            // Legacy fallback — the four-field grid.
            return (
                <div className="space-y-4">
                    {partner?.skillsWise && (
                        <FieldCard label="Skills-Wise">{partner.skillsWise}</FieldCard>
                    )}
                    {partner?.geniusWise && (
                        <FieldCard label="Genius-Wise">{partner.geniusWise}</FieldCard>
                    )}
                    {partner?.archetypeWise && (
                        <FieldCard label="Archetype-Wise">{partner.archetypeWise}</FieldCard>
                    )}
                    {partner?.synergy && (
                        <FieldCard label="The Synergy" accent>
                            <span className="font-medium">{partner.synergy}</span>
                        </FieldCard>
                    )}
                </div>
            );
        },
    },
    "monetization": {
        title: "Monetization",
        subtitle: "How you turn your genius into revenue",
        icon: DollarSign,
        // Day 58 (Sasha 2026-05-02 late evening): each subsection now
        // wrapped in its own bordered cream container so the eyebrow
        // ("MONETIZATION AVENUES" / "CAREER SWEET SPOTS") reads cleanly
        // against a stable cream background instead of disappearing
        // gold-on-gold against the aurora page tint. Each container
        // has a strong gold hairline + a Cormorant section heading at
        // top, then the cards inside.
        render: (data) => {
            const SectionContainer = ({
                heading,
                children,
            }: {
                heading: string;
                children: React.ReactNode;
            }) => (
                <section
                    className="rounded-2xl px-5 py-6 sm:px-7 sm:py-7"
                    style={{
                        // Stronger cream than the inner cards so the
                        // outer container reads as the SECTION envelope
                        // and the inner cards as DISTINCT items inside.
                        background: "rgba(253, 247, 234, 0.92)",
                        border: "1px solid rgba(184, 134, 11, 0.45)",
                        boxShadow:
                            "0 0 24px -6px rgba(184, 134, 11, 0.18), 0 14px 36px -20px rgba(10, 22, 40, 0.16)",
                    }}
                >
                    <h3
                        className="font-semibold uppercase mb-5"
                        style={{
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            fontSize: "12.5px",
                            letterSpacing: "0.26em",
                            color: "rgba(122, 81, 8, 0.95)",
                        }}
                    >
                        {heading}
                    </h3>
                    {children}
                </section>
            );

            const ItemCard = ({ children }: { children: React.ReactNode }) => (
                <li
                    className="rounded-xl px-5 py-4 flex gap-3"
                    style={{
                        background: "rgba(255, 252, 244, 0.85)",
                        border: "0.5px solid rgba(212, 175, 55, 0.35)",
                    }}
                >
                    <span
                        aria-hidden="true"
                        className="flex-shrink-0 mt-1 text-base"
                        style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                    >
                        ✦
                    </span>
                    <p
                        className="text-base leading-relaxed flex-1"
                        style={{
                            fontFamily: "'Source Serif 4', Georgia, serif",
                            color: "var(--skin-text-primary, #0b2a5a)",
                        }}
                    >
                        {children}
                    </p>
                </li>
            );

            return (
                <div className="space-y-6">
                    {data.monetizationAvenues && data.monetizationAvenues.length > 0 && (
                        <SectionContainer heading="Monetization Avenues">
                            <ul className="space-y-3">
                                {data.monetizationAvenues.map((avenue, i) => (
                                    <ItemCard key={i}>{avenue}</ItemCard>
                                ))}
                            </ul>
                        </SectionContainer>
                    )}

                    {data.topTalentProfile?.career_sweet_spots && data.topTalentProfile.career_sweet_spots.length > 0 && (
                        <SectionContainer heading="Career Sweet Spots">
                            <ul className="space-y-3">
                                {data.topTalentProfile.career_sweet_spots.map((spot, i) => (
                                    <ItemCard key={i}>{spot}</ItemCard>
                                ))}
                            </ul>
                        </SectionContainer>
                    )}
                </div>
            );
        },
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
    const location = useLocation();
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

    // Day 58 (Sasha 2026-05-02): start-here doesn't need appleseed data
    // (its render is the static ActivationSteps component) — exempt it
    // from the no-data gate so the page renders cleanly even before the
    // user completes the assessment.
    const PERSPECTIVES_WITHOUT_DATA: PerspectiveId[] = ["start-here"];
    const needsData = !PERSPECTIVES_WITHOUT_DATA.includes(perspectiveId as PerspectiveId);
    if (!config || (needsData && !appleseedData)) {
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
                {/* Header — Day 58 (Sasha 2026-05-02): the gold medallion
                    + Lucide icon was replaced with a single Ornament rule
                    above the title. Editorial reads cleaner without per-
                    perspective icons; the pointed-star glyph IS the visual
                    accent — no medallion, no icon needed. */}
                <header
                    className="rounded-2xl px-6 py-8 sm:px-8 sm:py-10 text-center"
                    style={cardSurface}
                >
                    <Ornament className="mb-5" />

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
                </header>

                {/* Content */}
                <div>
                    {/* appleseedData is non-null here for every perspective
                        EXCEPT start-here (which is exempt — see gate above)
                        and start-here's render ignores data anyway. The `!`
                        is safe given the gate. */}
                    {config.render(appleseedData!)}
                </div>

                {/* Read Next Section — Day 58 (Sasha 2026-05-02 evening):
                    appended at the bottom of every My Top Talent subpage
                    so a first-read user can move through the deep
                    profile in order without jumping back to the
                    side-nav. Renders nothing on the last subpage. */}
                <ReadNextSectionButton currentPath={location.pathname} />
            </div>
        </GameShellV2>
    );
};

export default ZoGPerspectiveView;
