import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { FONTS_HREF } from "@/lib/gameFonts";
import { getVillageSky, villageSkyMood, type VillageSky } from "@/lib/villageSky";
import {
  VILLAGE_MAP,
  VILLAGE_PLACES,
  getVillagePlace,
  sceneObjectPosition,
  type VillagePlace,
} from "@/data/villagePlaces";
import LeaveParticle from "@/components/game/LeaveParticle";
import PlaceParticles from "@/components/game/PlaceParticles";
import { hasParticleInvite, useVillageParticles } from "@/hooks/useVillageParticles";
import PresenceLights from "@/components/game/PresenceLights";
import {
  MAP_PLACE_KEY,
  firstNameOf,
  hueFromColor,
  useVillagePresence,
  useVillagePresencePrefs,
} from "@/hooks/useVillagePresence";
import { useSoulColors } from "@/hooks/useSoulColors";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import {
  houseLit,
  nextMove,
  nextMoveCopy,
  placeLine,
  placeSaveFromSheet,
  placeState,
  whatChangedLine,
  type PlaceStateName,
} from "@/lib/placeState";
import { journeyOptionalWord } from "@/lib/journeyLabels";
import { placeAlt, placeName, placeTagline, tr } from "@/lib/villageCopy";
import { hasGuestTopTalentResult, readGuestTopTalentPayload } from "@/lib/firstVisit";
import SaveCharacterCta from "@/components/game/SaveCharacterCta";
import { useVillageChanges } from "@/hooks/useVillageChanges";
import { PlaceState, PlaceStateTag } from "@/components/game/PlaceState";
import { LunarPaths, LunarWorldSync } from "@/components/skin/LunarWorld";
import { unseenKeys, useLeave } from "@/lib/motion";
import { useSceneSrc } from "@/lib/sceneSrc";
import "./Village.css";

/**
 * Village — the Digital Village, the world players enter after the title screen.
 *
 * `/village` is the map, `/village/:place` a place scene; both live in one
 * component so the two layers can crossfade. Places and routes come from
 * src/data/villagePlaces.ts. Source of truth:
 * docs/02-strategy/game_of_being_you.md §13.1–§13.4 (no XP, no points, no levels).
 *
 * The map and every scene are public. Each place is in one of five states
 * (closed · open · next · done · live), read from the player's save by
 * `placeState` (src/lib/placeState.ts, §14.3 / §14.11) and drawn by `PlaceState`.
 * A closed place shows its faded scene and one line, «Opens when <real event>.
 * Inside: <result>.», with no ENTER. A guest sees Reception, Academy and Fire
 * Circle open and everything else closed; "I already live here" leads to /auth
 * (same `?redirect=` contract as RequireAuth). No barrier language. A newcomer standing at the
 * closed Home gets the one action that opens it: «Find your top talent», or, with a
 * finished test on this device, «Save your character» (WP-7b: result first, account to save).
 *
 * The map is the game screen (WP-6, §14.6): one next-move card (place · step · what it
 * gives · ENTER, from `nextMove`), one «what changed» line and a one-time reveal on places
 * that opened since the last visit (`useVillageChanges`). One hint, never a list.
 *
 * Others who are here now appear as anonymous lights on a place's map marker and in its
 * scene (WP-21, src/hooks/useVillagePresence.ts). Never a count, never a link.
 *
 * Motion (WP-15, src/lib/motion.ts and the `--motion-*` tokens): map → place zooms toward the
 * place while the two layers cross-fade; ENTER pushes the scene in before the route changes;
 * a place that took its colour since the last visit has it fill in once (§14.11).
 */

type Direction = "left" | "right" | "up" | "down";

const HOUSE_PLACE = "house";

/**
 * Where a pin or list row goes. Every place opens its scene first, except Your AI: it is a
 * place of the game itself, open to guests, so its pin goes straight to /game/your-ai.
 */
const pinTo = (p: VillagePlace) => (p.key === "oracle" ? p.to : `/village/${p.key}`);
const RECEPTION_INDEX =VILLAGE_PLACES.findIndex((p) => p.key === "reception");
const ASPECT = VILLAGE_MAP.width / VILLAGE_MAP.height;

