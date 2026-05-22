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
// Funnel v2 (Day 77, Sasha 2026-05-20): match-path conditional CTAs on
// the post-save "matched" state — the unlock moment for collaboration
// matches. Returns null for build-path users.
import MatchFlowCta from "@/components/landing/MatchFlowCta";

type Step = "choice" | "has-ai" | "paste-response" | "matched";

// Day 65 evening (Sasha 2026-05-09) v5 lean schema. The asset map now
// carries exactly the fields that earn their place: taxonomy breadcrumb
// + description + maturity. The old v3/v4 dimensions (horizon, nature,
// leverage_score, leverage_reason, is_power_node, is_offer, expresses_root,
// AI-generated name) were all retired — see assetMappingPrompt.ts header
// changelog for the rationale.
type AssetMaturity =
    | "monetizable_now"
    | "usable_but_needs_packaging"
    | "latent"
    | "aspirational"
    | "symbolic_only";

type MatchedAsset = {
    typeTitle: string;
    subTypeTitle?: string;
    categoryTitle?: string;
    categoryId?: string;
    // Title is derived client-side from the first sentence of the
    // description when the asset is saved — the v5 prompt no longer
    // asks the AI to invent a name. May be empty in the fetched
    // shape; `handleSaveAssets` derives a usable title at save time.
    title: string;
    description?: string;
    maturity?: AssetMaturity;
};

const MATURITY_VALUES: AssetMaturity[] = [
    "monetizable_now",
    "usable_but_needs_packaging",
    "latent",
    "aspirational",
    "symbolic_only",
];

const isMaturity = (v: unknown): v is AssetMaturity =>
    typeof v === "string" && (MATURITY_VALUES as string[]).includes(v);

// Derive a clean asset title from the description's first sentence,
// capped at 80 characters. The v5 prompt no longer asks the AI for
// a name (AI-generated names like "burning conversion" obscured more
// than they clarified); descriptions carry the actual semantic load,
// and the saved-asset row still needs a short readable headline to
// identify it by — so we extract it here at save time.
const deriveTitleFromDescription = (
    desc: string | undefined,
    fallback: string | undefined,
): string => {
    const cleanDesc = desc?.trim();
    if (cleanDesc) {
        // Split on sentence terminator followed by whitespace, or on
        // an em-dash flanked by spaces (often used as a sentence break
        // in the user's register).
        const firstSentence = cleanDesc.split(/(?<=[.!?])\s+|\s+—\s+/)[0]?.trim()
            || cleanDesc;
        if (firstSentence.length <= 80) return firstSentence;
        return firstSentence.slice(0, 77).trimEnd() + "…";
    }
    return fallback?.trim() || "Untitled asset";
};

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

