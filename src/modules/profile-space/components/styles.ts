// Profile Space — shared visual atoms.
//
// Pulled verbatim (same values) from ProfileAssetsSection.tsx /
// ProfileMissionSection.tsx so every Profile Space card matches the
// existing ME-space editorial register: Cormorant Garamond headings,
// Source Serif 4 body, parchment cards with a gold hairline, on the
// cream wash GameShellV2 supplies. Centralized here so the 9 section
// components don't each redeclare the same CSSProperties objects.

import type { CSSProperties } from "react";

export const cormorantTitle: CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 700,
    letterSpacing: "-0.005em",
    color: "var(--skin-text-primary, #0b2a5a)",
    textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
};

export const sourceSerifBody: CSSProperties = {
    fontFamily: "'Source Serif 4', serif",
    fontWeight: 600,
    color: "var(--skin-text-primary, #0b2a5a)",
};

export const legibleHeadlineHalo =
    "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))";

export const legibleItalicEcho: CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontWeight: 700,
    letterSpacing: "0.01em",
    color: "var(--skin-text-primary, #0a1628)",
    textShadow: legibleHeadlineHalo,
};

export const labelMuted: CSSProperties = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    fontSize: "10.5px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "var(--skin-text-muted, rgba(11, 42, 90, 0.93))",
};

export const parchmentCard: CSSProperties = {
    background: "var(--skin-card-bg, rgba(255, 255, 255, 0.68))",
    border: "0.5px solid rgba(212, 175, 55, 0.45)",
    boxShadow:
        "0 0 22px -8px rgba(212, 175, 55, 0.25), 0 16px 40px -20px rgba(10, 22, 40, 0.18)",
};

export const ceremonialPill: CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontSize: "12px",
    color: "var(--skin-text-primary, #0b2a5a)",
    background: "var(--skin-card-fill, rgba(255, 255, 255, 0.72))",
    border: "0.5px solid rgba(212, 175, 55, 0.55)",
    boxShadow: "0 0 14px -4px rgba(212, 175, 55, 0.32)",
};

export const ceremonialPillPrimary: CSSProperties = {
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

export const goldHairline = "0.5px solid rgba(212, 175, 55, 0.30)";

export const mutedText: CSSProperties = {
    fontFamily: "'Source Serif 4', Georgia, serif",
    color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
};

/** Wrapper for every card on the Profile Space home page. */
export const cardShell: CSSProperties = {
    ...parchmentCard,
    borderRadius: "1rem",
    padding: "1.25rem",
};
