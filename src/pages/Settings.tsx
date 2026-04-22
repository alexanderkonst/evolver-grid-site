import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Palette, User, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameShellV2 from "@/components/game/GameShellV2";
import ProfileSettingsSection from "@/components/settings/ProfileSettingsSection";
import { useSkin, type Skin } from "@/contexts/SkinContext";
import { cn } from "@/lib/utils";

/**
 * Settings — unified settings page at /game/settings.
 *
 * Reorganized Day 48 (Sasha):
 *   - Profile tab    → personal info, billing, danger zone
 *   - Appearance tab → single skin toggle (Aurora · Navy + Gold)
 *
 * The old Appearance tab let the user hand-mix individual panel colors.
 * That's too much exposure for a product surface — we retired it in favor
 * of a simple two-option skin switch. The underlying `ThemeContext` still
 * exists for any legacy consumers; the skin system (see `SkinContext`)
 * is the canonical aesthetic control going forward.
 *
 * Deep links:
 *   /game/settings            → Profile tab (default)
 *   /game/settings?tab=profile
 *   /game/settings?tab=appearance
 */

interface SkinOption {
    id: Skin;
    label: string;
    tagline: string;
    description: string;
    /** Small square preview — the skin's signature two-color pairing. */
    swatch: { from: string; to: string };
}

const SKIN_OPTIONS: SkinOption[] = [
    {
        id: "aurora",
        label: "Aurora",
        tagline: "Light · pearlescent · rainbow highlights",
        description:
            "The default Genius Business skin. Cream-and-pastel editorial canvas with a UV→IR rainbow running through the 7-step methodology. Optimized for daylight reading and maximum clarity.",
        swatch: { from: "#f5f1e8", to: "#d4af37" },
    },
    {
        id: "navy-gold",
        label: "Navy + Gold",
        tagline: "Deep navy · gold accents · editorial dark",
        description:
            "Premium editorial alternate. Deep navy panels with a single gold metal accent. The methodology rainbow stays rainbow; hero highlights render in a gold family. Optimized for evening reading and ceremonial focus.",
        swatch: { from: "#0a1628", to: "#d4af37" },
    },
];

