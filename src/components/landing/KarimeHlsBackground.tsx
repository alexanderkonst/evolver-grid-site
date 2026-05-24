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
      />

      {/* Day 81 v2 (Sasha 2026-05-23): atmospheric overlay stack for
          legibility + tactile depth. Two layers, both `fixed inset-0`
          above the video and below the content. Panes 1+2 sit above
          this stack at higher z-index, so the overlay is scoped to the
          pane-3 viewport area only. Inspired by Kloroform's silk/grain
          texture aesthetic — adds the analog-film quality Sasha
          asked for. */}

      {/* Warm veil — radial gradient: soft cream center fading to a
          deeper terracotta wash at the edges. Functions as a soft
          vignette + global contrast dampener. Lifts dark text against
          bright bg areas; pushes the video's extremes toward a
          legible middle. */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 140% 100% at 50% 40%, rgba(255, 240, 220, 0.16) 0%, rgba(91, 42, 11, 0.38) 100%)",
        }}
      />

      {/* Film grain — SVG turbulence noise as a tile-able inline data
          URI. `mix-blend-mode: soft-light` blends the grain with the
          video below so it reads as organic film texture, not pixel
          noise. Opacity tuned to be pronounced enough to feel tactile
          (per Sasha's "maybe even more pronounced") without obscuring
          the imagery. Zero network cost, single paint, no animation. */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none"
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
    </>
  );
};

export default KarimeHlsBackground;
