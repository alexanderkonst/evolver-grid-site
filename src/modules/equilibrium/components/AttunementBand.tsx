import {
  ZODIAC_SIGNS,
  type AllCyclesV2,
  type HolonicElement,
} from "@/lib/equilibrium-cycles";
import { SECTION_IDS } from "../types";

interface AttunementBandProps {
  cycles: AllCyclesV2;
  /**
   * Called when the user taps any pip — flips the watch into ACT + ATTUNE
   * mode and (after the new sections render) scrolls to the requested
   * section. The page hooks the scroll-to-section logic on the other side
   * of the mode flip via a setTimeout, since the section only mounts
   * after the mode state updates.
   */
  onExpand: (sectionId: string) => void;
}

/** Element → emoji (matches HOLONIC_PHASES.elementEmoji). */
const ELEMENT_EMOJI: Record<HolonicElement, string> = {
  Fire: "🔥",
  Water: "💧",
  Earth: "🌍",
  Air: "🌬️",
};

/**
 * AttunementBand — a thin compressed-attunement strip rendered between
 * the Synthesis Reading and the Lunar section in ACT MODE only.
 *
 * Philosophical purpose (spine §11): ACT and ATTUNE are inseparable —
 * masculine and feminine of one biologic instrument. The Synthesis is the
 * meeting point (compresses all 4 cycles into one sentence). The band
 * makes the OTHER cycles — solar, zodiac, weekday — glanceable in
 * compressed form even when the user is in ACT mode, without bringing
 * their full sections into the daily-glance scroll.
 *
 * Each pip is a tap-to-expand affordance: flips the watch to ACT +
 * ATTUNE mode and scrolls the relevant section into view.
 *
 * Hidden in ACT + ATTUNE mode (the full sections take over).
 */
export const AttunementBand = ({ cycles, onExpand }: AttunementBandProps) => {
  const zodiacInfo = ZODIAC_SIGNS[cycles.zodiac.segmentIndex];
  const zodiacElementEmoji =
    ELEMENT_EMOJI[zodiacInfo.element as HolonicElement] ?? "·";
  const weekday = cycles.dayOfWeek.day;
  const solarPhase = cycles.solar.birthdayArcPhase;

  return (
    <div className="flex justify-center">
      <div
        className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 sm:gap-3"
        aria-label="Compressed attunement — tap any indicator to expand into full sections"
      >
        <Pip
          icon="☀"
          text={solarPhase}
          title={`Personal solar year: ${solarPhase}. Tap to expand.`}
          onClick={() => onExpand(SECTION_IDS.solar)}
        />
        <Sep />
        <Pip
          icon={zodiacInfo.symbol}
          text={zodiacElementEmoji}
          title={`Zodiac: ${zodiacInfo.sign} — ${zodiacInfo.element}. Tap to expand.`}
          onClick={() => onExpand(SECTION_IDS.zodiac)}
        />
        <Sep />
        <Pip
          icon={weekday.emoji}
          text={weekday.name}
          title={`${weekday.name} — ${weekday.planet}'s day (${weekday.energy}). Tap to expand.`}
          onClick={() => onExpand(SECTION_IDS.dayOfWeek)}
        />
      </div>
    </div>
  );
};

const Pip = ({
  icon,
  text,
  title,
  onClick,
}: {
  icon: string;
  text: string;
  title: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="eq-text-halo flex items-center gap-1 rounded-full px-1 py-0.5 text-xs font-medium text-[#0a1628]/85 transition hover:text-[#0a1628]"
  >
    <span className="text-sm leading-none">{icon}</span>
    <span className="whitespace-nowrap">{text}</span>
  </button>
);

const Sep = () => (
  <span aria-hidden="true" className="text-[#0a1628]/30">
    ·
  </span>
);

export default AttunementBand;
