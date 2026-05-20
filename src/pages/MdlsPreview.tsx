import { useState } from "react";
import type { ReactNode } from "react";
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
  MdlsClipPathDefs,
} from "@/components/mdls";
import LenisProvider from "@/components/mdls/LenisProvider";
import MdlsMeshBackground from "@/components/mdls/MdlsMeshBackground";
import MdlsExtrudedSurface from "@/components/mdls/MdlsExtrudedSurface";
import MdlsSacred3D from "@/components/mdls/MdlsSacred3D";
import MdlsRevealSection from "@/components/mdls/MdlsRevealSection";
import MdlsScrollTilt from "@/components/mdls/MdlsScrollTilt";

/**
 * MDLS Codex · /mdls-preview (URL kept; content evolved 2026-05-19)
 *
 * Previously a primitives catalog with a Composed Surface Demo at top.
 * Restructured into a manifesto-grade artifact that sells the paradigm
 * in one scroll. Sections in order:
 *
 *   1. Hero — Direction Memo at full hero scale on atmospheric backdrop
 *   2. Composed Surface — the Equilibrium-grade demo as centerpiece
 *   3. Principles + Rules — 7 + 3 as a visual sequence with glyphs
 *   4. Materials Gallery — each material in HERO context (not flat swatches)
 *   5. Registers — 4 register classes side-by-side with felt-mood + use
 *   6. Typography — Cormorant + DM Sans demonstrated at scale
 *   7. Vocabulary + Closing — 12 goal-primitive verbs declared
 *   8. Tokens — concrete reference values (dev appendix)
 *
 * Style Guide: docs/specs/equilibrium/equilibrium_mdls_style_guide.md
 */

const VERBS: Array<{ verb: string; when: string }> = [
  { verb: "Transmit signal", when: "Publish public-facing work" },
  { verb: "Compress to one sentence", when: "Articulate the messy into the clear line" },
  { verb: "Close loop", when: "Finish what's been left dangling" },
  { verb: "Seal artifact", when: "Lock work as canonical · versioned · done" },
  { verb: "Seed alliance", when: "Initiate connection with a peer or collaborator" },
  { verb: "Open doorway", when: "Make a path for someone else to enter" },
  { verb: "Hold field", when: "Maintain presence without forcing" },
  { verb: "Recover coherence", when: "Restore alignment when scattered" },
  { verb: "Restore rhythm", when: "Return to natural cadence after disruption" },
  { verb: "Touch the source", when: "Reconnect to deeper ground · inner practice" },
  { verb: "Name the unnamed", when: "Articulate the intuitive but unspoken" },
  { verb: "Forge primitive", when: "Build a new irreducible unit" },
];

const ORB_NAMES = [
  "aurora-warm", "aurora-coral", "aurora-rose", "aurora-orchid",
  "aurora-violet", "aurora-indigo", "aurora-aqua", "aurora-mint",
  "aurora-sage", "aurora-ochre", "aurora-amber", "aurora-ember",
];

