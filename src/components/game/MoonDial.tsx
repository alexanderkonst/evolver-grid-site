import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BiologicClock from "@/components/game/BiologicClock";
import { useMoonDialData } from "@/hooks/useMoonDialData";
import { tr } from "@/lib/villageCopy";
import "./MoonDial.css";

/**
 * MoonDial — the Equilibrium watch on the village map (village-as-dashboard step 2; #385). A compact
 * BiologicClock in the top-right corner of the map frame (the Village mounts it inside `vl-frame`):
 * view 1 is the dial alone; views 2–3 drop a card from it over the map. The player's own Moon Focus
 * (useMoonDialData) is part of that card (view 2 onward), so nothing runs under the place labels.
 * Do now is gone (PR #380): the clock shows cycles, never actions. A guest or an empty Equilibrium
 * sees the real clock and one invitation, never sample data.
 */

export const MoonDial = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const data = useMoonDialData();
  const empty = data.status === "ready" && !data.moonFocus;

  const copy = data.status === "guest" ? (
    <p className="moon-dial__line moon-dial__invite">
      <Link to="/auth?redirect=%2Fvillage">
        {tr(t, "village.dial.signIn", "Sign in to see your Moon Focus")}
      </Link>
    </p>
  ) : empty ? (
    <p className="moon-dial__line moon-dial__invite">
      <Link to="/build/equilibrium">
        {tr(t, "village.dial.setUp", "Name your Moon Focus in Equilibrium")}
      </Link>
    </p>
  ) : data.status === "ready" ? (
    <p className="moon-dial__line">
      <span className="moon-dial__label">{tr(t, "village.dial.focus", "Moon Focus")}</span>
      <span className="moon-dial__value">{data.moonFocus ?? tr(t, "village.dial.notSet", "not set yet")}</span>
    </p>
  ) : null;

  return (
    <aside className={`moon-dial${className ? ` ${className}` : ""}`} aria-label={tr(t, "village.dial.aria", "Moon dial: tonight in Equilibrium")}>
      <BiologicClock className="moon-dial__clock" placement="card">{copy}</BiologicClock>
    </aside>
  );
};

export default MoonDial;
