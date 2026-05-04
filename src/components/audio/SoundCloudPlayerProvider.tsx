/**
 * SoundCloudPlayerProvider — App-root mount for the SoundCloud
 * Widget audio engine, exposed to UI consumers via React Context.
 *
 * Day 58+ (Sasha 2026-05-03): the bug. SoundCloudMinimalPlayer used
 * to own its own hidden iframe, mounted inside SpacesRail. SpacesRail
 * lives inside GameShellV2, and GameShellV2 is wrapped INLINE inside
 * each route (not at App root). So every route change destroyed the
 * shell, destroyed the rail, destroyed the iframe, and killed
 * playback — exactly the "music stops on page navigation" Sasha hit
 * during the Karime walkthrough.
 *
 * The fix: split engine from UI.
 *  • This provider mounts ONCE at App root, owns the hidden iframe,
 *    binds to the SoundCloud Widget JS API, and exposes
 *    state + actions via Context. The iframe never unmounts → the
 *    audio engine survives every navigation.
 *  • SoundCloudMinimalPlayer becomes a thin UI consumer: it reads
 *    state from this context and calls toggle / next to drive
 *    playback. It can be rendered anywhere (today: in the rail),
 *    unmount/remount freely, and playback isn't affected.
 *
 * ── Path B (Sasha 2026-05-03 iter 2) ──────────────────────────
 * Two refinements over a naive App-root mount:
 *
 * 1. **Lazy-mount on shell entry**. The hidden iframe (and the
 *    SoundCloud JS) are NOT loaded for landing-page / sales-page
 *    traffic. The engine boots only the first time the user enters
 *    a shell route (/game, /ai-os, /ubb, /dashboard) — that's the
 *    only place the player UI is reachable, so there's no need to
 *    pay the SC iframe cost before then. Once mounted, it persists
 *    for the rest of the session.
 *
 * 2. **Auto-pause on sales-page entry**. If music is playing and
 *    the user navigates to a non-shell route (landing, /ignite,
 *    /zone-of-genius funnel, etc.), playback auto-pauses. They can
 *    resume from the rail when they next enter a shell route. This
 *    honors Sasha's "no music on the sales page" rule explicitly.
 *
 * Public Widget API docs: https://developers.soundcloud.com/docs/api/html5-widget
 */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";

const WIDGET_API_SRC = "https://w.soundcloud.com/player/api.js";

// Default playlist — Sasha's findyourtoptalent.com SoundCloud playlist.
const DEFAULT_PLAYLIST_URL =
    "https://soundcloud.com/alexander-konstantinov-976475588/sets/findyourtoptalent-com-playlist";

/**
 * Music-allowed-route detection — should the player be active on
 * this pathname?
 *
 * Day 60+ rev2 (Sasha 2026-05-04): tightened the deny-list per
 * Sasha's correction. Earlier rev incorrectly excluded `/` (landing)
 * and `/zone-of-genius/*` (assessment funnel) — Sasha clarified
 * those SHOULD have music. The actual no-music surfaces are the
 * pure-sales / pure-task ones where ambient music would compete
 * with the call-to-action.
 *
 * Music is DENIED on the following surfaces (everything else allows):
 *   • /ignite, /ignite/*      — primary sales surface ($555 session)
 *   • /auth, /auth/*          — sign-in / sign-up / reset-password
 *   • /activations, /...      — marketing landings for individual
 *                                workshop purchases (Stripe checkout)
 *
 * Used both to lazy-mount the engine (boots on first allowed-route
 * entry) AND to auto-pause when the user crosses into denied
 * territory (e.g., navigates from /game/me → /ignite).
 */
function isShellRoute(pathname: string): boolean {
    // Hard-deny list of "no music" surfaces — every other route is
    // music-allowed by default. New routes don't need any change here.
    if (pathname === "/ignite" || pathname.startsWith("/ignite/")) return false;
    if (pathname === "/auth" || pathname.startsWith("/auth/")) return false;
    if (pathname === "/activations" || pathname.startsWith("/activations/")) return false;
    return true;
}

// SoundCloud Widget API types live in src/types/soundcloud.d.ts.

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

