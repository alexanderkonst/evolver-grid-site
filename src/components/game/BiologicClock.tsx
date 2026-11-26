import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  MOON_PHASES,
  PLANETARY_DAYS,
  SOLAR_HOLONIC,
  SOLAR_HOLONIC_ORDER,
  phaseWord,
  type AllCyclesV2,
} from "@/lib/equilibrium-cycles";
import { useCycles } from "@/modules/equilibrium/hooks/useCycles";
import { useEquilibriumV2 } from "@/modules/equilibrium/hooks/useEquilibriumV2";
import { moonPhaseName } from "@/lib/moonPhaseNames";
import MoonOrb from "@/modules/equilibrium/components/MoonOrb";
import BirthdayPrompt from "@/modules/equilibrium/components/BirthdayPrompt";
import "./BiologicClock.css";

/**
 * BiologicClock v7 (Rings v7, issue #532) — segmented rings: Moon 8 segments, Week 7, butt caps and small gaps; stroke grows with the
 * radius (15 × r / 84); each Moon segment is as bright as that phase is lit; ahead = full-width segment with the «Light flow»
 * gradient along its arc, lived = the same colour as a thin line (30% width, opacity .85); the current segment is split at now.
 * Phase names the player reads are the neutral ones (`moonPhaseName`); the engine keeps the astronomical names as keys.
 * The v6.2 notes below still describe the views, the centre and the card.
 *
 * BiologicClock v6.2 — the player's own clock (docs/specs/equilibrium/biologic_clock_rings_spec.md;
 * issues #381, #385, #405, #434). Two concentric rings, outside in: Moon (8 phases, New Moon at the top)
 * and Week (7 days, Monday at the top), both clockwise. Three views, one tap on the dial cycles
 * them: 1 dial only (default) → 2 dial + card → 3 + two thin rings OUTSIDE (Day gold, then Year
 * silver) → back to 1. Moon and Week never move or resize; the dial grows outward.
 *
 * One grammar on every ring: the current phase is one large glowing symbol, what is lived is dim,
 * what is ahead is bright. Centre: two addressed words, each under its cycle's name in small caps
 * (`FULL MOON` over «Harvesting» in the moon colour, `TUESDAY` over «Action» in the day's chakra
 * colour), with the small moon / planet beside the word. The card is one grid per ring: label with
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

/**
 * Ring radii. Moon and Week keep size and place in all views; view 3 adds Day then Year outside.
 * Day and Year are placed so that, with their own stroke (15 × r / 84, grows with the radius), each clears the ring inside it by 2 units.
 */
const RING = { moon: 84, week: 56, day: 103, year: 126 } as const;
/** Stroke width grows with the radius (Rings v7 item 2): Moon r 84 → 15, Week r 56 → 10. */
const MOON_STROKE = 15;
export const ringStroke = (r: number): number => (MOON_STROKE * r) / RING.moon;
/** Half a gap, in turns, at each end of every segment (~1.4°). */
const SEG_GAP = 0.004;
/** The lived part of a segment: a thin line of this share of the stroke, opacity `LIVED_LINE_OPACITY`. */
const LIVED_LINE = 0.3;
const LIVED_LINE_OPACITY = 0.85;
/** The neighbour's colour at each end of a segment's «Light flow» gradient. */
const FLOW_BLEND = 0.35;
/** viewBox padding in view 3: the dial grows outward (to the outer edge of the Year ring), the inner rings do not move. */
const PAD_EXPANDED = 38;
const DISC_R = 100; // the dark backing disc, in views 1–2; view 3 adds the padding

const MOON_R = 6; // the other moons: small quiet marks
const MOON_R_NOW = 15.5; // the current moon ~2.5×
const PLANET_R = 5.5; // fits the 10-wide Week stroke
const PLANET_R_NOW = 15.5; // today's planet ~2.5×
const SATURN_SCALE = 1.7; // the rings make Saturn's disc small
const SUN_DISC = 0.88; // the Sun PNG: the disc is ~88% of the square image, black bars around
const CENTRE_FONT = 13; // viewBox units; the dial is never below 200 px, so words stay >= 12 px
const CENTRE_FONT_MIN = 12;
const CENTRE_LABEL_FONT = 11; // the small caps address over each centre word; never below 11 px on a 200 px dial
const CENTRE_ICON_R = 5.5;
const RING_LABEL_FONT = 11; // «DAY» / «YEAR» on the two outer rings (view 3); the dial is 1 unit = 1 px at 200 px, so never below 11 px

