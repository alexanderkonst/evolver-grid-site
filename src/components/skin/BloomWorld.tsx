/**
 * BloomWorld — the app-root piece of the world's one colorfulness (issue #277).
 *
 * Mounted once, next to LunarWorldCache. It keeps no progress of its own: the level is derived
 * from the earned objects (src/lib/bloomEarned.ts, fed by useBloomSync) and cached; this
 * component only
 *   1. writes the level onto <html> as CSS custom properties (src/lib/bloom.ts), so every scene
 *      inherits it and src/styles/bloom.css does the rest;
 *   2. draws the horizon layer of the lit colors, and the brief glow when an object is earned
 *      (a new object's color lights for a moment; no sound: the app has no sound-effect hook);
 *   3. offers `?bloom=N` (0…9, `?bloom=off`) to preview any stage without touching the save.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BLOOM_GLOW_MS, BLOOM_MAX, BLOOM_PREVIEW_KEY } from "@/config/bloom";
import {
  BLOOM_CHANGED_EVENT,
  applyBloom,
  effectiveBloomLevel,
  stageColor,
  syncBloomPreview,
  type BloomChangedDetail,
} from "@/lib/bloom";

type Glow = { id: number; color: string };

export const BloomWorld = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [level, setLevel] = useState(() => effectiveBloomLevel());
  const [previewing, setPreviewing] = useState(() => {
    try {
      return window.sessionStorage.getItem(BLOOM_PREVIEW_KEY) !== null;
    } catch {
      return false;
    }
  });
  const [glow, setGlow] = useState<Glow | null>(null);
  const shownLevel = useRef(level);
  const glowSeq = useRef(0);

  const light = useCallback((next: number) => {
    glowSeq.current += 1;
    setGlow({ id: glowSeq.current, color: stageColor(next) });
  }, []);

  // The URL decides the preview; the cache decides the player's own level.
  useEffect(() => {
    const preview = syncBloomPreview(location.search);
    setPreviewing(preview !== null);
    setLevel(effectiveBloomLevel());
  }, [location.search]);

  // An object was earned (or the save moved): re-read, and glow when it is a new object.
  useEffect(() => {
    const onChanged = (e: Event) => {
      const next = effectiveBloomLevel();
      setLevel(next);
      if ((e as CustomEvent<BloomChangedDetail>).detail?.celebrate) light(next);
    };
    window.addEventListener(BLOOM_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(BLOOM_CHANGED_EVENT, onChanged);
  }, [light]);

  useEffect(() => {
    applyBloom(level);
    // Previewing a higher stage shows the moment too, so the glow can be checked stage by stage.
    if (previewing && level > shownLevel.current) light(level);
    shownLevel.current = level;
  }, [level, previewing, light]);

  useEffect(() => {
    if (!glow) return;
    const timer = window.setTimeout(() => setGlow(null), BLOOM_GLOW_MS);
    return () => window.clearTimeout(timer);
  }, [glow]);

  const exitPreview = () => {
    try {
      window.sessionStorage.removeItem(BLOOM_PREVIEW_KEY);
    } catch {
      // nothing stored to clear
    }
    const params = new URLSearchParams(location.search);
    params.delete("bloom");
    const search = params.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : "", hash: location.hash }, { replace: true });
    setPreviewing(false);
    setLevel(effectiveBloomLevel());
  };

  return (
    <>
      {/* Decorative: the lit colors along the horizon. Never takes a click, never carries text. */}
      <div className="bloom-sky" aria-hidden="true" />
      {glow && (
        <div
          key={glow.id}
          className="bloom-glow"
          aria-hidden="true"
          style={{ "--bloom-glow-color": glow.color, "--bloom-glow-ms": `${BLOOM_GLOW_MS}ms` } as CSSProperties}
        />
      )}
      {previewing && (
        <div className="bloom-chip" role="status">
          <span>
            Bloom preview {level}/{BLOOM_MAX}
          </span>
          <button type="button" onClick={exitPreview}>
            exit
          </button>
        </div>
      )}
    </>
  );
};