// AI matching function. Day 65 evening (Sasha 2026-05-09) v5: lean
// schema alignment. The edge function at
// supabase/functions/match-assets/index.ts now returns rows shaped
//   { category: "Type > SubType > Title", description, maturity }
// — name / why_value / horizon / nature / leverage_score / is_offer /
// is_power_node were all retired in v5 (see assetMappingPrompt.ts
// changelog). We extract a title at save time from the first sentence
// of the description.
const fetchAssetMatches = async (text: string): Promise<MatchedAsset[] | null> => {
    try {
        // Day 63 (Sasha 2026-05-07 evening) BUG FIX: limit was hardcoded
        // to 8, so users who pasted 20+ assets got truncated to 8. Bumped
        // to 50 to match the local-parser cap.
        const { data, error } = await supabase.functions.invoke("match-assets", {
            body: { text, limit: 50 },
        });
        if (error || !data?.matches) return null;

        type EdgeMatch = {
            category?: string;
            description?: string;
            maturity?: string;
        };
        const matches = (data.matches as EdgeMatch[])
            .map((match): MatchedAsset | null => {
                const description = match.description?.trim();
                if (!description) return null;
                // "Type > SubType > Title" → split on " > " and trim each piece.
                // "Other" is a valid type (when AI couldn't fit cleanly).
                // Filter only on Unknown (totally malformed category string).
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
                    // Title intentionally empty here — derived at save time
                    // from the description's first sentence so the user's
                    // asset library still has a readable headline.
                    title: "",
                    description,
                    maturity: isMaturity(match.maturity) ? match.maturity : undefined,
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

// Day 63 (Sasha 2026-05-07 evening) — LEGIBILITY PASS per
// docs/03-playbooks/ui_playbook.md Part VIII. The "Strong" cocktail (1.5×
// — the de-facto default for variable-luminance backgrounds: cream wash,
// gold particles, sun glare). Levers applied here:
//   • Cormorant headings: weight 600 → 700, soft halo added
//   • Source Serif body: weight 400→600 added, color bumped from
//     text-body (0.85α) to text-primary (full color)
// Page-level usages additionally apply var(--skin-text-halo-deep) inline
// at the call site (per the playbook — don't apply halo-deep blindly to
// every text element, only the ones on variable-luminance bg).
const cormorantTitle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 700,                                     // ← lever 1 (Strong)
    letterSpacing: "-0.005em",
    color: "var(--skin-text-primary, #0b2a5a)",          // ← lever 2 (full color)
    textShadow:
        "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))", // ← lever 3 (soft baseline)
};

const sourceSerifBody: React.CSSProperties = {
    fontFamily: "'Source Serif 4', serif",
    fontWeight: 600,                                     // ← lever 1 (Strong)
    color: "var(--skin-text-primary, #0b2a5a)",          // ← lever 2 (full color, was 0.85α)
};

// Strong-cocktail headline halo for page-level text on the cream wash
// (variable luminance). Applied inline on h1/h2 over the page bg.
const legibleHeadlineHalo =
    "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))";

// Strong-cocktail italic body — lever 4 (italic letter-spacing +0.01em)
// + lever 1 (weight 700). Use for italic Cormorant echoes on page-level
// busy backgrounds.
const legibleItalicEcho: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontWeight: 700,
    letterSpacing: "0.01em",
    color: "var(--skin-text-primary, #0a1628)",
    textShadow: legibleHeadlineHalo,
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
    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
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
    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
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

                // v5: title is no longer required from the AI. Use
                // whatever the AI returned if present, otherwise derive
                // a readable headline from the description's first
                // sentence (falling back to categoryTitle for the rare
                // empty-description case). Only skip if BOTH description
                // and title are empty — nothing to identify the asset by.
                const rawTitle = asset.title?.trim();
                const description = asset.description?.trim();
                const title = rawTitle
                    || deriveTitleFromDescription(description, asset.categoryTitle || type.title);
                if (!title || (!description && !rawTitle)) {
                    skippedCount += 1;
                    continue;
                }

                toSave.push({
                    typeId: type.id,
                    subTypeId: subType?.id,
                    categoryId: category?.id,
                    title,
                    description: description || undefined,
                    savedAt: new Date().toISOString(),
                    source: "ai",
                });
            }

            // Save via sync layer (localStorage + DB)
            // Day 66 (Sasha 2026-05-16) — Wave B1 fix. Check result.success
            // to distinguish DB-success from localStorage-only-success. Was:
            // reported saved count regardless of DB outcome, so a DB failure
            // looked like a success to the user.
            const result = await saveAssets(user.id, toSave);

            if (!result.success) {
                toast({
                    title: "Couldn't save to your profile",
                    description: result.error
                        ? `Your assets are buffered locally — please retry. (${result.error})`
                        : "Your assets are buffered locally; please retry to sync.",
                    variant: "destructive",
                });
                return;
            }

            setHasSaved(true);
            const totalSkipped = skippedCount + result.skipped;
            toast({
                title: "Assets saved",
                description: `Saved ${result.saved} assets${totalSkipped ? `, skipped ${totalSkipped}` : ""}.`,
            });

            // Day 80 Wave 2 (Sasha 2026-05-22): graduation detection +
            // celebration modal dispatch. If this save lands the user at
            // T+M+A all complete (the matching engine's minimum signal),
            // fire the GRADUATION variant ("you're crystallized · find
            // collaborators is now open"). Otherwise fire the regular
            // per-save celebration. Listener (App.tsx) enforces once-
            // per-primitive via sessionStorage.
            try {
                const { data: profileForGrad } = await supabase
                    .from("game_profiles")
                    .select("mission_discovered_at, last_zog_snapshot_id")
                    .eq("user_id", user.id)
                    .maybeSingle();
                const hasMission = !!(profileForGrad as { mission_discovered_at?: string | null } | null)?.mission_discovered_at;
                const hasTalent = !!(profileForGrad as { last_zog_snapshot_id?: string | null } | null)?.last_zog_snapshot_id;
                const isGraduation = hasMission && hasTalent;
                const resultText = `${result.saved} asset${result.saved === 1 ? "" : "s"} mapped`;
                window.dispatchEvent(
                    new CustomEvent("fytt:celebrate", {
                        detail: {
                            primitive: "assets",
                            variant: isGraduation ? "graduation" : "regular",
                            resultText,
                        },
                    }),
                );
            } catch {
                // Defensive — never block save on celebration UX.
            }
        } catch (err) {
            toast({ title: "Something went wrong", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    // Parse response and extract assets — tries the edge function's
    // AI matching first; falls back to local parsing of the user's
    // pasted JSON if the edge call comes back empty. Day 65 v5 lean
    // schema: only type/subtype/category + description + maturity
    // survive; legacy fields (name / why_value / horizon / nature /
    // leverage_score / expresses_root / is_offer / is_power_node)
    // are silently ignored if the user's AI still emits them.
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
                    const description = asset.description || asset.details || asset.summary || undefined;

                    extracted.push({
                        typeTitle,
                        subTypeTitle,
                        categoryTitle,
                        // v5: title is no longer required from the AI; we
                        // derive it from the description at save time.
                        title: "",
                        description,
                        maturity: isMaturity(asset.maturity) ? asset.maturity : undefined,
                    });
                }
            } else {
                const assetBlocks = aiResponse.split(/(?=\*\s*\*\*Category:\*\*|\n\d+\)\s*\*\*Category:\*\*)/);

                for (const block of assetBlocks) {
                    if (!block.trim()) continue;
                    const categoryMatch = block.match(/\*\*Category:\*\*\s*([^\n*]+)/i);
                    const descMatch = block.match(/\*\*(?:Description|Details|Summary):\*\*\s*([^\n]+)/i);

                    if (descMatch) {
                        let typeTitle = 'Unknown';
                        if (categoryMatch) {
                            const rawCat = categoryMatch[1].trim().toLowerCase();
                            typeTitle = CATEGORY_MAP[rawCat] || categoryMatch[1].trim();
                        }
                        extracted.push({
                            typeTitle,
                            title: "",
                            description: descMatch[1].trim(),
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
                            const descMatch = item.match(/\*\*(?:Description|Details|Summary):\*\*\s*([^\n]+)/i);

                            if (descMatch) {
                                extracted.push({
                                    typeTitle,
                                    title: "",
                                    description: descMatch[1].trim(),
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
        // v5: no leverage_score to sort by. Sort by maturity (monetizable
        // assets first, symbolic_only last) so the most actionable items
        // surface at the top of the review screen.
        const maturityRank: Record<string, number> = {
            monetizable_now: 0,
            usable_but_needs_packaging: 1,
            latent: 2,
            aspirational: 3,
            symbolic_only: 4,
        };
        const sorted = extracted.sort((a, b) => {
            const ra = a.maturity ? maturityRank[a.maturity] ?? 5 : 5;
            const rb = b.maturity ? maturityRank[b.maturity] ?? 5 : 5;
            return ra - rb;
        });
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
                                // Strong cocktail — page-level italic echo on cream wash.
                                ...legibleItalicEcho,
                                fontSize: "17px",
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
                                        // Strong cocktail @ card-level — sourceSerifBody now
                                        // carries weight 600 + text-primary; we drop the muted
                                        // override so contrast holds against the parchment bg.
                                        ...sourceSerifBody,
                                        fontStyle: "italic",
                                        fontSize: "14px",
                                        lineHeight: 1.5,
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
                                        // Strong cocktail @ card-level — sourceSerifBody now
                                        // carries weight 600 + text-primary; we drop the muted
                                        // override so contrast holds against the parchment bg.
                                        ...sourceSerifBody,
                                        fontStyle: "italic",
                                        fontSize: "14px",
                                        lineHeight: 1.5,
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
                                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
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
                                style={{
                                    // Strong cocktail — page-level Cormorant headline.
                                    ...cormorantTitle,
                                    fontSize: "28px",
                                    fontWeight: 700,
                                    textShadow: legibleHeadlineHalo,
                                }}
                                className="leading-[1.2] mb-2"
                            >
                                {matchedAssets.length > 0 ? `Found ${matchedAssets.length} assets` : "No exact matches"}
                            </h2>
                            <p
                                className="italic"
                                style={{
                                    // Strong cocktail — page-level italic echo.
                                    ...legibleItalicEcho,
                                    fontSize: "16px",
                                    lineHeight: 1.5,
                                }}
                            >
                                {matchedAssets.length > 0
                                    ? "Review and save these to your profile."
                                    : "Try adding assets manually using the wizard."}
                            </p>
                        </div>

                        {matchedAssets.length > 0 && (
                            // Day 65 evening (Sasha 2026-05-09) v5 lean render.
                            // Center of Gravity hero card removed — CoG itself
                            // was retired in the v4 prompt and the defensive
                            // fallback was retired in v5. No more power-node
                            // halo, no more leverage score chip, no more
                            // expresses_root, no more horizon/nature/offer
                            // badges, no more AI-generated title row.
                            //
                            // Each card is now: breadcrumb eyebrow (type →
                            // subtype → category) + maturity badge + the
                            // description as body copy. Symbolic-only items
                            // still get a quieter surface so they sit
                            // honestly de-emphasized without being hidden.
                            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                                {matchedAssets.map((asset, i) => (
                                    <div
                                        key={i}
                                        className="rounded-xl px-4 py-3.5"
                                        style={
                                            asset.maturity === "symbolic_only"
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
                                                            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
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
                                                            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                                                        }}
                                                    >
                                                        → {asset.categoryTitle}
                                                    </span>
                                                )}
                                            </div>
                                            {asset.maturity && (
                                                <MaturityBadge maturity={asset.maturity} />
                                            )}
                                        </div>
                                        {asset.description && (
                                            <p
                                                style={{
                                                    ...sourceSerifBody,
                                                    fontSize: "14px",
                                                    lineHeight: 1.55,
                                                }}
                                            >
                                                {asset.description}
                                            </p>
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
                                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                                    textDecoration: "underline",
                                    textUnderlineOffset: "3px",
                                }}
                            >
                                Add more manually →
                            </button>
                        </div>

                        {/* Funnel v2 (§4.4.3): the unlock moment. Once
                            assets are saved, match-path users get the
                            "See your matches →" primary CTA + a
                            secondary "Assess your quality of life →".
                            Build-path users see only the action row
                            above. Pre-save we render nothing extra so
                            the user's attention stays on the matched
                            list + Save button. */}
                        {hasSaved && <MatchFlowCta step="assets" />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetMappingLanding;

// ─────────────────────────────────────────────────────────────────────
// Day 63 v3 — strategic-dimension badges. Color-graded so the operator
// can see at a glance where each asset sits on the maturity ladder + the
// time horizon. Tooltip-on-hover via native title attribute (no extra
// Radix overhead — the badges are dense, the explanation is short).
// ─────────────────────────────────────────────────────────────────────

const badgeBaseStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    fontSize: "10px",
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    padding: "1.5px 7px",
    borderRadius: "999px",
    border: "0.5px solid",
    whiteSpace: "nowrap" as const,
    cursor: "help",
};

const MATURITY_LABEL: Record<AssetMaturity, string> = {
    monetizable_now: "Monetizable now",
    usable_but_needs_packaging: "Needs packaging",
    latent: "Latent",
    aspirational: "Aspirational",
    symbolic_only: "Symbolic only",
};

const MATURITY_HINT: Record<AssetMaturity, string> = {
    monetizable_now: "Documented, deliverable, priced — could produce revenue this month if activated.",
    usable_but_needs_packaging: "Real and proven, but lives in your head or scattered artifacts. Two weeks of packaging from sellable.",
    latent: "Potential is real but unproven in the market. Untested or undocumented.",
    aspirational: "Relational / networked / intended access. The door exists; you have not opened it for revenue or distribution yet.",
    symbolic_only: "Mythic, biographical, or sacred fuel. Real, but operationally inert today.",
};

function MaturityBadge({ maturity }: { maturity: AssetMaturity }) {
    // Color-graded: green when monetizable now (ready to deploy), gold for
    // packaging-step-away (high-promise, near-ready), neutral for latent /
    // aspirational (real but not yet acting), dim for symbolic_only
    // (honest acknowledgement, not an action item).
    const tone =
        maturity === "monetizable_now"
            ? {
                color: "rgba(20, 130, 70, 0.95)",
                background: "rgba(20, 130, 70, 0.08)",
                borderColor: "rgba(20, 130, 70, 0.35)",
            }
            : maturity === "usable_but_needs_packaging"
            ? {
                color: "var(--skin-goldDeep, #5d4307)",
                background: "rgba(212, 175, 55, 0.10)",
                borderColor: "rgba(212, 175, 55, 0.40)",
            }
            : maturity === "symbolic_only"
            ? {
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                background: "rgba(11, 42, 90, 0.04)",
                borderColor: "rgba(11, 42, 90, 0.12)",
            }
            : {
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                background: "rgba(11, 42, 90, 0.06)",
                borderColor: "rgba(11, 42, 90, 0.18)",
            };
    return (
        <span
            title={MATURITY_HINT[maturity]}
            style={{ ...badgeBaseStyle, ...tone }}
        >
            {MATURITY_LABEL[maturity]}
        </span>
    );
}

// Day 65 evening (Sasha 2026-05-09) v5: HorizonBadge, NatureBadge, and
// OfferBadge were retired along with their underlying schema fields
// (horizon, nature, is_offer). The v5 lean schema keeps only MaturityBadge
// above as the asset's single ranking signal. Component definitions and
// their LABEL/HINT/tone tables removed; resurrect from git history if
// any future schema brings these dimensions back.
