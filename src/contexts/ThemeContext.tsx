import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Default color palette for 3-panel layout (dark → medium → light)
export interface ThemeColors {
    // Left panel (darkest)
    panelLeftBg: string;
    panelLeftText: string;
    panelLeftAccent: string;

    // Middle panel
    panelMiddleBg: string;
    panelMiddleText: string;
    panelMiddleBorder: string;

    // Right panel (lightest) - content area
    panelRightBgFrom: string;
    panelRightBgVia: string;
    panelRightBgTo: string;

    // Accents
    primaryAccent: string;
    secondaryAccent: string;
}

const DEFAULT_THEME: ThemeColors = {
    // Left panel - dark slate
    panelLeftBg: "#0f172a",
    panelLeftText: "#e2e8f0",
    panelLeftAccent: "#8460ea",

    // Middle panel - slightly lighter
    panelMiddleBg: "#1e293b",
    panelMiddleText: "#cbd5e1",
    panelMiddleBorder: "#334155",

    // Right panel - light gradient (wabi-sabi)
    panelRightBgFrom: "#e7e9e5",
    panelRightBgVia: "#dcdde2",
    panelRightBgTo: "#e7e9e5",

    // Accents
    primaryAccent: "#8460ea",
    secondaryAccent: "#29549f",
};

const STORAGE_KEY = "evolver_theme_colors";

interface ThemeContextType {
    colors: ThemeColors;
    setColors: (colors: Partial<ThemeColors>) => void;
    resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [colors, setColorsState] = useState<ThemeColors>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    return { ...DEFAULT_THEME, ...JSON.parse(saved) };
                } catch {
                    return DEFAULT_THEME;
                }
            }
        }
        return DEFAULT_THEME;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
    }, [colors]);

    const setColors = (newColors: Partial<ThemeColors>) => {
        setColorsState(prev => ({ ...prev, ...newColors }));
    };

    const resetToDefault = () => {
        setColorsState(DEFAULT_THEME);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <ThemeContext.Provider value={{ colors, setColors, resetToDefault }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return ctx;
};

export const useThemeColors = (): ThemeColors => {
    const ctx = useContext(ThemeContext);
    return ctx?.colors || DEFAULT_THEME;
};

export { DEFAULT_THEME };
