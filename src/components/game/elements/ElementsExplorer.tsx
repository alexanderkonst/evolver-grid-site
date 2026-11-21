import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  ALL_ELEMENTS,
  CENTER,
  FIFTH_ELEMENT_HEADLINE,
  FIFTH_ELEMENT_LINE,
  elementById,
  hasWebGL,
  pathHref,
  prefersReducedMotion,
  sentence,
  type ElementDef,
  type ElementId,
} from "@/lib/elementsModel";
import ElementsFallback from "./ElementsFallback";

/**
 * ElementsExplorer — the five elements, playable (C1, /game/learn/elements).
 *
 * One scene, one panel, one row of five buttons:
 *   • the scene is a lazy react-three-fiber canvas (ElementsScene); until its chunk arrives,
 *     and for good when WebGL is missing or the canvas throws, a static SVG of the five
 *     stands in (ElementsFallback), and it is just as tappable;
 *   • the panel shows path, element and the meaning line (canon §2) with one button to the
 *     path; the center shows Aether and the «You are the fifth element» headline (§11);
 *   • the row of buttons selects the same solids from the keyboard and for screen readers
 *     (the canvas itself is decorative to them).
 *
 * Colours come from theme tokens only; motion follows `prefers-reduced-motion`.
 */

const ElementsScene = lazy(() => import("./ElementsScene"));

const surface = {
  background: "var(--surface-panel, rgba(255, 253, 248, 0.94))",
  border: "1px solid var(--skin-card-border, rgba(212, 175, 55, 0.3))",
  color: "var(--text-primary, #0a1628)",
} as const;

const mutedText = { color: "var(--text-muted, rgba(26, 30, 58, 0.78))" } as const;

const Swatch = ({ def }: { def: ElementDef }) => (
  <span
    aria-hidden="true"
    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
    style={{
      background: `var(${def.colorVar}, ${def.colorFallback})`,
      boxShadow: "0 0 0 1px var(--skin-text-primary, #0a1628)",
    }}
  />
);

export const ElementPanel = ({ def }: { def: ElementDef | null }) => {
  if (!def) {
    return (
      <p className="text-base italic text-center" style={mutedText}>
        Four orbit, one sits in the center. Tap a solid.
      </p>
    );
  }

  const isCenter = def.id === CENTER.id;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2" style={mutedText}>
        <Swatch def={def} />
        {def.path} · {def.element} · {sentence(def.solid)}
      </p>
      {isCenter ? (
        <>
          <h2 className="text-2xl sm:text-3xl font-semibold leading-tight mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {FIFTH_ELEMENT_HEADLINE}
          </h2>
          <p className="text-base leading-relaxed mb-1">
            Uniqueness is Aether: {def.meaning}.
          </p>
          <p className="text-sm leading-relaxed" style={mutedText}>
            {FIFTH_ELEMENT_LINE}
          </p>
        </>
      ) : (
        <>
          <h2 className="text-2xl sm:text-3xl font-semibold leading-tight mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {def.path}
          </h2>
          <p className="text-base leading-relaxed mb-3">
            {def.element}: {def.meaning}.
          </p>
          {def.pathId && (
            <Link
              to={pathHref(def.pathId)}
              className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: "var(--skin-cta-bg, #0a1628)",
                color: "var(--skin-cta-text, #ffffff)",
                border: "1px solid var(--skin-cta-border, transparent)",
              }}
            >
              Open the {def.path} path →
            </Link>
          )}
        </>
      )}
    </div>
  );
};

export interface ElementsExplorerProps {
  /** Start with this solid picked (used by tests and deep links). */
  initialSelected?: ElementId | null;
}

const ElementsExplorer = ({ initialSelected = null }: ElementsExplorerProps) => {
  const [selected, setSelected] = useState<ElementId | null>(initialSelected);
  const [webgl] = useState(hasWebGL);
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const fallback = <ElementsFallback selected={selected} onSelect={setSelected} />;
  const picked = selected ? elementById(selected) : null;

  return (
    <div className="w-full">
      <div
        className="relative w-full h-[min(58vh,420px)] min-h-[300px] rounded-3xl overflow-hidden"
        style={{ ...surface, background: "var(--surface-card, var(--surface-panel, transparent))" }}
        data-testid="elements-stage"
        data-mode={webgl ? "webgl" : "svg"}
      >
        {webgl ? (
          <ErrorBoundary fallback={fallback}>
            <Suspense fallback={fallback}>
              <ElementsScene selected={selected} onSelect={setSelected} reducedMotion={reduced} />
            </Suspense>
          </ErrorBoundary>
        ) : (
          fallback
        )}
      </div>

      <div className="mt-4 rounded-2xl p-5" style={surface} aria-live="polite" data-testid="elements-panel">
        <ElementPanel def={picked} />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2" role="group" aria-label="The five elements">
        {ALL_ELEMENTS.map((def) => (
          <button
            key={def.id}
            type="button"
            aria-pressed={selected === def.id}
            onClick={() => setSelected(selected === def.id ? null : def.id)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              ...surface,
              borderWidth: selected === def.id ? 2 : 1,
              opacity: selected && selected !== def.id ? 0.8 : 1,
            }}
          >
            <Swatch def={def} />
            {def.path} · {def.element}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ElementsExplorer;
