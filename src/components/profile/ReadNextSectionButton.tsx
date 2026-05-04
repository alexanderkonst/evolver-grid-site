/**
 * ReadNextSectionButton — sequential navigator across the My Top Talent
 * subpages. Day 58 (Sasha 2026-05-02 evening): added so a first-read
 * user can move through the deep profile in order without having to
 * jump back to the side-nav each time. Renders nothing on the last
 * subpage (no "next" to go to).
 *
 * Source of truth for the order is ZOG_SUBPAGE_ORDER below. Keep it
 * in sync with the side-nav order in `SectionsPanel.tsx` — both lists
 * should reference the same canonical sequence.
 */
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Canonical order of My Top Talent subpages. Matches the SectionsPanel
 * subSections list. Start Here is included so the post-payment landing
 * also has a "next" button.
 */
export const ZOG_SUBPAGE_ORDER: Array<{ path: string; label: string }> = [
    { path: "/game/me/zone-of-genius/start-here", label: "Start Here" },
    { path: "/game/me/zone-of-genius", label: "Overview" },
    { path: "/game/me/zone-of-genius/how-it-shows-up", label: "How It Shows Up" },
    { path: "/game/me/zone-of-genius/three-key-talents", label: "Three Talents in Depth" },
    { path: "/game/me/zone-of-genius/top-shadow", label: "Top Shadow" },
    { path: "/game/me/zone-of-genius/mastery", label: "Path of Mastery" },
    { path: "/game/me/zone-of-genius/one-action", label: "One Action" },
    { path: "/game/me/zone-of-genius/roles", label: "Ideal Environments" },
    { path: "/game/me/zone-of-genius/partner", label: "Complementary Partner" },
    { path: "/game/me/zone-of-genius/monetization", label: "Monetization" },
];

/**
 * Returns the next subpage entry given the current pathname, or null
 * if we're already on the last subpage.
 */
export function getNextZogSubpage(currentPath: string): { path: string; label: string } | null {
    const idx = ZOG_SUBPAGE_ORDER.findIndex((s) => s.path === currentPath);
    if (idx === -1 || idx >= ZOG_SUBPAGE_ORDER.length - 1) return null;
    return ZOG_SUBPAGE_ORDER[idx + 1];
}

interface ReadNextSectionButtonProps {
    /** The current pathname. Pass `location.pathname` from useLocation. */
    currentPath: string;
}

const ReadNextSectionButton = ({ currentPath }: ReadNextSectionButtonProps) => {
    const next = getNextZogSubpage(currentPath);
    if (!next) return null;

    return (
        <div className="flex justify-center pt-2">
            <Link
                to={next.path}
                className="group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
                <span style={{ letterSpacing: "0.02em" }}>
                    Read next: {next.label}
                </span>
                <ArrowRight
                    aria-hidden="true"
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
                />
            </Link>
        </div>
    );
};

export default ReadNextSectionButton;
