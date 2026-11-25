import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
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
  awaitingSave,
  gatedByUnsavedTalent,
  houseLit,
  nextMove,
  nextMoveCopy,
  oneNextStates,
  placeLine,
  placeSaveFromSheet,
  placeState,
  whatChangedLine,
  type PlaceStateName,
} from "@/lib/placeState";
import { journeyOptionalWord } from "@/lib/journeyLabels";
import { placeAlt, placeName, placeTagline, tr } from "@/lib/villageCopy";
import { litQuarters } from "@/lib/quarters";
import QuarterSign from "@/components/game/QuarterSign";
import { displayName } from "@/lib/displayName";
import { hasGuestTopTalentResult, readGuestTalentName, readGuestTopTalentPayload } from "@/lib/firstVisit";
import SaveCharacterCta from "@/components/game/SaveCharacterCta";
import { useVillageChanges } from "@/hooks/useVillageChanges";
import { PlaceState, PlaceStateTag } from "@/components/game/PlaceState";
import { LunarPaths, LunarWorldSync } from "@/components/skin/LunarWorld";
import { unseenKeys, useLeave } from "@/lib/motion";
import { useSceneSrc } from "@/lib/sceneSrc";
import { placeObjects, placeSoul, watchedCourseObjects } from "@/lib/placeColor";
import IntroSequence from "@/components/game/IntroSequence";
import YourAiInstrument from "@/components/game/YourAiInstrument";
import { instrumentGate, readAiOsVisited } from "@/lib/instrument/state";
import MoonDial from "@/components/game/MoonDial";
import PlaceRoomsPane from "@/components/game/PlaceRoomsPane";
import { placeLight, placeSignalKey, type PlaceLight } from "@/lib/placeLight";
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
 * (same `?redirect=` contract as RequireAuth). No barrier language. Anyone standing at a
 * closed place gets one enabled «Your next move: <the real next step>», the move the map glows
 * with (§25.4); with a finished test on this device it is «Keep your light lit» (WP-7b).
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
 * A closed place's one enabled action (GoBY §25.4: the scene and the pane give one signal).
 * It is the same next move the map's card glows with: «Your next move: <the real next step>»,
 * leading where that card's ENTER leads. A guest holding a finished test on this device gets
 * «Keep your light lit» (the save, WP-7b: result first, account to save) instead, which is
 * that card's own move. A signed-out visitor also keeps «I already live here → sign in», quiet.
 */
