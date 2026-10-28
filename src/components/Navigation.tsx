import { Link, useLocation } from "react-router-dom";
import { RAIL_PLACES } from "@/lib/railPlaces";
import { usePlaceStates } from "@/hooks/usePlaceStates";
import { placeLine } from "@/lib/placeState";
import { cn } from "@/lib/utils";

/**
 * Navigation — the top bar for the few pages that render outside the game shell.
 *
 * WP-4 (game_of_being_you.md §14.1.2, §14.6): there is one menu on the site, the 11
 * places of the village map, and this bar is that menu laid flat. It replaces the old
 * top nav (game of life / tools / library / contact / donate) with the same places, in
 * the same order, under the same names and in the same states as the rail and `/village`
 * (`RAIL_PLACES` + `usePlaceStates`). A closed place stays on the bar, faded, with its
 * «Opens when …» line; it is not a link.
 *
 * Reads WP-1 tokens only (surface, text, lock), so every skin renders it.
 */

/** Routes where the game shell (or a full-bleed screen) already carries the menu. */
const HIDE_ON_ROUTES = ["/game", "/start", "/zone-of-genius", "/quality-of-life-map"];

const Navigation = () => {
  const { pathname } = useLocation();
  const { states } = usePlaceStates();

  if (HIDE_ON_ROUTES.some((route) => pathname.startsWith(route))) return null;

  return (
    <nav
      aria-label="Village"
      className="sticky top-0 z-40 border-b"
      style={{
        background: "var(--surface-panel)",
        borderColor: "var(--surface-card-border)",
      }}
    >
      <ul className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-3 py-2">
        <li className="shrink-0">
          <Link
            to="/village"
            className="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            Village
          </Link>
        </li>
        {RAIL_PLACES.map((place, i) => {
          const state = states[i];
          const closed = state === "closed";
          const line = placeLine(place, state);
          const active = pathname === place.to || pathname.startsWith(`${place.to}/`);
          const cls = cn(
            "block rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] whitespace-nowrap",
            active && "font-bold underline underline-offset-4",
          );
          return (
            <li key={place.key} className="shrink-0" data-place={place.key} data-place-state={state}>
              {closed ? (
                <span
                  className={cls}
                  aria-disabled="true"
                  title={line}
                  style={{ color: "var(--text-muted)", filter: "var(--lock-filter)", opacity: "var(--lock-dim)" }}
                >
                  {place.name}
                  <span className="sr-only">. {line}</span>
                </span>
              ) : (
                <Link
                  to={place.to}
                  className={cls}
                  title={line}
                  aria-current={active ? "page" : undefined}
                  style={{ color: "var(--text-body)" }}
                >
                  {place.name}
                  {state === "next" && <span className="sr-only"> (next)</span>}
                  {state === "live" && <span className="sr-only"> (live now)</span>}
                  {state === "done" && <span className="sr-only"> (done)</span>}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
