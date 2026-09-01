/**
 * /founder-market-fit — The Founder-Market Fit category surface (Day 170).
 *
 * This is the category-capture claim per Technology 141: the five possessions
 * (Definition, Theory, Instrument, Method, Proof) gathered in one navigable,
 * UNGATED place. The gathering is the claim.
 *
 * Content is assembly, not invention. The definition, scale, three tests, and
 * the claim are quoted verbatim from docs/02-strategy/founder_market_fit.md.
 * The four-degree decision tree is Technology 142, verbatim from the library.
 * Register: parchment / Cormorant / gold, borrowed from BuildContainer.
 *
 * NOTHING GATED. No auth, no email wall. The definition is meant to travel.
 * Say "founder-market fit" verbatim everywhere. Never a synonym.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const eyebrowGold: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: "10.5px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--skin-accent-gold, #b8860b)",
};

const cormorantTitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 700,
  letterSpacing: "-0.005em",
  color: "var(--skin-text-primary, #0b2a5a)",
};

const sourceSerifBody: React.CSSProperties = {
  fontFamily: "'Source Serif 4', serif",
  fontWeight: 500,
  color: "var(--skin-text-primary, #0b2a5a)",
  lineHeight: 1.65,
};

const parchmentCard: React.CSSProperties = {
  background: "var(--skin-card-fill, rgba(255, 252, 245, 0.92))",
  border: "0.5px solid rgba(212, 175, 55, 0.55)",
  boxShadow:
    "0 0 22px -8px rgba(212, 175, 55, 0.30), 0 16px 40px -20px rgba(10, 22, 40, 0.22)",
};

const goldText: React.CSSProperties = {
  ...cormorantTitle,
  color: "var(--skin-accent-gold, #8a6508)",
};

type ScaleRow = { range: string; text: string };
type DegreeRow = { degree: string; state: string; decision: string; truth: string };
type TestRow = { name: string; q: string };
type NamedRow = { name: string; reads?: string; what?: string };
type ProofRow = { n: string; text: string };

const NAV = [
  { id: "definition", key: "navDefinition" },
  { id: "theory", key: "navTheory" },
  { id: "instrument", key: "navInstrument" },
  { id: "method", key: "navMethod" },
  { id: "proof", key: "navProof" },
];

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p style={eyebrowGold} className="mb-3">
    {children}
  </p>
);

const FounderMarketFitCategory = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState("definition");

  // Highlight the nav item for the section currently in view.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const scale = t("fmfCategory.scale", { returnObjects: true }) as ScaleRow[];
  const degrees = t("fmfCategory.degrees", { returnObjects: true }) as DegreeRow[];
  const tests = t("fmfCategory.tests", { returnObjects: true }) as TestRow[];
  const know = t("fmfCategory.know", { returnObjects: true }) as string[];
  const instrument = t("fmfCategory.instrument", { returnObjects: true }) as NamedRow[];
  const possessions = t("fmfCategory.possessions", { returnObjects: true }) as NamedRow[];
  const proof = t("fmfCategory.proof", { returnObjects: true }) as ProofRow[];

  return (
    <div className="min-h-screen" style={{ background: "var(--skin-page-bg, #f6f1e7)" }}>
      <SEO
        title={t("fmfCategory.seoTitle")}
        description={t("fmfCategory.seoDescription")}
        path="/founder-market-fit"
      />

      {/* Sticky section nav */}
      <nav
        className="sticky top-0 z-20 backdrop-blur-sm"
        style={{
          background: "var(--skin-page-bg, rgba(246,241,231,0.86))",
          borderBottom: "0.5px solid rgba(212, 175, 55, 0.30)",
        }}
      >
        <div className="max-w-[820px] mx-auto px-5 py-3 flex flex-wrap gap-x-5 gap-y-1 justify-center">
          {NAV.map(({ id, key }) => (
            <a
              key={id}
              href={`#${id}`}
              style={{
                ...eyebrowGold,
                opacity: active === id ? 1 : 0.5,
                borderBottom:
                  active === id
                    ? "1px solid var(--skin-accent-gold, #b8860b)"
                    : "1px solid transparent",
              }}
              className="pb-0.5 transition-opacity hover:opacity-90"
            >
              {t(`fmfCategory.${key}`)}
            </a>
          ))}
        </div>
      </nav>

      <div className="max-w-[820px] mx-auto px-5 py-14 sm:py-20">
        {/* Hero — the definition IS the headline */}
        <header className="mb-16 max-w-[680px]">
          <p style={eyebrowGold}>{t("fmfCategory.eyebrow")}</p>
          <h1
            className="text-[27px] sm:text-[36px] leading-[1.22] mt-3 mb-6"
            style={cormorantTitle}
          >
            {t("fmfCategory.heroDefinition")}
          </h1>
          <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
            {t("fmfCategory.heroHigh")}
          </p>
          <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
            {t("fmfCategory.heroLow")}
          </p>
          <p className="text-[12px] italic mt-5" style={{ ...sourceSerifBody, opacity: 0.7 }}>
            {t("fmfCategory.heroReuse")}
          </p>
        </header>

        {/* ===== 01 · DEFINITION ===== */}
        <section id="definition" className="mb-20 scroll-mt-24">
          <SectionLabel>{t("fmfCategory.definitionLabel")}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl mb-6" style={cormorantTitle}>
            {t("fmfCategory.definitionHeading")}
          </h2>

          {/* The scale — 0 to 10, first-class visual */}
          <p className="text-[15px] sm:text-base mb-4 max-w-[680px]" style={sourceSerifBody}>
            {t("fmfCategory.scaleIntro")}
          </p>
          <div className="rounded-2xl overflow-hidden mb-10" style={parchmentCard}>
            {scale.map((row, i) => (
              <div
                key={row.range}
                className="flex gap-4 sm:gap-6 px-5 sm:px-7 py-4"
                style={{
                  borderTop: i === 0 ? "none" : "0.5px solid rgba(212,175,55,0.28)",
                }}
              >
                <span
                  className="text-2xl sm:text-3xl shrink-0 w-[68px] tabular-nums"
                  style={goldText}
                >
                  {row.range}
                </span>
                <span className="text-[14px] sm:text-[15px] self-center" style={sourceSerifBody}>
                  {row.text}
                </span>
              </div>
            ))}
          </div>

          {/* The four-degree decision tree — Technology 142, the centerpiece */}
          <SectionLabel>{t("fmfCategory.degreesLabel")}</SectionLabel>
          <h3 className="text-xl sm:text-2xl mb-3" style={cormorantTitle}>
            {t("fmfCategory.degreesHeading")}
          </h3>
          <p className="text-[15px] sm:text-base mb-6 max-w-[680px]" style={sourceSerifBody}>
            {t("fmfCategory.degreesIntro")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            {degrees.map((d) => (
              <div key={d.degree} className="rounded-2xl p-5 sm:p-6" style={parchmentCard}>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-2xl tabular-nums" style={goldText}>
                    {d.degree}
                  </span>
                  <span className="text-[15px] sm:text-base" style={{ ...cormorantTitle, fontWeight: 600 }}>
                    {d.state}
                  </span>
                </div>
                <p style={eyebrowGold} className="mt-3 mb-1">
                  {t("fmfCategory.degreesDecisionLabel")}
                </p>
                <p className="text-[14px] sm:text-[15px] mb-3" style={sourceSerifBody}>
                  {d.decision}
                </p>
                <p style={eyebrowGold} className="mb-1">
                  {t("fmfCategory.degreesTruthLabel")}
                </p>
                <p className="text-[13.5px] italic" style={{ ...sourceSerifBody, opacity: 0.85 }}>
                  {d.truth}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[14px] sm:text-[15px] italic mb-12 max-w-[680px]" style={sourceSerifBody}>
            {t("fmfCategory.degreesNote")}
          </p>

          {/* The three tests */}
          <SectionLabel>{t("fmfCategory.testsLabel")}</SectionLabel>
          <p className="text-[15px] sm:text-base mb-5 max-w-[680px]" style={sourceSerifBody}>
            {t("fmfCategory.testsIntro")}
          </p>
          <div className="space-y-4 mb-6">
            {tests.map((test, i) => (
              <div key={test.name} className="flex gap-4 items-start">
                <span
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-[15px] mt-0.5"
                  style={{ ...goldText, border: "0.5px solid rgba(212,175,55,0.5)" }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-[15px] sm:text-base" style={{ ...cormorantTitle, fontWeight: 600 }}>
                    {test.name}
                  </p>
                  <p className="text-[14px] sm:text-[15px]" style={sourceSerifBody}>
                    {test.q}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[14px] sm:text-[15px] mb-12 max-w-[680px]" style={sourceSerifBody}>
            {t("fmfCategory.testsClose")}
          </p>

          {/* What it is not / How you know / The claim */}
          <div className="max-w-[680px] space-y-8">
            <div>
              <SectionLabel>{t("fmfCategory.notLabel")}</SectionLabel>
              <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
                {t("fmfCategory.notBody")}
              </p>
            </div>
            <div>
              <SectionLabel>{t("fmfCategory.knowLabel")}</SectionLabel>
              <ul className="space-y-2">
                {know.map((line) => (
                  <li key={line} className="text-[15px] sm:text-base" style={sourceSerifBody}>
                    • {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-6 sm:p-7" style={parchmentCard}>
              <SectionLabel>{t("fmfCategory.claimLabel")}</SectionLabel>
              <p className="text-[15px] sm:text-base mb-3" style={sourceSerifBody}>
                {t("fmfCategory.claimBody1")}
              </p>
              <p className="text-[16px] sm:text-[17px] mb-3" style={{ ...cormorantTitle, fontWeight: 600 }}>
                {t("fmfCategory.claimBody2")}
              </p>
              <p className="text-[15px] sm:text-base" style={sourceSerifBody}>
                {t("fmfCategory.claimBody3")}
              </p>
            </div>
            <p className="text-[16px] sm:text-[17px] italic pl-4" style={{ ...sourceSerifBody, borderLeft: "2px solid rgba(212,175,55,0.5)" }}>
              {t("fmfCategory.founderFacing")}
            </p>
          </div>
        </section>

        {/* ===== 02 · THEORY ===== */}
        <section id="theory" className="mb-20 scroll-mt-24 max-w-[680px]">
          <SectionLabel>{t("fmfCategory.theoryLabel")}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl mb-6" style={cormorantTitle}>
            {t("fmfCategory.theoryHeading")}
          </h2>
          <div className="space-y-4">
            <p className="text-[15px] sm:text-base" style={sourceSerifBody}>{t("fmfCategory.theory1")}</p>
            <p className="text-[15px] sm:text-base" style={sourceSerifBody}>{t("fmfCategory.theory2")}</p>
            <p className="text-[15px] sm:text-base" style={sourceSerifBody}>{t("fmfCategory.theory3")}</p>
          </div>
        </section>

        {/* ===== 03 · INSTRUMENT ===== */}
        <section id="instrument" className="mb-20 scroll-mt-24">
          <div className="max-w-[680px]">
            <SectionLabel>{t("fmfCategory.instrumentLabel")}</SectionLabel>
            <h2 className="text-2xl sm:text-3xl mb-3" style={cormorantTitle}>
              {t("fmfCategory.instrumentHeading")}
            </h2>
            <p className="text-[15px] sm:text-base mb-6" style={sourceSerifBody}>
              {t("fmfCategory.instrumentIntro")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {instrument.map((row) => (
              <div key={row.name} className="rounded-2xl p-5 sm:p-6" style={parchmentCard}>
                <p style={{ ...cormorantTitle, fontWeight: 600 }} className="text-[17px] mb-2">
                  {row.name}
                </p>
                <p className="text-[14px] sm:text-[15px]" style={sourceSerifBody}>
                  {row.reads}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 04 · METHOD ===== */}
        <section id="method" className="mb-20 scroll-mt-24">
          <div className="max-w-[680px]">
            <SectionLabel>{t("fmfCategory.methodLabel")}</SectionLabel>
            <h2 className="text-2xl sm:text-3xl mb-4" style={cormorantTitle}>
              {t("fmfCategory.methodHeading")}
            </h2>
            <p className="text-[15px] sm:text-base mb-8" style={sourceSerifBody}>
              {t("fmfCategory.methodIntro")}
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden mb-8" style={parchmentCard}>
            {possessions.map((p, i) => (
              <div
                key={p.name}
                className="flex gap-4 sm:gap-6 px-5 sm:px-7 py-4"
                style={{ borderTop: i === 0 ? "none" : "0.5px solid rgba(212,175,55,0.28)" }}
              >
                <span
                  className="text-[15px] sm:text-base shrink-0 w-[92px]"
                  style={{ ...cormorantTitle, fontWeight: 600, color: "var(--skin-accent-gold, #8a6508)" }}
                >
                  {p.name}
                </span>
                <span className="text-[14px] sm:text-[15px] self-center" style={sourceSerifBody}>
                  {p.what}
                </span>
              </div>
            ))}
          </div>
          <div className="max-w-[680px]">
            <p className="text-[15px] sm:text-base mb-4" style={sourceSerifBody}>
              {t("fmfCategory.methodLinkPrefix")}
            </p>
            <Link
              to="/playbook"
              className="inline-flex items-center gap-2 text-[13px] underline underline-offset-4 decoration-[rgba(184,134,11,0.5)] hover:opacity-70 transition-opacity"
              style={{ ...eyebrowGold, fontSize: "12px" }}
            >
              {t("fmfCategory.methodLink")}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* ===== 05 · PROOF ===== */}
        <section id="proof" className="mb-20 scroll-mt-24 max-w-[680px]">
          <SectionLabel>{t("fmfCategory.proofLabel")}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl mb-4" style={cormorantTitle}>
            {t("fmfCategory.proofHeading")}
          </h2>
          <p className="text-[15px] sm:text-base mb-6" style={sourceSerifBody}>
            {t("fmfCategory.proofIntro")}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {proof.map((row) => (
              <div key={row.n} className="rounded-xl p-4 sm:p-5" style={parchmentCard}>
                <p style={eyebrowGold} className="mb-1.5">{row.n}</p>
                <p className="text-[14px] sm:text-[15px]" style={sourceSerifBody}>{row.text}</p>
              </div>
            ))}
          </div>
          <p
            className="text-[14px] sm:text-[15px] italic p-5 rounded-xl"
            style={{ ...sourceSerifBody, background: "rgba(212,175,55,0.06)", border: "0.5px dashed rgba(212,175,55,0.45)" }}
          >
            {t("fmfCategory.proofPending")}
          </p>
        </section>

        {/* On reuse */}
        <section className="max-w-[680px] pt-8" style={{ borderTop: "0.5px solid rgba(212,175,55,0.3)" }}>
          <SectionLabel>{t("fmfCategory.reuseLabel")}</SectionLabel>
          <p className="text-[15px] sm:text-base mb-3" style={sourceSerifBody}>
            {t("fmfCategory.reuseBody")}
          </p>
          <p className="text-[15px] sm:text-base" style={{ ...sourceSerifBody, fontWeight: 600 }}>
            {t("fmfCategory.reuseDiscipline")}
          </p>
        </section>
      </div>
    </div>
  );
};

export default FounderMarketFitCategory;
