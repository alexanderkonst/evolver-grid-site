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

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, ChevronDown, ChevronUp, Users, Plus, ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { supabase } from "@/integrations/supabase/client";
import { ASSET_TYPES } from "@/modules/asset-mapping/data/assetTypes";
import { ASSET_SUB_TYPES } from "@/modules/asset-mapping/data/assetSubtypes";
import { loadAndSyncAssets, type SavedAsset } from "@/modules/asset-mapping/assetSync";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";

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
    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
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
    background: "rgba(255, 255, 255, 0.72)",
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

    const reload = useCallback(async () => {
        setIsReloading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const assets = await loadAndSyncAssets(user.id);
            setSavedAssets(assets);
        } finally {
            setIsReloading(false);
        }
    }, []);

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
                            Saved{" "}
                            <span
                                className="bg-clip-text text-transparent"
                                style={GOLD_TEXT_STYLE}
                            >
                                Assets
                            </span>
                        </h1>
                        {/* Action row — primary CTA flips based on whether
                            there's something to leverage (Find Matches) vs
                            an empty-state nudge to map (Map Assets). */}
                        <div className="flex flex-wrap items-center gap-2">
                            {hasAssets && (
                                <button
                                    onClick={() => navigate("/game/collaborate/matches")}
                                    className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 hover:translate-y-[-0.5px]"
                                    style={ceremonialPillPrimary}
                                >
                                    <Users className="w-3.5 h-3.5" style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))" }} />
                                    Find Matches
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
                                        Add more
                                    </>
                                ) : (
                                    <>
                                        <span aria-hidden="true" style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))", fontSize: "14px" }}>✦</span>
                                        Map your assets
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
                        The skills, tools, and resources you've mapped — yours to leverage with the right collaborator.
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
                                Your Assets
                            </span>
                            <span
                                style={{
                                    fontFamily: "'DM Sans', system-ui, sans-serif",
                                    fontVariantNumeric: "tabular-nums lining-nums",
                                    fontSize: "13px",
                                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                                }}
                            >
                                ({savedAssets.length})
                            </span>
                        </button>
                        <div className="flex items-center gap-3">
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
                                    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                                    background: "rgba(255, 255, 255, 0.55)",
                                    border: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
                                }}
                                title="Just saved assets and don't see them yet? Tap Refresh."
                            >
                                {isReloading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-3 h-3" />
                                )}
                                {isReloading ? "Refreshing" : "Refresh"}
                            </button>
                            <button
                                onClick={() => setShowAssets(!showAssets)}
                                className="text-[var(--skin-text-muted,rgba(11,42,90,0.55))] hover:opacity-80"
                                aria-label={showAssets ? "Collapse" : "Expand"}
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
                                            Just saved assets and don't see them yet? They can take up to a minute to sync — tap{" "}
                                            <strong style={{ fontStyle: "normal" }}>Refresh</strong>{" "}
                                            above.
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
                                        Nothing here yet.
                                        <br />
                                        Map your first resource so the right collaborators can find you.
                                    </p>
                                    <div>
                                        <button
                                            onClick={() => navigate("/asset-mapping?return=" + encodeURIComponent("/game/me/assets"))}
                                            className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 hover:translate-y-[-0.5px]"
                                            style={ceremonialPillPrimary}
                                        >
                                            <span aria-hidden="true" style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))", fontSize: "14px" }}>✦</span>
                                            Map your assets
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                savedAssets.map((asset, i) => (
                                    <div
                                        key={i}
                                        className="px-5 py-3.5 last:rounded-b-2xl transition-colors hover:bg-white/40"
                                        style={{
                                            borderBottom:
                                                i < savedAssets.length - 1
                                                    ? "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))"
                                                    : "none",
                                        }}
                                    >
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
                                                        color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
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
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </GameShellV2>
    );
};

export default ProfileAssetsSection;
