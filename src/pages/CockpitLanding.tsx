import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import "./CockpitLanding.css";

const IMG = "/images/cockpit";
const DASHBOARD = "/build/cockpit/dashboard";

const flowSteps = [
  {
    title: "Reach",
    body: "Every step of the funnel, with the bottleneck named in plain words.",
    src: `${IMG}/funnel.webp`,
    alt: "Sales Funnel panel: funnel strength, the current bottleneck and each funnel step",
    w: 1014,
    h: 1502,
    flat: false,
  },
  {
    title: "Ask",
    body: "Paid offers made, week by week. Offer to paid in one line.",
    src: `${IMG}/offers.webp`,
    alt: "Offers panel: paid offers made this month and the weekly trend",
    w: 1004,
    h: 1338,
    flat: false,
  },
  {
    title: "Receive",
    body: "Cash and in-kind in one honest total, with every ledger behind it.",
    src: `${IMG}/cashflow.webp`,
    alt: "Cashflow panel: total received with a cumulative chart",
    w: 806,
    h: 1120,
    flat: true,
  },
  {
    title: "Project",
    body: "Where the current trend leads, and how long until you double.",
    src: `${IMG}/trend.webp`,
    alt: "Cashflow Trend panel: growth rate, doubling time and a six month outlook",
    w: 1006,
    h: 1344,
    flat: false,
  },
];

const designRules = [
  { rule: "One number", meaning: "where you stand" },
  { rule: "One line of context", meaning: "what it is made of" },
  { rule: "One shape over time", meaning: "where it is going" },
  { rule: "One next move", meaning: "what to do about it" },
];

