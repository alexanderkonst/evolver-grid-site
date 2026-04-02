import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollRestoration = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return;

    if (hash) {
      const id = decodeURIComponent(hash.replace("#", ""));

      // Try immediately (same-page hash links)
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }

      // Retry after render — cross-page navigation means the DOM isn't ready yet
      const retryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      };

      // Use rAF + timeout to wait for React to finish rendering the new page
      requestAnimationFrame(() => {
        setTimeout(retryScroll, 100);
      });
      // Final fallback for lazy-loaded content
      const fallbackTimer = setTimeout(retryScroll, 500);
      return () => clearTimeout(fallbackTimer);
    }

    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  return null;
};

export default ScrollRestoration;
