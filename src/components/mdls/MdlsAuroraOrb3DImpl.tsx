import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

/**
 * MDLS · Aurora Orb 3D
 *
 * R3F-rendered translucent glass sphere holding the aurora register from
 * within. Replaces the CSS-radial-gradient AuroraGlassOrb component.
 *
 * Why this is the material-truth shift: a CSS radial gradient is *painted
 * onto* a flat circle — light is implied. A real R3F sphere with
 * `MeshPhysicalMaterial.transmission > 0` lets light *pass through* the
 * sphere geometry. The aurora glows from an INNER light source visible
 * through the translucent shell. The orb becomes glass holding light, not
 * paint pretending to be glass.
 *
 * Library: @react-three/fiber + @react-three/drei + @react-three/postprocessing
 * (all MIT, by pmndrs)
 *
 * v1.0 — 2026-05-19 evening — Wave 7 material-truth pass.
 *
 * Performance: respects prefers-reduced-motion; uses dpr [1, 2] (no 3x);
 * postprocessing minimal (Bloom only). Cheaper than MdlsSacred3D since
 * no AO / no shadows / no compound rotation.
 */
interface MdlsAuroraOrb3DProps {
  /** Pixel size (square). Default 240. */
  size?: number;
  /** Aurora color signature. Each lights the orb from within with the
   *  matching hue, surrounded by warm specular ambience. */
  hue?: "warm" | "cool" | "rose" | "violet";
  /** Disable rotation. Default false. */
  static?: boolean;
}

interface HuePalette {
  glass: string;          // body color (subtle tint, sphere is mostly clear)
  inner: string;          // inner-light color (the aurora source)
  emissive: string;       // emissive material color
  emissiveIntensity: number;
  innerIntensity: number;
}

const HUE_PRESETS: Record<NonNullable<MdlsAuroraOrb3DProps["hue"]>, HuePalette> = {
  warm: {
    glass: "#f4d4a8",         // warm honey glass tint
    inner: "#f48a4a",         // coral-amber inner light
    emissive: "#f4a868",
    emissiveIntensity: 0.45,
    innerIntensity: 2.5,
  },
  cool: {
    glass: "#c8d8e8",
    inner: "#7896c8",
    emissive: "#a0b8d8",
    emissiveIntensity: 0.4,
    innerIntensity: 2.2,
  },
  rose: {
    glass: "#e8c4c8",
    inner: "#d46a8a",
    emissive: "#e89c9c",
    emissiveIntensity: 0.42,
    innerIntensity: 2.3,
  },
  violet: {
    glass: "#cdb8d8",
    inner: "#7a5a9c",
    emissive: "#b89cd4",
    emissiveIntensity: 0.4,
    innerIntensity: 2.4,
  },
};

const AuroraSphere = ({
  palette,
  isStatic,
}: {
  palette: HuePalette;
  isStatic: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (isStatic || !meshRef.current) return;
    // Very slow drift — orb feels held, not spun. The aurora light source
    // sits at center, so rotation only matters for the specular highlight
    // creeping across the surface (which is the magic of translucent glass).
    meshRef.current.rotation.y += delta * 0.05;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.06;
  });

  return (
    <group>
      {/* Inner light source — this is the aurora living INSIDE the glass.
          Positioned slightly forward + below center for an "ember at the
          base" feel (matches the AuroraGlassOrb's CSS radial position
          which had the bright spot at 65% Y). */}
      <pointLight
        position={[0, -0.25, 0.3]}
        intensity={palette.innerIntensity}
        color={palette.inner}
        distance={3}
        decay={1.2}
      />

      <mesh ref={meshRef}>
        {/* Sphere at moderate detail — 64 segments enough for smooth
            silhouette; transmission shader handles internal refraction. */}
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          color={palette.glass}
          emissive={palette.emissive}
          emissiveIntensity={palette.emissiveIntensity}
          // TRANSLUCENT GLASS — the magic property.
          // transmission > 0 = light passes through the material.
          // The inner point light becomes visible through the shell.
          transmission={0.85}
          thickness={1.2}
          ior={1.45}                // index of refraction — glass = ~1.5
          // Surface finish — clearcoat gives the polished glass exterior.
          clearcoat={1}
          clearcoatRoughness={0.08}
          roughness={0.12}
          metalness={0}
          // attenuationColor + attenuationDistance tint the light passing
          // through — same hue as the inner light, so the orb "stains"
          // the light it emits, matching the aurora register.
          attenuationColor={palette.inner}
          attenuationDistance={1.5}
        />
      </mesh>
    </group>
  );
};

export const MdlsAuroraOrb3D = ({
  size = 240,
  hue = "warm",
  static: isStatic = false,
}: MdlsAuroraOrb3DProps) => {
  const respectReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  const effectiveStatic = isStatic || respectReducedMotion;
  const palette = HUE_PRESETS[hue];

  return (
    <div style={{ width: size, height: size, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        {/* Soft outer ambience — the orb sits in a warm aurora atmosphere */}
        <ambientLight intensity={0.35} />
        {/* Key light from upper-left (MDLS discipline) */}
        <directionalLight position={[-3, 3, 2.5]} intensity={0.65} color="#fff2e0" />
        {/* Subtle rim from back-right to define the silhouette */}
        <directionalLight position={[2.5, 1, -2]} intensity={0.4} color={palette.inner} />

        <Suspense fallback={null}>
          {/* Studio HDRI — contributes to the specular highlight + the
              subtle environment colors visible inside the translucent glass. */}
          <Environment preset="sunset" />
          <AuroraSphere palette={palette} isStatic={effectiveStatic} />
        </Suspense>

        {!effectiveStatic && (
          <EffectComposer multisampling={0}>
            {/* Bloom — bright bleed on the specular + the inner-light
                glow leaking through the glass. This is what makes the
                orb feel ALIVE, like it's actually emitting light. */}
            <Bloom
              intensity={0.95}
              luminanceThreshold={0.35}
              luminanceSmoothing={0.65}
              mipmapBlur
            />
            <Noise
              premultiply
              blendFunction={BlendFunction.OVERLAY}
              opacity={0.07}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default MdlsAuroraOrb3D;
