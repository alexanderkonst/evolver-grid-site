/**
 * MusicPlayer — ambient SoundCloud playlist with a minimal floating play
 * button. Mounted ONCE at App root above <Routes>, so the audio engine
 * (hidden iframe) persists across navigation: visitor presses play on `/`,
 * the music keeps playing as they move to `/ai-os`, `/path`, etc.
 *
 * Day 56 (Sasha 2026-05-01): shipped behind `?music=1` query gate so we
 * can iterate on the player on a live page without exposing it to
 * production traffic. To enable for everyone, change DEFAULT_ENABLED →
 * true (single-line flip).
 *
 * SoundCloud chosen over Spotify because:
 *   1. Widget API exposes programmatic control → custom 40px button UI
 *      (Spotify embeds can't go below ~80px tall)
 *   2. Full tracks for every visitor (Spotify Free = 30s previews)
 *   3. Shuffle controllable from outside (Spotify embeds can't)
 *
 * Legal stack: embedding a SoundCloud track via the official Widget API
 * is the same as embedding the iframe — audio streams from SoundCloud's
 * servers, royalties flow through their normal accounting. Public tracks
 * are explicitly opted-in to embedding by the artist.
 */

import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Play, Pause, Loader2 } from "lucide-react";

// ─── Configuration ──────────────────────────────────────────────────

// SoundCloud playlist URL. Replace with the curated playlist when ready.
// While this points at an unset URL, the widget loads nothing and the
// floating button stays hidden — zero visual impact on testers.
const SOUNDCLOUD_PLAYLIST_URL = "https://soundcloud.com/REPLACE/sets/REPLACE";

// Routes where the visible button appears. Audio keeps playing on every
// route once started; this list only controls button visibility. Hidden
// on /ignite (booking — quiet for conversion), /admin (utilitarian),
// /zone-of-genius (deep self-inquiry).
const MUSIC_BUTTON_ROUTES = ["/", "/ai-os", "/path", "/playbook", "/founders"];

const isMusicButtonRoute = (pathname: string): boolean => {
    return MUSIC_BUTTON_ROUTES.some((route) =>
        route === "/" ? pathname === "/" : pathname.startsWith(route),
    );
};

const isMusicEnabled = (): boolean => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("music");
};

// SoundCloud Widget API types live in src/types/soundcloud.d.ts —
// consolidated there so MusicPlayer + SoundCloudMinimalPlayer share
// one declaration of `window.SC` (two parallel `declare global`
// blocks were merging incompatibly).

// ─── Component ──────────────────────────────────────────────────────

