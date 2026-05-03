/**
 * SoundCloudMinimalPlayer — a custom, in-register SoundCloud playlist
 * player that replaces SoundCloud's full widget chrome with a single
 * gold play/pause button + a small Cormorant track title.
 *
 * Day 58+ (Sasha 2026-05-03): the default SoundCloud iframe ships with
 * waveform + track length + privacy-policy link + SoundCloud branding
 * that doesn't blend with our navy/gold rail. This component hides the
 * iframe entirely (off-screen, 0×0, aria-hidden) and drives playback
 * via the SoundCloud Widget JavaScript API. The visible UI is just
 * what we render — total control over the editorial register.
 *
 * Public Widget API docs: https://developers.soundcloud.com/docs/api/html5-widget
 */

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward } from "lucide-react";

const WIDGET_API_SRC = "https://w.soundcloud.com/player/api.js";

// Default playlist — Sasha's findyourtoptalent.com SoundCloud playlist.
const DEFAULT_PLAYLIST_URL =
    "https://soundcloud.com/alexander-konstantinov-976475588/sets/findyourtoptalent-com-playlist";

interface SCWidget {
    bind: (event: string, handler: (...args: unknown[]) => void) => void;
    play: () => void;
    pause: () => void;
    toggle: () => void;
    next: () => void;
    getCurrentSound: (cb: (sound: { title?: string; user?: { username?: string } } | null) => void) => void;
}

interface SCWidgetEvents {
    READY: string;
    PLAY: string;
    PAUSE: string;
    FINISH: string;
    PLAY_PROGRESS: string;
}

declare global {
    interface Window {
        SC?: {
            Widget: ((iframe: HTMLIFrameElement | string) => SCWidget) & {
                Events: SCWidgetEvents;
            };
        };
    }
}

/**
 * Load the SoundCloud Widget API once (idempotent). Returns a promise
 * that resolves when window.SC.Widget is available.
 */
function loadWidgetApi(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (window.SC?.Widget) return Promise.resolve();
    const existing = document.querySelector(`script[src="${WIDGET_API_SRC}"]`);
    if (existing) {
        return new Promise((resolve) => {
            existing.addEventListener("load", () => resolve(), { once: true });
        });
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = WIDGET_API_SRC;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load SoundCloud Widget API"));
        document.head.appendChild(script);
    });
}

interface SoundCloudMinimalPlayerProps {
    /** Defaults to the findyourtoptalent.com playlist. */
    playlistUrl?: string;
}

const SoundCloudMinimalPlayer = ({
    playlistUrl = DEFAULT_PLAYLIST_URL,
}: SoundCloudMinimalPlayerProps) => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const widgetRef = useRef<SCWidget | null>(null);
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [trackTitle, setTrackTitle] = useState<string>("");

    useEffect(() => {
        let cancelled = false;
        loadWidgetApi()
            .then(() => {
                if (cancelled) return;
                const iframe = iframeRef.current;
                if (!iframe || !window.SC) return;
                const widget = window.SC.Widget(iframe);
                widgetRef.current = widget;
                const Events = window.SC.Widget.Events;

                widget.bind(Events.READY, () => {
                    if (cancelled) return;
                    setReady(true);
                    widget.getCurrentSound((sound) => {
                        if (cancelled) return;
                        if (sound?.title) setTrackTitle(sound.title);
                    });
                });
                widget.bind(Events.PLAY, () => {
                    if (cancelled) return;
                    setPlaying(true);
                    widget.getCurrentSound((sound) => {
                        if (cancelled) return;
                        if (sound?.title) setTrackTitle(sound.title);
                    });
                });
                widget.bind(Events.PAUSE, () => {
                    if (!cancelled) setPlaying(false);
                });
                widget.bind(Events.FINISH, () => {
                    if (!cancelled) setPlaying(false);
                });
            })
            .catch((err) => {
                console.warn("[SoundCloudMinimalPlayer] widget API load failed:", err);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const handleToggle = () => {
        if (!ready || !widgetRef.current) return;
        widgetRef.current.toggle();
    };

    const handleNext = () => {
        if (!ready || !widgetRef.current) return;
        widgetRef.current.next();
    };

    // Build the widget URL with all chrome stripped — we only need the
    // playback engine, not the visual UI (which we hide off-screen).
    const widgetSrc = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
        playlistUrl,
    )}&visual=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&auto_play=false&buying=false&sharing=false&download=false&show_artwork=false&show_playcount=false`;

    return (
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all duration-300 hover:bg-white/[0.04]">
            {/* Play / Pause */}
            <button
                type="button"
                onClick={handleToggle}
                disabled={!ready}
                aria-label={playing ? "Pause playlist" : "Play playlist"}
                title={playing ? "Pause" : "Play"}
                className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 hover:scale-[1.06] active:scale-[0.94] disabled:opacity-50 disabled:cursor-wait"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(244, 212, 114, 0.32) 0%, rgba(212, 175, 55, 0.18) 100%)",
                    border: "0.5px solid rgba(212, 175, 55, 0.55)",
                    boxShadow: "0 0 10px -2px rgba(244, 212, 114, 0.30)",
                }}
            >
                {playing ? (
                    <Pause
                        className="w-3 h-3"
                        aria-hidden="true"
                        style={{ color: "#f4d472" }}
                    />
                ) : (
                    <Play
                        className="w-3 h-3 translate-x-[0.5px]"
                        aria-hidden="true"
                        style={{ color: "#f4d472" }}
                    />
                )}
            </button>

            {/* Track title — Cormorant, small, lowercase tracking matching the rail */}
            <span
                className="flex-1 truncate hidden md:block"
                style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    letterSpacing: "0.04em",
                    color: "rgba(255, 255, 255, 0.55)",
                }}
                title={trackTitle || undefined}
            >
                {trackTitle || (ready ? "playlist" : "loading…")}
            </span>

            {/* Skip / Next track — same dim register as the title; subtle on hover */}
            <button
                type="button"
                onClick={handleNext}
                disabled={!ready}
                aria-label="Next track"
                title="Next"
                className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 hover:scale-[1.10] active:scale-[0.94] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                    color: "rgba(255, 255, 255, 0.45)",
                }}
            >
                <SkipForward className="w-3 h-3" aria-hidden="true" />
            </button>

            {/* Hidden SoundCloud iframe — drives playback, never seen.
                We can't use display:none because some browsers / the
                Widget API need the iframe in the layout tree to init.
                Pin off-screen with 0 dimensions instead. */}
            <iframe
                ref={iframeRef}
                title="findyourtoptalent.com playlist (hidden audio engine)"
                src={widgetSrc}
                allow="autoplay"
                aria-hidden="true"
                tabIndex={-1}
                style={{
                    position: "absolute",
                    width: 0,
                    height: 0,
                    left: -9999,
                    top: -9999,
                    border: 0,
                    pointerEvents: "none",
                }}
            />
        </div>
    );
};

export default SoundCloudMinimalPlayer;
