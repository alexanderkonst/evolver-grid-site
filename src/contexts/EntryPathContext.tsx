import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * EntryPathContext — Funnel v2 (Day 77, Sasha 2026-05-20).
 *
 * Captures the `?path=` query parameter on first hit and persists it
 * across the multi-step Top Talent / Mission / Assets / QoL flow so
 * each completion surface can render the right funnel CTAs without the
 * URL carrying state on every internal navigation.
 *
 * DEFAULT FLIP (2026-06-10, Sasha's call after the live-demo fork):
 * the MATCH FUNNEL is now the default for everyone. Cold traffic on
 * the bare URL gets reveal → Mission → Assets → matchmaking. The
 * legacy sessions funnel (reveal → $555/$37 cards, build-flavored
 * JOURNEY terminus) is reachable only via an explicit `?path=build`
 * link — that's the link Sasha sends when selling sessions directly.
 *
 *   - `?path=match` → captured, persisted, URL stripped. Still
 *     meaningful: it is what swaps the LANDING HERO to MatchHero
 *     (JourneyPage checks `path === "match"` — the venture landing
 *     stays the default hero for organic traffic).
 *   - `?path=build` → captured, persisted. Funnel surfaces check
 *     `path === "build"` to restore the legacy sessions funnel.
 *   - none          → null. Funnel surfaces treat null as match
 *     funnel (`path !== "build"`); the hero stays the venture landing.
 *
 * Predicate convention for consumers:
 *   - "which funnel CTAs?"        → `path !== "build"` (match funnel)
 *   - "explicit match-hero entry?" → `path === "match"` (JourneyPage only)
 *
 * Persisted via `localStorage` (Day 79 (Sasha 2026-05-22) upgrade —
 * previously sessionStorage). The magic-link auth flow opens the
 * confirmation in a new tab from email, and sessionStorage is per-tab,
 * so the new tab would lose the flavor: wrong hero, wrong Mux video,
 * wrong CTAs. localStorage survives the cross-tab hop and matches how
 * `app-skin`, `fytt:collaborate-unlocked`, and `fytt:ai-os-visited`
 * are already stored in this codebase. An explicit `?path=` entry
 * always overrides any stale stored flag (see capture useEffect below).
 *
 * Spec: docs/specs/funnel-v2/funnel-v2_product_spec.md §4.1 (+ the
 * dated 2026-06-10 default-flip correction in that section).
 */
type EntryPath = "match" | "build" | null;

interface EntryPathContextValue {
  path: EntryPath;
  /** Clear the path — called once the post-Top-Talent CTAs have been served. */
  clear: () => void;
}

const STORAGE_KEY = "ftt_entry_path";

const EntryPathContext = createContext<EntryPathContextValue>({
  path: null,
  clear: () => undefined,
});

export const EntryPathProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  const [path, setPath] = useState<EntryPath>(() => {
    if (typeof window === "undefined") return null;
    const fromUrl = new URLSearchParams(window.location.search).get("path");
    if (fromUrl === "match") return "match";
    if (fromUrl === "build") return "build";
    // Day 79: read localStorage (was sessionStorage). Falls through to
    // sessionStorage as a one-time migration so any user mid-flow when
    // we ship this doesn't lose their entry-path state.
    const stored =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.sessionStorage.getItem(STORAGE_KEY);
    if (stored === "match" || stored === "build") return stored;
    return null;
  });

  // Capture from URL on any SPA navigation that carries `?path=match`,
  // then strip the param from the visible URL so internal navigation
  // doesn't trail it forever. Context + sessionStorage own the state.
  //
  // Day 78 (Sasha 2026-05-21) BUG FIX: skip the URL strip on landing
  // routes (`/`, `/game/journey`). The landing renders MatchHero vs
  // MethodologyLandingPage purely from URL search params (see
  // JourneyPage.tsx), so stripping the param on the landing would mean
  // a refresh of `/?path=match` lands on `/` with build-path rendered.
  // On non-landing routes the strip still fires — cleaner URLs while
  // the user works through the assessment.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(location.search);
    const fromUrl = params.get("path");
    // 2026-06-10 default flip: `?path=build` is now a real, sticky
    // override (the sessions-funnel link Sasha sends), not just a
    // clear-the-match-flag escape hatch. It persists through the
    // multi-step flow exactly like match used to.
    if (fromUrl !== "match" && fromUrl !== "build") return;
    setPath(fromUrl);
    const isLandingRoute =
      location.pathname === "/" || location.pathname === "/game/journey";
    if (isLandingRoute) return;
    params.delete("path");
    const newSearch = params.toString();
    const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ""}${location.hash}`;
    window.history.replaceState({}, "", newUrl);
  }, [location.pathname, location.search, location.hash]);

  // Mirror state to localStorage so refresh / back-navigation / the
  // magic-link cross-tab hop all survive. Clear the legacy sessionStorage
  // entry on the same write so we don't carry a stale value forever.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (path === "match" || path === "build") {
      window.localStorage.setItem(STORAGE_KEY, path);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    window.sessionStorage.removeItem(STORAGE_KEY);
  }, [path]);

  const clear = useCallback(() => {
    setPath(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <EntryPathContext.Provider value={{ path, clear }}>
      {children}
    </EntryPathContext.Provider>
  );
};

export const useEntryPath = () => useContext(EntryPathContext);