/** Map stage geometry for the CSS: image ratio and focal point (see .vl-cover). */
const MAP_STAGE = {
  "--vl-ar": `${VILLAGE_MAP.width} / ${VILLAGE_MAP.height}`,
  "--vl-ratio": ASPECT,
  "--vl-fx": `${VILLAGE_MAP.focus.x}%`,
  "--vl-fy": `${VILLAGE_MAP.focus.y}%`,
} as CSSProperties;

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

/** null while the session is still being read. */
const useSignedIn = () => {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    supabase.auth
      .getSession()
      .then(({ data }) => live && setSignedIn(!!data.session))
      .catch(() => live && setSignedIn(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (live) setSignedIn(!!session);
    });
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return signedIn;
};

/**
 * True while this browser holds a finished Top Talent reading that is not saved to an account.
 * Read from the device (localStorage), so it re-reads when the tab regains focus or another tab
 * writes it; a visitor who comes back from the test sees the village already knowing.
 */
const useGuestResult = (): boolean => {
  const [has, setHas] = useState(hasGuestTopTalentResult);
  useEffect(() => {
    const read = () => setHas(hasGuestTopTalentResult());
    window.addEventListener("focus", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("focus", read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return has;
};

/**
 * Home, closed, for a signed-out visitor (WP-7b: result first, account only to save).
 * One primary action: no result yet → «Find your top talent» (Reception); a result but no
 * account → «Save your character» (the same save as after the test, TopTalentAuthGate).
 * «I already live here → sign in» stays beside it, quiet, for residents.
 */
const NewcomerPath = ({
  hasResult,
  onGo,
  signInTo,
}: {
  hasResult: boolean;
  /** Leave for Reception with the village's own exit motion. */
  onGo: (e: MouseEvent<HTMLElement>) => void;
  signInTo: string;
}) => {
  const { t } = useTranslation();
  return (
    <div className="vl-newcomer-path">
      {hasResult && readGuestTopTalentPayload() ? (
        <SaveCharacterCta buttonClassName="vl-enter vl-newcomer" formClassName="vl-save" />
      ) : (
        <Link className="vl-enter vl-newcomer" to="/village/reception" onClick={onGo}>
          {tr(t, "village.findTopTalent", "Find your top talent")}
        </Link>
      )}
      <Link className="vl-mono vl-signin" to={signInTo}>
        {tr(t, "village.signIn", "I already live here → sign in")}
      </Link>
    </div>
  );
};

/** The real moon tonight. Re-read every ten minutes so a tab left open follows the sky. */
const useVillageSky = (): VillageSky => {
  const [sky, setSky] = useState(() => getVillageSky());
  useEffect(() => {
    const id = window.setInterval(() => setSky(getVillageSky()), 10 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);
  return sky;
};

/**
 * Sky custom properties, set once on .vl-root. The moon is the shared layer (same for
 * every resident tonight); the Journey's dawn at the horizon (§14.11 step 6) is the
 * player's own and will be a separate layer with its own variables. Keep them apart.
 * Decorative values only: none of these is ever rendered as text.
 */
const skyVars = (sky: VillageSky): CSSProperties =>
  ({
    "--sky-moon-illumination": sky.illumination.toFixed(3),
    "--sky-moon-phase": sky.cycle.toFixed(3),
    // Width of the terminator ellipse relative to the disc: 1 at new/full, 0 at the quarters.
    "--sky-moon-squeeze": Math.abs(Math.cos(sky.cycle * 2 * Math.PI)).toFixed(3),
  }) as CSSProperties;

/** Night veil over a scene: darkest at new moon, gone at full moon. */
const SkyVeil = () => <div className="vl-sky-veil" aria-hidden="true" />;

/** The moon disc with its real phase shape; lit on the right while waxing, the left while waning. */
const SkyMoon = ({ sky }: { sky: VillageSky }) => (
  <div
    className="vl-moon"
    data-phase={sky.phase}
    data-waxing={sky.cycle < 0.5}
    data-gibbous={Math.cos(sky.cycle * 2 * Math.PI) < 0}
    aria-hidden="true"
  >
    <div className="vl-moon__glow" />
    <div className="vl-moon__disc">
      <div className="vl-moon__lit" />
      <div className="vl-moon__term" />
    </div>
  </div>
);

/** «New» beside a place that opened since the last visit: a word, so the reveal is never colour-only. */
const NewTag = () => {
  const { t } = useTranslation();
  return <span className="ps-tag ps-tag--next vl-new">{tr(t, "village.new", "New")}</span>;
};

const COLOR_KEY = (userId: string) => `village:seen-color-v1:${userId}`;

/**
 * Places that took their colour (done, or live) since this player last stood in the village,
 * for the one-time fill-in (§14.11, WP-15). Same shape as `useVillageChanges`: the village
 * remembers, per player and browser, which places it has already shown in colour; the set only
 * grows and is written at once, so a reload never replays it. With no memory (a new browser)
 * every coloured place counts as new, once. A guest, or storage that fails, gets no reveal.
 */
const useColorReveal = (userId: string | null, ready: boolean, coloredKeys: readonly string[]): string[] => {
  const [fresh, setFresh] = useState<string[]>([]);
  const coloredNow = coloredKeys.join("|");
  useEffect(() => {
    if (!ready || !userId) return;
    const now = coloredNow ? coloredNow.split("|") : [];
    let seen: string[] | null = null;
    try {
      const parsed: unknown = JSON.parse(window.localStorage.getItem(COLOR_KEY(userId)) ?? "null");
      seen = Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : null;
    } catch {
      seen = null;
    }
    const added = unseenKeys(seen, now);
    // Keep what was already announced this visit (a re-run must not clear it).
    if (added.length > 0) setFresh((prev) => [...new Set([...prev, ...added])]);
    try {
      window.localStorage.setItem(COLOR_KEY(userId), JSON.stringify([...new Set([...(seen ?? []), ...now])]));
    } catch {
      // Private mode / quota: the reveal is cosmetic, ignore.
    }
  }, [userId, ready, coloredNow]);
  return fresh;
};

/** The current time, refreshed so a live window opens and closes while the page is up. */
const useNow = (everyMs: number) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), everyMs);
    return () => window.clearInterval(id);
  }, [everyMs]);
  return now;
};

const Village = () => {
  const { t } = useTranslation();
  const { place: placeKey } = useParams<{ place?: string }>();
  const sky = useVillageSky();
  const place = getVillagePlace(placeKey);
  const navigate = useNavigate();
  const mobile = useIsMobile();
  const signedIn = useSignedIn();
  const sheet = useCharacterSheet();
  const now = useNow(60_000);
  // The state of every place, read from the save. Until the save has loaded, a place that
  // will turn out closed is drawn open and its ENTER is hidden, so a returning player
  // never sees the village fade and brighten again.
  const ready = !sheet.isLoading;
  // A finished test on this device counts for a visitor with no account (WP-7b): the next
  // move becomes «Save your character». Once saved, the sheet's chain takes over.
  const guestResult = useGuestResult();
  const save = placeSaveFromSheet(sheet, now, { "guest-result": signedIn === false && guestResult });
  const states: PlaceStateName[] = VILLAGE_PLACES.map((p) => placeState(p, save));
  const shown: PlaceStateName[] = states.map((s) => (!ready && s === "closed" ? "open" : s));
  // One next move and what changed since the last visit (WP-6, §14.6). Both wait for the save;
  // the move also waits for the session, so a guest never sees Reception flash before Save.
  const move = ready && signedIn !== null ? nextMove(VILLAGE_PLACES, save) : null;
  const moveCopy = move ? nextMoveCopy(move, t) : null;
  const changes = useVillageChanges(sheet.userId, VILLAGE_PLACES, save, ready);
  const changesLine = whatChangedLine(changes.fresh, t);
  const isNew = (p: VillagePlace) => changes.fresh.includes(p);
  // The first sale (J12, WP-11) lights the player's house on the map; its own state is unchanged.
  const isLit = (p: VillagePlace) => p.key === HOUSE_PLACE && ready && houseLit(save);
  // Places that took their colour since the last visit: the colour fills into them once (WP-15).
  const colorFresh = useColorReveal(
    sheet.userId,
    ready,
    VILLAGE_PLACES.filter((_, i) => states[i] === "done" || states[i] === "live").map((p) => p.key),
  );
  const isRevealed = (p: VillagePlace) => colorFresh.includes(p.key);
  // ENTER: the scene pushes in and the screen fades, then the route changes.
  const { leaving, leave } = useLeave("base");
  const [active, setActive] = useState<number | null>(null);
  // Keep the last scene mounted after leaving it, so map ← place can crossfade too.
  const [lastPlace, setLastPlace] = useState<VillagePlace | undefined>(place);
  if (place && place !== lastPlace) setLastPlace(place);
  const mapSrc = useSceneSrc(VILLAGE_MAP.image);
  const placeSrc = useSceneSrc(lastPlace?.image ?? "");
  const pinRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const enterRef = useRef<HTMLAnchorElement>(null);
  // Particles left here by earlier players (WP-17). Follows the last scene so they fade with it.
  const particles = useVillageParticles(lastPlace?.key ?? null);
  // The others here now, as anonymous lights (WP-21). This tab appears with its soul /
  // top-talent hue, and with a first name only if the player opted in; nothing else leaves.
  const presencePrefs = useVillagePresencePrefs();
  const soul = useSoulColors(sheet.soulColors, sheet.topTalent);
  const presenceReady = presencePrefs.ready && ready;
  const presence = useVillagePresence({
    placeKey: place?.key ?? MAP_PLACE_KEY,
    listen: presencePrefs.ready,
    appear: presenceReady && presencePrefs.presenceOn,
    hue: hueFromColor(soul.colors?.[0]),
    firstName: presencePrefs.showName ? firstNameOf(sheet.firstName) : null,
  });

  // Fonts, scoped to this page.
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  // Tab title, scoped to this page; follows the language switcher.
  useEffect(() => {
    const prevTitle = document.title;
    document.title = tr(t, "village.tabTitle", "The Digital Village · FindYourTopTalent");
    return () => {
      document.title = prevTitle;
    };
  }, [t]);

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
          const el = document.activeElement;
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return; // typing a particle
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
        select(active === null ? RECEPTION_INDEX : neighbour(active, dir), true);
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

  if (placeKey && !place) return <Navigate to="/village" replace />;

  const current = active !== null ? VILLAGE_PLACES[active] : null;
  const lastIndex = lastPlace ? VILLAGE_PLACES.indexOf(lastPlace) : -1;
  const lastState = lastIndex >= 0 ? shown[lastIndex] : "open";
  // Closed and live say their own line; every other state keeps the place's line.
  const lastLine = lastPlace && (lastState === "closed" || lastState === "live")
    ? placeLine(lastPlace, lastState, t, signedIn === true)
    : undefined;
  const lastPending = lastIndex >= 0 && !ready && states[lastIndex] === "closed";

  return (
    <div className={`vl-root${leaving ? " is-leaving" : ""}`} data-view={place ? "place" : "map"} style={skyVars(sky)}>
      <div className="vl-grain" aria-hidden="true" />
      {/* Lunar only: the player's soul colors and the sky, from the same save as placeState (§14.11). */}
      <LunarWorldSync sheet={sheet} save={save} />

      <main>
        <section className={`vl-layer vl-map${place ? "" : " is-on"}`} aria-label={tr(t, "village.mapAria", "Digital Village map")}>
          <header className="vl-head vl-intro">
            <p className="vl-mono">{tr(t, "village.eyebrow", "The Game of Being You")}</p>
            <h1>{tr(t, "village.title", "The Digital Village")}</h1>
            <p className="vl-mono vl-moonline">{villageSkyMood(sky.phase, t)}</p>
          </header>

          {/* --vl-zx/--vl-zy: the place the map zooms toward when it fades out (WP-15). */}
          <div
            className="vl-frame"
            style={{ ...MAP_STAGE, "--vl-zx": `${lastPlace?.x ?? 50}%`, "--vl-zy": `${lastPlace?.y ?? 50}%` } as CSSProperties}
          >
            <div className="vl-cover">
             <div className="vl-zoom">
              <div className="vl-drift">
                <img
                  className="vl-map-img"
                  src={mapSrc}
                  alt={tr(t, "village.map.alt", VILLAGE_MAP.alt)}
                  width={VILLAGE_MAP.width}
                  height={VILLAGE_MAP.height}
                  decoding="async"
                />
                <SkyVeil />
                <LunarPaths states={shown} />
                <ul className="vl-pins">
                  {VILLAGE_PLACES.map((p, i) => {
                    const style = {
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      "--vl-d": `${-i * 0.55}s`,
                    } as CSSProperties;
                    const cls = `vl-pin${p.side === "left" ? " vl-pin--left" : ""}${i === active ? " is-active" : ""}${isNew(p) ? " is-new" : ""}${isRevealed(p) ? " is-reveal" : ""}${isLit(p) ? " is-lit" : ""}`;
                    return (
                      // A closed pin still opens its (faded) scene, so it is not disabled.
                      <PlaceState key={p.key} as="li" state={shown[i]} className={cls} style={style} tag={false} disabled={false}>
                        {mobile ? (
                          // Mobile: the list below is the menu; dots only mark the buildings.
                          <span className="vl-pin__link" aria-hidden="true">
                            <span className="vl-dot ps-fade" />
                          </span>
                        ) : (
                          <Link
                            ref={(el) => {
                              pinRefs.current[i] = el;
                            }}
                            className="vl-pin__link"
                            to={pinTo(p)}
                            onMouseEnter={() => select(i)}
                            onFocus={() => select(i)}
                          >
                            <span className="vl-dot ps-fade" aria-hidden="true" />
                            <span className="vl-pin__name">{placeName(p, t)}</span>
                            <PlaceStateTag state={shown[i]} />
                            {isNew(p) ? <NewTag /> : null}
                            {isLit(p) ? <span className="vl-lit-word">{tr(t, "village.lit", "Lit")}</span> : null}
                          </Link>
                        )}
                        {/* Beside the link, not in it: a light leads nowhere. */}
                        <PresenceLights lights={presence[p.key]} variant="pin" />
                      </PlaceState>
                    );
                  })}
                </ul>
              </div>
             </div>
            </div>
            <div className="vl-vignette" aria-hidden="true" />
            <SkyMoon sky={sky} />
          </div>

          <div className="vl-foot vl-intro">
            <p
              key={current?.key ?? "idle"}
              className={`vl-hint${current ? "" : " is-idle"}`}
              aria-live="polite"
            >
              {current && active !== null
                ? placeLine(current, shown[active], t, signedIn === true)
                : tr(t, "village.choosePlace", "Choose a place")}
            </p>
          </div>
          <Link className="vl-mono vl-corner" to="/">{tr(t, "village.backTitle", "← Title")}</Link>

          {/* WP-6 (§14.6): what changed since the last visit, and the one next move. One hint, never a list. */}
          {changesLine || move ? (
            <div className="vl-move">
              {changesLine ? (
                <p className="vl-mono vl-move__changed" role="status">{changesLine}</p>
              ) : null}
              {move && moveCopy ? (
                <aside className="vl-move__card" aria-label={tr(t, "village.nextMove", "Your next move")} data-kind={move.kind}>
                  <p className="vl-mono vl-move__eyebrow">{tr(t, "village.nextMove", "Your next move")}</p>
                  <p className="vl-move__where">
                    <span className="vl-move__place">{moveCopy.place}</span>
                    {/* The place is named once: skip the title when it only repeats the place (see moveTitle). */}
                    {moveCopy.title.toLowerCase() !== moveCopy.place.toLowerCase() ? ` · ${moveCopy.title}` : null}
                    {move.optional ? <span className="vl-move__optional"> ({journeyOptionalWord(t)})</span> : null}
                  </p>
                  {move.kind === "step" ? <p className="vl-move__result">{moveCopy.result}</p> : null}
                  <Link className="vl-enter vl-move__enter" to={move.to} onClick={(e) => leave(() => navigate(move.to), e)}>
                    {tr(t, "village.enter", "ENTER")}
                  </Link>
                </aside>
              ) : null}
            </div>
          ) : null}

          <nav className="vl-list" aria-label={tr(t, "village.placesNav", "Places")}>
            <ul>
              {VILLAGE_PLACES.map((p, i) => (
                <PlaceState key={p.key} as="li" state={shown[i]} className={`${isNew(p) ? "is-new" : ""} ${isRevealed(p) ? "is-reveal" : ""} ${isLit(p) ? "is-lit" : ""}`.trim().replace(/\s+/g, " ") || undefined} tag={false} disabled={false}>
                  <Link to={pinTo(p)}>
                    <span className="vl-list__name">{placeName(p, t)}</span>
                    <PlaceStateTag state={shown[i]} />
                    {isNew(p) ? <NewTag /> : null}
                    {isLit(p) ? <span className="vl-lit-word">{tr(t, "village.lit", "Lit")}</span> : null}
                    <span className="vl-list__line">{placeLine(p, shown[i], t, signedIn === true)}</span>
                  </Link>
                </PlaceState>
              ))}
            </ul>
          </nav>
        </section>

        {lastPlace && (
          <section
            className={`vl-layer vl-place${place ? " is-on" : ""}`}
            aria-label={placeName(lastPlace, t)}
          >
            <Link className="vl-mono vl-back" to="/village">{tr(t, "village.backVillage", "← Village")}</Link>
            <PlaceState
              state={lastState}
              className="vl-place__state"
              bodyClassName="vl-place__copy"
              scene={
                <img
                  className="vl-place__img"
                  src={placeSrc}
                  alt={placeAlt(lastPlace, t)}
                  decoding="async"
                  style={{
                    objectPosition: sceneObjectPosition(lastPlace),
                    transformOrigin: sceneObjectPosition(lastPlace),
                  }}
                />
              }
              line={lastLine}
              action={
                <Link
                  ref={enterRef}
                  className={`vl-enter${lastPending ? " is-pending" : ""}`}
                  to={lastPlace.to}
                  onClick={(e) => leave(() => navigate(lastPlace.to), e)}
                >
                  {tr(t, "village.enter", "ENTER")}
                </Link>
              }
              after={
                <>
                  {/* Leaving a particle (WP-17) is for someone standing inside, so a closed place offers none. */}
                  {lastState !== "closed" && !lastPending && (
                    <LeaveParticle
                      key={lastPlace.key}
                      placeKey={lastPlace.key}
                      api={particles}
                      startOpen={hasParticleInvite(lastPlace.key)}
                    />
                  )}
                  {/* A returning resident who is signed out can still sign in and come back here.
                      At Home a newcomer also gets the one action that opens it. */}
                  {signedIn === false && lastState === "closed" ? (
                    lastPlace.key === "house" ? (
                      <NewcomerPath
                        key={guestResult ? "save" : "find"}
                        hasResult={guestResult}
                        onGo={(e) => leave(() => navigate("/village/reception"), e)}
                        signInTo={`/auth?redirect=${encodeURIComponent(lastPlace.to)}`}
                      />
                    ) : (
                      <Link
                        className="vl-mono vl-signin"
                        to={`/auth?redirect=${encodeURIComponent(lastPlace.to)}`}
                      >
                        {tr(t, "village.signIn", "I already live here → sign in")}
                      </Link>
                    )
                  ) : null}
                </>
              }
            >
              <h2>{placeName(lastPlace, t)}</h2>
              {lastLine ? null : <p className="vl-place__line">{placeTagline(lastPlace, t, signedIn === true)}</p>}
            </PlaceState>
            {/* Sky and particles belong to the village, not the building: they do not fade when it is closed. */}
            <SkyVeil />
            <SkyMoon sky={sky} />
            <PlaceParticles particles={particles.particles} />
            <PresenceLights lights={presence[lastPlace.key]} variant="scene" />
          </section>
        )}
      </main>
    </div>
  );
};

export default Village;
