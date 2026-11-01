/**
 * Geometry for the Natural Clock face. Angles are degrees, clockwise from the
 * top (12 o'clock), the way a clock reads.
 */

export const FACE_SIZE = 320;
export const FACE_CENTER = FACE_SIZE / 2;

/** Point on a circle of radius `r` around the face centre. */
export function polar(r: number, deg: number, cx = FACE_CENTER, cy = FACE_CENTER): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [Number((cx + r * Math.sin(a)).toFixed(2)), Number((cy - r * Math.cos(a)).toFixed(2))];
}

/**
 * SVG path of an arc on a circle, from `fromDeg` clockwise to `toDeg`.
 * A sweep of a full turn becomes two half arcs (a single arc with identical
 * endpoints draws nothing). A sweep of 0 or less returns "".
 */
export function arcPath(r: number, fromDeg: number, toDeg: number, cx = FACE_CENTER, cy = FACE_CENTER): string {
  const sweep = toDeg - fromDeg;
  if (sweep <= 0) return "";
  if (sweep >= 359.99) {
    const [x0, y0] = polar(r, fromDeg, cx, cy);
    const [x1, y1] = polar(r, fromDeg + 180, cx, cy);
    return `M ${x0} ${y0} A ${r} ${r} 0 1 1 ${x1} ${y1} A ${r} ${r} 0 1 1 ${x0} ${y0}`;
  }
  const [x0, y0] = polar(r, fromDeg, cx, cy);
  const [x1, y1] = polar(r, toDeg, cx, cy);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

/** Astronomical lunar index (0 = New Moon) of Equilibrium cycle position 1…8. */
export const lunarIndexOfPosition = (position: number): number => (position + 5) % 8;

/** Where the sun sits on the day dial: noon at the top, hour angle clockwise. */
export const sunDialDeg = (hourAngleRad: number): number => (hourAngleRad * 180) / Math.PI;