const MdlsPreview = () => {
  const [demoMode, setDemoMode] = useState<"attune" | "act">("act");
  const [completedDemoGoals, setCompletedDemoGoals] = useState<Set<number>>(new Set());

  const toggleDemoGoal = (i: number) => {
    setCompletedDemoGoals((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <LenisProvider>
    <main className="mdls-page-atmosphere relative">
      <MdlsClipPathDefs />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* §1 · HERO — Direction Memo                                       */}
      {/* WAVE 1 (Day 74, 2026-05-19): WebGL mesh-gradient atmosphere       */}
      {/* (Paper Shaders) replaces the flat CSS .mdls-page-atmosphere for   */}
      {/* the hero. Living color volume instead of banded planes.           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100vh] flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-20 overflow-hidden">
        <MdlsMeshBackground register="luminous" distortion={0.55} swirl={0.18} speed={0.22} />
        {/* POLISH (Day 74, 2026-05-19): floating 3D dodecahedron centerpiece.
            Sits above the manifesto prose. The sacred form Sasha pointed at —
            12 pentagonal faces = 12-orb soul library × 12-month cycle. */}
        <div
          className="relative mx-auto"
          style={{ zIndex: 1, marginBottom: "1.5rem" }}
        >
          <MdlsSacred3D size={220} hue="warm" />
        </div>
        <div className="relative max-w-3xl mx-auto space-y-7" style={{ zIndex: 1 }}>
          <p
            className="font-serif text-[#0a1628]"
            style={{
              fontSize: "clamp(1.75rem, 4.2vw, 3rem)",
              lineHeight: 1.22,
              letterSpacing: "-0.012em",
              textShadow: "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.7)",
              fontWeight: 500,
            }}
          >
            MDLS replaces the question{" "}
            <em className="italic font-normal">"how should this look?"</em> with{" "}
            <em className="italic font-normal">"what does this transmit?"</em> — compiling
            a software category that did not exist before:{" "}
            <span className="font-semibold">contemplative operating surfaces</span> —
            environments that are not tools but formative spaces, where every choice
            carries a stance about consciousness, time, and human coordination.
          </p>
          <p
            className="font-serif text-[#0a1628]/82"
            style={{
              fontSize: "clamp(1.125rem, 2.4vw, 1.625rem)",
              lineHeight: 1.45,
              letterSpacing: "-0.005em",
            }}
          >
            It enacts this by composing three co-equal poles —{" "}
            <span className="font-semibold">luminosity</span> (aurora living within material),{" "}
            <span className="font-semibold">physicality</span> (industrial-design weight,
            tactile commit), and{" "}
            <span className="font-semibold">editorial refinement</span> (typography doing
            work, not decoration) — across eight primitives, producing surfaces that feel
            like designed objects, not painted screens.
          </p>
          <p
            className="font-serif italic text-[#0a1628]/72"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.375rem)",
              lineHeight: 1.5,
            }}
          >
            We start with Equilibrium because cycles, dedication, and energetic commitment
            cannot transmit through a SaaS register.
          </p>
        </div>
        <div className="mt-20 text-center text-[10px] uppercase tracking-[0.28em] text-[#0a1628]/40">
          Multi-Dimensional Living Surface · the codex · v2.0 — octave shift
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* §2 · COMPOSED SURFACE — the centerpiece (where MDLS is seen)     */}
      {/* WAVE 3 (Day 74): wrapped in MdlsScrollTilt — device tilts subtly  */}
      {/* as user scrolls past, reads as a held object, not a screenshot.  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <MdlsRevealSection>
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <SectionEyebrow>One composed surface</SectionEyebrow>
            <MdlsScrollTilt>
              <ComposedSurfaceDemo
                demoMode={demoMode}
                onDemoModeChange={setDemoMode}
                completedDemoGoals={completedDemoGoals}
                onToggleDemoGoal={toggleDemoGoal}
              />
            </MdlsScrollTilt>
            <p className="mt-10 text-center max-w-xl mx-auto font-serif italic text-[#0a1628]/60 text-base sm:text-lg leading-relaxed">
              Trinity of luminosity, physicality, editorial refinement — composed into one
              held object.
            </p>
          </div>
        </section>
      </MdlsRevealSection>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* §3 · PRINCIPLES + RULES                                          */}
      {/* POLISH: restrained mesh accent + extruded surface for principles  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <MdlsRevealSection>
      <section className="relative py-24 px-6 sm:px-12 overflow-hidden">
        <MdlsMeshBackground
          register="restrained"
          distortion={0.4}
          swirl={0.08}
          speed={0.12}
          style={{ opacity: 0.55 }}
        />
        <div className="relative max-w-4xl mx-auto" style={{ zIndex: 1 }}>
          <SectionEyebrow>Seven principles, three rules</SectionEyebrow>

          <MdlsExtrudedSurface
            variant="floating"
            className="mt-12"
            style={{ padding: "1.5rem 2rem" }}
          >
            <ul className="space-y-2">
              {[
                { glyph: <GlyphAuroraDot />,           text: "Color enters from within, not painted on." },
                { glyph: <GlyphOutlineCircle />,       text: "Restraint over decoration." },
                { glyph: <SealMedallion size={32} variant="mandala" />, text: "Sacred over neutral." },
                { glyph: <GlyphNestedRings />,         text: "Coherence over consistency." },
                { glyph: <SoulOrbGoal orbId={7} size={32} />, text: "Every primitive earns its place." },
                { glyph: <GlyphMatteCard />,           text: "Surface is the form the transformation arrives in." },
                { glyph: <GlyphConcentric />,          text: "Motion is meaning, not noise." },
              ].map((p, i, arr) => (
                <li
                  key={i}
                  className={`flex items-center gap-5 sm:gap-7 py-3 ${i < arr.length - 1 ? "border-b border-[#0a1628]/8" : ""}`}
                >
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center">{p.glyph}</div>
                  <p
                    className="font-serif text-[#0a1628] flex-1"
                    style={{ fontSize: "clamp(1.125rem, 2vw, 1.5rem)", lineHeight: 1.4, letterSpacing: "-0.005em" }}
                  >
                    {p.text}
                  </p>
                  <span className="text-xs font-mono text-[#0a1628]/35 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ul>
          </MdlsExtrudedSurface>

          <div className="mt-16">
            <SectionEyebrow>Three operational rules</SectionEyebrow>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10">
              {[
                { glyph: <GlyphCoralHalo />,  text: "Active state is a halo, never a fill." },
                { glyph: <GlyphCoralDot />,   text: "One coral accent per surface · two for devotion." },
                { glyph: <GlyphTypeA />,      text: "Hierarchy through weight, not color." },
              ].map((r, i) => (
                <MdlsExtrudedSurface key={i} variant="raised" className="text-center" style={{ padding: "1.5rem 1rem" }}>
                  <div className="flex justify-center mb-4 h-10 items-center">{r.glyph}</div>
                  <p className="font-serif text-sm sm:text-base text-[#0a1628]/85 leading-snug">{r.text}</p>
                </MdlsExtrudedSurface>
              ))}
            </div>
          </div>
        </div>
      </section>
      </MdlsRevealSection>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* §4 · MATERIALS GALLERY — each in hero context                    */}
      {/* POLISH: sculptural mesh accent — feels like a textile showroom    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <MdlsRevealSection>
      <section className="relative py-24 px-4 sm:px-12 overflow-hidden">
        <MdlsMeshBackground
          register="sculptural"
          distortion={0.5}
          swirl={0.12}
          speed={0.15}
          style={{ opacity: 0.4 }}
        />
        <div className="relative max-w-5xl mx-auto" style={{ zIndex: 1 }}>
          <SectionEyebrow>The materials</SectionEyebrow>

          <div className="mt-16 space-y-32">
            <MaterialFeature
              name="Aurora-Glass-Orb"
              register="Luminous-Cosmic"
              description="Color enters from within. The material holds light as substance, not paint. The form is round."
              feature={<AuroraGlassOrb size={320} />}
            />

            <MaterialFeature
              name="Matte-Polymer"
              register="Premium-Restrained"
              description="The daily surface. Cream-grain substrate with single-source lighting, layered floating shadow. Active state via ember-breath under-glow."
              feature={
                <EmberBreath active>
                  <MattePolymerCard emphasized className="max-w-md">
                    <SealMedallion size={28} variant="mandala" />
                    <p
                      className="mt-3 font-serif text-[#0a1628] leading-snug"
                      style={{ fontSize: "1.125rem", letterSpacing: "-0.005em" }}
                    >
                      Assist humanity evolve into a consciously coordinated civilization.
                    </p>
                    <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[#0a1628]/55">
                      Lifelong Dedication · Day 73
                    </p>
                  </MattePolymerCard>
                </EmberBreath>
              }
            />

            <MaterialFeature
              name="Sculpted-Silk"
              register="Soft-Sculptural"
              description="Organic curving form. Three blob variants rendered as actual SVG paths (no clipping, no masking). For workstream territories, section dividers, brand backdrops."
              feature={
                <div className="relative h-[180px] sm:h-[220px] flex items-center justify-center">
                  <SculptedSilkSection
                    hue={15}
                    blobVariant="a"
                    className="absolute z-10"
                    style={{ width: 160, height: 160, left: "calc(50% - 200px)" }}
                  />
                  <SculptedSilkSection
                    hue={210}
                    blobVariant="b"
                    className="absolute z-20"
                    style={{ width: 180, height: 180, left: "calc(50% - 90px)" }}
                  />
                  <SculptedSilkSection
                    hue={85}
                    blobVariant="c"
                    className="absolute z-10"
                    style={{ width: 160, height: 160, left: "calc(50% + 40px)" }}
                  />
                </div>
              }
            />

            <MaterialFeature
              name="Soul-Orb Library"
              register="all registers"
              description="Twelve curated color signatures. Manual assignment to goals, workstreams, identities. No per-user derivation (parked). Each orb a glass marble."
              feature={
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-x-6 gap-y-8 max-w-2xl mx-auto justify-items-center">
                  {ORB_NAMES.map((name, i) => (
                    <div key={i} className="text-center">
                      <SoulOrbGoal orbId={i + 1} size={56} label={name} />
                      <p className="mt-2 text-[9px] font-mono text-[#0a1628]/50">{name}</p>
                    </div>
                  ))}
                </div>
              }
            />

            <MaterialFeature
              name="Tactile-Ceramic"
              register="(reserved · sacred-object surfaces)"
              description="Granular, sculptural, sandstone-soft. For ritual artifacts and brand-stamp containers. Not in active production use; activates when matte-polymer feels insufficient for gravitas."
              feature={
                <div className="mdls-tactile-ceramic mx-auto" style={{ width: 240, height: 180 }} />
              }
            />

            <MaterialFeature
              name="Extruded-Surface"
              register="Premium-Restrained · neumorphism"
              description="Soft-extruded plastic surface — the new-morphism register. Multi-layer shadow with single light source upper-left, warm cream substrate, optional coral under-glow for active state. For UI controls that need to feel physical."
              feature={
                <div className="flex gap-6 items-center justify-center">
                  <MdlsExtrudedSurface variant="raised" style={{ width: 110, height: 110 }}>
                    <div className="h-full flex items-center justify-center">
                      <SealMedallion size={32} variant="mandala" />
                    </div>
                  </MdlsExtrudedSurface>
                  <MdlsExtrudedSurface variant="floating" active style={{ width: 130, height: 130 }}>
                    <div className="h-full flex items-center justify-center">
                      <SoulOrbGoal orbId={7} size={48} />
                    </div>
                  </MdlsExtrudedSurface>
                  <MdlsExtrudedSurface variant="pressed" style={{ width: 110, height: 110 }}>
                    <div className="h-full flex items-center justify-center text-[10px] uppercase tracking-[0.18em] text-[#0a1628]/55">
                      pressed
                    </div>
                  </MdlsExtrudedSurface>
                </div>
              }
            />

            <MaterialFeature
              name="Sacred-3D"
              register="Luminous-Cosmic · real geometry"
              description="WebGL-rendered dodecahedron — 12 pentagonal faces correspond to the 12-orb soul library and the 12-month aurora cycle. Bloom postprocessing + studio HDRI lighting gives the object the presence of a held artifact. Idle slow-rotate; pauses on prefers-reduced-motion."
              feature={<MdlsSacred3D size={240} hue="warm" />}
            />
          </div>
        </div>
      </section>
      </MdlsRevealSection>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* §5 · REGISTERS — four classes side-by-side                       */}
      {/* POLISH: ascetic mesh accent + extruded register cards             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <MdlsRevealSection>
      <section className="relative py-24 px-6 sm:px-12 overflow-hidden">
        <MdlsMeshBackground
          register="ascetic"
          distortion={0.35}
          swirl={0.06}
          speed={0.1}
          style={{ opacity: 0.5 }}
        />
        <div className="relative max-w-5xl mx-auto" style={{ zIndex: 1 }}>
          <SectionEyebrow>Four registers, one language</SectionEyebrow>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <RegisterCard
              name="Luminous-Cosmic"
              mood="charged · contemplative · sacred"
              whenToUse="Hero · ritual · revelation"
              sample={<AuroraGlassOrb size={120} />}
            />
            <RegisterCard
              name="Premium-Restrained"
              mood="calm · authoritative · daily"
              whenToUse="Daily UI · editorial sections"
              sample={
                <MattePolymerCard className="w-full h-32 flex items-center justify-center !p-3">
                  <SealMedallion size={28} />
                </MattePolymerCard>
              }
            />
            <RegisterCard
              name="Soft-Sculptural"
              mood="organic · adaptive · living"
              whenToUse="Section dividers · territories · backdrops"
              sample={
                <SculptedSilkSection
                  hue={195}
                  blobVariant="b"
                  className="mx-auto"
                  style={{ width: 120, height: 120 }}
                />
              }
            />
            <RegisterCard
              name="Ascetic Minimal"
              mood="reverent · stripped · sacred-minimal"
              whenToUse="Contemplative pauses · daily mantra · single-mark moments"
              sample={
                <div className="flex items-center justify-center w-full h-32">
                  <span
                    className="font-serif text-[#0a1628]/75"
                    style={{ fontSize: "3rem", letterSpacing: "-0.04em", lineHeight: 1 }}
                  >
                    ·
                  </span>
                </div>
              }
            />
          </div>
        </div>
      </section>
      </MdlsRevealSection>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* §6 · TYPOGRAPHY — at scale, with real prose                      */}
      {/* POLISH: restrained mesh — cream-paper atmosphere for editorial    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <MdlsRevealSection>
      <section className="relative py-24 px-6 sm:px-12 overflow-hidden">
        <MdlsMeshBackground
          register="restrained"
          distortion={0.32}
          swirl={0.05}
          speed={0.1}
          style={{ opacity: 0.5 }}
        />
        <div className="relative max-w-4xl mx-auto" style={{ zIndex: 1 }}>
          <SectionEyebrow>Typography</SectionEyebrow>

          <div className="mt-12 space-y-14">
            <TypeSpec label="Hero · Cormorant Garamond · semibold">
              <h2
                className="font-serif text-[#0a1628]"
                style={{
                  fontSize: "clamp(3rem, 7vw, 5rem)",
                  letterSpacing: "-0.018em",
                  lineHeight: 1.05,
                  fontWeight: 600,
                  textShadow: "0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.7)",
                }}
              >
                Equilibrium
              </h2>
            </TypeSpec>

            <TypeSpec label="Sacred prose · Cormorant Garamond · medium">
              <p
                className="font-serif text-[#0a1628]"
                style={{
                  fontSize: "clamp(1.25rem, 2.4vw, 1.625rem)",
                  lineHeight: 1.45,
                  letterSpacing: "-0.005em",
                }}
              >
                I assist conscious aspiring impact founders turn their top talent into a
                growing scalable business in flow.
              </p>
            </TypeSpec>

            <TypeSpec label="Editorial hero · DM Sans · bold">
              <p
                className="font-sans text-[#0a1628] font-bold"
                style={{
                  fontSize: "clamp(2rem, 4.5vw, 3rem)",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                }}
              >
                Multi-Dimensional Living Surface
              </p>
            </TypeSpec>

            <TypeSpec label="Body UI · DM Sans · regular">
              <p className="text-base sm:text-lg text-[#0a1628]/85 leading-relaxed">
                Color enters from within, not painted on. Restraint over decoration. Every
                primitive earns its place. Motion is meaning, not noise.
              </p>
            </TypeSpec>

            <TypeSpec label="Microcaps · DM Sans · semibold">
              <p className="text-xs uppercase tracking-[0.18em] text-[#0a1628]/55 font-semibold">
                Lifelong Dedication · Day 73 · Winter · Will-Building
              </p>
            </TypeSpec>
          </div>
        </div>
      </section>
      </MdlsRevealSection>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* §7 · VOCABULARY + CLOSING                                        */}
      {/* POLISH: luminous closing — page begins AND ends in the aurora     */}
      {/* register; sets up the closing manifesto as a sacred moment.       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <MdlsRevealSection>
      <section className="relative py-24 px-6 sm:px-12 overflow-hidden">
        <MdlsMeshBackground
          register="luminous"
          distortion={0.45}
          swirl={0.15}
          speed={0.18}
          style={{ opacity: 0.6 }}
        />
        <div className="relative max-w-4xl mx-auto" style={{ zIndex: 1 }}>
          <SectionEyebrow>Twelve verbs, one register</SectionEyebrow>

          <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
            {VERBS.map((v, i) => (
              <li
                key={i}
                className="flex items-baseline gap-4 py-3 border-b border-[#0a1628]/8"
              >
                <span
                  className="font-serif text-[#0a1628] flex-shrink-0"
                  style={{ fontSize: "1.125rem", letterSpacing: "-0.005em" }}
                >
                  {v.verb}
                </span>
                <span className="text-sm text-[#0a1628]/55 italic ml-auto text-right">
                  {v.when}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-28 text-center max-w-2xl mx-auto">
            {/* Closing sacred moment — the dodecahedron returns at end.
                Bookends the page: opens with it, closes with it.
                The form repeated is the form remembered. */}
            <div className="flex justify-center mb-10">
              <MdlsSacred3D size={180} hue="warm" />
            </div>
            <p
              className="font-serif italic text-[#0a1628]/75"
              style={{
                fontSize: "clamp(1.25rem, 2.6vw, 1.75rem)",
                lineHeight: 1.5,
                letterSpacing: "-0.005em",
              }}
            >
              The interface stops being a thing you look at and becomes a presence that
              knows you.
            </p>
            <p className="mt-12 text-[10px] uppercase tracking-[0.28em] text-[#0a1628]/35">
              MDLS · the codex
            </p>
          </div>
        </div>
      </section>
      </MdlsRevealSection>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* §8 · TOKENS — dev appendix                                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto">
          <aside className="rounded-3xl bg-[#0a1628]/95 text-white p-8 sm:p-10">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-white/70 mb-6">
              Tokens · dev appendix
            </h2>
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
                <Token name="tilt-settle" value="800ms quart-out" />
                <Token name="aurora drift" value="22s ease-in-out ∞" />
              </TokenGroup>
              <TokenGroup title="Coral">
                <Token name="--mdls-coral" value="hsl(15 88% 60%)" />
                <Token name="--mdls-coral-soft" value="…/0.45" />
                <Token name="per-surface budget" value="1–2 max" />
              </TokenGroup>
              <TokenGroup title="Atmosphere">
                <Token name="page bg" value="hsl(38 38% 95%)" />
                <Token name="warm wash" value="hsl(28 80% 88%) UL" />
                <Token name="cool wash" value="hsl(220 60% 90%) LR" />
                <Token name="device tilt" value="rotX 3° rotY -1.5°" />
              </TokenGroup>
            </div>
          </aside>
        </div>
        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.22em] text-[#0a1628]/35">
          Style Guide · docs/specs/equilibrium/equilibrium_mdls_style_guide.md
        </p>
      </section>
    </main>
    </LenisProvider>
  );
};

