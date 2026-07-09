import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Bell, Download, Palette, User, Check } from "lucide-react";
import { generateProfilePdf } from "@/modules/profile/generateProfilePdf";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import GameShellV2 from "@/components/game/GameShellV2";
import ProfileSettingsSection from "@/components/settings/ProfileSettingsSection";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";
import { useSkin, type Skin } from "@/contexts/SkinContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { isAdminEmail } from "@/lib/isAdmin";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";

/**
 * Settings — unified settings page at /game/settings.
 *
 * Day 48 iter 12 (Sasha): visual pass to align with the landing
 * design language:
 *   • Cormorant Garamond "Settings" title + italic echo subtitle
 *     (same voice as the landing hero)
 *   • Back chip in the same glass-dark register as the Playbook's
 *     "Back" pill
 *   • Tabs get gold active accents (underline + text) instead of
 *     the stark white-on-white that was washing out
 *   • ProfileSettingsSection's "Log in or sign up" button upgraded
 *     to the landing CTA signature (glass-dark pill + ignite emblem
 *     + small-caps + breath) — was rendering as a white-on-white
 *     pill where the label was invisible
 */

interface SkinOption {
    id: Skin;
    /** i18n keys resolved with t() at render time. */
    labelKey: string;
    taglineKey: string;
    swatchBackground: string;
    swatchOverlay?: React.ReactNode;
    /** Day 48 iter 14 (Sasha): lets an option render as "coming soon"
     *  — visible so users know it exists, but not clickable. */
    disabled?: boolean;
}

// Day 91 (Sasha 2026-06-09): the chooser graduates with the two
// first-class themes — Lapis (light default: navy and gold on cream,
// the blue stone veined with gold) and Aurum (dark: gold on
// near-black). Navy+Gold stays internal-only at /preview; the old
// "Aurora" option was renamed Lapis with the platform-wide slug
// rename (localStorage migrates automatically).
const SKIN_OPTIONS: SkinOption[] = [
    {
        id: "lapis",
        labelKey: "settings.skinLapisLabel",
        taglineKey: "settings.skinLapisTagline",
        swatchBackground:
            "linear-gradient(135deg, #f5f1e8 0%, #ece7da 38%, #ccd6ea 68%, #f3e5c0 100%)",
        swatchOverlay: (
            <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center text-lg"
                style={{
                    color: "#0a1628",
                    textShadow: "0 0 8px rgba(212,175,55,0.45)",
                }}
            >
                ✦
            </span>
        ),
    },
    {
        id: "aurum",
        labelKey: "settings.skinAurumLabel",
        taglineKey: "settings.skinAurumTagline",
        swatchBackground:
            "linear-gradient(135deg, #020203 0%, #0a0a0e 55%, #1c1408 100%)",
        swatchOverlay: (
            <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center text-lg"
                style={{
                    color: "#d4a83a",
                    textShadow:
                        "0 0 10px rgba(240,200,112,0.7), 0 0 3px rgba(212,168,58,0.85)",
                }}
            >
                ✦
            </span>
        ),
    },
];

