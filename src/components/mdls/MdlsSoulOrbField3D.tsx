import { lazy, Suspense } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import SoulOrbGoal from "./SoulOrbGoal";

/**
 * MDLS · Soul Orb Field 3D — Lightweight wrapper (Wave 10)
 *
 * Heavy R3F implementation lives in MdlsSoulOrbField3DImpl.tsx. Code-split
 * via React.lazy.
 *
 * Mobile fallback: 4×3 grid of CSS-gradient SoulOrbGoal components (the
 * original implementation). Visual register holds; just no translucent-
 * glass material truth on devices where it would be invisible anyway.
 *
 * v2.0 — 2026-05-19 — Wave 10.
 */

const MdlsSoulOrbField3DImpl = lazy(() => import("./MdlsSoulOrbField3DImpl"));

const ORB_NAMES = [
  "aurora-warm", "aurora-coral", "aurora-rose", "aurora-orchid",
  "aurora-violet", "aurora-indigo", "aurora-aqua", "aurora-mint",
  "aurora-sage", "aurora-ochre", "aurora-amber", "aurora-ember",
];

interface MdlsSoulOrbField3DProps {
  width?: number;
  showLabels?: boolean;
}

export const MdlsSoulOrbField3D = (props: MdlsSoulOrbField3DProps) => {
  const isMobile = useIsMobile();
  const { width = 520, showLabels = true } = props;

  if (isMobile) {
    // Mobile fallback — 4×3 grid of CSS-gradient orbs. Same identity
    // assignment (orbId 1-12 maps to the same hues via index.css vars).
    return (
      <div style={{ width: Math.min(width, 320) }} className="mx-auto">
        <div className="grid grid-cols-4 gap-x-4 gap-y-5 justify-items-center">
          {ORB_NAMES.map((name, i) => (
            <div key={i} className="text-center">
              <SoulOrbGoal orbId={i + 1} size={48} label={name} />
              {showLabels && (
                <p className="mt-1.5 text-[8px] font-mono text-[#0a1628]/50 leading-tight">
                  {name}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={<div style={{ width, aspectRatio: "4/3" }} />}
    >
      <MdlsSoulOrbField3DImpl {...props} />
    </Suspense>
  );
};

export default MdlsSoulOrbField3D;
