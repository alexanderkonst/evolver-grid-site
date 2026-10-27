import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import "./InvestorRoom.css";

/**
 * InvestorRoom — public information ABOUT the Digital Village (`/investor`).
 * It is not a way into the village: the one door everyone sees is the title
 * screen (`/`), so «Play the game» goes there and nowhere else.
 *
 * Same world as GameTitle (fonts, night palette, menu typography) and the
 * village scenes in /public/game/village. Quest chain source:
 * docs/02-strategy/game_of_being_you.md §13.3 / §13.4.
 *
 * All copy lives in COPY below (draft for Sasha's review).
 */

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=IBM+Plex+Mono:wght@300;400&display=swap";

const scene = (name: string) => `/game/village/${name}.webp`;

const COPY = {
  tabTitle: "The Digital Village · Investor Room",
  hero: {
    kicker: "Investor Room",
    title: "The Digital Village",
    line: "A game where founders discover their uniqueness, find their people, and build the business only they can build.",
    scrollHint: "Scroll",
    sceneAlt: "A moonlit map of the Digital Village: small lit places scattered along a winding path",
  },
  thesis: {
    kicker: "The thesis",
    items: [
      {
        label: "The world",
        body: "A living digital village, each place a module that already works: Gate, House, Quest Board, Oracle, Café, Co-working, Fire Circle, Academy, Workshop, Market, Town Hall.",
      },
      {
        label: "The engine",
        body: "An incubator of original businesses. The quest chain ends in a real-world proof: the player's first paid sale.",
      },
      {
        label: "The node",
        body: "A physical village in San Pancho, Nayarit, where the digital world meets in person: retreats, masterminds, stays.",
      },
    ],
  },
  path: {
    kicker: "The path to the glass slipper",
    title: "Nine steps. The last one happens in the real world.",
    steps: [
      { place: "Gate", step: "Pass the uniqueness test and enter the village", scene: "gate" },
      { place: "House", step: "Keep describing your character", scene: "house" },
      { place: "House", step: "Say your uniqueness in one sentence", scene: "house" },
      { place: "Workshop", step: "Receive the tagline of your business", scene: "workshop" },
      { place: "Academy", step: "Learn how the path of uniqueness works", scene: "academy" },
      { place: "Fire Circle", step: "Sit in the mastermind", scene: "fire-circle" },
      { place: "Academy", step: "Complete the 21-day mastery practice", scene: "academy" },
      { place: "Market", step: "Name your price to a client, for the first time", scene: "market" },
      { place: "Town Hall", step: "Make your first sale: the first real «yes» from the world", scene: "town-hall" },
    ],
  },
  numbers: {
    kicker: "Live numbers",
    note: "Aggregate counts only, read live. No names, no personal data.",
    profiles: "players in the village",
    talents: "players who found their top talent",
  },
  team: {
    kicker: "The team",
    members: [
      { name: "Aleksandr Konstantinov", role: "Founder. Holonic architect of the game and the business behind it." },
      { name: "Evolver", role: "The AI co-founder. Runs operations and builds in public." },
    ],
  },
  enter: {
    kicker: "Enter",
    play: { label: "Play the game", to: "/" },
    talk: { label: "Talk to Aleksandr", href: "https://t.me/integralevolution" },
    sceneAlt: "The village gate at night, a lantern lit",
  },
  footer: "© 2026 FindYourTopTalent",
};

