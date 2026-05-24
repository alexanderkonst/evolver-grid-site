import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
 * to terracotta tones, skin token swap) is shipped alongside; this
 * component just carries the pane-3 backdrop.
 *
 * Renders `fixed inset-0 z-0` (same pattern as OyiIgnition's HLS bg).
 * Pane-3 content sits at z-10 above the video. Panes 1+2 are recolored
 * via the karime skin tokens so they coordinate with this warm bg.
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

  // Day 82 v3 (Sasha 2026-05-24): mount through a portal at document.body
  // so the bg lives OUTSIDE GameShellV2's mobile-layout transform tree.
  // The mobile nav-view slide uses `transform: translateX(...)` on a parent
  // div, which creates a new stacking context — any `fixed` element inside
  // that parent gets re-anchored to the transformed box, not the viewport.
  // Portaling bypasses that: the video + veil + grain stay locked to the
  // viewport regardless of GameShellV2's internal layout state.
  //
  // SSR / pre-mount guard: bail to null if document.body isn't ready.
  // For client-only React apps this is true from the moment the app mounts,
  // but the guard prevents StrictMode + HMR re-execution races from
  // throwing into the ErrorBoundary.
  if (typeof document === "undefined" || !document.body) return null;

  return createPortal(
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
          // away from the meditative center. ~12% knock-down; just
          // enough that the highest-saturation elements settle into the
          // overall palette without losing any of the photo's depth.
          filter: "saturate(0.88)",
        }}
      />

      {/* Day 81 v2 (Sasha 2026-05-23): atmospheric overlay stack for
          legibility + tactile depth. Two layers, both `fixed inset-0`
          above the video and below the content. Panes 1+2 sit above
          this stack at higher z-index, so the overlay is scoped to the
          pane-3 viewport area only. Inspired by Kloroform's silk/grain
          texture aesthetic — adds the analog-film quality Sasha
          asked for. */}

      {/* Warm veil — Day 82 v2: two-layer stack. Bottom layer is the
          existing radial cream-to-terracotta vignette. TOP layer is a
          new directional darkener focused on the upper-right window
          zone (the sunset-window hotspot pulled the eye away from text
          even with the uniform veil active — holonic-roast fix #2).
          The directional ellipse is positioned at 72% 32%, so the
          brightest part of the bg gets the most knock-down while the
          cooler interior zones stay clear. */}
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

      {/* Film grain — Day 82 v2 (holonic-roast fix #3): z-index raised
          to [60] so the grain texture now covers panes 1+2 as well as
          pane 3, instead of stopping at the rail/sidebar edges. The
          flat warm-terracotta of pane 1+2 was reading as color blocks
          next to a richly textured photo; with the grain extended
          across the whole viewport, the three panes finally share the
          same tactile film quality. soft-light blend keeps the effect
          on solid surfaces subtle, so sidebar legibility is preserved.
          Zero network cost, single paint, no animation. */}
      <div
        className="fixed inset-0 z-[60] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.85'/></svg>\")",
          backgroundRepeat: "repeat",
          backgroundSize: "400px 400px",
          mixBlendMode: "soft-light",
          opacity: 0.55,
        }}
      />
    </>,
    document.body,
  );
};

export default KarimeHlsBackground;