// ─── Section helpers ───────────────────────────────────────────────────

const SectionEyebrow = ({ children }: { children: ReactNode }) => (
  <p className="text-center text-[11px] uppercase tracking-[0.24em] text-[#0a1628]/45 font-medium">
    {children}
  </p>
);

const MaterialFeature = ({
  name,
  register,
  description,
  feature,
}: {
  name: string;
  register: string;
  description: string;
  feature: ReactNode;
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16 items-center">
    <div>
      <h3 className="font-serif text-2xl sm:text-3xl text-[#0a1628]" style={{ letterSpacing: "-0.012em" }}>
        {name}
      </h3>
      <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#0a1628]/45">{register}</p>
      <p className="mt-5 text-base text-[#0a1628]/72 leading-relaxed">{description}</p>
    </div>
    <div className="flex items-center justify-center min-h-[220px]">{feature}</div>
  </div>
);

const RegisterCard = ({
  name,
  mood,
  whenToUse,
  sample,
}: {
  name: string;
  mood: string;
  whenToUse: string;
  sample: ReactNode;
}) => (
  <div className="text-center">
    <div className="flex items-center justify-center h-36 mb-5">{sample}</div>
    <h3 className="font-serif text-lg text-[#0a1628]" style={{ letterSpacing: "-0.005em" }}>
      {name}
    </h3>
    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#0a1628]/45">{mood}</p>
    <p className="mt-3 text-xs text-[#0a1628]/65 italic leading-relaxed px-2">{whenToUse}</p>
  </div>
);

const TypeSpec = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.18em] text-[#0a1628]/45 mb-4 font-medium">
      {label}
    </p>
    {children}
  </div>
);

