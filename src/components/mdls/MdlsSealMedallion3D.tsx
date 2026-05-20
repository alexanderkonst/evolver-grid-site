import { lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import SealMedallion from "./SealMedallion";

/**
 * MDLS · Seal Medallion 3D — Lightweight wrapper (Wave 10)
 *
 * Heavy R3F implementation lives in MdlsSealMedallion3DImpl.tsx. Code-split
 * via React.lazy.
 *
 * Mobile fallback: the original SVG SealMedallion (mandala variant). Flat
 * but visually crisp at small sizes.
 *
 * v2.0 — 2026-05-19 — Wave 10.
 */

const MdlsSealMedallion3DImpl = lazy(() => import("./MdlsSealMedallion3DImpl"));

interface MdlsSealMedallion3DProps {
  size?: number;
  static?: boolean;
  tone?: "bronze" | "gold" | "iron";
}

export const MdlsSealMedallion3D = (props: MdlsSealMedallion3DProps) => {
  const isMobile = useIsMobile();
  const { size = 200 } = props;

  if (isMobile) {
    // Mobile fallback — flat SVG mandala. The 3D coin's bevel + sway are
    // invisible at the small sizes used on mobile (max ~120px); the SVG
    // mandala carries the seal register without the R3F runtime.
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <SealMedallion size={Math.round(size * 0.6)} variant="mandala" />
      </div>
    );
  }

  return (
    <Suspense fallback={<div style={{ width: size, height: size }} />}>
      <MdlsSealMedallion3DImpl {...props} />
    </Suspense>
  );
};

export default MdlsSealMedallion3D;
