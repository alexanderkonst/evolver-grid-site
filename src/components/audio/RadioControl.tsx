/**
 * RadioControl — the small village radio: Play / Pause, volume, station name, credit line.
 * A thin consumer of RadioProvider (the engine lives there and survives route changes).
 *
 * Shown only on the village and the game screens (`isRadioRoute`); never on the title screen,
 * the intro or the Top Talent reveal. It sits in the bottom-right corner, stacked above the chat
 * launcher, and follows the skin through the same `--chat-*` tokens.
 */

import { Loader2, Pause, Play } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRadio } from "@/components/audio/RadioProvider";
import { radioCreditLine } from "@/data/radioStations";
import { isRadioRoute } from "@/lib/radio";

const RadioControl = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const radio = useRadio();
  if (!radio || !radio.station || !isRadioRoute(pathname)) return null;

  const { station, status, volume, volumeSettable, toggle, setVolume } = radio;
  const on = status === "playing" || status === "loading";
  const label = on
    ? t("radio.pause", { name: station.name, defaultValue: "Pause {{name}}" })
    : t("radio.play", { name: station.name, defaultValue: "Play {{name}}" });
  const note =
    status === "offline"
      ? t("radio.offline", { defaultValue: "Radio is offline right now" })
      : status === "loading"
        ? t("radio.connecting", { defaultValue: "Tuning in…" })
        : null;

  return (
    <aside
      aria-label={t("radio.aria", { defaultValue: "Village radio" })}
      data-radio-status={status}
      className="fixed right-3 z-[64] flex w-[min(17rem,calc(100vw-1.5rem))] flex-col gap-1.5 rounded-2xl border border-[color:var(--chat-border)] bg-[color:var(--chat-bg)] px-3 py-2.5 text-[color:var(--chat-ink)] shadow-[0_12px_40px_rgba(var(--chat-shadow-rgb),0.42)] backdrop-blur-xl bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+3.75rem)] sm:right-6 sm:bottom-[calc(1.5rem+4rem)]"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={label}
          aria-pressed={on}
          className="flex h-10 w-10 min-h-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--chat-border)] text-[color:var(--chat-accent)] transition hover:border-[color:var(--chat-border-hover)] hover:bg-[color:var(--chat-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--chat-ring)]"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : status === "playing" ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-[13px] font-medium tracking-[0.02em]">{station.name}</p>
          {volumeSettable ? (
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label={t("radio.volume", { defaultValue: "Radio volume" })}
              className="mt-1 h-4 w-full cursor-pointer accent-[color:var(--chat-accent)]"
            />
          ) : null}
        </div>
      </div>
      {/* Always in the DOM so a screen reader hears the status change. */}
      <p role="status" className="min-h-[1rem] font-sans text-[12px] leading-4 opacity-80">
        {note}
      </p>
      <a
        href={station.homepageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans text-[11px] leading-4 tracking-[0.02em] underline decoration-[color:var(--chat-border)] underline-offset-2 opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--chat-ring)]"
      >
        {radioCreditLine(station)}
      </a>
    </aside>
  );
};

export default RadioControl;
