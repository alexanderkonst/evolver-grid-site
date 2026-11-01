import type { NaturalClockState } from "./naturalClock";
import type { LocationStatus } from "./useNaturalClock";
import { HORIZON_DEG } from "./sunLight";
import { moonIlluminatedFraction, moonLitPath } from "./moonShape";
import { weekPlanets } from "./weekPlanet";
import {
  FACE_CENTER,
  FACE_SIZE,
  arcPath,
  lunarIndexOfPosition,
  polar,
  sunDialDeg,
} from "./faceGeometry";
import { CLOCK_INK, CLOCK_MONO, CLOCK_SERIF, CLOCK_TEAL } from "./NaturalClockMoon";
import { NATURAL_CLOCK_COPY } from "../equilibriumCopy";

interface NaturalClockFaceProps {
  clock: NaturalClockState;
  locationStatus?: LocationStatus;
  onRequestLocation?: () => void;
  /** Shows an "Add your birthday" button when no birthday is known. */
  onAskBirthday?: () => void;
  className?: string;
}

// Rings, outer to inner.
const R_YEAR = 142;
const R_WEEK = 118;
const R_MOON = 88;
const R_DAY = 58;

const TRACK = "rgba(230, 235, 242, 0.14)";
const DIM = "rgba(230, 235, 242, 0.55)";

const MOON_NODE_R = 12;
const WEEK_NODE_R = 13;

/** The 8 moons of the ring, in cycle order, starting with Planning at the top. */
const MoonRing = ({ clock }: { clock: NaturalClockState }) => {
  const { moon } = clock;
  return (
    <g>
      <circle cx={FACE_CENTER} cy={FACE_CENTER} r={R_MOON} fill="none" stroke={TRACK} strokeWidth="1" />
      {Array.from({ length: 8 }, (_, i) => {
        const position = i + 1;
        const current = position === moon.position;
        const index = lunarIndexOfPosition(position);
        // The current moon shows its real shape; the others their principal phase.
        const progress = index / 8;
        const fraction = current ? moon.fraction : moonIlluminatedFraction(progress);
        const waxing = current ? moon.waxing : progress < 0.5;
        const [x, y] = polar(R_MOON, i * 45);
        const r = current ? MOON_NODE_R + 2 : MOON_NODE_R;
        const lit = moonLitPath(fraction, waxing, r - 2, 0, 0);
        return (
          <g key={position} transform={`translate(${x} ${y})`} opacity={current ? 1 : 0.5}>
            <circle r={r} fill="rgba(14, 20, 28, 0.9)" stroke={current ? CLOCK_TEAL : DIM} strokeWidth={current ? 2 : 1} />
            {lit && <path d={lit} fill={CLOCK_INK} />}
          </g>
        );
      })}
    </g>
  );
};

const WeekRing = ({ clock }: { clock: NaturalClockState }) => {
  const planets = weekPlanets();
  return (
    <g>
      <circle cx={FACE_CENTER} cy={FACE_CENTER} r={R_WEEK} fill="none" stroke={TRACK} strokeWidth="1" />
      {planets.map((p, i) => {
        const current = p.mondayIndex === clock.week.mondayIndex;
        const [x, y] = polar(R_WEEK, (i * 360) / 7);
        return (
          <g key={p.planet} transform={`translate(${x} ${y})`}>
            <title>{`${p.dayName}, ${p.planet}: ${p.word}`}</title>
            <circle
              r={WEEK_NODE_R}
              fill={current ? CLOCK_TEAL : "rgba(14, 20, 28, 0.9)"}
              stroke={current ? CLOCK_TEAL : DIM}
              strokeWidth="1"
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="15"
              fill={current ? "#0e141c" : DIM}
              style={{ fontFamily: CLOCK_SERIF }}
            >
              {p.glyph}
            </text>
          </g>
        );
      })}
    </g>
  );
};

