/**
 * AssetMappingLanding — Aurora editorial register.
 *
 * Day 63 (Sasha 2026-05-07): production pass — visual layer aligned to
 * the landing-page brand (`MethodologyLandingPage.tsx` + landingDesign
 * tokens). Logic, state, taxonomy, and edge-fn calls UNCHANGED. Three
 * steps still: choice → has-ai → matched.
 *
 * Visual register pulled from:
 *   • landingDesign.tsx — GOLD_TEXT_STYLE, Ornament, META_EYEBROW_STYLE
 *   • DossierScreen.tsx — ceremonial CTA + parchment card patterns
 *   • AppleseedDisplay / ZoG ME-space — typography scale + chip styling
 */

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Brain, ListChecks, Clipboard, Check, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ASSET_TYPES } from "./data/assetTypes";
import { ASSET_SUB_TYPES } from "./data/assetSubtypes";
import { ASSET_CATEGORIES } from "./data/assetCategories";
import { ASSET_MAPPING_PROMPT } from "@/prompts";
import { saveAssets, type SavedAsset } from "./assetSync";
import { Ornament, GOLD_TEXT_STYLE } from "@/lib/landingDesign";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Step = "choice" | "has-ai" | "paste-response" | "matched";
// Day 63 (Sasha 2026-05-07) v3: extended with three new dimensions from the
// Divine-Roast prompt upgrade — `maturity` (5-value enum), `horizon` (now/
// next/later), and `isPowerNode` (top 5-7 assets). All optional for back-
// compat with pre-Day-63 AI responses; UI conditionally renders each badge
// only when present, so legacy snapshots degrade gracefully.
type AssetMaturity =
    | "monetizable_now"
    | "usable_but_needs_packaging"
    | "latent"
    | "aspirational"
    | "symbolic_only";
type AssetHorizon = "now" | "next" | "later";

type MatchedAsset = {
    typeTitle: string;
    subTypeTitle?: string;
    categoryTitle?: string;
    categoryId?: string;
    title: string;
    description?: string;
    leverageScore?: number;
    leverageReason?: string;
    maturity?: AssetMaturity;
    horizon?: AssetHorizon;
    isPowerNode?: boolean;
};

const MATURITY_VALUES: AssetMaturity[] = [
    "monetizable_now",
    "usable_but_needs_packaging",
    "latent",
    "aspirational",
    "symbolic_only",
];
const HORIZON_VALUES: AssetHorizon[] = ["now", "next", "later"];

const isMaturity = (v: unknown): v is AssetMaturity =>
    typeof v === "string" && (MATURITY_VALUES as string[]).includes(v);
const isHorizon = (v: unknown): v is AssetHorizon =>
    typeof v === "string" && (HORIZON_VALUES as string[]).includes(v);

// Map category strings to our taxonomy
const CATEGORY_MAP: Record<string, string> = {
    'expertise': 'Expertise',
    'experiences': 'Life Experiences',
    'life experiences': 'Life Experiences',
    'networks': 'Networks',
    'resources': 'Material Resources',
    'material resources': 'Material Resources',
    'ip': 'Intellectual Property',
    'intellectual property': 'Intellectual Property',
    'influence': 'Influence'
};

const normalizeText = (value?: string) => value?.trim().toLowerCase() || "";

