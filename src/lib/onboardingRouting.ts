export const buildQolResultsPath = (returnTo: string | null): string => {
  const returnParam = returnTo ? `?return=${encodeURIComponent(returnTo)}` : "";
  return `/quality-of-life-map/results${returnParam}`;
};

export const buildQolPrioritiesPath = (returnTo: string | null): string => {
  const returnParam = returnTo ? `?return=${encodeURIComponent(returnTo)}` : "";
  return `/quality-of-life-map/priorities${returnParam}`;
};

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
