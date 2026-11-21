import type { ReactNode } from "react";
import { ORBITING, CENTER, type ElementDef, type ElementId } from "@/lib/elementsModel";

/**
 * ElementsFallback — the five elements as one static SVG (C1).
 *
 * Shown when WebGL is missing or the canvas fails. Same mapping as the 3D scene: the
 * dodecahedron (Aether) in the center, cube / icosahedron / octahedron / tetrahedron around
 * it. Colours are the same theme tokens; strokes use the skin's primary text colour, so it
 * reads in every skin. Tapping a shape selects it, exactly like the scene.
 */

const SPOTS: Record<Exclude<ElementId, "uniqueness">, { x: number; y: number }> = {
  body: { x: 60, y: 62 },
  emotions: { x: 240, y: 62 },
  mind: { x: 60, y: 188 },
  spirit: { x: 240, y: 188 },
};

const polygon = (cx: number, cy: number, r: number, sides: number, rotation = -90): string =>
  Array.from({ length: sides }, (_, i) => {
    const a = ((rotation + (i * 360) / sides) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

/** A flat drawing of each solid: its outline plus the inner lines that make it read as a solid. */
const shapeFor = (def: ElementDef, cx: number, cy: number, r: number): ReactNode => {
  switch (def.solid) {
    case "cube": {
      const s = r * 0.62;
      const d = r * 0.32;
      return (
        <>
          <rect x={cx - s - d / 2} y={cy - s + d / 2} width={s * 2} height={s * 2} />
          <rect x={cx - s + d / 2} y={cy - s - d / 2} width={s * 2} height={s * 2} fillOpacity={0.55} />
        </>
      );
    }
    case "octahedron": {
      const top = [cx, cy - r];
      const right = [cx + r * 0.8, cy];
      const bottom = [cx, cy + r];
      const left = [cx - r * 0.8, cy];
      return (
        <>
          <polygon points={[top, right, bottom, left].map((p) => p.join(",")).join(" ")} />
          <line x1={left[0]} y1={left[1]} x2={right[0]} y2={right[1]} />
          <polyline points={`${top[0]},${top[1]} ${cx},${cy + r * 0.22} ${bottom[0]},${bottom[1]}`} fill="none" />
        </>
      );
    }
    case "tetrahedron": {
      const t = [cx, cy - r];
      const bl = [cx - r * 0.95, cy + r * 0.7];
      const br = [cx + r * 0.95, cy + r * 0.7];
      const m = [cx + r * 0.1, cy + r * 0.2];
      return (
        <>
          <polygon points={[t, bl, br].map((p) => p.join(",")).join(" ")} />
          <polyline points={`${t[0]},${t[1]} ${m[0]},${m[1]} ${bl[0]},${bl[1]}`} fill="none" />
          <line x1={m[0]} y1={m[1]} x2={br[0]} y2={br[1]} />
        </>
      );
    }
    case "icosahedron": {
      return (
        <>
          <polygon points={polygon(cx, cy, r, 6, -90)} />
          <polygon points={polygon(cx, cy, r * 0.5, 3, -90)} fillOpacity={0.5} />
          <polygon points={polygon(cx, cy, r * 0.5, 3, 90)} fillOpacity={0.3} />
        </>
      );
    }
    case "dodecahedron": {
      return (
        <>
          <polygon points={polygon(cx, cy, r, 5, -90)} />
          <polygon points={polygon(cx, cy, r * 0.5, 5, 90)} fillOpacity={0.5} />
        </>
      );
    }
  }
};

export interface ElementsFallbackProps {
  selected: ElementId | null;
  onSelect: (id: ElementId | null) => void;
}

const ElementsFallback = ({ selected, onSelect }: ElementsFallbackProps) => {
  const all: { def: ElementDef; x: number; y: number; r: number }[] = [
    ...ORBITING.map((def) => ({ def, ...SPOTS[def.id as keyof typeof SPOTS], r: 34 })),
    { def: CENTER, x: 150, y: 125, r: 52 },
  ];

  return (
    <svg
      viewBox="0 0 300 250"
      className="block w-full h-full"
      role="img"
      aria-label="The five elements: a dodecahedron in the center, a cube, an icosahedron, an octahedron and a tetrahedron around it"
      onClick={() => onSelect(null)}
    >
      {/* The orbit, drawn flat. */}
      <ellipse
        cx={150}
        cy={125}
        rx={118}
        ry={78}
        fill="none"
        stroke="var(--skin-text-primary, #0a1628)"
        strokeOpacity={0.25}
        strokeDasharray="3 5"
      />
      {all.map(({ def, x, y, r }) => {
        const active = selected === def.id;
        return (
          <g
            key={def.id}
            fill={`var(${def.colorVar}, ${def.colorFallback})`}
            fillOpacity={active ? 1 : 0.85}
            stroke="var(--skin-text-primary, #0a1628)"
            strokeWidth={active ? 2.4 : 1.4}
            strokeLinejoin="round"
            style={{ cursor: "pointer" }}
            transform={active ? `translate(${x} ${y}) scale(1.18) translate(${-x} ${-y})` : undefined}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(def.id);
            }}
          >
            {shapeFor(def, x, y, r)}
          </g>
        );
      })}
    </svg>
  );
};

export default ElementsFallback;
