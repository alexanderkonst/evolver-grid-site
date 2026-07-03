import { Link, useLocation } from "react-router-dom";
// Day 48 (Sasha): the brand logo (orb + FIND YOUR TOP TALENT wordmark).
// Same asset used by the SpacesRail and the top-right shell icon.
import brandLogo from "@/assets/find-your-top-talent-logo.png";

/**
 * SiteLogo — Full brand lockup, fixed top-center of the viewport, links to home.
 * Hidden on routes whose shell already supplies a logo (SpacesRail in GameShellV2,
 * the playbook's top-right logo inside Panel 3, or custom hero treatments).
 *
 * Day 48 (Sasha): retired the old round dodecahedron avatar in favor of
 * the full "FIND YOUR TOP TALENT" wordmark — consistent brand across
 * every surface that renders the logo.
 */
const SiteLogo = () => {
    const location = useLocation();

    // Hide on pages whose layout already carries the brand elsewhere.
    const hidden = [
        "/game",
        "/zone-of-genius",
        "/playbook",
        "/path",
        "/my-artifacts",
        "/auth",
        // Day 50 (Sasha): /dashboard + /ai-os both live inside
        // GameShellV2 now, which already supplies the brand mark via
        // the SpacesRail. Suppress the global SiteLogo on both so the
        // wordmark doesn't double up.
        "/dashboard",
        "/ai-os",
        // Day 56 (Sasha 2026-04-28): /library now lives inside GameShellV2
        // and is mapped to the LEARN space — the SpacesRail wordmark + the
        // top-right home glyph already brand the page. Drop the global
        // SiteLogo here too so the wordmark doesn't triple up.
        "/library",
        "/prompt", // legacy redirect target — harmless but tidy
        // Day 58 (Sasha 2026-05-02): /activate/welcome lives inside
        // GameShellV2 with hideLogo, but the global SiteLogo was still
        // leaking through and showing a duplicate brand mark above the
        // hero. Suppress here so only the SpacesRail wordmark shows.
        "/activate",
        // /ubb lives in GameShellV2 with hideLogo; suppress the global
        // SiteLogo too so the wordmark doesn't double up across all
        // sub-routes (canvas, artifacts, session, dossier, etc.).
        "/ubb",
        // Day 64 (Sasha 2026-05-07): /quality-of-life-map lives in
        // GameShellV2 (via QolLayout) with hideLogo. Same fix shape
        // as /ubb above — without this, the global SiteLogo wordmark
        // ("FIND YOUR TOP TALENT" lockup top-center) renders ON TOP
        // of pane 3, doubling up with the SpacesRail wordmark in
        // pane 1. Sasha's Day 64 screenshot showed the duplicate.
        // Covers /quality-of-life-map/* (assessment, results) — the
        // ME-space subpage at /game/me/quality-of-life is already
        // covered by the /game prefix earlier in this list.
        "/quality-of-life-map",
        // Day 63 (Sasha 2026-05-07): /asset-mapping wrapped in
        // GameShellV2 today (and /asset-mapping/wizard via startsWith).
        // Without this entry, the global SiteLogo wordmark renders
        // top-center and doubles up with the SpacesRail wordmark in
        // pane 1. Sasha called this out explicitly with the directive
        // to comprehensively trace EVERY brand-mark surface.
        "/asset-mapping",
        // Day 77 (Sasha 2026-05-20): /mission-discovery wrapped in
        // GameShellV2 with hideLogo, but the global SiteLogo wordmark
        // was leaking through top-center on pane 3 — Sasha's screenshot
        // on /ns/mission-discovery shows the "FIND YOUR TOP TALENT"
        // lockup floating above the "Discover Your Mission" headline.
        // The fix is universal (not skin-specific): SiteLogo doesn't
        // read skin, so suppressing here covers default + NS + every
        // future skin.
        "/mission-discovery",
        // Day 74 (2026-05-18): /mdls-preview is the MDLS primitives
        // showcase — its own atmospheric backdrop + device-framed
        // Composed Surface Demo at the top. The global SiteLogo wordmark
        // was overlapping the demo at top-center, killing the layout.
        "/mdls-preview",
        // Day 75 (Sasha 2026-05-19): /build/equilibrium lives in
        // GameShellV2 with hideLogo, but the global SiteLogo wordmark
        // was still leaking through top-center over pane 3 — Sasha
        // called this out repeatedly ("don't make me repeat this
        // instruction yet again"). Suppress here so only the SpacesRail
        // wordmark in pane 1 carries the brand on Equilibrium. Also
        // covers /equilibrium (legacy redirect) and /preview/equilibrium-v2.
        "/build/equilibrium",
        "/equilibrium",
        "/preview/equilibrium-v2",
        // Day 81 (Sasha 2026-05-23): /build/karime lives in GameShellV2
        // with hideLogo (Karime's offering page). Same fix shape as
        // /build/equilibrium above — without this, the global SiteLogo
        // wordmark renders top-center of pane 3 above the eyebrow,
        // duplicating with the SpacesRail wordmark in pane 1. The
        // startsWith match also covers /build/karime/intake (the prep
        // page Sasha sends on WhatsApp).
        "/build/karime",
        "/proposalforwegoodovahere",
        "/build/cockpit",
    ];
    // Day 87 (Sasha 2026-05-29): /1-pager is the Planetary OS brand surface
    // (not the FYTT funnel), so it ships its own PlanetaryOSWordmark in-page
    // instead of the global FYTT mark. /monetization keeps the FYTT global
    // mark since monetization IS funnel-side content.
    // Day 107 (Sasha 2026-06-19): /landing (The Uniqueness Economy thesis
    // flag) ships its own in-page wordmark too — suppress the global FYTT
    // mark so it doesn't double up at top-center.
    const exactHidden = ["/", "/ignite", "/my-result", "/path", "/auth", "/dashboard", "/ai-os", "/library", "/prompt", "/ubb", "/mdls-preview", "/build/equilibrium", "/equilibrium", "/preview/equilibrium-v2", "/build/karime", "/build/karime/intake", "/proposalforwegoodovahere", "/build/cockpit", "/1-pager", "/landing"];
    if (hidden.some(p => location.pathname.startsWith(p)) || exactHidden.includes(location.pathname)) return null;

    return (
        <Link
            to="/"
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 group"
            aria-label="Find Your Top Talent — home"
        >
            <img
                src={brandLogo}
                alt="Find Your Top Talent"
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                style={{
                    filter: "drop-shadow(0 0 14px rgba(244, 212, 114, 0.3))",
                }}
                draggable={false}
            />
        </Link>
    );
};

export default SiteLogo;
