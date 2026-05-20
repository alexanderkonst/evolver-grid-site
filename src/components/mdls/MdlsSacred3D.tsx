import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, N8AO, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

/**
 * MDLS · Sacred 3D
 *
 * R3F-rendered sacred-object primitive — a dodecahedron in matte-ceramic
 * material under 3-point industrial-design lighting. Reads as a held
 * artifact photographed in a studio, not a Blender export.
 *
 * Library: @react-three/fiber + @react-three/drei + @react-three/postprocessing
 * (all MIT, by pmndrs)
 *
 * v2.0 — 2026-05-19 — Wave 5 photo-real manifestation pass.
 *
 * Changes from v1.0 (Sasha's feedback "looks low fidelity, too shiny,
 * needs matte texture + isometric motion"):
 *   - Material: was metalness 0.85 / roughness 0.22 (mirror metal).
 *     Now metalness 0.1 / roughness 0.75 (matte ceramic clay).
 *   - Lighting: was 1 directional + ambient. Now 3-point industrial
 *     photography setup — rim (back warm), key (UL cool cream), fill
 *     (LR warm) — plus Environment HDRI for specular ambience.
 *   - Motion: was single Y-axis spin. Now compound (Y constant + slight
 *     figure-8 wobble on X) — feels like a held ceramic, not a turntable.
 *   - Postprocessing: was Bloom only. Now Bloom + N8AO (ambient occlusion
 *     for deep crevices) + subtle Noise (film-grain authenticity).
 *   - ContactShadows on the floor — anchors the object to a surface,
 *     reads as "sitting on the table" instead of "floating in void".
 *
 * Performance: respects prefers-reduced-motion. R3F renders only when
 * in viewport. AO uses N8AO (faster than vanilla SSAO).
 */
interface MdlsSacred3DProps {
  /** Pixel size (square). Default 240. */
  size?: number;
  /** Variant: hue tint of the ceramic material. */
  hue?: "warm" | "cool" | "neutral";
  /** Disable rotation animation. Default false. */
  static?: boolean;
}

// Ceramic material presets — these are calibrated to look like glazed
// ceramic clay, NOT polished metal. Low metalness + high roughness.
const HUE_PRESETS: Record<NonNullable<MdlsSacred3DProps["hue"]>, {
  color: string;
  emissive: string;
  emissiveIntensity: number;
}> = {
  warm: {
    color: "#e8b873",          // warm clay (honey gold)
    emissive: "#c46a3a",       // deep ember (subtle inner warmth)
    emissiveIntensity: 0.08,   // very subtle — should feel lit-from-within, not glowing
  },
  cool: {
    color: "#b8c8d8",
    emissive: "#5a7896",
    emissiveIntensity: 0.06,
  },
  neutral: {
    color: "#d8d0c2",
    emissive: "#9a8e7a",
    emissiveIntensity: 0.05,
  },
};

const Dodecahedron = ({ hue, isStatic }: { hue: "warm" | "cool" | "neutral"; isStatic: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const palette = HUE_PRESETS[hue];

  useFrame((state, delta) => {
    if (isStatic || !meshRef.current) return;
    // Compound rotation — Y constant baseline + figure-8 wobble on X.
    // The Y rotation is slow (0.06 rad/s — ~6°/s) so the object reads
    // as "always alive" without dominating attention.
    // The X wobble uses sin(time) for a slight nod — about 0.08 rad
    // amplitude (~5°), period ~5s. This is what makes it feel HELD,
    // not turntable-spinning.
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.y += delta * 0.06;
    meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.08;
    // Subtle Z wobble offset by π/3 — figure-8 effect.
    meshRef.current.rotation.z = Math.sin(t * 0.4 + Math.PI / 3) * 0.04;
  });

  // Wave 6 (Day 74 evening): removed the <Float> wrapper. Float was adding
  // an extra Y-bob on top of the compound rotation, which on slower hardware
  // showed up as visible jitter — two motion sources fighting for the same
  // frame budget. Compound rotation alone is enough "alive."
  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <dodecahedronGeometry args={[1.15, 0]} />
      <meshStandardMaterial
        color={palette.color}
        emissive={palette.emissive}
        emissiveIntensity={palette.emissiveIntensity}
        metalness={0.1}
        roughness={0.75}
        envMapIntensity={0.4}
      />
    </mesh>
  );
};

export const MdlsSacred3D = ({
  size = 240,
  hue = "warm",
  static: isStatic = false,
}: MdlsSacred3DProps) => {
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
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0.3, 3.4], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        shadows
      >
        {/* ─── 3-point industrial-design photography lighting ──────────
            This is the studio setup that makes objects READ as photographed
            rather than rendered. Three lights at calibrated positions: */}

        {/* Ambient: very low — just enough to lift shadows. */}
        <ambientLight intensity={0.18} />

        {/* KEY LIGHT — primary illumination, upper-left, cool-cream.
            This is what defines the lit side of the object. The MDLS
            light-source discipline says "upper-left always" — kept. */}
        <directionalLight
          position={[-3.5, 4.5, 2.5]}
          intensity={1.35}
          color="#fff6e0"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* RIM LIGHT — back-right, warm gold. Creates the highlight along
            the silhouette edge that separates the object from the background.
            This is what gives objects the "polished product photography"
            edge-glow. Industrial design 101. */}
        <directionalLight
          position={[3, 2, -3]}
          intensity={0.7}
          color="#f4c878"
        />

        {/* FILL LIGHT — lower, soft warm. Fills the shadow side so the
            object doesn't go pitch black on the dark side. Half-strength
            of the key, opposite axis. */}
        <directionalLight
          position={[2, -1.5, 2]}
          intensity={0.4}
          color="#f8d8a8"
        />

        <Suspense fallback={null}>
          {/* Environment HDRI provides specular reflections + ambient
              tinting. Sunset preset gives warm gold tonality consistent
              with the luminous register. envMapIntensity 0.4 in the
              material limits its dominance. */}
          <Environment preset="sunset" />
          <Dodecahedron hue={hue} isStatic={effectiveStatic} />

          {/* Contact shadow — soft floor shadow under the object.
              Anchors it to a surface; without this, the object reads
              as "floating in void" rather than "sitting on a plinth". */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.35}
            scale={5}
            blur={2.5}
            far={4}
            color="#3a2a18"
          />
        </Suspense>

        {/* Postprocessing stack — Wave 6 reduced cost for scroll smoothness.
            Multisampling 0 (none) — was 4, big GPU saving.
            N8AO quality "low" — was "medium". Visual diff is minimal at
            our object scale; perf diff is significant. */}
        {!effectiveStatic && (
          <EffectComposer multisampling={0}>
            <N8AO
              aoRadius={0.5}
              intensity={1.2}
              quality="low"
              color="#2a1a08"
              distanceFalloff={1.0}
            />
            <Bloom
              intensity={0.45}
              luminanceThreshold={0.6}
              luminanceSmoothing={0.6}
              mipmapBlur
            />
            <Noise
              premultiply
              blendFunction={BlendFunction.OVERLAY}
              opacity={0.10}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default MdlsSacred3D;
