import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * MDLS · Soul Orb Field 3D
 *
 * 12-orb soul color library rendered as R3F translucent spheres in a
 * single Canvas. Replaces the CSS-radial-gradient SoulOrbGoal components
 * for the Materials Gallery display.
 *
 * Why one Canvas instead of 12: each R3F Canvas needs its own WebGL
 * context — 12 contexts would crush perf. Single Canvas with 12 spheres
 * positioned in 3D space (4 cols × 3 rows in a grid) renders in one
 * draw pass. Each sphere has its own hue + inner-light source.
 *
 * Layout: Canvas sized 4:3 aspect, sphere positions in world space:
 *   cols at x = [-2.4, -0.8, 0.8, 2.4]
 *   rows at y = [1.6, 0, -1.6]
 *   z = 0 (all in same plane)
 *
 * v1.0 — 2026-05-19 — Wave 9 / M1.
 */

interface SoulOrbHue {
  glass: string;       // body color (subtle tint)
  inner: string;       // inner-light color (defines the orb's identity)
  name: string;
}

// 12 hues — calibrated to match the existing SoulOrbGoal CSS-var library.
// Sourced from --mdls-orb-1-c through --mdls-orb-12-r in index.css.
const ORB_HUES: SoulOrbHue[] = [
  { glass: "#f8d8a8", inner: "#f48a4a", name: "aurora-warm" },
  { glass: "#f4c4a4", inner: "#e87060", name: "aurora-coral" },
  { glass: "#e8b8c0", inner: "#d46090", name: "aurora-rose" },
  { glass: "#d8b8d4", inner: "#a85ba8", name: "aurora-orchid" },
  { glass: "#c8b8d8", inner: "#6a5aa0", name: "aurora-violet" },
  { glass: "#b8c4d8", inner: "#5060a0", name: "aurora-indigo" },
  { glass: "#a8c8d8", inner: "#4080a0", name: "aurora-aqua" },
  { glass: "#a8d4c4", inner: "#40a880", name: "aurora-mint" },
  { glass: "#c4d4a8", inner: "#80a040", name: "aurora-sage" },
  { glass: "#dcc8a0", inner: "#a87830", name: "aurora-ochre" },
  { glass: "#e8c898", inner: "#c08020", name: "aurora-amber" },
  { glass: "#e8a890", inner: "#c06030", name: "aurora-ember" },
];

const SoulOrbMesh = ({
  position,
  hue,
  index,
}: {
  position: [number, number, number];
  hue: SoulOrbHue;
  index: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // Each orb rotates at a slightly different rate — offset by index ×
    // 0.008 — so the field reads as "alive" without being mechanical
    // (no synchronized rotation = no "wall of clocks" feel).
    meshRef.current.rotation.y += delta * (0.04 + index * 0.005);
  });

  return (
    <group position={position}>
      {/* Inner light source — the aurora glow */}
      <pointLight
        position={[0, -0.1, 0.2]}
        intensity={1.2}
        color={hue.inner}
        distance={1.2}
        decay={1.3}
      />
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshPhysicalMaterial
          color={hue.glass}
          emissive={hue.inner}
          emissiveIntensity={0.35}
          transmission={0.75}
          thickness={0.8}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.1}
          roughness={0.14}
          metalness={0}
          attenuationColor={hue.inner}
          attenuationDistance={1.0}
        />
      </mesh>
    </group>
  );
};

interface MdlsSoulOrbField3DProps {
  /** Display width in pixels. Aspect locked 4:3. */
  width?: number;
  /** Show label row below each orb. Default true. */
  showLabels?: boolean;
}

export const MdlsSoulOrbField3D = ({
  width = 520,
  showLabels = true,
}: MdlsSoulOrbField3DProps) => {
  const respectReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // 4 columns × 3 rows
  const positions: Array<[number, number, number]> = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      positions.push([col * 1.6 - 2.4, 1.6 - row * 1.6, 0]);
    }
  }

  return (
    <div className="relative" style={{ width }}>
      <div style={{ width, aspectRatio: "4/3", pointerEvents: "none" }}>
        <Canvas
          camera={{ position: [0, 0, 6.2], fov: 42 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.45} />
          <directionalLight position={[-4, 4, 3]} intensity={0.65} color="#fff2e0" />
          <Suspense fallback={null}>
            <Environment preset="sunset" />
            {positions.map((pos, i) => (
              <SoulOrbMesh
                key={i}
                position={pos}
                hue={ORB_HUES[i]}
                index={respectReducedMotion ? 0 : i}
              />
            ))}
          </Suspense>
          {!respectReducedMotion && (
            <EffectComposer multisampling={0}>
              <Bloom
                intensity={0.7}
                luminanceThreshold={0.35}
                luminanceSmoothing={0.6}
                mipmapBlur
              />
            </EffectComposer>
          )}
        </Canvas>
      </div>

      {showLabels && (
        <div className="grid grid-cols-4 gap-x-4 mt-3">
          {ORB_HUES.map((hue) => (
            <p
              key={hue.name}
              className="text-[9px] font-mono text-[#0a1628]/50 text-center"
            >
              {hue.name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default MdlsSoulOrbField3D;
