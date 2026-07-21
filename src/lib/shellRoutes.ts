/**
 * shellRoutes.ts — URL classifier for the layout-route refactor.
 *
 * Day 87 (Sasha 2026-05-29). The app's persistent shell (`GameShellV2`)
 * is hoisted to ONE pathless layout route that wraps the entire route
 * list (see `App.tsx`). That layout renders the shell only for the paths
 * that should have it — this module is the decision function.
 *
 * Why a classifier instead of physically regrouping 176 routes into
 * layout buckets: regrouping risks dropping a route or mis-assigning an
 * auth wrapper (an auth hole — the genuinely-bad failure mode). Leaving
 * the route list byte-for-byte unchanged and deciding shell-vs-no-shell
 * by URL means the WORST a mistake here can do is show/hide the rail on
 * a page that didn't want it — purely visual, one-line fixable.
 *
 * Precedence: holdout → in-shell → default(no shell).
 *   - HOLDOUT: pages that render their OWN specially-configured shell
 *     (different hideNavigation/showNavigation per internal state). The
 *     layout must NOT add a second shell for these; the page owns it.
 *   - IN-SHELL: the layout supplies the persistent shell. The page's own
 *     internal <GameShellV2> (until stripped) no-ops via the nesting
 *     guard, so these render correctly throughout the migration.
 *   - DEFAULT: no shell (marketing pages, auth, bare utility pages,
 *     public profile/dossier surfaces, redirects).
 *
 * NOTE: redirect routes (`<Navigate replace/>`) render nothing visible —
 * they bounce before paint — so their classification is harmless either
 * way. They're not enumerated.
 */

/** Pages that render their own shell with special config — layout stays out. */
const HOLDOUT_EXACT = new Set<string>([
    "/zone-of-genius",       // ZoneOfGeniusEntry (shell config flips per wizard step)
    "/game/journey/start",   // ZoneOfGeniusEntry
    "/zone-of-genius/entry", // ZoneOfGeniusEntry
    "/quiz",                 // GeniusQuiz (hideNavigation)
    "/game/settings",        // Settings (showNavigation)
    "/start",                // OnboardingPage → TourStepsScreen (showNavigation)
]);

const HOLDOUT_PREFIX: string[] = [
    "/zone-of-genius/assessment", // ZoneOfGeniusAssessmentLayout (own Outlet layout)
    "/build/karime",              // KarimeOffer / KarimeIntake (hideLogo + defaultRailMinimized)
];

/** Paths whose page currently mounts GameShellV2 → layout supplies it instead. */
const SHELL_EXACT = new Set<string>([
    "/",
    "/ignite",
    "/path",
    "/dashboard",
    "/mission-discovery",
    "/my-artifacts",
    "/feedback",
    "/game/journey",
    "/activate-top-talent",
    "/the-originals",
    "/sandra",
    "/sergey",
    "/oyi",
    "/zone-of-genius/appleseed",
    "/zone-of-genius/excalibur",
    "/marketplace/create-page",
    "/my-page",
    "/preview/equilibrium-v2",
    "/build/equilibrium",
    "/skills",
    "/growth-paths",
    "/build/cockpit",
    "/build/cockpit/dashboard",
    "/build/cockpit/offers",
    "/game/test-nav",
    "/game/next-move-v2",   // DailyLoopV2 — sibling of /game/next-move; distinct path so listed explicitly
    "/products/evolution-portal", // EvolutionPortal — member-portal chrome is part of the product's proof (Day 130)
]);

/**
 * Auth + Admin render their shell CONDITIONALLY from internal state
 * (Auth flips between hideLogo / no-shell across its auth phases). The
 * layout must stay out and let them own it — they behave as holdouts.
 * `/founders` resolves to FoundersIndex (no shell); the FoundersShowcase
 * duplicate route is unreachable dead code. All three correctly fall
 * through to the default `false` below — documented here so a future
 * reader doesn't "fix" them into the shell set.
 */

const SHELL_PREFIX: string[] = [
    "/ai-os",
    "/ubb",
    "/playbook",
    "/library",
    "/asset-mapping",
    "/quality-of-life-map",
    "/game/me",
    "/game/next-move",
    "/game/learn",
    "/game/marketplace",
    "/game/collaborate",
    "/game/meet",
    "/game/build",
    "/game/path",
    "/events/community",
];

/** Paths that should render with the top-right home/logo tile HIDDEN. */
const HIDE_LOGO_EXACT = new Set<string>([
    "/path",
    "/ai-os/work-with-us",
    "/mission-discovery",
    "/build/equilibrium",
    "/build/cockpit",
    "/build/cockpit/dashboard",
    "/build/cockpit/offers",
    "/preview/equilibrium-v2",
    "/game/me/quality-of-life",
    "/game/me/mission",
]);

const HIDE_LOGO_PREFIX: string[] = [
    "/ubb",
    "/quality-of-life-map",
    "/game/me/zone-of-genius",
];

const prefixMatch = (pathname: string, prefixes: string[]): boolean =>
    prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));

/**
 * True when the pathless layout route should render the persistent
 * GameShellV2 around this path's page.
 */
export function pathUsesLayoutShell(pathname: string): boolean {
    if (HOLDOUT_EXACT.has(pathname)) return false;
    if (prefixMatch(pathname, HOLDOUT_PREFIX)) return false;
    if (SHELL_EXACT.has(pathname)) return true;
    if (prefixMatch(pathname, SHELL_PREFIX)) return true;
    return false;
}

/**
 * True when the shell for this path should hide the top-right logo tile.
 * Only consulted when `pathUsesLayoutShell` is true.
 */
export function pathHidesLogo(pathname: string): boolean {
    if (HIDE_LOGO_EXACT.has(pathname)) return true;
    if (prefixMatch(pathname, HIDE_LOGO_PREFIX)) return true;
    return false;
}
