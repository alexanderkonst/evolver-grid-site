import type { ReactNode } from "react";
import type { LayerReadiness } from "../phasePlan";

interface PhaseGateProps {
  /** Readiness of the layer this section writes. */
  readiness: LayerReadiness;
  /**
   * One calm line shown when the section isn't due yet, e.g.
   * "Workstreams come at Seeing · Sun Oct 18". No guilt copy — this is a
   * statement of timing, not a missing-field warning.
   */
  comesAt: string;
  children: ReactNode;
}

/**
 * PhaseGate — collapses a write section to a single muted line while it
 * is "not due yet" (issue #63). A section becomes visible the moment its
 * layer is due OR has been filled early; an empty-but-not-due section is
 * legitimate, so we simply say when it arrives rather than show an empty
 * input the user might read as a failure.
 *
 * Only `not_due` collapses. `due_empty` keeps the input visible (that's
 * the nudge) and `filled` always shows its content.
 */
export const PhaseGate = ({ readiness, comesAt, children }: PhaseGateProps) => {
  if (readiness !== "not_due") return <>{children}</>;
  return (
    <p className="mt-4 text-center text-sm italic text-[#0a1628]/45">{comesAt}</p>
  );
};

export default PhaseGate;
