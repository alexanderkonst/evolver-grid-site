import { useEffect, useRef } from "react";
import "./LunarPageLoader.css";

/**
 * The Suspense fallback of the whole app (App.tsx `PageLoader`), dressed for the Lunar skin
 * (issue #401, Sasha yes 2026-11-22). Under any other skin the CSS hides every layer here and
 * the original spinner shows, so no other screen changes.
 *
 *   A  matte      the crater texture, softened (blur) + film grain + vignette, so the
 *                 600-1200px textures read frosted instead of pixelated at 2000px
 *   B  moon       a crescent that waxes to full in ~1.6s, then holds and breathes
 *   C  chat pill  `data-page-loading` on <html> hides «Chat with us» while this is mounted
 *
 * The cursor glow (CustomCursor, z-cursor) is a separate layer above this and is untouched.
 */

/** Waxing length, ms. Must match the animation durations in LunarPageLoader.css. */
const WAX_MS = 1600;
/** Fade-out when the real content is ready, ms. Must match `.lunar-loader--leaving`. */
const LEAVE_MS = 420;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const LunarPageLoader = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    const startedAt = performance.now();
    html.setAttribute("data-page-loading", "");

    return () => {
      html.removeAttribute("data-page-loading");
      // Suspense unmounts the fallback the instant content is ready. Leave a copy behind that
      // resumes the moon at the same phase and fades out, so «ready» is a fade, not a cut.
      if (!root || reducedMotion() || html.getAttribute("data-skin") !== "lunar") return;
      const ghost = root.cloneNode(true) as HTMLDivElement;
      const elapsed = Math.min(performance.now() - startedAt, WAX_MS) / 1000;
      ghost.style.setProperty("--ll-elapsed", `${elapsed}s`);
      ghost.classList.add("lunar-loader--leaving");
      ghost.setAttribute("aria-hidden", "true");
      ghost.removeAttribute("role");
      // A new loader may mount while the ghost fades: give the copy its own mask id so it
      // keeps its own phase instead of resolving to the live loader's mask.
      const maskId = `lunar-loader-phase-leaving-${Math.round(startedAt)}`;
      ghost.querySelector("mask")?.setAttribute("id", maskId);
      ghost.querySelector(".lunar-loader__lit")?.setAttribute("mask", `url(#${maskId})`);
      document.body.appendChild(ghost);
      window.setTimeout(() => ghost.remove(), LEAVE_MS + 60);
    };
  }, []);

  return (
    <div className="page-loader flex h-screen items-center justify-center bg-[#0a0a1a]">
      {/* Every skin but Lunar: the original spinner. */}
      <div className="page-loader__spinner h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-transparent" />

      {/* Lunar: matte layers + waxing moon. Hidden unless [data-skin="lunar"]. */}
      <div ref={rootRef} className="lunar-loader" role="status" aria-label="Loading">
        <div className="lunar-loader__texture" />
        <div className="lunar-loader__vignette" />
        <div className="lunar-loader__grain" />
        <svg className="lunar-loader__moon" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <defs>
            {/* Lit part of a waxing moon (sunlit on the right): the right half-disc, minus a
                dark ellipse that shrinks to nothing (crescent -> half), plus a light ellipse
                that grows to the full disc (half -> full). */}
            <mask id="lunar-loader-phase" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
              <path d="M50 4 A46 46 0 0 1 50 96 Z" fill="#fff" />
              <ellipse className="lunar-loader__eraser" cx="50" cy="50" rx="46" ry="46" fill="#000" />
              <ellipse className="lunar-loader__adder" cx="50" cy="50" rx="46" ry="46" fill="#fff" />
            </mask>
          </defs>
          <circle className="lunar-loader__disc" cx="50" cy="50" r="46" />
          <circle className="lunar-loader__lit" cx="50" cy="50" r="46" mask="url(#lunar-loader-phase)" />
        </svg>
      </div>
    </div>
  );
};

export default LunarPageLoader;
