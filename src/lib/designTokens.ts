/**
 * Design System Tokens
 * Centralized configuration for fonts, colors, spacing
 * Easy to customize for white-label versions
 */

// ============================================
// FONTS
// ============================================
export const fonts = {
    // Headlines: Elegant serif for titles and hero text
    headline: "'Fraunces', serif",
    // Body: Clean sans-serif for readable content
    body: "'Inter', sans-serif",
    // Monospace: For code or technical content
    mono: "'JetBrains Mono', monospace",
};

// Google Fonts import URL (add to index.html or use @import)
export const fontImportUrl =
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&display=swap";

// ============================================
// COLORS - Wabi-sabi + Apple Industrial Palette
// ============================================
export const colors = {
    // Primary brand colors
    primary: {
        violet: "#8460ea",
        deepBlue: "#29549f",
        navy: "#1e4374",
        lightViolet: "#a4a3d0",
    },

    // Text colors
    text: {
        primary: "#2c3150",    // Dark slate for main text
        secondary: "#a4a3d0",  // Muted violet for secondary
        muted: "#6b7280",      // Gray for subtle text
        white: "#ffffff",
    },

    // Background colors
    background: {
        light: "#f5f5ff",      // Light lavender tint
        cream: "#ebe8f7",      // Soft cream violet
        white: "#ffffff",
        dark: "#2c3150",       // Dark slate
    },

    // Accent/feedback colors
    accent: {
        amber: "#f59e0b",      // Warm amber for highlights
        green: "#10b981",      // Success
        red: "#ef4444",        // Error/warning
        cyan: "#a7cbd4",       // Cool cyan accent
    },

    // Gradient definitions
    gradients: {
        primary: "from-[#8460ea] via-[#a4a3d0] to-[#a7cbd4]",
        warmSunset: "from-[#c8b7d8] via-[#cea4ae] to-[#cec9b0]",
        coolOcean: "from-[#a7ccce] via-[#b1c9b6] to-[#cec9b0]",
        deepSpace: "from-[#1e4374] via-[#29549f] to-[#6894d0]",
        darkPurple: "from-[#2c3150] via-[#342c48] to-[#8460ea]",
        subtle: "from-white via-[#f5f5ff] to-[#ebe8f7]",
    },
};

// ============================================
// SPACING - Compact values for one-screen layouts
// ============================================
export const spacing = {
    // Page padding
    pagePadding: "px-4 py-1",
    // Section gaps
    sectionGap: "space-y-2",
    // Card padding
    cardPadding: "p-3",
    // Element margins
    compact: {
        mb: "mb-1",
        mt: "mt-1",
        my: "my-1",
    },
};

// ============================================
// TYPOGRAPHY - Size presets
// ============================================
export const typography = {
    // Headlines
    h1: "text-lg lg:text-xl font-bold",
    h2: "text-base lg:text-lg font-semibold",
    h3: "text-sm lg:text-base font-semibold",
    // Body text
    body: "text-sm",
    bodySmall: "text-xs",
    // Labels
    label: "text-[10px] font-medium uppercase tracking-wide",
    labelSmall: "text-[9px] font-medium uppercase tracking-wide",
};

// ============================================
// CSS Custom Properties (for CSS-based theming)
// ============================================
export const cssVariables = `
:root {
  --font-headline: 'Fraunces', serif;
  --font-body: 'Inter', sans-serif;
  
  --color-primary: #8460ea;
  --color-primary-deep: #29549f;
  --color-text: #2c3150;
  --color-text-muted: #a4a3d0;
  --color-background: #f5f5ff;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
}
`;

// Export a theme object for easy component usage
export const theme = {
    fonts,
    colors,
    spacing,
    typography,
};

export default theme;
