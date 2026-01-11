export const buildQolResultsPath = (returnTo: string | null): string => {
  const returnParam = returnTo ? `?return=${encodeURIComponent(returnTo)}` : "";
  return `/quality-of-life-map/results${returnParam}`;
};

export const buildQolPrioritiesPath = (returnTo: string | null): string => {
  const returnParam = returnTo ? `?return=${encodeURIComponent(returnTo)}` : "";
  return `/quality-of-life-map/priorities${returnParam}`;
};

export const shouldUnlockAfterQol = (returnTo: string | null): boolean => {
  return returnTo === "/start";
};

export const getPostZogRedirect = (returnPath: string | null): string | null => {
  if (returnPath === "/start") {
    return "/quality-of-life-map/assessment?return=/start";
  }
  return null;
};
