import { useEffect, useId, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { PLANETARY_DAYS, type AllCyclesV2 } from "@/lib/equilibrium-cycles";
import { useCycles } from "@/modules/equilibrium/hooks/useCycles";
import { useEquilibriumV2 } from "@/modules/equilibrium/hooks/useEquilibriumV2";
import { getLitRegionPath } from "@/modules/equilibrium/components/MoonOrb";
import "./BiologicClock.css";

/**
 * BiologicClock — the player's own clock: four concentric rings, outside in: Year, Moon, Week,
 * Day, with tonight's moon in the centre (docs/specs/equilibrium/biologic_clock_rings_spec.md,
 * launch spec row A9; issue #377). It shows time and energy only: no progress, scores, streaks
 * or actions.
 *
 * Every ring starts at the top and runs clockwise (birthday, new moon, Monday, midnight). The
 * part already lived is dim, what is left is bright. No text on the dial; labels live in the
 * SVG <title> of each ring and in one aria-label that sums up all four.
 *
 * ONE ENGINE: every cycle value comes from `useCycles` (`getAllCyclesV2`). The only value not in
 * the engine is the day fraction (local time / 24h), computed from the same `nowMs`.
 *
 * `BiologicClockFace` is the pure drawing (cycles + now + birthday in, SVG out); `BiologicClock`
 * is the connected one the screens use.
 */

const C = 100; // centre of the 200 x 200 viewBox
const R_YEAR = 90;
const W_YEAR = 5;
const R_MOON = 75;
const R_WEEK_IN = 52;
const R_WEEK_OUT = 64;
const R_DAY = 43;
const W_DAY = 4;
const R_DAY_DOTS = 48.5;
const R_CENTRE_MOON = 30;

const MOON_PHOTO_URL = "/assets/equilibrium/moon-full.jpg";
const SUN_PHOTO_URL = "/assets/equilibrium/sun.jpg";

/** Chakra colour per weekday, Monday first (`PLANETARY_DAYS` order). `dark`: the glyph needs ink, not white. */
const WEEK_COLOURS: { colour: string; dark: boolean }[] = [
  { colour: "#5b4fc4", dark: false }, // Mon ☽ indigo
  { colour: "#c9483c", dark: false }, // Tue ♂ red
  { colour: "#3f84d0", dark: false }, // Wed ☿ blue
  { colour: "#9a62d6", dark: false }, // Thu ♃ violet
  { colour: "#e48a3c", dark: true }, // Fri ♀ orange
  { colour: "#e8c447", dark: true }, // Sat ♄ yellow
  { colour: "#4fb06e", dark: true }, // Sun ☉ green
];

/** Point on a circle of radius `r`, `turn` = 0..1 from the top, clockwise. */
const polar = (r: number, turn: number) => {
  const a = turn * 2 * Math.PI - Math.PI / 2;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
};
const f = (n: number) => n.toFixed(2);

/** A stroke arc of radius `r` from turn `a0` to `a1` (a1 > a0). Empty when there is nothing to draw. */
const arcPath = (r: number, a0: number, a1: number): string => {
  const lo = Math.max(0, a0);
  const hi = Math.min(1, a1);
  if (hi - lo < 0.0005) return "";
  if (hi - lo > 0.9995) {
    const [x0, y0] = polar(r, 0);
    const [x1, y1] = polar(r, 0.5);
    return `M${f(x0)} ${f(y0)} A${r} ${r} 0 1 1 ${f(x1)} ${f(y1)} A${r} ${r} 0 1 1 ${f(x0)} ${f(y0)}`;
  }
  const [x0, y0] = polar(r, lo);
  const [x1, y1] = polar(r, hi);
  return `M${f(x0)} ${f(y0)} A${r} ${r} 0 ${hi - lo > 0.5 ? 1 : 0} 1 ${f(x1)} ${f(y1)}`;
};

/** A filled ring sector between radii `r0` and `r1`, from turn `a0` to `a1`. */
const sectorPath = (r0: number, r1: number, a0: number, a1: number): string => {
  const [x0, y0] = polar(r1, a0);
  const [x1, y1] = polar(r1, a1);
  const [x2, y2] = polar(r0, a1);
  const [x3, y3] = polar(r0, a0);
  const large = a1 - a0 > 0.5 ? 1 : 0;
  return `M${f(x0)} ${f(y0)} A${r1} ${r1} 0 ${large} 1 ${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)} A${r0} ${r0} 0 ${large} 0 ${f(x3)} ${f(y3)} Z`;
};

/** Local time of day as a fraction of 24h (the one value the engine does not carry). */
const dayFraction = (nowMs: number): number => {
  const d = new Date(nowMs);
  return (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400;
};

/** A ring drawn as dim lived part + bright left part. */
const SplitArc = ({ r, p, className }: { r: number; p: number; className: string }) => (
  <>
    <path className={`${className} bio-clock__lived`} d={arcPath(r, 0, p)} />
    <path className={`${className} bio-clock__left`} d={arcPath(r, p, 1)} />
  </>
);

/** A real-phase moon: the one photo, a circle clip, and the shadow over the unlit side (MoonOrb's logic). */
const MoonDisc = ({
  cx, cy, r, phaseIndex, clipId, className,
}: { cx: number; cy: number; r: number; phaseIndex: number; clipId: string; className?: string }) => {
  const full = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
  const shadow = `${full} ${getLitRegionPath(phaseIndex, r, cx, cy)}`.trim();
  return (
    <g className={className}>
      <image
        href={MOON_PHOTO_URL}
        x={cx - r}
        y={cy - r}
        width={r * 2}
        height={r * 2}
        clipPath={`url(#${clipId})`}
        preserveAspectRatio="xMidYMid slice"
      />
      {phaseIndex !== 4 && <path d={shadow} fillRule="evenodd" fill="rgba(7, 9, 18, 0.86)" />}
    </g>
  );
};

type Fmt = (key: string, english: string, vars?: Record<string, string | number>) => string;
const makeFmt = (t: TFunction): Fmt => (key, english, vars) => String(t(key, { defaultValue: english, ...vars }));

export interface BiologicClockFaceProps {
  cycles: AllCyclesV2;
  /** The instant the cycles were computed for; the day fraction comes from it. */
  nowMs: number;
  /** "YYYY-MM-DD", or null: the year ring is then an empty track that links to where it is set. */
  birthday: string | null;
  /** The birthday is still being read: draw the empty track without the link. */
  birthdayLoading?: boolean;
  /** Dial diameter in px. Default: let CSS size it. */
  size?: number;
  className?: string;
}

export const BiologicClockFace = ({
  cycles, nowMs, birthday, birthdayLoading = false, size, className,
}: BiologicClockFaceProps) => {
  const { t } = useTranslation();
  const fmt = makeFmt(t);
  const uid = useId().replace(/:/g, "");
  const moonClip = `bc-moon-${uid}`;
  const sunClip = `bc-sun-${uid}`;

  const { solar, lunar, dayOfWeek } = cycles;
  const hasBirthday = !!birthday;
  const yearP = solar.personalProgress;
  const moonP = lunar.progress;
  const tonight = lunar.segmentIndex;
  const weekP = dayOfWeek.weekProgress;
  const today = dayOfWeek.segmentIndex;
  const dayP = dayFraction(nowMs);

  // ── Labels (hover / focus / tap; never on the dial) ──
  const yearPct = Math.round(yearP * 100);
  const daysLeft = Math.max(0, Math.floor((1 - yearP) * 365.25));
  const dayLeftPct = Math.round((1 - dayP) * 100);
  const yearLabel = hasBirthday
    ? fmt("village.clock.year", "Year {{pct}}% lived, {{days}} days to your birthday", { pct: yearPct, days: daysLeft })
    : fmt("village.clock.yearEmpty", "Add your birthday to see your year");
  const moonLabel = lunar.phase.name;
  const weekLabel = `${dayOfWeek.day.name}, ${dayOfWeek.day.planet}`;
  const dayLabel = fmt("village.clock.day", "{{pct}}% of today left", { pct: dayLeftPct });
  const summary = [yearLabel, moonLabel, weekLabel, dayLabel].join(" · ");

  // ── Year ring: four quarter gaps, birthday dot at the top, white arrow = now ──
  const gap = 0.008;
  const quarters = [0, 1, 2, 3].map((q) => [q / 4 + gap / 2, (q + 1) / 4 - gap / 2] as const);
  const [dotX, dotY] = polar(R_YEAR, 0);

  // ── Week "now" tick, moon "now" tick ──
  const [wx0, wy0] = polar(R_WEEK_IN - 1.5, weekP);
  const [wx1, wy1] = polar(R_WEEK_OUT + 1.5, weekP);
  const [mx0, my0] = polar(R_MOON - 9, moonP);
  const [mx1, my1] = polar(R_MOON + 9, moonP);

  // ── Day ring: the Sun at now ──
  const [sunX, sunY] = polar(R_DAY, dayP);
  const sunR = 6.5;

  const px = size ? { width: size, height: size } : undefined;

  return (
    <svg
      className={`bio-clock${className ? ` ${className}` : ""}`}
      viewBox="0 0 200 200"
      style={px}
      role="group"
      tabIndex={0}
      aria-label={summary}
      data-year={yearP.toFixed(2)}
      data-moon={tonight}
      data-day={today}
    >
      <defs>
        {/* One circle clip for every moon: sized to each image's own box. */}
        <clipPath id={moonClip} clipPathUnits="objectBoundingBox">
          <circle cx="0.5" cy="0.5" r="0.5" />
        </clipPath>
        <clipPath id={sunClip}>
          <circle cx={f(sunX)} cy={f(sunY)} r={sunR} />
        </clipPath>
      </defs>

      <circle className="bio-clock__night" cx={C} cy={C} r="100" />

      {/* ── Year ── */}
      <g className="bio-clock__ring" data-ring="year">
        <title>{yearLabel}</title>
        {hasBirthday ? (
          <>
            {quarters.map(([a0, a1], q) => (
              <g key={q} className="bio-clock__quarter">
                <path className="bio-clock__year bio-clock__lived" d={arcPath(R_YEAR, a0, Math.min(a1, yearP))} strokeWidth={W_YEAR} />
                <path className="bio-clock__year bio-clock__left" d={arcPath(R_YEAR, Math.max(a0, yearP), a1)} strokeWidth={W_YEAR} />
              </g>
            ))}
            <circle className="bio-clock__birthday" cx={f(dotX)} cy={f(dotY)} r="2.6" />
            <g transform={`rotate(${f(yearP * 360)} ${C} ${C})`}>
              <polygon className="bio-clock__arrow" points={`${C},${C - 94.5} ${C - 2.8},${C - 99.5} ${C + 2.8},${C - 99.5}`} />
            </g>
          </>
        ) : birthdayLoading ? (
          <circle className="bio-clock__year bio-clock__lived" cx={C} cy={C} r={R_YEAR} strokeWidth={W_YEAR} />
        ) : (
          <Link to="/build/equilibrium" className="bio-clock__link" aria-label={yearLabel}>
            <circle className="bio-clock__year bio-clock__lived" cx={C} cy={C} r={R_YEAR} strokeWidth={W_YEAR} />
            {/* A wider invisible stroke: the thin track is a poor tap target. */}
            <circle className="bio-clock__hit" cx={C} cy={C} r={R_YEAR} strokeWidth={16} />
          </Link>
        )}
      </g>

      {/* ── Moon ── */}
      <g className="bio-clock__ring" data-ring="moon">
        <title>{moonLabel}</title>
        <SplitArc r={R_MOON} p={moonP} className="bio-clock__moonring" />
        <line className="bio-clock__tick" x1={f(mx0)} y1={f(my0)} x2={f(mx1)} y2={f(my1)} />
        {Array.from({ length: 8 }, (_, i) => {
          const [x, y] = polar(R_MOON, (i + 0.5) / 8);
          const isTonight = i === tonight;
          return (
            <g key={i} data-moon-segment={i} className={`bio-clock__moon${isTonight ? " is-tonight" : i < tonight ? " is-past" : ""}`}>
              <MoonDisc cx={x} cy={y} r={isTonight ? 9 : 6} phaseIndex={i} clipId={moonClip} />
              {isTonight && <circle className="bio-clock__moon-halo" cx={f(x)} cy={f(y)} r="10.8" />}
            </g>
          );
        })}
      </g>

      {/* ── Week ── */}
      <g className="bio-clock__ring" data-ring="week">
        <title>{weekLabel}</title>
        {PLANETARY_DAYS.map((d, i) => {
          const a0 = i / 7 + 0.006;
          const a1 = (i + 1) / 7 - 0.006;
          const isToday = i === today;
          const { colour, dark } = WEEK_COLOURS[i];
          const [gx, gy] = polar((R_WEEK_IN + R_WEEK_OUT) / 2, (i + 0.5) / 7);
          return (
            <g
              key={d.name}
              data-week-segment={i}
              className={`bio-clock__seg${isToday ? " is-today" : i < today ? " is-past" : ""}`}
              style={{ "--bc-seg": colour } as CSSProperties}
            >
              <path className="bio-clock__seg-fill" d={sectorPath(R_WEEK_IN, R_WEEK_OUT, a0, a1)} />
              {isToday && weekP > a0 && (
                <path className="bio-clock__seg-lived" d={sectorPath(R_WEEK_IN, R_WEEK_OUT, a0, Math.min(a1, weekP))} />
              )}
              {isToday && <path className="bio-clock__seg-outline" d={sectorPath(R_WEEK_IN, R_WEEK_OUT, a0, a1)} />}
              <text
                className={`bio-clock__glyph${dark ? " is-dark" : ""}`}
                x={f(gx)}
                y={f(gy)}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {d.symbol}
              </text>
            </g>
          );
        })}
        <line className="bio-clock__tick" x1={f(wx0)} y1={f(wy0)} x2={f(wx1)} y2={f(wy1)} />
      </g>

      {/* ── Day ── */}
      <g className="bio-clock__ring" data-ring="day">
        <title>{dayLabel}</title>
        <SplitArc r={R_DAY} p={dayP} className="bio-clock__dayring" />
        {[0, 0.25, 0.5, 0.75].map((turn) => {
          const [x, y] = polar(R_DAY_DOTS, turn);
          return <circle key={turn} className="bio-clock__daydot" cx={f(x)} cy={f(y)} r="1" />;
        })}
        <circle className="bio-clock__sunglow" cx={f(sunX)} cy={f(sunY)} r={sunR + 1.2} />
        <image
          href={SUN_PHOTO_URL}
          x={f(sunX - sunR * 1.38)}
          y={f(sunY - sunR * 1.38)}
          width={f(sunR * 2.76)}
          height={f(sunR * 2.76)}
          clipPath={`url(#${sunClip})`}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>

      {/* ── Centre: tonight's moon ── */}
      <g data-ring="centre">
        <title>{moonLabel}</title>
        <MoonDisc cx={C} cy={C} r={R_CENTRE_MOON} phaseIndex={tonight} clipId={moonClip} className="bio-clock__centre" />
      </g>
    </svg>
  );
};

/** One tick for the day ring: every 5 minutes, paused on a hidden tab, refreshed on return. */
const useNowTick = (): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const refresh = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      setNow(Date.now());
    };
    const id = window.setInterval(refresh, 5 * 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return now;
};

/**
 * The connected clock: birthday from the same source Equilibrium uses (`useEquilibriumV2`),
 * cycles from the same hook (`useCycles`). A guest sees real day, week and moon and an empty year.
 */
export const BiologicClock = ({ size, className }: { size?: number; className?: string }) => {
  const { birthday, loading } = useEquilibriumV2();
  const { cycles, nowMs: cyclesNowMs } = useCycles(birthday ?? undefined);
  // `useCycles` re-stamps its nowMs only when a cycle changes (hours apart); the Sun needs the
  // 5-minute tick. Never older than the cycles themselves.
  const tick = useNowTick();
  return (
    <BiologicClockFace
      cycles={cycles}
      nowMs={Math.max(tick, cyclesNowMs)}
      birthday={birthday}
      birthdayLoading={loading && !birthday}
      size={size}
      className={className}
    />
  );
};

export default BiologicClock;
