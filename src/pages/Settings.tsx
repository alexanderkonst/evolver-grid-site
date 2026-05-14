import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Palette, User, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameShellV2 from "@/components/game/GameShellV2";
import ProfileSettingsSection from "@/components/settings/ProfileSettingsSection";
import { useSkin, type Skin } from "@/contexts/SkinContext";
import { cn } from "@/lib/utils";
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
    label: string;
    tagline: string;
    swatchBackground: string;
    swatchOverlay?: React.ReactNode;
    /** Day 48 iter 14 (Sasha): lets an option render as "coming soon"
     *  — visible so users know it exists, but not clickable. */
    disabled?: boolean;
}

const SKIN_OPTIONS: SkinOption[] = [
    {
        id: "aurora",
        label: "Aurora",
        tagline: "Light · pearlescent · rainbow",
        swatchBackground:
            "linear-gradient(135deg, #f5f1e8 0%, #fde2e4 22%, #dbeafe 48%, #bbf7d0 72%, #fef3c7 100%)",
    },
    {
        id: "navy-gold",
        label: "Navy + Gold",
        tagline: "Deep navy · gold · editorial dark",
        // Day 48 iter 14 (Sasha): disabled pending a full QA pass on
        // the Navy+Gold skin — Aurora is the only skin shipping at
        // launch. Keeping the tile visible (muted, non-clickable,
        // "Coming soon" label) signals the capability without
        // letting users fall into a half-baked register.
        disabled: true,
        swatchBackground:
            "linear-gradient(135deg, #04081a 0%, #0a1628 55%, #142244 100%)",
        swatchOverlay: (
            <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center text-lg"
                style={{
                    color: "#d4af37",
                    textShadow:
                        "0 0 10px rgba(244,212,114,0.7), 0 0 3px rgba(212,175,55,0.85)",
                }}
            >
                ✦
            </span>
        ),
    },
];

const AppearanceTab = () => {
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
                    background: "rgba(255, 255, 255, 0.65)",
                    border: "1px solid hsla(228, 30%, 18%, 0.10)",
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
                            Skin
                        </h2>
                        <p
                            className="text-sm mt-1 leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                            }}
                        >
                            Pick the aesthetic that feels right. Applies instantly across the
                            whole app; we remember your choice on this device.
                        </p>
                    </div>
                </div>

                <div role="radiogroup" aria-label="Skin" className="grid sm:grid-cols-2 gap-3 pt-1">
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
                                    background: "rgba(255, 255, 255, 0.55)",
                                    border: active
                                        ? "1px solid hsla(40, 70%, 55%, 0.55)"
                                        : "1px solid hsla(228, 30%, 18%, 0.10)",
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
                                                <span>{opt.label}</span>
                                                {isDisabled && (
                                                    <span
                                                        className="text-[9px] tracking-[0.22em] uppercase font-semibold px-2 py-0.5 rounded-full"
                                                        style={{
                                                            backgroundColor: "rgba(212, 175, 55, 0.14)",
                                                            color: "#7a5108",
                                                            border: "0.5px solid rgba(212, 175, 55, 0.32)",
                                                            fontFamily: "'Cormorant Garamond', serif",
                                                            letterSpacing: "0.18em",
                                                        }}
                                                    >
                                                        Coming soon
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
                                                {opt.tagline}
                                            </div>
                                        </div>
                                    </div>
                                    {active && !isDisabled && (
                                        <span
                                            aria-hidden="true"
                                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: "#7a5108" }}
                                        >
                                            <Check className="w-3 h-3 text-white" />
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

const Settings = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get("tab") === "appearance" ? "appearance" : "profile";
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
                            aria-label="Back"
                        >
                            <ArrowLeft className="w-3 h-3" aria-hidden="true" />
                            <span>Back</span>
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
                            Your{" "}
                            <span
                                className="bg-clip-text text-transparent"
                                style={GOLD_TEXT_STYLE}
                            >
                                Settings
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
                            Your account and preferences.
                        </p>

                        <Ornament className="my-5 sm:my-6" />
                    </header>

                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        {/* Day 56 (Sasha 2026-05-02): tabs harmonized
                            with MeGate's editorial pill — light mute
                            base, Cormorant Garamond labels, gold tint
                            on active. */}
                        <TabsList
                            className="mb-6 h-auto p-1 rounded-full grid w-full grid-cols-2"
                            style={{
                                background: "hsla(228, 30%, 18%, 0.06)",
                                border: "1px solid hsla(228, 30%, 18%, 0.10)",
                            }}
                        >
                            <TabsTrigger
                                value="profile"
                                className={cn(
                                    "gap-2 rounded-full min-h-[44px] px-5 py-2 transition-all",
                                    "data-[state=active]:bg-white data-[state=active]:shadow-sm",
                                    "data-[state=inactive]:text-muted-foreground",
                                )}
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                    fontSize: "0.78rem",
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                    color:
                                        activeTab === "profile"
                                            ? "#7a5108"
                                            : undefined,
                                }}
                            >
                                <User className="w-3.5 h-3.5" />
                                Profile
                            </TabsTrigger>
                            <TabsTrigger
                                value="appearance"
                                className={cn(
                                    "gap-2 rounded-full min-h-[44px] px-5 py-2 transition-all",
                                    "data-[state=active]:bg-white data-[state=active]:shadow-sm",
                                    "data-[state=inactive]:text-muted-foreground",
                                )}
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                    fontSize: "0.78rem",
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                    color:
                                        activeTab === "appearance"
                                            ? "#7a5108"
                                            : undefined,
                                }}
                            >
                                <Palette className="w-3.5 h-3.5" />
                                Appearance
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="profile">
                            <ProfileSettingsSection />
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
                            Source-available. Fork for yourself or your community — free.
                            <br />
                            Going commercial? 10% revenue share, you keep your brand.
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
                            Source on GitHub →
                        </a>
                    </div>
                </div>
            </div>
        </GameShellV2>
    );
};

export default Settings;