const AppearanceTab = () => {
    const { skin, setSkin } = useSkin();

    return (
        <div className="space-y-6">
            <div
                className="rounded-2xl p-5 sm:p-6 space-y-4"
                style={{
                    backgroundColor: "var(--skin-card-bg, rgba(255, 255, 255, 0.45))",
                    border: "1px solid var(--skin-card-border, rgba(26, 30, 58, 0.08))",
                    boxShadow:
                        "var(--skin-card-shadow, 0 4px 16px -8px rgba(10, 22, 40, 0.12), 0 16px 40px -20px rgba(10, 22, 40, 0.18))",
                }}
            >
                <div className="flex items-start gap-3">
                    <Palette
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                        style={{ color: "var(--skin-text-muted, rgba(26, 30, 58, 0.7))" }}
                    />
                    <div>
                        <h2
                            className="text-base font-semibold leading-tight"
                            style={{ color: "var(--skin-text-primary, #0a1628)" }}
                        >
                            Skin
                        </h2>
                        <p
                            className="text-sm mt-1 leading-relaxed"
                            style={{ color: "var(--skin-text-muted, rgba(26, 30, 58, 0.7))" }}
                        >
                            Pick the aesthetic that feels right. Applies instantly across the
                            whole app; we remember your choice on this device.
                        </p>
                    </div>
                </div>

                <div role="radiogroup" aria-label="Skin" className="grid sm:grid-cols-2 gap-3 pt-1">
                    {SKIN_OPTIONS.map((opt) => {
                        const active = opt.id === skin;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => setSkin(opt.id)}
                                className={cn(
                                    "relative text-left rounded-xl p-4 transition-all duration-200",
                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                    "hover:scale-[1.01] active:scale-[0.995]",
                                    active ? "ring-2" : "ring-1",
                                )}
                                style={{
                                    backgroundColor:
                                        "var(--skin-input-bg, rgba(255, 255, 255, 0.6))",
                                    borderColor: "transparent",
                                    ...(active
                                        ? {
                                              // Selected ring uses the skin's own "selected" accent.
                                              boxShadow:
                                                  "0 0 0 2px var(--skin-selected-border, rgba(132, 96, 234, 0.45)), 0 8px 24px -10px rgba(10, 22, 40, 0.18)",
                                          }
                                        : {
                                              boxShadow:
                                                  "0 0 0 1px var(--skin-rule-medium, rgba(26, 30, 58, 0.14)), 0 4px 12px -6px rgba(10, 22, 40, 0.1)",
                                          }),
                                }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Preview swatch — the skin's signature duotone. */}
                                        <div
                                            aria-hidden="true"
                                            className="w-10 h-10 rounded-lg flex-shrink-0"
                                            style={{
                                                backgroundImage: `linear-gradient(135deg, ${opt.swatch.from} 0%, ${opt.swatch.to} 100%)`,
                                                boxShadow:
                                                    "inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                        <div className="min-w-0">
                                            <div
                                                className="text-sm font-semibold leading-tight"
                                                style={{
                                                    color: "var(--skin-text-primary, #0a1628)",
                                                }}
                                            >
                                                {opt.label}
                                            </div>
                                            <div
                                                className="text-xs mt-0.5 leading-snug"
                                                style={{
                                                    color: "var(--skin-text-muted-soft, rgba(26, 30, 58, 0.6))",
                                                }}
                                            >
                                                {opt.tagline}
                                            </div>
                                        </div>
                                    </div>
                                    {active && (
                                        <span
                                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                                            style={{
                                                backgroundColor:
                                                    "var(--skin-selected-text, #8460ea)",
                                            }}
                                            aria-hidden="true"
                                        >
                                            <Check className="w-3 h-3 text-white" />
                                        </span>
                                    )}
                                </div>
                                <p
                                    className="text-xs mt-3 leading-relaxed"
                                    style={{
                                        color: "var(--skin-text-muted, rgba(26, 30, 58, 0.7))",
                                    }}
                                >
                                    {opt.description}
                                </p>
                            </button>
                        );
                    })}
                </div>

                <p
                    className="text-[11px] leading-relaxed pt-1"
                    style={{
                        color: "var(--skin-text-faint, rgba(26, 30, 58, 0.5))",
                    }}
                >
                    You can also flip to Navy + Gold by visiting <code>/preview</code> directly, or
                    back to Aurora via either this toggle or the floating indicator.
                </p>
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

    return (
        <GameShellV2>
            {/* Outer gradient retired — Settings inherits Panel 3's skin-aware wash. */}
            <div className="min-h-dvh">
                <div className="max-w-3xl mx-auto p-6">
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-lg transition-colors hover:bg-white/10"
                            aria-label="Back"
                        >
                            <ArrowLeft
                                className="w-5 h-5"
                                style={{
                                    color: "var(--skin-text-muted, rgba(44,49,80,0.7))",
                                }}
                            />
                        </button>
                        <div>
                            <h1
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--skin-text-primary, #2c3150)",
                                }}
                            >
                                Settings
                            </h1>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--skin-text-muted-soft, rgba(44,49,80,0.6))",
                                }}
                            >
                                Your account and preferences
                            </p>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="profile" className="gap-2">
                                <User className="w-4 h-4" />Profile
                            </TabsTrigger>
                            <TabsTrigger value="appearance" className="gap-2">
                                <Palette className="w-4 h-4" />Appearance
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="profile">
                            <ProfileSettingsSection />
                        </TabsContent>
                        <TabsContent value="appearance">
                            <AppearanceTab />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </GameShellV2>
    );
};

export default Settings;
