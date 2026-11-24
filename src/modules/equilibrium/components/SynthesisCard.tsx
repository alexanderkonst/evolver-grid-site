import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  getBirthdayArcPhase,
  type AllCyclesV2,
} from "@/lib/equilibrium-cycles";

interface SynthesisCardProps {
  /** Live cycle state — passed as part of the regenerate payload. */
  cycles: AllCyclesV2;
  /** Optional context layered into the prompt. */
  mission: string | null;
  role: string | null;
  moonFocus: string | null;
  /** Cached reading from equilibrium_state (last_synthesis_text). */
  cachedReading: string | null;
  cachedAt: string | null;
  /** Persist new reading + timestamp to equilibrium_state. */
  onPersist: (text: string, at: string) => Promise<void> | void;
  /** Disable interaction while initial load is in flight. */
  disabled?: boolean;
}

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

/**
 * Box 1 — Synthesis Reading.
 *
 * Shows the cached reading. Generation is USER-INITIATED ONLY: the button is
 * the sole trigger (no mount auto-fire, no keyboard shortcut) because it calls
 * the paid `generate-equilibrium-v2-synthesis` edge function (#415).
 * Pulse-breath on the button when the cache is missing or > 4 hours old.
 *
 * Edge function returns `{ reading: string }`. Falls back to deterministic
 * cycle-math sentence on error.
 */
export const SynthesisCard = ({
  cycles,
  mission,
  role,
  moonFocus,
  cachedReading,
  cachedAt,
  onPersist,
  disabled,
}: SynthesisCardProps) => {
  const [reading, setReading] = useState<string | null>(cachedReading);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Sync local state when cache updates from upstream.
  useEffect(() => {
    if (cachedReading !== null) setReading(cachedReading);
  }, [cachedReading]);

  const isStale = (): boolean => {
    if (!cachedAt) return true;
    const ageMs = Date.now() - new Date(cachedAt).getTime();
    return ageMs > FOUR_HOURS_MS;
  };

  const deterministicFallback = (): string => {
    const phase = cycles.lunar.holonicPhase.label.toLowerCase();
    const day = cycles.dayOfWeek.day.energy.toLowerCase();
    const moon = cycles.lunar.phase.name.toLowerCase();
    return `${phase} energy — ${day}, ${moon}.`;
  };

  const regenerate = async () => {
    if (loading || disabled) return;
    setLoading(true);
    setError(false);

    // Solar phase is the BIRTHDAY-ANCHORED arc phase (Sasha 2026-05-16
    // round 8: previously this sent `currentLabel` which is the
    // CALENDAR-anchored season name like "Early Spring" — stale leak
    // since the surface uses birthday-arc phases instead). Send what
    // the user actually sees on the watch.
    const birthdayArcPhase = getBirthdayArcPhase(cycles.solar.personalProgress);
    const payload = {
      cycles: {
        solar: {
          // Birthday-arc phase (Fresh start · Big push · Steady stretch ·
          // Harvest time · Wind down) — the user's PERSONAL solar year.
          phase: birthdayArcPhase,
          personalYearProgress: cycles.solar.personalProgress,
        },
        zodiac: {
          sign: cycles.zodiac.current.sign,
          progress: cycles.zodiac.progress,
          quality: cycles.zodiac.current.energy,
        },
        lunar: {
          // Astronomical name (New Moon, Waxing Crescent, etc.) — useful
          // for the model to know which phase, but the prompt forbids
          // echoing back; it must translate to activity-type.
          phaseName: cycles.lunar.phase.name,
          // The activity-type line ("Clearing · Release fear · ..."): this
          // is what the model should TRANSLATE INTO concrete language,
          // not echo back.
          phaseActivities: cycles.lunar.phase.energy,
          dayInCycle: cycles.lunar.day,
          holonicQuadrant: cycles.lunar.holonicPhase.label,
        },
        dayOfWeek: {
          name: cycles.dayOfWeek.day.name,
          // Quality ("Action & Courage", "Clarity & Communication"): the
          // model uses this as the day's flavor.
          quality: cycles.dayOfWeek.day.energy,
        },
      },
      context: { mission, role, moonFocus },
    };

    try {
      const { data, error: invokeError } = await supabase.functions.invoke<{
        reading: string;
      }>("generate-equilibrium-v2-synthesis", { body: payload });

      if (invokeError || !data?.reading) {
        throw invokeError ?? new Error("no reading in response");
      }
      const nowIso = new Date().toISOString();
      setReading(data.reading);
      await onPersist(data.reading, nowIso);
    } catch (err) {
      console.warn("[equilibrium_v2] synthesis fetch failed; using fallback", err);
      const fallback = deterministicFallback();
      const nowIso = new Date().toISOString();
      setReading(fallback);
      setError(true);
      await onPersist(fallback, nowIso);
    } finally {
      setLoading(false);
    }
  };

  const showPulse = !loading && (!cachedAt || isStale());
  const buttonLabel = loading
    ? "Reading the moment…"
    : reading
      ? "Refresh reading"
      : "Generate reading";

  return (
    <div aria-live="polite" className="relative mt-2 w-full rounded-2xl px-2 py-4 text-left">
      <p
        className={cn(
          "eq-text-halo font-serif text-xl font-medium leading-relaxed text-[#0a1628] sm:text-2xl",
          loading && "opacity-60",
        )}
      >
        {reading ?? (
          <span className="text-[#0a1628]/95 italic">
            {loading ? "reading the moment…" : "No reading yet — generate one when you want it."}
          </span>
        )}
      </p>

      <button
        type="button"
        onClick={regenerate}
        disabled={disabled || loading}
        className={cn(
          "mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#0a1628]",
          "bg-white/40 transition hover:bg-white/60 focus:bg-white/60 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
          showPulse && "eq-synth-pulse",
        )}
      >
        <RotateCcw size={16} className={cn("shrink-0", loading && "animate-spin")} />
        {buttonLabel}
      </button>

      {error && (
        <p className="mt-2 flex items-center justify-between text-xs italic text-[#0a1628]/85">
          <span>fallback reading — synthesis unavailable</span>
          <span className="not-italic text-[#0a1628]/95">tap refresh to retry</span>
        </p>
      )}
    </div>
  );
};

export default SynthesisCard;