interface SoundCloudPlayerContextValue {
    /** True once the SC Widget has fired its READY event. */
    ready: boolean;
    /** True when audio is actively playing. */
    playing: boolean;
    /** Current track title, e.g. "Freedom". */
    trackTitle: string;
    /** Current track artist (SoundCloud uploader display name). */
    trackArtist: string;
    /** Toggle play/pause. No-op until ready. */
    toggle: () => void;
    /** Advance to next track in the playlist. No-op until ready. */
    next: () => void;
    /** The playlist URL the engine is bound to. */
    playlistUrl: string;
    /**
     * True when the user's current route is a shell route — the only
     * place the visible player UI should render. The Karime walkthrough
     * (Sasha 2026-05-04) hit a stuck "loading…" on the landing page
     * because the rail (and therefore the player UI) renders there, but
     * the engine doesn't mount on non-shell routes per the Path B
     * privacy rule. UI consumers should hide themselves when this is
     * false so users on sales / landing pages see nothing rather than
     * a forever-loading widget.
     */
    currentRouteIsShell: boolean;
}

const SoundCloudPlayerContext = createContext<SoundCloudPlayerContextValue | null>(null);

interface SoundCloudPlayerProviderProps {
    children: ReactNode;
    /** Defaults to the findyourtoptalent.com playlist. */
    playlistUrl?: string;
}

