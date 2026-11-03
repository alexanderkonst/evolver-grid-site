import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  INTRO_BASE,
  INTRO_CLIPS,
  INTRO_ELEMENTS,
  INTRO_FRAMES,
  INTRO_OUTRO_MS,
  INTRO_OVERLAYS,
  INTRO_SKIP_AFTER_MS,
  type IntroFrame,
  type IntroPos,
} from "@/data/introSequence";
import {
  captionLayout,
  coverRect,
  overlayPhase,
  playLength,
  portalEase,
  portalFrame,
  slotTime,
  stillLayers,
  type CaptionLayout,
  type OverlayPhase,
} from "@/lib/introTimeline";
import { markCinematicIntroSeen } from "@/lib/firstVisit";
import { startIntroAmbience } from "@/lib/introAmbience";
import { tr } from "@/lib/villageCopy";
import "./IntroSequence.css";

/**
 * IntroSequence — the cinematic intro (intro v2, Sasha's script of 2026-11-02).
 *
 * NEW GAME on the title screen → /village/reception with `state.intro`. The Entry Portal
 * renders underneath and this full-screen layer plays over it: eight clips back to back
 * (src/data/introSequence.ts), text overlaid in code. On the last clip's tail (the V4b vortex)
 * START GAME ignites in the exact place of the Entry Portal's own button, then the layer
 * dissolves away and the player is on the live Entry Portal with that button already there.
 * No picture of the portal is shown in between (#307).
 *
 * A clip that is not in public/game/intro/ plays its still frames instead (slow Ken Burns +
 * dissolves), so the sequence always runs end to end. prefers-reduced-motion: stills only,
 * plain fades. Skip (bottom-right, after 1.5 s) or Esc jumps to the Entry Portal.
 */

type Props = {
  /** Called once the layer has dissolved: the live Entry Portal is now the screen. */
  onDone: (how: "ended" | "skipped") => void;
  /** The live START GAME control to ignite over (cloned at its exact place and style). */
  anchorSelector: string;
  /** The live Entry Portal scene image the last clip lands on (see `portal` in introSequence.ts). */
  sceneSelector?: string;
};

type Mode = "video" | "still";

const FRAMES: IntroFrame[] = [
  "f1-title",
  "f2-fifth",
  "f3-village-wide",
  "f4-close-lunar",
  "f5-close-lit",
  "f6-close-golden",
  "f7-pavilion",
  // No f8-entry-portal: the portal's picture is never shown inside the intro (#307).
];

const frameSrc = (f: IntroFrame) => `${INTRO_FRAMES}/${f}.webp`;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** HEAD-probe a clip: the first playable file (webm, then mp4), or null. Missing is normal. */
const probeClip = async (name: string): Promise<string | null> => {
  const test = document.createElement("video");
  const exts = [
    ...(test.canPlayType('video/webm; codecs="vp9"') || test.canPlayType("video/webm") ? ["webm"] : []),
    "mp4",
  ];
  for (const ext of exts) {
    const url = `${INTRO_BASE}/${name}.${ext}`;
    try {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch(url, { method: "HEAD", signal: ctrl.signal, cache: "no-cache" });
      window.clearTimeout(timer);
      // An SPA fallback answers 200 with text/html: that is not a clip.
      if (res.ok && (res.headers.get("content-type") ?? "").startsWith("video/")) return url;
    } catch {
      /* offline / aborted: treat as missing */
    }
  }
  return null;
};

/** Fraction 0…1 from one object-position token ("10%", "center"…); px or unknown → centre. */
const posFrac = (tok: string | undefined): number => {
  if (!tok) return 0.5;
  if (tok.endsWith("%")) return Math.min(1, Math.max(0, parseFloat(tok) / 100));
  return tok === "left" || tok === "top" ? 0 : tok === "right" || tok === "bottom" ? 1 : 0.5;
};

