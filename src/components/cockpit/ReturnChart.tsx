import { accentTint, ink } from "./ui";

export interface ReturnPoint {
  date: string;
  usd: number;
}

const W = 560;
const H = 120;
const PAD = 12;

/**
 * Stepped "received" line: the fact only. A dashed projection is drawn by the caller
 * only when projection data exists; none is invented here. Needs two or more points.
 */
export default function ReturnChart({ points }: { points: ReturnPoint[] }) {
  const max = Math.max(...points.map((point) => point.usd), 1);
  const x = (index: number) => (points.length === 1 ? 0 : (index / (points.length - 1)) * W);
  const y = (usd: number) => H - PAD - (usd / max) * (H - PAD * 2);

  // Step after each point: hold the previous value until the next date.
  let line = `M0 ${y(points[0].usd)}`;
  points.forEach((point, index) => {
    if (index === 0) return;
    line += ` H${x(index)} V${y(point.usd)}`;
  });
  const area = `${line} V${H} H0 Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      role="img"
      aria-label="Cash received over time"
      style={{ color: "var(--accent-text)" }}
    >
      <g stroke={ink(0.1)}>
        {[30, 70, 110].map((gridY) => (
          <line key={gridY} x1="0" x2={W} y1={gridY} y2={gridY} />
        ))}
      </g>
      <path d={area} fill={accentTint(0.14)} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
