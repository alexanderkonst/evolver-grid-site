/** /products/vector — the landing-and-direction program, in the infographic style (v5: moon and neon).
 *  Lunar is the baseline; every other skin re-voices the same structure through the
 *  `--vec-*` role tokens in TheVector.css. No colour lives in this file. */
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, ChevronDown, Droplets, Flame, Mountain, Sparkles, Wind, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { MoonDivider as VectorDivider, MoonEyebrow as VectorEyebrow, MoonStar } from "@/components/products/MoonNeon";
import "./TheVector.css";

const TELEGRAM_CONVERSATION = "https://t.me/integralevolution";
const MOON_CREDIT_URL = "https://commons.wikimedia.org/wiki/File:FullMoon2010.jpg";

// The five intro paragraphs under the hero, each its own <p>.
const ESSENCE_KEYS = ["essence1", "essence2", "essence3", "essence4", "essence5"] as const;

// Blocks 0 to 9, in route order. The number is part of each title string.
const BLOCK_KEYS = ["b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9"] as const;

// Block 7 (Элементы) shows the five elements as chips under its text.
const ELEMENTS_BLOCK = "b7";
const ELEMENTS: { key: string; Icon: LucideIcon }[] = [
  { key: "fire", Icon: Flame },
  { key: "water", Icon: Droplets },
  { key: "earth", Icon: Mountain },
  { key: "air", Icon: Wind },
  { key: "ether", Icon: Sparkles },
];

/** Collapsible panel (sections 01 and 02). The numbered eyebrow heading is the toggle: a real
 *  <button> inside the <h2>, wired with aria-expanded / aria-controls. Collapsed on load.
 *  The body folds with a grid-rows transition (CSS drops it under reduced motion); while folded it is
 *  `visibility: hidden`, so it leaves both the tab order and the accessibility tree. */
const VectorPanel = ({ n, heading, children }: { n: string; heading: ReactNode; children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const bodyId = `${uid}-body`;
  return (
    <div className="vector-panel" data-open={open}>
      <h2 className="vector-eyebrow vector-eyebrow-toggle">
        <button type="button" className="vector-panel-toggle" aria-expanded={open} aria-controls={bodyId}
          onClick={() => setOpen(v => !v)}>
          <span className="vector-eyebrow-num" aria-hidden="true">{n} <span className="vector-eyebrow-dot">·</span></span>
          <span className="vector-heading-text">{heading}</span>
          <ChevronDown className="vector-panel-chevron w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </button>
      </h2>
      <div id={bodyId} className="vector-panel-body" role="region" aria-label={typeof heading === "string" ? heading : undefined}>
        <div className="vector-panel-clip">
          <div className="vector-panel-inner">{children}</div>
        </div>
      </div>
    </div>
  );
};

/** The 0–9 path. On desktop the hairline leans: JS only measures where each block sits,
 *  so the stars ride the diagonal exactly; CSS decides whether to use it (mobile stays vertical). */
const VectorRoute = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLOListElement>(null);

  useLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const place = () => {
      const items = Array.from(list.children) as HTMLElement[];
      if (items.length < 2) return;
      const tops = items.map(item => item.offsetTop);
      const span = tops[tops.length - 1] - tops[0];
      list.style.setProperty("--route-top", `${tops[0]}px`);
      list.style.setProperty("--route-h", `${span}px`);
      items.forEach((item, i) => item.style.setProperty("--shift", span > 0 ? `${(tops[i] - tops[0]) / span}` : "0"));
    };
    place();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(place);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return <ol ref={ref} className="vector-route">{children}</ol>;
};

