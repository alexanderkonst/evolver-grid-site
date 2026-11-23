/**
 * FamiliarPage — the Your AI place at /game/your-ai: one hand-over screen, then the Outro.
 *
 * The step lives in the address (`?step=outro`; none = the hand-over), so a deep link lands on the
 * right screen, the browser's Back returns to the hand-over, and a refresh stays put. Any other
 * `?step=` (including the retired `ask` and `reveal` of the old test) is replaced by the hand-over.
 * The place is open to everyone: a guest sees gift 2 lit and gifts 1 and 3 dim.
 */
import { useCallback } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import FamiliarHandOverScreen from "./screens/FamiliarHandOverScreen";
import FamiliarOutroScreen from "./screens/FamiliarOutroScreen";
import { useFamiliar } from "./useFamiliar";

const FamiliarPage = () => {
  const [params, setParams] = useSearchParams();
  const state = useFamiliar();

  const toOutro = useCallback(() => setParams({ step: "outro" }), [setParams]);

  const raw = params.get("step");
  if (raw === "outro") return <FamiliarOutroScreen state={state} />;
  // An old or unknown ?step= is a stale link, not a screen: land on the hand-over.
  if (raw !== null) return <Navigate to="/game/your-ai" replace />;
  return <FamiliarHandOverScreen state={state} onNext={toOutro} />;
};

export default FamiliarPage;
