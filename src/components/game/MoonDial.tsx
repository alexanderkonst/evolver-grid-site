import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { moonDialNow, phaseLabel } from "@/lib/moonDial";
import BiologicClock from "@/components/game/BiologicClock";
import { useMoonDialData } from "@/hooks/useMoonDialData";
import { tr } from "@/lib/villageCopy";
import "./MoonDial.css";

/**
 * MoonDial — the small Equilibrium watch on the village map (village-as-dashboard step 2).
 * The dial itself is the BiologicClock (issue #377: four rings Year · Moon · Week · Day, tonight's
 * moon in the centre; it replaced the old eight-sector SVG, one clock on the screen). Beside it
 * stays the copy block: tonight's phase and the player's own Moon Focus (useMoonDialData). Do now
 * was removed from the village dial on Sasha's call (2026-11-22). A guest or an empty Equilibrium sees tonight's real phase and one
 * invitation, never sample data.
 */

const useDialNow = () => {
  const [now, setNow] = useState(() => moonDialNow());
  useEffect(() => {
    const id = window.setInterval(() => setNow(moonDialNow()), 10 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
};

export const MoonDial = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const now = useDialNow();
  const data = useMoonDialData();
  const current = now.sector;
  const phase = phaseLabel(current, t);
  const empty = data.status === "ready" && !data.moonFocus;

  return (
    <aside className={`moon-dial${className ? ` ${className}` : ""}`} aria-label={tr(t, "village.dial.aria", "Moon dial: tonight in Equilibrium")}>
      <BiologicClock className="moon-dial__clock" />
      <div className="moon-dial__copy">
        <p className="moon-dial__phase">{phase}</p>
        {data.status === "guest" ? (
          <p className="moon-dial__line moon-dial__invite">
            <Link to="/auth?redirect=%2Fvillage">
              {tr(t, "village.dial.signIn", "Sign in to see your Moon Focus")}
            </Link>
          </p>
        ) : null}
        {data.status === "ready" && !empty ? (
          <>
            <p className="moon-dial__line">
              <span className="moon-dial__label">{tr(t, "village.dial.focus", "Moon Focus")}</span>
              <span className="moon-dial__value">{data.moonFocus ?? tr(t, "village.dial.notSet", "not set yet")}</span>
            </p>
          </>
        ) : null}
        {empty ? (
          <p className="moon-dial__line moon-dial__invite">
            <Link to="/build/equilibrium">
              {tr(t, "village.dial.setUp", "Name your Moon Focus in Equilibrium")}
            </Link>
          </p>
        ) : null}
      </div>
    </aside>
  );
};

export default MoonDial;
