import { Link, useLocation } from "react-router-dom";

/**
 * SiteLogo — Circular logo, top-left corner, links to home.
 * Hidden on /game routes where SpacesRail has its own embedded logo.
 */
const SiteLogo = () => {
    const location = useLocation();

    // Hide on pages that have their own logo/hero treatment
    const hidden = ["/game", "/zone-of-genius/appleseed"];
    const exactHidden = ["/", "/ignite", "/my-result"];
    if (hidden.some(p => location.pathname.startsWith(p)) || exactHidden.includes(location.pathname)) return null;

    return (
        <Link
            to="/"
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90px] h-[90px] rounded-full overflow-hidden hover:scale-110 transition-transform duration-200"
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
