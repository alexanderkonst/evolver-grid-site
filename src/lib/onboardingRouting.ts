export const buildQolResultsPath = (returnTo: string | null): string => {
  const returnParam = returnTo ? `?return=${encodeURIComponent(returnTo)}` : "";
  return `/quality-of-life-map/results${returnParam}`;
};

/**
 * @deprecated Day 64 (Sasha 2026-05-07). The /quality-of-life-map/priorities
 * route was retired in the Results revamp. Helper kept for the dead-code
 * Priorities page (which still references it as an internal navigation),
 * but no LIVE caller uses this. Safe to delete once the dead pages are
 * truly removed. See docs/specs/quality-of-life-map/results_revamp_spec.md.
 */
export const buildQolPrioritiesPath = (returnTo: string | null): string => {
  const returnParam = returnTo ? `?return=${encodeURIComponent(returnTo)}` : "";
  return `/quality-of-life-map/priorities${returnParam}`;
};

/**
 * @deprecated Day 64 (Sasha 2026-05-07). The /quality-of-life-map/growth-recipe
 * route was retired in the same revamp. Same disposition as
 * buildQolPrioritiesPath above.
 */
export const buildQolGrowthRecipePath = (returnTo: string | null, domain?: string | null): string => {
  const params = new URLSearchParams();
  if (returnTo) params.set("return", returnTo);
  if (domain) params.set("domain", domain);
  const query = params.toString();
  return `/quality-of-life-map/growth-recipe${query ? `?${query}` : ""}`;
};

export const shouldUnlockAfterQol = (returnTo: string | null): boolean => {
  return returnTo === "/start";
};

export const getPostZogRedirect = (returnPath: string | null): string | null => {
  // After ZoG, return directly to onboarding (shows Tour)
  // QoL is now in LEARN space, not part of onboarding
  if (returnPath === "/start") {
    return "/start";
  }
  return null;
};