// AI matching function — Day 63 (Sasha 2026-05-07) BUG FIX: response-shape
// alignment with the actual edge function. The edge function at
// supabase/functions/match-assets/index.ts returns rows shaped
//   { category: "Type > SubType > Title", name, description, why_value }
// but the previous client read fields like `match.type / match.subType /
// match.title / match.asset_id / match.score` — none of which exist in
// that response. Result: every AI-match call returned 'Unknown', got
// filtered out, and the function returned null — silently making the
// entire AI-matching path dead code (always falling through to the local
// regex parser). Now we parse the "Type > SubType > Title" string into
// the three taxonomy levels and map name/description/why_value correctly.
// `leverage_score` is NOT returned by the edge fn (only the local-parser
// path captures it from the user's AI response), so we leave it
// undefined here — the UI handles a missing score gracefully.
const fetchAssetMatches = async (text: string): Promise<MatchedAsset[] | null> => {
    try {
        const { data, error } = await supabase.functions.invoke("match-assets", {
            body: { text, limit: 8 },
        });
        if (error || !data?.matches) return null;

        type EdgeMatch = {
            category?: string;
            name?: string;
            description?: string;
            why_value?: string;
            // Day 63 v3 — new strategic dimensions from match-assets prompt upgrade.
            maturity?: string;
            horizon?: string;
            leverage_score?: number;
            is_power_node?: boolean;
        };
        const matches = (data.matches as EdgeMatch[])
            .map((match): MatchedAsset | null => {
                const name = match.name?.trim();
                if (!name) return null;
                // "Type > SubType > Title" → split on " > " and trim each piece.
                // "Other" is now a valid type (when AI couldn't fit a real
                // asset into the schema cleanly). Filter only on Unknown
                // (which would mean a totally malformed category string).
                const parts = (match.category ?? "")
                    .split(/\s*>\s*/)
                    .map((p) => p.trim())
                    .filter(Boolean);
                const typeTitle = parts[0] || "Unknown";
                if (typeTitle === "Unknown") return null;
                return {
                    typeTitle,
                    subTypeTitle: parts[1] || undefined,
                    categoryTitle: parts[2] || undefined,
                    title: name,
                    description: match.description?.trim() || undefined,
                    leverageReason: match.why_value?.trim() || undefined,
                    maturity: isMaturity(match.maturity) ? match.maturity : undefined,
                    horizon: isHorizon(match.horizon) ? match.horizon : undefined,
                    leverageScore:
                        typeof match.leverage_score === "number" &&
                        match.leverage_score >= 1 &&
                        match.leverage_score <= 10
                            ? Math.round(match.leverage_score)
                            : undefined,
                    isPowerNode: match.is_power_node === true,
                };
            })
            .filter((m): m is MatchedAsset => m !== null);
        return matches.length > 0 ? matches : null;
    } catch (err) {
        console.warn("[fetchAssetMatches] edge function call failed:", err);
        return null;
    }
};

// ─────────────────────────────────────────────────────────────────────
// Aurora style atoms — shared across the three step renderers below.
// Mirrors the patterns used in DossierScreen / AppleseedDisplay so the
// page reads as one family with the rest of the platform.
// ─────────────────────────────────────────────────────────────────────

// Cream + gold-glow wash. Same gradient family as `/page/:slug` published
// landing pages — sun-glare top-right, settling cream below. Renders as
// the page background since /asset-mapping is not inside GameShellV2.
const WASH_BG =
    "radial-gradient(ellipse 95% 105% at 95% 5%, rgba(255, 200, 130, 0.55) 0%, rgba(255, 218, 170, 0.45) 18%, rgba(252, 232, 200, 0.75) 38%, rgba(248, 240, 220, 0.92) 65%, rgba(245, 242, 235, 0.98) 88%)";

// Parchment card surface — cream with gold hairline + soft shadow.
// Mirrors DossierScreen / FounderDetailDrawer card backgrounds.
const parchmentCard: React.CSSProperties = {
    background: "var(--skin-card-bg, rgba(255, 255, 255, 0.68))",
    border: "0.5px solid rgba(212, 175, 55, 0.45)",
    boxShadow:
        "0 0 22px -8px rgba(212, 175, 55, 0.25), 0 16px 40px -20px rgba(10, 22, 40, 0.18)",
};

const parchmentCardSubtle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.55)",
    border: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
    boxShadow: "0 4px 16px -8px rgba(10, 22, 40, 0.10)",
};

// Editorial typography tokens — same family the rest of the platform uses.
const cormorantTitle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    letterSpacing: "-0.005em",
    color: "var(--skin-text-primary, #0b2a5a)",
};

const sourceSerifBody: React.CSSProperties = {
    fontFamily: "'Source Serif 4', serif",
    color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
};

const eyebrowSmall: React.CSSProperties = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    fontSize: "10.5px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "var(--skin-accent-gold, #b8860b)",
};

const labelMuted: React.CSSProperties = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
};

