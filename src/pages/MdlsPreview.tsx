import { useState } from "react";
import {
  HeroHeadline,
  MattePolymerCard,
  AuroraGlassOrb,
  AuroraCycleDisc,
  SculptedSilkSection,
  SoulOrbGoal,
  SealMedallion,
  ToggleGlassDual,
  EmberBreath,
} from "@/components/mdls";

/**
 * MDLS Preview Page · /mdls-preview · v1.2 (2026-05-18)
 *
 * Three-part structure:
 *   1. Composed Surface Demo — the cornerstone: primitives working together
 *      in a single coherent surface (Equilibrium-mockup-grade), wrapped in
 *      a device frame so it reads as a "held object," sitting on an
 *      atmospheric backdrop. This is where Sasha sees the trinity
 *      (luminosity + physicality + editorial refinement) at full strength.
 *
 *   2. Primitives Catalog — each primitive in isolation with annotations
 *      (Y2 reference format). Lets you inspect individual moves.
 *
 *   3. Token Sidebar — concrete pixel / HSL / animation values.
 *
 * Style Guide: docs/specs/equilibrium/equilibrium_mdls_style_guide.md
 * Tracker:     docs/specs/equilibrium/equilibrium_mdls_tracker.md
 */

const ORB_NAMES = [
  "aurora-warm", "aurora-coral", "aurora-rose", "aurora-orchid",
  "aurora-violet", "aurora-indigo", "aurora-aqua", "aurora-mint",
  "aurora-sage", "aurora-ochre", "aurora-amber", "aurora-ember",
];

const VERBS = [
  "Transmit signal", "Open doorway", "Hold field", "Name the unnamed",
  "Compress to one sentence", "Touch the source", "Recover coherence", "Restore rhythm",
  "Forge primitive", "Seal artifact", "Seed alliance", "Close loop",
];

