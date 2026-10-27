import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FONTS_HREF } from "@/lib/gameFonts";
import {
  VILLAGE_MAP,
  VILLAGE_PLACES,
  getVillagePlace,
  type VillagePlace,
} from "@/data/villagePlaces";
import "./Village.css";

/**
 * Village — the Digital Village, the world players enter after the title screen.
 *
 * `/village` is the map, `/village/:place` a place scene; both live in one
 * component so the two layers can crossfade. Places and routes come from
 * src/data/villagePlaces.ts. Source of truth:
 * docs/02-strategy/game_of_being_you.md §13.1–§13.4 (no XP, no points, no levels).
 *
 * The map is public. ENTER on any place except the Gate sends a signed-out
 * player to /auth (same `?redirect=` contract as RequireAuth).
 */

type Direction = "left" | "right" | "up" | "down";

const GATE_INDEX = VILLAGE_PLACES.findIndex((p) => p.key === "gate");
const ASPECT = VILLAGE_MAP.width / VILLAGE_MAP.height;

/** Nearest place in a direction on the map; stays put when nothing lies that way. */
const neighbour = (from: number, dir: Direction): number => {
  const a = VILLAGE_PLACES[from];
  let best = from;
  let bestScore = Infinity;
  VILLAGE_PLACES.forEach((p, i) => {
    if (i === from) return;
    const dx = (p.x - a.x) * ASPECT;
    const dy = p.y - a.y;
    const along = dir === "right" ? dx : dir === "left" ? -dx : dir === "down" ? dy : -dy;
    const across = dir === "left" || dir === "right" ? dy : dx;
    if (along < 1) return;
    const score = along + 2 * Math.abs(across);
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return best;
};

const useIsMobile = () => {
  const query = "(max-width: 767px)";
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return mobile;
};

const Village = () => {
  const { place: placeKey } = useParams<{ place?: string }>();
  const place = getVillagePlace(placeKey);
  const navigate = useNavigate();
  const mobile = useIsMobile();
  const [active, setActive] = useState<number | null>(null);
  // Keep the last scene mounted after leaving it, so map ← place can crossfade too.
  const [lastPlace, setLastPlace] = useState<VillagePlace | undefined>(place);
  if (place && place !== lastPlace) setLastPlace(place);
  const pinRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const enterRef = useRef<HTMLAnchorElement>(null);

  // Fonts + tab title, scoped to this page.
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
    const prevTitle = document.title;
    document.title = "The Digital Village · FindYourTopTalent";
    return () => {
      link.remove();
      document.title = prevTitle;
    };
  }, []);

  // Coming back from a place, the map remembers where you were.
  useEffect(() => {
    if (!place) return;
    setActive(VILLAGE_PLACES.findIndex((p) => p.key === place.key));
  }, [place]);

  const select = useCallback((i: number, focus = false) => {
    setActive(i);
    if (focus) pinRefs.current[i]?.focus({ preventScroll: true });
  }, []);

  // Keyboard. Map: arrows move between places, Enter opens (like the title menu).
  // Place: Enter goes in, Escape returns to the map.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (place) {
        if (e.key === "Escape") {
          e.preventDefault();
          navigate("/village");
        } else if (e.key === "Enter") {
          const el = document.activeElement;
          if (el && el !== document.body) return; // a focused link activates natively
          e.preventDefault();
          enterRef.current?.click();
        }
        return;
      }
      if (mobile) return;
      const dir: Direction | null =
        e.key === "ArrowRight" ? "right" : e.key === "ArrowLeft" ? "left"
        : e.key === "ArrowDown" ? "down" : e.key === "ArrowUp" ? "up" : null;
      if (dir) {
        e.preventDefault();
        select(active === null ? GATE_INDEX : neighbour(active, dir), true);
      } else if (e.key === "Enter" && active !== null) {
        const el = document.activeElement;
        if (el && el !== document.body) return; // a focused link activates natively
        e.preventDefault();
        pinRefs.current[active]?.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [place, mobile, active, select, navigate]);

  const enter = useCallback(
    async (e: MouseEvent<HTMLAnchorElement>, target: VillagePlace) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (target.key !== "gate") {
        const { data } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
        if (!data.session) {
          navigate(`/auth?redirect=${encodeURIComponent(target.to)}`);
          return;
        }
      }
      navigate(target.to);
    },
    [navigate],
  );

  if (placeKey && !place) return <Navigate to="/village" replace />;

  const current = active !== null ? VILLAGE_PLACES[active] : null;

  return (
    <div className="vl-root" data-view={place ? "place" : "map"}>
      <div className="vl-grain" aria-hidden="true" />

      <main>
        <section className={`vl-layer vl-map${place ? "" : " is-on"}`} aria-label="Digital Village map">
          <header className="vl-head vl-intro">
            <p className="vl-mono">The Game of Being You</p>
            <h1>The Digital Village</h1>
          </header>

          <div className="vl-frame">
            <div className="vl-cover">
              <div className="vl-drift">
                <img
                  className="vl-map-img"
                  src={VILLAGE_MAP.image}
                  alt={VILLAGE_MAP.alt}
                  width={VILLAGE_MAP.width}
                  height={VILLAGE_MAP.height}
                  decoding="async"
                />
                <ul className="vl-pins">
                  {VILLAGE_PLACES.map((p, i) => {
                    const style = {
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      "--vl-d": `${-i * 0.55}s`,
                    } as CSSProperties;
                    const cls = `vl-pin${p.side === "left" ? " vl-pin--left" : ""}${i === active ? " is-active" : ""}`;
                    return (
                      <li key={p.key} className={cls} style={style}>
                        {mobile ? (
                          // Mobile: the list below is the menu; dots only mark the buildings.
                          <span className="vl-pin__link" aria-hidden="true">
                            <span className="vl-dot" />
                          </span>
                        ) : (
                          <Link
                            ref={(el) => {
                              pinRefs.current[i] = el;
                            }}
                            className="vl-pin__link"
                            to={`/village/${p.key}`}
                            onMouseEnter={() => select(i)}
                            onFocus={() => select(i)}
                          >
                            <span className="vl-dot" aria-hidden="true" />
                            <span className="vl-pin__name">{p.name}</span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="vl-vignette" aria-hidden="true" />
          </div>

          <div className="vl-foot vl-intro">
            <p
              key={current?.key ?? "idle"}
              className={`vl-hint${current ? "" : " is-idle"}`}
              aria-live="polite"
            >
              {current ? current.line : "Choose a place"}
            </p>
          </div>
          <Link className="vl-mono vl-corner" to="/">← Title</Link>

          <nav className="vl-list" aria-label="Places">
            <ul>
              {VILLAGE_PLACES.map((p) => (
                <li key={p.key}>
                  <Link to={`/village/${p.key}`}>
                    <span className="vl-list__name">{p.name}</span>
                    <span className="vl-list__line">{p.line}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        {lastPlace && (
          <section
            className={`vl-layer vl-place${place ? " is-on" : ""}`}
            aria-label={lastPlace.name}
          >
            <img
              className="vl-place__img"
              src={lastPlace.image}
              alt={lastPlace.alt}
              decoding="async"
            />
            <Link className="vl-mono vl-back" to="/village">← Village</Link>
            <div className="vl-place__copy">
              <h2>{lastPlace.name}</h2>
              <p className="vl-place__line">{lastPlace.line}</p>
              <a
                ref={enterRef}
                className="vl-enter"
                href={lastPlace.to}
                onClick={(e) => enter(e, lastPlace)}
              >
                ENTER
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Village;