const PLANET_URL = (planet: string) => `/assets/equilibrium/planets/${planet.toLowerCase()}.png`;

/** Chakra colour per weekday, Monday first (`PLANETARY_DAYS` order). */
const WEEK_COLOURS = ["#5b4fc4", "#c9483c", "#3f84d0", "#9a62d6", "#e48a3c", "#e8c447", "#4fb06e"] as const;
const MOON_GLOW = "#fff4dc"; // warm white
const SILVER = "#d9d1b4"; // the Year ring (rgb 217, 209, 180)
const GOLD = "#f2c46b"; // the Day ring (rgb 242, 196, 107)
const MOON_DARK = "#343640"; // a new moon: dark
const MOON_LIT = "#fff1d6"; // a full moon: cream
/** How lit each phase is, in `MOON_PHASES` order (New Moon … Waning Crescent): the segment colour is a mix by this. */
export const MOON_ILLUMINATION = [0.03, 0.25, 0.5, 0.8, 1, 0.8, 0.5, 0.25] as const;
const SUN_GLOW = "#ff9a3c";
const NIGHT = "#070b16";

// ── Contrast: text in a chakra colour must reach WCAG AA (4.5:1) on the dark map / card ──
const hexToRgb = (hex: string): [number, number, number] =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
/** WCAG contrast ratio of two #rrggbb colours. */
export const contrastRatio = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const toHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
/** `a` mixed towards `b` by `t` (0 = a, 1 = b), both #rrggbb. */
export const mixHex = (a: string, b: string, t: number): string => {
  const [ra, rb] = [hexToRgb(a), hexToRgb(b)];
  return toHex(ra.map((v, i) => v + (rb[i] - v) * t));
};
/** The Moon ring's eight segment colours: dark → cream by how lit the phase is. */
export const MOON_SEGMENT_COLOURS: readonly string[] = MOON_ILLUMINATION.map((k) => mixHex(MOON_DARK, MOON_LIT, k));
/** The colour itself when it already reads on the night background, else the nearest lighter mix towards white. */
export const readableOnDark = (hex: string, min = 4.5): string => {
  let mix = 0;
  let out = hex;
  while (contrastRatio(out, NIGHT) < min && mix < 1) {
    mix += 0.04;
    out = toHex(hexToRgb(hex).map((v) => v + (255 - v) * mix));
  }
  return out;
};
/** The same seven colours for WORDS: the chakra colour where it reads (AA on the night), else lightened. Tracks and glows keep the pure colour. */
export const WEEK_TEXT_COLOURS: readonly string[] = WEEK_COLOURS.map((c) => readableOnDark(c));

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
/** «Prepping · Prep for harvest · …» → «Prepping»; «Threshold & Celebration» → «Threshold». One word per moment: the engine's (the village caption takes it from there too). */
export { phaseWord };
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

/**
 * One centre line: its cycle's name in small caps (`FULL MOON`, `TUESDAY`), and under it a small
 * symbol and the meaning word, centred as a group (the word's width is estimated). Both in the
 * ring's colour: the address is what lets a newcomer link each word to its ring without a legend.
 *
 * The trailing space in each of the two texts is collapsed by SVG and never drawn. It gives the dial's
 * visible text word breaks («full moon harvesting wednesday clarity») so axe's label-in-name check
 * (WCAG 2.5.3) finds it inside the dial's accessible name; without it axe reads
 * «full moonharvestingwednesdayclarity» and flags the dial (#460).
 */
const CentreLine = ({
  y, address, word, colour, fontSize, symbol,
}: {
  y: number; address: string; word: string; colour: string; fontSize: number; symbol: (cx: number, cy: number) => ReactNode;
}) => {
  const width = word.length * fontSize * 0.55;
  const total = CENTRE_ICON_R * 2 + 3 + width;
  const start = C - total / 2;
  return (
    <g data-centre-line>
      <text
        className="bio-clock__address"
        data-centre-address
        x={C}
        y={f(y - fontSize - 2)}
        textAnchor="middle"
        style={{ fontSize: `${CENTRE_LABEL_FONT}px`, fill: colour }}
      >
        {`${address.toUpperCase()} `}
      </text>
      {symbol(start + CENTRE_ICON_R, y - fontSize * 0.34)}
      <text className="bio-clock__word" x={f(start + CENTRE_ICON_R * 2 + 3)} y={f(y)} textAnchor="start" style={{ fontSize: `${fontSize}px`, fill: colour }}>
        {`${word} `}
      </text>
    </g>
  );
};

