import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  MOON_PHASES,
  PLANETARY_DAYS,
  SOLAR_HOLONIC,
  SOLAR_HOLONIC_ORDER,
  type AllCyclesV2,
} from "@/lib/equilibrium-cycles";
import { useCycles } from "@/modules/equilibrium/hooks/useCycles";
import { useEquilibriumV2 } from "@/modules/equilibrium/hooks/useEquilibriumV2";
import MoonOrb from "@/modules/equilibrium/components/MoonOrb";
import BirthdayPrompt from "@/modules/equilibrium/components/BirthdayPrompt";
import "./BiologicClock.css";

/**
 * BiologicClock v6 — the player's own clock (docs/specs/equilibrium/biologic_clock_rings_spec.md;
 * issues #381, #385, #405). Two concentric rings, outside in: Moon (8 phases, New Moon at the top)
 * and Week (7 days, Monday at the top), both clockwise. Three views, one tap on the dial cycles
 * them: 1 dial only (default) → 2 dial + card → 3 + two thin rings OUTSIDE (Day gold, then Year
 * silver) → back to 1. Moon and Week never move or resize; the dial grows outward.
 *
 * One grammar on every ring: the current phase is one large glowing symbol, what is lived is dim,
 * what is ahead is bright. Centre: two addressed words (small moon + phase word in the moon colour,
 * small planet + day word in the day's chakra colour). The card is one grid per ring: label with
 * address and time left, current symbol + word with `was … · next …`, one meaning sentence.
 * It shows cycles only: no progress, scores, streaks, actions, clock time or Do now.
 *
 * ONE ENGINE: every value comes from `useCycles` (`getAllCyclesV2`). Words are the engine's:
 * phase word = first word of `MOON_PHASES[i].energy` / `PLANETARY_DAYS[i].energy`, meaning = the
 * rest of the moon energy / the day's `description`. The only values not in the engine are the day
 * fraction (local time / 24h) for the gold arc and the days to the next birthday, taken from the
 * same `nowMs`.
 *
 * `BiologicClockFace` is the pure view (cycles + now + birthday in, dial + card out);
 * `BiologicClock` is the connected one the screens use.
 */

const C = 100; // centre of the 200 x 200 viewBox (Moon and Week live in it in every view)

/** Moon and Week keep size and place in all views; view 3 adds Day then Year outside. */
const RING = { moon: 80, week: 50, day: 102, year: 111, track: 1.4 } as const;
/** viewBox padding in view 3: the dial grows outward, the inner rings do not move. */
const PAD_EXPANDED = 14;

const MOON_R = 6; // the other moons: small quiet marks
const MOON_R_NOW = 15.5; // the current moon ~2.5×
const PLANET_R = 6;
const PLANET_R_NOW = 15.5; // today's planet ~2.5×
const SATURN_SCALE = 1.7; // the rings make Saturn's disc small
const SUN_DISC = 0.88; // the Sun PNG: the disc is ~88% of the square image, black bars around
const LIVED = 0.35; // what is already lived
const AHEAD = 0.85; // what is still ahead
const CENTRE_FONT = 13; // viewBox units; the dial is never below 200 px, so words stay >= 12 px
const CENTRE_FONT_MIN = 12;
const CENTRE_ICON_R = 5.5;

const PLANET_URL = (planet: string) => `/assets/equilibrium/planets/${planet.toLowerCase()}.png`;

/** Chakra colour per weekday, Monday first (`PLANETARY_DAYS` order). */
const WEEK_COLOURS = ["#5b4fc4", "#c9483c", "#3f84d0", "#9a62d6", "#e48a3c", "#e8c447", "#4fb06e"] as const;
const MOON_GLOW = "#fff4dc"; // warm white
const SUN_GLOW = "#ff9a3c";

/** 1 dial only · 2 dial + text · 3 + Year and day. */
export type ClockView = 1 | 2 | 3;
export const VIEW_KEY = "bioclock:view";
/** v5 (#381) kept one flag: «+ Year and day» open ("1") or closed ("0"). Read once, then dropped. */
export const LEGACY_EXPANDED_KEY = "bioclock:expanded";

/** One tap: 1 → 2 → 3 → 1. */
export const nextView = (view: ClockView): ClockView => (view === 3 ? 1 : ((view + 1) as ClockView));

type ViewStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** The remembered view is per place: the village map and the profile card keep their own. */
export type ClockPlace = "village" | "profile";
const viewKey = (place?: ClockPlace) => (place ? `${VIEW_KEY}:${place}` : VIEW_KEY);

/**
 * The remembered view for a place; 1 (dial only) when nothing is stored. A place without its own
 * key starts from the shared v5/v6.0 key (`bioclock:view`), then from the v5 flag: expanded "1" →
 * view 3, "0" → view 2. The old flag is moved to the new key and removed.
 */
export const loadView = (storage: ViewStorage | null, place?: ClockPlace): ClockView => {
  if (!storage) return 1;
  try {
    const own = storage.getItem(viewKey(place));
    if (own === "1" || own === "2" || own === "3") return Number(own) as ClockView;
    if (place) {
      const shared = storage.getItem(VIEW_KEY);
      if (shared === "1" || shared === "2" || shared === "3") return Number(shared) as ClockView;
    }
    const legacy = storage.getItem(LEGACY_EXPANDED_KEY);
    if (legacy === "1" || legacy === "0") {
      const migrated: ClockView = legacy === "1" ? 3 : 2;
      storage.setItem(viewKey(place), String(migrated));
      storage.removeItem(LEGACY_EXPANDED_KEY);
      return migrated;
    }
  } catch {
    /* storage blocked: the default */
  }
  return 1;
};

export const saveView = (storage: ViewStorage | null, view: ClockView, place?: ClockPlace): void => {
  if (!storage) return;
  try {
    storage.setItem(viewKey(place), String(view));
  } catch {
    /* private mode: the choice just lasts this visit */
  }
};

const browserStorage = (): ViewStorage | null => {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
};

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

