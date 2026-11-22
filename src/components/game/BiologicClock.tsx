import { useCallback, useEffect, useId, useState, type CSSProperties } from "react";
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
 * BiologicClock v5 — the player's own clock (docs/specs/equilibrium/biologic_clock_rings_spec.md;
 * issue #381). Two concentric rings, outside in: Moon (8 phases, New Moon at the top) and Week
 * (7 days, Monday at the top), both clockwise. «+ Year and day» adds a Year ring (4 seasons from
 * the birthday) and a thin gold day-part arc. Every phase carries a symbol and a meaning; the
 * readout beside the dial gives previous › current › next for each ring. It shows cycles only:
 * no progress, scores, streaks, actions, clock time or Do now.
 *
 * ONE ENGINE: every value comes from `useCycles` (`getAllCyclesV2`). Words are the engine's:
 * phase word = first word of `MOON_PHASES[i].energy` / `PLANETARY_DAYS[i].energy`, meaning = the
 * rest of the moon energy / the day's `description`. The only value not in the engine is the day
 * fraction (local time / 24h) for the gold arc, taken from the same `nowMs`.
 *
 * `BiologicClockFace` is the pure view (cycles + now + birthday in, dial + readout out);
 * `BiologicClock` is the connected one the screens use.
 */

const C = 100; // centre of the 200 x 200 viewBox

/** Two-ring (default) and three-ring (Year + day expanded) geometry, in viewBox units. */
const LAYOUT = {
  collapsed: { moon: 80, week: 50, year: 0, day: 0, track: 1.4, fontSize: 17 },
  expanded: { moon: 76, week: 48, year: 94, day: 34, track: 1.3, fontSize: 14 },
} as const;

const MOON_R = 6.6; // moon orb radius
const MOON_R_NOW = 10.4;
const PLANET_R = 6; // planet photo radius
const PLANET_R_NOW = 9.2;
const SATURN_SCALE = 1.7; // the rings make Saturn's disc small
const PLANET_DIM = 0.75;

const PLANET_URL = (planet: string) => `/assets/equilibrium/planets/${planet.toLowerCase()}.png`;

/** Chakra colour per weekday, Monday first (`PLANETARY_DAYS` order). */
const WEEK_COLOURS = ["#5b4fc4", "#c9483c", "#3f84d0", "#9a62d6", "#e48a3c", "#e8c447", "#4fb06e"] as const;
const MOON_GLOW = "#fff4dc"; // warm white

const STORAGE_KEY = "bioclock:expanded";

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
/** «Readying · Prep for harvest · …» → «Readying»; «Threshold & Celebration» → «Threshold». */
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

/** A planet photo placed by its centre. `scale` > 1 for Saturn. */
const PlanetAt = ({ x, y, r, planet, opacity }: { x: number; y: number; r: number; planet: string; opacity: number }) => {
  const s = planet === "Saturn" ? r * SATURN_SCALE : r;
  return (
    <image
      href={PLANET_URL(planet)}
      x={f(x - s)}
      y={f(y - s)}
      width={f(s * 2)}
      height={f(s * 2)}
      opacity={opacity}
      preserveAspectRatio="xMidYMid meet"
    />
  );
};

/** One readout item: a small symbol and a word. */
const Step = ({
  symbol, word, current = false,
}: { symbol: React.ReactNode; word: string; current?: boolean }) => (
  <span className={`bio-clock__step${current ? " is-current" : ""}`}>
    <span className="bio-clock__step-symbol" aria-hidden="true">{symbol}</span>
    <span className="bio-clock__step-word">{word}</span>
  </span>
);

const Sep = () => <span className="bio-clock__sep" aria-hidden="true">›</span>;

const MoonSymbol = ({ phaseIndex, size }: { phaseIndex: number; size: number }) => <MoonOrb phaseIndex={phaseIndex} size={size} />;
const PlanetSymbol = ({ planet, size }: { planet: string; size: number }) => (
  <img
    src={PLANET_URL(planet)}
    alt=""
    width={size}
    height={size}
    className={`bio-clock__planet-img${planet === "Saturn" ? " is-saturn" : ""}`}
  />
);

