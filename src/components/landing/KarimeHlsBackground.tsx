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
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default KarimeHlsBackground;
