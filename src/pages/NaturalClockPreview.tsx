import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { NaturalClockStrip } from "@/modules/equilibrium/naturalClock/NaturalClockStrip";
import { NaturalClockFace } from "@/modules/equilibrium/naturalClock/NaturalClockFace";
import { NaturalClockDialog } from "@/modules/equilibrium/naturalClock/NaturalClockDialog";
import { CLOCK_INK, CLOCK_MONO, CLOCK_SERIF, CLOCK_TEAL } from "@/modules/equilibrium/naturalClock/NaturalClockMoon";
import { useNaturalClock } from "@/modules/equilibrium/naturalClock/useNaturalClock";
import { useNaturalSky } from "@/modules/equilibrium/naturalClock/useNaturalSky";
import { useStoredBirthday } from "@/modules/equilibrium/naturalClock/useStoredBirthday";
import { parseBirthdayParts } from "@/modules/equilibrium/naturalClock/solarBattery";
import { parseBirthdate } from "@/modules/equilibrium/lib/parseBirthdate";
import type { GeoPoint } from "@/modules/equilibrium/naturalClock/sunLight";

/**
 * Natural Clock preview · /preview/natural-clock (issue #284)
 *
 * The compact strip and the full face, on the sky they set. Ungated like the
 * other /preview/* routes; nothing here writes to the database.
 *
 * Query params, for review and screenshots:
 *   ?now=2026-11-05T17:30   freeze the clock at a local time
 *   ?lat=51.5&lon=0         place the sun (otherwise device location if already
 *                           granted, else the timezone)
 *   ?birthday=1990-03-25    set the birthday without signing in
 *
 * Production strip: the same strip mounts on Home, Village and Equilibrium
 * behind `?mdls=1` (see NaturalClockStripGate).
 */

const PREVIEW_BIRTHDAY_KEY = "natural_clock_preview_birthday";

const readStoredPreviewBirthday = (): string => {
  try {
    return window.localStorage.getItem(PREVIEW_BIRTHDAY_KEY) ?? "";
  } catch {
    return "";
  }
};

const NaturalClockPreview = () => {
  const [params] = useSearchParams();
  const [mountMs] = useState(() => Date.now());
  const [offsetMin, setOffsetMin] = useState(0);
  const [open, setOpen] = useState(false);
  const stored = useStoredBirthday();
  const [typed, setTyped] = useState(() => params.get("birthday") ?? readStoredPreviewBirthday());

  const nowParam = params.get("now");
  const frozenNow = useMemo(() => {
    const parsed = nowParam ? new Date(nowParam).getTime() : NaN;
    const base = Number.isFinite(parsed) ? parsed : null;
    if (base === null && offsetMin === 0) return undefined;
    return new Date((base ?? mountMs) + offsetMin * 60_000);
  }, [nowParam, offsetMin, mountMs]);

  const latParam = params.get("lat");
  const lonParam = params.get("lon");
  const geoOverride = useMemo<GeoPoint | undefined>(() => {
    const lat = latParam === null ? NaN : Number(latParam);
    const lon = lonParam === null ? NaN : Number(lonParam);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return undefined;
    }
    return { lat, lon, source: "device" };
  }, [latParam, lonParam]);

  const typedBirthday = useMemo(() => {
    const t = typed.trim();
    if (parseBirthdayParts(t)) return t;
    return parseBirthdate(t);
  }, [typed]);
  const birthday = typedBirthday ?? stored.birthday;

  const { clock, locationStatus, requestLocation } = useNaturalClock(birthday, {
    now: frozenNow,
    geo: geoOverride,
  });
  useNaturalSky(clock.sky, true);

  const onTyped = useCallback((value: string) => {
    setTyped(value);
    try {
      window.localStorage.setItem(PREVIEW_BIRTHDAY_KEY, value);
    } catch {
      /* private mode: the field still works for this visit */
    }
  }, []);

  const offsetLabel =
    offsetMin === 0
      ? "now"
      : `${offsetMin > 0 ? "+" : "−"}${Math.floor(Math.abs(offsetMin) / 60)}h${
          Math.abs(offsetMin) % 60 ? ` ${Math.abs(offsetMin) % 60}m` : ""
        }`;

  return (
    <main
      className="min-h-screen px-4 pb-16 pt-6"
      style={{
        background: `linear-gradient(180deg, ${clock.sky.top} 0%, ${clock.sky.bottom} 100%)`,
        color: CLOCK_INK,
        fontFamily: CLOCK_MONO,
      }}
    >
      <div className="mx-auto w-full max-w-[420px]">
        <header className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(230,235,242,0.6)" }}>
            Preview · Equilibrium
          </p>
          <h1 className="mt-1 text-4xl" style={{ fontFamily: CLOCK_SERIF, fontWeight: 500 }}>
            Natural Clock
          </h1>
        </header>

        <NaturalClockStrip clock={clock} onOpen={() => setOpen(true)} onAskBirthday={() => document.getElementById("nc-birthday")?.focus()} />

        <div className="mt-8">
          <NaturalClockFace
            clock={clock}
            locationStatus={locationStatus}
            onRequestLocation={requestLocation}
          />
        </div>

        <section
          aria-label="Preview controls"
          className="mt-8 rounded-2xl p-4"
          style={{ background: "rgba(14, 20, 28, 0.62)", border: "1px solid rgba(230, 235, 242, 0.14)" }}
        >
          <label className="block text-[11px] uppercase tracking-[0.14em]" htmlFor="nc-time">
            Time travel · <span style={{ color: CLOCK_TEAL }}>{offsetLabel}</span>
          </label>
          <input
            id="nc-time"
            type="range"
            min={-720}
            max={720}
            step={30}
            value={offsetMin}
            onChange={(e) => setOffsetMin(Number(e.target.value))}
            className="mt-2 w-full accent-[#5ec8bd]"
          />
          <button
            type="button"
            onClick={() => setOffsetMin(0)}
            className="mt-1 text-[11px] underline underline-offset-4"
            style={{ color: "rgba(230,235,242,0.7)" }}
          >
            Back to now
          </button>

          <label className="mt-4 block text-[11px] uppercase tracking-[0.14em]" htmlFor="nc-birthday">
            Birthday (preview only, stays on this device)
          </label>
          <input
            id="nc-birthday"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="YYYY-MM-DD"
            value={typed}
            onChange={(e) => onTyped(e.target.value)}
            className="mt-2 w-full rounded-xl bg-transparent px-3 py-3 text-[13px] outline-none focus:border-[#5ec8bd]"
            style={{ border: "1px solid rgba(230, 235, 242, 0.25)", color: CLOCK_INK }}
          />
          <p className="mt-2 text-[11px]" style={{ color: "rgba(230,235,242,0.6)" }}>
            {typedBirthday
              ? "Birthday read."
              : stored.birthday
                ? "Using the birthday saved on your account."
                : "Type or paste a date, or add ?birthday=1990-03-25 to the link."}
          </p>
        </section>
      </div>

      {open && (
        <NaturalClockDialog
          clock={clock}
          locationStatus={locationStatus}
          onRequestLocation={requestLocation}
          onClose={() => setOpen(false)}
        />
      )}
    </main>
  );
};

export default NaturalClockPreview;