/** Where the live scene image draws its picture on screen (object-fit: cover), or null. */
const sceneRect = (selector: string) => {
  const img = document.querySelector<HTMLImageElement>(selector);
  if (!img || !img.naturalWidth) return null;
  const r = img.getBoundingClientRect();
  const [px, py] = getComputedStyle(img).objectPosition.split(/\s+/);
  return coverRect({ x: r.left, y: r.top, w: r.width, h: r.height }, img.naturalWidth, img.naturalHeight, posFrac(px), posFrac(py));
};

/** A copy of the live control, with its computed look frozen inline, for the ignite. */
const cloneControl = (el: HTMLElement): HTMLElement => {
  const copy = el.cloneNode(true) as HTMLElement;
  const cs = getComputedStyle(el);
  for (let i = 0; i < cs.length; i++) {
    const prop = cs[i];
    copy.style.setProperty(prop, cs.getPropertyValue(prop));
  }
  const rect = el.getBoundingClientRect();
  Object.assign(copy.style, {
    position: "static",
    margin: "0",
    transform: "none",
    animation: "none",
    transition: "none",
    opacity: "1",
    visibility: "visible",
    boxSizing: "border-box",
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    pointerEvents: "auto",
  });
  copy.removeAttribute("id");
  copy.removeAttribute("data-intro-anchor");
  copy.setAttribute("tabindex", "-1");
  copy.setAttribute("aria-hidden", "true");
  return copy;
};

