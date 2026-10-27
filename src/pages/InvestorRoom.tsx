import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import "./InvestorRoom.css";

/**
 * InvestorRoom — a place in the Digital Village, public at `/investor` (issue #135).
 *
 * Same world as GameTitle (fonts, night palette, mono menu type) over the
 * village scenes in /game/village/*.webp. Every word of copy lives in COPY
 * below so Sasha can edit it without touching the layout.
 * Path source of truth: docs/02-strategy/game_of_being_you.md §13.3 / §13.4.
 */

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=IBM+Plex+Mono:wght@300;400&display=swap";

const scene = (name: string) => `/game/village/${name}.webp`;

const COPY = {
  tabTitle: "The Digital Village · Investor Room",
  hero: {
    eyebrow: "Investor Room",
    title: "The Digital Village",
    line: "A game where founders discover their uniqueness, find their people, and build the business only they can build.",
    scroll: "Scroll",
    image: scene("map"),
    alt: "A moonlit map of the Digital Village: small lit buildings along winding paths under a night sky",
  },
  thesis: {
    label: "The thesis",
    image: scene("coworking"),
    lines: [
      {
        name: "The world",
        text: "A living digital village. Each place is a module that already works: Gate, House, Quest Board, Oracle, Café, Co-working, Fire Circle, Academy, Workshop, Market, Town Hall.",
      },
      {
        name: "The engine",
        text: "An incubator of original businesses. The quest chain ends in a real-world proof: the player's first paid sale.",
      },
      {
        name: "The node",
        text: "A physical village in San Pancho, Nayarit, where the digital world meets in person: retreats, masterminds, stays.",
      },
    ],
  },
  path: {
    label: "The path to the glass slipper",
    title: "One quest chain. Every step ends in something real.",
    image: scene("house"),
    steps: [
      { place: "Gate", step: "Pass the uniqueness test and enter the village", scene: "gate" },
      { place: "House", step: "Keep describing your character", scene: "house" },
      { place: "House", step: "Say your uniqueness in one sentence", scene: "house" },
      { place: "Workshop", step: "Receive the tagline of your business", scene: "workshop" },
      { place: "Academy", step: "Learn how the path of uniqueness works", scene: "academy" },
      { place: "Fire Circle", step: "Come to the Mastermind", scene: "fire-circle" },
      { place: "Quest Board", step: "Walk the 21-day practice", scene: "quest-board" },
      { place: "Market", step: "Name your price to a client", scene: "market" },
      { place: "Town Hall", step: "Make your first sale", scene: "town-hall", finale: true },
    ],
  },
  numbers: {
    label: "The village, right now",
    image: scene("oracle"),
    note: "Aggregate counts, read live. No names, no personal data.",
    // Counts are read in useLiveCounts. A number that errors or is zero is
    // hidden, never faked.
    metrics: [{ key: "chosen", label: "players who chose a mission and opted to be seen" }],
  },
  team: {
    label: "The team",
    image: scene("cafe"),
    members: [
      { name: "Aleksandr Konstantinov", role: "Founder", line: "Architect of the village and the path through it." },
      { name: "Evolver", role: "AI co-founder", line: "Runs operations and builds in public." },
    ],
  },
  enter: {
    label: "Enter",
    image: scene("fire-circle"),
    play: { label: "Play the game", to: "/" }, // → "/village" once #134 is merged
    talk: { label: "Talk to Aleksandr", href: "https://t.me/integralevolution" },
    foot: "© 2026 FindYourTopTalent",
  },
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

/** Fades its children in once, the first time they scroll into view. */
const Reveal = ({ children, reduceMotion, className = "" }: { children: ReactNode; reduceMotion: boolean; className?: string }) => {
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

  const shown = reduceMotion || seen;
  return (
    <div ref={ref} className={`ir-reveal${shown ? " is-in" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
};

/** One room: a dimmed village scene behind a single column of content. */
const Room = ({
  id,
  image,
  label,
  children,
  tall = false,
}: {
  id: string;
  image: string;
  label: string;
  children: ReactNode;
  tall?: boolean;
}) => (
  <section className={`ir-room${tall ? " ir-room--tall" : ""}`} id={id} aria-labelledby={`${id}-label`}>
    <img className="ir-room__img" src={image} alt="" aria-hidden="true" loading="lazy" decoding="async" />
    <div className="ir-room__veil" aria-hidden="true" />
    <div className="ir-room__inner">
      <p className="ir-mono ir-label" id={`${id}-label`}>{label}</p>
      {children}
    </div>
  </section>
);

/**
 * Aggregate head-only counts, anonymous-readable sources only. game_profiles
 * and zog_snapshots are owner-scoped by RLS (an anon count would be 0, a
 * signed-in count would be the visitor's own rows), so they are not counted
 * here. Anything that errors or is zero stays hidden.
 */
const useLiveCounts = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Consenting participants only, so a signed-in visitor sees the same number as anon.
        const { count, error } = await supabase
          .from("mission_participants_public")
          .select("id", { count: "exact", head: true })
          .eq("share_consent", true);
        if (cancelled || error || !count || count < 1) return;
        setCounts((prev) => ({ ...prev, chosen: count }));
      } catch {
        /* hidden, never faked */
      }
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
  const visible = COPY.numbers.metrics.filter((m) => counts[m.key] !== undefined);

  // Fonts + tab title, scoped to this page (same pattern as GameTitle).
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

  return (
    <div className="ir-root">
      <div className="ir-grain" aria-hidden="true" />
      <main>
        <section className="ir-hero" aria-label="The Digital Village">
          <img
            className="ir-hero__img"
            src={COPY.hero.image}
            alt={COPY.hero.alt}
            decoding="async"
            style={reduceMotion ? { animation: "none" } : undefined}
          />
          <div className="ir-hero__veil" aria-hidden="true" />
          <div className="ir-hero__copy">
            <p className="ir-mono">{COPY.hero.eyebrow}</p>
            <h1>{COPY.hero.title}</h1>
            <p className="ir-hero__line">{COPY.hero.line}</p>
          </div>
          <p className="ir-scroll ir-mono" aria-hidden="true">{COPY.hero.scroll}</p>
        </section>

        <Room id="thesis" image={COPY.thesis.image} label={COPY.thesis.label}>
          <ol className="ir-thesis">
            {COPY.thesis.lines.map((line) => (
              <li key={line.name}>
                <Reveal reduceMotion={reduceMotion}>
                  <h2>{line.name}</h2>
                  <p>{line.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Room>

        <Room id="path" image={COPY.path.image} label={COPY.path.label} tall>
          <h2 className="ir-title">{COPY.path.title}</h2>
          <ol className="ir-path">
            {COPY.path.steps.map((s) => (
              <li key={s.step} className={s.finale ? "is-finale" : undefined}>
                <Reveal reduceMotion={reduceMotion} className="ir-path__row">
                  <img
                    className="ir-vignette"
                    src={scene(s.scene)}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <p className="ir-mono">{s.place}</p>
                    <p className="ir-path__step">{s.step}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </Room>

        {visible.length > 0 && (
          <Room id="numbers" image={COPY.numbers.image} label={COPY.numbers.label}>
            <Reveal reduceMotion={reduceMotion}>
              <ul className="ir-numbers">
                {visible.map((m) => (
                  <li key={m.key}>
                    <span className="ir-numbers__n">{counts[m.key].toLocaleString("en-US")}</span>
                    <span className="ir-numbers__l">{m.label}</span>
                  </li>
                ))}
              </ul>
              <p className="ir-mono ir-note">{COPY.numbers.note}</p>
            </Reveal>
          </Room>
        )}

        <Room id="team" image={COPY.team.image} label={COPY.team.label}>
          <ul className="ir-team">
            {COPY.team.members.map((p) => (
              <li key={p.name}>
                <Reveal reduceMotion={reduceMotion}>
                  <h2>{p.name}</h2>
                  <p className="ir-mono">{p.role}</p>
                  <p className="ir-team__line">{p.line}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </Room>

        <Room id="enter" image={COPY.enter.image} label={COPY.enter.label}>
          <Reveal reduceMotion={reduceMotion} className="ir-actions">
            <Link className="ir-btn" to={COPY.enter.play.to}>{COPY.enter.play.label} →</Link>
            <a className="ir-btn ir-btn--quiet" href={COPY.enter.talk.href} target="_blank" rel="noopener noreferrer">
              {COPY.enter.talk.label} →
            </a>
          </Reveal>
        </Room>
      </main>
      <footer className="ir-foot">
        <p className="ir-mono">{COPY.enter.foot}</p>
      </footer>
    </div>
  );
};

export default InvestorRoom;
