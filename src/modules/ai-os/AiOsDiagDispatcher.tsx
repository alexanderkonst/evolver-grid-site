/**
 * AiOsDiagDispatcher — temporary iOS crash bisection harness, 2026-04-29.
 * REMOVE ENTIRELY ONCE THE CRASH IS DIAGNOSED.
 *
 * Reads ?diag= from the URL and renders one of four variants:
 *   (none)  → real AiOsPage (with Test A diagnostic banner already in place)
 *   ?diag=b → smoke <div>. AiOsPage module IS imported (so PROMPTS, etc.
 *             are evaluated at module load), but its component is NOT
 *             rendered. Isolates module-evaluation cost from render cost.
 *   ?diag=c → AiOsPage rendered with `__diagHeroOnly` flag — only the
 *             fixed background overlays + the <h1>. No <main>, no prompt
 *             list, no SectionsPanel. Isolates hero compositing from body.
 *   ?diag=d → smoke <div>. AiOsPage is NOT imported here (we use a
 *             dynamic import gated by the param so the module is only
 *             evaluated on the default path). This requires changing
 *             the route in App.tsx — see notes below.
 *
 * NOTE: For ?diag=d to actually exclude AiOsPage's module from the bundle,
 * the route has to lazy-load this dispatcher AND the dispatcher has to
 * dynamically import AiOsPage inside an effect. Done below.
 */
import { lazy, Suspense, useEffect, useState } from "react";
import type { ComponentType } from "react";

interface Props {
  focusCategory?: "clarity" | "iteration" | "deployment" | "design";
}

const SmokeDiv = ({ tag }: { tag: string }) => (
  <div
    style={{
      padding: 40,
      color: "#fff",
      background: "#08101f",
      minHeight: "100vh",
      font: "14px ui-monospace, monospace",
    }}
  >
    ai-os smoke test ({tag}) — survived render
    <div style={{ marginTop: 16, fontSize: 11, opacity: 0.7 }}>
      If you can read this on iOS Chrome, the killer is downstream of this
      point. See plan in chat for what to test next.
    </div>
  </div>
);

const AiOsDiagDispatcher = ({ focusCategory }: Props) => {
  const [diag] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("diag")
      : null,
  );

  // Test D — module not loaded at all unless we explicitly choose to.
  // For diag=d we render the smoke div without ever touching AiOsPage.
  if (diag === "d") {
    return <SmokeDiv tag="diag=d, AiOsPage module not loaded" />;
  }

  // For diag=b — module IS loaded (so we can attribute eval cost) but
  // the component is NOT rendered. The lazy import below evaluates the
  // module the moment Suspense resolves, even though we render a
  // smoke div instead of the resolved component.
  if (diag === "b") {
    return <SmokeBWithModuleLoad />;
  }

  // For diag=c — render AiOsPage in hero-only mode.
  if (diag === "c") {
    return (
      <Suspense fallback={<SmokeDiv tag="diag=c loading" />}>
        <LazyAiOsPage focusCategory={focusCategory} __diagHeroOnly />
      </Suspense>
    );
  }

  // Default — full AiOsPage.
  return (
    <Suspense fallback={<SmokeDiv tag="default loading" />}>
      <LazyAiOsPage focusCategory={focusCategory} />
    </Suspense>
  );
};

// Lazy import so that diag=d truly skips the module.
const LazyAiOsPage = lazy(() => import("./AiOsPage")) as ComponentType<{
  focusCategory?: "clarity" | "iteration" | "deployment" | "design";
  __diagHeroOnly?: boolean;
}>;

const SmokeBWithModuleLoad = () => {
  // Trigger the module load (so PROMPTS etc. evaluate) but DO NOT render
  // the component. We import-then-discard inside an effect.
  useEffect(() => {
    void import("./AiOsPage");
  }, []);
  return <SmokeDiv tag="diag=b, AiOsPage module loaded but not rendered" />;
};

export default AiOsDiagDispatcher;
