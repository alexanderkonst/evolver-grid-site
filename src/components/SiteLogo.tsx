import { Link, useLocation } from "react-router-dom";

/**
 * SiteLogo — Circular logo, fixed top-CENTER of the viewport, links to home.
 * Hidden on routes whose shell already supplies a logo (SpacesRail in GameShellV2,
 * the playbook's top-right logo inside Panel 3, or custom hero treatments).
 */
const SiteLogo = () => {
    const location = useLocation();

    // Hide on pages that have their own logo/hero treatment.
    // `/playbook/*` has a top-right logo inside GameShellV2's Panel 3 already,
    // so rendering a second centered one is redundant (flagged by Sasha 2026-04-17).
    const hidden = ["/game", "/zone-of-genius/appleseed", "/playbook"];
    const exactHidden = ["/", "/ignite", "/my-result"];
    if (hidden.some(p => location.pathname.startsWith(p)) || exactHidden.includes(location.pathname)) return null;

    return (
        <Link
            to="/"
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 group"
            aria-label="Home"
        >
            <div className="w-[94px] h-[94px] rounded-full liquid-glass-strong ring-1 ring-white/15 shadow-[0_0_30px_rgba(255,255,255,0.06)] p-[3px] hover:scale-110 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] transition-all duration-300">
                <img
                    src="/evolver-logo.jpg"
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                    aria-hidden="true"
                />
            </div>
        </Link>
    );
};

export default SiteLogo;
