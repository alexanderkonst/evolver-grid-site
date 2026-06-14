import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
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
import MdlsCeramicSurface from "@/components/mdls/MdlsCeramicSurface";
import MdlsAuroraOrb3D from "@/components/mdls/MdlsAuroraOrb3D";
import MdlsSoulOrbField3D from "@/components/mdls/MdlsSoulOrbField3D";
import MdlsSealMedallion3D from "@/components/mdls/MdlsSealMedallion3D";
import MdlsPageProgress from "@/components/mdls/MdlsPageProgress";

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
 *
 * Day 91 (Sasha 2026-06-09): tokenized hairline borders for Aurum. The
 * cream .mdls-page-atmosphere backdrop + the white hero halos live in
 * index.css (central) — dark-skin scoping for those is proposed there,
 * not patched here. text-[#0a1628] classes are re-toned by the global
 * dark-skin rule and stay as-is by design.
 */

// WAVE i18n — verb/when copy resolved via t() at render. `key` is a
// stable suffix appended to mdlsPreview.verbs.<key>.{verb,when}.
const VERBS: Array<{ key: string }> = [
  { key: "transmitSignal" },
  { key: "compressToOneSentence" },
  { key: "closeLoop" },
  { key: "sealArtifact" },
  { key: "seedAlliance" },
  { key: "openDoorway" },
  { key: "holdField" },
  { key: "recoverCoherence" },
  { key: "restoreRhythm" },
  { key: "touchTheSource" },
  { key: "nameTheUnnamed" },
  { key: "forgePrimitive" },
];

const ORB_NAMES = [
  "aurora-warm", "aurora-coral", "aurora-rose", "aurora-orchid",
  "aurora-violet", "aurora-indigo", "aurora-aqua", "aurora-mint",
  "aurora-sage", "aurora-ochre", "aurora-amber", "aurora-ember",
];

// WAVE 9 / M4 — Page navigation sections. Mirrors the section IDs added
// to each <section> below. MdlsPageProgress reads this to render the
// right-side dot indicator + handle scrollIntoView navigation.
// WAVE i18n — `labelKey` resolved via t() into MdlsPageProgress's
// `label` prop at render (see CODEX_SECTIONS mapping inside the component).
const CODEX_SECTIONS = [
  { id: "mdls-hero",        labelKey: "sections.directionMemo" },
  { id: "mdls-composed",    labelKey: "sections.composedSurface" },
  { id: "mdls-principles",  labelKey: "sections.principlesRules" },
  { id: "mdls-materials",   labelKey: "sections.materials" },
  { id: "mdls-registers",   labelKey: "sections.registers" },
  { id: "mdls-typography",  labelKey: "sections.typography" },
  { id: "mdls-vocabulary",  labelKey: "sections.vocabulary" },
];

const MdlsPreview = () => {
  const { t } = useTranslation();
  const [demoMode, setDemoMode] = useState<"attune" | "act">("act");
  const [completedDemoGoals, setCompletedDemoGoals] = useState<Set<number>>(new Set());

  // Resolve section labels for the right-side progress nav at render time
  // (CODEX_SECTIONS is module-scope; t() can only run inside the component).
  const codexSections = CODEX_SECTIONS.map((s) => ({
    id: s.id,
    label: t(`mdlsPreview.${s.labelKey}`),
  }));

  // WAVE 5 + WAVE 7 (N4) — Hero parallax with REAL 3D camera depth.
  // The mesh background uses 2D translateY (it IS a 2D shader, so a 2D
  // translate is correct).
  // The 3D object uses CAMERA-Y motion — the R3F camera moves through
  // the scene as the user scrolls, giving real 3D parallax that
  // adjusts perspective + foreshortening as the camera moves, rather
  // than just shifting a flat 2D crop of the canvas.
  // The prose still uses translateY since it's flat DOM content.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const meshParallaxY = useTransform(heroProgress, [0, 1], [0, 40]);
  // 3D camera Y offset — moves up to 0.9 units in world space (small
  // values; the scene is at z=3.4, fov=42°). The camera looks at (0,0,0)
  // so as it moves up, the dodecahedron appears to drop down + tilt.
  const sacredCameraY = useTransform(heroProgress, [0, 1], [0, 0.9]);
  const proseParallaxY = useTransform(heroProgress, [0, 1], [0, 60]);

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
      {/* WAVE 9 / M4 — fixed-right page-progress dots that show scroll
          position + click-navigate. The "chapter book" cue that ties
          sections into a sequence rather than independent blocks. */}
      <MdlsPageProgress sections={codexSections} />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* §1 · HERO — Direction Memo                                       */}
      {/* WAVE 1 (Day 74, 2026-05-19): WebGL mesh-gradient atmosphere       */}
      {/* (Paper Shaders) replaces the flat CSS .mdls-page-atmosphere for   */}
      {/* the hero. Living color volume instead of banded planes.           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="mdls-hero" ref={heroRef} className="relative min-h-[100vh] flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-20 overflow-hidden">
        {/* WAVE 6: hero keeps pixelRatio=2 (showcase quality) but speed
            stays at the new default 0.18. Only the hero pays the 2x DPR
            cost — body sections use pixelRatio 1. */}
        <motion.div style={{ y: meshParallaxY, position: "absolute", inset: 0 }}>
          <MdlsMeshBackground register="luminous" pixelRatio={2} />
        </motion.div>
        {/* WAVE 7 (N4): 3D centerpiece — now using R3F CAMERA parallax
            instead of DOM translateY. As the user scrolls, the R3F camera
            moves UP through the scene (sacredCameraY 0 → 0.9), causing
            the dodecahedron to appear to drop down + change perspective
            (foreshortening shifts). This is real 3D depth — the same
            principle parallax barrier displays use. */}
        <div className="relative mx-auto" style={{ zIndex: 2, marginBottom: "1.5rem" }}>
          <MdlsSacred3D size={260} hue="warm" cameraOffsetY={sacredCameraY} />
        </div>
        <motion.div className="relative max-w-3xl mx-auto space-y-7" style={{ zIndex: 1, y: proseParallaxY }}>
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
            {t("mdlsPreview.hero.lead.before")}{" "}
            <em className="italic font-normal">{t("mdlsPreview.hero.lead.q1")}</em> {t("mdlsPreview.hero.lead.mid1")}{" "}
            <em className="italic font-normal">{t("mdlsPreview.hero.lead.q2")}</em> {t("mdlsPreview.hero.lead.mid2")}{" "}
            <span className="font-semibold">{t("mdlsPreview.hero.lead.category")}</span> {t("mdlsPreview.hero.lead.after")}
          </p>
          <p
            className="font-serif text-[#0a1628]/82"
            style={{
              fontSize: "clamp(1.125rem, 2.4vw, 1.625rem)",
              lineHeight: 1.45,
              letterSpacing: "-0.005em",
            }}
          >
            {t("mdlsPreview.hero.poles.before")}{" "}
            <span className="font-semibold">{t("mdlsPreview.hero.poles.luminosity")}</span> {t("mdlsPreview.hero.poles.luminosityGloss")}{" "}
            <span className="font-semibold">{t("mdlsPreview.hero.poles.physicality")}</span> {t("mdlsPreview.hero.poles.physicalityGloss")}{" "}
            <span className="font-semibold">{t("mdlsPreview.hero.poles.editorial")}</span> {t("mdlsPreview.hero.poles.editorialGloss")}
          </p>
          <p
            className="font-serif italic text-[#0a1628]/72"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.375rem)",
              lineHeight: 1.5,
            }}
          >
            {t("mdlsPreview.hero.equilibrium")}
          </p>
        </motion.div>
        <div className="relative mt-20 text-center text-[10px] uppercase tracking-[0.28em] text-[#0a1628]/40" style={{ zIndex: 1 }}>
          {t("mdlsPreview.hero.footerMeta")}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* §2 · COMPOSED SURFACE — the centerpiece (where MDLS is seen)     */}
      {/* WAVE 3 (Day 74): wrapped in MdlsScrollTilt — device tilts subtly  */}
      {/* as user scrolls past, reads as a held object, not a screenshot.  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <MdlsRevealSection>
        <section id="mdls-composed" className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <SectionEyebrow>{t("mdlsPreview.composed.eyebrow")}</SectionEyebrow>
            {/* WAVE 6: removed MdlsHoverTilt + MdlsExtrudedSurface "floating"
                plinth wrap. The plinth was creating a visible white pill
                under the device; the hover-tilt was a third transform on
                top of scroll-tilt + parallax, contributing to jitter.
                Scroll-tilt alone gives the held-object feel. */}
            <MdlsScrollTilt>
              <ComposedSurfaceDemo
                demoMode={demoMode}
                onDemoModeChange={setDemoMode}
                completedDemoGoals={completedDemoGoals}
                onToggleDemoGoal={toggleDemoGoal}
              />
            </MdlsScrollTilt>
            <p className="mt-10 text-center max-w-xl mx-auto font-serif italic text-[#0a1628]/60 text-base sm:text-lg leading-relaxed">
              {t("mdlsPreview.composed.caption")}
            </p>
          </div>
        </section>
      </MdlsRevealSection>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* §3 · PRINCIPLES + RULES                                          */}
      {/* WAVE 6: mesh background REMOVED for scroll perf. The extruded     */}
      {/* surfaces carry the visual register here without GPU shader cost.  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <MdlsRevealSection>
      <section id="mdls-principles" className="relative py-24 px-6 sm:px-12">
        <div className="relative max-w-4xl mx-auto">
          <SectionEyebrow>{t("mdlsPreview.principles.eyebrow")}</SectionEyebrow>

          <MdlsExtrudedSurface
            variant="floating"
            className="mt-12"
            style={{ padding: "1.5rem 2rem" }}
          >
            <ul className="space-y-2">
              {[
                { glyph: <GlyphAuroraDot />,           text: t("mdlsPreview.principles.list.colorFromWithin") },
                { glyph: <GlyphOutlineCircle />,       text: t("mdlsPreview.principles.list.restraint") },
                { glyph: <SealMedallion size={32} variant="mandala" />, text: t("mdlsPreview.principles.list.sacred") },
                { glyph: <GlyphNestedRings />,         text: t("mdlsPreview.principles.list.coherence") },
                { glyph: <SoulOrbGoal orbId={7} size={32} />, text: t("mdlsPreview.principles.list.everyPrimitive") },
                { glyph: <GlyphMatteCard />,           text: t("mdlsPreview.principles.list.surfaceIsForm") },
                { glyph: <GlyphConcentric />,          text: t("mdlsPreview.principles.list.motionIsMeaning") },
              ].map((p, i, arr) => (
                <li
                  key={i}
                  className={`flex items-center gap-5 sm:gap-7 py-3 ${i < arr.length - 1 ? "border-b border-[color:var(--skin-hairline,rgba(10,22,40,0.08))]" : ""}`}
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
            <SectionEyebrow>{t("mdlsPreview.principles.rulesEyebrow")}</SectionEyebrow>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10">
              {[
                { glyph: <GlyphCoralHalo />,  text: t("mdlsPreview.principles.rules.haloNotFill") },
                { glyph: <GlyphCoralDot />,   text: t("mdlsPreview.principles.rules.oneCoral") },
                { glyph: <GlyphTypeA />,      text: t("mdlsPreview.principles.rules.weightNotColor") },
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
      {/* WAVE 6: kept mesh (textile-showroom feel needed) but at default   */}
      {/* pixelRatio 1 + opacity 0.35. overflow-hidden contains the         */}
      {/* SculptedSilkSection shadow-bleed artifact that was rendering as   */}
      {/* ghost blobs below adjacent material entries.                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <MdlsRevealSection>
      <section id="mdls-materials" className="relative py-24 px-4 sm:px-12 overflow-hidden">
        <MdlsMeshBackground register="sculptural" style={{ opacity: 0.35 }} />
        <div className="relative max-w-5xl mx-auto overflow-hidden" style={{ zIndex: 1 }}>
          <SectionEyebrow>{t("mdlsPreview.materials.eyebrow")}</SectionEyebrow>

          <div className="mt-16 space-y-32">
            <MaterialFeature
              name="Aurora-Glass-Orb"
              register={t("mdlsPreview.materials.auroraGlassOrb.register")}
              description={t("mdlsPreview.materials.auroraGlassOrb.description")}
              feature={<MdlsAuroraOrb3D size={300} hue="warm" />}
            />

            <MaterialFeature
              name="Matte-Polymer"
              register={t("mdlsPreview.materials.mattePolymer.register")}
              description={t("mdlsPreview.materials.mattePolymer.description")}
              feature={
                <EmberBreath active>
                  <MattePolymerCard emphasized className="max-w-md">
                    <SealMedallion size={28} variant="mandala" />
                    <p
                      className="mt-3 font-serif text-[#0a1628] leading-snug"
                      style={{ fontSize: "1.125rem", letterSpacing: "-0.005em" }}
                    >
                      {t("mdlsPreview.demo.dedicationLine")}
                    </p>
                    <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[#0a1628]/55">
                      {t("mdlsPreview.demo.dedicationMeta")}
                    </p>
                  </MattePolymerCard>
                </EmberBreath>
              }
            />

            <MaterialFeature
              name="Sculpted-Silk"
              register={t("mdlsPreview.materials.sculptedSilk.register")}
              description={t("mdlsPreview.materials.sculptedSilk.description")}
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
              register={t("mdlsPreview.materials.soulOrbLibrary.register")}
              description={t("mdlsPreview.materials.soulOrbLibrary.description")}
              feature={<MdlsSoulOrbField3D width={520} />}
            />

            <MaterialFeature
              name="Tactile-Ceramic"
              register={t("mdlsPreview.materials.tactileCeramic.register")}
              description={t("mdlsPreview.materials.tactileCeramic.description")}
              feature={
                <div className="flex gap-5 justify-center items-center">
                  <MdlsCeramicSurface
                    tone="warm-cream"
                    style={{ width: 180, height: 180 }}
                  >
                    <div className="h-full flex items-center justify-center">
                      <MdlsSealMedallion3D size={140} tone="bronze" />
                    </div>
                  </MdlsCeramicSurface>
                  <MdlsCeramicSurface
                    tone="sand-warm"
                    ember
                    style={{ width: 180, height: 180 }}
                  >
                    <div className="h-full flex items-center justify-center">
                      <MdlsSealMedallion3D size={140} tone="gold" />
                    </div>
                  </MdlsCeramicSurface>
                </div>
              }
            />

            <MaterialFeature
              name="Extruded-Surface"
              register={t("mdlsPreview.materials.extrudedSurface.register")}
              description={t("mdlsPreview.materials.extrudedSurface.description")}
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
                      {t("mdlsPreview.materials.extrudedSurface.pressedLabel")}
                    </div>
                  </MdlsExtrudedSurface>
                </div>
              }
            />

            <MaterialFeature
              name="Sacred-3D"
              register={t("mdlsPreview.materials.sacred3d.register")}
              description={t("mdlsPreview.materials.sacred3d.description")}
              feature={<MdlsSacred3D size={240} hue="warm" />}
            />
          </div>
        </div>
      </section>
      </MdlsRevealSection>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* §5 · REGISTERS — four classes side-by-side                       */}
      {/* WAVE 6: mesh background REMOVED for scroll perf.                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <MdlsRevealSection>
      <section id="mdls-registers" className="relative py-24 px-6 sm:px-12">
        <div className="relative max-w-5xl mx-auto">
          <SectionEyebrow>{t("mdlsPreview.registers.eyebrow")}</SectionEyebrow>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <RegisterCard
              name="Luminous-Cosmic"
              mood={t("mdlsPreview.registers.luminousCosmic.mood")}
              whenToUse={t("mdlsPreview.registers.luminousCosmic.when")}
              sample={<MdlsAuroraOrb3D size={120} hue="warm" />}
            />
            <RegisterCard
              name="Premium-Restrained"
              mood={t("mdlsPreview.registers.premiumRestrained.mood")}
              whenToUse={t("mdlsPreview.registers.premiumRestrained.when")}
              sample={
                <MattePolymerCard className="w-full h-32 flex items-center justify-center !p-3">
                  <SealMedallion size={28} />
                </MattePolymerCard>
              }
            />
            <RegisterCard
              name="Soft-Sculptural"
              mood={t("mdlsPreview.registers.softSculptural.mood")}
              whenToUse={t("mdlsPreview.registers.softSculptural.when")}
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
              mood={t("mdlsPreview.registers.asceticMinimal.mood")}
              whenToUse={t("mdlsPreview.registers.asceticMinimal.when")}
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
      {/* WAVE 6: mesh background REMOVED for scroll perf.                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <MdlsRevealSection>
      <section id="mdls-typography" className="relative py-24 px-6 sm:px-12">
        <div className="relative max-w-4xl mx-auto">
          <SectionEyebrow>{t("mdlsPreview.typography.eyebrow")}</SectionEyebrow>

          <div className="mt-12 space-y-14">
            <TypeSpec label={t("mdlsPreview.typography.heroLabel")}>
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

            <TypeSpec label={t("mdlsPreview.typography.sacredProseLabel")}>
              <p
                className="font-serif text-[#0a1628]"
                style={{
                  fontSize: "clamp(1.25rem, 2.4vw, 1.625rem)",
                  lineHeight: 1.45,
                  letterSpacing: "-0.005em",
                }}
              >
                {t("mdlsPreview.typography.sacredProseSample")}
              </p>
            </TypeSpec>

            <TypeSpec label={t("mdlsPreview.typography.editorialHeroLabel")}>
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

            <TypeSpec label={t("mdlsPreview.typography.bodyUiLabel")}>
              <p className="text-base sm:text-lg text-[#0a1628]/85 leading-relaxed">
                {t("mdlsPreview.typography.bodyUiSample")}
              </p>
            </TypeSpec>

            <TypeSpec label={t("mdlsPreview.typography.microcapsLabel")}>
              <p className="text-xs uppercase tracking-[0.18em] text-[#0a1628]/55 font-semibold">
                {t("mdlsPreview.typography.microcapsSample")}
              </p>
            </TypeSpec>
          </div>
        </div>
      </section>
      </MdlsRevealSection>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* §7 · VOCABULARY + CLOSING                                        */}
      {/* WAVE 6: kept luminous mesh (page bookends in aurora register)     */}
      {/* but at default pixelRatio 1 + slow speed for scroll perf.         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <MdlsRevealSection>
      <section id="mdls-vocabulary" className="relative py-24 px-6 sm:px-12 overflow-hidden">
        <MdlsMeshBackground register="luminous" style={{ opacity: 0.5 }} />
        <div className="relative max-w-4xl mx-auto" style={{ zIndex: 1 }}>
          <SectionEyebrow>{t("mdlsPreview.vocabulary.eyebrow")}</SectionEyebrow>

          <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
            {VERBS.map((v, i) => (
              <li
                key={i}
                className="flex items-baseline gap-4 py-3 border-b border-[color:var(--skin-hairline,rgba(10,22,40,0.08))]"
              >
                <span
                  className="font-serif text-[#0a1628] flex-shrink-0"
                  style={{ fontSize: "1.125rem", letterSpacing: "-0.005em" }}
                >
                  {t(`mdlsPreview.verbs.${v.key}.verb`)}
                </span>
                <span className="text-sm text-[#0a1628]/55 italic ml-auto text-right">
                  {t(`mdlsPreview.verbs.${v.key}.when`)}
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
              {t("mdlsPreview.vocabulary.closing")}
            </p>
            <p className="mt-12 text-[10px] uppercase tracking-[0.28em] text-[#0a1628]/35">
              {t("mdlsPreview.vocabulary.closingMeta")}
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
              {t("mdlsPreview.tokens.heading")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono">
              <TokenGroup title={t("mdlsPreview.tokens.radius")}>
                <Token name="card" value="24px" />
                <Token name="pill" value="9999px" />
                <Token name="orb" value="50%" />
                <Token name="device frame" value="36px" />
              </TokenGroup>
              <TokenGroup title={t("mdlsPreview.tokens.motion")}>
                <Token name="ember breath" value="6s ease-in-out ∞" />
                <Token name="state change" value="240ms spring" />
                <Token name="tilt-settle" value="800ms quart-out" />
                <Token name="aurora drift" value="22s ease-in-out ∞" />
              </TokenGroup>
              <TokenGroup title={t("mdlsPreview.tokens.coral")}>
                <Token name="--mdls-coral" value="hsl(15 88% 60%)" />
                <Token name="--mdls-coral-soft" value="…/0.45" />
                <Token name="per-surface budget" value="1–2 max" />
              </TokenGroup>
              <TokenGroup title={t("mdlsPreview.tokens.atmosphere")}>
                <Token name="page bg" value="hsl(38 38% 95%)" />
                <Token name="warm wash" value="hsl(28 80% 88%) UL" />
                <Token name="cool wash" value="hsl(220 60% 90%) LR" />
                <Token name="device tilt" value="rotX 3° rotY -1.5°" />
              </TokenGroup>
            </div>
          </aside>
        </div>
        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.22em] text-[#0a1628]/35">
          {t("mdlsPreview.tokens.styleGuide", { path: "docs/specs/equilibrium/equilibrium_mdls_style_guide.md" })}
        </p>

        {/* WAVE 5 (5.9): Reference benchmark — what we're calibrating
            against. Public commitment to the bar; holds us accountable. */}
        <aside className="mt-10 mx-auto max-w-3xl text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#0a1628]/35 mb-4">
            {t("mdlsPreview.calibration.label")}
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[11px] text-[#0a1628]/55 font-serif italic">
            <span>{t("mdlsPreview.calibration.linear")}</span>
            <span>·</span>
            <span>{t("mdlsPreview.calibration.apple")}</span>
            <span>·</span>
            <span>{t("mdlsPreview.calibration.spline")}</span>
          </div>
          <p className="mt-4 text-[9px] uppercase tracking-[0.22em] text-[#0a1628]/30">
            {t("mdlsPreview.calibration.warning")}
          </p>
        </aside>
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
  const { t } = useTranslation();
  return (
    <div className="mt-10">
      {/* WAVE 6 (Day 74 evening): removed the MdlsExtrudedSurface "floating"
          plinth wrap. It was creating a visible white pill under the
          device — Sasha flagged it as the "strange shadow." The device
          frame's own shadow + the outer scroll-tilt are sufficient. */}
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
            {t("mdlsPreview.demo.subtitle")}
          </p>
          <div className="mt-5 flex justify-center">
            <ToggleGlassDual
              options={[
                { value: "attune", label: t("mdlsPreview.demo.toggleAttune") },
                { value: "act", label: t("mdlsPreview.demo.toggleAct") },
              ]}
              value={demoMode}
              onChange={onDemoModeChange}
              ariaLabel={t("mdlsPreview.demo.toggleAriaLabel")}
              variant="light"
              showCoralDot
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <AuroraCycleDisc
            size={272}
            currentDay={73}
            currentDayLabel={t("mdlsPreview.demo.dayLabel", { day: 73 })}
            variant="light"
            use3D
          >
            {t("mdlsPreview.demo.season")}
          </AuroraCycleDisc>
        </div>

        <div className="mt-6">
          <EmberBreath active>
            <MattePolymerCard emphasized>
              <div className="flex items-start gap-3">
                <div className="pt-0.5">
                  <SealMedallion size={30} variant="mandala" ariaLabel={t("mdlsPreview.demo.sealAriaLabel")} />
                </div>
                <div className="flex-1">
                  <p
                    className="font-serif text-[15px] text-[#0a1628] leading-[1.35]"
                    style={{ letterSpacing: "-0.005em" }}
                  >
                    {t("mdlsPreview.demo.dedicationLine")}
                  </p>
                  <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-[#0a1628]/55">
                    {t("mdlsPreview.demo.dedicationMeta")}
                  </p>
                </div>
              </div>
            </MattePolymerCard>
          </EmberBreath>
        </div>

        <div className="mt-7">
          <p className="text-center text-[9px] uppercase tracking-[0.20em] text-[#0a1628]/55 mb-3">
            {t("mdlsPreview.demo.workstreams")}
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
            {t("mdlsPreview.demo.commitments")}
          </p>
          <div className="grid grid-cols-3 gap-3 justify-items-center">
            {[
              { orbId: 7, label: t("mdlsPreview.verbs.transmitSignal.verb"), sub: t("mdlsPreview.demo.goalShipEssay") },
              { orbId: 2, label: t("mdlsPreview.verbs.seedAlliance.verb"), sub: t("mdlsPreview.demo.goalFridayDms") },
              { orbId: 10, label: t("mdlsPreview.verbs.sealArtifact.verb"), sub: t("mdlsPreview.demo.goalCycleReview") },
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
          {t("mdlsPreview.demo.footer")}
        </div>
      </div>
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
