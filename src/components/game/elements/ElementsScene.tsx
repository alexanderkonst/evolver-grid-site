import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useCursor } from "@react-three/drei";
import * as THREE from "three";
import {
  CENTER,
  ORBITING,
  type ElementDef,
  type ElementId,
  type SolidKind,
} from "@/lib/elementsModel";

/**
 * ElementsScene — the five elements as one playable react-three-fiber scene (C1).
 *
 * The dodecahedron (Uniqueness, Aether) sits in the center; the cube (Earth), icosahedron
 * (Water), octahedron (Air) and tetrahedron (Fire) orbit it. Drag rotates the scene (orbit
 * camera); tap a solid and it comes forward; tap the center for the Aether line; tap empty
 * space to let go.
 *
 * This file is the heavy half (three / fiber / drei). ElementsExplorer loads it with
 * React.lazy, so nothing here is in the first paint.
 *
 * Colours: read from the skin's tokens at runtime and re-read when the skin changes
 * (`data-skin`, soul colours on <html>). Every solid also gets an outline in the skin's
 * primary text colour, so the shapes read on the light skins and in Lunar's night alike.
 */

const ORBIT_RADIUS = 2.25;
const FRONT_RADIUS = 2.75;
const ORBIT_Y = [0.4, -0.4, 0.4, -0.4];
const BASE_ANGLES = ORBITING.map((_, i) => (i / ORBITING.length) * Math.PI * 2);
const ORBIT_SPEED = 0.12; // rad/s: a full turn in about 52 s
const SELECTED_SCALE = 1.35;
const CENTER_SELECTED_SCALE = 1.14;
/** Pointer travel (px) between press and release beyond which it was a drag, not a tap. */
const DRAG_PX = 6;

/** Resolve a CSS custom property to a colour string THREE can parse. */
const readToken = (name: string, fallback: string): string => {
  if (typeof document === "undefined") return fallback;
  const probe = document.createElement("span");
  probe.style.color = `var(${name}, ${fallback})`;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  // THREE parses rgb()/rgba()/hex; newer browsers may hand back color(srgb …) for mixes.
  return /^rgba?\(/.test(resolved) ? resolved : fallback;
};

/** Token colours for the current skin; recomputed when the skin or soul colours change. */
const useSkinColors = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const observer = new MutationObserver(() => setTick((n) => n + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-skin", "class", "style"],
    });
    return () => observer.disconnect();
  }, []);
  return useMemo(() => {
    void tick;
    const byId = {} as Record<ElementId, string>;
    for (const e of [...ORBITING, CENTER]) byId[e.id] = readToken(e.colorVar, e.colorFallback);
    return { byId, edge: readToken("--skin-text-primary", "#0a1628") };
  }, [tick]);
};

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

const makeGeometry = (kind: SolidKind): THREE.BufferGeometry => {
  switch (kind) {
    case "cube":
      return new THREE.BoxGeometry(1, 1, 1);
    case "icosahedron":
      return new THREE.IcosahedronGeometry(0.66, 0);
    case "octahedron":
      return new THREE.OctahedronGeometry(0.78, 0);
    case "tetrahedron":
      return new THREE.TetrahedronGeometry(0.85, 0);
    case "dodecahedron":
      return new THREE.DodecahedronGeometry(1, 0);
  }
};

interface SolidProps {
  def: ElementDef;
  color: string;
  edge: string;
  active: boolean;
  onPick: () => void;
}

/** One solid: filled faces + outline, lit flat so every face reads in every skin. */
const Solid = ({ def, color, edge, active, onPick }: SolidProps) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  // Faces and outline come from one geometry, so the edges match the faces exactly.
  const geometry = useMemo(() => makeGeometry(def.solid), [def.solid]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  useEffect(
    () => () => {
      geometry.dispose();
      edges.dispose();
    },
    [geometry, edges],
  );

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta > DRAG_PX) return; // the end of a drag, not a tap
        onPick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.32 : hovered ? 0.22 : 0.14}
          flatShading
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={edge} transparent opacity={active ? 1 : 0.7} />
      </lineSegments>
    </group>
  );
};

interface WorldProps {
  selected: ElementId | null;
  onSelect: (id: ElementId | null) => void;
  reduced: boolean;
}

