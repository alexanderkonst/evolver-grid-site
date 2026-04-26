import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition — site-wide signature transition.
 *
 * Day 51 (Sasha 2026-04-25): upgraded from a slow plain fade
 * (~500ms each way) to a snappier cross-fade.
 *
 * Day 51 night (Sasha 2026-04-25): the slide-in/slide-out portion
 * had to come off. tailwindcss-animate's slide utilities use
 * `animation-fill-mode: both` and leave a residual `transform`
 * on the wrapper after the animation lands. Any non-`none`
 * transform creates a CSS containing block for fixed AND sticky
 * descendants — which broke pane 1's `sticky top-0` (it scrolled
 * with the page instead of pinning to viewport top) and also
 * misaligned fixed-position bg videos. Cross-fade only now;
 * lose the 8px rise, gain working sticky across the shell.
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
      // Day 51 night (Sasha 2026-04-25): switched off tailwindcss-animate's
      // `animate-in / animate-out fade-*` utilities — even when only the
      // fade variant was used, they leave a residual identity matrix on
      // `transform` after the animation lands, which creates a CSS
      // containing block and breaks `sticky top-0` on pane 1. We now use
      // the project's own `.page-transition-enter` / `.page-transition-exit`
      // CSS classes (defined in index.css) which animate opacity only.
      className={
        transitionStage === "fadeOut"
          ? "page-transition-exit"
          : "page-transition-enter"
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
