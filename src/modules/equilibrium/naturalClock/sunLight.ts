/**
 * Natural Clock · clock 1 — Day = sunlight.
 *
 * Pure sun math: where the sun is for a place and a moment, which of the
 * light states that is, and a sky palette that follows it. No imports, no
 * network, no paid API.
 *
 * Why not the `suncalc` package (issue #284 asked for it): it is not in the
 * lockfile and the build environment could not install packages, so adding it
 * would have left package.json and package-lock.json out of sync. The formulas
 * below are the same low-precision solar coordinates suncalc uses
 * (Vladimir Agafonkin's suncalc, MIT, after Meeus / the Astronomy Answers
 * sun position). Accuracy is ~1 minute of sunrise/sunset, which is far finer
 * than a six-word light label needs. Swapping to the package later touches
 * only `sunPosition()`.
 *
 * Privacy: latitude / longitude stay in the browser. Nothing here sends them
 * anywhere.
 */

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
const J1970 = 2440588;
const J2000 = 2451545;
/** Earth's axial tilt, radians. */
const OBLIQUITY = RAD * 23.4397;

/** Sun-centre altitude of sunrise / sunset, degrees (disc edge + refraction). */
export const HORIZON_DEG = -0.833;
/** Civil twilight: the sky is dark below this. */
export const CIVIL_TWILIGHT_DEG = -6;
/** Golden hour: low warm light, the sun below this altitude. */
export const GOLDEN_HOUR_DEG = 6;
/** Zenith: the sun is in the top slice of the day's own climb. */
export const ZENITH_SHARE = 0.8;

export type LightState =
  | "Dawn"
  | "Morning"
  | "Zenith"
  | "Afternoon"
  | "Golden hour"
  | "Dusk"
  | "Night";

export interface GeoPoint {
  /** Degrees north. */
  lat: number;
  /** Degrees east. */
  lon: number;
  /** Where the point came from, so the UI can say "approximate". */
  source: "device" | "timezone";
}

export interface SunPosition {
  /** Degrees above the horizon (negative = below). */
  altitudeDeg: number;
  /** Hour angle in radians, −π…π. 0 at solar noon, negative in the morning. */
  hourAngle: number;
  /** Sun declination, degrees. */
  declinationDeg: number;
}

const toDays = (ms: number): number => ms / DAY_MS - 0.5 + J1970 - J2000;

/** Wraps an angle to (−π, π]. */
const wrapPi = (a: number): number => {
  const twoPi = 2 * Math.PI;
  return ((((a + Math.PI) % twoPi) + twoPi) % twoPi) - Math.PI;
};

export function sunPosition(ms: number, lat: number, lon: number): SunPosition {
  const d = toDays(ms);
  const M = RAD * (357.5291 + 0.98560028 * d);
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const L = M + C + RAD * 102.9372 + Math.PI;
  const dec = Math.asin(Math.sin(OBLIQUITY) * Math.sin(L));
  const ra = Math.atan2(Math.sin(L) * Math.cos(OBLIQUITY), Math.cos(L));

  const phi = RAD * lat;
  const sidereal = RAD * (280.16 + 360.9856235 * d) + RAD * lon;
  const H = wrapPi(sidereal - ra);
  const alt = Math.asin(
    Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H),
  );
  return { altitudeDeg: alt / RAD, hourAngle: H, declinationDeg: dec / RAD };
}

export interface LightReading extends SunPosition {
  state: LightState;
  /** True before solar noon (the sun is climbing). */
  rising: boolean;
  /** The day's highest altitude at this latitude, degrees. */
  noonAltitudeDeg: number;
  /**
   * Half the length of daylight as an hour angle, radians: π = midnight sun,
   * 0 = polar night. The daylight arc of the dial runs −this…+this around noon.
   */
  daylightHalfArc: number;
}

/**
 * Half-day arc (radians of hour angle) during which the sun is above the
 * horizon, from the sunrise equation. Clamped for polar day / night.
 */
export function daylightHalfArc(latDeg: number, declinationDeg: number): number {
  const phi = RAD * latDeg;
  const dec = RAD * declinationDeg;
  const denom = Math.cos(phi) * Math.cos(dec);
  if (Math.abs(denom) < 1e-9) return 0;
  const cosH0 = (Math.sin(RAD * HORIZON_DEG) - Math.sin(phi) * Math.sin(dec)) / denom;
  if (cosH0 >= 1) return 0;
  if (cosH0 <= -1) return Math.PI;
  return Math.acos(cosH0);
}

