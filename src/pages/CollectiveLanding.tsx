import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import "./CollectiveLanding.css";

/**
 * CollectiveLanding: public page for the Sovereign Founder Collective.
 *
 * Route: /collective (public, no auth, no game shell: marketing pages fall
 * through to "no shell" in lib/shellRoutes.ts).
 *
 * Copy source (single, verbatim): docs/02-strategy/collective/collective_landing_v2.md
 * Sections 1-7 in that order. English lives in src/locales/en/common.json under
 * `collective.*`; es/ru mirror its keys. Do not add copy here that is not in that file.
 *
 * Template followed: docs/templates/module-form.md (§12 Landing and Final screen copy law).
 */

const ZOG_ENTRY = "/zone-of-genius/entry";
const PATH_PAGE = "/path";

type Tone = "live" | "coming";

type CardCopy = { name: string; gives: string; result: string };
type FigureCopy = { value: string; label: string };

// One entry per card, same order as `collective.inside.cards`.
// Live = solid tag, Coming = outlined tag. Labels come from the copy file.
const CARD_STATUS: { tone: Tone; key: "live" | "coming" | "liveInGame" | "firstSteps" }[] = [
  { tone: "coming", key: "coming" },        // 1 Collaborations
  { tone: "live", key: "liveInGame" },      // 2 Introductions
  { tone: "live", key: "live" },            // 3 Founder Cockpit
  { tone: "live", key: "firstSteps" },      // 4 Your AI
  { tone: "live", key: "live" },            // 5 Shared rhythm
  { tone: "coming", key: "coming" },        // 6 Mutual promotion
  { tone: "coming", key: "coming" },        // 7 Scaling experts
  { tone: "coming", key: "coming" },        // 8 Mini-hackathons
];

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function CollectiveLanding() {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLElement>(null);

  const figures = t("collective.origin.figures", { returnObjects: true }) as FigureCopy[];
  const cards = t("collective.inside.cards", { returnObjects: true }) as CardCopy[];
  const steps = t("collective.path.steps", { returnObjects: true }) as string[];
  const terms = t("collective.terms.items", { returnObjects: true }) as string[];

  // Scroll reveal. Content is visible without JS; the class that hides
  // un-revealed blocks is only added once the observer is ready, and never
  // under reduced motion.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("cl-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    root.classList.add("cl-anim");
    items.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      root.classList.remove("cl-anim");
    };
  }, []);

  return (
    <main ref={rootRef} className="cl">
      <SEO
        title={t("collective.hero.title")}
        description={t("collective.seoDescription")}
        path="/collective"
      />

      {/* 1. Hero */}
      <section className="cl-sec cl-hero">
        <div className="cl-wrap">
          <p className="cl-eyebrow" data-reveal>{t("collective.hero.eyebrow")}</p>
          <h1 data-reveal style={delay(60)}>{t("collective.hero.title")}</h1>
          <p className="cl-lede" data-reveal style={delay(120)}>{t("collective.hero.lede")}</p>
          <p className="cl-line" data-reveal style={delay(160)}>{t("collective.hero.line")}</p>
          <div className="cl-cta" data-reveal style={delay(200)}>
            <Link className="cl-btn" to={ZOG_ENTRY}>{t("collective.hero.cta")}</Link>
            <span className="cl-note">{t("collective.hero.free")}</span>
          </div>
        </div>
      </section>

      {/* 2. It didn't start from zero */}
      <section className="cl-sec" aria-labelledby="cl-origin">
        <div className="cl-wrap">
          <h2 id="cl-origin" data-reveal>{t("collective.origin.title")}</h2>
          <p className="cl-lede cl-sub" data-reveal>{t("collective.origin.lede")}</p>
          <ul className="cl-figures" aria-label={t("collective.origin.figuresLabel")}>
            {figures.map((f, i) => (
              <li key={f.label} data-reveal style={delay(i * 70)}>
                <span className="cl-fig-value">{f.value}</span>
                <span className="cl-fig-label">{f.label}</span>
              </li>
            ))}
          </ul>
          <p className="cl-foot" data-reveal>{t("collective.origin.footnote")}</p>
        </div>
      </section>

      {/* 3. What it is */}
      <section className="cl-sec" aria-labelledby="cl-what">
        <div className="cl-wrap cl-narrow">
          <h2 id="cl-what" data-reveal>{t("collective.what.title")}</h2>
          <p className="cl-lede cl-sub" data-reveal>{t("collective.what.body")}</p>
        </div>
      </section>

      {/* 4. What you get inside */}
      <section className="cl-sec" aria-labelledby="cl-inside">
        <div className="cl-wrap">
          <h2 id="cl-inside" data-reveal>{t("collective.inside.title")}</h2>
          <ol className="cl-cards">
            {cards.map((card, i) => {
              const status = CARD_STATUS[i];
              return (
                <li
                  key={card.name}
                  className={`cl-card${i === 0 ? " cl-card-heart" : ""}`}
                  data-reveal
                  style={delay((i % 3) * 80)}
                >
                  <span className={`cl-tag cl-tag-${status.tone}`}>
                    {t(`collective.inside.status.${status.key}`)}
                  </span>
                  <h3>{card.name}</h3>
                  <p className="cl-gives">{card.gives}</p>
                  <p className="cl-result">
                    <b>{t("collective.inside.resultLabel")}:</b> {card.result}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 5. The path in */}
      <section className="cl-sec" aria-labelledby="cl-path">
        <div className="cl-wrap cl-narrow">
          <h2 id="cl-path" data-reveal>{t("collective.path.title")}</h2>
          <ol className="cl-steps">
            {steps.map((step, i) => (
              <li key={step} data-reveal style={delay(i * 80)}>
                <span className="cl-step-n" aria-hidden="true">{i + 1}</span>
                {i === 1 ? (
                  <Link className="cl-step-link" to={PATH_PAGE}>{step}</Link>
                ) : (
                  <span>{step}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6. Terms */}
      <section className="cl-sec" aria-labelledby="cl-terms">
        <div className="cl-wrap cl-narrow">
          <h2 id="cl-terms" data-reveal>{t("collective.terms.title")}</h2>
          <ul className="cl-terms">
            {terms.map((term, i) => (
              <li key={term} data-reveal style={delay(i * 60)}>{term}</li>
            ))}
          </ul>
          <p className="cl-motto" data-reveal>{t("collective.terms.motto")}</p>
        </div>
      </section>

      {/* 7. Closing */}
      <section className="cl-sec cl-close">
        <div className="cl-wrap">
          <p className="cl-lede cl-close-lede" data-reveal>{t("collective.closing.lede")}</p>
          <div className="cl-cta" data-reveal style={delay(80)}>
            <Link className="cl-btn" to={ZOG_ENTRY}>{t("collective.closing.cta")}</Link>
          </div>
          <p className="cl-line cl-ask" data-reveal>{t("collective.closing.ask")}</p>
          <p className="cl-footer">{t("collective.closing.footer")}</p>
        </div>
      </section>
    </main>
  );
}