/** Half the room a «DAY» / «YEAR» label takes on its ring, in turns: the ring stroke is left out under the letters. */
const LABEL_GAP = 0.045;

/** Turn `t` wrapped into 0..1. */
const wrapTurn = (t: number) => ((t % 1) + 1) % 1;

/** The `[from, to]` gap(s) in 0..1 a label centred at `turn` leaves in its ring; two pieces when it straddles the top. */
const labelGaps = (turn: number, half = LABEL_GAP): Array<[number, number]> => {
  const lo = turn - half;
  const hi = turn + half;
  if (lo < 0) return [[0, hi], [1 + lo, 1]];
  if (hi > 1) return [[lo, 1], [0, hi - 1]];
  return [[lo, hi]];
};

/** A ring arc `a0..a1` with the label gaps cut out (one path, up to three pieces). */
const arcWithGaps = (r: number, a0: number, a1: number, gaps: Array<[number, number]>): string => {
  let pieces: Array<[number, number]> = [[a0, a1]];
  for (const [g0, g1] of gaps) {
    pieces = pieces.flatMap(([p0, p1]): Array<[number, number]> => {
      if (g1 <= p0 || g0 >= p1) return [[p0, p1]];
      const out: Array<[number, number]> = [];
      if (g0 > p0) out.push([p0, g0]);
      if (g1 < p1) out.push([g1, p1]);
      return out;
    });
  }
  return pieces.map(([p0, p1]) => arcPath(r, p0, p1)).filter(Boolean).join(" ");
};

/**
 * One ring segment `a0..a1` (turns, the gaps between segments already taken off): the part ahead of `now`
 * as a full-width solid band, the lived part as a thin flat line of the same colour, centred on the radius.
 * With `prev` and `next` the band carries the «Light flow» gradient along its arc: the start is `FLOW_BLEND`
 * of the way to the previous segment's colour, the middle its own, the end `FLOW_BLEND` towards the next one.
 * `now` outside the segment makes it all lived (now >= a1) or all ahead (now <= a0); inside, it is split there.
 * `cut` leaves gaps for a ring label.
 */
const RingSegment = ({
  gid, r, a0, a1, now, colour, prev, next, cut = [], className, data,
}: {
  gid: string; r: number; a0: number; a1: number; now: number; colour: string; prev?: string; next?: string;
  cut?: Array<[number, number]>; className?: string; data?: Record<string, string | number>;
}) => {
  const width = ringStroke(r);
  const split = Math.min(a1, Math.max(a0, now));
  const lived = arcWithGaps(r, a0, split, cut);
  const ahead = arcWithGaps(r, split, a1, cut);
  const flow = prev !== undefined && next !== undefined;
  const [x0, y0] = polar(r, a0);
  const [x1, y1] = polar(r, a1);
  return (
    <g className={className} {...data}>
      {flow && ahead && (
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={f(x0)} y1={f(y0)} x2={f(x1)} y2={f(y1)}>
          <stop offset="0" stopColor={mixHex(colour, prev as string, FLOW_BLEND)} />
          <stop offset="0.5" stopColor={colour} />
          <stop offset="1" stopColor={mixHex(colour, next as string, FLOW_BLEND)} />
        </linearGradient>
      )}
      {lived && (
        <path className="bio-clock__arc-lived" d={lived} stroke={colour} strokeWidth={f(width * LIVED_LINE)} strokeOpacity={LIVED_LINE_OPACITY} />
      )}
      {ahead && <path className="bio-clock__arc-ahead" d={ahead} stroke={flow ? `url(#${gid})` : colour} strokeWidth={f(width)} />}
    </g>
  );
};

/** Shortest distance between two turns, 0..0.5. */
const turnDistance = (a: number, b: number) => {
  const d = Math.abs(wrapTurn(a) - wrapTurn(b));
  return Math.min(d, 1 - d);
};

