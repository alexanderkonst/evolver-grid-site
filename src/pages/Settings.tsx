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
    /** CSS `background` value used for the swatch — must visually reflect
     *  the skin's actual identity (pearlescent rainbow for Aurora, deep
     *  navy with a gold star for Navy+Gold). Day 48 (Sasha): the swatches
     *  should communicate each skin at a glance. */
    swatchBackground: string;
    /** Optional overlay content (e.g. the gold ✦ on Navy+Gold). */
    swatchOverlay?: React.ReactNode;
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
            {/* Day 48 (Sasha): card + options rendered with shadcn tokens
                (bg-card / text-foreground / border-border / text-muted-foreground)
                so Aurora and Navy+Gold don't mix tints. All tokens resolve
                through the [data-skin] CSS-var block in index.css. */}
            <div className="rounded-2xl p-5 sm:p-6 space-y-4 bg-card border border-border shadow-sm">
                <div className="flex items-start gap-3">
                    <Palette className="w-5 h-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <div>
                        <h2 className="text-base font-semibold leading-tight text-foreground">
                            Skin
                        </h2>
                        <p className="text-sm mt-1 leading-relaxed text-muted-foreground">
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
                                    "bg-background border",
                                    "hover:scale-[1.01] active:scale-[0.995]",
                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    active
                                        ? "border-primary ring-2 ring-primary/35 shadow-md"
                                        : "border-border shadow-sm",
                                )}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Preview swatch — each skin's actual identity at a glance. */}
                                        <div
                                            aria-hidden="true"
                                            className="relative w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden border border-border"
                                            style={{
                                                background: opt.swatchBackground,
                                                boxShadow:
                                                    "inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(0, 0, 0, 0.12)",
                                            }}
                                        >
                                            {opt.swatchOverlay}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold leading-tight text-foreground">
                                                {opt.label}
                                            </div>
                                            <div className="text-xs mt-0.5 leading-snug text-muted-foreground">
                                                {opt.tagline}
                                            </div>
                                        </div>
                                    </div>
                                    {active && (
                                        <span
                                            aria-hidden="true"
                                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-primary"
                                        >
                                            <Check className="w-3 h-3 text-primary-foreground" />
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

    return (
        <GameShellV2>
            {/* Outer gradient retired — Settings inherits Panel 3's skin-aware wash. */}
            <div className="min-h-dvh">
                <div className="max-w-3xl mx-auto p-6">
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-lg transition-colors hover:bg-accent"
                            aria-label="Back"
                        >
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Settings
                            </h1>
                            <p className="text-sm text-muted-foreground">
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
