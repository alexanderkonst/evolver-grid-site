import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { PresenceLight } from "@/hooks/useVillagePresence";

/**
 * PresenceLights — the other players who are here now (WP-21).
 *
 * One soft light each, in their soul / top-talent hue when it is known, else the
 * skin's accent. Never a number, never a list: the group is labelled «Others are
 * here» with no count. A first name appears as a quiet caption only for a player
 * who opted in (the hook never receives a name otherwise). A light is not a link,
 * not a button and not focusable, so no path leads from it to anyone's profile.
 * Reduced motion: static. Styles live in Village.css (.vl-presence).
 *
 * `scene` scatters the lights through a place; `pin` gathers them around its map dot.
 * Where a light sits comes from its session key, so it stays put when others come and go.
 */

type Props = {
  lights: PresenceLight[] | undefined;
  variant: "scene" | "pin";
};

/** Two stable fractions in [0, 1) from a session key (djb2 variant). */
const spot = (key: string): [number, number] => {
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = ((h * 33) ^ key.charCodeAt(i)) >>> 0;
  return [(h % 997) / 997, ((h >>> 10) % 991) / 991];
};

const place = (light: PresenceLight, variant: Props["variant"]): CSSProperties => {
  const [a, b] = spot(light.sessionKey);
  const style: Record<string, string | number> = {};
  if (variant === "scene") {
    // Lower-middle of the scene, clear of the particles above and the copy at the foot.
    style.left = `${8 + a * 84}%`;
    style.top = `${48 + b * 24}%`;
  } else {
    // A loose ring around the map dot.
    const angle = a * 2 * Math.PI;
    const radius = 18 + b * 14;
    style.left = `${Math.round(Math.cos(angle) * radius)}px`;
    style.top = `${Math.round(Math.sin(angle) * radius)}px`;
  }
  style["--vl-breath"] = `${(-a * 6).toFixed(2)}s`;
  if (light.hue !== null) style["--vl-light"] = `hsl(${light.hue} 62% 68%)`;
  return style as CSSProperties;
};

const PresenceLights = ({ lights, variant }: Props) => {
  const { t } = useTranslation();
  if (!lights || lights.length === 0) return null;
  return (
    <div
      className={`vl-presence vl-presence--${variant}`}
      role="group"
      aria-label={t("villagePresence.othersHere")}
    >
      {lights.map((light) => (
        <span key={light.sessionKey} className="vl-presence__light" style={place(light, variant)}>
          <span className="vl-presence__glow" aria-hidden="true" />
          {light.firstName && variant === "scene" ? (
            <span className="vl-presence__name">{light.firstName}</span>
          ) : null}
        </span>
      ))}
    </div>
  );
};

export default PresenceLights;
