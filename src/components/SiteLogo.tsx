import { Link, useLocation } from "react-router-dom";
import logoSrc from "@/assets/logo.jpg";

/**
 * Global site logo — fixed top-left on every page.
 * Hidden on /game routes where SpacesRail has its own embedded logo.
 */
const SiteLogo = () => {
  const location = useLocation();

  // Hide on game pages — SpacesRail has its own logo
  if (location.pathname.startsWith("/game")) return null;

  return (
    <Link
      to="/"
      className="fixed top-4 left-4 z-[9999] block w-10 h-10 md:w-12 md:h-12 group"
      aria-label="Home"
    >
      <div
        className="w-full h-full rounded-lg overflow-hidden"
        style={{
          WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 75%)",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 75%)",
        }}
      >
        <img
          src={logoSrc}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          draggable={false}
        />
      </div>
    </Link>
  );
};

export default SiteLogo;
