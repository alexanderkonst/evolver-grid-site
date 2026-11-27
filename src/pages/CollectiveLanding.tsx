import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { formatCurrency } from "@/i18n/format";
import { COLLECTIVE_FOUNDERS, REVENUE_TIMELINE } from "@/data/ventureTimeline";
import "./CollectiveLanding.css";

/**
 * CollectiveLanding: public page for the Sovereign Founder Collective.
 *
 * Route: /collective (public, no auth, no game shell: marketing pages fall
 * through to "no shell" in lib/shellRoutes.ts).
 *
 * Copy source (single, verbatim): docs/02-strategy/collective/collective_landing_v2.md
 * Sections 1-8 in that order. English lives in src/locales/en/common.json under
 * `collective.*`; es/ru mirror its keys. Do not add copy here that is not in that file.
 *
 * Section 5 ("Our business, in public") reads src/data/ventureTimeline.ts, the same
 * data /dashboard uses. Milestone text is data (English); the chrome around it is i18n.
 *
 * Template followed: docs/templates/module-form.md (§12 Landing and Final screen copy law).
 */

const ZOG_ENTRY = "/zone-of-genius/entry";
const PATH_PAGE = "/path";
const DASHBOARD_PAGE = "/dashboard";

type CardCopy = { name: string; gives: string; result: string };
type FigureCopy = { value: string; label: string };

type PublicView = "short" | "key" | "full";
const PUBLIC_VIEWS: PublicView[] = ["short", "key", "full"];

// Same data as /dashboard. Newest last; the latest entry carries the running total.
const LATEST = REVENUE_TIMELINE[REVENUE_TIMELINE.length - 1];
const KEY_MILESTONES = REVENUE_TIMELINE.filter((m) => m.key);

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function CollectiveLanding() {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLElement>(null);
  const [view, setView] = useState<PublicView>("short");

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
            {cards.map((card, i) => (
              <li
                key={card.name}
                className={`cl-card${i === 0 ? " cl-card-heart" : ""}`}
                data-reveal
                style={delay((i % 3) * 80)}
              >
                <h3>{card.name}</h3>
                <p className="cl-gives">{card.gives}</p>
                <p className="cl-result">
                  <b>{t("collective.inside.resultLabel")}:</b> {card.result}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. Our business, in public */}
      <section className="cl-sec" aria-labelledby="cl-public">
        <div className="cl-wrap cl-narrow">
          <h2 id="cl-public" data-reveal>{t("collective.public.title")}</h2>
          <p className="cl-founders" data-reveal data-testid="cl-founders-count">
            {t("collective.public.founders", { count: COLLECTIVE_FOUNDERS })}
          </p>
          <p className="cl-lede cl-sub" data-reveal>{t("collective.public.sub")}</p>

          <div
            className="cl-views"
            role="group"
            aria-label={t("collective.public.viewsLabel")}
            data-reveal
          >
            {PUBLIC_VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                className="cl-view-btn"
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {t(`collective.public.views.${v}`)}
              </button>
            ))}
          </div>

          {view === "short" && (
            <p className="cl-pub-short" data-testid="cl-public-short">
              {t("collective.public.short", {
                days: LATEST.day,
                total: formatCurrency(LATEST.total, "USD", { maximumFractionDigits: 0 }),
              })}
              <span className="cl-pub-latest">
                <b>{t("collective.public.latest")}:</b> {LATEST.label}
              </span>
            </p>
          )}

          {view !== "short" && (
            <ol className="cl-pub-list" data-testid={`cl-public-${view}`}>
              {(view === "key" ? KEY_MILESTONES : REVENUE_TIMELINE).map((m) => (
                <li key={`${m.day}-${m.label}`}>
                  <span className="cl-pub-day">{t("collective.public.day", { day: m.day })}</span>
                  <span className="cl-pub-text">{m.label}</span>
                </li>
              ))}
            </ol>
          )}

          <p className="cl-pub-link" data-reveal>
            <Link className="cl-step-link" to={DASHBOARD_PAGE}>{t("collective.public.link")}</Link>
          </p>
        </div>
      </section>

      {/* 6. The path in */}
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

      {/* 7. Terms */}
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

      {/* 8. Closing */}
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