// Ceremonial primary CTA — mirrors DossierScreen "Publish" + Admin "Grant"
// buttons. Dark navy gradient + gold halo + Cormorant uppercase tracked.
const ceremonialCta: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontSize: "12.5px",
    background:
        "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.85) 50%, rgba(10,22,40,0.92) 100%))",
    color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
    border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
    boxShadow:
        "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28))",
};

// Secondary pill — gold-rimmed cream with Cormorant uppercase. Used for
// Back / Add-more / dismissive actions so the primary CTA stays the
// single ceremonial focal point.
const secondaryPill: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontSize: "11.5px",
    color: "var(--skin-text-primary, #0b2a5a)",
    background: "rgba(255, 255, 255, 0.68)",
    border: "0.5px solid rgba(212, 175, 55, 0.55)",
    boxShadow: "0 0 14px -4px rgba(212, 175, 55, 0.32)",
};

// Soft pill — neutral border, used for "Add more manually" tertiary
// option so the page hierarchy reads primary > secondary > tertiary.
const tertiaryPill: React.CSSProperties = {
    ...secondaryPill,
    background: "rgba(255, 255, 255, 0.55)",
    border: "0.5px solid var(--skin-rule-medium, rgba(26, 30, 58, 0.15))",
    boxShadow: "none",
    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
};

