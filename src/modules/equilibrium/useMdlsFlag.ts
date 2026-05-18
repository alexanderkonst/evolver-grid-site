import { useEffect, useState } from "react";

/**
 * MDLS feature flag.
 *
 * Resolves to `true` when either:
 *   1. URL contains `?mdls=1` (single-session preview, easy to share)
 *   2. localStorage key `equilibrium_mdls` is `"true"` (persisted across sessions)
 *
 * URL param takes precedence and persists itself to localStorage so a fresh
 * load on the same browser keeps the flag. `?mdls=0` clears the flag.
 *
 * Default: `false` (legacy Equilibrium remains the production default).
 */
const MDLS_KEY = "equilibrium_mdls";

function readInitial(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const urlValue = params.get("mdls");
  if (urlValue === "1") {
    try {
      window.localStorage.setItem(MDLS_KEY, "true");
    } catch {
      /* ignore */
    }
    return true;
  }
  if (urlValue === "0") {
    try {
      window.localStorage.setItem(MDLS_KEY, "false");
    } catch {
      /* ignore */
    }
    return false;
  }
  try {
    return window.localStorage.getItem(MDLS_KEY) === "true";
  } catch {
    return false;
  }
}

export function useMdlsFlag(): boolean {
  const [flag, setFlag] = useState<boolean>(() => readInitial());

  useEffect(() => {
    // Re-evaluate on storage events (cross-tab toggling).
    const handler = (e: StorageEvent) => {
      if (e.key === MDLS_KEY) setFlag(e.newValue === "true");
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return flag;
}
