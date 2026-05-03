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
import { Sparkles, Download, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { generateZogPdf } from "@/modules/zone-of-genius/generateZogPdf";
import type { AppleseedData as FullAppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import type { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";
import {
    getCachedZogSnapshot,
    setCachedZogSnapshot,
} from "@/lib/zogSnapshotCache";
import { CTA_SMALL_CAPS_STYLE, igniteLogo } from "@/lib/landingDesign";
import CardActions from "@/components/sharing/CardActions";
import ReadNextSectionButton from "@/components/profile/ReadNextSectionButton";
import { flipToSecondPerson } from "@/lib/zogProfileVoice";

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
    // Day 60 (Sasha 2026-05-03): seed state from the module-level cache so
    // the Overview is instant after any other Top Talent perspective has
    // already fetched it (and vice versa). Only loading=true on a true
    // cache miss; otherwise the page paints real content on first frame.
    const cachedSnapshot = getCachedZogSnapshot();
    const [loading, setLoading] = useState(!cachedSnapshot);
    const [appleseedData, setAppleseedData] = useState<AppleseedData | null>(
        (cachedSnapshot?.appleseedData as AppleseedData | null) ??
            (cachedSnapshot && cachedSnapshot.archetypeTitle
                ? {
                      vibrationalKey: {
                          name: cachedSnapshot.archetypeTitle,
                          essence: cachedSnapshot.corePattern || "",
                      },
                      bullseyeSentence: cachedSnapshot.corePattern || undefined,
                      threeLenses: (cachedSnapshot.topThreeTalents?.length ?? 0) > 0
                          ? {
                                actions: cachedSnapshot.topThreeTalents!,
                                primeDriver: "",
                                archetype: cachedSnapshot.archetypeTitle,
                            }
                          : undefined,
                  }
                : null),
    );
    const [fullAppleseed, setFullAppleseed] = useState<FullAppleseedData | null>(
        (cachedSnapshot?.appleseedData as FullAppleseedData | null) ?? null,
    );
    const [excaliburData, setExcaliburData] = useState<ExcaliburData | null>(
        cachedSnapshot?.excaliburData ?? null,
    );
    // Day 58 (Sasha 2026-05-02): the PDF generation is async (font fetch
    // + html2canvas) and takes 1-3 seconds with no visible feedback —
    // users were clicking again, thinking it was broken. This flag
    // drives a spinner + "Preparing your PDF…" copy on the button.
    const [pdfBuilding, setPdfBuilding] = useState(false);
    const handleDownloadPdf = async () => {
        if (!fullAppleseed || pdfBuilding) return;
        setPdfBuilding(true);
        try {
            await generateZogPdf(fullAppleseed, excaliburData);
        } catch (err) {
            console.error("[ZoG Overview] PDF generation failed:", err);
        } finally {
            setPdfBuilding(false);
        }
    };

    useEffect(() => {
        if (cachedSnapshot) return;
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
                    setCachedZogSnapshot({
                        profileId: resolvedProfileId,
                        appleseedData: null,
                        excaliburData: null,
                        archetypeTitle: null,
                        corePattern: null,
                        topThreeTalents: null,
                    });
                    setLoading(false);
                    return;
                }

                const { data: snapshotData } = await supabase
                    .from("zog_snapshots")
                    .select("appleseed_data, excalibur_data, archetype_title, core_pattern, top_three_talents")
                    .eq("id", profileData.last_zog_snapshot_id)
                    .single();

                const apple = (snapshotData?.appleseed_data ?? null) as
                    | FullAppleseedData
                    | null;
                const excalibur = (snapshotData?.excalibur_data ?? null) as
                    | ExcaliburData
                    | null;
                const archetypeTitle = (snapshotData?.archetype_title as
                    | string
                    | null) ?? null;
                const corePattern = (snapshotData?.core_pattern as
                    | string
                    | null) ?? null;
                const topThreeTalents = (snapshotData?.top_three_talents as
                    | string[]
                    | null) ?? null;

                if (apple) {
                    setAppleseedData(apple as unknown as AppleseedData);
                    setFullAppleseed(apple);
                } else if (archetypeTitle) {
                    // Fallback: minimal appleseed from basic snapshot fields
                    const talents = topThreeTalents || [];
                    const fallback: AppleseedData = {
                        vibrationalKey: {
                            name: archetypeTitle,
                            essence: corePattern || "",
                        },
                        bullseyeSentence: corePattern || undefined,
                        threeLenses: talents.length > 0 ? {
                            actions: talents,
                            primeDriver: "",
                            archetype: archetypeTitle,
                        } : undefined,
                    };
                    setAppleseedData(fallback);
                }
                if (excalibur) {
                    setExcaliburData(excalibur);
                }
                setCachedZogSnapshot({
                    profileId: resolvedProfileId,
                    appleseedData: apple,
                    excaliburData: excalibur,
                    archetypeTitle,
                    corePattern,
                    topThreeTalents,
                });
            } catch (err) {
                console.error("Error loading Top Talent data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Day 60 (Sasha 2026-05-03): the loading state used to short-circuit
    // the entire return with a 60vh centered "Loading…" — meaning the
    // page literally had no scrollable content for the 1–3s the snapshot
    // fetch took. New rule: render a tall scrollable scaffold during the
    // load so the user can scroll, then the real reveal lands in place.
    if (loading) {
        return (
            <GameShellV2>
                <div
                    className="max-w-3xl mx-auto px-5 py-8 lg:py-10 space-y-6"
                    aria-hidden="true"
                >
                    <div
                        className="rounded-2xl animate-pulse"
                        style={{
                            background: "rgba(255, 255, 255, 0.55)",
                            border: "0.5px solid rgba(212, 175, 55, 0.32)",
                            height: "16rem",
                        }}
                    />
                    <div
                        className="rounded-2xl animate-pulse"
                        style={{
                            background: "rgba(255, 255, 255, 0.5)",
                            border: "0.5px solid rgba(212, 175, 55, 0.28)",
                            height: "10rem",
                            opacity: 0.85,
                        }}
                    />
                    <div
                        className="rounded-2xl animate-pulse"
                        style={{
                            background: "rgba(255, 255, 255, 0.45)",
                            border: "0.5px solid rgba(212, 175, 55, 0.24)",
                            height: "12rem",
                            opacity: 0.7,
                        }}
                    />
                    <div
                        className="rounded-2xl animate-pulse"
                        style={{
                            background: "rgba(255, 255, 255, 0.4)",
                            border: "0.5px solid rgba(212, 175, 55, 0.2)",
                            height: "14rem",
                            opacity: 0.55,
                        }}
                    />
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

    return (
        <GameShellV2 hideLogo>
            <div className="max-w-2xl mx-auto px-4 py-5 sm:px-6 sm:py-7 space-y-6">

                {/* ═══ HERO — Day 58 (Sasha 2026-05-02 evening): compressed
                    to fit one viewport. Removed the dodecahedron icon
                    and moved the core_pattern paragraph OUT into its
                    own card below (smaller hero, deeper register
                    preserved). hideLogo on the shell removes the
                    rotating top-right home glyph that was crowding the
                    top of the pane. Padding tightened from p-7 sm:p-10
                    to p-6 sm:p-8 for further compression. ═══ */}
                <div
                    style={{
                        borderRadius: '24px',
                        boxShadow:
                            '0 0 40px rgba(240, 194, 127, 0.22), 0 0 80px rgba(212, 175, 55, 0.10)',
                    }}
                >
                    <article
                        ref={heroCardRef}
                        className="liquid-glass-strong rounded-3xl p-6 sm:p-8 text-center space-y-4"
                        style={{
                            border: "1px solid rgba(212, 175, 55, 0.32)",
                        }}
                    >
                        <p
                            className="text-[10px] uppercase tracking-[0.32em] font-medium"
                            style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                        >
                            My top talent is
                        </p>
                        <h1
                            className="leading-[1.1] tracking-[-0.01em]"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 600,
                                fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
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
                                    fontSize: "clamp(1rem, 2vw, 1.18rem)",
                                    color: INK_BODY,
                                }}
                            >
                                I {formatBullseye(appleseedData.bullseyeSentence)}
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

                {/* Core pattern — Day 58 (Sasha 2026-05-02 evening):
                    moved out of the hero box so the hero fits one
                    viewport. Reads as the "deeper layer" of the
                    recognition just below the artifact. */}
                {fullAppleseed?.topTalentProfile?.core_pattern && (
                    <div
                        className="liquid-glass rounded-2xl p-5 sm:p-6 max-w-2xl mx-auto"
                    >
                        <p
                            className="leading-relaxed text-center"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                fontSize: "clamp(0.95rem, 1.8vw, 1.05rem)",
                                color: INK_BODY,
                            }}
                        >
                            {flipToSecondPerson(fullAppleseed.topTalentProfile.core_pattern)}
                        </p>
                    </div>
                )}

                {/* Read Next Section — Day 58 (Sasha 2026-05-02 late):
                    moved BELOW the core-pattern card per Sasha so the
                    user finishes the recognition layer before being
                    nudged forward. Same button shape lives at the
                    bottom of every subpage too. */}
                <ReadNextSectionButton currentPath="/game/me/zone-of-genius" />

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
                        onClick={handleDownloadPdf}
                        disabled={!fullAppleseed || pdfBuilding}
                        aria-busy={pdfBuilding}
                        className="liquid-glass-strong inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-wait"
                        style={{ color: INK }}
                    >
                        {pdfBuilding ? (
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        {pdfBuilding
                            ? "Preparing your PDF…"
                            : fullAppleseed
                                ? "Download Full PDF"
                                : "Generating PDF data…"}
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
