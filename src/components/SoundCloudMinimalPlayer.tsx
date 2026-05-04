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

// SoundCloud Widget API types live in src/types/soundcloud.d.ts —
// consolidated there so MusicPlayer + SoundCloudMinimalPlayer share
// one declaration of `window.SC` (two parallel `declare global`
// blocks were merging incompatibly).

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

/**
 * Tiny inline SoundCloud cloud mark — used as the attribution glyph
 * required by SoundCloud's Developer Terms of Use (the iframe is
 * hidden so the default in-widget logo isn't visible; a small mark
 * here keeps us clean). Path is the canonical SC cloud silhouette.
 * Sasha 2026-05-03: rendered tiny (h:10px) and at reduced opacity so
 * it reads as editorial attribution, not a brand badge competing
 * with the rail's gold register. Clicking opens the playlist on
 * SoundCloud in a new tab — doubles as a useful affordance.
 */
const SoundCloudGlyph = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={{ width: 14, height: "auto", display: "block" }}
    >
        <path
            fill="currentColor"
            d="M23.999 14.165c-.052 1.96-1.694 3.498-3.655 3.498h-8.18a.42.42 0 0 1-.415-.42V8.404c0-.218.109-.318.27-.379 0 0 .655-.466 1.872-.466 1.144 0 2.247.43 3.078 1.092a4.99 4.99 0 0 1 1.844 3.343c.298-.1.622-.16.948-.16 1.798 0 3.244 1.605 3.244 3.244 0 .029-.006.058-.006.087zM10.464 17.245a.156.156 0 0 1-.156.155h-.96a.155.155 0 0 1-.154-.155V9.21a.155.155 0 0 1 .104-.154 4.84 4.84 0 0 1 1.066-.262c.114-.013.21.082.21.196v8.255zM7.825 17.4h-1.06a.155.155 0 0 1-.156-.155V9.466c0-.085.06-.155.156-.155h1.06c.092 0 .154.074.154.155v7.779a.155.155 0 0 1-.154.155zm-2.59 0H4.171a.156.156 0 0 1-.155-.155v-5.795c0-.085.06-.156.154-.156h1.064c.092 0 .154.073.154.156v5.795a.156.156 0 0 1-.154.155zm-2.59 0H1.582a.156.156 0 0 1-.156-.155v-4.622c0-.085.061-.156.156-.156h1.063c.093 0 .154.073.154.156v4.622a.156.156 0 0 1-.154.155zm-2.578-.234H.024A.022.022 0 0 1 0 17.144v-3.946c0-.013.005-.02.018-.022h.044c.013 0 .018.009.018.022v3.946a.022.022 0 0 1-.018.022z"
        />
    </svg>
);

const SoundCloudMinimalPlayer = ({
    playlistUrl = DEFAULT_PLAYLIST_URL,
}: SoundCloudMinimalPlayerProps) => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const widgetRef = useRef<SCWidget | null>(null);
    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [trackTitle, setTrackTitle] = useState<string>("");
    // Day 58+ (Sasha 2026-05-03): also surface the artist (SC username
    // of the uploader) — a song without an artist credit reads as
    // mystery-meat. Title and artist render as "Title · Artist" on a
    // single truncated line; if either is missing, we gracefully fall
    // back to whichever exists.
    const [trackArtist, setTrackArtist] = useState<string>("");

    useEffect(() => {
        let cancelled = false;
        // Helper — read current sound and fan out to both title + artist
        // setters. Keeps the two bind handlers below DRY and avoids the
        // bug where one handler updates title and the other forgets.
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

    // Day 58+ (Sasha 2026-05-03): compose the visible label as
    // "Title · Artist". Either side falls back gracefully if missing,
    // and we keep it on a single truncated line so the rail width
    // stays disciplined.
    const labelText = trackTitle && trackArtist
        ? `${trackTitle} · ${trackArtist}`
        : trackTitle || trackArtist || (ready ? "playlist" : "loading…");

    return (
        // Day 58+ (Sasha 2026-05-03): structurally mirror the
        // chat-with-us anchor and settings button below — same
        // `gap-3 px-3 py-2.5 rounded-2xl w-full` so the play button's
        // left edge sits at the exact x-position as the chat-with-us
        // / settings icons (and the JOURNEY / AI OS / ME chip icons
        // above).
        //
        // `justify-center md:justify-start` matches every other rail
        // chip: at <md the rail is icon-only (72px wide) and we
        // center the play button in its column; at md+ the rail
        // expands and we left-align with the title to its right.
        //
        // `md:pl-1.5` (Sasha 2026-05-03 iter 3): empirical desktop-only
        // alignment correction. With identical classes to the sibling
        // chat-with-us anchor, the play button STILL renders ~6 CSS px
        // to the right of where the chat MessageCircle icon renders —
        // suspected sub-pixel quirk from `<button>` (with inline-flex
        // + border + boxShadow) vs bare lucide `<svg>` (which gets
        // `display: block` from Tailwind preflight). This override
        // overrides `pl-3` (12px) with `pl-1.5` (6px) at md+ only,
        // shifting all player content 6px left so the play button's
        // left edge aligns with the rest of the rail's icon column.
        // Mobile keeps symmetric `px-3` so `justify-center` still
        // centers the play button cleanly in the 72px column.
        <div className="flex items-center gap-3 px-3 md:pl-1.5 py-2.5 rounded-2xl w-full justify-center md:justify-start transition-all duration-300 hover:bg-white/[0.04]">
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

            {/* Track label "Title · Artist" — Cormorant, small,
                tracked. Hidden on mobile (rail is icon-only at <md). */}
            <span
                className="flex-1 truncate hidden md:block"
                style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    letterSpacing: "0.04em",
                    color: "rgba(255, 255, 255, 0.55)",
                }}
                title={labelText}
            >
                {labelText}
            </span>

            {/* Skip / Next track — same dim register as the title.
                Hidden on mobile (rail collapses to a 72px icon column
                and only the play button needs to fit). */}
            <button
                type="button"
                onClick={handleNext}
                disabled={!ready}
                aria-label="Next track"
                title="Next"
                className="flex-shrink-0 hidden md:inline-flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 hover:scale-[1.10] active:scale-[0.94] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                    color: "rgba(255, 255, 255, 0.45)",
                }}
            >
                <SkipForward className="w-3 h-3" aria-hidden="true" />
            </button>

            {/* SoundCloud attribution mark — Day 58+ (Sasha 2026-05-03):
                tiny SC cloud, opens the playlist on soundcloud.com in
                a new tab. Satisfies the attribution clause in
                SoundCloud's Developer Terms (the default in-widget
                logo isn't visible — iframe is hidden).
                Sasha 2026-05-03 iter 2: dropped the SoundCloud orange
                in favor of dim white — sits cleanly with the rest of
                the rail's monochrome icon family (chat / settings)
                instead of competing as a brand-color accent.
                Monochrome-on-dark is sanctioned by SC's branding
                guidelines for cases where the brand color clashes
                with the host palette. Hidden on mobile alongside
                skip — only the play button shows in the 72px column. */}
            <a
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Listen on SoundCloud"
                title="Listen on SoundCloud"
                className="flex-shrink-0 hidden md:inline-flex items-center justify-center transition-opacity duration-200 hover:opacity-100"
                style={{
                    color: "rgba(255, 255, 255, 0.45)",
                    opacity: 0.65,
                }}
            >
                <SoundCloudGlyph />
            </a>

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