const ClosedNextMove = ({
  hasResult,
  label,
  gives,
  to,
  onGo,
  signInTo,
}: {
  hasResult: boolean;
  /** «Your next move: <title>» for the move the map's card shows. */
  label: string;
  /** What the move gives: the result line of its quest row (§25.6). Empty when the card shows none. */
  gives: string;
  to: string;
  /** Leave for `to` with the village's own exit motion. */
  onGo: (e: MouseEvent<HTMLElement>) => void;
  /** Where a returning resident signs in; null for someone already signed in. */
  signInTo: string | null;
}) => {
  const { t } = useTranslation();
  const givesId = useId();
  return (
    <div className="vl-newcomer-path">
      {hasResult && readGuestTopTalentPayload() ? (
        <SaveCharacterCta buttonClassName="vl-enter vl-newcomer" formClassName="vl-save" />
      ) : (
        <Link className="vl-enter vl-newcomer" to={to} onClick={onGo} aria-describedby={gives ? givesId : undefined}>
          {label}
        </Link>
      )}
      {gives ? <p id={givesId} className="vl-newcomer__gives">{gives}</p> : null}
      {signInTo ? (
        <Link className="vl-mono vl-signin" to={signInTo}>
          {tr(t, "village.signIn", "I already live here → sign in")}
        </Link>
      ) : null}
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
  const location = useLocation();
  // Intro v2: NEW GAME arrives here with `state.intro`; the cinematic plays over the Entry
  // Portal and ends on it, START GAME already in place (src/components/game/IntroSequence.tsx).
  const introState = (location.state ?? null) as { intro?: boolean; startGame?: boolean } | null;
  const [introOn, setIntroOn] = useState(() => placeKey === "reception" && !!introState?.intro);
  const startGame = placeKey === "reception" && !!(introState?.intro || introState?.startGame);
  const endIntro = useCallback(() => {
    setIntroOn(false);
    // Back/refresh must not replay it; the button keeps its START GAME. The history entry is
    // rewritten in place: a router navigate here would be a new location, and the app-wide
    // PageTransition would fade the Entry Portal out and in again right after the dissolve.
    try {
      const prev = (window.history.state ?? {}) as Record<string, unknown>;
      window.history.replaceState({ ...prev, usr: { startGame: true } }, "");
    } catch {
      /* history unavailable: a refresh may replay the intro, nothing breaks */
    }
  }, []);
  const mobile = useIsMobile();
  // px the open clock card runs past the map on a phone; the frame leaves this much room so the card pushes «Your next move» down
  const [clockPush, setClockPush] = useState(0);
  const signedIn = useSignedIn();
  const sheet = useCharacterSheet();
  // W2: the one player name (Reception's «Welcome back, <name>»); null for a guest.
  const playerName = displayName({ signedIn: signedIn === true, firstName: sheet.firstName });
  const now = useNow(60_000);
  // The state of every place, read from the save. Until the save has loaded, a place that
  // will turn out closed is drawn open and its ENTER is hidden, so a returning player
  // never sees the village fade and brighten again.
  const ready = !sheet.isLoading;
  // A finished test on this device counts for a visitor with no account (WP-7b): the next
  // move becomes «Save your character». Once saved, the sheet's chain takes over.
  const guestResult = useGuestResult();
  const save = placeSaveFromSheet(sheet, now, { "guest-result": signedIn === false && guestResult });
  // The talent they saw, read from the same local result (nothing is sent anywhere).
  const guestTalent = signedIn === false && guestResult ? readGuestTalentName() : null;
  // One next move and what changed since the last visit (WP-6, §14.6). Both wait for the save;
  // the move also waits for the session, so a guest never sees Reception flash before Save.
  const move = ready && signedIn !== null ? nextMove(VILLAGE_PLACES, save) : null;
  const moveCopy = move ? nextMoveCopy(move, t) : null;
  // §25.4 step 1: one glow. Only the move's place reads `next`, the same as the rail and the pane row.
  const states: PlaceStateName[] = oneNextStates(VILLAGE_PLACES, VILLAGE_PLACES.map((p) => placeState(p, save)), move);
  const shown: PlaceStateName[] = states.map((s) => (!ready && s === "closed" ? "open" : s));
  // §25.14 earned light: a quarter's solid is lit once its first place is open. Nothing is lit until the save loads.
  const quarterLit = litQuarters(VILLAGE_PLACES, ready ? shown : []);
  const changes = useVillageChanges(sheet.userId, VILLAGE_PLACES, save, ready);
  const changesLine = whatChangedLine(changes.fresh, t);
  const isNew = (p: VillagePlace) => changes.fresh.includes(p);
  // Issue #354: Home waits on the SAVE, not on the reveal. For a guest who has revealed, its tag
  // says so, in step with the next-move card, instead of «Not open yet».
  const gatedText = (p: VillagePlace) =>
    ready && gatedByUnsavedTalent(p, save)
      ? tr(t, "village.state.gated", "Opens when your top talent is saved")
      : undefined;
  // The first sale (J12, WP-11) lights the player's house on the map; its own state is unchanged.
  const isLit = (p: VillagePlace) => p.key === HOUSE_PLACE && ready && houseLit(save);
  // Places that took their colour since the last visit: the colour fills into them once (WP-15).
  const colorFresh = useColorReveal(
    sheet.userId,
    ready,
    VILLAGE_PLACES.filter((_, i) => states[i] === "done" || states[i] === "live").map((p) => p.key),
  );
  const isRevealed = (p: VillagePlace) => colorFresh.includes(p.key);
  // Window light = place state (village-as-dashboard step 3): brighter where the place holds
  // something for the player now, dark where it is locked. Until the save loads, every place
  // waits at «quiet» so nothing flashes.
  const lights: PlaceLight[] = VILLAGE_PLACES.map((p, i) =>
    ready ? placeLight(p, states[i], save, { isNew: isNew(p), houseLit: isLit(p) }) : "quiet",
  );
  const signal = (i: number) =>
    placeSignalKey(lights[i], shown[i]) === "unfinished" ? (
      <span className="ps-tag vl-signal">{tr(t, "village.signal.unfinished", "Unfinished")}</span>
    ) : null;
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
    ? placeLine(lastPlace, lastState, t, signedIn === true, playerName)
    : undefined;
  const lastPending = lastIndex >= 0 && !ready && states[lastIndex] === "closed";
  // The colour the player has brought back to this place (placeColor): each earned object
  // shines and gives the scene a little more colour. Until the save loads, the scene stays grey.
  const lastObjects = lastPlace && ready
    ? placeObjects(lastPlace.key, {
        ...save.met,
        ...Object.fromEntries((sheet.victories ?? []).map((id) => [id, true])),
        ...(lastPlace.key === "academy" ? watchedCourseObjects() : {}),
      })
    : [];
  const lastSoul = placeSoul(lastObjects);

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
            style={{
              ...MAP_STAGE,
              "--vl-zx": `${lastPlace?.x ?? 50}%`,
              "--vl-zy": `${lastPlace?.y ?? 50}%`,
              // phone: the open clock card runs below the map; this space makes it push «Your next move» down, never cover it
              ...(clockPush > 0 ? { marginBottom: clockPush } : null),
            } as CSSProperties}
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
                      "--vl-ly": `${p.labelDy ?? 0}px`,
                    } as CSSProperties;
                    const cls = `vl-pin${p.side === "left" ? " vl-pin--left" : ""}${i === active ? " is-active" : ""}${isNew(p) ? " is-new" : ""}${isRevealed(p) ? " is-reveal" : ""}${isLit(p) ? " is-lit" : ""} vl-light--${lights[i]}`;
                    return (
                      // Issue #270: a closed pin is aria-disabled (PlaceState's default) and goes nowhere:
                      // no dead arch. It still takes hover and focus, so its «Opens when…» line shows below.
                      <PlaceState key={p.key} as="li" state={shown[i]} className={cls} style={style} tag={false}>
                        {/* The building's windows: how much light this place has for the player now. */}
                        <span className="vl-window" aria-hidden="true" />
                        {mobile ? (
                          // Mobile: the list below is the menu; dots only mark the buildings.
                          <span className="vl-pin__link" aria-hidden="true">
                            <span className="vl-dot ps-fade" />
                          </span>
                        ) : shown[i] === "closed" ? (
                          <a
                            ref={(el) => {
                              pinRefs.current[i] = el;
                            }}
                            className="vl-pin__link is-locked"
                            role="link"
                            aria-disabled="true"
                            tabIndex={0}
                            onMouseEnter={() => select(i)}
                            onFocus={() => select(i)}
                          >
                            <span className="vl-dot ps-fade" aria-hidden="true" />
                            <span className="vl-pin__name">{placeName(p, t)}</span>
                            <QuarterSign element={p.element} lit={quarterLit[p.element]} size={16} className="vl-sign" />
                            <PlaceStateTag state={shown[i]} text={gatedText(p)} />
                          </a>
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
                            <QuarterSign element={p.element} lit={quarterLit[p.element]} size={16} className="vl-sign" />
                            <PlaceStateTag state={shown[i]} />
                            {signal(i)}
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
            {/* The biological clock (#385): a compact watch in the map's top-right corner; its card
                (views 2–3, with the player's Moon Focus) drops down over the map. */}
            <MoonDial className="vl-watch" onPush={setClockPush} />
          </div>

          <div className="vl-foot vl-intro">
            <p
              key={current?.key ?? "idle"}
              className={`vl-hint${current ? "" : " is-idle"}`}
              aria-live="polite"
            >
              {current && active !== null
                ? placeLine(current, shown[active], t, signedIn === true, playerName)
                : tr(t, "village.choosePlace", "Choose a place")}
            </p>
          </div>
          {/* Home on every width (GoBY §25.12): «← Title» in the corner from 768px; on a phone the same link
              is a compact «←» button in the top bar, left of the moon medallion. The name is the aria-label. */}
          <Link className="vl-mono vl-corner" to="/" aria-label={tr(t, "village.backTitleAria", "Back to title")}>
            <span className="vl-corner__full">{tr(t, "village.backTitle", "← Title")}</span>
            <span className="vl-corner__icon" aria-hidden="true">←</span>
          </Link>

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
                  {guestTalent && awaitingSave(save) ? (
                    <p className="vl-move__result">
                      {String(t("village.yourTalent", { name: guestTalent, defaultValue: "Your top talent: {{name}}" }))}
                    </p>
                  ) : null}
                  {move.kind === "step" ? <p className="vl-move__result">{moveCopy.result}</p> : null}
                  <Link
                    className="vl-enter vl-move__enter"
                    to={move.to}
                    aria-label={t("village.enterPlace", { place: moveCopy.place, defaultValue: "Enter {{place}}" })}
                    onClick={(e) => leave(() => navigate(move.to), e)}
                  >
                    {tr(t, "village.enter", "ENTER")}
                  </Link>
                </aside>
              ) : null}
            </div>
          ) : null}

          <nav className="vl-list" aria-label={tr(t, "village.placesNav", "Places")}>
            <ul>
              {VILLAGE_PLACES.map((p, i) => (
                <PlaceState key={p.key} as="li" state={shown[i]} className={`vl-light--${lights[i]} ${isNew(p) ? "is-new" : ""} ${isRevealed(p) ? "is-reveal" : ""} ${isLit(p) ? "is-lit" : ""}`.trim().replace(/\s+/g, " ") || undefined} tag={false}>
                  {shown[i] === "closed" ? (
                    // Issue #270: closed means aria-disabled and no navigation; the line says what opens it.
                    <a role="link" aria-disabled="true" tabIndex={0} className="is-locked">
                      <span className="vl-list__name">{placeName(p, t)}{mobile ? <QuarterSign element={p.element} lit={quarterLit[p.element]} size={16} className="vl-sign" /> : null}</span>
                      <PlaceStateTag state={shown[i]} text={gatedText(p)} />
                      <span className="vl-list__line">{placeLine(p, shown[i], t, signedIn === true, playerName)}</span>
                    </a>
                  ) : (
                    <Link to={pinTo(p)}>
                      <span className="vl-list__name">{placeName(p, t)}{mobile ? <QuarterSign element={p.element} lit={quarterLit[p.element]} size={16} className="vl-sign" /> : null}</span>
                      <PlaceStateTag state={shown[i]} />
                      {signal(i)}
                      {isNew(p) ? <NewTag /> : null}
                      {isLit(p) ? <span className="vl-lit-word">{tr(t, "village.lit", "Lit")}</span> : null}
                      <span className="vl-list__line">{placeLine(p, shown[i], t, signedIn === true, playerName)}</span>
                    </Link>
                  )}
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
            {/* §25.3: the scene and the second pane stand together; keyed by place, so every entry opens it afresh. */}
            <PlaceRoomsPane key={lastPlace.key} place={lastPlace} save={save} signedIn={signedIn === true} mobile={mobile} move={move} />
            <PlaceState
              state={lastState}
              className="vl-place__state"
              style={{ "--vl-soul": lastSoul.toFixed(3) } as CSSProperties}
              bodyClassName="vl-place__copy"
              scene={
                <>
                <img
                  className="vl-place__img"
                  data-intro-anchor="scene"
                  src={placeSrc}
                  alt={placeAlt(lastPlace, t)}
                  decoding="async"
                  style={{
                    objectPosition: sceneObjectPosition(lastPlace),
                    transformOrigin: sceneObjectPosition(lastPlace),
                  }}
                />
                {/* The objects of this place: earned ones in iridescent hues, the rest a faint trace. */}
                {lastObjects.length > 0 ? (
                  <ul className="vl-objects" aria-hidden="true">
                    {lastObjects.map((o, i) => (
                      <li
                        key={o.id}
                        className={`vl-object${o.earned ? " is-earned" : ""}`}
                        style={{ "--vl-i": i, "--vl-y": `${Math.abs(i - (lastObjects.length - 1) / 2) * 3}px` } as CSSProperties}
                      />
                    ))}
                  </ul>
                ) : null}
                </>
              }
              line={lastLine}
              action={
                <Link
                  ref={enterRef}
                  className={`vl-enter${lastPending ? " is-pending" : ""}`}
                  to={lastPlace.to}
                  aria-label={
                    startGame && lastPlace.key === "reception"
                      ? tr(t, "intro.startGame", "START GAME")
                      : t("village.enterPlace", { place: placeName(lastPlace, t), defaultValue: "Enter {{place}}" })
                  }
                  data-intro-anchor={lastPlace.key === "reception" ? "start" : undefined}
                  onClick={(e) => leave(() => navigate(lastPlace.to), e)}
                >
                  {startGame && lastPlace.key === "reception" ? tr(t, "intro.startGame", "START GAME") : tr(t, "village.enter", "ENTER")}
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
                </>
              }
              afterEnabled={
                // A closed place has no ENTER, so it gives one enabled move instead (§25.4): the
                // same next move the map glows with. It sits outside the closed (aria-disabled)
                // group, so it reads enabled; and it says what it gives (§25.6), as its quest row does.
                // With a result on this device it is «Keep your light lit»; a returning resident can
                // still sign in and come back.
                lastState === "closed" && !lastPending && move && moveCopy && signedIn !== null ? (
                  <ClosedNextMove
                    key={guestResult ? "save" : "move"}
                    hasResult={signedIn === false && guestResult}
                    label={`${tr(t, "village.nextMove", "Your next move")}: ${moveCopy.title}`}
                    gives={moveCopy.result}
                    to={move.to}
                    onGo={(e) => leave(() => navigate(move.to), e)}
                    signInTo={signedIn === false ? `/auth?redirect=${encodeURIComponent(lastPlace.to)}` : null}
                  />
                ) : undefined
              }
            >
              <h2>{placeName(lastPlace, t)}</h2>
              {lastLine ? null : <p className="vl-place__line">{placeTagline(lastPlace, t, signedIn === true, playerName)}</p>}
            </PlaceState>
            {/* Sky and particles belong to the village, not the building: they do not fade when it is closed. */}
            <SkyVeil />
            <SkyMoon sky={sky} />
            <PlaceParticles particles={particles.particles} />
            <PresenceLights lights={presence[lastPlace.key]} variant="scene" />
          </section>
        )}
      </main>
      {introOn ? <IntroSequence anchorSelector='[data-intro-anchor="start"]' onDone={endIntro} /> : null}
      {/* The navigation instrument, carried onto the map (the map has no shell). Same gate as in the shell. */}
      <YourAiInstrument
        enabled={
          !introOn &&
          instrumentGate({ ever: readAiOsVisited(), topTalent: !!sheet.topTalent, mission: !!sheet.missionTitle, assets: sheet.assets.count > 0 })
        }
        ownerId={sheet.userId}
        lit={quarterLit}
        avoid=".vl-move__card"
      />
    </div>
  );
};

export default Village;
