import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * PlaybookHero — the animated circular infographic at the top of the playbook.
 *
 * Source: Mux HLS stream (animated 7-step hero's-journey circle with a
 * dragonfly at 12 o'clock). Rendered inside a square container with
 * `object-fit: cover` + a slight zoom so the black side-bars of the
 * source video are cropped out. The circle remains centered.
 *
 * Fallback chain:
 *   1. HLS-supported browsers → Mux stream plays muted, loop.
 *   2. Native HLS (Safari iOS) → <video src> with the .m3u8 URL.
 *   3. Both fail → soft atmospheric gradient placeholder (no error state).
 */

const MUX_HERO_URL =
  "https://stream.mux.com/vHKgF00o2i2zxAYinX4uEGNBlU9fGhLhwnOTGBKiayCw.m3u8";

const PlaybookHero = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: any = null;

    const initHls = async () => {
      try {
        const HlsModule = await import("hls.js");
        const Hls = HlsModule.default;

        if (Hls.isSupported()) {
          hlsInstance = new Hls({ autoStartLoad: true });
          hlsInstance.loadSource(MUX_HERO_URL);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
          hlsInstance.on(Hls.Events.ERROR, (_event: any, data: any) => {
            if (data.fatal) setVideoFailed(true);
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Native HLS (Safari iOS, some macOS)
          video.src = MUX_HERO_URL;
          video.addEventListener("loadedmetadata", () => {
            video.play().catch(() => {});
          });
          video.addEventListener("error", () => setVideoFailed(true));
        } else {
          setVideoFailed(true);
        }
      } catch {
        setVideoFailed(true);
      }
    };

    initHls();
    return () => {
      hlsInstance?.destroy();
    };
  }, []);

  return (
    <div className="mb-12">
      <figure
        className="relative mx-auto mb-8 aspect-square w-full max-w-[440px] sm:max-w-[480px]"
        aria-label="The seven-step journey — animated infographic"
      >
      {/* ══ Square crop window ══ */}
      <div
        className="relative h-full w-full overflow-hidden rounded-[32px]"
        style={{
          boxShadow:
            "0 32px 80px -32px rgba(132, 96, 234, 0.45), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        {/* ══ Fallback atmospheric gradient (sits behind the video) ══ */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 40%, rgba(132,96,234,0.35), rgba(30,67,116,0.3) 45%, rgba(10,22,40,0.9) 85%)",
          }}
        />

        {!videoFailed && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            // Scale up slightly so the source video's side-letterboxing
            // (black bars on 16:9-ish masters) gets cropped out of view.
            // The circle stays centered because the source is horizontally
            // centered itself.
            style={{
              transform: "scale(1.18)",
              transformOrigin: "center center",
            }}
            aria-hidden="true"
            onError={() => setVideoFailed(true)}
          />
        )}
      </div>

      <figcaption className="sr-only">
        A circle with seven luminous nodes, each labeled with one of the seven
        steps. Light travels clockwise through the nodes, arriving at a
        dragonfly at the top of the circle — the symbol of flow.
      </figcaption>
    </figure>

    {/* ══════ CTA: Claim your gift (Step 1 free) ══════ */}
    <div className="flex flex-col items-center gap-3 px-4 text-center">
      <div
        className="text-[10px] uppercase tracking-[0.28em]"
        style={{ color: "rgba(231,233,229,0.55)" }}
      >
        Step 1 is on us · Takes two minutes
      </div>

      <button
        type="button"
        onClick={() =>
          navigate(
            "/auth?next=/zone-of-genius/assessment&claim=true",
          )
        }
        className={cn(
          "group relative px-8 sm:px-10 py-4 rounded-full",
          "text-sm sm:text-base font-semibold uppercase tracking-[0.18em]",
          "transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]",
          "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
        )}
        style={{
          color: "rgba(231,233,229,0.98)",
          backgroundImage:
            "linear-gradient(135deg, rgba(132,96,234,0.85), rgba(41,84,159,0.85))",
          border: "1px solid rgba(231,233,229,0.35)",
          boxShadow:
            "0 20px 60px -16px rgba(132,96,234,0.75), inset 0 1px 1px rgba(255,255,255,0.25)",
        }}
      >
        <span className="inline-flex items-center gap-3">
          Claim your gift
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </button>

      <p
        className="text-xs sm:text-[13px] max-w-[380px]"
        style={{ color: "rgba(231,233,229,0.6)" }}
      >
        We'll email you a magic link so your Zone-of-Genius result stays
        safe — no password, no spam.
      </p>
    </div>
  </div>
  );
};

export default PlaybookHero;