const AppearanceTab = () => {
    const { t } = useTranslation();
    const { skin, setSkin } = useSkin();

    return (
        <div className="space-y-6">
            {/* Day 56 (Sasha 2026-05-02): card swapped from shadcn
                bg-card/border-border (skin-dependent) to the explicit
                cream editorial register that matches MeGate +
                MethodologyLandingPage. Settings now reads as part of
                the same book, not a separate utility tier. */}
            <div
                className="rounded-2xl p-5 sm:p-6 space-y-4"
                style={{
                    background: "var(--skin-card-bg, rgba(255, 255, 255, 0.65))",
                    border: "1px solid var(--skin-hairline, hsla(228, 30%, 18%, 0.10))",
                    boxShadow:
                        "0 4px 16px -8px hsla(228, 30%, 18%, 0.10), inset 0 1px 0 hsla(0, 0%, 100%, 0.50)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                }}
            >
                <div className="flex items-start gap-3">
                    <Palette
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                        style={{ color: "hsl(40 70% 45%)" }}
                    />
                    <div>
                        <h2
                            className="text-xl leading-tight"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 600,
                                color: "var(--skin-text-primary, #0a1628)",
                            }}
                        >
                            {t("settings.skinHeading")}
                        </h2>
                        <p
                            className="text-sm mt-1 leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                            }}
                        >
                            {t("settings.skinDescription")}
                        </p>
                    </div>
                </div>

                <div role="radiogroup" aria-label={t("settings.skinHeading")} className="grid sm:grid-cols-2 gap-3 pt-1">
                    {SKIN_OPTIONS.map((opt) => {
                        const active = opt.id === skin;
                        const isDisabled = !!opt.disabled;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                aria-disabled={isDisabled}
                                onClick={() => {
                                    if (!isDisabled) setSkin(opt.id);
                                }}
                                disabled={isDisabled}
                                className={cn(
                                    "relative text-left rounded-xl p-4 transition-all duration-200",
                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/50 focus-visible:ring-offset-2",
                                    isDisabled
                                        ? "opacity-55 cursor-not-allowed shadow-sm"
                                        : cn(
                                              "hover:scale-[1.01] active:scale-[0.995]",
                                              active
                                                  ? "ring-2 ring-[#d4af37]/40 shadow-md"
                                                  : "shadow-sm",
                                          ),
                                )}
                                style={{
                                    background: "var(--skin-input-bg, rgba(255, 255, 255, 0.55))",
                                    border: active
                                        ? "1px solid hsla(40, 70%, 55%, 0.55)"
                                        : "1px solid var(--skin-hairline, hsla(228, 30%, 18%, 0.10))",
                                }}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            aria-hidden="true"
                                            className="relative w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden"
                                            style={{
                                                background: opt.swatchBackground,
                                                border: "1px solid hsla(228, 30%, 18%, 0.15)",
                                                boxShadow:
                                                    "inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.12)",
                                            }}
                                        >
                                            {opt.swatchOverlay}
                                        </div>
                                        <div className="min-w-0">
                                            <div
                                                className="text-base leading-tight flex items-center gap-2"
                                                style={{
                                                    fontFamily: "'Cormorant Garamond', serif",
                                                    fontWeight: 600,
                                                    color: "var(--skin-text-primary, #0a1628)",
                                                }}
                                            >
                                                <span>{t(opt.labelKey)}</span>
                                                {isDisabled && (
                                                    <span
                                                        className="text-[9px] tracking-[0.22em] uppercase font-semibold px-2 py-0.5 rounded-full"
                                                        style={{
                                                            backgroundColor: "rgba(212, 175, 55, 0.14)",
                                                            color: "var(--skin-tab-active-ink, #7a5108)",
                                                            border: "0.5px solid rgba(212, 175, 55, 0.32)",
                                                            fontFamily: "'Cormorant Garamond', serif",
                                                            letterSpacing: "0.18em",
                                                        }}
                                                    >
                                                        {t("settings.comingSoon")}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className="text-xs mt-0.5 leading-snug italic"
                                                style={{
                                                    fontFamily: "'Cormorant Garamond', serif",
                                                    color: "var(--skin-text-muted, rgba(26,30,58,0.6))",
                                                }}
                                            >
                                                {t(opt.taglineKey)}
                                            </div>
                                        </div>
                                    </div>
                                    {active && !isDisabled && (
                                        <span
                                            aria-hidden="true"
                                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: "var(--skin-tab-active-ink, #7a5108)" }}
                                        >
                                            <Check
                                                className="w-3 h-3"
                                                style={{ color: skin === "aurum" ? "#0a0a0c" : "#ffffff" }}
                                            />
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/**
 * NotificationsTab — Day 67 §8.6 (Sasha 2026-05-19).
 *
 * Holds per-user notification preferences. v1 surfaces one toggle:
 * `match_headsup_opt_out` — when true, the match heads-up email is
 * not sent (the underlying interest is still recorded silently).
 *
 * Designed to grow: any future per-feature opt-out (intro nudges,
 * weekly digests, etc.) goes here as additional rows.
 */
const NotificationsTab = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [optOut, setOptOut] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isFounder, setIsFounder] = useState(false);
    const [pulseOptOut, setPulseOptOut] = useState(false);
    const [pulseSaving, setPulseSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }
            setUserId(user.id);
            setIsFounder(isAdminEmail(user.email));
            const { data } = await supabase
                .from("game_profiles")
                .select("match_headsup_opt_out, pulse_email_opt_out")
                .eq("user_id", user.id)
                .maybeSingle();
            const row = data as { match_headsup_opt_out?: boolean; pulse_email_opt_out?: boolean } | null;
            setOptOut(!!row?.match_headsup_opt_out);
            setPulseOptOut(!!row?.pulse_email_opt_out);
            setLoading(false);
        };
        load();
    }, []);

    const handlePulseToggle = async (next: boolean) => {
        if (!userId) return;
        const prev = pulseOptOut;
        setPulseOptOut(next); // optimistic
        setPulseSaving(true);
        try {
            const { error } = await supabase
                .from("game_profiles")
                .update({ pulse_email_opt_out: next } as never)
                .eq("user_id", userId);
            if (error) throw error;
            toast({
                title: next ? t("settings.pulseEmailsPausedTitle") : t("settings.pulseEmailsResumedTitle"),
                description: next
                    ? t("settings.pulseEmailsPausedDescription")
                    : t("settings.pulseEmailsResumedDescription"),
            });
        } catch (err) {
            setPulseOptOut(prev); // revert on error
            toast({
                title: t("settings.couldntSaveTitle"),
                description: err instanceof Error ? err.message : t("settings.tryAgain"),
                variant: "destructive",
            });
        } finally {
            setPulseSaving(false);
        }
    };

    const handleToggle = async (next: boolean) => {
        if (!userId) return;
        const prev = optOut;
        setOptOut(next); // optimistic
        setSaving(true);
        try {
            const { error } = await supabase
                .from("game_profiles")
                .update({ match_headsup_opt_out: next } as never)
                .eq("user_id", userId);
            if (error) throw error;
            toast({
                title: next ? t("settings.headsUpsPausedTitle") : t("settings.headsUpsResumedTitle"),
                description: next
                    ? t("settings.headsUpsPausedDescription")
                    : t("settings.headsUpsResumedDescription"),
            });
        } catch (err) {
            setOptOut(prev); // revert on error
            toast({
                title: t("settings.couldntSaveTitle"),
                description: err instanceof Error ? err.message : t("settings.tryAgain"),
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div
                className="rounded-2xl p-5 sm:p-6 space-y-4"
                style={{
                    background: "var(--skin-card-bg, rgba(255, 255, 255, 0.65))",
                    border: "1px solid var(--skin-hairline, hsla(228, 30%, 18%, 0.10))",
                    boxShadow:
                        "0 4px 16px -8px hsla(228, 30%, 18%, 0.10), inset 0 1px 0 hsla(0, 0%, 100%, 0.50)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                }}
            >
                <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "hsl(40 70% 45%)" }} />
                    <div>
                        <h2
                            className="text-xl leading-tight"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 600,
                                color: "var(--skin-text-primary, #0a1628)",
                            }}
                        >
                            {t("settings.matchHeadsUpsHeading")}
                        </h2>
                        <p
                            className="text-sm mt-1 leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                            }}
                        >
                            {t("settings.matchHeadsUpsDescBefore")}
                            <em> {t("settings.matchHeadsUpsDescYes")} </em>
                            {t("settings.matchHeadsUpsDescOr")}
                            <em> {t("settings.matchHeadsUpsDescNotNow")}</em>{t("settings.matchHeadsUpsDescAfter")}
                        </p>
                    </div>
                </div>

                <div
                    className="flex items-center justify-between gap-4 rounded-xl p-4"
                    style={{
                        background: "rgba(212, 175, 55, 0.06)",
                        border: "0.5px solid rgba(212, 175, 55, 0.30)",
                    }}
                >
                    <div className="min-w-0">
                        <p
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 600,
                                fontSize: "15px",
                                color: "var(--skin-text-primary, #0a1628)",
                            }}
                        >
                            {t("settings.pauseHeadsUpEmailsLabel")}
                        </p>
                        <p
                            className="text-xs mt-1 leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                color: "var(--skin-text-muted, rgba(26,30,58,0.65))",
                            }}
                        >
                            {t("settings.pauseHeadsUpEmailsHint")}
                        </p>
                    </div>
                    <Switch
                        checked={optOut}
                        onCheckedChange={handleToggle}
                        disabled={loading || saving}
                        aria-label={t("settings.pauseHeadsUpEmailsAriaLabel")}
                    />
                </div>

                {isFounder && (
                    <div
                        className="flex items-center justify-between gap-4 rounded-xl p-4"
                        style={{
                            background: "rgba(212, 175, 55, 0.06)",
                            border: "0.5px solid rgba(212, 175, 55, 0.30)",
                        }}
                    >
                        <div className="min-w-0">
                            <p
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                    fontSize: "15px",
                                    color: "var(--skin-text-primary, #0a1628)",
                                }}
                            >
                                {t("settings.pausePulseEmailsLabel")}
                            </p>
                            <p
                                className="text-xs mt-1 leading-relaxed"
                                style={{
                                    fontFamily: "'Source Serif 4', Georgia, serif",
                                    color: "var(--skin-text-muted, rgba(26,30,58,0.65))",
                                }}
                            >
                                {t("settings.pausePulseEmailsHint")}
                            </p>
                        </div>
                        <Switch
                            checked={pulseOptOut}
                            onCheckedChange={handlePulseToggle}
                            disabled={loading || pulseSaving}
                            aria-label={t("settings.pausePulseEmailsAriaLabel")}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * DataExportTab — Day 79 (Sasha 2026-05-15).
 *
 * One-stop "take your data with you" surface. Lists every export the
 * platform offers and provides the action button for each. v1 surfaces
 * the unified Personal Profile PDF only — a single document containing
 * Top Talent, Mission, Assets, and Quality of Life in one place
 * (separate from the section-specific Top Talent PDF on the ZoG
 * Overview page, which stays as-is for now per Sasha's call).
 *
 * Growth path: each future export (CSV, JSON, raw zog_snapshot, etc.)
 * lands as another card in this tab. The button labels follow the
 * same "result-first" pattern as elsewhere on the platform: "Download
 * My Profile as PDF," not "Generate PDF."
 */
const DataExportTab = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [building, setBuilding] = useState(false);

    const handleDownloadProfile = async () => {
        if (building) return;
        setBuilding(true);
        try {
            await generateProfilePdf();
            toast({
                title: t("settings.profileDownloadedTitle"),
                description: t("settings.profileDownloadedDescription"),
            });
        } catch (err) {
            console.error("[DataExportTab] Profile PDF failed:", err);
            toast({
                title: t("settings.couldntBuildPdfTitle"),
                description: err instanceof Error ? err.message : t("settings.tryAgain"),
                variant: "destructive",
            });
        } finally {
            setBuilding(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Card 1: My Profile (unified PDF) — same editorial register
                as ProfileSettingsSection and the other tab content. */}
            <div
                className="rounded-2xl p-5 sm:p-6 space-y-5"
                style={{
                    background: "var(--skin-card-bg, rgba(255, 255, 255, 0.65))",
                    border: "1px solid var(--skin-hairline, hsla(228, 30%, 18%, 0.10))",
                    boxShadow:
                        "0 4px 16px -8px hsla(228, 30%, 18%, 0.10), inset 0 1px 0 hsla(0, 0%, 100%, 0.50)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                }}
            >
                <div className="flex items-start gap-3">
                    <Download
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                        style={{ color: "hsl(40 70% 45%)" }}
                    />
                    <div>
                        <h2
                            className="text-xl leading-tight"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 600,
                                color: "var(--skin-text-primary, #0a1628)",
                            }}
                        >
                            {t("settings.completeProfileHeading")}
                        </h2>
                        <p
                            className="text-sm mt-1 leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                            }}
                        >
                            {t("settings.completeProfileDescription")}
                        </p>
                    </div>
                </div>

                {/* What's in it — quick scan list so the user knows what
                    they're about to download. */}
                <div
                    className="rounded-xl p-4 space-y-1.5"
                    style={{
                        background: "rgba(212, 175, 55, 0.06)",
                        border: "0.5px solid rgba(212, 175, 55, 0.30)",
                    }}
                >
                    <p
                        className="text-xs uppercase tracking-[0.18em] font-semibold"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "var(--skin-tab-active-ink, #7a5108)",
                        }}
                    >
                        {t("settings.includedLabel")}
                    </p>
                    <ul
                        className="text-sm leading-relaxed space-y-0.5"
                        style={{
                            fontFamily: "'Source Serif 4', Georgia, serif",
                            color: "var(--skin-text-primary, #0a1628)",
                        }}
                    >
                        <li>· {t("settings.includedTopTalent")}</li>
                        <li>· {t("settings.includedMission")}</li>
                        <li>· {t("settings.includedAssets")}</li>
                        <li>· {t("settings.includedQualityOfLife")}</li>
                    </ul>
                </div>

                {/* Action button — matches the platform CTA register
                    (glass-dark pill, gold-on-dark, breath). */}
                <div className="flex justify-center pt-1">
                    <button
                        type="button"
                        onClick={handleDownloadProfile}
                        disabled={building}
                        className={cn(
                            "group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition-all duration-300",
                            "hover:scale-[1.02] active:scale-[0.98]",
                            "disabled:cursor-wait disabled:opacity-70 disabled:scale-100",
                        )}
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
                            backgroundImage:
                                "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(26,30,58,0.85) 50%, rgba(10,22,40,0.92) 100%))",
                            boxShadow:
                                "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
                            textShadow:
                                "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
                            letterSpacing: "0.02em",
                        }}
                    >
                        <Download className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span>{building ? t("settings.buildingPdf") : t("settings.downloadProfileAsPdf")}</span>
                    </button>
                </div>

                <p
                    className="text-xs text-center leading-relaxed"
                    style={{
                        fontFamily: "'Source Serif 4', Georgia, serif",
                        color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))",
                    }}
                >
                    {t("settings.pdfFooterNote")}
                </p>
            </div>
        </div>
    );
};