const usePrefersReducedMotion = () => {
  const [reduce, setReduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
};

/** Fades a block in once, when it scrolls into view. Static under reduced motion. */
const Reveal = ({
  children,
  reduceMotion,
  className = "",
}: {
  children: ReactNode;
  reduceMotion: boolean;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduceMotion]);
  const show = reduceMotion || seen;
  return (
    <div ref={ref} className={`ir-reveal${show ? " is-in" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
};

type Counts = { profiles: number | null; talents: number | null };

const TALENT_ROW_CAP = 1000;

/**
 * Aggregate counts through the existing client, no new tables / RPCs.
 *
 * Today `game_profiles` and `zog_snapshots` are owner-scoped by RLS, so an
 * anonymous visitor gets 0 rows back (no error) and a signed-in one gets only
 * their own. A number is therefore trusted only if it is greater than one
 * distinct user, which can only happen when RLS really exposes an aggregate.
 * Otherwise the number stays null and its line is not rendered.
 */
const useLiveCounts = (): Counts => {
  const [counts, setCounts] = useState<Counts>({ profiles: null, talents: null });
  useEffect(() => {
    let cancelled = false;

    (async () => {
      let profiles: number | null = null;
      let talents: number | null = null;

      try {
        const { count, error } = await supabase
          .from("game_profiles")
          .select("id", { count: "exact", head: true });
        if (!error && typeof count === "number" && count > 1) profiles = count;
      } catch {
        /* hide */
      }

      try {
        const { data, error } = await supabase
          .from("zog_snapshots")
          .select("profile_id")
          .limit(TALENT_ROW_CAP);
        if (!error && data) {
          const distinct = new Set(data.map((r) => r.profile_id).filter(Boolean)).size;
          if (distinct > 1) talents = distinct;
        }
      } catch {
        /* hide */
      }

      if (!cancelled) setCounts({ profiles, talents });
    })();

    return () => {
      cancelled = true;
    };
  }, []);
  return counts;
};

const InvestorRoom = () => {
  const reduceMotion = usePrefersReducedMotion();
  const counts = useLiveCounts();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
    const prevTitle = document.title;
    document.title = COPY.tabTitle;
    return () => {
      link.remove();
      document.title = prevTitle;
    };
  }, []);

  const numbers = [
    { value: counts.profiles, label: COPY.numbers.profiles },
    { value: counts.talents, label: COPY.numbers.talents },
  ].filter((n): n is { value: number; label: string } => n.value !== null);

  return (
    <div className="ir-root">
      <div className="ir-grain" aria-hidden="true" />
      <main>
        <section className="ir-room ir-hero" aria-labelledby="ir-hero-h">
          <img
            className="ir-scene ir-scene--hero"
            src={scene("map")}
            alt={COPY.hero.sceneAlt}
            decoding="async"
            style={reduceMotion ? { animation: "none" } : undefined}
          />
          <div className="ir-veil ir-veil--hero" aria-hidden="true" />
          <div className="ir-hero__copy">
            <p className="ir-mono">{COPY.hero.kicker}</p>
            <h1 id="ir-hero-h">{COPY.hero.title}</h1>
            <p className="ir-lede">{COPY.hero.line}</p>
          </div>
          <p className="ir-mono ir-hint" aria-hidden="true">{COPY.hero.scrollHint}</p>
        </section>

        <section className="ir-room" aria-labelledby="ir-thesis-h">
          <img className="ir-scene" src={scene("town-hall")} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <div className="ir-veil" aria-hidden="true" />
          <div className="ir-inner">
            <Reveal reduceMotion={reduceMotion}>
              <p className="ir-mono ir-kicker" id="ir-thesis-h">{COPY.thesis.kicker}</p>
            </Reveal>
            <ol className="ir-thesis">
              {COPY.thesis.items.map((item) => (
                <li key={item.label}>
                  <Reveal reduceMotion={reduceMotion}>
                    <span className="ir-mono ir-label">{item.label}</span>
                    <p>{item.body}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="ir-room" aria-labelledby="ir-path-h">
          <img className="ir-scene" src={scene("quest-board")} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <div className="ir-veil" aria-hidden="true" />
          <div className="ir-inner ir-inner--narrow">
            <Reveal reduceMotion={reduceMotion}>
              <p className="ir-mono ir-kicker">{COPY.path.kicker}</p>
              <h2 id="ir-path-h">{COPY.path.title}</h2>
            </Reveal>
            <ol className="ir-path">
              {COPY.path.steps.map((s, i) => (
                <li key={s.step} className={i === COPY.path.steps.length - 1 ? "is-final" : undefined}>
                  <Reveal reduceMotion={reduceMotion} className="ir-path__row">
                    <img className="ir-vignette" src={scene(s.scene)} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                    <div>
                      <span className="ir-mono">{String(i + 1).padStart(2, "0")} · {s.place}</span>
                      <p>{s.step}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {numbers.length > 0 && (
          <section className="ir-room ir-room--short" aria-labelledby="ir-num-h">
            <img className="ir-scene" src={scene("market")} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <div className="ir-veil" aria-hidden="true" />
            <div className="ir-inner">
              <Reveal reduceMotion={reduceMotion}>
                <p className="ir-mono ir-kicker" id="ir-num-h">{COPY.numbers.kicker}</p>
                <ul className="ir-numbers">
                  {numbers.map((n) => (
                    <li key={n.label}>
                      <span className="ir-figure">{n.value.toLocaleString("en-US")}{n.label === COPY.numbers.talents && n.value >= TALENT_ROW_CAP ? "+" : ""}</span>
                      <span className="ir-mono">{n.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="ir-note">{COPY.numbers.note}</p>
              </Reveal>
            </div>
          </section>
        )}

        <section className="ir-room ir-room--short" aria-labelledby="ir-team-h">
          <img className="ir-scene" src={scene("fire-circle")} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <div className="ir-veil" aria-hidden="true" />
          <div className="ir-inner">
            <Reveal reduceMotion={reduceMotion}>
              <p className="ir-mono ir-kicker" id="ir-team-h">{COPY.team.kicker}</p>
            </Reveal>
            <ul className="ir-team">
              {COPY.team.members.map((m) => (
                <li key={m.name}>
                  <Reveal reduceMotion={reduceMotion}>
                    <h3>{m.name}</h3>
                    <p>{m.role}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ir-room ir-enter" aria-labelledby="ir-enter-h">
          <img className="ir-scene" src={scene("gate")} alt={COPY.enter.sceneAlt} loading="lazy" decoding="async" />
          <div className="ir-veil ir-veil--enter" aria-hidden="true" />
          <div className="ir-inner">
            <Reveal reduceMotion={reduceMotion}>
              <p className="ir-mono ir-kicker" id="ir-enter-h">{COPY.enter.kicker}</p>
              <div className="ir-actions">
                <Link className="ir-btn ir-btn--primary" to={COPY.enter.play.to}>
                  {COPY.enter.play.label} →
                </Link>
                <a className="ir-btn" href={COPY.enter.talk.href} target="_blank" rel="noopener noreferrer">
                  {COPY.enter.talk.label} →
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <footer className="ir-foot">
        <p className="ir-mono">{COPY.footer}</p>
      </footer>
    </div>
  );
};

export default InvestorRoom;
