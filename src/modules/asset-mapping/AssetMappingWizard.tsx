/**
 * AssetMappingWizard — Aurora editorial register.
 *
 * Day 63 (Sasha 2026-05-07): production pass — visual layer aligned to
 * the landing-page brand. Logic, state, and save paths UNCHANGED. Five
 * states still: type → subtype → category → details → done.
 *
 * Visual register pulled from:
 *   • landingDesign.tsx — GOLD_TEXT_STYLE, Ornament
 *   • DossierScreen / FounderDetailDrawer — parchment cards + ceremonial CTAs
 *   • AppleseedDisplay — header + italic echo + ornament rhythm
 */

import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ASSET_TYPES, AssetTypeId } from "./data/assetTypes";
import { ASSET_SUB_TYPES } from "./data/assetSubtypes";
import { ASSET_CATEGORIES } from "./data/assetCategories";
import { saveAsset } from "./assetSync";
import { Ornament, GOLD_TEXT_STYLE } from "@/lib/landingDesign";

type Step = 'type' | 'subtype' | 'category' | 'details' | 'done';

// ─────────────────────────────────────────────────────────────────────
// Aurora style atoms — kept in lockstep with the Landing's atoms so the
// two surfaces read as one editorial family.
// ─────────────────────────────────────────────────────────────────────

const WASH_BG =
    "radial-gradient(ellipse 95% 105% at 95% 5%, rgba(255, 200, 130, 0.55) 0%, rgba(255, 218, 170, 0.45) 18%, rgba(252, 232, 200, 0.75) 38%, rgba(248, 240, 220, 0.92) 65%, rgba(245, 242, 235, 0.98) 88%)";

// Day 63 (Sasha 2026-05-07 evening) — LEGIBILITY PASS per
// docs/03-playbooks/ui_playbook.md Part VIII. Strong cocktail (1.5×).
// Same atom upgrades as Landing.tsx — kept in lockstep so the two
// surfaces read as one editorial family.
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

const legibleHeadlineHalo =
    "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))";

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
    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
};

const parchmentCard: React.CSSProperties = {
    background: "var(--skin-card-bg, rgba(255, 255, 255, 0.68))",
    border: "0.5px solid rgba(212, 175, 55, 0.45)",
    boxShadow:
        "0 0 22px -8px rgba(212, 175, 55, 0.25), 0 16px 40px -20px rgba(10, 22, 40, 0.18)",
};

const parchmentCardSubtle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.55)",
    border: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
    boxShadow: "0 4px 16px -8px rgba(10, 22, 40, 0.08)",
};

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

const tertiaryPill: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontSize: "11.5px",
    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
    background: "rgba(255, 255, 255, 0.55)",
    border: "0.5px solid var(--skin-rule-medium, rgba(26, 30, 58, 0.15))",
};

const editorialInput: React.CSSProperties = {
    fontFamily: "'Source Serif 4', serif",
    fontSize: "14.5px",
    lineHeight: 1.55,
    color: "var(--skin-text-primary, #0b2a5a)",
    background: "rgba(255, 255, 255, 0.85)",
    border: "0.5px solid var(--skin-rule-medium, rgba(26, 30, 58, 0.15))",
};

// ─────────────────────────────────────────────────────────────────────
// Step indicator — gold pip row showing 1/4 → 4/4 progression. Replaces
// the prior "← Back to types" inline text-link rhythm with a clear
// editorial step counter that doesn't compete for attention.
// ─────────────────────────────────────────────────────────────────────

const STEP_ORDER: Step[] = ['type', 'subtype', 'category', 'details'];

function StepIndicator({ step }: { step: Step }) {
    if (step === 'done') return null;
    const idx = STEP_ORDER.indexOf(step);
    return (
        <div className="flex items-center justify-center gap-1.5 mb-3">
            {STEP_ORDER.map((s, i) => {
                const isActive = i === idx;
                const isPast = i < idx;
                return (
                    <span
                        key={s}
                        aria-hidden="true"
                        className="rounded-full transition-all duration-300"
                        style={{
                            width: isActive ? "18px" : "6px",
                            height: "6px",
                            background: isActive
                                ? "var(--skin-accent-gold, #b8860b)"
                                : isPast
                                ? "rgba(212, 175, 55, 0.55)"
                                : "rgba(26, 30, 58, 0.18)",
                            boxShadow: isActive
                                ? "0 0 10px -2px rgba(212, 175, 55, 0.55)"
                                : "none",
                        }}
                    />
                );
            })}
            <span
                className="ml-2"
                style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "10.5px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                    fontVariantNumeric: "tabular-nums lining-nums",
                }}
            >
                Step {idx + 1} of {STEP_ORDER.length}
            </span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