/** Classifies a sun altitude into a light state. Pure, so it is easy to test. */
export function classifyLight(
  altitudeDeg: number,
  rising: boolean,
  noonAltitudeDeg: number,
): LightState {
  if (altitudeDeg < CIVIL_TWILIGHT_DEG) return "Night";
  if (altitudeDeg < HORIZON_DEG) return rising ? "Dawn" : "Dusk";
  if (altitudeDeg < GOLDEN_HOUR_DEG) return rising ? "Dawn" : "Golden hour";
  if (altitudeDeg >= ZENITH_SHARE * noonAltitudeDeg) return "Zenith";
  return rising ? "Morning" : "Afternoon";
}

export function getLight(ms: number, lat: number, lon: number): LightReading {
  const sun = sunPosition(ms, lat, lon);
  const rising = sun.hourAngle < 0;
  const noonAltitudeDeg = 90 - Math.abs(lat - sun.declinationDeg);
  return {
    ...sun,
    rising,
    noonAltitudeDeg,
    daylightHalfArc: daylightHalfArc(lat, sun.declinationDeg),
    state: classifyLight(sun.altitudeDeg, rising, noonAltitudeDeg),
  };
}

export function getLightState(ms: number, lat: number, lon: number): LightState {
  return getLight(ms, lat, lon).state;
}

// ─── Place from the device ────────────────────────────────────────────

/** IANA zone prefixes that sit in the southern hemisphere (coarse). */
const SOUTHERN_ZONES = [
  "Australia/",
  "Pacific/Auckland",
  "Pacific/Fiji",
  "America/Sao_Paulo",
  "America/Argentina/",
  "America/Santiago",
  "America/Lima",
  "America/Bogota", // near the equator; either side reads the same
  "Africa/Johannesburg",
  "Africa/Maputo",
  "Africa/Harare",
  "Africa/Windhoek",
  "Indian/Antananarivo",
];

/**
 * Fallback when the player has not shared location: longitude from the UTC
 * offset (15° per hour), latitude a mid-latitude guess by hemisphere. Good
 * enough to put dawn and dusk within about an hour of the truth; the UI says
 * "approximate" and offers the real thing.
 *
 * @param offsetMinutesWest `Date#getTimezoneOffset()` — minutes WEST of UTC.
 */
export function timezoneGeo(timeZone: string | undefined, offsetMinutesWest: number): GeoPoint {
  // `|| 0` turns −0 (UTC+0) into 0.
  const lon = Math.max(-180, Math.min(180, -offsetMinutesWest / 4)) || 0;
  const southern = !!timeZone && SOUTHERN_ZONES.some((z) => timeZone.startsWith(z));
  return { lat: southern ? -30 : 40, lon, source: "timezone" };
}

// ─── Sky palette ──────────────────────────────────────────────────────

interface SkyStop {
  alt: number;
  top: [number, number, number];
  bottom: [number, number, number];
}

/**
 * Sky stops by sun altitude. Cool moonlit silver-blue by day and night (the
 * Lunar world's register), with a restrained warm band at the horizon.
 */
const SKY_STOPS: SkyStop[] = [
  { alt: -12, top: [7, 10, 16], bottom: [12, 18, 26] },
  { alt: -6, top: [14, 22, 38], bottom: [38, 51, 79] },
  { alt: 0, top: [28, 45, 71], bottom: [124, 107, 100] },
  { alt: 6, top: [43, 69, 101], bottom: [152, 140, 128] },
  { alt: 25, top: [61, 97, 136], bottom: [159, 183, 207] },
  { alt: 60, top: [74, 115, 153], bottom: [180, 202, 221] },
];

const mix = (a: number, b: number, t: number): number => Math.round(a + (b - a) * t);

const hex = (c: [number, number, number]): string =>
  `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;

export interface SkyPalette {
  top: string;
  bottom: string;
}

/** Sky colours for a sun altitude; clamps beyond the first and last stop. */
export function skyPalette(altitudeDeg: number): SkyPalette {
  const first = SKY_STOPS[0];
  const last = SKY_STOPS[SKY_STOPS.length - 1];
  if (altitudeDeg <= first.alt) return { top: hex(first.top), bottom: hex(first.bottom) };
  if (altitudeDeg >= last.alt) return { top: hex(last.top), bottom: hex(last.bottom) };
  for (let i = 1; i < SKY_STOPS.length; i++) {
    const hi = SKY_STOPS[i];
    if (altitudeDeg <= hi.alt) {
      const lo = SKY_STOPS[i - 1];
      const t = (altitudeDeg - lo.alt) / (hi.alt - lo.alt);
      return {
        top: hex([mix(lo.top[0], hi.top[0], t), mix(lo.top[1], hi.top[1], t), mix(lo.top[2], hi.top[2], t)]),
        bottom: hex([
          mix(lo.bottom[0], hi.bottom[0], t),
          mix(lo.bottom[1], hi.bottom[1], t),
          mix(lo.bottom[2], hi.bottom[2], t),
        ]),
      };
    }
  }
  return { top: hex(last.top), bottom: hex(last.bottom) };
}
