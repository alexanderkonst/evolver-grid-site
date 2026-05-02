/**
 * MeditationPlayer — minimal audio player for the activation flow.
 *
 * Day 58 (Sasha 2026-05-02). Hand-tuned to match the rest of the
 * venture's editorial register: Cormorant Garamond + glass + gold
 * accent + dark navy text. No external lib — HTML5 <audio> underneath,
 * custom controls on top. ~60 lines.
 *
 * Usage:
 *   <MeditationPlayer src="/audio/activation-meditation.mp3" title="The Activation" />
 */
import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface MeditationPlayerProps {
  src: string;
  title?: string;
}

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

export default function MeditationPlayer({ src, title }: MeditationPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => {
      setDuration(audio.duration);
      setLoaded(true);
    };
    const onEnd = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Number(e.target.value);
    audio.currentTime = next;
    setCurrentTime(next);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="rounded-3xl p-6 sm:p-7"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.88))",
        border: "1px solid rgba(122, 81, 8, 0.18)",
        boxShadow:
          "0 10px 28px -10px rgba(10,22,40,0.18), 0 0 24px -4px rgba(244,212,114,0.30), inset 0 1px 0 rgba(255,255,255,0.6)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {title && (
        <p
          className="text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase mb-4 text-center"
          style={{ color: "rgba(122, 81, 8, 0.85)" }}
        >
          {title}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full inline-flex items-center justify-center transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(244, 212, 114, 0.95) 0%, rgba(212, 175, 55, 0.85) 100%)",
            color: "#0a1628",
            border: "1px solid rgba(122, 81, 8, 0.42)",
            boxShadow:
              "0 6px 18px -6px rgba(122, 81, 8, 0.45), inset 0 1px 0 rgba(255,255,255,0.5)",
          }}
        >
          {playing ? (
            <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Play className="w-5 h-5 sm:w-6 sm:h-6 translate-x-[1px]" />
          )}
        </button>

        <div className="flex-1 min-w-0 space-y-1.5">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            disabled={!loaded}
            aria-label="Seek"
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, rgba(122, 81, 8, 0.85) 0%, rgba(122, 81, 8, 0.85) ${progress}%, rgba(26,30,58,0.12) ${progress}%, rgba(26,30,58,0.12) 100%)`,
              accentColor: "rgba(122, 81, 8, 0.85)",
            }}
          />
          <div
            className="flex justify-between text-[11px] tabular-nums"
            style={{
              color: "rgba(26,30,58,0.55)",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            <span>{formatTime(currentTime)}</span>
            <span>{loaded ? formatTime(duration) : "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
