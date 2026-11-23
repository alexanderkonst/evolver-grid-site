import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMoonDialData } from "@/hooks/useMoonDialData";
import { tr } from "@/lib/villageCopy";

/**
 * The player's own Moon Focus, one line for the Moon block of the clock card (village and profile).
 * A guest gets one invitation to sign in, an empty Equilibrium one invitation to name it; never
 * sample data. Styles: `.bio-clock__focus` in BiologicClock.css.
 */
export const MoonFocusLine = ({ redirect = "/village" }: { redirect?: string }) => {
  const { t } = useTranslation();
  const data = useMoonDialData();
  const empty = data.status === "ready" && !data.moonFocus;

  if (data.status === "guest") {
    return (
      <p className="bio-clock__focus bio-clock__focus--invite">
        <Link to={`/auth?redirect=${encodeURIComponent(redirect)}`}>
          {tr(t, "village.dial.signIn", "Sign in to see your Moon Focus")}
        </Link>
      </p>
    );
  }
  if (empty) {
    return (
      <p className="bio-clock__focus bio-clock__focus--invite">
        <Link to="/build/equilibrium">
          {tr(t, "village.dial.setUp", "Name your Moon Focus in Equilibrium")}
        </Link>
      </p>
    );
  }
  if (data.status === "ready") {
    return (
      <p className="bio-clock__focus">
        <span className="bio-clock__focus-label">{tr(t, "village.dial.focus", "Moon Focus")}</span>
        <span className="bio-clock__focus-value">{data.moonFocus ?? tr(t, "village.dial.notSet", "not set yet")}</span>
      </p>
    );
  }
  return null;
};

export default MoonFocusLine;
