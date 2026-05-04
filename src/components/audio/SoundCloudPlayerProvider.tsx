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
                    // Day 60++ (Sasha 2026-05-04): Sasha confirmed all
                    // playlist tracks are playable, so the "skip 2 → land
                    // on track ~3" symptom isn't auto-skip-unplayable.
                    // Most likely remaining cause: SoundCloud's widget
                    // remembers playback position via cookies on its own
                    // origin (w.soundcloud.com). If a previous session
                    // played up to track 3, the widget can resume there
                    // when re-instantiated — and pressing play would
                    // start from track 3 with title flicker as the
                    // widget restores state.
                    //
                    // Defensive force-to-track-0: on every fresh READY,
                    // log the playlist contents + current index, then if
                    // current index isn't 0, skip(0) to neutralize any
                    // cached resume state. New listeners always start at
                    // track 1 of the playlist, deterministically.
                    widget.getSounds((sounds) => {
                        console.log("[SC] PLAYLIST", sounds.map((s, i) => `${i}: ${s?.title ?? "?"}`));
                    });
                    widget.getCurrentSoundIndex((idx) => {
                        console.log("[SC] READY at index", idx);
                        if (idx !== 0) {
                            console.log("[SC] forcing skip(0) to neutralize cached state");
                            widget.skip(0);
                        }
                    });
                    setReady(true);
                    readCurrentInto(widget);
                });
                widget.bind(Events.PLAY, () => {
                    if (cancelled) return;
                    // Capture both title AND playlist-index on every PLAY
                    // event. Index is the diagnostic: if PLAY fires with
                    // index 0, then 1, then 2 in rapid succession, the
                    // widget IS skipping tracks. If only one PLAY fires
                    // but the title shown is wrong, the bug is on our
                    // render side. Two completely different fix paths.
                    widget.getCurrentSoundIndex((idx) => {
                        widget.getCurrentSound((sound) => {
                            console.log("[SC] PLAY", {
                                index: idx,
                                title: sound?.title,
                                artist: sound?.user?.username,
                            });
                        });
                    });
                    setPlaying(true);
                    readCurrentInto(widget);
                });
                widget.bind(Events.PAUSE, () => {
                    if (cancelled) return;
                    console.log("[SC] PAUSE");
                    setPlaying(false);
                });
                widget.bind(Events.FINISH, () => {
                    if (cancelled) return;
                    console.log("[SC] FINISH");
                    setPlaying(false);
                });
                // Some SoundCloud Widget builds expose an ERROR event
                // for unplayable tracks / network failures. Listen so
                // we'd see it if it fires.
                try {
                    widget.bind("error", (err: unknown) => {
                        if (!cancelled) console.warn("[SC] ERROR", err);
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
        // Debug — log every toggle invocation. If user reports "I pressed
        // play once but it skipped songs," and Console shows multiple
        // [SC] toggle() lines, the click handler is firing multiple times.
        // If only ONE [SC] toggle() but multiple [SC] PLAY events follow,
        // the widget itself is doing the skipping internally.
        console.log("[SC] toggle()");
        widgetRef.current.toggle();
    }, [ready]);

    const next = useCallback(() => {
        if (!ready || !widgetRef.current) return;
        console.log("[SC] next()");
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
                Pin off-screen with 0 dimensions instead. */}
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
                        width: 0,
                        height: 0,
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
