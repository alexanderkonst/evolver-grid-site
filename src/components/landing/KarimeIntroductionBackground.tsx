import { useEffect, useRef, useState } from "react";

// The existing Karime sanctuary film, kept within this page's hero so its
// presentation do not change the other Karime routes.
const SOURCE = "https://stream.mux.com/RN6nrCkZx7xuer6WM01801KKJCARsy6GZuTTA00PiIzNsc.m3u8";
const POSTER = "/karime/introduction/sanctuary.webp";

export default function KarimeIntroductionBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wantsPlayback = useRef(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [shouldLoad] = useState(wantsPlayback.current);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (preference.matches) {
        wantsPlayback.current = false;
        videoRef.current?.pause();
      }
    };
    preference.addEventListener("change", onChange);
    return () => preference.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    const video = videoRef.current;
    if (!video) return;
    let disposed = false;
    let destroy: (() => void) | undefined;
    const playWhenReady = () => {
      if (wantsPlayback.current) void video.play().catch(() => { /* Keep the poster if autoplay is blocked. */ });
    };
    video.addEventListener("loadedmetadata", playWhenReady);

    void import("hls.js").then(({ default: Hls }) => {
        if (disposed) return;
        if (!Hls.isSupported()) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = SOURCE;
            // preload=none otherwise waits for playback, while the metadata
            // handler waits for loading: explicitly start the native path.
            video.load();
            playWhenReady();
          } else {
            setFailed(true);
          }
          return;
        }
        const hls = new Hls({ autoStartLoad: true, maxBufferLength: 15 });
        destroy = () => hls.destroy();
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setFailed(true);
            hls.destroy();
          }
        });
        hls.loadSource(SOURCE);
        hls.attachMedia(video);
      }).catch(() => { if (!disposed) setFailed(true); });

    return () => {
      disposed = true;
      video.removeEventListener("loadedmetadata", playWhenReady);
      video.pause();
      destroy?.();
      video.removeAttribute("src");
      video.load();
    };
  }, [shouldLoad]);

  return (
    <>
      <div className="ki-atmosphere" aria-hidden="true">
        <img src={POSTER} alt="" fetchPriority="high" width="1920" height="1080" />
        <video
          ref={videoRef}
          poster={POSTER}
          muted loop playsInline preload="none"
          onError={() => setFailed(true)}
          style={{ opacity: failed ? 0 : undefined }}
        />
      </div>
    </>
  );
}
