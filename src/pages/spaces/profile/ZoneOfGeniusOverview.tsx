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

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Sparkles, Download, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { generateZogPdf } from "@/modules/zone-of-genius/generateZogPdf";
import type { AppleseedData as FullAppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import type { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";
import { CTA_SMALL_CAPS_STYLE, igniteLogo } from "@/lib/landingDesign";
import CardActions from "@/components/sharing/CardActions";

/**
 * Strip decorative glyphs (✦ ✧ ◆ ◇ ❖ ✱ ★ ☆) some AI generators wrap
 * archetype names in. We render the name unflanked. Day 58 (Sasha).
 */
const stripDecorativeGlyphs = (name: string): string =>
    name.replace(/[✦✧◆◇❖✱★☆]/g, "").trim();

/**
 * Render the bullseye sentence in editorial sentence case, no trailing
 * period — matches the landing register. Day 58 (Sasha 2026-05-02).
 */
const formatBullseye = (sentence: string): string =>
    sentence.toLowerCase().replace(/\.\s*$/, "").trim();

/**
 * Share text for the overview hero CardActions. Same shape as
 * RevelatoryHero's buildShareTextFor but drops the threeLenses block
 * (the overview hero doesn't render lenses) and folds in core_pattern
 * if present so the shared text carries the deeper resonance.
 */
const buildOverviewShareText = (
    archetype: string,
    bullseye: string | undefined,
    corePattern: string | undefined,
): string => {
    let text = `This is how I naturally create value:\n\n`;
    text += `${archetype}\n`;
    if (bullseye) text += `I ${formatBullseye(bullseye)}\n\n`;
    if (corePattern) text += `${corePattern}\n\n`;
    text += `Curious what you see.\n\n→ FindYourTopTalent.Com`;
    return text;
};

// Light-glass + dark-text palette, per the blueprint.
const INK = "#0a1628";
const INK_BODY = "rgba(26,30,58,0.78)";
const INK_MUTED = "rgba(26,30,58,0.55)";
const HALO_SOFT = "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)";

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
    const heroCardRef = useRef<HTMLElement | null>(null);
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

                {/* ═══ HERO — Day 58 (Sasha 2026-05-02): rebuilt per Wave 1.
                    Box adorned with a soft golden halo so it reads as the
                    meaningful artifact (not just another card). Dodecahedron
                    wears its own gold ring. Decorative glyphs around the
                    archetype name stripped at render. ONE phrase only —
                    the bullseye in editorial sentence case (no period, no
                    quotes). Core pattern paragraph below from the deep
                    profile. CardActions Save · Share replaces the in-hero
                    PDF button (PDF moves to bottom of page in Wave 2). ═══ */}
                <div
                    style={{
                        borderRadius: '24px',
                        boxShadow:
                            '0 0 40px rgba(240, 194, 127, 0.22), 0 0 80px rgba(212, 175, 55, 0.10)',
                    }}
                >
                    <article
                        ref={heroCardRef}
                        className="liquid-glass-strong rounded-3xl p-7 sm:p-10 text-center space-y-5"
                        style={{
                            border: "1px solid rgba(212, 175, 55, 0.32)",
                        }}
                    >
                        <div
                            className="relative inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden mx-auto"
                            style={{
                                boxShadow:
                                    "0 0 24px 4px rgba(244, 212, 114, 0.45), 0 0 48px 8px rgba(212, 175, 55, 0.18)",
                            }}
                        >
                            <img src="/dodecahedron.png" alt="Top Talent" className="w-full h-full object-cover" />
                        </div>
                        <p
                            className="text-[10px] uppercase tracking-[0.32em] font-medium"
                            style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                        >
                            My unique archetype
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
                            {stripDecorativeGlyphs(vk.name)}
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
                                I {formatBullseye(appleseedData.bullseyeSentence)}
                            </p>
                        )}
                        {fullAppleseed?.topTalentProfile?.core_pattern && (
                            <p
                                className="mx-auto max-w-[44ch] leading-relaxed pt-1"
                                style={{
                                    fontFamily: "'Source Serif 4', Georgia, serif",
                                    fontSize: "0.95rem",
                                    color: INK_BODY,
                                }}
                            >
                                {fullAppleseed.topTalentProfile.core_pattern}
                            </p>
                        )}

                        <div className="pt-1">
                            <CardActions
                                captureRef={heroCardRef as React.RefObject<HTMLElement>}
                                fileName={`${stripDecorativeGlyphs(vk.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-top-talent"}-find-your-top-talent`}
                                shareText={buildOverviewShareText(
                                    stripDecorativeGlyphs(vk.name),
                                    appleseedData.bullseyeSentence,
                                    fullAppleseed?.topTalentProfile?.core_pattern
                                )}
                                darkMode={false}
                            />
                        </div>
                    </article>
                </div>

                {/* ═══ Download PDF — Day 58 (Sasha 2026-05-02): moved from
                    inside the hero box to sit just above the closing CTA.
                    Reason to download: hand the PDF to the user's AI as
                    context so future conversations know who they are. ═══ */}
                <section className="text-center space-y-3 max-w-md mx-auto pt-2">
                    <p
                        className="text-sm leading-relaxed italic"
                        style={{
                            fontFamily: "'Source Serif 4', Georgia, serif",
                            color: "var(--skin-text-muted-soft, rgba(26,30,58,0.62))",
                            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                        }}
                    >
                        Give the PDF to your AI so it can know more about you.
                    </p>
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
