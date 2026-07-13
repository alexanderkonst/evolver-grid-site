/**
 * ProfileAssetsSection — Aurora editorial register.
 *
 * Day 63 (Sasha 2026-05-07): production pass — visual layer aligned to
 * the rest of the ME-space subpages (mirror `AppleseedDisplay.tsx`,
 * `ZoGPerspectiveView.tsx` blocks). Logic, data flow, route untouched.
 *
 * Visual register pulled from:
 *   • landingDesign.tsx — GOLD_TEXT_STYLE, Ornament
 *   • DossierScreen / FounderDetailDrawer — parchment cards + ceremonial CTAs
 *   • AppleseedDisplay — header + italic echo + ornament rhythm
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Boxes, ChevronDown, ChevronUp, Users, Plus, ArrowRight, RefreshCw, Loader2, Copy, Check, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import GameShellV2 from "@/components/game/GameShellV2";
import { supabase } from "@/integrations/supabase/client";
import { ASSET_TYPES } from "@/modules/asset-mapping/data/assetTypes";
import { ASSET_SUB_TYPES } from "@/modules/asset-mapping/data/assetSubtypes";
import { useLocalizedAssetCategories } from "@/modules/asset-mapping/data/assetCategories";
import { loadAndSyncAssets, updateAsset, deleteAsset, type SavedAsset } from "@/modules/asset-mapping/assetSync";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────
// Aurora style atoms — same family used across /admin, /game/me/*, etc.
// ─────────────────────────────────────────────────────────────────────

// Day 63 (Sasha 2026-05-07 evening) — LEGIBILITY PASS per
// docs/03-playbooks/ui_playbook.md Part VIII. Strong cocktail (1.5×).
// Same atom upgrades as the Landing + Wizard files — kept in lockstep.
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

const labelMuted: React.CSSProperties = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    fontSize: "10.5px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
};

const parchmentCard: React.CSSProperties = {
    background: "var(--skin-card-bg, rgba(255, 255, 255, 0.68))",
    border: "0.5px solid rgba(212, 175, 55, 0.45)",
    boxShadow:
        "0 0 22px -8px rgba(212, 175, 55, 0.25), 0 16px 40px -20px rgba(10, 22, 40, 0.18)",
};

const ceremonialPill: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontSize: "12px",
    color: "var(--skin-text-primary, #0b2a5a)",
    // Day 91 (Sasha 2026-06-09): tokenized for Aurum — fallback = exact prior literal.
    background: "var(--skin-card-fill, rgba(255, 255, 255, 0.72))",
    border: "0.5px solid rgba(212, 175, 55, 0.55)",
    boxShadow: "0 0 14px -4px rgba(212, 175, 55, 0.32)",
};

const ceremonialPillPrimary: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontSize: "12px",
    background:
        "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.85) 50%, rgba(10,22,40,0.92) 100%))",
    color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
    border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
    boxShadow:
        "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28))",
};

const ProfileAssetsSection = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [savedAssets, setSavedAssets] = useState<SavedAsset[]>([]);
    const [showAssets, setShowAssets] = useState(false);
    // Day 63 (Sasha 2026-05-07 evening) — assets-just-saved propagation
    // hint. Sasha hit a real ~2-minute delay between Save-on-Asset-Mapping
    // and assets appearing here. Root cause is most likely Lovable preview
    // env DB-write latency + a race between localStorage write completing
    // and the next page's useEffect firing (the merge in loadAndSyncAssets
    // only catches localStorage assets if both pages share the same
    // user.id resolution timing). UX fix while we leave the underlying
    // sync code alone:
    //   1. Auto-refresh once when the tab regains focus (covers the
    //      "I came back from /asset-mapping" case without polling).
    //   2. Manual Refresh button next to the count + brief italic note
    //      on the empty state: "If you just saved assets, give it a
    //      moment — tap Refresh."
    //   3. Show a small loading dot while reload is in flight.
    const [isReloading, setIsReloading] = useState(false);
    const [justCopied, setJustCopied] = useState(false);

    // Per-row Edit/Delete (2026-07-11): only db-backed rows (asset.id set)
    // get action buttons — localStorage-only rows have no id to key on.
    const localizedCategories = useLocalizedAssetCategories();
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editTarget, setEditTarget] = useState<SavedAsset | null>(null);
    const [editTypeId, setEditTypeId] = useState("");
    const [editSubTypeId, setEditSubTypeId] = useState("");
    const [editCategoryId, setEditCategoryId] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const editSubTypes = useMemo(
        () => ASSET_SUB_TYPES.filter((s) => s.typeId === editTypeId),
        [editTypeId],
    );
    const editCategories = useMemo(
        () => localizedCategories.filter((c) => c.subTypeId === editSubTypeId),
        [localizedCategories, editSubTypeId],
    );

    const openEditDialog = useCallback((asset: SavedAsset) => {
        setEditTarget(asset);
        setEditTypeId(asset.typeId);
        setEditSubTypeId(asset.subTypeId || "");
        setEditCategoryId(asset.categoryId || "");
        setEditTitle(asset.title);
        setEditDescription(asset.description || "");
    }, []);

    const handleEditTypeChange = useCallback((value: string) => {
        setEditTypeId(value);
        setEditSubTypeId("");
        setEditCategoryId("");
    }, []);

    const handleEditSubTypeChange = useCallback((value: string) => {
        setEditSubTypeId(value);
        setEditCategoryId("");
    }, []);

    const handleSaveEdit = useCallback(async () => {
        if (!editTarget?.id || !editTitle.trim()) return;
        setIsSavingEdit(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await updateAsset(user.id, editTarget.id, {
                typeId: editTypeId,
                subTypeId: editSubTypeId || null,
                categoryId: editCategoryId || null,
                title: editTitle.trim(),
                description: editDescription.trim() || null,
            });
            if (error) {
                if ((error as any)?.code === "23505") {
                    toast.error(t('profileAssets.toastDuplicate'));
                } else {
                    toast.error(t('profileAssets.toastSaveFailed'));
                }
                return;
            }
            toast.success(t('profileAssets.toastUpdated'));
            setEditTarget(null);
            await reload();
        } finally {
            setIsSavingEdit(false);
        }
    }, [editTarget, editTypeId, editSubTypeId, editCategoryId, editTitle, editDescription, t, reload]);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await deleteAsset(user.id, deleteTarget.id);
            if (error) {
                toast.error(t('profileAssets.toastSaveFailed'));
                return;
            }
            toast.success(t('profileAssets.toastDeleted'));
            setDeleteTarget(null);
            await reload();
        } finally {
            setIsDeleting(false);
        }
    }, [deleteTarget, t, reload]);

    const copyAssets = useCallback(async () => {
        if (savedAssets.length === 0) return;
        const lines = savedAssets.map((a) => {
            const type = ASSET_TYPES.find((t) => t.id === a.typeId)?.title || a.typeId;
            const sub = a.subTypeId
                ? ASSET_SUB_TYPES.find((s) => s.id === a.subTypeId)?.title || a.subTypeId
                : "";
            const header = sub ? `${type} → ${sub}` : type;
            return `${header}\n${a.title}${a.description ? `\n${a.description}` : ""}`;
        });
        const text = lines.join("\n\n");
        try {
            await navigator.clipboard.writeText(text);
            setJustCopied(true);
            toast.success(t('profileAssets.toastCopied', { count: savedAssets.length }));
            setTimeout(() => setJustCopied(false), 2000);
        } catch {
            toast.error(t('profileAssets.toastCopyBlocked'));
        }
    }, [savedAssets]);


    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !isMounted) return;

            const assets = await loadAndSyncAssets(user.id);
            if (isMounted) setSavedAssets(assets);
        };

        load();

        // Auto-refresh when the tab regains focus. Covers the common case
        // where the user came from /asset-mapping (different tab/route)
        // and the just-saved assets need a fresh DB read.
        const onFocus = () => {
            if (isMounted) reload();
        };
        window.addEventListener("focus", onFocus);

        return () => {
            isMounted = false;
            window.removeEventListener("focus", onFocus);
        };
    }, [reload]);

    const getAssetTypeName = (typeId: string) => {
        return ASSET_TYPES.find(t => t.id === typeId)?.title || typeId;
    };

    const getAssetSubTypeName = (subTypeId: string) => {
        return ASSET_SUB_TYPES.find(s => s.id === subTypeId)?.title || subTypeId;
    };

    const hasAssets = savedAssets.length > 0;

    return (
        <GameShellV2>
            <div className="p-6 pb-24 lg:p-8 lg:pb-8 max-w-3xl mx-auto">
                {/* ═══════ HEADER — Aurora editorial ═══════ */}
                {/* Day 63: was a flat "Boxes icon + bold sans-serif title +
                    grey subtitle + Panel3Actions row." Now: Cormorant title
                    with gold accent, italic Source Serif echo, Ornament
                    divider — same rhythm as AppleseedDisplay / Dossier. */}
                <header className="mb-6">
                    <div className="flex items-baseline justify-between flex-wrap gap-3">
                        <h1
                            className="text-3xl sm:text-4xl leading-[1.1] tracking-[-0.018em]"
                            style={{
                                // Strong cocktail — page-level Cormorant headline on cream wash.
                                ...cormorantTitle,
                                fontWeight: 700,
                                textShadow: legibleHeadlineHalo,
                            }}
                        >
                            {t('profileAssets.headerTitleBefore')}{" "}
                            <span
                                className="bg-clip-text text-transparent"
                                style={GOLD_TEXT_STYLE}
                            >
                                {t('profileAssets.headerTitleGold')}
                            </span>
                        </h1>
                        {/* Action row — primary CTA flips based on whether
                            there's something to leverage (Find Matches) vs
                            an empty-state nudge to map (Map Assets). */}
                        <div className="flex flex-wrap items-center gap-2">
                            {hasAssets && (
                                <button
                                    onClick={() => {
                                        // Day 63 night (Sasha 2026-05-07):
                                        // Find Matches IS the explicit moment
                                        // the user requests collaboration —
                                        // unlock COLLABORATE in the rail at
                                        // exactly this click, then navigate.
                                        // localStorage flag is read by
                                        // GameShellV2's unlockStatus on next
                                        // mount; the custom event prompts the
                                        // currently-mounted shell to re-read
                                        // immediately so the rail chip
                                        // appears without a refresh.
                                        try {
                                            window.localStorage.setItem(
                                                "fytt:collaborate-unlocked",
                                                "true",
                                            );
                                            window.dispatchEvent(
                                                new Event("fytt:collaborate-unlocked"),
                                            );
                                        } catch {
                                            // localStorage disabled — navigation still works,
                                            // user just won't have rail unlock until next reload
                                        }
                                        navigate("/game/collaborate/matches");
                                    }}
                                    className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 hover:translate-y-[-0.5px]"
                                    style={ceremonialPillPrimary}
                                >
                                    <Users className="w-3.5 h-3.5" style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))" }} />
                                    {t('profileAssets.ctaFindCollaborators')}
                                </button>
                            )}
                            <button
                                onClick={() => navigate("/asset-mapping?return=" + encodeURIComponent("/game/me/assets"))}
                                className="group inline-flex items-center gap-2 rounded-full px-4 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px]"
                                style={hasAssets ? ceremonialPill : ceremonialPillPrimary}
                            >
                                {hasAssets ? (
                                    <>
                                        <Plus className="w-3.5 h-3.5" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                                        {t('profileAssets.ctaAddMore')}
                                    </>
                                ) : (
                                    <>
                                        <span aria-hidden="true" style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))", fontSize: "14px" }}>✦</span>
                                        {t('profileAssets.ctaMapAssets')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <p
                        className="italic mt-2"
                        style={{
                            // Strong cocktail — page-level italic echo on cream wash.
                            ...legibleItalicEcho,
                            fontSize: "16px",
                            lineHeight: 1.5,
                        }}
                    >
                        {t('profileAssets.subtitle')}
                    </p>
                    <Ornament className="mt-5 sm:mt-6" />
                </header>

                {/* ═══════ Collapsible asset list ═══════ */}
                {/* Day 63: was "border + bg-white/85 with Boxes icon + count
                    + chevron." Now: parchment card with gold hairline +
                    Cormorant section title in the trigger row. */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={parchmentCard}
                >
                    {/* Day 63 evening: Refresh button moved OUT of the
                        toggle-row's button so it doesn't toggle the
                        collapsible when clicked. Sibling element to the
                        toggle button — wrapped in a flex row. */}
                    <div className="w-full flex items-center justify-between gap-3 px-5 py-4">
                        <button
                            onClick={() => setShowAssets(!showAssets)}
                            className="flex items-baseline gap-3 transition-colors hover:opacity-80 focus-visible:outline-none"
                        >
                            <Boxes
                                className="w-5 h-5 align-[-3px]"
                                style={{ color: "var(--skin-accent-gold, #b8860b)" }}
                            />
                            <span
                                style={{
                                    ...cormorantTitle,
                                    fontSize: "18px",
                                    fontWeight: 600,
                                }}
                            >
                                {t('profileAssets.listTitle')}
                            </span>
                            <span
                                style={{
                                    fontFamily: "'DM Sans', system-ui, sans-serif",
                                    fontVariantNumeric: "tabular-nums lining-nums",
                                    fontSize: "13px",
                                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                                }}
                            >
                                ({savedAssets.length})
                            </span>
                        </button>
                        <div className="flex items-center gap-3">
                            {/* Copy all assets to clipboard (single-tap export). */}
                            <button
                                onClick={copyAssets}
                                disabled={savedAssets.length === 0}
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200 hover:translate-y-[-0.5px] disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    fontFamily: "'DM Sans', system-ui, sans-serif",
                                    fontSize: "11px",
                                    letterSpacing: "0.10em",
                                    textTransform: "uppercase",
                                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                                    background: "var(--skin-card-fill, rgba(255, 255, 255, 0.55))",
                                    border: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
                                }}
                                title={t('profileAssets.copyButtonTitle')}
                            >
                                {justCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {justCopied ? t('profileAssets.copyDone') : t('profileAssets.copy')}
                            </button>
                            {/* Manual refresh — UX hint for the
                                propagation delay between Save-on-mapping
                                and the assets surfacing here. */}
                            <button
                                onClick={reload}
                                disabled={isReloading}
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200 hover:translate-y-[-0.5px] disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    fontFamily: "'DM Sans', system-ui, sans-serif",
                                    fontSize: "11px",
                                    letterSpacing: "0.10em",
                                    textTransform: "uppercase",
                                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                                    background: "var(--skin-card-fill, rgba(255, 255, 255, 0.55))",
                                    border: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
                                }}
                                title={t('profileAssets.refreshButtonTitle')}
                            >
                                {isReloading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-3 h-3" />
                                )}
                                {isReloading ? t('profileAssets.refreshing') : t('profileAssets.refresh')}
                            </button>
                            <button
                                onClick={() => setShowAssets(!showAssets)}
                                className="text-[var(--skin-text-muted,rgba(11,42,90,0.93))] hover:opacity-80"
                                aria-label={showAssets ? t('profileAssets.collapse') : t('profileAssets.expand')}
                            >
                                {showAssets ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {showAssets && (
                        <div
                            className="border-t max-h-[480px] overflow-y-auto"
                            style={{
                                borderColor: "var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
                            }}
                        >
                            {/* Day 63 evening: added the just-saved propagation
                                hint above the empty-state copy. Sasha hit a real
                                2-minute delay between Save-on-mapping and assets
                                surfacing here; this gives the user a clear
                                refresh path while we leave the underlying sync
                                code alone. */}
                            {savedAssets.length === 0 ? (
                                <div className="px-5 py-8 text-center space-y-4">
                                    <div
                                        className="mx-auto rounded-xl px-4 py-3 max-w-sm"
                                        style={{
                                            background: "rgba(212, 175, 55, 0.08)",
                                            border: "0.5px solid rgba(212, 175, 55, 0.30)",
                                        }}
                                    >
                                        <p
                                            className="italic"
                                            style={{
                                                fontFamily: "'Source Serif 4', serif",
                                                fontStyle: "italic",
                                                fontSize: "13px",
                                                lineHeight: 1.5,
                                                color: "var(--skin-goldDeep, #5d4307)",
                                            }}
                                        >
                                            {t('profileAssets.syncHintBefore')}{" "}
                                            <strong style={{ fontStyle: "normal" }}>{t('profileAssets.syncHintRefresh')}</strong>{" "}
                                            {t('profileAssets.syncHintAfter')}
                                        </p>
                                    </div>
                                    <p
                                        className="italic"
                                        style={{
                                            // sourceSerifBody now carries weight 600 + text-primary.
                                            // Empty state lives inside the parchment-card, so soft
                                            // halo treatment is sufficient (uniform bg).
                                            ...sourceSerifBody,
                                            fontStyle: "italic",
                                            fontSize: "15px",
                                            lineHeight: 1.55,
                                        }}
                                    >
                                        {t('profileAssets.emptyLine1')}
                                        <br />
                                        {t('profileAssets.emptyLine2')}
                                    </p>
                                    <div>
                                        <button
                                            onClick={() => navigate("/asset-mapping?return=" + encodeURIComponent("/game/me/assets"))}
                                            className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 hover:translate-y-[-0.5px]"
                                            style={ceremonialPillPrimary}
                                        >
                                            <span aria-hidden="true" style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))", fontSize: "14px" }}>✦</span>
                                            {t('profileAssets.ctaMapAssets')}
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                savedAssets.map((asset, i) => (
                                    <div
                                        key={asset.id || i}
                                        className="group/row px-5 py-3.5 last:rounded-b-2xl transition-colors hover:bg-white/40"
                                        style={{
                                            borderBottom:
                                                i < savedAssets.length - 1
                                                    ? "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))"
                                                    : "none",
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-baseline gap-1.5 mb-1">
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
                                                        {getAssetTypeName(asset.typeId)}
                                                    </span>
                                                    {asset.subTypeId && (
                                                        <span
                                                            style={{
                                                                fontFamily: "'Source Serif 4', serif",
                                                                fontStyle: "italic",
                                                                fontSize: "12px",
                                                                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
                                                            }}
                                                        >
                                                            → {getAssetSubTypeName(asset.subTypeId)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p
                                                    style={{
                                                        ...cormorantTitle,
                                                        fontSize: "16px",
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
                                            </div>
                                            {/* Only db-backed rows (asset.id present) can be
                                                edited/deleted — localStorage-only rows have no
                                                row to target on the server. */}
                                            {asset.id && (
                                                <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover/row:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditDialog(asset)}
                                                        aria-label={t('profileAssets.edit')}
                                                        title={t('profileAssets.edit')}
                                                        className="p-1.5 rounded-full hover:bg-white/60 transition-colors"
                                                        style={{ color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))" }}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget({ id: asset.id!, title: asset.title })}
                                                        aria-label={t('profileAssets.delete')}
                                                        title={t('profileAssets.delete')}
                                                        className="p-1.5 rounded-full hover:bg-white/60 transition-colors"
                                                        style={{ color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))" }}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Delete confirm — copies the destructive AlertDialog
                    pattern from MissionDiscoveryLanding's "start over"
                    dialog (gentle-pause register). */}
                <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>
                                {t('profileAssets.deleteConfirmTitle')}
                            </AlertDialogTitle>
                            <AlertDialogDescription style={{ fontFamily: "'Source Serif 4', serif" }}>
                                {t('profileAssets.deleteConfirmBody', { title: deleteTarget?.title || '' })}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>
                                {t('profileAssets.deleteConfirmCancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                disabled={isDeleting}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleConfirmDelete();
                                }}
                            >
                                {t('profileAssets.deleteConfirmConfirm')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Edit — cascading Type → Subtype → Category → Title →
                    Description form, prefilled from the row. */}
                <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                    <DialogContent className="max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>
                                {t('profileAssets.editTitle')}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label>{t('profileAssets.editTypeLabel')}</Label>
                                <Select value={editTypeId} onValueChange={handleEditTypeChange}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ASSET_TYPES.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>{t('profileAssets.editSubtypeLabel')}</Label>
                                <Select value={editSubTypeId} onValueChange={handleEditSubTypeChange} disabled={editSubTypes.length === 0}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {editSubTypes.map((sub) => (
                                            <SelectItem key={sub.id} value={sub.id}>
                                                {sub.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>{t('profileAssets.editCategoryLabel')}</Label>
                                <Select value={editCategoryId} onValueChange={setEditCategoryId} disabled={editCategories.length === 0}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {editCategories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>{t('profileAssets.editTitleLabel')}</Label>
                                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>{t('profileAssets.editDescriptionLabel')}</Label>
                                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={isSavingEdit}>
                                {t('profileAssets.editCancel')}
                            </Button>
                            <Button onClick={handleSaveEdit} disabled={isSavingEdit || !editTitle.trim()}>
                                {isSavingEdit ? t('profileAssets.editSaving') : t('profileAssets.editSave')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </GameShellV2>
    );
};

export default ProfileAssetsSection;