/** Day dial: noon at the top, midnight at the bottom, daylight drawn as an arc. */
const DayRing = ({ clock }: { clock: NaturalClockState }) => {
  const { light } = clock;
  const half = (light.daylightHalfArc * 180) / Math.PI;
  const sunDeg = sunDialDeg(light.hourAngle);
  const [sx, sy] = polar(R_DAY, sunDeg);
  const up = light.altitudeDeg >= HORIZON_DEG;
  return (
    <g>
      <circle cx={FACE_CENTER} cy={FACE_CENTER} r={R_DAY} fill="none" stroke={TRACK} strokeWidth="3" />
      {half > 0 && (
        <path
          d={arcPath(R_DAY, -half, half)}
          fill="none"
          stroke={DIM}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      <circle cx={sx} cy={sy} r={up ? 7 : 6} fill={up ? CLOCK_INK : "rgba(14, 20, 28, 0.95)"} stroke={CLOCK_INK} strokeWidth="1.5">
        <title>{`Sun ${Math.round(light.altitudeDeg)}° ${light.altitudeDeg >= 0 ? "above" : "below"} the horizon`}</title>
      </circle>
    </g>
  );
};

/** Year ring: the lit arc is the share of the solar year still ahead, ending at the birthday mark. */
const YearRing = ({ clock }: { clock: NaturalClockState }) => {
  const { year } = clock;
  const [mx0, my0] = polar(R_YEAR - 9, 0);
  const [mx1, my1] = polar(R_YEAR + 9, 0);
  return (
    <g>
      <circle
        cx={FACE_CENTER}
        cy={FACE_CENTER}
        r={R_YEAR}
        fill="none"
        stroke={TRACK}
        strokeWidth="8"
        strokeDasharray={year ? undefined : "2 6"}
      />
      {year && (
        <path
          d={arcPath(R_YEAR, year.elapsed * 360, 360)}
          fill="none"
          stroke={CLOCK_TEAL}
          strokeWidth="8"
          strokeLinecap="butt"
          opacity="0.9"
        >
          <title>{`${year.percent}% of your solar year is ahead`}</title>
        </path>
      )}
      {/* Birthday mark: where the ring refills. */}
      <line x1={mx0} y1={my0} x2={mx1} y2={my1} stroke={CLOCK_INK} strokeWidth="2" strokeLinecap="round" />
      <circle cx={FACE_CENTER} cy={polar(R_YEAR + 13, 0)[1]} r="3" fill={CLOCK_INK} />
    </g>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-3 border-t py-2 text-[12px]" style={{ borderColor: "rgba(230,235,242,0.12)", fontFamily: CLOCK_MONO }}>
    <dt className="uppercase tracking-[0.14em]" style={{ color: DIM }}>
      {label}
    </dt>
    <dd className="text-right" style={{ color: CLOCK_INK }}>
      {value}
    </dd>
  </div>
);

/**
 * The full face: four concentric rings, inner to outer — day (sun on its
 * arc), moon (the 8 phases, current one lit with its real shape), week (the
 * 7 planets), year (battery ring with the birthday mark). Under it the
 * "You are here" line and the four readings in words.
 */
export const NaturalClockFace = ({
  clock,
  locationStatus = "idle",
  onRequestLocation,
  onAskBirthday,
  className,
}: NaturalClockFaceProps) => {
  const { light, moon, week, year, geo } = clock;
  const approximate = geo.source === "timezone";

  return (
    <section
      aria-label="Natural clock"
      className={`mx-auto w-full max-w-[380px] ${className ?? ""}`}
      style={{ color: CLOCK_INK }}
    >
      <svg
        viewBox={`0 0 ${FACE_SIZE} ${FACE_SIZE}`}
        className="mx-auto block h-auto w-full max-w-[340px]"
        role="img"
        aria-label={clock.sentence}
      >
        <YearRing clock={clock} />
        <WeekRing clock={clock} />
        <MoonRing clock={clock} />
        <DayRing clock={clock} />
        <text
          x={FACE_CENTER}
          y={FACE_CENTER - 10}
          textAnchor="middle"
          fontSize="7.5"
          letterSpacing="1.6"
          fill={DIM}
          style={{ fontFamily: CLOCK_MONO, textTransform: "uppercase" }}
        >
          {NATURAL_CLOCK_COPY.youAreHere}
        </text>
        <text
          x={FACE_CENTER}
          y={FACE_CENTER + 14}
          textAnchor="middle"
          fontSize="19"
          fill={CLOCK_INK}
          style={{ fontFamily: CLOCK_SERIF, fontWeight: 500 }}
        >
          {light.state}
        </text>
      </svg>

      <p
        className="mt-3 text-center text-[17px] leading-snug"
        style={{ fontFamily: CLOCK_SERIF }}
      >
        {clock.sentence}
      </p>

      <dl className="mt-4">
        <Row label="Day" value={`${light.state}${approximate ? " (approx.)" : ""}`} />
        <Row label="Moon" value={`${moon.phaseName} · ${moon.illuminationPercent}% lit · next in ${moon.daysToNext}d`} />
        <Row label="Week" value={`${week.glyph} ${week.dayName} · ${week.word}`} />
        <Row
          label="Year"
          value={
            year
              ? year.isBirthdayToday
                ? NATURAL_CLOCK_COPY.birthdayToday
                : `${year.daysToNext} days · ${year.percent}% ahead`
              : "Birthday not set"
          }
        />
      </dl>

      {!year && onAskBirthday && (
        <button
          type="button"
          onClick={onAskBirthday}
          className="mt-3 w-full rounded-xl px-3 py-3 text-[12px] transition-colors hover:bg-white/5"
          style={{ fontFamily: CLOCK_MONO, color: CLOCK_TEAL, border: "1px solid rgba(94, 200, 189, 0.4)" }}
        >
          {NATURAL_CLOCK_COPY.addBirthday}
        </button>
      )}

      {approximate && onRequestLocation && locationStatus !== "denied" && (
        <button
          type="button"
          onClick={onRequestLocation}
          disabled={locationStatus === "asking"}
          className="mt-3 w-full rounded-xl px-3 py-3 text-[12px] transition-colors hover:bg-white/5 disabled:opacity-60"
          style={{ fontFamily: CLOCK_MONO, color: CLOCK_TEAL, border: "1px solid rgba(94, 200, 189, 0.4)" }}
        >
          {locationStatus === "asking" ? "Asking…" : "Light is set from your timezone. Use my location"}
        </button>
      )}
      {approximate && (locationStatus === "denied" || locationStatus === "unavailable") && (
        <p className="mt-3 text-center text-[11px]" style={{ fontFamily: CLOCK_MONO, color: DIM }}>
          {locationStatus === "denied"
            ? "Location is blocked in this browser. Light stays approximate."
            : "Location is not available. Light stays approximate."}
        </p>
      )}
    </section>
  );
};

export default NaturalClockFace;
