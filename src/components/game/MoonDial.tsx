import { useTranslation } from "react-i18next";
import BiologicClock from "@/components/game/BiologicClock";
import MoonFocusLine from "@/components/game/MoonFocusLine";
import { tr } from "@/lib/villageCopy";
import "./MoonDial.css";

/**
 * MoonDial — the Equilibrium watch on the village map (village-as-dashboard step 2; #385, #405). A
 * compact BiologicClock in the top-right corner of the map frame (the Village mounts it inside
 * `vl-frame`): view 1 is the dial alone; views 2–3 drop a card (≤ 340 px) from it over the map. The
 * player's own Moon Focus is under the Moon block of that card, so nothing runs under the place
 * labels. Do now is gone (PR #380): the clock shows cycles, never actions. The view is remembered
 * for the village separately from the profile.
 */

export const MoonDial = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  return (
    <aside className={`moon-dial${className ? ` ${className}` : ""}`} aria-label={tr(t, "village.dial.aria", "Moon dial: tonight in Equilibrium")}>
      <BiologicClock className="moon-dial__clock" placement="card" place="village">
        <MoonFocusLine redirect="/village" />
      </BiologicClock>
    </aside>
  );
};

export default MoonDial;