/** Local time of day as a fraction of 24h (the one value the engine does not carry). */
const dayFraction = (nowMs: number): number => {
  const d = new Date(nowMs);
  return (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400;
};

// ── Words, straight from the engine ──
/** «Prepping · Prep for harvest · …» → «Prepping»; «Threshold & Celebration» → «Threshold». */
export const phaseWord = (energy: string): string => energy.split(" · ")[0].trim().split(/\s+/)[0];
/** The rest of a moon energy string: «Prep for harvest · Set up infrastructure · Get the help». */
export const moonMeaning = (energy: string): string => energy.split(" · ").slice(1).join(" · ");

/** «1 d 21 h»; under a day «7 h»; under an hour «under 1 h». */
export const formatTimeLeft = (days: number): string => {
  const totalHours = Math.max(0, Math.round(days * 24));
  const d = Math.floor(totalHours / 24);
  const h = totalHours % 24;
  if (d === 0 && h === 0) return "under 1 h";
  if (d === 0) return `${h} h`;
  return `${d} d ${h} h`;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Whole days from today to the next birthday and its «4 Jan» label; null for a malformed birthday. */
export const daysToBirthday = (birthday: string, nowMs: number): { days: number; label: string } | null => {
  const parts = birthday.split("-");
  if (parts.length !== 3) return null;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (!(month >= 1 && month <= 12) || !(day >= 1 && day <= 31)) return null;
  const now = new Date(nowMs);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  let next = new Date(now.getFullYear(), month - 1, day).getTime();
  if (next < today) next = new Date(now.getFullYear() + 1, month - 1, day).getTime();
  return { days: Math.round((next - today) / 86_400_000), label: `${day} ${MONTHS[month - 1]}` };
};

/** Keys that activate the dial like a button. */
export const isActivationKey = (key: string): boolean => key === "Enter" || key === " ";

const mod = (n: number, m: number) => ((n % m) + m) % m;

type Fmt = (key: string, english: string, vars?: Record<string, string | number>) => string;
const makeFmt = (t: TFunction): Fmt => (key, english, vars) => String(t(key, { defaultValue: english, ...vars }));

/** A real-phase moon: `MoonOrb` placed by its centre on the dial. */
const MoonAt = ({ x, y, r, phaseIndex }: { x: number; y: number; r: number; phaseIndex: number }) => {
  const size = (r * 2) / 0.92; // MoonOrb draws the disc at 46% of its box
  return (
    <g transform={`translate(${f(x - size / 2)} ${f(y - size / 2)})`}>
      <MoonOrb phaseIndex={phaseIndex} size={size} />
    </g>
  );
};

/**
 * A planet photo placed by its centre. `scale` > 1 for Saturn. The Sun PNG is a square crop with
 * black bars and a cut corona: it is drawn through a circular mask (the disc is ~88% of the image)
 * with our own glow.
 */
const PlanetAt = ({ x, y, r, planet, uid }: { x: number; y: number; r: number; planet: string; uid: string }) => {
  if (planet === "Sun") {
    // the disc must fill radius r: draw the image 1/0.88 larger and clip to the disc
    const s = r / SUN_DISC;
    return (
      <>
        <circle cx={f(x)} cy={f(y)} r={f(r * 1.45)} fill={`url(#bc-glow-sun-${uid})`} />
        <image
          href={PLANET_URL(planet)}
          x={f(x - s)}
          y={f(y - s)}
          width={f(s * 2)}
          height={f(s * 2)}
          preserveAspectRatio="xMidYMid meet"
          clipPath={`url(#bc-sun-clip-${uid})`}
          data-sun-mask="true"
        />
      </>
    );
  }
  const s = planet === "Saturn" ? r * SATURN_SCALE : r;
  return (
    <image
      href={PLANET_URL(planet)}
      x={f(x - s)}
      y={f(y - s)}
      width={f(s * 2)}
      height={f(s * 2)}
      preserveAspectRatio="xMidYMid meet"
    />
  );
};

const MoonSymbol = ({ phaseIndex, size }: { phaseIndex: number; size: number }) => <MoonOrb phaseIndex={phaseIndex} size={size} />;
const PlanetSymbol = ({ planet, size }: { planet: string; size: number }) => {
  const img = (
    <img
      src={PLANET_URL(planet)}
      alt=""
      width={size}
      height={size}
      className={`bio-clock__planet-img${planet === "Saturn" ? " is-saturn" : ""}${planet === "Sun" ? " is-sun" : ""}`}
    />
  );
  // the Sun: round mask + our own glow (CSS `.bio-clock__sun`)
  return planet === "Sun" ? <span className="bio-clock__sun" style={{ width: size, height: size }}>{img}</span> : img;
};

/** One centre line: a small symbol and its word, centred as a group (the word's width is estimated). */
const CentreLine = ({
  y, word, colour, fontSize, symbol,
}: { y: number; word: string; colour: string; fontSize: number; symbol: (cx: number, cy: number) => ReactNode }) => {
  const width = word.length * fontSize * 0.55;
  const total = CENTRE_ICON_R * 2 + 3 + width;
  const start = C - total / 2;
  return (
    <g data-centre-line>
      {symbol(start + CENTRE_ICON_R, y - fontSize * 0.34)}
      <text className="bio-clock__word" x={f(start + CENTRE_ICON_R * 2 + 3)} y={f(y)} textAnchor="start" style={{ fontSize: `${fontSize}px`, fill: colour }}>
        {word}
      </text>
    </g>
  );
};

export interface BiologicClockFaceProps {
  cycles: AllCyclesV2;
  /** The instant the cycles were computed for; the day fraction and the time left come from it. */
  nowMs: number;
  /** "YYYY-MM-DD", or null: the year ring is then an empty track. */
  birthday: string | null;
  /** The birthday is still being read: draw the empty year track without prompting. */
  birthdayLoading?: boolean;
  /** 1 dial only (default) · 2 dial + card · 3 + Day and Year rings outside. */
  view?: ClockView;
  /** One tap, Enter or Space on the dial → the next view. Without it the dial is static. */
  onCycleView?: () => void;
  /** `inline`: the card sits beside / below the dial, pushing content down. `card`: it drops down from the dial over what is behind (the village map). */
  placement?: "inline" | "card";
  /** Extra lines under the Moon block in views 2–3 (Moon Focus). */
  children?: ReactNode;
  /** Rendered in place of the empty year track's invitation (the connected clock passes the prompt opener). */
  onAskBirthday?: () => void;
  className?: string;
}

/** One block of the card: label with address + time left, current symbol + word + was/next, meaning. */
const Block = ({
  ring, colour, label, timeLeft, symbol, word, around, meaning, children,
}: {
  ring: "moon" | "week" | "year";
  colour: string;
  label: string;
  timeLeft?: string;
  symbol: ReactNode;
  word: string;
  around?: string;
  meaning: ReactNode;
  children?: ReactNode;
}) => (
  <section className="bio-clock__block" data-readout={ring} style={{ "--bc-ring": colour } as CSSProperties}>
    <div className="bio-clock__head">
      <span className="bio-clock__label">{label}</span>
      {timeLeft ? <span className="bio-clock__time">{timeLeft}</span> : null}
    </div>
    {word ? (
      <div className="bio-clock__now">
        <span className="bio-clock__symbol" aria-hidden="true">{symbol}</span>
        <span className="bio-clock__name">{word}</span>
        {around ? <span className="bio-clock__around">{around}</span> : null}
      </div>
    ) : null}
    <p className="bio-clock__meaning">{meaning}</p>
    {children ? <div className="bio-clock__extra">{children}</div> : null}
  </section>
);

export const BiologicClockFace = ({
  cycles, nowMs, birthday, birthdayLoading = false, view = 1, onCycleView, placement = "inline", onAskBirthday, className, children,
}: BiologicClockFaceProps) => {
  const { t } = useTranslation();
  const fmt = makeFmt(t);
  const uid = useId().replace(/:/g, "");

  // When the card opens or grows (a tap on the dial), bring it into view: on the profile it runs
  // below the fold. Not on first mount, so a remembered view never moves the page.
  const readoutRef = useRef<HTMLDivElement>(null);
  const lastView = useRef(view);
  useEffect(() => {
    if (lastView.current === view) return;
    lastView.current = view;
    if (view >= 2) readoutRef.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }, [view]);

  const { solar, lunar, dayOfWeek } = cycles;
  const expanded = view === 3; // the Day and Year rings, outside
  const showText = view >= 2;
  const hasBirthday = !!birthday;
  const pad = expanded ? PAD_EXPANDED : 0;

  const moonNow = lunar.segmentIndex;
  const weekNow = dayOfWeek.segmentIndex;
  const moonP = lunar.progress;
  const dayP = dayFraction(nowMs);
  const yearP = solar.personalProgress;
  const seasonNow = Math.min(3, Math.floor(yearP * 4));

  // ── Words ──
  const moonPhase = (i: number) => MOON_PHASES[mod(i, 8)];
  const weekDay = (i: number) => PLANETARY_DAYS[mod(i, 7)];
  const season = (i: number) => SOLAR_HOLONIC[SOLAR_HOLONIC_ORDER[mod(i, 4)]];
  const moonWord = phaseWord(lunar.phase.energy);
  const dayWord = phaseWord(dayOfWeek.day.energy);
  const timeLeftDays = Math.max(0, (lunar.phaseEndMs - nowMs) / 86_400_000);
  const moonEnds = fmt("village.clock.moonIn", "{{phase}} in {{time}}", {
    phase: lunar.nextPhaseName,
    time: formatTimeLeft(timeLeftDays),
  });
  const wasNext = (prev: string, next: string) => fmt("village.clock.wasNext", "was {{prev}} · next {{next}}", { prev, next });

  // ── Centre words: the same size and weight, each carrying its ring's symbol and colour ──
  const longest = Math.max(moonWord.length, dayWord.length);
  const centreFont = Math.max(CENTRE_FONT_MIN, Math.min(CENTRE_FONT, 66 / (longest * 0.55)));
  const weekColour = WEEK_COLOURS[weekNow];

  const summary = [moonWord, lunar.phase.name, dayOfWeek.day.name, dayWord].join(" · ");
  const yearName = hasBirthday ? season(seasonNow).name : "";
  const yearInvite = fmt("village.clock.yearEmpty", "Add your birthday to see your year");
  const yearAddress = fmt("village.clock.yearFrom", "Your year, from your birthday");
  const birthdayIn = hasBirthday ? daysToBirthday(birthday as string, nowMs) : null;
  const dayLeftPct = Math.round((1 - dayP) * 100);

  const nextLabel = view === 1
    ? fmt("village.clock.toText", "Show the text: meaning, previous and next")
    : view === 2
      ? fmt("village.clock.toYear", "Show Year and day")
      : fmt("village.clock.toDial", "Back to the dial only");

  const onKeyDown = onCycleView
    ? (e: KeyboardEvent<SVGSVGElement>) => {
        if (isActivationKey(e.key)) {
          e.preventDefault();
          onCycleView();
        }
      }
    : undefined;

  // ── Ring grammar: lived dim, ahead bright, now large ──
  const moonSeg = (i: number) => (i === moonNow ? "now" : i < moonNow ? "lived" : "ahead");
  const weekSeg = (i: number) => (i === weekNow ? "today" : i < weekNow ? "lived" : "ahead");
  const seasonSeg = (q: number) => (q === seasonNow ? "now" : q < seasonNow ? "lived" : "ahead");

  return (
    <div
      className={`bio-clock bio-clock--${placement}${className ? ` ${className}` : ""}`}
      data-view={view}
      data-expanded={expanded ? "true" : "false"}
    >
      <div className="bio-clock__watch">
      <svg
        className={`bio-clock__dial${onCycleView ? " is-tappable" : ""}`}
        viewBox={`${-pad} ${-pad} ${200 + pad * 2} ${200 + pad * 2}`}
        role={onCycleView ? "button" : "group"}
        tabIndex={0}
        aria-label={onCycleView ? `${summary}. ${nextLabel}` : summary}
        data-moon={moonNow}
        data-day={weekNow}
        onClick={onCycleView}
        onKeyDown={onKeyDown}
      >
        <defs>
          <radialGradient id={`bc-glow-moon-${uid}`}>
            <stop offset="35%" stopColor={MOON_GLOW} stopOpacity="0.55" />
            <stop offset="100%" stopColor={MOON_GLOW} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`bc-glow-week-${uid}`}>
            <stop offset="35%" stopColor={weekColour} stopOpacity="0.7" />
            <stop offset="100%" stopColor={weekColour} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`bc-glow-sun-${uid}`}>
            <stop offset="55%" stopColor={SUN_GLOW} stopOpacity="0.5" />
            <stop offset="100%" stopColor={SUN_GLOW} stopOpacity="0" />
          </radialGradient>
          <clipPath id={`bc-sun-clip-${uid}`} clipPathUnits="objectBoundingBox">
            <circle cx="0.5" cy="0.5" r={SUN_DISC / 2} />
          </clipPath>
        </defs>

        <circle className="bio-clock__night" cx={C} cy={C} r={expanded ? RING.year + 3 : 100} />

        {/* ── Year (view 3, outermost): four seasons from the birthday; lived dim, ahead bright ── */}
        {expanded && (
          <g className="bio-clock__ring" data-ring="year">
            {!birthdayLoading && <title>{hasBirthday ? `${yearAddress}: ${yearName}` : yearInvite}</title>}
            {hasBirthday ? (
              SOLAR_HOLONIC_ORDER.map((_, q) => (
                <path
                  key={q}
                  data-season={q}
                  className={`bio-clock__year is-${seasonSeg(q)}`}
                  d={arcPath(RING.year, q / 4 + 0.008, (q + 1) / 4 - 0.008)}
                />
              ))
            ) : (
              <circle className="bio-clock__year bio-clock__year--empty" cx={C} cy={C} r={RING.year} />
            )}
            {hasBirthday && (() => {
              const [x, y] = polar(RING.year, yearP);
              return <circle className="bio-clock__year-dot" cx={f(x)} cy={f(y)} r="3.4" />;
            })()}
          </g>
        )}

        {/* ── Day (view 3): a thin gold ring outside the Moon; lived dim, what is left bright; no clock time ── */}
        {expanded && (
          <g className="bio-clock__ring" data-ring="day">
            <title>{fmt("village.clock.dayPart", "Part of the day")}</title>
            <path className="bio-clock__day-lived" d={arcPath(RING.day, 0, dayP)} />
            <path className="bio-clock__day-ahead" d={arcPath(RING.day, dayP, 1)} />
            {(() => {
              const [x, y] = polar(RING.day, dayP);
              return <circle className="bio-clock__day-dot" cx={f(x)} cy={f(y)} r="3" />;
            })()}
          </g>
        )}

        {/* ── Moon: 8 phases, New Moon at the top, clockwise ── */}
        <g className="bio-clock__ring" data-ring="moon">
          <title>{lunar.phase.name}</title>
          <path className="bio-clock__track-lived" strokeWidth={RING.track} d={arcPath(RING.moon, 0, moonP)} />
          <path className="bio-clock__track-ahead" strokeWidth={RING.track} d={arcPath(RING.moon, moonP, 1)} />
          {Array.from({ length: 8 }, (_, i) => {
            const [x, y] = polar(RING.moon, (i + 0.5) / 8);
            const isNow = i === moonNow;
            return (
              <g
                key={i}
                data-moon-segment={i}
                className={`bio-clock__moon is-${moonSeg(i)}`}
              >
                {isNow && <circle cx={f(x)} cy={f(y)} r={MOON_R_NOW * 1.7} fill={`url(#bc-glow-moon-${uid})`} />}
                <MoonAt x={x} y={y} r={isNow ? MOON_R_NOW : MOON_R} phaseIndex={i} />
              </g>
            );
          })}
        </g>

        {/* ── Week: 7 days, Monday at the top, chakra-coloured track ── */}
        <g className="bio-clock__ring" data-ring="week">
          <title>{`${dayOfWeek.day.name}, ${dayOfWeek.day.planet}`}</title>
          {PLANETARY_DAYS.map((d, i) => {
            const isToday = i === weekNow;
            return (
              <path
                key={`seg-${d.name}`}
                data-week-track={i}
                className={`bio-clock__seg is-${weekSeg(i)}`}
                style={{ "--bc-seg": WEEK_COLOURS[i] } as CSSProperties}
                strokeWidth={isToday ? RING.track * 2.3 : RING.track * 1.3}
                d={arcPath(RING.week, i / 7 + 0.006, (i + 1) / 7 - 0.006)}
              />
            );
          })}
          {PLANETARY_DAYS.map((d, i) => {
            const [x, y] = polar(RING.week, (i + 0.5) / 7);
            const isToday = i === weekNow;
            return (
              <g key={d.name} data-week-segment={i} className={`bio-clock__planet is-${weekSeg(i)}`}>
                {isToday && <circle cx={f(x)} cy={f(y)} r={PLANET_R_NOW * 1.7} fill={`url(#bc-glow-week-${uid})`} />}
                <PlanetAt x={x} y={y} r={isToday ? PLANET_R_NOW : PLANET_R} planet={d.planet} uid={uid} />
              </g>
            );
          })}
        </g>

        {/* ── Centre: two addressed words, each with its ring's symbol and colour ── */}
        <g data-ring="centre" className="bio-clock__centre">
          <CentreLine
            y={C - 3}
            word={moonWord}
            colour={MOON_GLOW}
            fontSize={centreFont}
            symbol={(cx, cy) => <MoonAt x={cx} y={cy} r={CENTRE_ICON_R} phaseIndex={moonNow} />}
          />
          <CentreLine
            y={C + centreFont + 1}
            word={dayWord}
            colour={weekColour}
            fontSize={centreFont}
            symbol={(cx, cy) => <PlanetAt x={cx} y={cy} r={CENTRE_ICON_R} planet={dayOfWeek.day.planet} uid={uid} />}
          />
        </g>
      </svg>
      </div>

      {showText && (
      <div className="bio-clock__readout" ref={readoutRef}>
        <Block
          ring="moon"
          colour={MOON_GLOW}
          label={`${fmt("village.clock.moon", "Moon")} · ${lunar.phase.name}`}
          timeLeft={moonEnds}
          symbol={<MoonSymbol phaseIndex={moonNow} size={26} />}
          word={moonWord}
          around={wasNext(phaseWord(moonPhase(moonNow - 1).energy), phaseWord(moonPhase(moonNow + 1).energy))}
          meaning={moonMeaning(lunar.phase.energy)}
        >
          {children}
        </Block>

        <Block
          ring="week"
          colour={weekColour}
          label={`${fmt("village.clock.week", "Week")} · ${dayOfWeek.day.name}, ${dayOfWeek.day.planet}`}
          symbol={<PlanetSymbol planet={dayOfWeek.day.planet} size={26} />}
          word={dayWord}
          around={wasNext(phaseWord(weekDay(weekNow - 1).energy), phaseWord(weekDay(weekNow + 1).energy))}
          meaning={dayOfWeek.day.description}
        />

        {expanded && (hasBirthday || !birthdayLoading) && (
          hasBirthday ? (
            <Block
              ring="year"
              colour="rgb(217, 209, 180)"
              label={`${fmt("village.clock.year", "Your year")} · ${fmt("village.clock.fromBirthday", "From your birthday")}`}
              timeLeft={birthdayIn ? fmt("village.clock.toBirthday", "{{days}} days to {{date}}", { days: birthdayIn.days, date: birthdayIn.label }) : undefined}
              symbol={<span className="bio-clock__year-mark" />}
              word={yearName}
              around={wasNext(season(seasonNow - 1).name, season(seasonNow + 1).name)}
              meaning={season(seasonNow).essence}
            >
              <p className="bio-clock__today">{fmt("village.clock.dayLeft", "Today: {{pct}}% of the day left", { pct: dayLeftPct })}</p>
            </Block>
          ) : (
            <Block
              ring="year"
              colour="rgb(217, 209, 180)"
              label={`${fmt("village.clock.year", "Your year")} · ${fmt("village.clock.fromBirthday", "From your birthday")}`}
              symbol={<span className="bio-clock__year-mark" />}
              word=""
              meaning={
                onAskBirthday ? (
                  <button type="button" className="bio-clock__link" onClick={onAskBirthday}>{yearInvite}</button>
                ) : (
                  <Link to="/build/equilibrium" className="bio-clock__link">{yearInvite}</Link>
                )
              }
            >
              <p className="bio-clock__today">{fmt("village.clock.dayLeft", "Today: {{pct}}% of the day left", { pct: dayLeftPct })}</p>
            </Block>
          )
        )}
      </div>
      )}
    </div>
  );
};

