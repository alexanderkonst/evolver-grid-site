import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition — site-wide signature transition.
 *
 * Day 51 (Sasha 2026-04-25): upgraded from a slow plain fade
 * (~500ms each way, no motion) to a snappier cross-fade + rise.
 * Out: 150ms fade-up exit (4px lift). In: 250ms fade-from-below
 * with an 8px rise. Reads as "the page settles into place"
 * rather than a flash. Respects prefers-reduced-motion via
 * tailwindcss-animate's built-in handling.
 */
const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  return (
    <div
      className={
        transitionStage === "fadeOut"
          ? "animate-out fade-out-0 slide-out-to-top-1 duration-150 fill-mode-forwards"
          : "animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
      }
      onAnimationEnd={() => {
        if (transitionStage === "fadeOut") {
          setTransitionStage("fadeIn");
          setDisplayLocation(location);
        }
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