export function SoundCloudPlayerProvider({
    children,
    playlistUrl = DEFAULT_PLAYLIST_URL,
}: SoundCloudPlayerProviderProps) {
    const location = useLocation();
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const widgetRef = useRef<SCWidget | null>(null);
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [trackTitle, setTrackTitle] = useState<string>("");
    const [trackArtist, setTrackArtist] = useState<string>("");
    // Lazy-mount gate. Flips true the first time the user enters a
    // shell route, then stays true for the rest of the session — once
    // we've paid the iframe cost there's no reason to tear it down on
    // exit. Landing-page / sales-page traffic that never enters a
    // shell pays zero SoundCloud footprint (no script, no iframe, no
    // cookies).
    const [engineMounted, setEngineMounted] = useState(false);

    // Watch route to decide when to mount the engine.
    useEffect(() => {
        if (!engineMounted && isShellRoute(location.pathname)) {
            setEngineMounted(true);
        }
    }, [location.pathname, engineMounted]);

    // Auto-pause when leaving the shell. Sasha's rule: no music on
    // sales pages. If the user navigates from /game/me → /ignite, we
    // hard-pause so the music doesn't underscore the sales page.
    // They can resume manually next time they're back in the shell.
    useEffect(() => {
        if (!engineMounted) return;
        if (!isShellRoute(location.pathname) && playing && widgetRef.current) {
            widgetRef.current.pause();
        }
    }, [location.pathname, engineMounted, playing]);

    // Bind to the widget once the engine is mounted (i.e. once the
    // iframe element exists in the DOM and we can hand it to
    // window.SC.Widget(...)).
    useEffect(() => {
        if (!engineMounted) return;
        let cancelled = false;
        // DRY helper — read current sound and fan out to title + artist
        // setters together. Avoids the two-bind drift bug.
        const readCurrentInto = (widget: SCWidget) => {
            widget.getCurrentSound((sound) => {
                if (cancelled) return;
                if (sound?.title) setTrackTitle(sound.title);
                if (sound?.user?.username) setTrackArtist(sound.user.username);
            });
        };
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
                    // Defensive force-to-track-0: SoundCloud's widget can
                    // resume from a cached playback position via cookies
                    // on the w.soundcloud.com origin. We always want a
                    // fresh listener to start at track 1 of the playlist,
                    // so on every READY we check the current index and
                    // skip(0) if it's not already there. No-op in the
                    // common case (idx === 0).
                    widget.getCurrentSoundIndex((idx) => {
                        if (idx !== 0 && !cancelled) {
                            widget.skip(0);
                        }
                    });
                    setReady(true);
                    readCurrentInto(widget);
                });
                widget.bind(Events.PLAY, () => {
                    if (cancelled) return;
                    setPlaying(true);
                    readCurrentInto(widget);
                });
                widget.bind(Events.PAUSE, () => {
                    if (!cancelled) setPlaying(false);
                });
                widget.bind(Events.FINISH, () => {
                    if (!cancelled) setPlaying(false);
                });
                // ERROR event — kept as a permanent observability hook.
                // Day-60 diagnostic session (Sasha 2026-05-04) confirmed
                // SoundCloud's auto-skip-on-stream-404 behavior is the
                // primary failure mode: tracks that are public on SC.com
                // but not embed-permitted return 404 on their stream URL,
                // and the widget silently auto-advances. The ERROR event
                // gives us a clean log when this happens, in place of the
                // noisy XHR stack trace from SC's internal fetch code.
                try {
                    widget.bind("error", (err: unknown) => {
                        if (!cancelled) {
                            console.warn(
                                "[SC] track unplayable in embed (likely rights-restricted) — auto-skipping:",
                                err,
                            );
                        }
                    });
                } catch {
                    // bind() may throw if the event name isn't recognized
                    // by this widget version — silently ignore.
                }
            })
            .catch((err) => {
                console.warn("[SoundCloudPlayerProvider] widget API load failed:", err);
            });
        return () => {
            cancelled = true;
            // We intentionally do NOT tear down the widget on unmount.
            // Once the engine is mounted, it lives for the rest of the
            // session. The iframe never re-renders since `engineMounted`
            // only flips false→true (never the reverse).
        };
    }, [engineMounted]);

    const toggle = useCallback(() => {
        if (!ready || !widgetRef.current) return;
        widgetRef.current.toggle();
    }, [ready]);

    const next = useCallback(() => {
        if (!ready || !widgetRef.current) return;
        widgetRef.current.next();
    }, [ready]);

    // Build the widget URL with all chrome stripped — engine only,
    // no visible UI from SoundCloud (the iframe is hidden anyway).
    const widgetSrc = useMemo(
        () =>
            `https://w.soundcloud.com/player/?url=${encodeURIComponent(
                playlistUrl,
            )}&visual=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&auto_play=false&buying=false&sharing=false&download=false&show_artwork=false&show_playcount=false`,
        [playlistUrl],
    );

    // Live shell-route flag — recomputed on each location change so
    // the UI consumer can hide itself the moment the user navigates
    // off a shell route (no debounce, no transition flash).
    const currentRouteIsShell = isShellRoute(location.pathname);

    const contextValue = useMemo<SoundCloudPlayerContextValue>(
        () => ({ ready, playing, trackTitle, trackArtist, toggle, next, playlistUrl, currentRouteIsShell }),
        [ready, playing, trackTitle, trackArtist, toggle, next, playlistUrl, currentRouteIsShell],
    );

    return (
        <SoundCloudPlayerContext.Provider value={contextValue}>
            {children}
            {/* Hidden SoundCloud iframe — the actual audio engine.
                Lazy-mounted: only renders once the user has entered a
                shell route at least once in this session. Once
                rendered, lives at App root for the rest of the
                session — survives every route change.
                We can't use display:none because some browsers / the
                Widget API need the iframe in the layout tree to init.
                Pin off-screen instead.
                Day-60 (Sasha 2026-05-04): sized 1×1 instead of 0×0
                because SoundCloud's widget tries to render its visual
                waveform onto a canvas-with-pattern, and 0-dimension
                canvases throw `InvalidStateError: createPattern …
                width or height of 0` on every animation frame.
                Harmless functionally (audio plays fine) but spammed
                the console. 1×1 satisfies the canvas API; the iframe
                is still imperceptible at -9999/-9999. */}
            {engineMounted && (
                <iframe
                    ref={iframeRef}
                    title="findyourtoptalent.com playlist (App-root audio engine)"
                    src={widgetSrc}
                    allow="autoplay"
                    aria-hidden="true"
                    tabIndex={-1}
                    style={{
                        position: "fixed",
                        width: 1,
                        height: 1,
                        left: -9999,
                        top: -9999,
                        border: 0,
                        pointerEvents: "none",
                    }}
                />
            )}
        </SoundCloudPlayerContext.Provider>
    );
}

/**
 * Hook for any UI surface that wants to read playback state or
 * control the player. Returns null if called outside the provider —
 * consumers should handle that case (typically: render nothing, or
 * a disabled placeholder).
 */
export function useSoundCloudPlayer(): SoundCloudPlayerContextValue | null {
    return useContext(SoundCloudPlayerContext);
}
