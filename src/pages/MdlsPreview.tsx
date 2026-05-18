import {
  HeroHeadline,
  MattePolymerCard,
  AuroraGlassOrb,
  SculptedSilkSection,
  SoulOrbGoal,
  SealMedallion,
  ToggleGlassDual,
  EmberBreath,
} from "@/components/mdls";
import { useState } from "react";

/**
 * MDLS Preview Page · /mdls-preview
 *
 * Dev-only showcase of every MDLS primitive in isolation.
 * Mirrors the mood-board Y2 (Dark UI Token System) format:
 *   • Each primitive shown in multiple states
 *   • Annotation captions in plain language
 *   • Token sidebar with concrete pixel / HSL values
 *
 * Use this page to:
 *   • Visually verify each primitive renders correctly
 *   • Compare light vs dark variants
 *   • Inspect the soul-orb library (12 signatures)
 *   • Confirm motion safety (toggle prefers-reduced-motion)
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
  const [toggleValue, setToggleValue] = useState<"attune" | "act">("attune");
  const [completedOrbs, setCompletedOrbs] = useState<Set<number>>(new Set());

  const toggleCompleted = (i: number) => {
    setCompletedOrbs((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-[#faf6f0] py-12 px-4 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12">
          <HeroHeadline
            title="MDLS Preview"
            subtitle="Multi-Dimensional Living Surface · v1.0 · primitive showcase"
            variant="serif"
          />
          <p className="mt-6 text-center text-sm text-[#0a1628]/65 max-w-2xl mx-auto">
            Each primitive shown in isolation. Dev-only — accessible at <code className="px-2 py-0.5 rounded bg-[#0a1628]/8 font-mono text-xs">/mdls-preview</code>.
            Style Guide: <code className="px-2 py-0.5 rounded bg-[#0a1628]/8 font-mono text-xs">docs/specs/equilibrium/equilibrium_mdls_style_guide.md</code>
          </p>
        </header>

        {/* §1 · Toggle Glass Dual ─────────────────────────────────── */}
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

        {/* §2 · Aurora Glass Orb ───────────────────────────────────── */}
        <Section
          title="AuroraGlassOrb"
          spec="§4.1 · Luminous-Cosmic centerpiece. Color enters from within (Principle 1). Slow aurora-drift animation (22s)."
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

        {/* §3 · Matte Polymer Card ─────────────────────────────────── */}
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

        {/* §4 · Seal Medallion ─────────────────────────────────────── */}
        <Section
          title="SealMedallion"
          spec="§9.6 · sacred-seal SVG stamp. Three variants. Static, decorative-semantic only."
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

        {/* §5 · Soul Orb Library ───────────────────────────────────── */}
        <Section
          title="SoulOrbGoal — 12-signature library"
          spec="§4.4 + §5.3 · soul-orb library. Manual assignment to goals/workstreams. Hover for tilt-and-settle (800ms ease-out-quart). Click to toggle completed."
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-6 gap-y-8 py-8 justify-items-center">
            {ORB_NAMES.map((name, i) => (
              <div key={i} className="text-center">
                <SoulOrbGoal
                  orbId={i + 1}
                  size={56}
                  completed={completedOrbs.has(i)}
                  onClick={() => toggleCompleted(i)}
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

        {/* §6 · Sculpted Silk Section ──────────────────────────────── */}
        <Section
          title="SculptedSilkSection"
          spec="§4.3 · organic curving form. Three blob variants. Used for workstream territories, section dividers, brand backdrops."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8">
            <div>
              <SculptedSilkSection hue={15} blobVariant="a" className="h-48 flex items-center justify-center">
                <span className="text-sm font-medium text-[#0a1628]/70">Workstream A</span>
              </SculptedSilkSection>
              <Caption>hue 15 (rose) · blob a</Caption>
            </div>
            <div>
              <SculptedSilkSection hue={195} blobVariant="b" className="h-48 flex items-center justify-center">
                <span className="text-sm font-medium text-[#0a1628]/70">Workstream B</span>
              </SculptedSilkSection>
              <Caption>hue 195 (aqua) · blob b</Caption>
            </div>
            <div>
              <SculptedSilkSection hue={85} blobVariant="c" className="h-48 flex items-center justify-center">
                <span className="text-sm font-medium text-[#0a1628]/70">Workstream C</span>
              </SculptedSilkSection>
              <Caption>hue 85 (sage) · blob c</Caption>
            </div>
          </div>
        </Section>

        {/* Token Sidebar — concrete values ─────────────────────────── */}
        <aside className="mt-16 rounded-3xl bg-[#0a1628]/95 text-white p-8">
          <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-white/70 mb-6">Tokens</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono">
            <TokenGroup title="Radius">
              <Token name="card" value="24px" />
              <Token name="pill" value="9999px" />
              <Token name="orb" value="50%" />
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
            <TokenGroup title="Substrate">
              <Token name="--mdls-cream" value="rgba(252,248,244,0.96)" />
              <Token name="--mdls-cream-dark" value="rgba(20,28,44,0.94)" />
            </TokenGroup>
          </div>
        </aside>

        <footer className="mt-12 text-center text-xs text-[#0a1628]/45 font-mono">
          MDLS Preview · {ORB_NAMES.length} orbs · 8 components shipped · 2 deferred (HeroEditorialHeading · CommitPress)
        </footer>
      </div>
    </main>
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
