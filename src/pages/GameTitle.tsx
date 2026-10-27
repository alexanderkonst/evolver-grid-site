import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FONTS_HREF } from "@/lib/gameFonts";
import "./GameTitle.css";

/**
 * GameTitle — "THE GAME OF BEING YOU" title screen, the homepage at `/`.
 *
 * Source of truth: docs/02-strategy/game_of_being_you.md (§2, §4, §5).
 * Reference mockup: docs/assets/game-of-being-you/homepage_mockup_v0.2.html.
 * Copy says "Uniqueness", never "Genius" (route paths keep their old names).
 * The previous homepage (JourneyPage) stays reachable at `/journey`.
 */

const HERO_SRC = "/game/hero_forest.webp";
// The Telegram contact CTA now lives inside the room itself (InvestorRoom.tsx).
const INVESTOR_HREF = "/investor";

type MenuItem = {
  key: string;
  label: string;
  hint: string;
  to: string;
};

const LEVELS = [
  { title: "Know your character", body: "Describe your talents, resources, dedication, craft and quality of life." },
  { title: "Forge your unique business", body: "Turn who you are into a scalable offer only you can make." },
  { title: "Enter multiplayer", body: "Join collaborations with other players of the Golden Age." },
  { title: "Work, play & grow together", body: "Co-create, compound results, raise your quality of life." },
];

type SolidName = "cube" | "icosa" | "dodeca" | "octa" | "tetra";

const SOLID_NAMES: Record<SolidName, string> = {
  cube: "cube",
  icosa: "icosahedron",
  dodeca: "dodecahedron",
  octa: "octahedron",
  tetra: "tetrahedron",
};

const PATHS: {
  solid: SolidName;
  name: string;
  element: string;
  line: string;
  unique?: boolean;
}[] = [
  { solid: "cube", name: "Body", element: "Earth", line: "Vitality and foundation" },
  { solid: "icosa", name: "Emotions", element: "Water", line: "Mastery of inner weather" },
  { solid: "dodeca", name: "Uniqueness", element: "Aether", line: "Your unique gift, refracted into the world", unique: true },
  { solid: "octa", name: "Mind", element: "Air", line: "Clarity and perception" },
  { solid: "tetra", name: "Spirit", element: "Fire", line: "The fire that moves you" },
];

/* ---------- Platonic solid geometry (vertices → edges by min distance) ---------- */

type Vec = [number, number, number];

const PHI = (1 + Math.sqrt(5)) / 2;
const INV_PHI = 1 / PHI;

const signs = (v: Vec): Vec[] => {
  const out: Vec[] = [];
  for (const a of [1, -1]) {
    for (const b of [1, -1]) {
      for (const c of [1, -1]) {
        const w: Vec = [v[0] * a, v[1] * b, v[2] * c];
        if (!out.some((u) => u[0] === w[0] && u[1] === w[1] && u[2] === w[2])) out.push(w);
      }
    }
  }
  return out;
};

const cyclic = (list: Vec[]): Vec[] => {
  const out: Vec[] = [];
  for (const v of list) out.push(v, [v[1], v[2], v[0]], [v[2], v[0], v[1]]);
  return out;
};

const CUBE = signs([1, 1, 1]);
const RAW_SOLIDS: Record<SolidName, Vec[]> = {
  cube: CUBE,
  tetra: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]],
  octa: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
  icosa: cyclic(signs([0, 1, PHI])),
  dodeca: CUBE.concat(cyclic(signs([0, INV_PHI, PHI]))),
};

type Shape = { verts: Vec[]; edges: [number, number][] };
const shapeCache = new Map<SolidName, Shape>();

const dist = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const getShape = (name: SolidName): Shape => {
  const cached = shapeCache.get(name);
  if (cached) return cached;
  const raw = RAW_SOLIDS[name];
  const radius = Math.max(...raw.map((v) => Math.hypot(v[0], v[1], v[2])));
  const verts = raw.map((v): Vec => [v[0] / radius, v[1] / radius, v[2] / radius]);
  let min = Infinity;
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) min = Math.min(min, dist(verts[i], verts[j]));
  }
  const edges: [number, number][] = [];
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      if (Math.abs(dist(verts[i], verts[j]) - min) < 1e-4) edges.push([i, j]);
    }
  }
  const shape = { verts, edges };
  shapeCache.set(name, shape);
  return shape;
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

