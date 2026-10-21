/**
 * Parses a typed or pasted birthdate into YYYY-MM-DD.
 *
 * Accepts:
 *   - 1990-03-25 (also 1990/03/25, 1990.03.25)
 *   - 25.03.1990, 25-03-1990, 25/03/1990 (day first)
 *   - 03/25/1990 (month first, only when the day can't be a month)
 * Returns null for anything ambiguous (e.g. 03/04/1990), out of range, a
 * non-existent calendar date, or in the future.
 */
export function parseBirthdate(
  input: string,
  now: Date = new Date(),
): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let y: number;
  let m: number;
  let d: number;

  const iso = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  const dmy = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (iso) {
    y = +iso[1];
    m = +iso[2];
    d = +iso[3];
  } else if (dmy) {
    const a = +dmy[1];
    const b = +dmy[2];
    y = +dmy[3];
    if (a > 12 && b <= 12) {
      d = a;
      m = b;
    } else if (b > 12 && a <= 12) {
      m = a;
      d = b;
    } else if (raw.includes(".")) {
      // Dotted dates are day-first by convention.
      d = a;
      m = b;
    } else {
      return null;
    }
  } else {
    return null;
  }

  if (y < 1900 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  if (date.getTime() > now.getTime()) return null;

  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