const AssetMappingWizard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnPath = searchParams.get("return") || "/game/me";
    const { toast } = useToast();

    const [step, setStep] = useState<Step>('type');
    const [selectedTypeId, setSelectedTypeId] = useState<AssetTypeId | null>(null);
    const [selectedSubTypeId, setSelectedSubTypeId] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [addedAssets, setAddedAssets] = useState<{ title: string; type: string }[]>([]);

    const subTypes = useMemo(() =>
        selectedTypeId ? ASSET_SUB_TYPES.filter(s => s.typeId === selectedTypeId) : [],
        [selectedTypeId]
    );

    const categories = useMemo(() =>
        selectedSubTypeId ? ASSET_CATEGORIES.filter(c => c.subTypeId === selectedSubTypeId) : [],
        [selectedSubTypeId]
    );

    const selectedType = ASSET_TYPES.find(t => t.id === selectedTypeId);
    const selectedSubType = ASSET_SUB_TYPES.find(s => s.id === selectedSubTypeId);
    const selectedCategory = ASSET_CATEGORIES.find(c => c.id === selectedCategoryId);

    const handleSelectType = (typeId: AssetTypeId) => {
        setSelectedTypeId(typeId);
        setSelectedSubTypeId(null);
        setSelectedCategoryId(null);
        setStep('subtype');
    };

    const handleSelectSubType = (subTypeId: string) => {
        setSelectedSubTypeId(subTypeId);
        setSelectedCategoryId(null);
        setStep('category');
    };

    const handleSelectCategory = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setStep('details');
        const cat = ASSET_CATEGORIES.find(c => c.id === categoryId);
        if (cat) setTitle(cat.title);
    };

    const handleSaveAsset = async () => {
        if (!selectedTypeId || !selectedSubTypeId || !selectedCategoryId || !title.trim()) return;

        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({ title: "Please sign in", variant: "destructive" });
                return;
            }

            const asset = {
                typeId: selectedTypeId,
                subTypeId: selectedSubTypeId,
                categoryId: selectedCategoryId,
                title: title.trim(),
                description: description.trim() || undefined,
                savedAt: new Date().toISOString(),
                source: "manual" as const,
            };

            await saveAsset(user.id, asset);

            setAddedAssets(prev => [...prev, { title: asset.title, type: selectedType?.title || '' }]);

            toast({
                title: "Asset added",
                description: `${asset.title} saved to your profile.`,
            });

            setStep('done');
        } catch (err) {
            toast({ title: "Something went wrong", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddAnother = () => {
        setStep('type');
        setSelectedTypeId(null);
        setSelectedSubTypeId(null);
        setSelectedCategoryId(null);
        setTitle("");
        setDescription("");
    };

    const handleBack = () => {
        switch (step) {
            case 'subtype': setStep('type'); break;
            case 'category': setStep('subtype'); break;
            case 'details': setStep('category'); break;
            default: break;
        }
    };

    return (
        // Day 63 (Sasha 2026-05-07): wrapper no longer paints WASH_BG —
        // the GameShellV2 wrap (in App.tsx) provides the cream wash.
        // Same fix as the Landing surface; both files dropped their
        // self-painted backgrounds the same day.
        <div className="px-5 py-8 sm:py-10">
            <div className="max-w-2xl mx-auto">
                {/* ═══════ HEADER — Aurora editorial ═══════ */}
                {/* Day 63: was a sticky bg-white border-b utility header. Now:
                    centered Cormorant title + italic echo + Ornament — same
                    rhythm as Landing. The "X assets added" counter floats as
                    a small pill below the ornament when relevant. */}
                <header className="text-center mb-6">
                    <h1
                        className="text-3xl sm:text-4xl font-bold leading-[1.1] tracking-[-0.018em] mb-2"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "var(--skin-text-primary, #0a1628)",
                            textShadow:
                                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45))",
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
                        className="italic"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 600,
                            fontSize: "16px",
                            color: "var(--skin-text-primary, #0a1628)",
                            textShadow:
                                "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                        }}
                    >
                        Map your resources for collaboration
                    </p>
                    <Ornament className="my-5" />
                    {addedAssets.length > 0 && (
                        <span
                            className="inline-block"
                            style={{
                                fontFamily: "'DM Sans', system-ui, sans-serif",
                                fontSize: "11px",
                                letterSpacing: "0.16em",
                                textTransform: "uppercase",
                                color: "var(--skin-goldDeep, #5d4307)",
                                background: "rgba(212, 175, 55, 0.10)",
                                border: "0.5px solid rgba(212, 175, 55, 0.40)",
                                padding: "2px 10px",
                                borderRadius: "999px",
                                fontVariantNumeric: "tabular-nums lining-nums",
                            }}
                        >
                            {addedAssets.length} asset{addedAssets.length === 1 ? '' : 's'} added this session
                        </span>
                    )}
                </header>

                {/* ═══════ Step: Type Selection ═══════ */}
                {step === 'type' && (
                    <div>
                        <StepIndicator step={step} />
                        <h2
                            style={{
                                // Strong cocktail — page-level Cormorant headline.
                                ...cormorantTitle,
                                fontSize: "24px",
                                textShadow: legibleHeadlineHalo,
                            }}
                            className="text-center mb-1.5"
                        >
                            What type of asset?
                        </h2>
                        <p
                            className="italic text-center mb-5"
                            style={{
                                // Strong cocktail — page-level italic echo on cream wash.
                                ...legibleItalicEcho,
                                fontSize: "16px",
                            }}
                        >
                            Pick the category that best holds this resource.
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {ASSET_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => handleSelectType(type.id)}
                                    className="rounded-2xl px-5 py-5 text-left transition-all duration-200 hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/50"
                                    style={parchmentCard}
                                >
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span style={{ fontSize: "20px" }}>{type.icon}</span>
                                        <h3
                                            style={{
                                                ...cormorantTitle,
                                                fontSize: "18px",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {type.title}
                                        </h3>
                                    </div>
                                    <p
                                        style={{
                                            // Strong cocktail @ card-level — sourceSerifBody now
                                            // weight 600 + text-primary; muted override dropped.
                                            ...sourceSerifBody,
                                            fontStyle: "italic",
                                            fontSize: "13.5px",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {type.description}
                                    </p>
                                </button>
                            ))}
                        </div>

                        <div className="text-center mt-6">
                            <button
                                onClick={() => navigate(returnPath)}
                                className="italic transition-colors duration-200 hover:opacity-80"
                                style={{
                                    fontFamily: "'Source Serif 4', serif",
                                    fontSize: "13px",
                                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                                    textDecoration: "underline",
                                    textUnderlineOffset: "3px",
                                }}
                            >
                                ← Done for now
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════ Step: Sub-Type Selection ═══════ */}
                {step === 'subtype' && selectedType && (
                    <div>
                        <StepIndicator step={step} />
                        <div className="text-center mb-5">
                            <div style={eyebrowSmall} className="mb-1.5">
                                {selectedType.icon} {selectedType.title}
                            </div>
                            <h2
                                style={{ ...cormorantTitle, fontSize: "22px" }}
                                className="mb-1.5"
                            >
                                What area within {selectedType.title.toLowerCase()}?
                            </h2>
                        </div>

                        <div className="grid gap-2.5">
                            {subTypes.map(subType => (
                                <button
                                    key={subType.id}
                                    onClick={() => handleSelectSubType(subType.id)}
                                    className="rounded-xl px-4 py-3.5 text-left transition-all duration-200 hover:translate-y-[-0.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/50"
                                    style={parchmentCardSubtle}
                                >
                                    <span
                                        style={{
                                            ...cormorantTitle,
                                            fontSize: "16px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {subType.title}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-center mt-6">
                            <button
                                onClick={handleBack}
                                className="inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                                style={tertiaryPill}
                            >
                                <span aria-hidden="true">←</span>
                                Back to types
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════ Step: Category Selection ═══════ */}
                {step === 'category' && selectedSubType && (
                    <div>
                        <StepIndicator step={step} />
                        <div className="text-center mb-5">
                            <div style={eyebrowSmall} className="mb-1.5">
                                {selectedType?.title} → {selectedSubType.title}
                            </div>
                            <h2
                                style={{ ...cormorantTitle, fontSize: "22px" }}
                                className="mb-1.5"
                            >
                                Pick the specific kind
                            </h2>
                        </div>

                        <div className="grid gap-2.5">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => handleSelectCategory(category.id)}
                                    className="rounded-xl px-4 py-3.5 text-left transition-all duration-200 hover:translate-y-[-0.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/50"
                                    style={parchmentCardSubtle}
                                >
                                    <span
                                        style={{
                                            ...cormorantTitle,
                                            fontSize: "16px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {category.title}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-center mt-6">
                            <button
                                onClick={handleBack}
                                className="inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                                style={tertiaryPill}
                            >
                                <span aria-hidden="true">←</span>
                                Back
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════ Step: Details ═══════ */}
                {step === 'details' && selectedCategory && (
                    <div>
                        <StepIndicator step={step} />
                        <div className="text-center mb-5">
                            <div style={eyebrowSmall} className="mb-1.5">
                                {selectedType?.icon} {selectedType?.title} → {selectedSubType?.title} → {selectedCategory.title}
                            </div>
                            <h2
                                style={{ ...cormorantTitle, fontSize: "22px" }}
                                className="mb-1.5"
                            >
                                Describe this asset
                            </h2>
                        </div>

                        <div
                            className="rounded-2xl px-5 py-5 space-y-4"
                            style={parchmentCard}
                        >
                            <div className="space-y-1.5">
                                <label style={labelMuted}>Title</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Give this asset a name"
                                    style={editorialInput}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label style={labelMuted}>
                                    Description
                                    <span className="ml-1 italic" style={{ fontFamily: "'Source Serif 4', serif", textTransform: "none", letterSpacing: 0, opacity: 0.65 }}>(optional)</span>
                                </label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Any additional details…"
                                    className="min-h-[100px]"
                                    style={editorialInput}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                            <button
                                onClick={handleBack}
                                className="inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                                style={tertiaryPill}
                            >
                                <span aria-hidden="true">←</span>
                                Back
                            </button>
                            <button
                                onClick={handleSaveAsset}
                                disabled={!title.trim() || isSaving}
                                className="group relative inline-flex items-center gap-2.5 rounded-full px-6 py-3 transition-all duration-300 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
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
                                <span>{isSaving ? "Saving…" : "Save Asset"}</span>
                                {!isSaving && <Check className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════ Step: Done ═══════ */}
                {/* Day 63: was a circular emerald-100 medallion + bold sans
                    title. Now: Ornament-led editorial moment with Cormorant
                    title + italic echo + ceremonial CTA pair. Mirrors the
                    Day-58 retirement of medallion treatments across the
                    platform. */}
                {step === 'done' && (
                    <div className="text-center">
                        <h2
                            style={{
                                // Strong cocktail — Done-state page-level hero.
                                ...cormorantTitle,
                                fontSize: "32px",
                                fontWeight: 700,
                                textShadow: legibleHeadlineHalo,
                            }}
                            className="leading-[1.15] mb-2"
                        >
                            Asset{" "}
                            <span
                                className="bg-clip-text text-transparent"
                                style={GOLD_TEXT_STYLE}
                            >
                                Added
                            </span>
                        </h2>
                        <p
                            className="italic mb-7"
                            style={{
                                // Strong cocktail — page-level italic echo on cream wash.
                                ...legibleItalicEcho,
                                fontSize: "16px",
                                lineHeight: 1.55,
                            }}
                        >
                            You've added {addedAssets.length} asset{addedAssets.length === 1 ? '' : 's'} this session.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <button
                                onClick={handleAddAnother}
                                className="group relative inline-flex flex-1 items-center justify-center gap-2.5 rounded-full px-6 py-3 transition-all duration-300 hover:translate-y-[-1px]"
                                style={{
                                    ...ceremonialCta,
                                    backdropFilter: "blur(14px) saturate(160%)",
                                    WebkitBackdropFilter: "blur(14px) saturate(160%)",
                                }}
                            >
                                <Plus className="w-3.5 h-3.5" style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))" }} />
                                Add Another
                            </button>
                            <button
                                onClick={() => navigate(returnPath)}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px]"
                                style={tertiaryPill}
                            >
                                Done for Now
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {addedAssets.length > 0 && (
                            <div className="mt-8 max-w-md mx-auto">
                                <div style={eyebrowSmall} className="text-center mb-3">
                                    Added this session
                                </div>
                                {/* Day 63 round-2: borders set per-li below
                                    so the `divide-y` Tailwind class isn't
                                    actually doing anything — removed it
                                    along with the dead `--tw-divide-opacity`
                                    custom-property override that needed an
                                    @ts-expect-error suppression. */}
                                <ul
                                    className="rounded-xl"
                                    style={parchmentCardSubtle}
                                >
                                    {addedAssets.map((asset, i) => (
                                        <li
                                            key={i}
                                            className="px-4 py-2.5 flex items-baseline gap-2"
                                            style={{
                                                borderBottom:
                                                    i < addedAssets.length - 1
                                                        ? "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))"
                                                        : "none",
                                            }}
                                        >
                                            <span style={{ color: "var(--skin-accent-gold, #b8860b)" }}>•</span>
                                            <span
                                                style={{
                                                    ...cormorantTitle,
                                                    fontSize: "14.5px",
                                                    fontWeight: 600,
                                                }}
                                                className="flex-1 text-left"
                                            >
                                                {asset.title}
                                            </span>
                                            <span
                                                style={{
                                                    fontFamily: "'Source Serif 4', serif",
                                                    fontStyle: "italic",
                                                    fontSize: "12.5px",
                                                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                                                }}
                                            >
                                                {asset.type}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetMappingWizard;
