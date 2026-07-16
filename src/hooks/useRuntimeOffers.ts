import { useCallback, useEffect, useState } from "react";
import {
  fetchRuntimeOffers,
  getBundledOffers,
  type RuntimeOffersResult,
} from "@/lib/runtimeOffers";

interface RuntimeOffersState extends RuntimeOffersResult {
  loading: boolean;
  error: string | null;
}

export const useRuntimeOffers = () => {
  const [state, setState] = useState<RuntimeOffersState>(() => ({
    ...getBundledOffers(),
    loading: true,
    error: null,
  }));

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await fetchRuntimeOffers();
      setState({ ...result, loading: false, error: null });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Runtime offer data could not be loaded.",
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
};