/** One tick for the day arc and the time left: every 5 minutes, paused on a hidden tab, refreshed on return. */
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

/** The current view, remembered across visits (like a basic vs scientific calculator). */
const useClockView = (place?: ClockPlace): [ClockView, () => void] => {
  const [view, setView] = useState<ClockView>(() => loadView(browserStorage(), place));
  const cycle = useCallback(() => {
    setView((v) => {
      const next = nextView(v);
      saveView(browserStorage(), next, place);
      return next;
    });
  }, [place]);
  return [view, cycle];
};

/**
 * The connected clock: birthday from the same source Equilibrium uses (`useEquilibriumV2`),
 * cycles from the same hook (`useCycles`). A guest sees the real moon and week and an empty year.
 * In view 3 (Year and day) with no birthday, a signed-in player gets Equilibrium's BirthdayPrompt.
 * `children` are extra lines under the Moon block in views 2–3 (Moon Focus). `place` keys the
 * remembered view: the village and the profile each keep their own.
 */
export const BiologicClock = ({
  className, placement, place, children,
}: { className?: string; placement?: "inline" | "card"; place?: ClockPlace; children?: ReactNode }) => {
  const { birthday, loading, user, refresh } = useEquilibriumV2();
  const { cycles, nowMs: cyclesNowMs } = useCycles(birthday ?? undefined);
  // `useCycles` re-stamps its nowMs only when a cycle changes (hours apart); the day arc and the
  // time left need the 5-minute tick. Never older than the cycles themselves.
  const tick = useNowTick();
  const [view, cycleView] = useClockView(place);
  const [promptDismissed, setPromptDismissed] = useState(false);

  const needsBirthday = view === 3 && !loading && !birthday && !!user;
  return (
    <>
      <BiologicClockFace
        cycles={cycles}
        nowMs={Math.max(tick, cyclesNowMs)}
        birthday={birthday}
        birthdayLoading={loading && !birthday}
        view={view}
        onCycleView={() => {
          cycleView();
          if (view === 2) setPromptDismissed(false); // entering view 3 asks again
        }}
        placement={placement}
        onAskBirthday={user ? () => setPromptDismissed(false) : undefined}
        className={className}
      >
        {children}
      </BiologicClockFace>
      {needsBirthday && !promptDismissed && (
        <BirthdayPrompt
          birthday={birthday}
          loading={loading}
          userId={user?.id ?? null}
          onSaved={() => void refresh()}
          onDismiss={() => setPromptDismissed(true)}
          fullViewport
        />
      )}
    </>
  );
};

export default BiologicClock;
