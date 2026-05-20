import { lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import AuroraGlassOrb from "./AuroraGlassOrb";

/**
 * MDLS · Aurora Orb 3D — Lightweight wrapper (Wave 10)
 *
 * Heavy R3F implementation lives in MdlsAuroraOrb3DImpl.tsx. Code-split
 * via React.lazy so it loads after first paint.
 *
 * Mobile fallback: the original AuroraGlassOrb CSS-radial-gradient
 * component. Less material truth, but zero R3F runtime cost on the
 * devices that need it most.
 *
 * v2.0 — 2026-05-19 — Wave 10.
 */

const MdlsAuroraOrb3DImpl = lazy(() => import("./MdlsAuroraOrb3DImpl"));

interface MdlsAuroraOrb3DProps {
  size?: number;
  hue?: "warm" | "cool" | "rose" | "violet";
  static?: boolean;
}

export const MdlsAuroraOrb3D = (props: MdlsAuroraOrb3DProps) => {
  const isMobile = useIsMobile();
  const { size = 240 } = props;

  if (isMobile) {
    // Mobile fallback — CSS gradient orb. The R3F translucent-glass
    // effect isn't visible enough at small sizes to justify shipping
    // the whole runtime to mobile devices.
    return <AuroraGlassOrb size={size} />;
  }

  return (
    <Suspense fallback={<div style={{ width: size, height: size }} />}>
      <MdlsAuroraOrb3DImpl {...props} />
    </Suspense>
  );
};

export default MdlsAuroraOrb3D;
