/**
 * ZoneOfGeniusOverview — the user's saved Top Talent reveal.
 *
 * Day 52 (Sasha 2026-04-26): full design pass per the glassmorphism
 * blueprint (docs/03-playbooks/glassmorphism_blueprint.md). All panels
 * are now `.liquid-glass` / `.liquid-glass-strong` instead of flat
 * pastel rectangles. Hero uses Cormorant Garamond for the archetype
 * name + bullseye, matching the landing register. Mastery Stages now
 * carries the gold "book a session" CTA inline (Sasha — "very powerful
 * to activate the path of mastery").
 *
 * Removed (Sasha 2026-04-26):
 *   • Public Reveal Link card / share-slug flow — the PDF and the page
 *     itself are the artifact; a duplicate URL was a waste of motion.
 *   • Monetization avenues block — career-advisory pollution.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Zap, Target, Quote, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { generateZogPdf } from "@/modules/zone-of-genius/generateZogPdf";
import type { AppleseedData as FullAppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import type { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";

// Light-glass + dark-text palette, per the blueprint.
const INK = "#0a1628";
const INK_BODY = "rgba(26,30,58,0.78)";
const INK_MUTED = "rgba(26,30,58,0.55)";
const HALO_SOFT = "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)";

const MASTERY_CTA_URL = "https://t.me/integralevolution";

interface AppleseedData {
    vibrationalKey?: {
        name: string;
        essence?: string;
        tagline?: string;
        tagline_simple?: string;
    };
    bullseyeSentence?: string;
    threeLenses?: {
        actions: string[];
        primeDriver: string;
        primeDriver_meaning?: string;
        archetype: string;
        archetype_meaning?: string;
    };
    masteryStages?: Array<{
        stage: number;
        name: string;
        description: string;
    }>;
    rolesEnvironments?: {
        asCreator?: string;
        asContributor?: string;
        asFounder?: string;
        environment?: string;
    };
    complementaryPartner?: {
        skillsWise?: string;
        geniusWise?: string;
        archetypeWise?: string;
        synergy?: string;
    };
    lifeScene?: string;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p
        className="text-[10px] font-medium uppercase tracking-[0.28em]"
        style={{ color: INK_MUTED }}
    >
        {children}
    </p>
);

const ZoneOfGeniusOverview = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [appleseedData, setAppleseedData] = useState<AppleseedData | null>(null);
    const [fullAppleseed, setFullAppleseed] = useState<FullAppleseedData | null>(null);
    const [excaliburData, setExcaliburData] = useState<ExcaliburData | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const resolvedProfileId = await getOrCreateGameProfileId();
                if (!resolvedProfileId) {
                    setLoading(false);
                    return;
                }

                const { data: profileData } = await supabase
                    .from("game_profiles")
                    .select("last_zog_snapshot_id")
                    .eq("id", resolvedProfileId)
                    .single();

                if (!profileData?.last_zog_snapshot_id) {
                    setLoading(false);
                    return;
                }

                const { data: snapshotData } = await supabase
                    .from("zog_snapshots")
                    .select("appleseed_data, excalibur_data, archetype_title, core_pattern, top_three_talents")
                    .eq("id", profileData.last_zog_snapshot_id)
                    .single();

                if (snapshotData?.appleseed_data) {
                    setAppleseedData(snapshotData.appleseed_data as unknown as AppleseedData);
                    setFullAppleseed(snapshotData.appleseed_data as unknown as FullAppleseedData);
                } else if (snapshotData?.archetype_title) {
                    // Fallback: minimal appleseed from basic snapshot fields
                    const talents = (snapshotData.top_three_talents as unknown as string[]) || [];
                    const fallback: AppleseedData = {
                        vibrationalKey: {
                            name: snapshotData.archetype_title,
                            essence: snapshotData.core_pattern || "",
                        },
                        bullseyeSentence: snapshotData.core_pattern || undefined,
                        threeLenses: talents.length > 0 ? {
                            actions: talents,
                            primeDriver: "",
                            archetype: snapshotData.archetype_title,
                        } : undefined,
                    };
                    setAppleseedData(fallback);
                }
                if (snapshotData?.excalibur_data) {
                    setExcaliburData(snapshotData.excalibur_data as unknown as ExcaliburData);
                }
            } catch (err) {
                console.error("Error loading Top Talent data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const subPages = [
        { id: "archetype", label: "Archetype", icon: Star, path: "/game/me/zone-of-genius/archetype" },
        { id: "talents", label: "Top Talents", icon: Zap, path: "/game/me/zone-of-genius/talents" },
        { id: "driver", label: "Prime Driver", icon: Target, path: "/game/me/zone-of-genius/driver" },
        { id: "action", label: "Action Statement", icon: Quote, path: "/game/me/zone-of-genius/action" },
    ];

    if (loading) {
        return (
            <GameShellV2>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-pulse text-sm" style={{ color: INK_MUTED }}>Loading…</div>
                </div>
            </GameShellV2>
        );
    }

    if (!appleseedData?.vibrationalKey) {
        return (
            <GameShellV2>
                <div className="max-w-2xl mx-auto p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden mb-4">
                        <img src="/dodecahedron.png" alt="Top Talent" className="w-full h-full object-cover" />
                    </div>
                    <h1
                        className="text-3xl mb-2"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: INK, textShadow: HALO_SOFT, fontWeight: 600 }}
                    >
                        Discover Your Top Talent
                    </h1>
                    <p className="mb-6" style={{ color: INK_BODY }}>
                        Take the 15-minute assessment to uncover your unique genius.
                    </p>
                    <Button
                        variant="wabi-primary"
                        onClick={() => navigate("/zone-of-genius/entry")}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Start Assessment
                    </Button>
                </div>
            </GameShellV2>
        );
    }

    const vk = appleseedData.vibrationalKey;
    const lenses = appleseedData.threeLenses;
    const stages = appleseedData.masteryStages;
    const partner = appleseedData.complementaryPartner;
    const roles = appleseedData.rolesEnvironments;

    return (
        <GameShellV2>
            <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-8">

                {/* ═══ HERO — liquid-glass-strong + Cormorant register ═══ */}
                <article className="liquid-glass-strong rounded-3xl p-7 sm:p-10 text-center space-y-5">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden mx-auto">
                        <img src="/dodecahedron.png" alt="Top Talent" className="w-full h-full object-cover" />
                    </div>
                    <p
                        className="text-[10px] uppercase tracking-[0.32em] font-medium"
                        style={{ color: "rgba(132,96,234,0.85)" }}
                    >
                        My genius is to be a
                    </p>
                    <h1
                        className="leading-[1.1] tracking-[-0.01em]"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 600,
                            fontSize: "clamp(1.85rem, 5.5vw, 2.8rem)",
                            color: INK,
                            textShadow: HALO_SOFT,
                        }}
                    >
                        {vk.name}
                    </h1>
                    {appleseedData.bullseyeSentence && (
                        <p
                            className="mx-auto max-w-[34ch] italic leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                fontWeight: 300,
                                fontSize: "clamp(1.05rem, 2.2vw, 1.25rem)",
                                color: INK_BODY,
                            }}
                        >
                            I {appleseedData.bullseyeSentence}
                        </p>
                    )}
                    {vk.tagline && (
                        <p
                            className="mx-auto max-w-[42ch] text-sm leading-relaxed pt-1"
                            style={{ color: INK_MUTED, fontStyle: "italic" }}
                        >
                            "{vk.tagline}"
                        </p>
                    )}

                    <div className="pt-2">
                        <button
                            onClick={() => {
                                if (fullAppleseed) {
                                    generateZogPdf(fullAppleseed, excaliburData);
                                }
                            }}
                            disabled={!fullAppleseed}
                            className="liquid-glass-strong inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ color: INK }}
                        >
                            <Download className="w-4 h-4" />
                            {fullAppleseed ? "Download Full PDF" : "Generating PDF data…"}
                        </button>
                    </div>
                </article>

                {/* ═══ THREE LENSES ═══ */}
                {lenses && (lenses.actions?.length > 0 || lenses.primeDriver || lenses.archetype) && (
                    <section className="liquid-glass rounded-2xl p-6 space-y-5">
                        <SectionLabel>Three Lenses</SectionLabel>

                        {lenses.actions?.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-wider" style={{ color: INK_MUTED }}>Actions</p>
                                <div className="flex flex-wrap gap-2">
                                    {lenses.actions.map((action, i) => (
                                        <span
                                            key={i}
                                            className="liquid-glass inline-flex items-center px-3 py-1.5 rounded-full text-sm"
                                            style={{ color: INK }}
                                        >
                                            {action}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {lenses.primeDriver && (
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider" style={{ color: INK_MUTED }}>Prime Driver</p>
                                <p className="text-base font-medium" style={{ color: INK }}>{lenses.primeDriver}</p>
                                {lenses.primeDriver_meaning && (
                                    <p className="text-sm leading-relaxed" style={{ color: INK_BODY }}>
                                        {lenses.primeDriver_meaning}
                                    </p>
                                )}
                            </div>
                        )}

                        {lenses.archetype && (
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider" style={{ color: INK_MUTED }}>Archetype</p>
                                <p className="text-base font-medium" style={{ color: INK }}>{lenses.archetype}</p>
                                {lenses.archetype_meaning && (
                                    <p className="text-sm leading-relaxed" style={{ color: INK_BODY }}>
                                        {lenses.archetype_meaning}
                                    </p>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {/* ═══ LIFE SCENE — italic narrative block ═══ */}
                {appleseedData.lifeScene && (
                    <section className="liquid-glass rounded-2xl p-6 space-y-3">
                        <SectionLabel>In the field</SectionLabel>
                        <blockquote
                            className="italic leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                fontWeight: 300,
                                fontSize: "1.05rem",
                                color: INK_BODY,
                            }}
                        >
                            {appleseedData.lifeScene}
                        </blockquote>
                    </section>
                )}

                {/* ═══ MASTERY STAGES + book-a-session CTA ═══ */}
                {stages && stages.length > 0 && (
                    <section className="liquid-glass rounded-2xl p-6 space-y-5">
                        <SectionLabel>Path of Mastery</SectionLabel>

                        <ol className="space-y-3.5">
                            {stages.map((stage, i) => (
                                <li key={stage.stage || i} className="flex gap-4">
                                    <span
                                        className="flex-shrink-0 w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center"
                                        style={{
                                            background: "rgba(132,96,234,0.12)",
                                            color: "#5b21b6",
                                            border: "1px solid rgba(132,96,234,0.25)",
                                        }}
                                    >
                                        {stage.stage || i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <p className="text-sm font-medium" style={{ color: INK }}>{stage.name}</p>
                                        {stage.description && (
                                            <p className="text-xs leading-relaxed mt-0.5" style={{ color: INK_BODY }}>
                                                {stage.description}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ol>

                        {/* Gold CTA pill — same register as "Work with Aleksandr"
                            on /ai-os hero, so the offer reads consistently. */}
                        <a
                            href={MASTERY_CTA_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-full px-5 py-3 transition-all hover:scale-[1.01]"
                            style={{
                                background: "linear-gradient(135deg, hsla(40, 75%, 60%, 0.22) 0%, hsla(40, 65%, 50%, 0.10) 100%)",
                                border: "1px solid hsla(40, 70%, 55%, 0.40)",
                                boxShadow: "0 4px 14px -6px rgba(184,134,11,0.28)",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="h-4 w-4 flex-shrink-0" style={{ color: "#b8860b" }} />
                                <span className="flex-1 text-sm font-medium" style={{ color: "#5d4307" }}>
                                    Accelerate your path of mastery — book a session with Aleksandr
                                </span>
                                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "rgba(184,134,11,0.7)" }} />
                            </div>
                        </a>
                    </section>
                )}

                {/* ═══ COMPLEMENTARY PARTNER ═══ */}
                {partner && (partner.skillsWise || partner.geniusWise || partner.archetypeWise || partner.synergy) && (
                    <section className="liquid-glass rounded-2xl p-6 space-y-4">
                        <SectionLabel>Best Complementary Partner</SectionLabel>
                        {partner.skillsWise && (
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider" style={{ color: INK_MUTED }}>Skills</p>
                                <p className="text-sm leading-relaxed" style={{ color: INK }}>{partner.skillsWise}</p>
                            </div>
                        )}
                        {partner.geniusWise && (
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider" style={{ color: INK_MUTED }}>Genius</p>
                                <p className="text-sm leading-relaxed" style={{ color: INK }}>{partner.geniusWise}</p>
                            </div>
                        )}
                        {partner.archetypeWise && (
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider" style={{ color: INK_MUTED }}>Archetype</p>
                                <p className="text-sm leading-relaxed" style={{ color: INK }}>{partner.archetypeWise}</p>
                            </div>
                        )}
                        {partner.synergy && (
                            <div className="pt-2 border-t border-black/5 space-y-1">
                                <p className="text-xs uppercase tracking-wider" style={{ color: INK_MUTED }}>Synergy</p>
                                <p className="text-sm leading-relaxed italic" style={{ color: INK_BODY }}>{partner.synergy}</p>
                            </div>
                        )}
                    </section>
                )}

                {/* ═══ ROLES & ENVIRONMENTS ═══ */}
                {roles && (roles.asCreator || roles.asContributor || roles.asFounder || roles.environment) && (
                    <section className="liquid-glass rounded-2xl p-6 space-y-4">
                        <SectionLabel>Where You Work Best</SectionLabel>
                        {roles.asCreator && (
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider" style={{ color: INK_MUTED }}>As Creator</p>
                                <p className="text-sm leading-relaxed" style={{ color: INK }}>{roles.asCreator}</p>
                            </div>
                        )}
                        {roles.asContributor && (
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider" style={{ color: INK_MUTED }}>As Contributor</p>
                                <p className="text-sm leading-relaxed" style={{ color: INK }}>{roles.asContributor}</p>
                            </div>
                        )}
                        {roles.asFounder && (
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider" style={{ color: INK_MUTED }}>As Founder</p>
                                <p className="text-sm leading-relaxed" style={{ color: INK }}>{roles.asFounder}</p>
                            </div>
                        )}
                        {roles.environment && (
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider" style={{ color: INK_MUTED }}>Ideal Environment</p>
                                <p className="text-sm leading-relaxed italic" style={{ color: INK_BODY }}>{roles.environment}</p>
                            </div>
                        )}
                    </section>
                )}

                {/* ═══ Sub-page nav — glassy chips, no flat boxes ═══ */}
                <section className="space-y-3">
                    <SectionLabel>Explore Each Lens</SectionLabel>
                    <div className="grid grid-cols-2 gap-2">
                        {subPages.map((page) => (
                            <button
                                key={page.id}
                                onClick={() => navigate(page.path)}
                                className="liquid-glass rounded-2xl p-4 transition-all hover:scale-[1.02] text-left flex items-center gap-3"
                                style={{ color: INK }}
                            >
                                <page.icon className="w-4 h-4 flex-shrink-0" style={{ color: "#5b21b6" }} />
                                <span className="text-sm font-medium">{page.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ═══ Build CTA — gold-bordered like the Mastery CTA ═══ */}
                <section className="liquid-glass-strong rounded-2xl p-6 text-center space-y-3">
                    <p className="text-sm" style={{ color: INK_BODY }}>
                        Ready to turn your genius into a business?
                    </p>
                    <Button
                        variant="wabi-primary"
                        onClick={() => navigate("/game/me/genius-business")}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Build My Unique Business
                    </Button>
                </section>
            </div>
        </GameShellV2>
    );
};

export default ZoneOfGeniusOverview;