const MdlsPreview = () => {
  // ── Composed Surface Demo state ───────────────────────────────────
  const [demoMode, setDemoMode] = useState<"attune" | "act">("act");
  const [completedDemoGoals, setCompletedDemoGoals] = useState<Set<number>>(new Set());

  // ── Primitives Catalog state ──────────────────────────────────────
  const [toggleValue, setToggleValue] = useState<"attune" | "act">("attune");
  const [completedOrbs, setCompletedOrbs] = useState<Set<number>>(new Set());

  const toggleCompleted = (i: number, set: Set<number>, setter: (s: Set<number>) => void) => {
    const next = new Set(set);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setter(next);
  };

  return (
    <main className="mdls-page-atmosphere">
      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-12 sm:py-16">
        {/* ╔═══════════════════════════════════════════════════════════════╗
            ║  PART 1 — COMPOSED SURFACE DEMO                                 ║
            ║  The cornerstone: primitives working together in one surface.   ║
            ║  Inside a device-frame so it reads as a held object.            ║
            ╚═══════════════════════════════════════════════════════════════╝ */}
        <header className="mb-8 text-center">
          <HeroHeadline
            title="MDLS"
            subtitle="Multi-Dimensional Living Surface · v1.2 · composed surface demo + primitives catalog"
            variant="serif"
          />
        </header>

        <ComposedSurfaceDemo
          demoMode={demoMode}
          onDemoModeChange={setDemoMode}
          completedDemoGoals={completedDemoGoals}
          onToggleDemoGoal={(i) =>
            toggleCompleted(i, completedDemoGoals, setCompletedDemoGoals)
          }
        />

        {/* ╔═══════════════════════════════════════════════════════════════╗
            ║  PART 2 — PRIMITIVES CATALOG                                    ║
            ║  Each primitive in isolation, with annotations.                 ║
            ╚═══════════════════════════════════════════════════════════════╝ */}

        <div className="mt-24 mb-12 text-center">
          <h2 className="font-serif text-3xl text-[#0a1628]">Primitives Catalog</h2>
          <p className="mt-2 text-sm text-[#0a1628]/60 italic">
            Each MDLS primitive shown in isolation, with annotations and states.
          </p>
        </div>

        {/* AuroraCycleDisc — isolated showcase */}
        <Section
          title="AuroraCycleDisc"
          spec="The hero cycle-clock instrument. 12 month labels around the rim. Coral DAY-N dot at current position. Aurora gradient enters from within (Principle 1). Optional inner label slot."
        >
          <div className="flex flex-wrap items-center justify-center gap-16 py-8">
            <div className="text-center">
              <AuroraCycleDisc
                size={280}
                currentDay={73}
                currentDayLabel="DAY 73"
              >
                WINTER · WILL-BUILDING
              </AuroraCycleDisc>
              <Caption>280px · light · DAY 73 · inner label</Caption>
            </div>
            <div className="text-center">
              <AuroraCycleDisc
                size={200}
                currentDay={228}
                currentDayLabel="DAY 228"
                labels={[
                  "I", "II", "III", "IV", "V", "VI",
                  "VII", "VIII", "IX", "X", "XI", "XII",
                ]}
              >
                SUMMER · TRANSMIT
              </AuroraCycleDisc>
              <Caption>200px · custom roman labels</Caption>
            </div>
          </div>
        </Section>

        {/* ToggleGlassDual */}
        <Section
          title="ToggleGlassDual"
          spec="§9.7 · binary toggle with sliding glass indicator + coral dot on active. State-change motion: 240ms spring."
        >
          <div className="flex flex-col items-center gap-6 py-8">
            <ToggleGlassDual
              options={[
                { value: "attune", label: "ATTUNE" },
                { value: "act", label: "ACT" },
              ]}
              value={toggleValue}
              onChange={setToggleValue}
              ariaLabel="Demo toggle"
              variant="light"
              showCoralDot
            />
            <p className="text-xs text-[#0a1628]/60 font-mono">
              current value: <strong>{toggleValue}</strong>
            </p>
          </div>
        </Section>

        {/* AuroraGlassOrb */}
        <Section
          title="AuroraGlassOrb"
          spec="§4.1 · Luminous-Cosmic centerpiece. Color enters from within. Slow aurora-drift animation (22s)."
        >
          <div className="flex flex-wrap items-center justify-center gap-12 py-8">
            <div className="text-center">
              <AuroraGlassOrb size={180} />
              <Caption>180px · light variant</Caption>
            </div>
            <div className="text-center">
              <AuroraGlassOrb size={280} />
              <Caption>280px · default size · ritual centerpiece</Caption>
            </div>
            <div className="text-center">
              <div className="bg-[#0a1628] p-4 rounded-3xl">
                <AuroraGlassOrb size={180} variant="dark" />
              </div>
              <Caption>180px · dark variant</Caption>
            </div>
          </div>
        </Section>

        {/* MattePolymerCard */}
        <Section
          title="MattePolymerCard"
          spec="§4.2 · daily UI card. Light + dark variants · default / active / emphasized states."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
            <div>
              <MattePolymerCard>
                <h3 className="font-serif text-lg text-[#0a1628]">Default state</h3>
                <p className="mt-2 text-sm text-[#0a1628]/70">Cream substrate. Subtle inner highlight. Two-layer drop shadow.</p>
              </MattePolymerCard>
              <Caption>default · light variant</Caption>
            </div>
            <div>
              <EmberBreath active>
                <MattePolymerCard active>
                  <h3 className="font-serif text-lg text-[#0a1628]">Active state (ember breath)</h3>
                  <p className="mt-2 text-sm text-[#0a1628]/70">Backlit warm-amber pulse from beneath. 6s breath cycle.</p>
                </MattePolymerCard>
              </EmberBreath>
              <Caption>active · ember breath wrapped</Caption>
            </div>
            <div>
              <MattePolymerCard emphasized>
                <h3 className="font-serif text-lg text-[#0a1628]">Emphasized state</h3>
                <p className="mt-2 text-sm text-[#0a1628]/70">Heavier inner highlight. Deeper drop shadow.</p>
              </MattePolymerCard>
              <Caption>emphasized · default</Caption>
            </div>
            <div>
              <MattePolymerCard variant="dark">
                <h3 className="font-serif text-lg text-white">Dark variant</h3>
                <p className="mt-2 text-sm text-white/70">Deep-navy substrate. Same primitive, opposite substrate.</p>
              </MattePolymerCard>
              <Caption>default · dark variant</Caption>
            </div>
          </div>
        </Section>

        {/* SealMedallion */}
        <Section
          title="SealMedallion"
          spec="§9.6 · sacred-seal SVG stamp. Three variants. Static, decorative-semantic only. v1.1 opacity bumped 0.55 → 0.72; stroke widths nudged for visibility."
        >
          <div className="flex flex-wrap items-center justify-center gap-12 py-8">
            <div className="text-center">
              <SealMedallion size={64} variant="mandala" />
              <Caption>mandala · default</Caption>
            </div>
            <div className="text-center">
              <SealMedallion size={64} variant="flower" />
              <Caption>flower-of-life</Caption>
            </div>
            <div className="text-center">
              <SealMedallion size={64} variant="spiral" />
              <Caption>spiral</Caption>
            </div>
          </div>
        </Section>

        {/* Soul Orb Library */}
        <Section
          title="SoulOrbGoal — 12-signature library"
          spec="§4.4 + §5.3 · soul-orb library. Manual assignment to goals/workstreams. Hover for tilt-and-settle (800ms ease-out-quart). Click to toggle completed. v1.1 inner luminosity + outer aura bumped."
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-6 gap-y-8 py-8 justify-items-center">
            {ORB_NAMES.map((name, i) => (
              <div key={i} className="text-center">
                <SoulOrbGoal
                  orbId={i + 1}
                  size={64}
                  completed={completedOrbs.has(i)}
                  onClick={() =>
                    toggleCompleted(i, completedOrbs, setCompletedOrbs)
                  }
                  label={`${name} · ${VERBS[i]}`}
                />
                <div className="mt-2 text-[10px] font-mono text-[#0a1628]/60">
                  #{i + 1} · {name}
                </div>
                <div className="text-[10px] text-[#0a1628]/45">{VERBS[i]}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Sculpted Silk */}
        <Section
          title="SculptedSilkSection"
          spec="§4.3 · organic curving form. Three blob variants (border-radius asymmetry pushed to ≥70% in v1.1). Used for workstream territories, section dividers, brand backdrops."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 justify-items-center">
            <div className="w-full max-w-[260px]">
              <SculptedSilkSection
                hue={15}
                blobVariant="a"
                className="aspect-square flex items-center justify-center"
              >
                <span className="text-sm font-medium text-[#0a1628]/70">Workstream A</span>
              </SculptedSilkSection>
              <Caption>hue 15 (rose) · blob a</Caption>
            </div>
            <div className="w-full max-w-[260px]">
              <SculptedSilkSection
                hue={195}
                blobVariant="b"
                className="aspect-square flex items-center justify-center"
              >
                <span className="text-sm font-medium text-[#0a1628]/70">Workstream B</span>
              </SculptedSilkSection>
              <Caption>hue 195 (aqua) · blob b</Caption>
            </div>
            <div className="w-full max-w-[260px]">
              <SculptedSilkSection
                hue={85}
                blobVariant="c"
                className="aspect-square flex items-center justify-center"
              >
                <span className="text-sm font-medium text-[#0a1628]/70">Workstream C</span>
              </SculptedSilkSection>
              <Caption>hue 85 (sage) · blob c</Caption>
            </div>
          </div>
        </Section>

        {/* ╔═══════════════════════════════════════════════════════════════╗
            ║  PART 3 — TOKEN SIDEBAR                                         ║
            ╚═══════════════════════════════════════════════════════════════╝ */}
        <aside className="mt-16 rounded-3xl bg-[#0a1628]/95 text-white p-8">
          <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-white/70 mb-6">Tokens</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono">
            <TokenGroup title="Radius">
              <Token name="card" value="24px" />
              <Token name="pill" value="9999px" />
              <Token name="orb" value="50%" />
              <Token name="device frame" value="36px" />
            </TokenGroup>
            <TokenGroup title="Motion">
              <Token name="ember breath" value="6s ease-in-out ∞" />
              <Token name="state change" value="240ms spring" />
              <Token name="tilt-settle" value="800ms ease-out-quart" />
              <Token name="aurora drift" value="22s ease-in-out ∞" />
            </TokenGroup>
            <TokenGroup title="Coral">
              <Token name="--mdls-coral" value="hsl(15 88% 60%)" />
              <Token name="--mdls-coral-soft" value="hsl(...) / 0.45" />
              <Token name="budget per surface" value="1–2 max" />
            </TokenGroup>
            <TokenGroup title="Atmosphere">
              <Token name="page bg" value="hsl(38 38% 95%)" />
              <Token name="warm wash" value="hsl(28 80% 88%) @ upper-left" />
              <Token name="cool wash" value="hsl(220 60% 90%) @ lower-right" />
              <Token name="device tilt" value="rotateX(1.5°) Y(-0.5°)" />
            </TokenGroup>
          </div>
        </aside>

        <footer className="mt-12 text-center text-xs text-[#0a1628]/45 font-mono">
          MDLS Preview v1.2 · {ORB_NAMES.length} orbs · 9 components shipped · 2 deferred
        </footer>
      </div>
    </main>
  );
};

// ─── Composed Surface Demo ─────────────────────────────────────────

interface ComposedSurfaceDemoProps {
  demoMode: "attune" | "act";
  onDemoModeChange: (next: "attune" | "act") => void;
  completedDemoGoals: Set<number>;
  onToggleDemoGoal: (i: number) => void;
}

const ComposedSurfaceDemo = ({
  demoMode,
  onDemoModeChange,
  completedDemoGoals,
  onToggleDemoGoal,
}: ComposedSurfaceDemoProps) => {
  return (
    <div className="my-16">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl text-[#0a1628]">Composed Surface Demo</h2>
        <p className="mt-2 text-sm text-[#0a1628]/60 italic max-w-2xl mx-auto">
          The primitives working together as one surface — wrapped in a device frame, sitting on the atmospheric backdrop. This is what an Equilibrium-MDLS surface aims to feel like.
        </p>
      </div>

      {/* Device frame — subtle isometric tilt + cream substrate + floating shadow */}
      <div className="mdls-device-frame mx-auto max-w-md px-8 py-10">
        {/* Hero title + mode toggle */}
        <div className="text-center">
          <h3
            className="font-serif text-3xl text-[#0a1628]"
            style={{
              textShadow:
                "0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8)",
              letterSpacing: "-0.01em",
            }}
          >
            Equilibrium
          </h3>
          <p className="mt-1 font-serif text-sm text-[#0a1628]/70">
            Biologic Watch and Task Manager
          </p>
          <div className="mt-4 flex justify-center">
            <ToggleGlassDual
              options={[
                { value: "attune", label: "ATTUNE" },
                { value: "act", label: "ACT" },
              ]}
              value={demoMode}
              onChange={onDemoModeChange}
              ariaLabel="Demo mode"
              variant="light"
              showCoralDot
            />
          </div>
        </div>

        {/* Aurora Cycle Disc — the hero centerpiece */}
        <div className="mt-8 flex justify-center">
          <AuroraCycleDisc
            size={240}
            currentDay={73}
            currentDayLabel="DAY 73"
            variant="light"
          >
            WINTER · WILL-BUILDING
          </AuroraCycleDisc>
        </div>

        {/* Lifelong Dedication card — matte polymer with medallion + ember breath */}
        <div className="mt-8">
          <EmberBreath active>
            <MattePolymerCard emphasized>
              <div className="flex items-start gap-3">
                <SealMedallion
                  size={32}
                  variant="mandala"
                  ariaLabel="Lifelong Dedication seal"
                />
                <div className="flex-1">
                  <p
                    className="font-serif text-base text-[#0a1628] leading-snug"
                    style={{ letterSpacing: "-0.005em" }}
                  >
                    Assist humanity evolve into a consciously coordinated civilization.
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#0a1628]/55">
                    Lifelong Dedication · Day 73
                  </p>
                </div>
              </div>
            </MattePolymerCard>
          </EmberBreath>
        </div>

        {/* Three sculpted-silk workstream blobs — overlapping */}
        <div className="mt-8">
          <p className="text-center text-[10px] uppercase tracking-[0.18em] text-[#0a1628]/55 mb-3">
            Workstreams
          </p>
          <div className="relative h-32 flex items-center justify-center">
            <SculptedSilkSection
              hue={15}
              blobVariant="a"
              className="absolute z-10 flex items-center justify-center"
              style={{ width: 110, height: 110, left: "calc(50% - 130px)" }}
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#0a1628]/70">
                Planetary OS
              </span>
            </SculptedSilkSection>
            <SculptedSilkSection
              hue={210}
              blobVariant="b"
              className="absolute z-20 flex items-center justify-center"
              style={{ width: 120, height: 120, left: "calc(50% - 60px)" }}
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#0a1628]/70">
                Venture Studio
              </span>
            </SculptedSilkSection>
            <SculptedSilkSection
              hue={85}
              blobVariant="c"
              className="absolute z-10 flex items-center justify-center"
              style={{ width: 110, height: 110, left: "calc(50% + 20px)" }}
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#0a1628]/70">
                Founder Forge
              </span>
            </SculptedSilkSection>
          </div>
        </div>

        {/* Soul-orb goals — three energetic commitments */}
        <div className="mt-8">
          <p className="text-center text-[10px] uppercase tracking-[0.18em] text-[#0a1628]/55 mb-4">
            Today's commitments
          </p>
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {[
              { orbId: 7, label: "Transmit signal", sub: "Ship one essay" },
              { orbId: 2, label: "Seed alliance", sub: "Send Friday DMs" },
              { orbId: 10, label: "Seal artifact", sub: "Complete cycle review" },
            ].map((goal, i) => (
              <div key={i} className="text-center">
                <SoulOrbGoal
                  orbId={goal.orbId}
                  size={56}
                  completed={completedDemoGoals.has(i)}
                  onClick={() => onToggleDemoGoal(i)}
                  label={goal.label}
                />
                <div className="mt-2 text-[10px] font-medium text-[#0a1628]/85 leading-tight">
                  {goal.label}
                </div>
                <div className="text-[9px] text-[#0a1628]/50 leading-tight">
                  {goal.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer attribution */}
        <div className="mt-10 text-center text-[9px] uppercase tracking-[0.18em] text-[#0a1628]/35">
          MDLS v1.2 · contemplative operating surface
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-[#0a1628]/55 italic max-w-xl mx-auto">
        ↑ Subtle isometric tilt · atmospheric backdrop · trinity of luminosity / physicality / editorial refinement. Tap the toggle, tap the soul-orbs.
      </p>
    </div>
  );
};

// ─── Helpers ───────────────────────────────────────────────────

const Section = ({ title, spec, children }: { title: string; spec: string; children: React.ReactNode }) => (
  <section className="mb-12 border-t border-[#0a1628]/8 pt-8">
    <header className="mb-2">
      <h2 className="font-serif text-2xl font-semibold text-[#0a1628]">{title}</h2>
      <p className="mt-1 text-xs text-[#0a1628]/55 italic">{spec}</p>
    </header>
    {children}
  </section>
);

const Caption = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-[#0a1628]/50">{children}</p>
);

const TokenGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-[10px] uppercase tracking-[0.12em] text-white/55 mb-2 font-sans font-semibold">{title}</div>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const Token = ({ name, value }: { name: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-white/95">{name}</span>
    <span className="text-white/55">{value}</span>
  </div>
);

export default MdlsPreview;