const AssetMappingLanding = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnPath = searchParams.get("return") || "/game/me";

    const [step, setStep] = useState<Step>("choice");
    const [aiResponse, setAiResponse] = useState("");
    const [copied, setCopied] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const [matchedAssets, setMatchedAssets] = useState<MatchedAsset[]>([]);
    const { toast } = useToast();

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(ASSET_MAPPING_PROMPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGoToWizard = () => {
        navigate(`/asset-mapping/wizard?from=game&return=${encodeURIComponent(returnPath)}`);
    };

    const handleSaveAssets = async () => {
        if (matchedAssets.length === 0) return;
        setIsSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({ title: "Please sign in", variant: "destructive" });
                return;
            }

            // Map matched assets to SavedAsset shape
            const toSave: SavedAsset[] = [];
            let skippedCount = 0;

            for (const asset of matchedAssets) {
                const type = ASSET_TYPES.find(
                    (item) => normalizeText(item.title) === normalizeText(asset.typeTitle)
                );
                if (!type) {
                    skippedCount += 1;
                    continue;
                }

                const subType = asset.subTypeTitle
                    ? ASSET_SUB_TYPES.find(
                        (item) => normalizeText(item.title) === normalizeText(asset.subTypeTitle)
                    )
                    : ASSET_SUB_TYPES.find((item) => item.typeId === type.id);

                const category = asset.categoryTitle
                    ? ASSET_CATEGORIES.find(
                        (item) => normalizeText(item.title) === normalizeText(asset.categoryTitle)
                    )
                    : subType
                        ? ASSET_CATEGORIES.find((item) => item.subTypeId === subType.id)
                        : undefined;

                const title = asset.title.trim();
                if (!title) {
                    skippedCount += 1;
                    continue;
                }

                toSave.push({
                    typeId: type.id,
                    subTypeId: subType?.id,
                    categoryId: category?.id,
                    title,
                    description: asset.description?.trim() || undefined,
                    savedAt: new Date().toISOString(),
                    source: "ai",
                });
            }

            // Save via sync layer (localStorage + DB)
            const result = await saveAssets(user.id, toSave);

            setHasSaved(true);
            const totalSkipped = skippedCount + result.skipped;
            toast({
                title: "Assets saved",
                description: `Saved ${result.saved} assets${totalSkipped ? `, skipped ${totalSkipped}` : ""}.`,
            });
        } catch (err) {
            toast({ title: "Something went wrong", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    // Parse response and extract assets - tries AI matching first, then falls back to parsing
    // UNCHANGED from prior version.
    const handleMatchAssets = async () => {
        setIsMatching(true);

        const aiMatches = await fetchAssetMatches(aiResponse);
        if (aiMatches && aiMatches.length > 0) {
            setIsMatching(false);
            setMatchedAssets(aiMatches);
            setStep("matched");
            return;
        }

        const extracted: MatchedAsset[] = [];

        try {
            const jsonMatch = aiResponse.match(/\[\s*\{[\s\S]*?\}\s*\]/);

            if (jsonMatch) {
                const assets = JSON.parse(jsonMatch[0]);
                for (const asset of assets) {
                    const rawType = (asset.type || '').trim();
                    const typeTitle = CATEGORY_MAP[rawType.toLowerCase()] || rawType || 'Unknown';
                    const subTypeTitle = (asset.subtype || asset.subcategory || '').trim() || undefined;
                    const categoryTitle = (asset.category || '').trim() || undefined;
                    const name = asset.name || asset.asset || asset.title || 'Unnamed Asset';

                    extracted.push({
                        typeTitle,
                        subTypeTitle,
                        categoryTitle,
                        title: name,
                        description: asset.description || asset.details || asset.summary || undefined,
                        leverageScore: asset.leverage_score || asset.leverageScore || undefined,
                        leverageReason: asset.leverage_reason || asset.leverageReason || undefined,
                        // Day 63 v3 — new strategic dimensions from prompt upgrade.
                        // Pre-Day-63 AI outputs won't carry these; absence falls
                        // through to undefined and the UI degrades gracefully.
                        maturity: isMaturity(asset.maturity) ? asset.maturity : undefined,
                        horizon: isHorizon(asset.horizon) ? asset.horizon : undefined,
                        isPowerNode: asset.is_power_node === true || asset.isPowerNode === true,
                    });
                }
            } else {
                const assetBlocks = aiResponse.split(/(?=\*\s*\*\*Category:\*\*|\n\d+\)\s*\*\*Category:\*\*)/);

                for (const block of assetBlocks) {
                    if (!block.trim()) continue;
                    const categoryMatch = block.match(/\*\*Category:\*\*\s*([^\n*]+)/i);
                    const assetMatch = block.match(/\*\*(?:Asset|Name|Title):\*\*\s*([^\n]+)/i);
                    const descMatch = block.match(/\*\*(?:Description|Details|Summary):\*\*\s*([^\n]+)/i);
                    const valueMatch = block.match(/\*\*Why it'?s valuable:?\*\*\s*([^\n]+)/i);

                    if (assetMatch) {
                        let typeTitle = 'Unknown';
                        if (categoryMatch) {
                            const rawCat = categoryMatch[1].trim().toLowerCase();
                            typeTitle = CATEGORY_MAP[rawCat] || categoryMatch[1].trim();
                        }
                        extracted.push({
                            typeTitle,
                            title: assetMatch[1].trim(),
                            description: descMatch ? descMatch[1].trim() : undefined,
                            leverageReason: valueMatch ? valueMatch[1].trim() : undefined,
                        });
                    }
                }

                if (extracted.length === 0) {
                    const sections = aiResponse.split(/(?=##\s*\d+\)\s*)/);

                    for (const section of sections) {
                        const sectionHeader = section.match(/##\s*\d+\)\s*(\w+)/);
                        if (!sectionHeader) continue;

                        const rawCat = sectionHeader[1].toLowerCase();
                        const typeTitle = CATEGORY_MAP[rawCat] || sectionHeader[1];

                        const items = section.split(/(?=\*\s+\*\*)/);

                        for (const item of items) {
                            const assetMatch = item.match(/\*\*(?:Asset|Name|Title):\*\*\s*([^\n]+)/i);
                            const descMatch = item.match(/\*\*(?:Description|Details|Summary):\*\*\s*([^\n]+)/i);
                            const valueMatch = item.match(/\*\*Why it'?s valuable:?\*\*\s*([^\n]+)/i);

                            if (assetMatch) {
                                extracted.push({
                                    typeTitle,
                                    title: assetMatch[1].trim(),
                                    description: descMatch ? descMatch[1].trim() : undefined,
                                    leverageReason: valueMatch ? valueMatch[1].trim() : undefined,
                                });
                            }
                        }
                    }
                }
            }
        } catch (e) {
            // Local parser failures are non-fatal — we fall through to the
            // sort+slice below and the user just sees an empty matched list.
            // Logged so debugging in prod doesn't have to guess what happened.
            console.warn("[handleMatchAssets] local parser threw:", e);
        }

        setIsMatching(false);
        const sorted = extracted.sort((a, b) => (b.leverageScore || 0) - (a.leverageScore || 0));
        setMatchedAssets(sorted.slice(0, 50));
        setStep("matched");
    };

    return (
        // Day 63 (Sasha 2026-05-07): wrapper no longer paints WASH_BG —
        // the GameShellV2 wrap (in App.tsx) provides the cream wash.
        // Painting it here too created a double-wash slightly off-color
        // from the shell's gradient. Inner content unchanged.
        <div className="px-5 py-10 sm:py-12">
            <div className="max-w-2xl mx-auto">
                {/* ═══════ HEADER — Cormorant + ornament + italic echo ═══════ */}
                {/* Day 63 (Sasha 2026-05-07): replaced Boxes circular medallion
                    + plain font-display H1 with the canonical Aurora editorial
                    hero treatment used on `/` MethodologyLandingPage. Same
                    register: Cormorant Garamond bold with deep halo, italic
                    echo subtitle, gold-rule Ornament divider. Headline copy
                    held verbatim per Sasha's directive — visual layer changes
                    only. */}
                <header className="text-center">
                    <h1
                        className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.018em] mb-3 sm:mb-4"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "var(--skin-text-primary, #0a1628)",
                            textShadow:
                                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
                        }}
                    >
                        Asset{" "}
                        <span
                            className="bg-clip-text text-transparent"
                            style={GOLD_TEXT_STYLE}
                        >
                            Mapping
                        </span>
                    </h1>
                    <p
                        className="text-lg sm:text-xl md:text-2xl leading-[1.32] italic"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 700,
                            letterSpacing: "0.01em",
                            color: "var(--skin-text-primary, #0a1628)",
                            textShadow:
                                "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
                        }}
                    >
                        Map your resources for collaboration
                    </p>
                    <Ornament className="my-6 sm:my-7" />
                </header>

                {/* ═══════ Step: Choice ═══════ */}
                {step === "choice" && (
                    <div className="space-y-5">
                        <p
                            className="text-center"
                            style={{
                                ...sourceSerifBody,
                                fontStyle: "italic",
                                fontSize: "16px",
                                lineHeight: 1.55,
                            }}
                        >
                            How would you like to map your assets?
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <button
                                onClick={() => setStep("has-ai")}
                                className="rounded-2xl px-5 py-6 text-left transition-all duration-200 hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/50"
                                style={parchmentCard}
                            >
                                <div
                                    style={eyebrowSmall}
                                    className="mb-2.5"
                                >
                                    <Brain className="w-3.5 h-3.5 inline-block mr-1.5 align-[-2px]" />
                                    AI extract
                                </div>
                                <h3
                                    style={{ ...cormorantTitle, fontSize: "20px" }}
                                    className="mb-1.5"
                                >
                                    Use AI to extract
                                </h3>
                                <p
                                    style={{
                                        ...sourceSerifBody,
                                        fontStyle: "italic",
                                        fontSize: "14px",
                                        lineHeight: 1.5,
                                        color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                                    }}
                                >
                                    Paste an AI's read of your assets and we'll match them to the taxonomy.
                                </p>
                            </button>

                            <button
                                onClick={handleGoToWizard}
                                className="rounded-2xl px-5 py-6 text-left transition-all duration-200 hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/50"
                                style={parchmentCard}
                            >
                                <div
                                    style={eyebrowSmall}
                                    className="mb-2.5"
                                >
                                    <ListChecks className="w-3.5 h-3.5 inline-block mr-1.5 align-[-2px]" />
                                    Manual
                                </div>
                                <h3
                                    style={{ ...cormorantTitle, fontSize: "20px" }}
                                    className="mb-1.5"
                                >
                                    Add manually
                                </h3>
                                <p
                                    style={{
                                        ...sourceSerifBody,
                                        fontStyle: "italic",
                                        fontSize: "14px",
                                        lineHeight: 1.5,
                                        color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                                    }}
                                >
                                    Walk the categories and add each asset one at a time.
                                </p>
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════ Step: Has AI ═══════ */}
                {step === "has-ai" && (
                    <div className="space-y-6">
                        {/* Prompt block — parchment card with editorial eyebrow */}
                        <div
                            className="rounded-2xl px-5 py-5"
                            style={parchmentCard}
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <div style={eyebrowSmall} className="mb-1">
                                        Prompt for your AI
                                    </div>
                                    <p
                                        className="italic"
                                        style={{
                                            ...sourceSerifBody,
                                            fontStyle: "italic",
                                            fontSize: "13px",
                                            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                                        }}
                                    >
                                        Copy this and ask the AI you talk to most.
                                    </p>
                                </div>
                                <button
                                    onClick={handleCopyPrompt}
                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200 hover:translate-y-[-0.5px]"
                                    style={tertiaryPill}
                                >
                                    {copied ? (
                                        <Check className="w-3.5 h-3.5" />
                                    ) : (
                                        <Clipboard className="w-3.5 h-3.5" />
                                    )}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                            <pre
                                className="whitespace-pre-wrap rounded-lg px-3 py-3 max-h-32 overflow-y-auto"
                                style={{
                                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                                    fontSize: "11.5px",
                                    lineHeight: 1.55,
                                    background: "rgba(255, 252, 245, 0.85)",
                                    color: "var(--skin-text-primary, #0b2a5a)",
                                    border: "0.5px solid rgba(212, 175, 55, 0.20)",
                                }}
                            >
                                {ASSET_MAPPING_PROMPT}
                            </pre>
                        </div>

                        {/* Textarea — editorial input */}
                        <div className="space-y-2">
                            <label style={labelMuted}>
                                Paste the AI's response
                            </label>
                            <Textarea
                                value={aiResponse}
                                onChange={(e) => setAiResponse(e.target.value)}
                                placeholder="Paste the AI's list of your assets…"
                                className="min-h-[200px]"
                                style={{
                                    fontFamily: "'Source Serif 4', serif",
                                    fontSize: "14.5px",
                                    lineHeight: 1.55,
                                    color: "var(--skin-text-primary, #0b2a5a)",
                                    background: "rgba(255, 255, 255, 0.85)",
                                    border: "0.5px solid var(--skin-rule-medium, rgba(26, 30, 58, 0.15))",
                                }}
                            />
                        </div>

                        {/* Action row — Back + Extract (ceremonial) */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <button
                                onClick={() => setStep("choice")}
                                className="inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                                style={tertiaryPill}
                            >
                                <span aria-hidden="true">←</span>
                                Back
                            </button>
                            <button
                                onClick={handleMatchAssets}
                                disabled={!aiResponse.trim() || isMatching}
                                className="group relative inline-flex items-center gap-2.5 rounded-full px-6 py-3 transition-all duration-300 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
                                style={{
                                    ...ceremonialCta,
                                    backdropFilter: "blur(14px) saturate(160%)",
                                    WebkitBackdropFilter: "blur(14px) saturate(160%)",
                                }}
                            >
                                {isMatching ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <span aria-hidden="true" style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))", fontSize: "16px" }}>✦</span>
                                )}
                                <span>{isMatching ? "Matching…" : "Extract Assets"}</span>
                                {!isMatching && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="text-center pt-1">
                            <button
                                onClick={handleGoToWizard}
                                className="italic transition-colors duration-200 hover:opacity-80"
                                style={{
                                    fontFamily: "'Source Serif 4', serif",
                                    fontSize: "13px",
                                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                                    textDecoration: "underline",
                                    textUnderlineOffset: "3px",
                                }}
                            >
                                Or add assets manually →
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════ Step: Matched ═══════ */}
                {step === "matched" && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2
                                style={{ ...cormorantTitle, fontSize: "26px", fontWeight: 600 }}
                                className="leading-[1.2] mb-2"
                            >
                                {matchedAssets.length > 0 ? `Found ${matchedAssets.length} assets` : "No exact matches"}
                            </h2>
                            <p
                                className="italic"
                                style={{
                                    ...sourceSerifBody,
                                    fontStyle: "italic",
                                    fontSize: "15px",
                                    lineHeight: 1.5,
                                }}
                            >
                                {matchedAssets.length > 0
                                    ? "Review and save these to your profile."
                                    : "Try adding assets manually using the wizard."}
                            </p>
                        </div>

                        {matchedAssets.length > 0 && (
                            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                                {matchedAssets.map((asset, i) => (
                                    <div
                                        key={i}
                                        className="rounded-xl px-4 py-3.5"
                                        style={
                                            // Day 63 v3: power nodes (top 5-7 by AI's
                                            // Divine-Roast rubric) get the parchment-strong
                                            // surface — gold hairline + soft halo —
                                            // visually separating them from the supporting
                                            // material below. Symbolic-only items get a
                                            // dimmer treatment so they're honestly
                                            // de-emphasized without being hidden.
                                            asset.isPowerNode
                                                ? {
                                                    background: "var(--skin-card-bg, rgba(255, 255, 255, 0.72))",
                                                    border: "0.5px solid rgba(212, 175, 55, 0.55)",
                                                    boxShadow:
                                                        "0 0 18px -6px rgba(212, 175, 55, 0.35), 0 12px 32px -16px rgba(10, 22, 40, 0.18)",
                                                }
                                                : asset.maturity === "symbolic_only"
                                                ? {
                                                    background: "rgba(255, 255, 255, 0.30)",
                                                    border: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.06))",
                                                    boxShadow: "none",
                                                    opacity: 0.78,
                                                }
                                                : parchmentCardSubtle
                                        }
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex flex-wrap items-baseline gap-1.5">
                                                {asset.isPowerNode && (
                                                    <span
                                                        title="Power node — one of the top 5-7 assets that hold most of the leverage"
                                                        style={{
                                                            fontFamily: "'Cormorant Garamond', serif",
                                                            fontWeight: 600,
                                                            letterSpacing: "0.16em",
                                                            textTransform: "uppercase",
                                                            fontSize: "9.5px",
                                                            color: "var(--skin-goldDeep, #5d4307)",
                                                            background:
                                                                "linear-gradient(135deg, rgba(244,212,114,0.30) 0%, rgba(212,175,55,0.18) 100%)",
                                                            border: "0.5px solid rgba(212, 175, 55, 0.65)",
                                                            padding: "1px 7px",
                                                            borderRadius: "999px",
                                                            textShadow: "0 0 8px rgba(244, 212, 114, 0.40)",
                                                        }}
                                                    >
                                                        ✦ Power node
                                                    </span>
                                                )}
                                                <span
                                                    style={{
                                                        ...labelMuted,
                                                        background: "rgba(212, 175, 55, 0.10)",
                                                        border: "0.5px solid rgba(212, 175, 55, 0.30)",
                                                        color: "var(--skin-goldDeep, #5d4307)",
                                                        padding: "1px 8px",
                                                        borderRadius: "999px",
                                                    }}
                                                >
                                                    {asset.typeTitle}
                                                </span>
                                                {asset.subTypeTitle && (
                                                    <span
                                                        style={{
                                                            fontFamily: "'Source Serif 4', serif",
                                                            fontStyle: "italic",
                                                            fontSize: "12px",
                                                            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                                                        }}
                                                    >
                                                        → {asset.subTypeTitle}
                                                    </span>
                                                )}
                                                {asset.categoryTitle && (
                                                    <span
                                                        style={{
                                                            fontFamily: "'Source Serif 4', serif",
                                                            fontStyle: "italic",
                                                            fontSize: "12px",
                                                            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                                                        }}
                                                    >
                                                        → {asset.categoryTitle}
                                                    </span>
                                                )}
                                            </div>
                                            {asset.leverageScore !== undefined && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span
                                                                style={{
                                                                    fontFamily: "'DM Sans', system-ui, sans-serif",
                                                                    fontSize: "11px",
                                                                    fontWeight: 500,
                                                                    fontVariantNumeric: "tabular-nums lining-nums",
                                                                    padding: "1px 8px",
                                                                    borderRadius: "999px",
                                                                    cursor: "help",
                                                                    border: "0.5px solid",
                                                                    ...(asset.leverageScore >= 8
                                                                        ? {
                                                                            color: "rgba(20, 130, 70, 0.95)",
                                                                            background: "rgba(20, 130, 70, 0.08)",
                                                                            borderColor: "rgba(20, 130, 70, 0.35)",
                                                                        }
                                                                        : asset.leverageScore >= 5
                                                                            ? {
                                                                                color: "var(--skin-goldDeep, #5d4307)",
                                                                                background: "rgba(212, 175, 55, 0.10)",
                                                                                borderColor: "rgba(212, 175, 55, 0.40)",
                                                                            }
                                                                            : {
                                                                                color: "rgba(184, 92, 11, 0.95)",
                                                                                background: "rgba(184, 92, 11, 0.08)",
                                                                                borderColor: "rgba(184, 92, 11, 0.35)",
                                                                            }),
                                                                }}
                                                            >
                                                                ✦ {asset.leverageScore}/10
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left" className="max-w-[220px]">
                                                            <p className="text-xs"><strong>Asset Strength</strong><br />How developed and leveraged this asset currently is (1-10).</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                        <p
                                            style={{
                                                ...cormorantTitle,
                                                fontSize: "17px",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {asset.title}
                                        </p>
                                        {asset.description && (
                                            <p
                                                className="mt-1"
                                                style={{
                                                    ...sourceSerifBody,
                                                    fontSize: "13.5px",
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {asset.description}
                                            </p>
                                        )}
                                        {asset.leverageReason && (
                                            <p
                                                className="mt-2 italic"
                                                style={{
                                                    fontFamily: "'Source Serif 4', serif",
                                                    fontStyle: "italic",
                                                    fontSize: "12.5px",
                                                    lineHeight: 1.5,
                                                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                                                }}
                                            >
                                                {asset.leverageReason}
                                            </p>
                                        )}
                                        {/* Day 63 v3: maturity + horizon footer
                                            chips. Surfaces the strategic
                                            dimensions the Divine Roast called
                                            out as missing. Renders only when
                                            the AI returned them — pre-Day-63
                                            data degrades gracefully (no chips). */}
                                        {(asset.maturity || asset.horizon) && (
                                            <div className="flex flex-wrap items-baseline gap-1.5 mt-2.5">
                                                {asset.maturity && (
                                                    <MaturityBadge maturity={asset.maturity} />
                                                )}
                                                {asset.horizon && (
                                                    <HorizonBadge horizon={asset.horizon} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <button
                                onClick={() => setStep("has-ai")}
                                className="inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                                style={tertiaryPill}
                            >
                                <span aria-hidden="true">←</span>
                                Back
                            </button>
                            {matchedAssets.length > 0 && (
                                hasSaved ? (
                                    <button
                                        onClick={() => navigate(returnPath)}
                                        className="group relative inline-flex flex-1 items-center justify-center gap-2.5 rounded-full px-6 py-3 transition-all duration-300 hover:translate-y-[-1px]"
                                        style={{
                                            ...ceremonialCta,
                                            backdropFilter: "blur(14px) saturate(160%)",
                                            WebkitBackdropFilter: "blur(14px) saturate(160%)",
                                        }}
                                    >
                                        <span aria-hidden="true" style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))", fontSize: "16px" }}>✦</span>
                                        <span>Return to Profile</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSaveAssets}
                                        disabled={isSaving}
                                        className="group relative inline-flex flex-1 items-center justify-center gap-2.5 rounded-full px-6 py-3 transition-all duration-300 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
                                        style={{
                                            ...ceremonialCta,
                                            backdropFilter: "blur(14px) saturate(160%)",
                                            WebkitBackdropFilter: "blur(14px) saturate(160%)",
                                        }}
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <span aria-hidden="true" style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))", fontSize: "16px" }}>✦</span>
                                        )}
                                        <span>{isSaving ? "Saving…" : "Save to Profile"}</span>
                                    </button>
                                )
                            )}
                            <button
                                onClick={handleGoToWizard}
                                className="italic transition-colors duration-200 hover:opacity-80"
                                style={{
                                    fontFamily: "'Source Serif 4', serif",
                                    fontSize: "13px",
                                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                                    textDecoration: "underline",
                                    textUnderlineOffset: "3px",
                                }}
                            >
                                Add more manually →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetMappingLanding;
