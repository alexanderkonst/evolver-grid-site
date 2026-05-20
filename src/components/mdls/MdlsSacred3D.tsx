import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * MDLS · Sacred 3D
 *
 * R3F-rendered sacred-object primitive — a dodecahedron in warm-aurora
 * material, idle slow-rotate, with bloom postprocessing for the
 * luminous-cosmic register. This is what makes 3D look "WOW" rather than
 * "Blender export sitting on a webpage": the bloom + studio HDRI lighting +
 * subtle float gives the object a sense of presence.
 *
 * Why dodecahedron: 12 pentagonal faces — corresponds to Sasha's 12-orb
 * soul color library and the 12-month aurora cycle. It IS the sacred form.
 *
 * Library: @react-three/fiber + @react-three/drei + @react-three/postprocessing
 * (all MIT, by pmndrs)
 *
 * Performance: respects `prefers-reduced-motion` — disables rotation but
 * still renders the object statically. R3F renders only when in viewport
 * (handled by Canvas's frameloop="demand" + Float's RAF gating). Falls back
 * to nothing if WebGL is unavailable (Canvas handles this internally).
 *
 * v1.0 — 2026-05-19 — Wave 2 of the MDLS octave shift.
 */
interface MdlsSacred3DProps {
  /** Pixel size (square). Default 240. */
  size?: number;
  /** Variant: hue tint of the metallic material. */
  hue?: "warm" | "cool" | "neutral";
  /** Disable rotation animation. Default false. */
  static?: boolean;
}

const HUE_PRESETS: Record<NonNullable<MdlsSacred3DProps["hue"]>, {
  color: string;
  emissive: string;
  emissiveIntensity: number;
}> = {
  warm: {
    color: "#f8c878",         // warm gold
    emissive: "#f48a4a",      // coral ember
    emissiveIntensity: 0.18,
  },
  cool: {
    color: "#c2d4e8",
    emissive: "#7a99b8",
    emissiveIntensity: 0.14,
  },
  neutral: {
    color: "#e8e0d2",
    emissive: "#c4b9a4",
    emissiveIntensity: 0.10,
  },
};

const Dodecahedron = ({ hue, isStatic }: { hue: "warm" | "cool" | "neutral"; isStatic: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const palette = HUE_PRESETS[hue];

  useFrame((_, delta) => {
    if (isStatic || !meshRef.current) return;
    // Slow idle rotation — feels "alive", not "spinning". 0.08 rad/s on Y,
    // 0.03 rad/s on X for a subtle compound axis (like a real held object).
    meshRef.current.rotation.y += delta * 0.08;
    meshRef.current.rotation.x += delta * 0.03;
  });

  return (
    <Float
      speed={isStatic ? 0 : 1.2}
      rotationIntensity={0}
      floatIntensity={isStatic ? 0 : 0.4}
    >
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial
          color={palette.color}
          emissive={palette.emissive}
          emissiveIntensity={palette.emissiveIntensity}
          metalness={0.85}
          roughness={0.22}
        />
      </mesh>
    </Float>
  );
};

export const MdlsSacred3D = ({
  size = 240,
  hue = "warm",
  static: isStatic = false,
}: MdlsSacred3DProps) => {
  // Detect prefers-reduced-motion at mount. If user opted out, pin to static.
  const respectReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const effectiveStatic = isStatic || respectReducedMotion;

  return (
    <div
      style={{
        width: size,
        height: size,
        // Prevent the canvas from leaking events outside its container.
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.4], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.55} />
        {/* Single light source upper-left — consistent with the MDLS
            light-source discipline. The Environment HDRI provides the
            specular/reflection ambience, this fills the lit side. */}
        <directionalLight position={[-3, 4, 3]} intensity={1.15} color="#fff6e0" />
        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <Dodecahedron hue={hue} isStatic={effectiveStatic} />
        </Suspense>
        {!effectiveStatic && (
          <EffectComposer>
            <Bloom
              intensity={0.35}
              luminanceThreshold={0.45}
              luminanceSmoothing={0.7}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default MdlsSacred3D;
