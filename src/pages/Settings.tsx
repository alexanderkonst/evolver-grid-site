import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, DEFAULT_THEME, ThemeColors } from "@/contexts/ThemeContext";
import GameShellV2 from "@/components/game/GameShellV2";

interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const ColorInput = ({ label, value, onChange }: ColorInputProps) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-sm text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border border-slate-300"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-24 px-2 py-1 text-xs font-mono border border-slate-300 rounded"
            />
        </div>
    </div>
);

const Settings = () => {
    const navigate = useNavigate();
    const { colors, setColors, resetToDefault } = useTheme();
    const [localColors, setLocalColors] = useState<ThemeColors>(colors);

    const handleChange = (key: keyof ThemeColors, value: string) => {
        setLocalColors(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        setColors(localColors);
    };

    const handleReset = () => {
        setLocalColors(DEFAULT_THEME);
        resetToDefault();
    };

    const hasChanges = JSON.stringify(localColors) !== JSON.stringify(colors);

    return (
        <GameShellV2>
            <div className="max-w-2xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                        <p className="text-sm text-slate-500">Customize your experience</p>
                    </div>
                </div>

                {/* Color Customization */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-slate-600" />
                        <h2 className="font-semibold text-slate-900">Color Theme</h2>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Left Panel (Darkest) */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Left Panel (Darkest)
                            </h3>
                            <ColorInput
                                label="Background"
                                value={localColors.panelLeftBg}
                                onChange={(v) => handleChange("panelLeftBg", v)}
                            />
                            <ColorInput
                                label="Text"
                                value={localColors.panelLeftText}
                                onChange={(v) => handleChange("panelLeftText", v)}
                            />
                            <ColorInput
                                label="Accent"
                                value={localColors.panelLeftAccent}
                                onChange={(v) => handleChange("panelLeftAccent", v)}
                            />
                        </div>

                        <hr className="border-slate-200" />

                        {/* Middle Panel */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Middle Panel
                            </h3>
                            <ColorInput
                                label="Background"
                                value={localColors.panelMiddleBg}
                                onChange={(v) => handleChange("panelMiddleBg", v)}
                            />
                            <ColorInput
                                label="Text"
                                value={localColors.panelMiddleText}
                                onChange={(v) => handleChange("panelMiddleText", v)}
                            />
                            <ColorInput
                                label="Border"
                                value={localColors.panelMiddleBorder}
                                onChange={(v) => handleChange("panelMiddleBorder", v)}
                            />
                        </div>

                        <hr className="border-slate-200" />

                        {/* Right Panel (Content - Gradient) */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Content Area (Gradient)
                            </h3>
                            <ColorInput
                                label="Gradient Start"
                                value={localColors.panelRightBgFrom}
                                onChange={(v) => handleChange("panelRightBgFrom", v)}
                            />
                            <ColorInput
                                label="Gradient Middle"
                                value={localColors.panelRightBgVia}
                                onChange={(v) => handleChange("panelRightBgVia", v)}
                            />
                            <ColorInput
                                label="Gradient End"
                                value={localColors.panelRightBgTo}
                                onChange={(v) => handleChange("panelRightBgTo", v)}
                            />
                        </div>

                        <hr className="border-slate-200" />

                        {/* Accents */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Accent Colors
                            </h3>
                            <ColorInput
                                label="Primary"
                                value={localColors.primaryAccent}
                                onChange={(v) => handleChange("primaryAccent", v)}
                            />
                            <ColorInput
                                label="Secondary"
                                value={localColors.secondaryAccent}
                                onChange={(v) => handleChange("secondaryAccent", v)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="text-slate-600"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset to Default
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className="bg-[#8460ea] hover:bg-[#7050da]"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>

                {/* Preview */}
                <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                        <h2 className="font-semibold text-slate-900">Preview</h2>
                    </div>
                    <div className="p-4">
                        <div className="flex h-24 rounded-lg overflow-hidden border border-slate-200">
                            {/* Left Panel Preview */}
                            <div
                                className="w-12 flex items-center justify-center"
                                style={{ backgroundColor: localColors.panelLeftBg }}
                            >
                                <div
                                    className="w-6 h-6 rounded"
                                    style={{ backgroundColor: localColors.panelLeftAccent }}
                                />
                            </div>
                            {/* Middle Panel Preview */}
                            <div
                                className="w-32 p-2"
                                style={{
                                    backgroundColor: localColors.panelMiddleBg,
                                    borderRight: `1px solid ${localColors.panelMiddleBorder}`,
                                }}
                            >
                                <div
                                    className="h-2 w-16 rounded mb-1"
                                    style={{ backgroundColor: localColors.panelMiddleText, opacity: 0.5 }}
                                />
                                <div
                                    className="h-2 w-12 rounded"
                                    style={{ backgroundColor: localColors.panelMiddleText, opacity: 0.3 }}
                                />
                            </div>
                            {/* Right Panel Preview */}
                            <div
                                className="flex-1"
                                style={{
                                    background: `linear-gradient(135deg, ${localColors.panelRightBgFrom}, ${localColors.panelRightBgVia}, ${localColors.panelRightBgTo})`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </GameShellV2>
    );
};

export default Settings;