const TokenGroup = ({ title, children }: { title: string; children: ReactNode }) => (
  <div>
    <div className="text-[10px] uppercase tracking-[0.12em] text-white/55 mb-3 font-sans font-semibold">
      {title}
    </div>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const Token = ({ name, value }: { name: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-white/95">{name}</span>
    <span className="text-white/55">{value}</span>
  </div>
);

// ─── Composed Surface Demo ─────────────────────────────────────────────

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
    <div className="mt-10">
      {/* POLISH (Day 74): the device frame now sits on a floating extruded
          plinth — the demo reads as a held object on a soft pedestal, not
          a screenshot pasted on a page. Pair with MdlsScrollTilt (outer)
          for the felt-weight effect. */}
      <MdlsExtrudedSurface
        variant="floating"
        className="mx-auto"
        style={{ maxWidth: 440, padding: "1.25rem" }}
      >
      <div
        className="mdls-device-frame mx-auto px-6 py-8 sm:px-7 sm:py-9"
        style={{ maxWidth: 400 }}
      >
        <div className="text-center">
          <h1
            className="font-serif text-[36px] sm:text-[40px] text-[#0a1628]"
            style={{
              textShadow: "0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8)",
              letterSpacing: "-0.015em",
              lineHeight: 1.05,
              fontWeight: 500,
            }}
          >
            Equilibrium
          </h1>
          <p className="mt-1.5 font-serif text-[14px] text-[#0a1628]/70" style={{ letterSpacing: "0.005em" }}>
            Biologic Watch and Task Manager
          </p>
          <div className="mt-5 flex justify-center">
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

        <div className="mt-6 flex justify-center">
          <AuroraCycleDisc
            size={272}
            currentDay={73}
            currentDayLabel="DAY 73"
            variant="light"
          >
            WINTER · WILL-BUILDING
          </AuroraCycleDisc>
        </div>

        <div className="mt-6">
          <EmberBreath active>
            <MattePolymerCard emphasized>
              <div className="flex items-start gap-3">
                <div className="pt-0.5">
                  <SealMedallion size={30} variant="mandala" ariaLabel="Lifelong Dedication seal" />
                </div>
                <div className="flex-1">
                  <p
                    className="font-serif text-[15px] text-[#0a1628] leading-[1.35]"
                    style={{ letterSpacing: "-0.005em" }}
                  >
                    Assist humanity evolve into a consciously coordinated civilization.
                  </p>
                  <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-[#0a1628]/55">
                    Lifelong Dedication · Day 73
                  </p>
                </div>
              </div>
            </MattePolymerCard>
          </EmberBreath>
        </div>

        <div className="mt-7">
          <p className="text-center text-[9px] uppercase tracking-[0.20em] text-[#0a1628]/55 mb-3">
            Workstreams
          </p>
          <div className="relative h-[128px] flex items-center justify-center">
            <SculptedSilkSection
              hue={15}
              blobVariant="a"
              className="absolute z-10"
              style={{ width: 122, height: 122, left: "calc(50% - 154px)" }}
            >
              <span
                className="text-[9.5px] font-medium uppercase tracking-[0.06em] text-[#0a1628]/75 leading-tight w-full"
                style={{ paddingLeft: 14, paddingRight: 40, textAlign: "left" }}
              >
                Planetary<br />OS
              </span>
            </SculptedSilkSection>
            <SculptedSilkSection
              hue={210}
              blobVariant="b"
              className="absolute z-20 flex items-center justify-center"
              style={{ width: 134, height: 134, left: "calc(50% - 67px)" }}
            >
              <span className="text-[9.5px] font-medium uppercase tracking-[0.06em] text-[#0a1628]/75 text-center px-3 leading-tight">
                Venture<br />Studio
              </span>
            </SculptedSilkSection>
            <SculptedSilkSection
              hue={85}
              blobVariant="c"
              className="absolute z-10"
              style={{ width: 122, height: 122, left: "calc(50% + 32px)" }}
            >
              <span
                className="text-[9.5px] font-medium uppercase tracking-[0.06em] text-[#0a1628]/75 leading-tight w-full"
                style={{ paddingRight: 14, paddingLeft: 40, textAlign: "right" }}
              >
                Founder<br />Forge
              </span>
            </SculptedSilkSection>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-center text-[9px] uppercase tracking-[0.20em] text-[#0a1628]/55 mb-3">
            Today's commitments
          </p>
          <div className="grid grid-cols-3 gap-3 justify-items-center">
            {[
              { orbId: 7, label: "Transmit signal", sub: "Ship one essay" },
              { orbId: 2, label: "Seed alliance", sub: "Send Friday DMs" },
              { orbId: 10, label: "Seal artifact", sub: "Complete cycle review" },
            ].map((goal, i) => (
              <div key={i} className="text-center">
                <SoulOrbGoal
                  orbId={goal.orbId}
                  size={52}
                  completed={completedDemoGoals.has(i)}
                  onClick={() => onToggleDemoGoal(i)}
                  label={goal.label}
                />
                <div className="mt-1.5 text-[10px] font-medium text-[#0a1628]/85 leading-tight">
                  {goal.label}
                </div>
                <div className="text-[9px] text-[#0a1628]/50 leading-tight">{goal.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-[8.5px] uppercase tracking-[0.22em] text-[#0a1628]/30">
          MDLS · contemplative operating surface
        </div>
      </div>
      </MdlsExtrudedSurface>
    </div>
  );
};

// ─── Principle Glyphs (inline SVG, small) ──────────────────────────────

const GlyphAuroraDot = () => (
  <div
    style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "radial-gradient(circle at 32% 28%, hsl(42 100% 90%) 0%, hsl(28 88% 72%) 35%, hsl(285 50% 60%) 75%, hsl(200 50% 84%) 100%)",
      boxShadow: "inset 0 1px 3px rgba(255,255,255,0.5), 0 2px 8px hsl(28 80% 60% / 0.30)",
    }}
  />
);

const GlyphOutlineCircle = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="11" stroke="rgba(10,18,34,0.45)" strokeWidth="1" />
  </svg>
);

const GlyphNestedRings = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" stroke="rgba(10,18,34,0.45)" strokeWidth="0.8" />
    <circle cx="14" cy="14" r="8"  stroke="rgba(10,18,34,0.45)" strokeWidth="0.8" />
    <circle cx="14" cy="14" r="4"  stroke="rgba(10,18,34,0.45)" strokeWidth="0.8" />
  </svg>
);

const GlyphMatteCard = () => (
  <div
    style={{
      width: 30, height: 22, borderRadius: 5,
      background: "hsla(38, 38%, 96%, 1)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 1px 2px 4px rgba(10,18,34,0.15)",
      border: "0.5px solid rgba(10,18,34,0.10)",
    }}
  />
);

const GlyphConcentric = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="11" stroke="rgba(10,18,34,0.20)" strokeWidth="0.8" />
    <circle cx="14" cy="14" r="7"  stroke="rgba(10,18,34,0.32)" strokeWidth="0.8" />
    <circle cx="14" cy="14" r="3.5" fill="rgba(10,18,34,0.55)" />
  </svg>
);

const GlyphCoralHalo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="9" stroke="hsl(15 88% 60%)" strokeWidth="1.2" />
    <circle cx="14" cy="14" r="11.5" stroke="hsl(15 88% 60%)" strokeWidth="0.5" strokeOpacity="0.4" />
  </svg>
);

const GlyphCoralDot = () => (
  <span
    className="mdls-coral-dot"
    style={{ width: 10, height: 10, display: "inline-block" }}
  />
);

const GlyphTypeA = () => (
  <span
    className="font-serif text-[#0a1628]"
    style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}
  >
    Aa
  </span>
);

export default MdlsPreview;
