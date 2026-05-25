import { useEffect, useRef } from "react";
import Hls from "hls.js";

/**
 * KarimeHlsBackground — atmospheric video background for Karime's pages
 * (/build/karime + /build/karime/intake).
 *
 * Day 81 (Sasha 2026-05-23): warm Moroccan-sunset interior scene —
 * sheer pink-cream curtain catching golden-hour light, brass altar
 * objects on a hand-carved wood table, hanging green plants, olive tree
 * in a clay pot, misty distant hills beyond an arched window. First
 * deviation from the platform's cool navy/gold Aurora skin on a Karime
 * route. Full per-route "karime" micro-skin (pane 1 + pane 2 warming
 * to terracotta tones, skin token swap) is shipped alongside.
 *
 * Renders `fixed inset-0 z-0` (same pattern as OyiIgnition's HLS bg).
 * Pane-3 content sits at z-10 above the video.
 *
 * Day 82 v3 (2026-05-24) — known issue: when GameShellV2 is in
 * forceMobileLayout mode and the user taps the menu pill, the nav-view
 * slide animation uses `transform: translateX(...)` on a parent div,
 * which creates a new stacking context that re-anchors this `fixed`
 * bg to the transformed box during the ~300ms slide. We tried portaling
 * to document.body to bypass this, but that introduced a worse problem:
 * portaled fixed elements paint ABOVE the React root in body's stacking
 * context, hiding all page content. Negative z-index fixes that for
 * video + veil but the grain layer (needs to sit above panes 1+2)
 * can't go negative. Accepting the brief slide-animation glitch as
 * the lesser of two evils.
 *
 * Swap-by-constant: when Sasha provides a better video URL later, update
 * MUX_URL here and both Karime pages get the new background.
 */

const MUX_URL =
  "https://stream.mux.com/RN6nrCkZx7xuer6WM01801KKJCARsy6GZuTTA00PiIzNsc.m3u8";

export const KarimeHlsBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ autoStartLoad: true });
      hls.loadSource(MUX_URL);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari iOS/macOS)
      video.src = MUX_URL;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
    }
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          // Day 82 v2 (holonic-roast fix #4): soft desaturation on the
          // video itself dampens the ivy (bright green) and cushion
          // (high-saturation terracotta), so they stop pulling the eye
          // away from the meditative center.
          // Day 83 v3 (Sasha 2026-05-25, Option B): push saturation
          // knockdown from 12% → 22% to reduce overall terracotta
          // dominance on the page. The ivy + cushion + walls all
          // soften further, but the video keeps enough warm hue to
          // read as the sanctuary it is.
          filter: "saturate(0.78)",
        }}
      />

      {/* Warm veil — Day 82 v2: two-layer stack. Bottom layer is the
          radial cream-to-terracotta vignette. Top layer is a directional
          darkener focused on the upper-right window zone (holonic-roast
          fix #2) so the sunset hotspot stops pulling the eye away from
          text. */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        aria-hidden="true"
        style={{
          background: [
            "radial-gradient(ellipse 60% 50% at 72% 32%, rgba(91, 42, 11, 0.4) 0%, transparent 75%)",
            "radial-gradient(ellipse 140% 100% at 50% 40%, rgba(255, 240, 220, 0.22) 0%, rgba(91, 42, 11, 0.48) 100%)",
          ].join(", "),
        }}
      />

      {/* Film grain — Day 82 v2 (holonic-roast fix #3): z-[60] so the
          grain covers panes 1+2 as well as pane 3, instead of stopping
          at the rail/sidebar edges. Soft-light blend keeps text and
          UI legibility preserved while adding tactile depth. Zero
          network cost, single paint, no animation. */}
      <div
        className="fixed inset-0 z-[60] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.85'/></svg>\")",
          backgroundRepeat: "repeat",
          backgroundSize: "400px 400px",
          mixBlendMode: "soft-light",
          opacity: 0.3,
        }}
      />
    </>
  );
};

export default KarimeHlsBackground;
