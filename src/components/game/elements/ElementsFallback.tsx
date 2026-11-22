import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { ORBITING, CENTER, type ElementDef, type ElementId } from "@/lib/elementsModel";

/**
 * ElementsFallback — the five elements as one static SVG (C1).
 *
 * Shown when WebGL is missing or the canvas fails. Same mapping as the 3D scene: the
 * dodecahedron (Aether) in the center, cube / icosahedron / octahedron / tetrahedron around
 * it. Colours are the same theme tokens; strokes use the skin's primary text colour, so it
 * reads in every skin. Tapping a shape selects it, exactly like the scene; dragging turns the
 * four around the center (pointer events, so mouse, touch and pen), and a drag is never a tap.
 */

const CX = 150;
const CY = 125;
const ORBIT_RX = 108;
const ORBIT_RY = 80;
/** Where each orbiting shape starts on the ellipse (degrees; 0 = right, 90 = front/bottom). */
const START_DEG: Record<Exclude<ElementId, "uniqueness">, number> = {
  body: -135,
  emotions: -45,
  spirit: 45,
  mind: 135,
};
/** Pointer travel (px) before a press becomes a drag; below it, it is still a tap. */
const DRAG_PX = 6;

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
  const [angle, setAngle] = useState(0); // radians, added to every orbiting shape
  const press = useRef<{ id: number; x: number; last: number; dragging: boolean } | null>(null);
  const dragged = useRef(false);

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragged.current = false;
    press.current = { id: e.pointerId, x: e.clientX, last: e.clientX, dragging: false };
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    if (!p.dragging) {
      if (Math.abs(e.clientX - p.x) < DRAG_PX) return;
      p.dragging = true;
      dragged.current = true;
      // Capture only once it is a drag, so a plain tap still reaches the shape under it.
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* not capturable (synthetic event): the drag still works while the pointer is over the svg */
      }
    }
    const width = e.currentTarget.getBoundingClientRect().width || 300;
    setAngle((a) => a + ((e.clientX - p.last) / width) * Math.PI * 2);
    p.last = e.clientX;
  };

  const endPress = (e: PointerEvent<SVGSVGElement>) => {
    if (press.current?.id === e.pointerId) press.current = null;
  };

  // The click that follows a drag must not select, deselect or close anything.
  const swallowIfDragged = (e: { stopPropagation: () => void }): boolean => {
    if (!dragged.current) return false;
    dragged.current = false;
    e.stopPropagation();
    return true;
  };

  const placed = ORBITING.map((def) => {
    const a = (START_DEG[def.id as keyof typeof START_DEG] * Math.PI) / 180 + angle;
    const depth = (1 + Math.sin(a)) / 2; // 0 = back, 1 = front
    return {
      def,
      x: CX + ORBIT_RX * Math.cos(a),
      y: CY + ORBIT_RY * Math.sin(a),
      r: 30 + 7 * depth,
      depth,
    };
  });
  // Back to front, with the center sitting in the middle of the depth order.
  const all = [...placed, { def: CENTER, x: CX, y: CY, r: 52, depth: 0.5 }].sort((a, b) => a.depth - b.depth);

  return (
    <svg
      viewBox="0 0 300 250"
      className="block w-full h-full select-none"
      role="img"
      aria-label="The five elements: a dodecahedron in the center, a cube, an icosahedron, an octahedron and a tetrahedron around it"
      style={{ touchAction: "none", cursor: "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPress}
      onPointerCancel={endPress}
      onClick={(e) => {
        if (swallowIfDragged(e)) return;
        onSelect(null);
      }}
    >
      {/* The orbit, drawn flat. */}
      <ellipse
        cx={CX}
        cy={CY}
        rx={ORBIT_RX}
        ry={ORBIT_RY}
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
              if (swallowIfDragged(e)) return;
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