const IntroSequence = ({ onDone, anchorSelector, sceneSelector = '[data-intro-anchor="scene"]' }: Props) => {
  const { t } = useTranslation();
  const reduce = useRef(prefersReducedMotion()).current;
  const rootRef = useRef<HTMLDivElement>(null);
  const vidRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const stillRefs = useRef<Partial<Record<IntroFrame, HTMLImageElement | null>>>({});
  const startSlotRef = useRef<HTMLDivElement>(null);

  // Timeline state lives in refs (read every animation frame); React only hears about phase changes.
  const clips = useRef<Record<string, Promise<string | null>>>({});
  const urls = useRef<Record<string, string | null | undefined>>({});
  const cur = useRef({ clip: -1, mode: "still" as Mode, slot: 0, startedAt: 0, waiting: false });
  const muted = useRef(false);
  const finished = useRef(false);
  // Quiet night air under the silent clips (WebAudio), in after NEW GAME, out at the portal.
  const bed = useRef<ReturnType<typeof startIntroAmbience> | null>(null);

  const [phases, setPhases] = useState<Record<string, OverlayPhase>>({});
  const [videoOn, setVideoOn] = useState<[boolean, boolean]>([false, false]);
  const [skipOn, setSkipOn] = useState(false);
  const [out, setOut] = useState<"" | "ended" | "skipped">("");
  const [layout, setLayout] = useState<CaptionLayout>(() => captionLayout(window.innerWidth, window.innerHeight));
  const [startRect, setStartRect] = useState<DOMRect | null>(null);

  const finish = useCallback(
    (how: "ended" | "skipped") => {
      if (finished.current) return;
      finished.current = true;
      markCinematicIntroSeen();
      setOut(how);
      // Sound leaves with the picture.
      const vids = vidRefs.map((r) => r.current).filter(Boolean) as HTMLVideoElement[];
      const t0 = performance.now();
      const ms = how === "skipped" ? 450 : INTRO_OUTRO_MS;
      bed.current?.stop(how === "skipped" ? 450 : 1800);
      const fade = () => {
        const k = Math.min(1, (performance.now() - t0) / ms);
        vids.forEach((v) => {
          v.volume = Math.max(0, 1 - k);
        });
        if (k < 1) requestAnimationFrame(fade);
        else vids.forEach((v) => v.pause());
      };
      requestAnimationFrame(fade);
      window.setTimeout(() => onDone(how), ms);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onDone],
  );

  // The page under the intro does not scroll, and no key reaches it (Esc skips).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (finished.current) return;
      if (e.key === "Tab") return;
      e.stopImmediatePropagation();
      if (e.key === "Escape") {
        e.preventDefault();
        finish("skipped");
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey, { capture: true });
    };
  }, [finish]);

  useEffect(() => {
    const id = window.setTimeout(() => setSkipOn(true), INTRO_SKIP_AFTER_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    bed.current = startIntroAmbience(2500);
    return () => bed.current?.stop(300);
  }, []);

  useEffect(() => {
    const onResize = () => {
      setLayout(captionLayout(window.innerWidth, window.innerHeight));
      if (startRect) {
        const el = document.querySelector<HTMLElement>(anchorSelector);
        if (el) setStartRect(el.getBoundingClientRect());
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [anchorSelector, startRect]);

  // START GAME: clone the live control into its slot the moment it ignites.
  useEffect(() => {
    if (phases.start !== "in" || startRect) return;
    const el = document.querySelector<HTMLElement>(anchorSelector);
    const slot = startSlotRef.current;
    if (!el || !slot) return;
    const copy = cloneControl(el);
    copy.addEventListener("click", (e) => {
      e.preventDefault();
      // Straight into the game, the same as the live button.
      finished.current = true;
      markCinematicIntroSeen();
      bed.current?.stop(400);
      onDone("ended");
      window.setTimeout(() => el.click(), 0);
    });
    slot.replaceChildren(copy);
    setStartRect(el.getBoundingClientRect());
  }, [phases.start, anchorSelector, startRect, onDone]);

  // The clock: probes, clip swaps, still dissolves and overlay phases, every animation frame.
  useEffect(() => {
    let raf = 0;
    let alive = true;
    for (const c of INTRO_CLIPS) {
      const p = reduce ? Promise.resolve(null) : probeClip(c.name);
      clips.current[c.name] = p;
      p.then((u) => {
        urls.current[c.name] = u;
      });
    }

    const video = (slot: number) => vidRefs[slot].current;

    const load = (slot: number, url: string, start: number, rate = 1) => {
      const v = video(slot);
      if (!v) return;
      v.muted = muted.current;
      v.volume = 1;
      v.defaultPlaybackRate = rate;
      v.playbackRate = rate;
      if (v.dataset.src !== url) {
        v.dataset.src = url;
        v.src = url;
        v.preload = "auto";
        v.load();
      }
      const seek = () => {
        if (start > 0) v.currentTime = start;
      };
      if (v.readyState >= 1) seek();
      else v.addEventListener("loadedmetadata", seek, { once: true });
    };

    const play = async (v: HTMLVideoElement): Promise<boolean> => {
      try {
        await v.play();
        return true;
      } catch (err) {
        if ((err as DOMException)?.name === "NotAllowedError" && !muted.current) {
          // Autoplay with sound refused: carry on muted for the whole sequence.
          muted.current = true;
          vidRefs.forEach((r) => {
            if (r.current) r.current.muted = true;
          });
          try {
            await v.play();
            return true;
          } catch {
            return false;
          }
        }
        return false;
      }
    };

    const preloadNext = (i: number, slot: number) => {
      const next = INTRO_CLIPS[i + 1];
      if (!next) return;
      void clips.current[next.name]?.then((u) => {
        if (u && alive && cur.current.clip === i) load(slot, u, next.start ?? 0, next.rate ?? 1);
      });
    };

    const enter = async (i: number) => {
      if (!alive || finished.current) return;
      if (i >= INTRO_CLIPS.length) {
        finish("ended");
        return;
      }
      const c = INTRO_CLIPS[i];
      const st = cur.current;
      const prevSlot = st.slot;
      // The next clip goes into the other video (it was preloaded there).
      const slot = st.clip < 0 ? 0 : 1 - prevSlot;
      st.waiting = true;
      // The probe usually finished long ago; never hold the picture for it.
      await Promise.race([clips.current[c.name], new Promise((r) => window.setTimeout(r, 400))]);
      if (!alive || finished.current) return;
      const url = urls.current[c.name];
      if (url) {
        load(slot, url, c.start ?? 0, c.rate ?? 1);
        const v = video(slot);
        const ok = v ? await play(v) : false;
        if (!alive || finished.current) return;
        if (ok && v) {
          cur.current = { clip: i, mode: "video", slot, startedAt: performance.now(), waiting: false };
          setVideoOn(slot === 0 ? [true, false] : [false, true]);
          const prev = video(prevSlot);
          if (prev && prevSlot !== slot) prev.pause();
          preloadNext(i, 1 - slot);
          return;
        }
      }
      cur.current = { clip: i, mode: "still", slot: prevSlot, startedAt: performance.now(), waiting: false };
      setVideoOn([false, false]);
      preloadNext(i, slot);
    };

    const pos = (): IntroPos => {
      const st = cur.current;
      if (st.clip < 0) return { clip: 0, t: 0 };
      const c = INTRO_CLIPS[st.clip];
      if (st.mode === "video") {
        const v = video(st.slot);
        return { clip: st.clip, t: v ? slotTime(c, v.currentTime) : 0 };
      }
      return { clip: st.clip, t: (performance.now() - st.startedAt) / 1000 };
    };

    let lastKey = "";
    const tick = () => {
      if (!alive) return;
      const st = cur.current;
      const p = pos();
      if (st.clip >= 0 && !st.waiting && !finished.current) {
        const c = INTRO_CLIPS[st.clip];
        if (st.mode === "video") {
          const v = video(st.slot);
          const len = playLength(c, v?.duration);
          if (!v || v.ended || p.t >= len - 0.03) {
            v?.pause();
            void enter(st.clip + 1);
          } else if (v.error) {
            // The file broke mid-way: finish this clip on its stills, from the same moment.
            cur.current = { ...st, mode: "still", startedAt: performance.now() - p.t * 1000 };
            setVideoOn([false, false]);
          }
        } else if (p.t >= (c.duration ? Math.min(c.duration, c.length) : c.length)) {
          void enter(st.clip + 1);
        }
      }

      // A clip with `portal` lands on the live Entry Portal: its video box eases from covering
      // the screen to lying exactly on the portal's picture (also while the layer dissolves).
      // No clip uses it since #307; every clip covers the screen.
      vidRefs.forEach((r, i) => {
        const v = r.current;
        if (!v) return;
        const c = st.clip >= 0 ? INTRO_CLIPS[st.clip] : undefined;
        const scene = c?.portal && st.mode === "video" && i === st.slot ? sceneRect(sceneSelector) : null;
        if (c?.portal && scene) {
          const f = portalFrame(window.innerWidth, window.innerHeight, c.portal.gate, scene, portalEase(p.t, c.portal.settle));
          v.dataset.portal = "1";
          Object.assign(v.style, {
            inset: "auto",
            left: `${f.x}px`,
            top: `${f.y}px`,
            width: `${f.w}px`,
            height: `${f.h}px`,
            maxWidth: "none",
            maxHeight: "none",
            objectFit: "fill",
          });
        } else if (v.dataset.portal) {
          delete v.dataset.portal;
          for (const k of ["inset", "left", "top", "width", "height", "maxWidth", "maxHeight", "objectFit"] as const) v.style[k] = "";
        }
      });

      // Stills: the frames of the current clip, everything else hidden.
      const clipNow = INTRO_CLIPS[Math.max(0, st.clip)];
      const layers = st.clip < 0 ? [{ frame: "f1-title" as IntroFrame, opacity: 1 }] : stillLayers(clipNow, p.t);
      // Stills stay under a playing clip too: a clip frame that is late to paint shows its own
      // still, never an older picture.
      const showStills = true;
      for (const f of FRAMES) {
        const img = stillRefs.current[f];
        if (!img) continue;
        const layer = layers.find((l) => l.frame === f);
        const o = showStills && layer ? layer.opacity : 0;
        img.style.opacity = String(o);
        img.classList.toggle("is-kb", o > 0);
      }

      // Overlays: tell React only when a phase changes.
      const next: Record<string, OverlayPhase> = {};
      for (const o of INTRO_OVERLAYS) next[o.id] = st.clip < 0 ? "before" : overlayPhase(o, p);
      const key = JSON.stringify(next);
      if (key !== lastKey) {
        lastKey = key;
        setPhases(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Go: wait (briefly) for the first clip's probe, then start. `?introFrom=V4b` starts at a
    // later clip, for reviewing a clip once it has been dropped in.
    const from = new URLSearchParams(window.location.search).get("introFrom");
    const firstIndex = Math.max(0, INTRO_CLIPS.findIndex((c) => c.name === from));
    const first = INTRO_CLIPS[firstIndex].name;
    Promise.race([clips.current[first], new Promise((r) => window.setTimeout(r, 1500))]).then(() => {
      void enter(firstIndex);
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      vidRefs.forEach((r) => r.current?.pause());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phaseClass = (id: string) => `is-${phases[id] ?? "before"}`;
  const fadeVar = (id: string) => {
    const o = INTRO_OVERLAYS.find((x) => x.id === id);
    return { "--intro-fade": `${o?.fade ?? 0.7}s`, "--intro-ignite": `${o?.ignite ?? 0.25}s` } as CSSProperties;
  };

  // Portalled to <body>: above the page's own floating controls (language, chat, logo).
  return createPortal(
    <div
      ref={rootRef}
      className={`intro-root${out ? ` is-out is-out--${out}` : ""}${reduce ? " is-reduced" : ""}`}
      style={{ "--intro-out": `${out === "skipped" ? 450 : INTRO_OUTRO_MS}ms` } as CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label={tr(t, "intro.aria", "Intro")}
    >
      <div className="intro-stage" aria-hidden="true">
        {FRAMES.map((f) => (
          <img
            key={f}
            ref={(el) => {
              stillRefs.current[f] = el;
            }}
            className="intro-still"
            src={frameSrc(f)}
            alt=""
            decoding="async"
            style={{ opacity: f === "f1-title" ? 1 : 0 }}
          />
        ))}
        {vidRefs.map((r, i) => (
          <video
            key={i}
            ref={r}
            className={`intro-video${videoOn[i] ? " is-on" : ""}`}
            playsInline
            preload="auto"
            disablePictureInPicture
          />
        ))}
      </div>

      <div className="intro-copy" aria-live="polite">
        <p className={`intro-line intro-ignite ${phaseClass("fifth")}`} style={fadeVar("fifth")}>
          {tr(t, "intro.fifth", "You are the fifth element.")}
        </p>
        <p className={`intro-line intro-ignite ${phaseClass("village")}`} style={fadeVar("village")}>
          {tr(t, "intro.village", "You land in a village.")}
        </p>
      </div>

      <ul
        className={`intro-elements intro-elements--${layout.mode} intro-ignite ${phaseClass("elements")}`}
        style={{ ...fadeVar("elements"), ...(layout.mode === "stack" ? { top: layout.items[0].y } : {}) }}
      >
        {INTRO_ELEMENTS.map((e, i) => {
          const at = layout.items[i];
          const place = layout.mode === "frame" ? { left: at.x, top: at.y, width: layout.width } : undefined;
          return (
            <li key={e.key} style={place}>
              <span className="intro-el__name">{tr(t, `intro.elements.${e.key}.name`, e.name)}</span>
              <span className="intro-el__element">{tr(t, `intro.elements.${e.key}.element`, e.element)}</span>
              <span className="intro-el__line">{tr(t, `intro.elements.${e.key}.line`, e.line)}</span>
            </li>
          );
        })}
      </ul>

      <div
        ref={startSlotRef}
        className={`intro-start intro-ignite intro-ignite--soft ${phaseClass("start")}`}
        style={{
          ...fadeVar("start"),
          ...(startRect
            ? { left: startRect.left, top: startRect.top, width: startRect.width, height: startRect.height }
            : { visibility: "hidden" }),
        }}
      />

      <button
        type="button"
        className={`intro-skip${skipOn && !out ? " is-on" : ""}`}
        onClick={() => finish("skipped")}
        aria-label={tr(t, "intro.skipAria", "Skip intro")}
      >
        {tr(t, "intro.skip", "Skip")}
      </button>
    </div>,
    document.body,
  );
};

export default IntroSequence;
