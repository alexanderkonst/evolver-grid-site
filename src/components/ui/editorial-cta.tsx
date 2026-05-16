import { type ReactNode, type MouseEventHandler } from "react";
import { cn } from "@/lib/utils";
import igniteLogo from "@/assets/ignite-logo.png";

/**
 * EditorialCta — the canonical landing CTA grammar, extracted.
 *
 * Day 67 (Sasha 2026-05-10): the landing's primary CTA pattern (rotating
 * ignite-logo emblem · small-caps tracked label · → arrow · dark glass pill
 * with breathing gold halo) was living only inside `PlaybookHero.tsx`.
 * Downstream surfaces (the QoL empty state, the asset-mapping intro, the
 * post-payment landing, etc.) were each inventing their own CTA dialect —
 * `liquid-glass-strong rounded-2xl` rectangles with ✦ glyphs and uppercase
 * dark text. Same brand, two grammars. The dialect drift was the source of
 * the "old UI" feel on the back-of-funnel surfaces.
 *
 * Per the holonic roast (P22 — Scaffold Engineering as Standard): patch
 * the one button and the next surface diverges again. Extract the
 * grammar into a shared component and every future surface gets cohesion
 * by import, not by memory.
 *
 * Usage:
 *   <EditorialCta label="Start Assessment" onClick={() => navigate("/...")} />
 *
 * Props:
 *   - `label` — the button text. Renders in uppercase + tracked spacing.
 *   - `onClick` — required. Click handler.
 *   - `icon?` — left emblem. Defaults to the rotating ignite-logo
 *     (60s linear spin). Pass `null` to omit. Pass a ReactNode to
 *     replace (e.g. <Sparkles /> from lucide).
 *   - `rightIcon?` — right glyph. Defaults to "→" with hover-slide.
 *     Pass `null` to omit.
 *   - `variant?` — "primary" (default, dark glass pill, white text,
 *     gold halo) or "secondary" (light glass pill, navy text, no halo).
 *   - `className?` — append/override.
 *   - `type?` — defaults to "button". Use "submit" inside forms.
 *   - `ariaLabel?` — when the label alone is ambiguous.
 *
 * The CSS classes `.liquid-glass-dark`, `.liquid-glass`, and `.cta-breath`
 * are defined in `src/index.css`. The CSS variables (`--skin-cta-bg`,
 * `--skin-cta-text`, `--skin-cta-shadow`, `--skin-cta-text-shadow`) come
 * from the active skin (Aurora by default). Don't hardcode colors here —
 * surfaces inherit the active skin automatically.
 */

export type EditorialCtaProps = {
    label: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
    icon?: ReactNode | null;
    rightIcon?: ReactNode | null;
    variant?: "primary" | "secondary";
    className?: string;
    type?: "button" | "submit" | "reset";
    ariaLabel?: string;
};

const DefaultLeftIcon = () => (
    <img
        src={igniteLogo}
        alt=""
        aria-hidden="true"
        className="h-4 w-auto opacity-80 transition-opacity group-hover:opacity-100"
        style={{
            filter: "drop-shadow(0 0 6px rgba(244, 212, 114, 0.45))",
            animation: "gentle-spin 60s linear infinite",
            willChange: "transform",
            transformOrigin: "center",
        }}
        draggable={false}
    />
);

const DefaultRightIcon = () => (
    <span
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:translate-x-0.5 text-[0.95em]"
    >
        →
    </span>
);

export const EditorialCta = ({
    label,
    onClick,
    icon,
    rightIcon,
    variant = "primary",
    className,
    type = "button",
    ariaLabel,
}: EditorialCtaProps) => {
    // `icon === undefined` → render default (rotating ignite-logo).
    // `icon === null`      → omit entirely.
    // any ReactNode        → render that.
    const leftIconNode = icon === undefined ? <DefaultLeftIcon /> : icon;
    const rightIconNode = rightIcon === undefined ? <DefaultRightIcon /> : rightIcon;

    if (variant === "secondary") {
        return (
            <button
                type={type}
                onClick={onClick}
                aria-label={ariaLabel}
                className={cn(
                    "group liquid-glass rounded-full",
                    "inline-flex items-center justify-center gap-2 sm:gap-2.5",
                    "px-4 sm:px-6 py-3 max-w-full",
                    "text-sm sm:text-base font-medium",
                    "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                    "focus-visible:ring-2 focus-visible:ring-[#0a1628]/30 outline-none",
                    className,
                )}
                style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: "var(--skin-link-secondary, rgba(26,30,58,0.85))",
                    textShadow:
                        "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                }}
            >
                {leftIconNode}
                <span
                    style={{
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                        fontSize: "0.88em",
                    }}
                >
                    {label}
                </span>
                {rightIconNode}
            </button>
        );
    }

    // primary variant — the landing's canonical CTA pattern
    return (
        <button
            type={type}
            onClick={onClick}
            aria-label={ariaLabel}
            className={cn(
                "group liquid-glass-dark cta-breath rounded-full",
                "inline-flex items-center justify-center gap-2 sm:gap-2.5",
                "px-4 sm:px-6 py-3 max-w-full",
                "text-sm sm:text-base font-semibold",
                "transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]",
                "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
                className,
            )}
            style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
                backgroundImage:
                    "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
                boxShadow:
                    "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
                textShadow:
                    "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
            }}
        >
            {leftIconNode}
            <span
                style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    fontSize: "0.88em",
                }}
            >
                {label}
            </span>
            {rightIconNode}
        </button>
    );
};

export default EditorialCta;
