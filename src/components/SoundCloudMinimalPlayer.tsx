/**
 * SoundCloudMinimalPlayer — visible UI for the SoundCloud playlist
 * player. A thin consumer of `SoundCloudPlayerProvider` — the audio
 * engine + iframe + widget API live there, mounted at App root.
 *
 * Day 58+ (Sasha 2026-05-03): originally this component owned its
 * own iframe + widget bindings. That meant when SpacesRail was
 * remounted on route change (which happens on every navigation —
 * GameShellV2 wraps each route inline), the iframe was destroyed
 * and playback stopped. Karime walkthrough exposed this. The fix
 * was architectural: the engine moved to App-root in
 * `SoundCloudPlayerProvider`. This component is now just the
 * visible UI: it reads `playing / trackTitle / trackArtist / ready`
 * from context and calls `toggle()` / `next()` to drive playback.
 * Mount it anywhere — playback isn't affected by its lifecycle.
 *
 * Public Widget API docs: https://developers.soundcloud.com/docs/api/html5-widget
 */

import { Play, Pause, SkipForward } from "lucide-react";
import { useSoundCloudPlayer } from "@/components/audio/SoundCloudPlayerProvider";

/**
 * Tiny inline SoundCloud cloud mark — used as the attribution glyph
 * required by SoundCloud's Developer Terms of Use (the iframe is
 * hidden so the default in-widget logo isn't visible; a small mark
 * here keeps us clean). Path is the canonical SC cloud silhouette.
 * Sasha 2026-05-03 iter 2: rendered tiny and at reduced opacity in
 * dim white — sits cleanly with the rail's monochrome icon family
 * (chat / settings) instead of competing as a brand-color accent.
 * Monochrome-on-dark is sanctioned by SC's branding guidelines for
 * cases where the brand orange would clash with the host palette.
 * Clicking opens the playlist on SoundCloud in a new tab — doubles
 * as a useful affordance.
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

const SoundCloudMinimalPlayer = () => {
    const player = useSoundCloudPlayer();

    // Provider not mounted — render nothing. Defensive: prevents the
    // app from crashing if this component is dropped somewhere outside
    // the provider tree, and keeps the rail clean if the engine
    // hasn't been wired up.
    if (!player) return null;

    // Sasha 2026-05-04: hide the player UI on non-shell routes (landing,
    // sales pages, funnel pages, etc.). The rail itself renders on /
    // (because JourneyPage wraps in GameShellV2), which means without
    // this guard the player UI was visible there too — but the engine
    // is lazy-mounted on first shell entry per Path B (privacy rule),
    // so on landing the UI sat forever in "loading…". Hiding the UI
    // on non-shell routes keeps Sasha's "no music on sales pages" rule
    // visually consistent with the engine's actual behavior.
    if (!player.currentRouteIsShell) return null;

    const { ready, playing, trackTitle, trackArtist, toggle, next, playlistUrl } = player;

    // Compose visible label as "Title · Artist". Either side falls back
    // gracefully if missing, on a single truncated line so the rail
    // width stays disciplined.
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
                onClick={toggle}
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

            {/* Track label "Title · Artist" — Cormorant, small, tracked.
                Hidden on mobile (rail is icon-only at <md). */}
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
                onClick={next}
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

            {/* SoundCloud attribution mark — tiny SC cloud, opens the
                playlist on soundcloud.com in a new tab. Satisfies the
                attribution clause in SoundCloud's Developer Terms (the
                default in-widget logo isn't visible — iframe is hidden
                at App root). Monochrome-on-dark is sanctioned by SC's
                branding guidelines for cases where the brand orange
                would clash with the host palette. Hidden on mobile
                alongside skip — only the play button shows in the
                72px column. */}
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
        </div>
    );
};

export default SoundCloudMinimalPlayer;
