import { Link, useLocation } from "react-router-dom";

/**
 * SiteLogo — Circular logo, top-left corner, links to home.
 * Hidden on /game routes where SpacesRail has its own embedded logo.
 */
const SiteLogo = () => {
    const location = useLocation();

    // Hide on game pages and result pages
    if (location.pathname.startsWith("/game") || location.pathname === "/my-result") return null;

    return (
        <Link
            to="/"
            className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full overflow-hidden hover:scale-110 transition-transform duration-200"
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
