export const FEATURE_FLAGS = {
  DAILY_LOOP_V2: import.meta.env.VITE_DAILY_LOOP_V2 === "true",
};

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
