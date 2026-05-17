import { useEffect, useRef, useState } from "react";
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
 * Tap to regenerate. Calls `generate-equilibrium-v2-synthesis` edge function.
 * Auto-regenerates once per session if cached reading is missing OR > 4 hours old.
 * Pulse-breath when stale (per Phase 3.5).
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
  const autoFiredRef = useRef(false);

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

  // Auto-regenerate on first mount if cache is stale or missing.
  useEffect(() => {
    if (autoFiredRef.current) return;
    if (disabled) return;
    if (!reading || isStale()) {
      autoFiredRef.current = true;
      void regenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  // Keyboard shortcut: press `r` (when no input/textarea is focused) to
  // regenerate the synthesis reading. Phase 3.9 Nielsen #7 polish.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "r" && e.key !== "R") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      e.preventDefault();
      void regenerate();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const showPulse = !loading && (!cachedAt || isStale());

  return (
    <button
      type="button"
      onClick={regenerate}
      disabled={disabled}
      aria-live="polite"
      aria-label="Synthesis reading. Tap to regenerate."
      className={cn(
        "group relative mt-2 w-full rounded-2xl px-2 py-4 text-left transition",
        "hover:bg-white/20 focus:outline-none focus:bg-white/20",
        showPulse && "eq-synth-pulse",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "eq-text-halo flex-1 font-serif text-xl font-medium leading-relaxed text-[#0a1628] sm:text-2xl",
            loading && "opacity-60",
          )}
        >
          {reading ?? (
            <span className="text-[#0a1628]/95 italic">
              {loading ? "reading the moment…" : "tap to read"}
            </span>
          )}
        </span>
        <RotateCcw
          size={18}
          className={cn(
            "mt-2 shrink-0 text-[#0a1628]/95 transition group-hover:text-[#0a1628]/90",
            loading && "animate-spin",
          )}
        />
      </div>

      {error && (
        <p className="mt-2 flex items-center justify-between text-xs italic text-[#0a1628]/85">
          <span>fallback reading — synthesis unavailable</span>
          <span
            aria-hidden="true"
            className="not-italic font-mono text-[10px] text-[#0a1628]/95"
          >
            press R to retry
          </span>
        </p>
      )}
    </button>
  );
};

export default SynthesisCard;
