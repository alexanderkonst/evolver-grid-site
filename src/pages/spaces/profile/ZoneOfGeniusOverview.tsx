import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Zap, Target, Quote, TrendingUp, Download, Link as LinkIcon, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { generateZogPdf } from "@/modules/zone-of-genius/generateZogPdf";
import { generateRevealSlug } from "@/modules/zone-of-genius/shareSlug";
import { toast } from "@/hooks/use-toast";
import type { AppleseedData as FullAppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import type { ExcaliburData } from "@/modules/zone-of-genius/excaliburGenerator";

interface AppleseedData {
    vibrationalKey?: {
        name: string;
        essence: string;
    };
    bullseyeSentence?: string;
    threeLenses?: {
        actions: string[];
        primeDriver: string;
        archetype: string;
    };
    masteryStages?: Array<{
        stage: number;
        name: string;
        description: string;
    }>;
    monetizationAvenues?: string[];
}

/**
 * ZoneOfGeniusOverview - Shows the saved Top Talent data
 */
const ZoneOfGeniusOverview = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [appleseedData, setAppleseedData] = useState<AppleseedData | null>(null);
    const [fullAppleseed, setFullAppleseed] = useState<FullAppleseedData | null>(null);
    const [excaliburData, setExcaliburData] = useState<ExcaliburData | null>(null);
    const [profileId, setProfileId] = useState<string | null>(null);
    // Day 52 (Sasha 2026-04-26): public-share state.
    const [snapshotId, setSnapshotId] = useState<string | null>(null);
    const [shareSlug, setShareSlug] = useState<string | null>(null);
    const [generatingSlug, setGeneratingSlug] = useState(false);
    const [copiedShare, setCopiedShare] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const resolvedProfileId = await getOrCreateGameProfileId();
                if (!resolvedProfileId) {
                    setLoading(false);
                    return;
                }
                setProfileId(resolvedProfileId);

                // Get the profile to find the zog snapshot ID
                const { data: profileData } = await supabase
                    .from("game_profiles")
                    .select("last_zog_snapshot_id")
                    .eq("id", resolvedProfileId)
                    .single();

                if (!profileData?.last_zog_snapshot_id) {
                    setLoading(false);
                    return;
                }

                // Load appleseed_data AND basic snapshot fields from zog_snapshots.
                // Day 52 (Sasha 2026-04-26): also pull share_slug for the
                // public-reveal link UI below the hero.
                setSnapshotId(profileData.last_zog_snapshot_id);
                const { data: snapshotData } = await supabase
                    .from("zog_snapshots")
                    .select("appleseed_data, excalibur_data, archetype_title, core_pattern, top_three_talents, share_slug")
                    .eq("id", profileData.last_zog_snapshot_id)
                    .single();
                if ((snapshotData as any)?.share_slug) {
                    setShareSlug((snapshotData as any).share_slug as string);
                }

                if (snapshotData?.appleseed_data) {
                    console.log("[ZoGOverview] Loaded appleseed_data:", snapshotData.appleseed_data);
                    setAppleseedData(snapshotData.appleseed_data as unknown as AppleseedData);
                    setFullAppleseed(snapshotData.appleseed_data as unknown as FullAppleseedData);
                } else if (snapshotData?.archetype_title) {
                    // Fallback: construct minimal appleseed from basic snapshot fields
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

    /**
     * Day 52 (Sasha 2026-04-26): on-demand slug backfill. Snapshots
     * created before the share-slug column was added (or any row that
     * somehow missed it) get a slug the first time the user clicks
     * "Generate share link." Uniqueness is enforced by the unique index;
     * if we collide we retry once with a fresh slug.
     */
    const ensureShareSlug = async () => {
        if (shareSlug || !snapshotId) return shareSlug;
        setGeneratingSlug(true);
        try {
            for (let attempt = 0; attempt < 2; attempt++) {
                const candidate = generateRevealSlug();
                const { error } = await (supabase as any)
                    .from("zog_snapshots")
                    .update({ share_slug: candidate })
                    .eq("id", snapshotId);
                if (!error) {
                    setShareSlug(candidate);
                    return candidate;
                }
                // 23505 = unique violation; retry once with a different slug
                if (!String(error.code || "").includes("23505") && !String(error.message || "").match(/duplicate key/i)) {
                    throw error;
                }
            }
            toast({ title: "Couldn't create share link", description: "Please try again.", variant: "destructive" });
            return null;
        } catch (e) {
            console.error("[ZoG] ensureShareSlug failed:", e);
            toast({ title: "Couldn't create share link", description: "Please try again.", variant: "destructive" });
            return null;
        } finally {
            setGeneratingSlug(false);
        }
    };

    const onCopyShareUrl = async () => {
        const slug = shareSlug ?? (await ensureShareSlug());
        if (!slug) return;
        const url = `${window.location.origin}/reveal/${slug}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedShare(true);
            setTimeout(() => setCopiedShare(false), 1800);
            toast({ title: "Share link copied", description: url });
        } catch {
            toast({ title: "Copy failed", description: "Select and copy manually.", variant: "destructive" });
        }
    };

    const shareUrl = shareSlug ? `${window.location.origin}/reveal/${shareSlug}` : null;

    const subPages = [
        { id: "archetype", label: "My Archetype", icon: Star, path: "/game/me/zone-of-genius/archetype", description: "Your unique genius type" },
        { id: "talents", label: "Top Talents", icon: Zap, path: "/game/me/zone-of-genius/talents", description: "Your natural strengths" },
        { id: "driver", label: "Prime Driver", icon: Target, path: "/game/me/zone-of-genius/driver", description: "What fuels you" },
        { id: "action", label: "Action Statement", icon: Quote, path: "/game/me/zone-of-genius/action", description: "Your core expression" },
    ];

    if (loading) {
        return (
            <GameShellV2>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-pulse text-[#a4a3d0]">Loading...</div>
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
                    <h1 className="text-2xl font-bold text-[#2c3150] mb-2">Discover Your Top Talent</h1>
                    <p className="text-[#a4a3d0] mb-6">
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

    return (
        <GameShellV2>
            <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
                {/* Hero - Updated to match RevelatoryHero styling */}
                <div className="text-center py-8 bg-gradient-to-br from-[#c8b7d8] via-[#d4d1e8] to-[#e7e9f5] rounded-2xl">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full overflow-hidden mb-4">
                        <img src="/dodecahedron.png" alt="Top Talent" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-[#8460ea] uppercase tracking-widest mb-2">My Genius Is To Be A</p>
                    <h1 className="text-3xl font-display font-bold text-[#2c3150] mb-3">
                        {appleseedData.vibrationalKey.name}
                    </h1>
                    {appleseedData.bullseyeSentence && (
                        <p className="text-[#2c3150]/80 max-w-md mx-auto px-4">
                            I {appleseedData.bullseyeSentence}
                        </p>
                    )}
                </div>

                {/* Download PDF */}
                <div className="flex justify-center">
                    <button
                        onClick={() => {
                            if (fullAppleseed) {
                                generateZogPdf(fullAppleseed, excaliburData);
                            } else {
                                // Trigger Appleseed generation then download
                                alert("Full PDF data is being generated. Please wait a moment and try again.");
                                // For now, navigate to the assessment to trigger generation
                            }
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full transition-all shadow-md hover:shadow-lg"
                        style={{ backgroundColor: 'hsl(210, 70%, 15%)', color: 'white' }}
                    >
                        <Download className="w-4 h-4" />
                        {fullAppleseed ? 'Download Full PDF' : 'Generate & Download PDF'}
                    </button>
                </div>

                {/* Day 52 (Sasha 2026-04-26): public share link.
                    Renders as a soft card that either shows the live URL
                    (slug already exists) or a "Generate share link" button
                    that lazy-backfills the slug column for snapshots that
                    pre-date the public-reveal feature. URL is the canonical
                    shareable artifact; PDF is a derivative. */}
                {fullAppleseed && (
                    <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20 space-y-3">
                        <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-[#8460ea]" />
                            <p className="text-xs text-[#8460ea] uppercase tracking-wide font-medium">
                                Public reveal link
                            </p>
                        </div>
                        {shareUrl ? (
                            <>
                                <div className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-md border border-[#a4a3d0]/30 text-sm font-mono text-[#2c3150] truncate">
                                    {shareUrl}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={onCopyShareUrl}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[#8460ea]/10 text-[#8460ea] hover:bg-[#8460ea]/20 transition-colors"
                                    >
                                        {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copiedShare ? "Copied" : "Copy link"}
                                    </button>
                                    <a
                                        href={shareUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full text-[#a4a3d0] hover:text-[#8460ea] hover:bg-[#8460ea]/5 transition-colors"
                                    >
                                        Open ↗
                                    </a>
                                </div>
                                <p className="text-[11px] text-[#a4a3d0] leading-relaxed">
                                    Anyone with this link sees your archetype, bullseye,
                                    and the path of mastery — your raw inputs and ratings stay private.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-xs text-[#a4a3d0]">
                                    Generate a share link to send your Top Talent reveal as a public page.
                                </p>
                                <button
                                    onClick={onCopyShareUrl}
                                    disabled={generatingSlug}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[#8460ea]/10 text-[#8460ea] hover:bg-[#8460ea]/20 disabled:opacity-50 transition-colors"
                                >
                                    <LinkIcon className="w-3.5 h-3.5" />
                                    {generatingSlug ? "Generating…" : "Generate &amp; copy link"}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Three Lenses Summary */}
                {appleseedData.threeLenses && (
                    <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20 space-y-3">
                        <div>
                            <p className="text-xs text-[#8460ea] uppercase tracking-wide">My Top Talents</p>
                            <p className="text-[#2c3150] font-medium">{appleseedData.threeLenses.actions.join(" • ")}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#8460ea] uppercase tracking-wide">My Prime Driver</p>
                            <p className="text-[#2c3150] font-medium">{appleseedData.threeLenses.primeDriver}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#8460ea] uppercase tracking-wide">My Archetype</p>
                            <p className="text-[#2c3150] font-medium">{appleseedData.threeLenses.archetype}</p>
                        </div>
                    </div>
                )}

                {/* Mastery Stages */}
                {appleseedData.masteryStages && appleseedData.masteryStages.length > 0 && (
                    <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-[#8460ea]" />
                            <p className="text-xs text-[#8460ea] uppercase tracking-wide font-medium">Mastery Stages</p>
                        </div>
                        <div className="space-y-2">
                            {appleseedData.masteryStages.map((stage, index) => (
                                <div key={stage.stage || index} className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8460ea]/10 text-[#8460ea] text-xs font-medium flex items-center justify-center">
                                        {stage.stage || index + 1}
                                    </div>
                                    <div>
                                        <p className="text-[#2c3150] font-medium text-sm">{stage.name}</p>
                                        <p className="text-[#a4a3d0] text-xs">{stage.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Monetization Avenues */}
                {appleseedData.monetizationAvenues && appleseedData.monetizationAvenues.length > 0 && (
                    <div className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20">
                        <p className="text-xs text-[#8460ea] uppercase tracking-wide mb-2">Monetization Pathways</p>
                        <div className="flex flex-wrap gap-2">
                            {appleseedData.monetizationAvenues.map((avenue, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-[#8460ea]/10 text-[#8460ea] text-sm rounded-full"
                                >
                                    {avenue}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation to sub-pages */}
                <div className="grid grid-cols-2 gap-3">
                    {subPages.map((page) => (
                        <button
                            key={page.id}
                            onClick={() => navigate(page.path)}
                            className="p-4 bg-white/60 rounded-xl border border-[#a4a3d0]/20 hover:border-[#8460ea]/40 hover:bg-white/80 transition-all text-left group"
                        >
                            <page.icon className="w-5 h-5 text-[#8460ea] mb-2" />
                            <p className="font-medium text-[#2c3150] group-hover:text-[#8460ea] transition-colors">
                                {page.label}
                            </p>
                            <p className="text-xs text-[#a4a3d0]">{page.description}</p>
                        </button>
                    ))}
                </div>

                {/* Create Genius Business CTA */}
                <div className="text-center p-4 bg-gradient-to-br from-white via-[#f5f5ff] to-[#ebe8f7] rounded-xl border border-[#a4a3d0]/20">
                    <p className="text-sm text-[#a4a3d0] mb-3">Ready to turn your genius into a business?</p>
                    <Button
                        variant="wabi-primary"
                        onClick={() => navigate("/game/me/genius-business")}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Build My Unique Business
                    </Button>
                </div>

                {/* Day 51 night (Sasha): standalone Share strip retired —
                    Save + Share now live in-card via CardActions inside
                    RevelatoryHero. */}
            </div>
        </GameShellV2>
    );
};

export default ZoneOfGeniusOverview;
