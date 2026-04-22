import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, RotateCcw, Palette, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme, DEFAULT_THEME, ThemeColors } from "@/contexts/ThemeContext";
import GameShellV2 from "@/components/game/GameShellV2";
import ProfileSettingsSection from "@/components/settings/ProfileSettingsSection";

/**
 * Settings — unified settings page at /game/settings.
 *
 * Reorganized 2026-04-21 (Sasha): consolidated what used to be split
 * between /game/me/settings (Profile) and /game/settings (Appearance).
 * Now a single tabbed page:
 *   - Profile tab    → personal info, billing, danger zone
 *   - Appearance tab → color theme customization (dev-leaning)
 *
 * Deep links:
 *   /game/settings            → Profile tab (default)
 *   /game/settings?tab=profile
 *   /game/settings?tab=appearance
 *
 * Legacy routes (/settings, /game/me/settings) redirect here.
 */

interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const ColorInput = ({ label, value, onChange }: ColorInputProps) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-sm text-[#2c3150]">{label}</span>
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border border-[#a4a3d0]/30"
            />
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-24 px-2 py-1 text-xs font-mono border border-[#a4a3d0]/30 rounded"
            />
        </div>
    </div>
);

const AppearanceTab = () => {
    const { colors, setColors, resetToDefault } = useTheme();
    const [localColors, setLocalColors] = useState<ThemeColors>(colors);

    const handleChange = (key: keyof ThemeColors, value: string) => {
        setLocalColors(prev => ({ ...prev, [key]: value }));
    };
    const handleSave = () => setColors(localColors);
    const handleReset = () => {
        setLocalColors(DEFAULT_THEME);
        resetToDefault();
    };
    const hasChanges = JSON.stringify(localColors) !== JSON.stringify(colors);

    return (
        <div className="space-y-6">
            <div className="bg-white/85 backdrop-blur-sm rounded-xl border border-[#a4a3d0]/20 overflow-hidden shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                <div className="px-4 py-3 bg-[#f0f4ff]/50 border-b border-[#a4a3d0]/20 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[rgba(44,49,80,0.7)]" />
                    <h2 className="font-semibold text-[#2c3150]">Color Theme</h2>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <h3 className="text-xs font-semibold text-[#2c3150]/60 uppercase tracking-wider mb-2">Left Panel (Darkest)</h3>
                        <ColorInput label="Background" value={localColors.panelLeftBg} onChange={v => handleChange("panelLeftBg", v)} />
                        <ColorInput label="Text" value={localColors.panelLeftText} onChange={v => handleChange("panelLeftText", v)} />
                        <ColorInput label="Accent" value={localColors.panelLeftAccent} onChange={v => handleChange("panelLeftAccent", v)} />
                    </div>
                    <hr className="border-[#a4a3d0]/20" />
                    <div>
                        <h3 className="text-xs font-semibold text-[#2c3150]/60 uppercase tracking-wider mb-2">Middle Panel</h3>
                        <ColorInput label="Background" value={localColors.panelMiddleBg} onChange={v => handleChange("panelMiddleBg", v)} />
                        <ColorInput label="Text" value={localColors.panelMiddleText} onChange={v => handleChange("panelMiddleText", v)} />
                        <ColorInput label="Border" value={localColors.panelMiddleBorder} onChange={v => handleChange("panelMiddleBorder", v)} />
                    </div>
                    <hr className="border-[#a4a3d0]/20" />
                    <div>
                        <h3 className="text-xs font-semibold text-[#2c3150]/60 uppercase tracking-wider mb-2">Content Area (Gradient)</h3>
                        <ColorInput label="Gradient Start" value={localColors.panelRightBgFrom} onChange={v => handleChange("panelRightBgFrom", v)} />
                        <ColorInput label="Gradient Middle" value={localColors.panelRightBgVia} onChange={v => handleChange("panelRightBgVia", v)} />
                        <ColorInput label="Gradient End" value={localColors.panelRightBgTo} onChange={v => handleChange("panelRightBgTo", v)} />
                    </div>
                    <hr className="border-[#a4a3d0]/20" />
                    <div>
                        <h3 className="text-xs font-semibold text-[#2c3150]/60 uppercase tracking-wider mb-2">Accent Colors</h3>
                        <ColorInput label="Primary" value={localColors.primaryAccent} onChange={v => handleChange("primaryAccent", v)} />
                        <ColorInput label="Secondary" value={localColors.secondaryAccent} onChange={v => handleChange("secondaryAccent", v)} />
                    </div>
                </div>
                <div className="px-4 py-3 bg-[#f0f4ff]/50 border-t border-[#a4a3d0]/20 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-[rgba(44,49,80,0.7)]">
                        <RotateCcw className="w-4 h-4 mr-2" />Reset to Default
                    </Button>
                    <Button onClick={handleSave} disabled={!hasChanges} className="bg-[#8460ea] hover:bg-[#7050da]">
                        Save Changes
                    </Button>
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
            {/* Day 47 very-late-night (autonomous skin pass):
                Outer gradient retired — Settings now inherits Panel 3's
                skin-aware wash from the shell. Previously this was a
                hardcoded pearl gradient that clashed with Navy+Gold. */}
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
