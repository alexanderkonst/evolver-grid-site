import { Link, useLocation } from "react-router-dom";
// Day 48 (Sasha): the brand logo (orb + FIND YOUR TOP TALENT wordmark).
// Same asset used by the SpacesRail and the top-right shell icon.
import brandLogo from "@/assets/find-your-top-talent-logo.png";

/**
 * SiteLogo — Full brand lockup, fixed top-center of the viewport, links to home.
 * Hidden on routes whose shell already supplies a logo (SpacesRail in GameShellV2,
 * the playbook's top-right logo inside Panel 3, or custom hero treatments).
 *
 * Day 48 (Sasha): retired the old round dodecahedron avatar in favor of
 * the full "FIND YOUR TOP TALENT" wordmark — consistent brand across
 * every surface that renders the logo.
 */
const SiteLogo = () => {
    const location = useLocation();

    // Hide on pages whose layout already carries the brand elsewhere.
    const hidden = [
        "/game",
        "/zone-of-genius",
        "/playbook",
        "/path",
        "/my-artifacts",
        "/auth",
    ];
    const exactHidden = ["/", "/ignite", "/my-result", "/path", "/auth"];
    if (hidden.some(p => location.pathname.startsWith(p)) || exactHidden.includes(location.pathname)) return null;

    return (
        <Link
            to="/"
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 group"
            aria-label="Find Your Top Talent — home"
        >
            <img
                src={brandLogo}
                alt="Find Your Top Talent"
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                style={{
                    filter: "drop-shadow(0 0 14px rgba(244, 212, 114, 0.3))",
                }}
                draggable={false}
            />
        </Link>
    );
};

export default SiteLogo;
