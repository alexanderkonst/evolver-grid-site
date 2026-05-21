import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * EntryPathContext — Funnel v2 (Day 77, Sasha 2026-05-20).
 *
 * Captures the `?path=match` query parameter on first hit and persists
 * it across the multi-step Top Talent / Mission / Assets / QoL flow so
 * each completion surface can render match-flavored CTAs without the
 * URL carrying state on every internal navigation.
 *
 *   - `?path=match`         → captured, persisted, URL stripped
 *   - `?path=build` or none → no-op (default funnel, no context flag)
 *
 * Persisted via `sessionStorage` so a refresh / back-navigation inside
 * the same tab keeps the marketing context, but a fresh tab / new
 * window starts clean (the marketing context is per-session, not a
 * user attribute — no DB persistence per spec §4.1).
 *
 * Spec: docs/specs/funnel-v2/funnel-v2_product_spec.md §4.1.
 */
type EntryPath = "match" | null;

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
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return stored === "match" ? "match" : null;
  });

  // Capture from URL on any SPA navigation that carries `?path=match`,
  // then strip the param from the visible URL so internal navigation
  // doesn't trail it forever. Context + sessionStorage own the state.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(location.search);
    const fromUrl = params.get("path");
    if (fromUrl === "match") {
      setPath("match");
      params.delete("path");
      const newSearch = params.toString();
      const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ""}${location.hash}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [location.pathname, location.search, location.hash]);

  // Mirror state to sessionStorage so refresh / back-navigation survive.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (path === "match") {
      window.sessionStorage.setItem(STORAGE_KEY, "match");
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [path]);

  const clear = useCallback(() => {
    setPath(null);
    if (typeof window !== "undefined") {
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