export default function CockpitLanding() {
  const rootRef = useRef<HTMLElement>(null);

  // Scroll reveal. Content is visible without JS; the class that hides
  // un-revealed blocks is only added once the observer is ready.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fc-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    root.classList.add("fc-anim");
    items.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      root.classList.remove("fc-anim");
    };
  }, []);

  return (
    <main ref={rootRef} className="fc">
      <SEO
        title="Founder Cockpit. Your whole business, one glance."
        description="A management system for the evolution of unique businesses. See who you are, who you reach, what you ask and what you receive on one screen."
        path="/build/cockpit"
      />

      <nav className="fc-nav" aria-label="Founder Cockpit">
        <div className="fc-nav-name">Founder Cockpit</div>
        <div className="fc-nav-links">
          <a className="fc-nav-link" href="#source">Source</a>
          <a className="fc-nav-link" href="#flow">Flow</a>
          <a className="fc-nav-link" href="#loop">Loop</a>
          <Link className="fc-btn fc-btn-sm" to={DASHBOARD}>Enter</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="fc-sec fc-hero">
        <div className="fc-wrap">
          <p className="fc-eyebrow" data-reveal>Founder Cockpit</p>
          <h1 data-reveal style={{ "--d": "60ms" } as React.CSSProperties}>
            Your whole business.
            <br />
            One glance.
          </h1>
          <p className="fc-lede" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            A management system for the evolution of unique businesses.
          </p>
          <div className="fc-cta" data-reveal style={{ "--d": "180ms" } as React.CSSProperties}>
            <Link className="fc-btn" to={DASHBOARD}>Enter the cockpit</Link>
            <span className="fc-cta-note">For founders who build from who they are.</span>
          </div>
          <div className="fc-stage">
            <div className="fc-shot fc-side" data-reveal style={{ "--d": "380ms" } as React.CSSProperties}>
              <img src={`${IMG}/funnel.webp`} width={1014} height={1502} alt="" />
            </div>
            <div className="fc-shot fc-flat" data-reveal style={{ "--d": "260ms" } as React.CSSProperties}>
              <img
                src={`${IMG}/cashflow.webp`}
                width={806}
                height={1120}
                alt="Founder Cockpit Cashflow panel showing total received and a cumulative chart"
                fetchPriority="high"
              />
            </div>
            <div className="fc-shot fc-side" data-reveal style={{ "--d": "380ms" } as React.CSSProperties}>
              <img src={`${IMG}/unique-business.webp`} width={976} height={1580} alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* The idea */}
      <section className="fc-sec fc-idea">
        <div className="fc-wrap">
          <p className="fc-eyebrow" data-reveal>The idea</p>
          <h2 data-reveal>A unique business is a mirror of the one person who builds it.</h2>
          <p className="fc-lede" data-reveal>
            Your unique faculty becomes the offer, the client and the promise. Founder Cockpit puts that whole
            picture on one screen, so you can <b>see it, steer it and grow it on purpose.</b>
          </p>
          <div className="fc-trio">
            <div data-reveal>
              <h3>Visible</h3>
              <p>Who you are, who you reach, what you ask and what you receive. All in view.</p>
            </div>
            <div data-reveal style={{ "--d": "90ms" } as React.CSSProperties}>
              <h3>Manageable</h3>
              <p>Each panel names the one thing holding you back right now.</p>
            </div>
            <div data-reveal style={{ "--d": "180ms" } as React.CSSProperties}>
              <h3>Intentional</h3>
              <p>Your business has versions. You watch it sharpen, and you choose the next one.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 01 Source */}
      <section id="source" className="fc-sec fc-split fc-source fc-glow">
        <div className="fc-wrap">
          <div data-reveal>
            <p className="fc-eyebrow"><span>01</span>Source</p>
            <h2>
              It starts with
              <br />
              who you are.
            </h2>
            <p className="fc-lede">
              Your uniqueness, your shadow, your mission, your ideal client, your promise.{" "}
              <b>Nine parts of one canvas,</b> each with a version number, so the business stays true to the
              person it comes from.
            </p>
          </div>
          <div className="fc-media" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            <div className="fc-shot fc-fade" style={{ "--r": "32px" } as React.CSSProperties}>
              <img
                src={`${IMG}/unique-business.webp`}
                width={976}
                height={1580}
                loading="lazy"
                decoding="async"
                alt="Unique Business panel: uniqueness, shadow, mission, ideal client and promise as versioned cards"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 02 Flow */}
      <section id="flow" className="fc-sec fc-flow">
        <div className="fc-wrap">
          <div className="fc-flow-head" data-reveal>
            <div>
              <p className="fc-eyebrow"><span>02</span>Flow</p>
              <h2>
                From first hello
                <br />
                to money received.
              </h2>
            </div>
            <p className="fc-lede">Four panels follow one path. You always know where it slows down.</p>
          </div>
          <div className="fc-flow-row">
            {flowSteps.map((step, index) => (
              <div key={step.title} data-reveal style={{ "--d": `${index * 90}ms` } as React.CSSProperties}>
                <div className={`fc-shot fc-fade${step.flat ? " fc-flat" : ""}`}>
                  <img src={step.src} width={step.w} height={step.h} loading="lazy" decoding="async" alt={step.alt} />
                </div>
                <h3>
                  <span>{index + 1}</span>
                  {step.title}
                </h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 Loop */}
      <section id="loop" className="fc-sec fc-split fc-glow">
        <div className="fc-wrap">
          <div data-reveal>
            <p className="fc-eyebrow"><span>03</span>Loop</p>
            <h2>
              Say what happened.
              <br />
              It organizes the rest.
            </h2>
            <p className="fc-lede">
              <b>Pulse</b> logs a real event in seconds. <b>Self-Organize</b> lets your AI operator recover dropped
              work, rank it and refresh every panel. You lead. AI operates. <b>Nothing goes out without your yes.</b>
            </p>
          </div>
          <div className="fc-media" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            <div className="fc-shot" style={{ "--r": "24px" } as React.CSSProperties}>
              <img
                src={`${IMG}/quick-actions.webp`}
                width={994}
                height={410}
                loading="lazy"
                decoding="async"
                alt="Quick Actions panel with two buttons: Pulse and Self-Organize"
              />
            </div>
            <div className="fc-shot" style={{ "--r": "24px" } as React.CSSProperties}>
              <img
                src={`${IMG}/work-in-progress.webp`}
                width={1014}
                height={936}
                loading="lazy"
                decoding="async"
                alt="AI Work in Progress panel: items waiting on you, in progress and done"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The design */}
      <section className="fc-sec fc-split fc-design">
        <div className="fc-wrap">
          <div data-reveal>
            <p className="fc-eyebrow">The design</p>
            <h2>
              Every panel answers
              <br />
              one question.
            </h2>
            <div className="fc-rules">
              {designRules.map((item, index) => (
                <div key={item.rule}>
                  <span>{index + 1}</span>
                  {item.rule}
                  <em>{item.meaning}</em>
                </div>
              ))}
            </div>
          </div>
          <div className="fc-media" data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
            <div className="fc-shot fc-fade fc-flat" style={{ "--r": "28px" } as React.CSSProperties}>
              <img
                src={`${IMG}/cashflow.webp`}
                width={806}
                height={1120}
                loading="lazy"
                decoding="async"
                alt="Cashflow panel: one number, one line of context and one chart"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Close */}
      <section className="fc-sec fc-close">
        <div className="fc-wrap">
          <p className="fc-eyebrow" data-reveal>Founder Cockpit</p>
          <h2 data-reveal>
            Absurdly simple.
            <br />
            Seriously useful.
          </h2>
          <p className="fc-lede" data-reveal>
            See your business the way a pilot sees a flight. Everything that matters, right in front of you.
          </p>
          <div className="fc-cta" data-reveal>
            <Link className="fc-btn" to={DASHBOARD}>Enter the cockpit</Link>
            <span className="fc-cta-note">Free testing for now.</span>
          </div>
          <p className="fc-by">Created by Alexander Konstantinov</p>
        </div>
      </section>
    </main>
  );
}
