import { Suspense, lazy } from "react";
import { useMdlsFlag } from "../useMdlsFlag";

// Loaded only when the flag is on, so players without it download none of the clock.
const NaturalClockStripLive = lazy(() => import("./NaturalClockStripLive"));

/**
 * Mount point for Village and Equilibrium. Renders nothing unless the
 * existing MDLS / preview flag (`?mdls=1`, see useMdlsFlag) is on for this page
 * load, so players without the flag see no strip, load no clock code, read no
 * birthday and ask for no location.
 */
export const NaturalClockStripGate = ({ className }: { className?: string }) => {
  const enabled = useMdlsFlag();
  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <NaturalClockStripLive className={className} />
    </Suspense>
  );
};

export default NaturalClockStripGate;