/** Lightweight canvas wireframe: plain 2D projection, paused when off-screen. */
const PlatonicSolid = ({
  solid,
  label,
  index,
  accent,
  reduceMotion,
}: {
  solid: SolidName;
  label: string;
  index: number;
  accent: boolean;
  reduceMotion: boolean;
}) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const shape = getShape(solid);
    const phase = index * 1.3;
    const speed = 0.00009 + index * 0.000012;
    let size = 0;
    let dpr = 1;
    let raf = 0;

    const draw = (t: number) => {
      if (!size) return;
      const a = phase + t * speed;
      const b = 0.5 + Math.sin(t * 0.00005 + phase) * 0.35;
      const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      const radius = size * 0.36;
      const c = size / 2;
      const pts = shape.verts.map((v) => {
        const x = v[0] * ca + v[2] * sa;
        const z0 = -v[0] * sa + v[2] * ca;
        const y = v[1] * cb - z0 * sb;
        const z = v[1] * sb + z0 * cb;
        const f = 3.2 / (3.2 + z);
        return { x: c + x * radius * f, y: c + y * radius * f, z };
      });
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.lineWidth = 1;
      for (const [i, j] of shape.edges) {
        const p = pts[i], q = pts[j];
        const alpha = 0.55 - ((p.z + q.z) / 2) * 0.3;
        ctx.strokeStyle = accent
          ? `rgba(188,215,230,${alpha})`
          : `rgba(238,234,226,${alpha * 0.85})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    };

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      draw(0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Reduced motion: one static frame, no rotation.
    let io: IntersectionObserver | undefined;
    if (!reduceMotion) {
      io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          if (!raf) raf = requestAnimationFrame(loop);
        } else {
          stop();
        }
      });
      io.observe(canvas);
    }

    return () => {
      stop();
      ro.disconnect();
      io?.disconnect();
    };
  }, [solid, index, accent, reduceMotion]);

  return <canvas ref={ref} role="img" aria-label={label} />;
};

const GameTitle = () => {
  const reduceMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  // LOAD GAME → /auth, or into the Digital Village (/village) when a session
  // already exists.
  const [loadTo, setLoadTo] = useState("/auth");
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const items: MenuItem[] = [
    { key: "new", label: "New Game", hint: "Discover your Uniqueness", to: "/zone-of-genius/entry" },
    { key: "load", label: "Load Game", hint: "Continue your journey", to: loadTo },
    { key: "tutorial", label: "Tutorial", hint: "Free course · Activate Your Dormant Potential", to: "/grow/activate-your-dormant-potential" },
    { key: "multi", label: "Multiplayer", hint: "Mastermind & co-creation", to: "/build/mastermind" },
    { key: "about", label: "About", hint: "The story · Investor Room", to: "#about" },
  ];

  // Fonts + tab title, scoped to this page so index.html (and every other
  // page) stays untouched.
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
    const prevTitle = document.title;
    document.title = "The Game of Being You · FindYourTopTalent";
    return () => {
      link.remove();
      document.title = prevTitle;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled && data.session?.user?.id) setLoadTo("/village");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollToAbout = useCallback(() => {
    document
      .getElementById("about")
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [reduceMotion]);

  const select = useCallback((i: number, focus = false) => {
    const next = (i + 5) % 5;
    setActive(next);
    if (focus) linkRefs.current[next]?.focus({ preventScroll: true });
  }, []);

  // Keyboard: Up/Down move the cursor, Enter activates. PRESS START hides on
  // the first input of any kind.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (window.scrollY > window.innerHeight * 0.6) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setStarted(true);
        select(active + (e.key === "ArrowDown" ? 1 : -1), true);
      } else if (e.key === "Enter") {
        const el = document.activeElement;
        if (el && el.closest(".gt-menu")) return; // native link activation
        e.preventDefault();
        setStarted(true);
        linkRefs.current[active]?.click();
      }
    };
    const onScroll = () => {
      if (window.scrollY > 8) setStarted(true);
    };
    const onPointer = () => setStarted(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [active, select]);

  return (
    <div className="gt-root">
      <div className="gt-grain" aria-hidden="true" />
      <main>
        <section className="gt-screen" aria-label="Title screen">
          <img
            className="gt-screen__img"
            src={HERO_SRC}
            alt="A vertical beam of light descends through a crystal dodecahedron over a moonlit mountain lake; four small crystal solids (tetrahedron, icosahedron, cube, octahedron) rest on the misty horizon, catching its spectrum"
            decoding="async"
            style={reduceMotion ? { animation: "none" } : undefined}
          />
          <div className="gt-screen__copy">
            <header className="gt-screen__head">
            <h1>The Game of Being&nbsp;You</h1>
            <p className="gt-sub">Self-Discovery · Quality of Life · Uniqueness · Growth · Tribe</p>
            </header>
            <nav className="gt-menu-wrap" aria-label="Game menu">
              <ul className="gt-menu">
                {items.map((item, i) => {
                  const inner = (
                    <>
                      <span className="gt-cur" aria-hidden="true">▸</span>
                      {item.label}
                    </>
                  );
                  const common = {
                    ref: (el: HTMLAnchorElement | null) => {
                      linkRefs.current[i] = el;
                    },
                    onMouseEnter: () => {
                      if (i !== active) setStarted(true);
                      select(i);
                    },
                    onFocus: () => select(i),
                  };
                  return (
                    <li key={item.key} className={i === active ? "is-active" : undefined}>
                      {item.to.startsWith("#") ? (
                        <a
                          {...common}
                          href={item.to}
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToAbout();
                          }}
                        >
                          {inner}
                        </a>
                      ) : (
                        <Link {...common} to={item.to}>
                          {inner}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="gt-hint" aria-live="polite">{items[active].hint}</p>
              <hr className="gt-rule" />
              <p className="gt-tagline">Bring the full force of who you are to what you build.</p>
            </nav>
          </div>
          <p className={`gt-start${started ? " is-gone" : ""}`} aria-hidden="true">PRESS START</p>
        </section>

        <section className="gt-sec gt-fifth" id="fifth" aria-labelledby="gt-fifth-h">
          <div className="gt-center">
            <h2 id="gt-fifth-h">You Are The Fifth Element</h2>
            <ul className="gt-paths">
              {PATHS.map((p, i) => (
                <li key={p.solid} className={p.unique ? "is-unique" : undefined}>
                  <div className="gt-solid">
                    <img
                      className={`gt-gem gt-gem--${p.solid}`}
                      src={`/game/gems/gem_${p.solid}.png`}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      style={{ animationDelay: `${-i * 1.7}s` }}
                    />
                    <PlatonicSolid
                      solid={p.solid}
                      label={`Crystal ${SOLID_NAMES[p.solid]} inside its rotating wireframe`}
                      index={i}
                      accent={!!p.unique}
                      reduceMotion={reduceMotion}
                    />
                  </div>
                  <span className="gt-mono">{p.name}</span>
                  <span className="gt-mono gt-element">{p.element}</span>
                  <p>{p.line}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="gt-book gt-sec" id="how" aria-labelledby="gt-how-h">
          <div className="gt-book__inner">
            <p className="gt-mono gt-chapter">Chapter 01</p>
            <p className="gt-mono gt-label">Single Player → Multiplayer</p>
            <h2 id="gt-how-h">Four levels. One light, refracted into you.</h2>
            <ol className="gt-levels">
              {LEVELS.map((level, i) => (
                <li key={level.title} className={i === 0 ? "is-current" : undefined}>
                  <span className="gt-node">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{level.title}</h3>
                    <p>{level.body}</p>
                    {i === 0 && <span className="gt-mono">Level 01 · You are here</span>}
                  </div>
                </li>
              ))}
            </ol>
            <p className="gt-mono gt-folio">— 1 —</p>
          </div>
        </section>

        <section className="gt-sec" id="about" aria-labelledby="gt-about-h">
          <div className="gt-about">
            <p className="gt-mono">About</p>
            <h2 id="gt-about-h">A game designed to make you more yourself.</h2>
            <p className="gt-body">
              FindYourTopTalent turns self-discovery into a game you actually want to play — and a business that pays you for being who you are. Created by Aleksandr Konstantinov and built with Evolver, an AI co-founder.
            </p>
            <Link className="gt-enter" to={INVESTOR_HREF}>ENTER THE INVESTOR ROOM →</Link>
          </div>
        </section>
      </main>
      <footer className="gt-foot">
        <p className="gt-mono">© 2026 FindYourTopTalent</p>
      </footer>
    </div>
  );
};

export default GameTitle;