const Settings = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get("tab");
    // Day 78 (Sasha 2026-05-22): Appearance tab hidden pending a
    // production-ready chooser. Day 91 (Sasha 2026-06-09): RE-ENABLED —
    // the chooser ships with the two first-class themes (Lapis light /
    // Aurum dark) and the platform-wide dark-theme toggle work.
    const initialTab =
        tabParam === "notifications"
            ? "notifications"
            : tabParam === "export"
                ? "export"
                : tabParam === "appearance"
                    ? "appearance"
                    : "profile";
    const [activeTab, setActiveTab] = useState<string>(initialTab);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSearchParams(tab === "profile" ? {} : { tab }, { replace: true });
    };

    // Day 65 (Sasha 2026-05-14): forceShowNavigation. Settings is account
    // management — it must always render with the shell rail. Without this,
    // a user who just hit "Reset Progress" (which flips onboarding_stage →
    // 'new') is stranded on a navless page with no way back to the app,
    // since /game/settings isn't in isPublicSurface.
    return (
        <GameShellV2 showNavigation>
            <div className="min-h-dvh">
                {/* Day 56 (Sasha 2026-05-02): container narrowed and
                    rhythm tightened to match MethodologyLandingPage's
                    editorial column (max-w-[720px] · py-8/9/10). The
                    page now reads as part of the same book — same
                    voice, same column width, same vertical breath. */}
                <div className="max-w-[720px] mx-auto px-5 py-8 sm:py-9 md:py-10">
                    {/* Back pill — Day 48 iter 12 (Sasha): matches the Playbook
                        "Back" chip style so the return affordance reads
                        consistently across pages. */}
                    <div className="mb-5">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className={cn(
                                "inline-flex items-center gap-2 min-h-[44px] py-1.5 px-4 rounded-full",
                                "text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-medium",
                                "transition-all duration-300 hover:scale-[1.02]",
                                "focus-visible:ring-2 focus-visible:ring-[#d4af37]/40 outline-none",
                            )}
                            style={{
                                backgroundImage:
                                    "linear-gradient(135deg, rgba(26,30,58,0.08), rgba(26,30,58,0.02))",
                                border:
                                    "1px solid var(--skin-rule-strong, rgba(26,30,58,0.2))",
                                color: "var(--skin-link-secondary, rgba(26,30,58,0.85))",
                            }}
                            aria-label={t("settings.back")}
                        >
                            <ArrowLeft className="w-3 h-3" aria-hidden="true" />
                            <span>{t("settings.back")}</span>
                        </button>
                    </div>

                    {/* Hero — Cormorant Garamond + gold-accent + italic
                        echo + ornament divider, mirroring the landing
                        hero structure exactly. Day 56 (Sasha 2026-05-02):
                        added gold accent on "settings" and an Ornament
                        divider before the tabs so the rhythm matches
                        MethodologyLandingPage / MeGate. */}
                    <header className="text-center mb-8">
                        <h1
                            className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] tracking-[-0.018em] mb-4 sm:mb-5"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: "var(--skin-text-primary, #0a1628)",
                                textShadow:
                                    "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
                            }}
                        >
                            {t("settings.heroTitleBefore")}{" "}
                            <span
                                className="bg-clip-text text-transparent"
                                style={GOLD_TEXT_STYLE}
                            >
                                {t("settings.heroTitleGold")}
                            </span>
                        </h1>
                        <p
                            className="text-lg sm:text-xl md:text-2xl leading-[1.32] tracking-[-0.005em] italic"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 500,
                                color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                                textShadow:
                                    "var(--skin-text-halo-subtle, 0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.75))",
                            }}
                        >
                            {t("settings.heroSubtitle")}
                        </p>

                        <Ornament className="my-5 sm:my-6" />
                    </header>

                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        {/* Day 56 (Sasha 2026-05-02): tabs harmonized
                            with MeGate's editorial pill — light mute
                            base, Cormorant Garamond labels, gold tint
                            on active. */}
                        {/* Day 78 (Sasha 2026-05-22): grid-cols-3 → grid-cols-2.
                            Appearance trigger removed (skin chooser not ready
                            for end users). When the appearance tab returns,
                            flip back to grid-cols-3 + re-add the TabsTrigger
                            below.
                            Day 79 (Sasha 2026-05-15): grid-cols-2 → grid-cols-3
                            again — Export tab added for the unified Personal
                            Profile PDF + future data exports.
                            Day 109 (Sasha 2026-06-28): mobile grid now wraps
                            four visible tabs into two rows to prevent label
                            collision. */}
                        <TabsList
                            className="mb-6 h-auto p-1 rounded-[1.5rem] sm:rounded-full grid w-full grid-cols-2 sm:grid-cols-4 gap-1"
                            style={{
                                background: "hsla(228, 30%, 18%, 0.06)",
                                border: "1px solid var(--skin-hairline, hsla(228, 30%, 18%, 0.10))",
                            }}
                        >
                            <TabsTrigger
                                value="profile"
                                className={cn(
                                    "gap-1.5 sm:gap-2 rounded-full min-h-[44px] px-2 sm:px-5 py-2 transition-all",
                                    "data-[state=active]:bg-[var(--skin-tab-active-bg,#fff)] data-[state=active]:shadow-sm",
                                    "data-[state=inactive]:text-muted-foreground",
                                )}
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                    fontSize: "clamp(0.66rem, 2.35vw, 0.78rem)",
                                    letterSpacing: "clamp(0.045em, 0.45vw, 0.14em)",
                                    textTransform: "uppercase",
                                    color:
                                        activeTab === "profile"
                                            ? "var(--skin-tab-active-ink, #7a5108)"
                                            : undefined,
                                }}
                            >
                                <User className="w-3.5 h-3.5 flex-shrink-0" />
                                {t("settings.tabProfile")}
                            </TabsTrigger>
                            <TabsTrigger
                                value="notifications"
                                className={cn(
                                    "gap-1.5 sm:gap-2 rounded-full min-h-[44px] px-2 sm:px-5 py-2 transition-all",
                                    "data-[state=active]:bg-[var(--skin-tab-active-bg,#fff)] data-[state=active]:shadow-sm",
                                    "data-[state=inactive]:text-muted-foreground",
                                )}
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                    fontSize: "clamp(0.66rem, 2.35vw, 0.78rem)",
                                    letterSpacing: "clamp(0.045em, 0.45vw, 0.14em)",
                                    textTransform: "uppercase",
                                    color:
                                        activeTab === "notifications"
                                            ? "var(--skin-tab-active-ink, #7a5108)"
                                            : undefined,
                                }}
                            >
                                <Bell className="w-3.5 h-3.5 flex-shrink-0" />
                                {t("settings.tabNotifications")}
                            </TabsTrigger>
                            {/* Day 79 (Sasha 2026-05-15): Export tab — entry
                                point for the unified Personal Profile PDF
                                (Top Talent + Mission + Assets + QoL in one
                                document). Future data exports (CSV, JSON,
                                etc.) plug in as additional cards within the
                                DataExportTab — no new tabs needed. */}
                            <TabsTrigger
                                value="export"
                                className={cn(
                                    "gap-1.5 sm:gap-2 rounded-full min-h-[44px] px-2 sm:px-5 py-2 transition-all",
                                    "data-[state=active]:bg-[var(--skin-tab-active-bg,#fff)] data-[state=active]:shadow-sm",
                                    "data-[state=inactive]:text-muted-foreground",
                                )}
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                    fontSize: "clamp(0.66rem, 2.35vw, 0.78rem)",
                                    letterSpacing: "clamp(0.045em, 0.45vw, 0.14em)",
                                    textTransform: "uppercase",
                                    color:
                                        activeTab === "export"
                                            ? "var(--skin-tab-active-ink, #7a5108)"
                                            : undefined,
                                }}
                            >
                                <Download className="w-3.5 h-3.5 flex-shrink-0" />
                                {t("settings.tabExport")}
                            </TabsTrigger>
                            {/* Day 78 (Sasha 2026-05-22): Appearance trigger
                                hidden pending a production-ready chooser.
                                Day 91 (Sasha 2026-06-09): RE-ENABLED with
                                the first-class Lapis/Aurum themes. */}
                            <TabsTrigger
                                value="appearance"
                                className={cn(
                                    "gap-1.5 sm:gap-2 rounded-full min-h-[44px] px-2 sm:px-5 py-2 transition-all",
                                    "data-[state=active]:bg-[var(--skin-tab-active-bg,#fff)] data-[state=active]:shadow-sm",
                                    "data-[state=inactive]:text-muted-foreground",
                                )}
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                    fontSize: "clamp(0.66rem, 2.35vw, 0.78rem)",
                                    letterSpacing: "clamp(0.045em, 0.45vw, 0.14em)",
                                    textTransform: "uppercase",
                                    color:
                                        activeTab === "appearance"
                                            ? "var(--skin-tab-active-ink, #7a5108)"
                                            : undefined,
                                }}
                            >
                                <Palette className="w-3.5 h-3.5 flex-shrink-0" />
                                {t("settings.tabAppearance")}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="profile">
                            <ProfileSettingsSection />
                            {/* Language — the logged-in home for switching locale
                                (the floating switcher is guest-only). */}
                            <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/50 p-4">
                                <div>
                                    <p className="font-medium text-foreground">{t("settings.languageRowTitle")}</p>
                                    <p className="text-sm text-muted-foreground">{t("settings.languageRowHint")}</p>
                                </div>
                                <LanguageSwitcher />
                            </div>
                        </TabsContent>
                        <TabsContent value="notifications">
                            <NotificationsTab />
                        </TabsContent>
                        <TabsContent value="export">
                            <DataExportTab />
                        </TabsContent>
                        <TabsContent value="appearance">
                            <AppearanceTab />
                        </TabsContent>
                    </Tabs>

                    {/* Day 51 (Sasha 2026-04-25): quiet meta-footer pointing at
                        the open-source repo. Lives at the bottom of Settings
                        because it's utility / transparency, not a primary
                        action. Confirms the platform is forkable per the
                        Integration Layer Manifesto — walks the talk. */}
                    <div
                        className="mt-12 pt-6 text-center"
                        style={{
                            borderTop: "1px solid var(--skin-rule-soft, rgba(26,30,58,0.1))",
                        }}
                    >
                        <p
                            className="text-xs leading-relaxed"
                            style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))" }}
                        >
                            {t("settings.footerForkLine")}
                            <br />
                            {t("settings.footerCommercialLine")}
                        </p>
                        <a
                            href="https://github.com/alexanderkonst/evolver-grid-site"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-xs underline-offset-4 hover:underline transition-colors"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 600,
                                fontSize: "0.78rem",
                                letterSpacing: "0.06em",
                                color: "var(--skin-link-secondary, rgba(26,30,58,0.75))",
                            }}
                        >
                            {t("settings.sourceOnGithub")} →
                        </a>
                    </div>
                </div>
            </div>
        </GameShellV2>
    );
};

export default Settings;
