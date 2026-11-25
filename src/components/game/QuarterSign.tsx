import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getVillageElement, type ElementKey, type SolidKey } from "@/data/villagePlaces";
import { quarterName } from "@/lib/quarters";

/**
 * The sign of a quarter (GoBY §25.14): a small line drawing of the element's Platonic solid in
 * the quarter's colour. Inline SVG, no 3D library, no animation. A solid is a faint outline until
 * the first place of its quarter is open (`lit`, from `litQuarters`), then it is drawn in full
 * with a soft fill. Its accessible name is «<Element> quarter». It is a sign, not a control:
 * the place around it is the door, so the sign never takes a tap or a tab stop.
 */

type Pt = readonly [number, number];
const pt = ([x, y]: Pt) => `${x},${y}`;
const poly = (pts: readonly Pt[]) => pts.map(pt).join(" ");

/** Regular polygon on a 24×24 board, first vertex at `startDeg` (−90 = straight up). */
const ngon = (n: number, r: number, startDeg: number, c = 12): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = ((startDeg + (360 / n) * i) * Math.PI) / 180;
    return [Number((c + r * Math.cos(a)).toFixed(2)), Number((c + r * Math.sin(a)).toFixed(2))] as Pt;
  });

type Drawing = { outline: string; faces: string[] };

const DODECA_OUT = ngon(5, 10, -90);
const DODECA_IN = ngon(5, 4.8, -54);
const HEXA = ngon(6, 10, -90);

/** Each solid as an outline (filled when lit) and its inner edges, from one flat projection. */
const DRAWINGS: Record<SolidKey, Drawing> = {
  // Outer pentagon, inner pentagon turned half a step, each inner vertex joined to its outer one.
  dodecahedron: {
    outline: poly(DODECA_OUT),
    faces: [
      poly(DODECA_IN),
      ...DODECA_IN.map((p, i) => `${pt(p)} ${pt(DODECA_OUT[(i + 1) % 5])}`),
    ],
  },
  // A diamond cut by its equator and its axis.
  octahedron: {
    outline: poly([[12, 2], [21, 12], [12, 22], [3, 12]]),
    faces: ["3,12 21,12", "12,2 12,22", "12,2 16,17 12,22", "12,2 8,17 12,22"],
  },
  // Hexagon, an inner triangle, nine edges joining them.
  icosahedron: {
    outline: poly(HEXA),
    faces: [
      "12,8.5 16.5,16 7.5,16",
      `12,8.5 ${pt(HEXA[0])}`,
      `12,8.5 ${pt(HEXA[1])}`,
      `12,8.5 ${pt(HEXA[5])}`,
      `16.5,16 ${pt(HEXA[1])}`,
      `16.5,16 ${pt(HEXA[2])}`,
      `16.5,16 ${pt(HEXA[3])}`,
      `7.5,16 ${pt(HEXA[5])}`,
      `7.5,16 ${pt(HEXA[4])}`,
      `7.5,16 ${pt(HEXA[3])}`,
    ],
  },
  // Triangle with its near vertex joined to the three corners.
  tetrahedron: {
    outline: poly([[12, 3], [21.5, 19], [2.5, 19]]),
    faces: ["12,3 12,14 21.5,19", "12,14 2.5,19"],
  },
  // Hexagon outline with the three edges that meet at the near corner.
  cube: {
    outline: poly(HEXA),
    faces: [`12,12 ${pt(HEXA[5])}`, `12,12 ${pt(HEXA[1])}`, `12,12 ${pt(HEXA[3])}`],
  },
};

export const QuarterSign = ({
  element,
  lit,
  size = 18,
  className,
}: {
  element: ElementKey;
  /** The quarter's first place is open (or the quarter is Air, open to everyone). */
  lit: boolean;
  size?: number;
  className?: string;
}) => {
  const { t } = useTranslation();
  const { solid, color } = getVillageElement(element);
  const drawing = DRAWINGS[solid];
  return (
    <svg
      role="img"
      aria-label={quarterName(element, t)}
      data-quarter-sign={element}
      data-solid={solid}
      data-lit={lit ? "true" : "false"}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      focusable="false"
      className={cn("quarter-sign inline-block flex-shrink-0 pointer-events-none", className)}
      style={{ color }}
    >
      <g
        fill={lit ? "currentColor" : "none"}
        fillOpacity={lit ? 0.16 : 0}
        stroke="currentColor"
        strokeOpacity={lit ? 1 : 0.55}
        strokeWidth={lit ? 1.4 : 1.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <polygon points={drawing.outline} />
        {drawing.faces.map((f) => (
          <polyline key={f} points={f} fill="none" strokeOpacity={lit ? 0.85 : 0.45} />
        ))}
      </g>
    </svg>
  );
};

export default QuarterSign;
