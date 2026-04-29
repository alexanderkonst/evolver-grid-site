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
import { Sparkles, Star, Zap, Target, Quote, Download, ExternalLink, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { generateZogPdf } from "@/modules/zone-of-genius/generateZogPdf";
import type { AppleseedData as FullAppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import type { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";
import { CTA_SMALL_CAPS_STYLE, igniteLogo } from "@/lib/landingDesign";

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
    monetizationAvenues?: string[];
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

/**
 * Parse a Monetization Avenue string. Day 52 prompt asks for the shape:
 *   "Intro · Signal Map — 90-min 1:1 ... ($297)"
 *   "Signature · Compress to Ship — 6-week cohort ... ($2,997)"
 *   "Scale · Architecture Review — async retainer ... ($497/mo)"
 *
 * Older snapshots (pre-Day-52) may have plain strings ("Speaking gigs",
 * "Coaching package", etc.) — those return as `description` only so they
 * still render cleanly without a tier badge or fake price.
 *
 * Tier whitelist (Intro / Signature / Scale) is enforced — otherwise the
 * "tier" field stays empty and the whole string falls into description.
 * This prevents a hallucinated AI tier like "Premium · Exclusive ..." from
 * leaking into our value-ladder colorway.
 */
const TIER_WHITELIST = new Set(["intro", "signature", "scale"]);

const parseMonetizationAvenue = (
    raw: string
): { tier: string; name: string; description: string; price: string } => {
    if (typeof raw !== "string" || !raw.trim()) {
        return { tier: "", name: "", description: "", price: "" };
    }
    const text = raw.trim();

    // Extract trailing price: "(...)" at end. Allow $/€ + numbers + suffix.
    let price = "";
    let body = text;
    const priceMatch = text.match(/\(([^()]*[\d][^()]*)\)\s*$/);
    if (priceMatch) {
        price = priceMatch[1].trim();
        body = text.slice(0, priceMatch.index).trim();
    }

    // Tier prefix: "Intro · ..." (or em-dash, or colon)
    let tier = "";
    let rest = body;
    const tierMatch = body.match(/^(\w+)\s*[·:—-]\s*(.+)$/);
    if (tierMatch && TIER_WHITELIST.has(tierMatch[1].toLowerCase())) {
        tier = tierMatch[1].charAt(0).toUpperCase() + tierMatch[1].slice(1).toLowerCase();
        rest = tierMatch[2].trim();
    }

    // Name vs description: split on " — " (em-dash). Fallback: name = "", description = rest.
    let name = "";
    let description = rest;
    const nameMatch = rest.match(/^(.+?)\s+—\s+(.+)$/);
    if (nameMatch) {
        name = nameMatch[1].trim();
        description = nameMatch[2].trim();
    }

    return { tier, name, description, price };
};

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
    const monetization = appleseedData.monetizationAvenues;

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
                        style={{ color: "var(--skin-accent-gold, #b8860b)" }}
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
                                        className="flex-shrink-0 w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(244, 212, 114, 0.95) 0%, rgba(212, 175, 55, 0.78) 100%)",
                                            color: "#0a1628",
                                            border: "0.5px solid rgba(122, 81, 8, 0.45)",
                                            fontFamily: "'DM Sans', system-ui, sans-serif",
                                            fontVariantNumeric: "tabular-nums lining-nums",
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

                {/* ═══ MONETIZATION AVENUES — value-ladder offers ═══
                    Day 52 (Sasha 2026-04-26): the prompt now demands three
                    voice-matched offers spanning intro/signature/scale tiers
                    instead of generic "1:1 coaching / group program" clichés.
                    We attempt to parse the structured "Tier · Name — Deliverable
                    ($price)" shape, but fall back gracefully to plain text for
                    legacy snapshots that pre-date the prompt update. */}
                {monetization && monetization.length > 0 && (
                    <section className="liquid-glass rounded-2xl p-6 space-y-4">
                        <SectionLabel>Monetization Avenues</SectionLabel>
                        <ul className="space-y-3">
                            {monetization.map((raw, i) => {
                                const parsed = parseMonetizationAvenue(raw);
                                return (
                                    <li
                                        key={i}
                                        className="liquid-glass rounded-xl p-4 space-y-1.5"
                                    >
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {parsed.tier && (
                                                <span
                                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.18em] font-semibold"
                                                    style={{
                                                        background: "rgba(244, 212, 114, 0.18)",
                                                        color: "#7a5108",
                                                        border: "0.5px solid rgba(212, 175, 55, 0.55)",
                                                    }}
                                                >
                                                    {parsed.tier}
                                                </span>
                                            )}
                                            {parsed.name && (
                                                <span className="text-sm font-medium" style={{ color: INK }}>
                                                    {parsed.name}
                                                </span>
                                            )}
                                            {parsed.price && (
                                                <span
                                                    className="ml-auto text-xs font-semibold tabular-nums"
                                                    style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                                                >
                                                    {parsed.price}
                                                </span>
                                            )}
                                        </div>
                                        {parsed.description && (
                                            <p className="text-sm leading-relaxed" style={{ color: INK_BODY }}>
                                                {parsed.description}
                                            </p>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
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
                                <page.icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                                <span className="text-sm font-medium">{page.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ═══ Post-reveal funnel — same 2-button pattern as
                    AppleseedDisplay (Day 53, Sasha 2026-04-27).
                    Primary  → "Build a business off your top talent" →
                              /ignite#pricing-section (Top Talent
                              Business Session purchase). NOT the
                              Excalibur module.
                    Secondary → "See the exact playbook" → /playbook
                                (matches landing secondary verbatim).
                    Same canonical funnel CTAs surface here so a returning
                    user with a saved Top Talent profile sees the exact
                    same next-move logic they saw post-reveal — visual
                    + verbal coherence across the whole funnel. ═══ */}
                <section className="liquid-glass-strong rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto">
                    <div className="space-y-1">
                        <p className="text-sm sm:text-base font-medium" style={{ color: INK_BODY }}>
                            We do it together in 2 hours.
                        </p>
                        <p className="text-sm sm:text-base font-medium" style={{ color: INK_BODY }}>
                            Or you don't pay.
                        </p>
                    </div>

                    {/* PRIMARY — Productize Yourself Session */}
                    <a
                        href="/ignite#pricing-section"
                        className="group liquid-glass-dark cta-breath w-full rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-3 sm:py-3.5 max-w-full text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
                            backgroundImage:
                                "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
                            boxShadow:
                                "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
                            textShadow:
                                "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
                        }}
                    >
                        <img
                            src={igniteLogo}
                            alt=""
                            aria-hidden="true"
                            className="h-4 w-auto opacity-80 transition-opacity group-hover:opacity-100 flex-shrink-0"
                            style={{
                                filter: "drop-shadow(0 0 6px rgba(244, 212, 114, 0.45))",
                                animation: "gentle-spin 60s linear infinite",
                                willChange: "transform",
                                transformOrigin: "center",
                            }}
                            draggable={false}
                        />
                        <span style={CTA_SMALL_CAPS_STYLE} className="text-center">
                            Build a business off your top talent
                        </span>
                        <ArrowRight
                            aria-hidden="true"
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
                        />
                    </a>

                    <p
                        className="text-center text-xs italic"
                        style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.62))" }}
                    >
                        Or read the methodology first:
                    </p>

                    {/* SECONDARY — See the exact playbook */}
                    <a
                        href="/playbook"
                        className="w-full liquid-glass rounded-full inline-flex items-center justify-center px-6 py-3 whitespace-nowrap text-base font-medium tracking-[0.01em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "var(--skin-link-secondary, rgba(26,30,58,0.85))",
                            textShadow:
                                "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                        }}
                    >
                        See the exact playbook
                    </a>
                </section>
            </div>
        </GameShellV2>
    );
};

export default ZoneOfGeniusOverview;
