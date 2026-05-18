import { useState } from "react";

/**
 * MDLS feature flag — URL-only (Sasha 2026-05-18).
 *
 * Previously persisted to localStorage, which left users "stuck" on MDLS
 * after a single visit with `?mdls=1`. Sasha hit it and couldn't get
 * back to legacy without knowing to visit `?mdls=0`. Now ephemeral:
 * present iff the URL has `?mdls=1` on this page load; gone on next
 * navigation.
 *
 * Also clears any pre-existing localStorage value on first read so users
 * who previously had the flag persisted automatically revert to legacy
 * on next page load.
 *
 * Default: `false`. Legacy Equilibrium is the production surface.
 */
const MDLS_KEY = "equilibrium_mdls";

function readInitial(): boolean {
  if (typeof window === "undefined") return false;

  // One-time migration: clear any pre-existing persisted flag so users
  // who turned MDLS on under the old logic don't stay stuck on it.
  try {
    if (window.localStorage.getItem(MDLS_KEY) !== null) {
      window.localStorage.removeItem(MDLS_KEY);
    }
  } catch {
    /* localStorage unavailable; nothing to clean up. */
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("mdls") === "1";
}

export function useMdlsFlag(): boolean {
  const [flag] = useState<boolean>(() => readInitial());
  return flag;
}