const TheVector = () => {
  const { t } = useTranslation();
  const contact = (
    <a href={TELEGRAM_CONVERSATION} target="_blank" rel="noopener noreferrer" className="vector-cta">
      <span>{t("vector.cta")}</span>
      <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
    </a>
  );

  return (
    <>
      <SEO title={t("vector.title")} description={t("vector.seoDescription")} path="/products/vector" />
      <main className="product-landing vector-page relative min-h-dvh font-sans">
        <div className="vector-sky" aria-hidden="true" />
        <div className="vector-inner relative max-w-2xl mx-auto px-5 md:px-6 py-16 space-y-16">
          <header className="vector-hero text-center space-y-6 pt-2 pb-2">
            {/* Full moon behind the title; the title sits on it with a dark soft halo (CSS). */}
            <div className="vector-hero-stage">
              <span className="vector-moon" aria-hidden="true">
                <img src="/vector-moon.webp" alt="" width={840} height={840} decoding="async" fetchPriority="high" />
              </span>
              <div className="vector-hero-text">
                <p className="vector-hero-label">{t("vector.programLabel")}</p>
                <h1 className="vector-title vector-hero-title">{t("vector.heading")}</h1>
              </div>
            </div>
            <p className="vector-lead max-w-md mx-auto">{t("vector.subheading")}</p>
            <VectorDivider />
            {/* Price lives once, in the closing block (Sasha, 2026-11-17). */}
            <div className="flex flex-col items-center gap-3 pt-2">{contact}</div>
          </header>

          <section className="vector-card max-w-md mx-auto space-y-6">
            <VectorEyebrow heading>{t("vector.gainHeading")}</VectorEyebrow>
            <ul className="vector-list space-y-3 text-left">
              {["g1", "g2", "g3", "g4"].map(key => (
                <li key={key}>
                  <MoonStar className="vector-bullet" />
                  <span className="vector-body">{t(`vector.${key}`)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="max-w-md mx-auto space-y-8">
            <div className="vector-essence space-y-4 text-center">
              {ESSENCE_KEYS.map(key => (
                <p key={key} className="vector-body">{t(`vector.${key}`)}</p>
              ))}
            </div>
            {/* Panels 01 and 02 start collapsed (Sasha, 2026-11-17); the heading is the toggle. */}
            <VectorPanel n="01" heading={t("vector.formatHeading")}>
              <ul className="vector-list space-y-3 text-left">
                {["f1", "f2", "f3", "f4", "f5"].map(key => (
                  <li key={key}>
                    <MoonStar className="vector-bullet" />
                    <span className="vector-body">{t(`vector.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </VectorPanel>
          </section>

          <section>
            <VectorPanel n="02" heading={t("vector.splitHeading")}>
              <div className="space-y-7">
                {/* One thin bar, split 40 / 50: flex-grow carries the minutes, so the widths are 4:5. */}
                <div className="vector-split" role="presentation">
                  <div className="vector-split-part" style={{ flexGrow: 40 }}>
                    <span className="vector-split-bar vector-split-yours" />
                    <span className="vector-split-label">{t("vector.split1Label")}</span>
                  </div>
                  <div className="vector-split-part" style={{ flexGrow: 50 }}>
                    <span className="vector-split-bar vector-split-content" />
                    <span className="vector-split-label">{t("vector.split2Label")}</span>
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-[40fr_50fr] md:gap-6">
                  <p className="vector-body">{t("vector.split1Body")}</p>
                  <p className="vector-body">{t("vector.split2Body")}</p>
                </div>
              </div>
            </VectorPanel>
          </section>

          <VectorDivider />

          <section className="vector-route-section mx-auto space-y-9">
            <div className="text-center space-y-4">
              <VectorEyebrow n="03" heading>{t("vector.sequenceHeading")}</VectorEyebrow>
              <p className="vector-quote max-w-md mx-auto text-left">{t("vector.sequenceIntro")}</p>
            </div>
            <VectorRoute>
              {BLOCK_KEYS.map((key, index) => (
                <li key={key} className="vector-card" style={{ "--n": index } as CSSProperties}>
                  <MoonStar className="vector-route-orb" />
                  <h3 className="vector-title vector-block-title">{t(`vector.${key}.title`)}</h3>
                  <p className="vector-body">{t(`vector.${key}.body`)}</p>
                  {key === ELEMENTS_BLOCK && (
                    <ul className="vector-elements">
                      {ELEMENTS.map(({ key: element, Icon }) => (
                        <li key={element} className="vector-element">
                          <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>{t(`vector.elements.${element}`)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </VectorRoute>
          </section>

          <VectorDivider />

          <section className="vector-card max-w-md mx-auto space-y-6">
            <VectorEyebrow heading>{t("vector.scopeHeading")}</VectorEyebrow>
            <h3 className="vector-title vector-block-title">{t("vector.inHeading")}</h3>
            <ul className="vector-list space-y-3 text-left">
              {["in1", "in2", "in3", "in4", "in5"].map(key => (
                <li key={key}>
                  <MoonStar className="vector-bullet" />
                  <span className="vector-body">{t(`vector.${key}`)}</span>
                </li>
              ))}
              <li>
                <MoonStar className="vector-bullet" />
                <div className="min-w-0">
                  <span className="vector-body">{t("vector.in6")}</span>
                  <ul className="vector-sublist space-y-2">
                    {["u1", "u2", "u3", "u4"].map(key => (
                      <li key={key}>
                        <MoonStar className="vector-bullet" />
                        <span className="vector-body">{t(`vector.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </ul>
            <h3 className="vector-title vector-block-title pt-2">{t("vector.outHeading")}</h3>
            <p className="vector-body">
              {t("vector.outNote")}{" "}
              <Link to="/products/build" className="vector-link">{t("vector.outLink")}</Link>
            </p>
            <ul className="vector-list space-y-3 text-left">
              {["out1", "out2", "out3"].map(key => (
                <li key={key}>
                  <MoonStar className="vector-bullet" />
                  <span className="vector-body">{t(`vector.${key}`)}</span>
                </li>
              ))}
            </ul>
          </section>

          <VectorDivider />

          <section className="vector-card max-w-md mx-auto space-y-6">
            <VectorEyebrow heading>{t("vector.termsHeading")}</VectorEyebrow>
            <ul className="vector-list space-y-3 text-left">
              <li>
                <MoonStar className="vector-bullet" />
                <div className="min-w-0 space-y-3">
                  <span className="vector-body block">{t("vector.t1")}</span>
                  <p className="vector-body vector-why">{t("vector.t1Why")}</p>
                </div>
              </li>
              {["t2", "t3", "t4", "t5"].map(key => (
                <li key={key}>
                  <MoonStar className="vector-bullet" />
                  <span className="vector-body">{t(`vector.${key}`)}</span>
                </li>
              ))}
            </ul>
          </section>

          <VectorDivider />

          <section className="text-center space-y-6 pb-4">
            <VectorEyebrow n="04" heading>{t("vector.priceHeading")}</VectorEyebrow>
            <p className="vector-price">{t("vector.priceLine")}</p>
            <div className="pt-2">{contact}</div>
            <p className="vector-footer-mark" aria-hidden="true">findyourtoptalent.com</p>
            <p className="vector-credit">
              <a href={MOON_CREDIT_URL} target="_blank" rel="noopener noreferrer">{t("vector.moonCredit")}</a>
            </p>
          </section>
        </div>
      </main>
    </>
  );
};

export default TheVector;