const World = ({ selected, onSelect, reduced }: WorldProps) => {
  const { camera } = useThree();
  const colors = useSkinColors();

  const orbit = useRef<THREE.Group>(null);
  const slots = useRef<(THREE.Group | null)[]>([]);
  const spinners = useRef<(THREE.Group | null)[]>([]);
  const centerGroup = useRef<THREE.Group>(null);
  const radii = useRef<number[]>(ORBITING.map(() => ORBIT_RADIUS));
  const scales = useRef<number[]>(ORBITING.map(() => 1));
  const centerScale = useRef(1);
  const front = useRef(0);
  const lastSelected = useRef<ElementId | null>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const selIdx = ORBITING.findIndex((e) => e.id === selected);

    // Remember where the camera is the moment a solid is picked: "forward" means toward
    // the viewer as they see it then, and stays put while they keep dragging.
    if (selected !== lastSelected.current) {
      lastSelected.current = selected;
      front.current = Math.atan2(camera.position.x, camera.position.z);
    }

    const group = orbit.current;
    if (group) {
      if (reduced) {
        // Static layout: no drift, no glide. Only the picked solid is marked (scale, outline).
        group.rotation.y = 0;
      } else if (selIdx < 0) {
        group.rotation.y = wrapAngle(group.rotation.y + dt * ORBIT_SPEED);
      } else {
        const target = front.current - BASE_ANGLES[selIdx];
        const diff = wrapAngle(target - group.rotation.y);
        group.rotation.y = wrapAngle(group.rotation.y + diff * (1 - Math.exp(-dt * 4)));
      }
    }

    ORBITING.forEach((_, i) => {
      const slot = slots.current[i];
      if (!slot) return;
      const picked = i === selIdx;
      const wantRadius = picked && !reduced ? FRONT_RADIUS : ORBIT_RADIUS;
      const wantScale = picked ? SELECTED_SCALE : 1;
      if (reduced) {
        radii.current[i] = wantRadius;
        scales.current[i] = wantScale;
      } else {
        const k = 1 - Math.exp(-dt * 5);
        radii.current[i] += (wantRadius - radii.current[i]) * k;
        scales.current[i] += (wantScale - scales.current[i]) * k;
      }
      const a = BASE_ANGLES[i];
      slot.position.set(Math.sin(a) * radii.current[i], ORBIT_Y[i], Math.cos(a) * radii.current[i]);
      slot.scale.setScalar(scales.current[i]);
      const spinner = spinners.current[i];
      if (spinner && !reduced) {
        spinner.rotation.y += dt * 0.45;
        spinner.rotation.x += dt * 0.18;
      }
    });

    const wantCenter = selected === "uniqueness" ? CENTER_SELECTED_SCALE : 1;
    centerScale.current = reduced
      ? wantCenter
      : centerScale.current + (wantCenter - centerScale.current) * (1 - Math.exp(-dt * 5));
    if (centerGroup.current) {
      centerGroup.current.scale.setScalar(centerScale.current);
      if (!reduced) centerGroup.current.rotation.y += dt * 0.15;
    }
  });

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[-3.5, 5, 4]} intensity={1.5} />
      <directionalLight position={[4, -2, -3]} intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={8} distance={7} decay={2} color={colors.byId.uniqueness} />

      <group ref={centerGroup}>
        <Solid
          def={CENTER}
          color={colors.byId.uniqueness}
          edge={colors.edge}
          active={selected === "uniqueness"}
          onPick={() => onSelect("uniqueness")}
        />
      </group>

      <group ref={orbit}>
        {ORBITING.map((def, i) => (
          <group
            key={def.id}
            ref={(g) => {
              slots.current[i] = g;
            }}
          >
            <group
              ref={(g) => {
                spinners.current[i] = g;
              }}
            >
              <Solid
                def={def}
                color={colors.byId[def.id]}
                edge={colors.edge}
                active={selected === def.id}
                onPick={() => onSelect(def.id)}
              />
            </group>
          </group>
        ))}
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping={!reduced}
        rotateSpeed={0.7}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(2 * Math.PI) / 3}
      />
    </>
  );
};

export interface ElementsSceneProps {
  selected: ElementId | null;
  onSelect: (id: ElementId | null) => void;
  reducedMotion: boolean;
}

const ElementsScene = ({ selected, onSelect, reducedMotion }: ElementsSceneProps) => {
  // Where the press began: a release that far away is the end of a drag and must not
  // count as a tap on empty space (that would close the open card).
  const down = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      className="w-full h-full"
      style={{ touchAction: "none" }}
      onPointerDownCapture={(e) => {
        down.current = { x: e.clientX, y: e.clientY };
      }}
    >
      <Canvas
        camera={{ position: [0, 1.6, 7.4], fov: 38 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        frameloop={reducedMotion ? "demand" : "always"}
        style={{ touchAction: "none" }}
        onCreated={({ gl }) => {
          // touch-action is not inherited: set it on the canvas itself so a touch drag turns
          // the model instead of scrolling the page.
          gl.domElement.style.touchAction = "none";
        }}
        onPointerMissed={(e) => {
          const d = down.current;
          if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > DRAG_PX) return;
          onSelect(null);
        }}
        aria-hidden="true"
      >
        <World selected={selected} onSelect={onSelect} reduced={reducedMotion} />
      </Canvas>
    </div>
  );
};

export default ElementsScene;
