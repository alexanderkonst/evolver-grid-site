import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * MDLS · Seal Medallion 3D
 *
 * R3F-rendered sacred-stamp form — the weight of a real wax seal or
 * bronze coin. Replaces the flat SVG SealMedallion for hero-tier
 * placements (kept SVG for inline icon usage where the cost doesn't
 * justify the visual return).
 *
 * Geometry: a cylinder (the seal body) + concentric ring details on the
 * top face simulated via additional smaller cylinders at varying heights.
 * This gives the mandala-emboss feel WITHOUT requiring a normal map or
 * texture import.
 *
 * Material: warm bronze — moderately metallic + medium roughness — reads
 * as fired bronze, not polished gold. With Bloom + contact shadow, it
 * feels like a real held object.
 *
 * v1.0 — 2026-05-19 — Wave 9 / M3.
 */

interface MdlsSealMedallion3DProps {
  size?: number;
  /** Static mode (no rotation). Default false. */
  static?: boolean;
  /** Tone of the seal metal. */
  tone?: "bronze" | "gold" | "iron";
}

const TONES: Record<NonNullable<MdlsSealMedallion3DProps["tone"]>, {
  color: string;
  emissive: string;
  metalness: number;
  roughness: number;
}> = {
  bronze: { color: "#c89060", emissive: "#5c2818", metalness: 0.55, roughness: 0.5 },
  gold:   { color: "#e8b860", emissive: "#705028", metalness: 0.65, roughness: 0.35 },
  iron:   { color: "#7c7c84", emissive: "#1a1a20", metalness: 0.6, roughness: 0.55 },
};

const SealCoin = ({ tone, isStatic }: { tone: NonNullable<MdlsSealMedallion3DProps["tone"]>; isStatic: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const palette = TONES[tone];

  useFrame((state, delta) => {
    if (isStatic || !groupRef.current) return;
    // Slow held-coin sway — figure-8 motion. The coin feels like it's
    // being turned slowly in someone's hand.
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.12;
    groupRef.current.rotation.y = Math.cos(t * 0.3) * 0.18 + delta * 0.05 + groupRef.current.rotation.y;
  });

  // Coin proportions: thin disc, slightly wider than tall.
  return (
    <group ref={groupRef}>
      {/* Main seal body — flat cylinder */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 0.18, 48]} />
        <meshStandardMaterial
          color={palette.color}
          emissive={palette.emissive}
          emissiveIntensity={0.06}
          metalness={palette.metalness}
          roughness={palette.roughness}
        />
      </mesh>

      {/* Top-face concentric ring details — simulates the mandala emboss
          via height-stacked cylinder rings at increasing radii. Each ring
          adds 0.005 height — subtle, the way a stamped seal works. */}
      {[0.85, 0.7, 0.55, 0.4].map((radius, i) => (
        <mesh key={i} position={[0, 0.09 + i * 0.005, 0]} castShadow>
          <torusGeometry args={[radius, 0.015, 8, 48]} />
          <meshStandardMaterial
            color={palette.color}
            emissive={palette.emissive}
            emissiveIntensity={0.08}
            metalness={palette.metalness + 0.1}
            roughness={palette.roughness - 0.1}
          />
        </mesh>
      ))}

      {/* Center boss — the sacred-point dot at the heart of the mandala */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial
          color={palette.color}
          emissive={palette.emissive}
          emissiveIntensity={0.12}
          metalness={palette.metalness + 0.15}
          roughness={palette.roughness - 0.15}
        />
      </mesh>

      {/* Rim — a torus around the outer edge, slightly raised, defines
          the seal's "edge bevel" */}
      <mesh position={[0, 0.085, 0]} castShadow>
        <torusGeometry args={[0.97, 0.025, 8, 48]} />
        <meshStandardMaterial
          color={palette.color}
          emissive={palette.emissive}
          emissiveIntensity={0.05}
          metalness={palette.metalness}
          roughness={palette.roughness}
        />
      </mesh>
    </group>
  );
};

export const MdlsSealMedallion3D = ({
  size = 200,
  static: isStatic = false,
  tone = "bronze",
}: MdlsSealMedallion3DProps) => {
  const respectReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  const effectiveStatic = isStatic || respectReducedMotion;

  return (
    <div style={{ width: size, height: size, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 1.6, 2.2], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        shadows
      >
        <ambientLight intensity={0.25} />
        {/* Key light from upper-left — MDLS discipline */}
        <directionalLight
          position={[-2.5, 4, 2]}
          intensity={1.5}
          color="#fff6e0"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        {/* Rim from back to define silhouette */}
        <directionalLight position={[2, 1, -2.5]} intensity={0.55} color="#f4c878" />
        {/* Fill light below */}
        <directionalLight position={[1, -1, 1.5]} intensity={0.3} color="#f8d8a8" />

        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <SealCoin tone={tone} isStatic={effectiveStatic} />
          <ContactShadows
            position={[0, -0.15, 0]}
            opacity={0.45}
            scale={4}
            blur={2.2}
            far={3}
            color="#3a2010"
          />
        </Suspense>

        {!effectiveStatic && (
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.4}
              luminanceThreshold={0.55}
              luminanceSmoothing={0.6}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default MdlsSealMedallion3D;