export interface BiologicClockFaceProps {
  cycles: AllCyclesV2;
  /** The instant the cycles were computed for; the day fraction and the time left come from it. */
  nowMs: number;
  /** "YYYY-MM-DD", or null: the year ring is then an empty track. */
  birthday: string | null;
  /** The birthday is still being read: draw the empty year track without prompting. */
  birthdayLoading?: boolean;
  /** «+ Year and day» open or closed. Default closed. */
  expanded?: boolean;
  onToggleExpanded?: (next: boolean) => void;
  /** Rendered in place of the empty year track's invitation (the connected clock passes the prompt opener). */
  onAskBirthday?: () => void;
  className?: string;
}

export const BiologicClockFace = ({
  cycles, nowMs, birthday, birthdayLoading = false, expanded = false, onToggleExpanded, onAskBirthday, className,
}: BiologicClockFaceProps) => {
  const { t } = useTranslation();
  const fmt = makeFmt(t);
  const uid = useId().replace(/:/g, "");

  const { solar, lunar, dayOfWeek } = cycles;
  const L = expanded ? LAYOUT.expanded : LAYOUT.collapsed;
  const hasBirthday = !!birthday;

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

  // ── Centre words, shrunk to fit the free disc ──
  const clear = L.week - PLANET_R_NOW - 3; // radius of the empty centre
  const fit = (word: string, base: number) => Math.min(base, (clear * 2 * 0.92) / (word.length * 0.56));
  const moonFont = fit(moonWord, L.fontSize);
  const dayFont = fit(dayWord, L.fontSize * 0.66);
  const weekColour = WEEK_COLOURS[weekNow];

  const summary = [moonWord, lunar.phase.name, dayOfWeek.day.name, dayWord].join(" · ");
  const yearLabel = hasBirthday
    ? `${season(seasonNow).name} · ${season(seasonNow).cardinal}`
    : fmt("village.clock.yearEmpty", "Add your birthday to see your year");

  return (
    <div className={`bio-clock${className ? ` ${className}` : ""}`} data-expanded={expanded ? "true" : "false"}>
      <svg
        className="bio-clock__dial"
        viewBox="0 0 200 200"
        role="group"
        tabIndex={0}
        aria-label={summary}
        data-moon={moonNow}
        data-day={weekNow}
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
        </defs>

        <circle className="bio-clock__night" cx={C} cy={C} r="100" />

        {/* ── Year (expanded): four seasons from the birthday ── */}
        {expanded && (
          <g className="bio-clock__ring" data-ring="year">
            {!birthdayLoading && <title>{yearLabel}</title>}
            {hasBirthday ? (
              SOLAR_HOLONIC_ORDER.map((_, q) => (
                <path
                  key={q}
                  data-season={q}
                  className={`bio-clock__year${q === seasonNow ? " is-now" : ""}`}
                  d={arcPath(L.year, q / 4 + 0.008, (q + 1) / 4 - 0.008)}
                />
              ))
            ) : (
              <circle className="bio-clock__year bio-clock__year--empty" cx={C} cy={C} r={L.year} />
            )}
            {hasBirthday && (() => {
              const [x, y] = polar(L.year, yearP);
              return <circle className="bio-clock__year-dot" cx={f(x)} cy={f(y)} r="2.4" />;
            })()}
          </g>
        )}

        {/* ── Moon: 8 phases, New Moon at the top, clockwise ── */}
        <g className="bio-clock__ring" data-ring="moon">
          <title>{lunar.phase.name}</title>
          <path className="bio-clock__track" strokeWidth={L.track} d={arcPath(L.moon, 0, 1)} />
          <path className="bio-clock__track-lit" strokeWidth={L.track} d={arcPath(L.moon, 0, moonP)} />
          {Array.from({ length: 8 }, (_, i) => {
            const [x, y] = polar(L.moon, (i + 0.5) / 8);
            const isNow = i === moonNow;
            return (
              <g
                key={i}
                data-moon-segment={i}
                className={`bio-clock__moon${isNow ? " is-now" : i < moonNow ? " is-lit" : " is-dim"}`}
              >
                {isNow && <circle cx={f(x)} cy={f(y)} r={MOON_R_NOW * 1.85} fill={`url(#bc-glow-moon-${uid})`} />}
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
                className={`bio-clock__seg${isToday ? " is-today" : ""}`}
                style={{ "--bc-seg": WEEK_COLOURS[i] } as CSSProperties}
                strokeWidth={isToday ? L.track * 2.3 : L.track * 1.3}
                d={arcPath(L.week, i / 7 + 0.006, (i + 1) / 7 - 0.006)}
              />
            );
          })}
          {PLANETARY_DAYS.map((d, i) => {
            const [x, y] = polar(L.week, (i + 0.5) / 7);
            const isToday = i === weekNow;
            return (
              <g key={d.name} data-week-segment={i} className={`bio-clock__planet${isToday ? " is-today" : ""}`}>
                {isToday && <circle cx={f(x)} cy={f(y)} r={PLANET_R_NOW * 1.9} fill={`url(#bc-glow-week-${uid})`} />}
                <PlanetAt x={x} y={y} r={isToday ? PLANET_R_NOW : PLANET_R} planet={d.planet} opacity={isToday ? 1 : PLANET_DIM} />
              </g>
            );
          })}
        </g>

        {/* ── Day part (expanded): a thin gold arc, midnight at the top, no clock time ── */}
        {expanded && (
          <g className="bio-clock__ring" data-ring="day">
            <title>{fmt("village.clock.dayPart", "Part of the day")}</title>
            <path className="bio-clock__day-track" d={arcPath(L.day, 0, 1)} />
            <path className="bio-clock__day-lit" d={arcPath(L.day, 0, dayP)} />
            {(() => {
              const [x, y] = polar(L.day, dayP);
              return <circle className="bio-clock__day-dot" cx={f(x)} cy={f(y)} r="2.2" />;
            })()}
          </g>
        )}

        {/* ── Centre: the moon phase word over the day word ── */}
        <g data-ring="centre" className="bio-clock__centre">
          <text className="bio-clock__word" x={C} y={C - 2} textAnchor="middle" style={{ fontSize: `${moonFont}px` }}>
            {moonWord}
          </text>
          <text className="bio-clock__word bio-clock__word--day" x={C} y={C + dayFont + 3} textAnchor="middle" style={{ fontSize: `${dayFont}px` }}>
            {dayWord}
          </text>
        </g>
      </svg>

      <div className="bio-clock__readout">
        {/* Moon */}
        <section className="bio-clock__block" data-readout="moon">
          <p className="bio-clock__chain">
            <Step symbol={<MoonSymbol phaseIndex={mod(moonNow - 1, 8)} size={24} />} word={phaseWord(moonPhase(moonNow - 1).energy)} />
            <Sep />
            <Step current symbol={<MoonSymbol phaseIndex={moonNow} size={34} />} word={moonWord} />
            <Sep />
            <Step symbol={<MoonSymbol phaseIndex={mod(moonNow + 1, 8)} size={24} />} word={phaseWord(moonPhase(moonNow + 1).energy)} />
          </p>
          <p className="bio-clock__small">{lunar.phase.name}</p>
          <p className="bio-clock__meaning">{moonMeaning(lunar.phase.energy)}</p>
          <p className="bio-clock__ends">{moonEnds}</p>
        </section>

        {/* Week */}
        <section className="bio-clock__block" data-readout="week">
          <p className="bio-clock__chain">
            <Step symbol={<PlanetSymbol planet={weekDay(weekNow - 1).planet} size={24} />} word={phaseWord(weekDay(weekNow - 1).energy)} />
            <Sep />
            <Step current symbol={<PlanetSymbol planet={dayOfWeek.day.planet} size={34} />} word={dayWord} />
            <Sep />
            <Step symbol={<PlanetSymbol planet={weekDay(weekNow + 1).planet} size={24} />} word={phaseWord(weekDay(weekNow + 1).energy)} />
          </p>
          <p className="bio-clock__small">{`${dayOfWeek.day.name} · ${dayOfWeek.day.planet}`}</p>
          <p className="bio-clock__meaning">{dayOfWeek.day.description}</p>
        </section>

        {/* Year (expanded) */}
        {expanded && (hasBirthday || !birthdayLoading) && (
          <section className="bio-clock__block" data-readout="year">
            {hasBirthday ? (
              <>
                <p className="bio-clock__chain">
                  <Step symbol={season(seasonNow - 1).emoji} word={season(seasonNow - 1).name} />
                  <Sep />
                  <Step current symbol={season(seasonNow).emoji} word={season(seasonNow).name} />
                  <Sep />
                  <Step symbol={season(seasonNow + 1).emoji} word={season(seasonNow + 1).name} />
                </p>
                <p className="bio-clock__small">{season(seasonNow).cardinal}</p>
                <p className="bio-clock__meaning">{season(seasonNow).essence}</p>
              </>
            ) : (
              <p className="bio-clock__meaning">
                {onAskBirthday ? (
                  <button type="button" className="bio-clock__link" onClick={onAskBirthday}>{yearLabel}</button>
                ) : (
                  <Link to="/build/equilibrium" className="bio-clock__link">{yearLabel}</Link>
                )}
              </p>
            )}
          </section>
        )}

        {onToggleExpanded && (
          <button
            type="button"
            className="bio-clock__toggle"
            aria-expanded={expanded}
            onClick={() => onToggleExpanded(!expanded)}
          >
            {expanded
              ? fmt("village.clock.lessToggle", "− Year and day")
              : fmt("village.clock.moreToggle", "+ Year and day")}
          </button>
        )}
      </div>
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

/** «+ Year and day», remembered across visits (like a basic vs scientific calculator). */
const useExpanded = (): [boolean, (next: boolean) => void] => {
  const [expanded, setExpanded] = useState<boolean>(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const set = useCallback((next: boolean) => {
    setExpanded(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* private mode: the choice just lasts this visit */
    }
  }, []);
  return [expanded, set];
};

/**
 * The connected clock: birthday from the same source Equilibrium uses (`useEquilibriumV2`),
 * cycles from the same hook (`useCycles`). A guest sees the real moon and week and an empty year.
 * With «+ Year and day» open and no birthday, a signed-in player gets Equilibrium's BirthdayPrompt.
 */
export const BiologicClock = ({ className }: { className?: string }) => {
  const { birthday, loading, user, refresh } = useEquilibriumV2();
  const { cycles, nowMs: cyclesNowMs } = useCycles(birthday ?? undefined);
  // `useCycles` re-stamps its nowMs only when a cycle changes (hours apart); the day arc and the
  // time left need the 5-minute tick. Never older than the cycles themselves.
  const tick = useNowTick();
  const [expanded, setExpanded] = useExpanded();
  const [promptDismissed, setPromptDismissed] = useState(false);

  const needsBirthday = expanded && !loading && !birthday && !!user;
  return (
    <>
      <BiologicClockFace
        cycles={cycles}
        nowMs={Math.max(tick, cyclesNowMs)}
        birthday={birthday}
        birthdayLoading={loading && !birthday}
        expanded={expanded}
        onToggleExpanded={(next) => {
          setExpanded(next);
          if (next) setPromptDismissed(false);
        }}
        onAskBirthday={user ? () => setPromptDismissed(false) : undefined}
        className={className}
      />
      {needsBirthday && !promptDismissed && (
        <BirthdayPrompt
          birthday={birthday}
          loading={loading}
          userId={user?.id ?? null}
          onSaved={() => void refresh()}
          onDismiss={() => setPromptDismissed(true)}
        />
      )}
    </>
  );
};

export default BiologicClock;
