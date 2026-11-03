import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DIAL_SECTORS, beDoWord, moonDialNow, phaseLabel } from "@/lib/moonDial";
import { useMoonDialData } from "@/hooks/useMoonDialData";
import { tr } from "@/lib/villageCopy";
import "./MoonDial.css";

/**
 * MoonDial — the small Equilibrium watch on the village map (village-as-dashboard step 2).
 * A round dial of the eight phases (BE sectors filled, DO sectors open; tonight's sector lit
 * in moonlight), tonight's phase and BE/DO in the middle, and beside it two lines: Moon Focus
 * and the one HUMAN DO NOW, both the player's own (useMoonDialData). A guest or an empty
 * Equilibrium sees tonight's real phase and one invitation, never sample data.
 */

const R_OUT = 46;
const R_IN = 30;
const C = 50;

const polar = (r: number, turn: number) => {
  const a = turn * 2 * Math.PI - Math.PI / 2; // 0 = top, clockwise
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
};

/** One ring sector as an SVG path, `i` of 8, with a hairline gap between sectors. */
const sectorPath = (i: number) => {
  const gap = 0.006;
  const a0 = i / 8 + gap;
  const a1 = (i + 1) / 8 - gap;
  const [x0, y0] = polar(R_OUT, a0);
  const [x1, y1] = polar(R_OUT, a1);
  const [x2, y2] = polar(R_IN, a1);
  const [x3, y3] = polar(R_IN, a0);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${R_OUT} ${R_OUT} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)} A${R_IN} ${R_IN} 0 0 0 ${x3.toFixed(2)} ${y3.toFixed(2)} Z`;
};

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
  const bd = beDoWord(current.beDo, t);
  const empty = data.status === "ready" && !data.moonFocus && !data.doNow;

  return (
    <aside className={`moon-dial${className ? ` ${className}` : ""}`} aria-label={tr(t, "village.dial.aria", "Moon dial: tonight in Equilibrium")}>
      <svg className="moon-dial__svg" viewBox="0 0 100 100" role="img" aria-label={`${phase} · ${bd}`}>
        {DIAL_SECTORS.map((s, i) => (
          <path
            key={s.name}
            d={sectorPath(i)}
            className={`moon-dial__sector moon-dial__sector--${s.beDo}${s.position === now.position ? " is-now" : ""}`}
          >
            <title>{`${phaseLabel(s, t)} · ${beDoWord(s.beDo, t)}`}</title>
          </path>
        ))}
        <text x="50" y="50" className="moon-dial__bedo" textAnchor="middle" dominantBaseline="central">{bd}</text>
      </svg>
      <div className="moon-dial__copy">
        <p className="moon-dial__phase">{phase}</p>
        {data.status === "guest" ? (
          <p className="moon-dial__line moon-dial__invite">
            <Link to="/auth?redirect=%2Fvillage">
              {tr(t, "village.dial.signIn", "Sign in to see your Moon Focus and Do now")}
            </Link>
          </p>
        ) : null}
        {data.status === "ready" && !empty ? (
          <>
            <p className="moon-dial__line">
              <span className="moon-dial__label">{tr(t, "village.dial.focus", "Moon Focus")}</span>
              <span className="moon-dial__value">{data.moonFocus ?? tr(t, "village.dial.notSet", "not set yet")}</span>
            </p>
            <p className="moon-dial__line">
              <span className="moon-dial__label">{tr(t, "village.dial.doNow", "Do now")}</span>
              <span className="moon-dial__value">{data.doNow ?? tr(t, "village.dial.nothingChosen", "nothing chosen")}</span>
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