const MusicPlayer = () => {
    const location = useLocation();
    const [enabled] = useState(() => isMusicEnabled());
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const widgetRef = useRef<SCWidget | null>(null);
    const trackCountRef = useRef<number>(1);

    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [widgetReady, setWidgetReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [trackName, setTrackName] = useState<string>("");

    // Load the SoundCloud Widget API script once per session.
    useEffect(() => {
        if (!enabled) return;
        if (window.SC) {
            setScriptLoaded(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://w.soundcloud.com/player/api.js";
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);
        // Intentionally not removing on unmount — script is idempotent
        // and we want it cached for the whole session (the player is
        // mounted at App root and never unmounts anyway).
    }, [enabled]);

    // Initialize the Widget once the script is loaded and the iframe
    // is in the DOM. Bind playback events; set up shuffle.
    useEffect(() => {
        if (!enabled || !scriptLoaded || !iframeRef.current || !window.SC) return;

        const widget = window.SC.Widget(iframeRef.current);
        widgetRef.current = widget;

        const updateTrackName = () => {
            widget.getCurrentSound((sound) => {
                if (sound) {
                    setTrackName(`${sound.title} — ${sound.user.username}`);
                }
            });
        };

        widget.bind(window.SC.Widget.Events.READY, () => {
            widget.getSounds((sounds) => {
                if (!sounds || sounds.length === 0) return;
                trackCountRef.current = sounds.length;
                // Random starting track — true session shuffle: each
                // visitor gets a different first track of the playlist.
                if (sounds.length > 1) {
                    widget.skip(Math.floor(Math.random() * sounds.length));
                }
                setWidgetReady(true);
                updateTrackName();
            });
        });

        widget.bind(window.SC.Widget.Events.PLAY, () => {
            setIsPlaying(true);
            setIsLoading(false);
            updateTrackName();
        });

        widget.bind(window.SC.Widget.Events.PAUSE, () => {
            setIsPlaying(false);
        });

        widget.bind(window.SC.Widget.Events.FINISH, () => {
            // Custom shuffle on track-end — SoundCloud's Widget API
            // doesn't expose setShuffle; we randomize the next skip
            // ourselves so the order stays unpredictable through the
            // session.
            if (trackCountRef.current > 1) {
                widget.skip(Math.floor(Math.random() * trackCountRef.current));
            }
        });

        return () => {
            try {
                if (window.SC) {
                    widget.unbind(window.SC.Widget.Events.READY);
                    widget.unbind(window.SC.Widget.Events.PLAY);
                    widget.unbind(window.SC.Widget.Events.PAUSE);
                    widget.unbind(window.SC.Widget.Events.FINISH);
                }
            } catch {
                // Widget may have been destroyed already; safe to ignore.
            }
        };
    }, [enabled, scriptLoaded]);

    if (!enabled) return null;

    const showButton = widgetReady && isMusicButtonRoute(location.pathname);

    const handleToggle = () => {
        if (!widgetRef.current) return;
        if (isPlaying) {
            widgetRef.current.pause();
        } else {
            setIsLoading(true);
            widgetRef.current.play();
        }
    };

    return (
        <>
            {/* Hidden audio engine — always mounted while ?music=1 is
                set, regardless of route. 1×1px, fully transparent,
                pointer-events disabled. The visible button below is
                what the user interacts with. */}
            <iframe
                ref={iframeRef}
                title="ambient music engine"
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(SOUNDCLOUD_PLAYLIST_URL)}&auto_play=false&visual=false&show_user=false&show_artwork=false&show_comments=false&show_playcount=false&show_teaser=false&hide_related=true&buying=false&liking=false&download=false&sharing=false&single_active=false`}
                allow="autoplay"
                style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    border: 0,
                    opacity: 0,
                    pointerEvents: "none",
                    left: -9999,
                }}
                aria-hidden="true"
            />

            {/* Visible button — gated on whitelist routes + widget ready. */}
            {showButton && (
                <div
                    className="fixed right-6 z-tooltip group"
                    style={{
                        bottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
                    }}
                >
                    <button
                        type="button"
                        onClick={handleToggle}
                        aria-label={isPlaying ? "Pause music" : "Play music"}
                        className="relative w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
                        style={{
                            background:
                                "linear-gradient(135deg, hsla(40, 70%, 55%, 0.20) 0%, hsla(40, 60%, 45%, 0.10) 100%)",
                            border: "1px solid hsla(40, 70%, 65%, 0.40)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            boxShadow: isPlaying
                                ? "0 0 0 1px hsla(40, 70%, 65%, 0.30), 0 0 24px -4px rgba(244, 212, 114, 0.5), 0 4px 16px -4px rgba(0, 0, 0, 0.4)"
                                : "0 0 0 1px hsla(40, 70%, 65%, 0.15), 0 0 12px -4px rgba(244, 212, 114, 0.3), 0 4px 12px -4px rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        {isLoading ? (
                            <Loader2
                                className="w-4 h-4 animate-spin"
                                style={{ color: "hsl(40 70% 88%)" }}
                            />
                        ) : isPlaying ? (
                            <Pause
                                className="w-4 h-4"
                                style={{
                                    color: "hsl(40 70% 88%)",
                                    fill: "hsl(40 70% 88%)",
                                }}
                            />
                        ) : (
                            <Play
                                className="w-4 h-4"
                                style={{
                                    color: "hsl(40 70% 88%)",
                                    fill: "hsl(40 70% 88%)",
                                    marginLeft: 2,
                                }}
                            />
                        )}

                        {/* Pulsing ring while playing — signals "music
                            is on" without shouting. */}
                        {isPlaying && (
                            <span
                                aria-hidden="true"
                                className="absolute inset-0 rounded-full animate-ping"
                                style={{
                                    border: "1px solid hsla(40, 70%, 65%, 0.6)",
                                    animationDuration: "2.5s",
                                }}
                            />
                        )}
                    </button>

                    {/* Track-name tooltip on hover (desktop). Touch
                        devices won't trigger hover; that's fine — the
                        button is self-explanatory. */}
                    {trackName && (
                        <div
                            className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded-md whitespace-nowrap text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 500,
                                background: "rgba(10, 22, 40, 0.92)",
                                color: "hsl(40 70% 88%)",
                                border: "1px solid hsla(40, 70%, 65%, 0.30)",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                            }}
                        >
                            {trackName}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default MusicPlayer;