/**
 * Where a ring's label sits: the first of its upper-half `candidates` (upright text) that keeps clear of
 * the ring's own moving dot and of the labels already placed, so the two labels never stack and a dot
 * never runs under a word.
 */
const pickLabelTurn = (candidates: number[], dot: number | null, taken: number[]): number =>
  candidates.find(
    (c) => (dot === null || turnDistance(c, dot) > LABEL_GAP * 1.6) && taken.every((t) => turnDistance(c, t) > LABEL_GAP * 2.6),
  ) ?? candidates[0];

/**
 * A small caps label that sits on its own ring's arc (view 3: «DAY», «YEAR») at `turn`, upright, at
 * least 11 px; the ring stroke is cut out under the letters (the caller leaves a gap), so nothing
 * touches the word.
 */
const RingLabel = ({ id, r, turn, text, className }: { id: string; r: number; turn: number; text: string; className: string }) => {
  const span = 0.09; // turns either side of the label centre: room for the text, never a visible arc
  const [x0, y0] = polar(r, turn - span);
  const [x1, y1] = polar(r, turn + span);
  return (
    <g data-ring-label={text.toLowerCase()} data-label-turn={turn.toFixed(3)} aria-hidden="true">
      <path id={id} d={`M${f(x0)} ${f(y0)} A${r} ${r} 0 0 1 ${f(x1)} ${f(y1)}`} fill="none" stroke="none" />
      <text className={`bio-clock__ring-label ${className}`} style={{ fontSize: `${RING_LABEL_FONT}px` }} dy={f(RING_LABEL_FONT * 0.36)}>
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">{text}</textPath>
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

/** A visually hidden separator between two pieces of a flex row (see `.bio-clock__sr`): read as a pause, never seen. */
const Sep = () => <span className="bio-clock__sr">{", "}</span>;

/** One block of the card: label with address + time left, current symbol + word + was/next, meaning. */
const Block = ({
  ring, colour, label, timeLeft, symbol, word, around, meaning, children,
}: {
  ring: "moon" | "week" | "year" | "day";
  colour: string;
  label: string;
  timeLeft?: string;
  symbol: ReactNode;
  word: string;
  around?: string;
  meaning?: ReactNode;
  children?: ReactNode;
}) => (
  <section className="bio-clock__block" data-readout={ring} style={{ "--bc-ring": colour } as CSSProperties}>
    {/* The rows are flex containers, which drop plain whitespace between their items, so a bare {" "} left
        «MOON · FULL MOON» and «Next: …» (or «Harvesting» and «before …») to be read as one word. <Sep /> is a
        visually hidden «, » that stays in the accessibility tree. */}
    <div className="bio-clock__head">
      <span className="bio-clock__label">{label}</span>
      {timeLeft ? <><Sep /><span className="bio-clock__time">{timeLeft}</span></> : null}
    </div>
    {word ? (
      <div className="bio-clock__now">
        <span className="bio-clock__symbol" aria-hidden="true">{symbol}</span>
        <span className="bio-clock__name">{word}</span>
        {around ? <><Sep /><span className="bio-clock__around">{around}</span></> : null}
      </div>
    ) : null}
    {meaning ? <p className="bio-clock__meaning">{meaning}</p> : null}
    {children ? <div className="bio-clock__extra">{children}</div> : null}
  </section>
);

export const BiologicClockFace = ({
  cycles, nowMs, birthday, birthdayLoading = false, view = 1, onCycleView, placement = "inline", onAskBirthday, className, children,
}: BiologicClockFaceProps) => {
  const { t } = useTranslation();
  const fmt = makeFmt(t);
  const uid = useId().replace(/:/g, "");

  // When the card opens or grows (a tap on the dial), bring the WHOLE card into view: on the profile
  // it runs below the fold, and view 3 adds a block and widens the dial. One frame after the render,
  // so the final layout is measured; a card that fits is aligned to the bottom edge (the last line
  // shows), one taller than the screen to its top (the label shows). Not on first mount, so a
  // remembered view never moves the page.
  const readoutRef = useRef<HTMLDivElement>(null);
  const lastView = useRef(view);
  useEffect(() => {
    if (lastView.current === view) return;
    lastView.current = view;
    if (view < 2 || typeof window === "undefined") return;
    const id = window.requestAnimationFrame(() => {
      const el = readoutRef.current;
      if (!el?.scrollIntoView) return;
      const rect = el.getBoundingClientRect();
      const screen = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top >= 0 && rect.bottom <= screen) return; // already all in view
      el.scrollIntoView({ block: rect.height <= screen ? "end" : "start", behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(id);
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
  const weekP = (weekNow + dayP) / 7; // where «now» is on the Week ring: the day plus how much of it has passed
  const seasonNow = Math.min(3, Math.floor(yearP * 4));

  // ── Words ──
  const moonPhase = (i: number) => MOON_PHASES[mod(i, 8)];
  const weekDay = (i: number) => PLANETARY_DAYS[mod(i, 7)];
  const season = (i: number) => SOLAR_HOLONIC[SOLAR_HOLONIC_ORDER[mod(i, 4)]];
  const moonWord = phaseWord(lunar.phase.energy);
  const dayWord = phaseWord(dayOfWeek.day.energy);
  const timeLeftDays = Math.max(0, (lunar.phaseEndMs - nowMs) / 86_400_000);
  const moonTime = formatTimeLeft(timeLeftDays);
  const moonName = moonPhaseName(lunar.phase.name, t);
  const moonEnds = fmt("village.clock.moonIn", "Next: {{phase}} in {{time}}", { phase: moonPhaseName(lunar.nextPhaseName, t), time: moonTime });
  /**
   * «before Prepping · next Celebrating, tomorrow»: «next» always carries its time when it is known.
   * `next` null: the block's header already says «Next: …» (the Moon block), so the line keeps only
   * «before Prepping» — one name per moment (v6.3 item 2).
   */
  const aroundText = (prev: string, next: string | null, when?: string) =>
    next === null
      ? fmt("village.clock.before", "before {{prev}}", { prev })
      : when
        ? fmt("village.clock.beforeNextWhen", "before {{prev}} · next {{next}}, {{when}}", { prev, next, when })
        : fmt("village.clock.beforeNext", "before {{prev}} · next {{next}}", { prev, next });
  const weekWhen = fmt("village.clock.tomorrow", "tomorrow"); // the next day always starts tomorrow

  // ── Centre words: the same size and weight, each carrying its ring's symbol and colour ──
  const longest = Math.max(moonWord.length, dayWord.length);
  const centreFont = Math.max(CENTRE_FONT_MIN, Math.min(CENTRE_FONT, 66 / (longest * 0.55)));
  const weekColour = WEEK_COLOURS[weekNow]; // tracks and glows: the pure chakra colour
  const weekText = WEEK_TEXT_COLOURS[weekNow]; // words: the same colour, lightened only as far as AA needs

  // «Almost Full, Prepping, Saturday, Structure»: commas, so a screen reader pauses between the four words
  const summary = [moonName, moonWord, dayOfWeek.day.name, dayWord].join(", ");
  const yearName = hasBirthday ? season(seasonNow).name : "";
  const yearInvite = fmt("village.clock.yearEmpty", "Add your birthday to see your year");
  const yearAddress = fmt("village.clock.yearFrom", "Your year, from your birthday");
  const birthdayIn = hasBirthday ? daysToBirthday(birthday as string, nowMs) : null;
  const dayLeftPct = Math.round((1 - dayP) * 100);
  // time to the next season of the year: the last one ends on the birthday itself
  const seasonDays = hasBirthday
    ? seasonNow === 3 && birthdayIn
      ? birthdayIn.days
      : Math.max(1, Math.round(((seasonNow + 1) / 4 - yearP) * 365.25))
    : 0;
  const yearWhen = seasonDays <= 1 ? fmt("village.clock.tomorrow", "tomorrow") : fmt("village.clock.inDays", "in {{days}} days", { days: seasonDays });
  /** «Today: 60% of the day left», led by a dot in the Day ring's colour (gold), so the line points at its ring. */
  const dayLeftLine = (
    <p className="bio-clock__today">
      <span className="bio-clock__today-dot" aria-hidden="true" />{" "}
      {fmt("village.clock.dayLeft", "Today: {{pct}}% of the day left", { pct: dayLeftPct })}
    </p>
  );

  // View 3 ring labels: each on its own ring, at its own angle, with a gap in the ring stroke under the letters
  const dayLabelTurn = pickLabelTurn([0.125, 0.875, 0], dayP, []);
  const yearLabelTurn = pickLabelTurn([0.875, 0.125, 0], hasBirthday ? yearP : null, [dayLabelTurn]);
  const dayGaps = labelGaps(dayLabelTurn);
  const yearGaps = labelGaps(yearLabelTurn);

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

  // ── Ring grammar: lived = thin line, ahead = full band, now = large symbol (the current segment splits at now) ──
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

        <circle className="bio-clock__night" cx={C} cy={C} r={DISC_R + pad} />

        {/* ── Year (view 3, outermost): four seasons from the birthday; ahead a full band, lived a thin line ── */}
        {expanded && (
          <g className="bio-clock__ring" data-ring="year">
            {!birthdayLoading && <title>{hasBirthday ? `${yearAddress}: ${yearName}` : onAskBirthday ? yearInvite : yearAddress}</title>}
            {hasBirthday ? (
              SOLAR_HOLONIC_ORDER.map((_, q) => (
                <RingSegment
                  key={q}
                  gid={`bc-flow-year-${uid}-${q}`}
                  r={RING.year}
                  a0={q / 4 + SEG_GAP}
                  a1={(q + 1) / 4 - SEG_GAP}
                  now={yearP}
                  colour={SILVER}
                  cut={yearGaps}
                  className={`bio-clock__year is-${seasonSeg(q)}`}
                  data={{ "data-season": q }}
                />
              ))
            ) : (
              // no birthday: a thin dotted line, not a band
              <path
                className="bio-clock__year bio-clock__year--empty"
                d={arcWithGaps(RING.year, 0, 1, yearGaps)}
                strokeWidth={f(ringStroke(RING.year) * LIVED_LINE)}
              />
            )}
            <RingLabel id={`bc-label-year-${uid}`} r={RING.year} turn={yearLabelTurn} text={fmt("village.clock.yearRing", "Year").toUpperCase()} className="bio-clock__ring-label--year" />
          </g>
        )}

        {/* ── Day (view 3): one gold ring outside the Moon; lived a thin line, what is left a full band; no clock time ── */}
        {expanded && (
          <g className="bio-clock__ring" data-ring="day">
            <title>{fmt("village.clock.dayPart", "Part of the day")}</title>
            <RingSegment gid={`bc-flow-day-${uid}`} r={RING.day} a0={0} a1={1} now={dayP} colour={GOLD} cut={dayGaps} className="bio-clock__day" />
            <RingLabel id={`bc-label-day-${uid}`} r={RING.day} turn={dayLabelTurn} text={fmt("village.clock.dayRing", "Day").toUpperCase()} className="bio-clock__ring-label--day" />
          </g>
        )}

        {/* ── Moon: 8 segments (New Moon at the top, clockwise), each as bright as the phase is lit ── */}
        <g className="bio-clock__ring" data-ring="moon">
          <title>{moonName}</title>
          {MOON_SEGMENT_COLOURS.map((colour, i) => (
            <RingSegment
              key={`arc-${i}`}
              gid={`bc-flow-moon-${uid}-${i}`}
              r={RING.moon}
              a0={i / 8 + SEG_GAP}
              a1={(i + 1) / 8 - SEG_GAP}
              now={moonP}
              colour={colour}
              prev={MOON_SEGMENT_COLOURS[mod(i - 1, 8)]}
              next={MOON_SEGMENT_COLOURS[mod(i + 1, 8)]}
              className="bio-clock__arc"
              data={{ "data-moon-arc": i }}
            />
          ))}
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

        {/* ── Week: 7 days (Monday at the top), chakra colours, same grammar as the Moon ── */}
        <g className="bio-clock__ring" data-ring="week">
          <title>{`${dayOfWeek.day.name}, ${dayOfWeek.day.planet}`}</title>
          {PLANETARY_DAYS.map((d, i) => (
            <RingSegment
              key={`seg-${d.name}`}
              gid={`bc-flow-week-${uid}-${i}`}
              r={RING.week}
              a0={i / 7 + SEG_GAP}
              a1={(i + 1) / 7 - SEG_GAP}
              now={weekP}
              colour={WEEK_COLOURS[i]}
              prev={WEEK_COLOURS[mod(i - 1, 7)]}
              next={WEEK_COLOURS[mod(i + 1, 7)]}
              className={`bio-clock__seg is-${weekSeg(i)}`}
              data={{ "data-week-track": i }}
            />
          ))}
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
        <g data-ring="centre" className="bio-clock__centre" aria-hidden="true">
          <CentreLine
            y={C - 6}
            address={moonName}
            word={moonWord}
            colour={MOON_GLOW}
            fontSize={centreFont}
            symbol={(cx, cy) => <MoonAt x={cx} y={cy} r={CENTRE_ICON_R} phaseIndex={moonNow} />}
          />
          <CentreLine
            y={C + 24}
            address={dayOfWeek.day.name}
            word={dayWord}
            colour={weekText}
            fontSize={centreFont}
            symbol={(cx, cy) => <PlanetAt x={cx} y={cy} r={CENTRE_ICON_R} planet={dayOfWeek.day.planet} uid={uid} />}
          />
        </g>
      </svg>
      {view === 1 && onCycleView && (
        // The cue that the dial is a control: a small «+ tap» chip (>= 24 px target) under it. The dial is
        // the one real control for keyboards and screen readers, so the chip stays out of both.
        <button type="button" className="bio-clock__cue" data-cue tabIndex={-1} aria-hidden="true" onClick={onCycleView}>
          <span className="bio-clock__cue-plus">+</span>{" "}
          <span>{fmt("village.clock.tap", "tap")}</span>
        </button>
      )}
      </div>

      {showText && (
      <div className="bio-clock__readout" ref={readoutRef}>
        <Block
          ring="moon"
          colour={MOON_GLOW}
          label={`${fmt("village.clock.moon", "Moon")} · ${moonName}`}
          timeLeft={moonEnds}
          symbol={<MoonSymbol phaseIndex={moonNow} size={26} />}
          word={moonWord}
          around={aroundText(phaseWord(moonPhase(moonNow - 1).energy), null)}
          meaning={moonMeaning(lunar.phase.energy)}
        >
          {children}
        </Block>

        <Block
          ring="week"
          colour={weekText}
          label={`${fmt("village.clock.week", "Week")} · ${dayOfWeek.day.name}, ${dayOfWeek.day.planet}`}
          symbol={<PlanetSymbol planet={dayOfWeek.day.planet} size={26} />}
          word={dayWord}
          around={aroundText(phaseWord(weekDay(weekNow - 1).energy), phaseWord(weekDay(weekNow + 1).energy), weekWhen)}
          meaning={dayOfWeek.day.description}
        />

        {/* Year: only for a player who has a birthday, or a signed-in one who can add it. A guest has no year, so no
            «YOUR YEAR» header over nothing (v6.3 item 3); the empty year track on the dial still shows. */}
        {expanded && (hasBirthday || (!birthdayLoading && !!onAskBirthday)) && (
          hasBirthday ? (
            <Block
              ring="year"
              colour="rgb(217, 209, 180)"
              label={`${fmt("village.clock.year", "Your year")} · ${fmt("village.clock.fromBirthday", "From your birthday")}`}
              timeLeft={birthdayIn ? fmt("village.clock.toBirthday", "{{days}} days to {{date}}", { days: birthdayIn.days, date: birthdayIn.label }) : undefined}
              symbol={<span className="bio-clock__year-mark" />}
              word={yearName}
              around={aroundText(season(seasonNow - 1).name, season(seasonNow + 1).name, yearWhen)}
              meaning={season(seasonNow).essence}
            />
          ) : (
            <Block
              ring="year"
              colour="rgb(217, 209, 180)"
              label={`${fmt("village.clock.year", "Your year")} · ${fmt("village.clock.fromBirthday", "From your birthday")}`}
              symbol={<span className="bio-clock__year-mark" />}
              word=""
              meaning={
                <button type="button" className="bio-clock__link" onClick={onAskBirthday}>{yearInvite}</button>
              }
            />
          )
        )}

        {/* Day: its own block under its own label (the same «DAY» as the gold ring), never under the year header. */}
        {expanded && (
          <Block
            ring="day"
            colour="rgb(242, 196, 107)"
            label={fmt("village.clock.dayRing", "Day")}
            symbol={null}
            word=""
          >
            {dayLeftLine}
          </Block>
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
