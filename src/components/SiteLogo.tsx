import { Link, useLocation } from "react-router-dom";

/**
 * SiteLogo — Circular logo, top-left corner, links to home.
 * Hidden on /game routes where SpacesRail has its own embedded logo.
 */
const SiteLogo = () => {
    const location = useLocation();

    // Hide on game pages, result pages, and ZoG appleseed view
    if (location.pathname.startsWith("/game") || location.pathname === "/my-result" || location.pathname.startsWith("/zone-of-genius/appleseed")) return null;

    return (
        <Link
            to="/"
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[60px] h-[60px] rounded-full overflow-hidden hover:scale-110 transition-transform duration-200"
            aria-label="Home"
        >
            <img
                src="/evolver-logo.jpg"
                alt=""
                className="w-full h-full object-cover"
                aria-hidden="true"
            />
        </Link>
    );
};

export default SiteLogo;
