import { ArrowRight, Check, Compass, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";
import logo from "@/assets/you-be-original-holo-transparent.png";
import aleksandrPhoto from "@/assets/aleksandr-photo.jpeg";
import "./YouBeOriginal.css";

const BOOKING_URL = "https://www.calendly.com/konstantinov";

const futures = [
  "Name what is genuinely original about you",
  "Imagine several professional futures—not just one safe option",
  "Choose real-world experiments instead of making a lifelong guess",
];

export default function YouBeOriginal() {
  return (
    <main className="you-page">
      <Helmet>
        <title>YOU — Professional Orientation for Teenagers</title>
        <meta
          name="description"
          content="A free 45-minute professional orientation call for teenagers. Discover your unique configuration and begin testing viable futures."
        />
      </Helmet>

      <div className="you-ambient you-ambient-one" aria-hidden="true" />
      <div className="you-ambient you-ambient-two" aria-hidden="true" />

      <header className="you-header">
        <a className="you-brand" href="/you" aria-label="YOU — be original home">
          <img src={logo} alt="YOU — be original" />
        </a>
        <a className="you-header-cta" href={BOOKING_URL} target="_blank" rel="noreferrer">
          Get a free call <ArrowRight size={16} aria-hidden="true" />
        </a>
      </header>

      <section className="you-hero">
        <div className="you-eyebrow"><Sparkles size={14} /> Professional orientation for teenagers</div>
        <h1>Meet who you are<br /><em>before the world decides for you.</em></h1>
        <p className="you-hero-copy">
          Discover your unique configuration, imagine several viable futures, and begin testing them through lived experience—before societal conditioning turns your professional life into a career you never truly chose.
        </p>
        <div className="you-actions">
          <a className="you-primary-cta" href={BOOKING_URL} target="_blank" rel="noreferrer">
            Get a free 45-minute call <ArrowRight size={19} aria-hidden="true" />
          </a>
          <span>5 places available each week</span>
        </div>
      </section>

      <section className="you-manifesto" aria-label="A different kind of professional orientation">
        <p className="you-section-label">Not a career test</p>
        <div className="you-manifesto-grid">
          <h2>An initiation into<br />original adulthood.</h2>
          <div>
            <p>
              Most teenagers are asked to choose a direction before they have been taught how to perceive their uniqueness, their possibilities, or their relationship with life.
            </p>
            <p>
              Professional orientation should reveal the person—not sort them into an occupation or train them for a better rank in a corporate structure.
            </p>
          </div>
        </div>
      </section>

      <section className="you-path">
        <div className="you-path-intro">
          <Compass aria-hidden="true" />
          <h2>You do not need to know<br />what you will do forever.</h2>
          <p>You need a better way to discover what is alive in you—and where it could become valuable in the world.</p>
        </div>
        <div className="you-futures">
          {futures.map((future, index) => (
            <div className="you-future" key={future}>
              <span>0{index + 1}</span>
              <p>{future}</p>
              <Check size={18} aria-hidden="true" />
            </div>
          ))}
        </div>
      </section>

      <aside className="you-definition">
        <p>Collective neural pathways</p>
        <blockquote>
          Inherited patterns of perception and choice that make culturally repeated possibilities feel natural—and unrecognized possibilities feel impossible.
        </blockquote>
      </aside>

      <section className="you-about">
        <div className="you-photo-wrap">
          <img src={aleksandrPhoto} alt="Aleksandr Konstantinov" />
        </div>
        <div className="you-about-copy">
          <p className="you-section-label">Your instructor</p>
          <h2>Aleksandr Konstantinov</h2>
          <p className="you-credentials">41 · MIT graduate · Silicon Valley startup builder</p>
          <p>
            Aleksandr works with people of all ages and is building <a href="https://findyourtoptalent.com" target="_blank" rel="noreferrer">FindYourTopTalent.com</a>. He chooses to work with teenagers because he knows the cost of professional stuckness from the inside—and has spent his life learning how to get unstuck.
          </p>
          <p>
            His core belief is practical: professional clarity creates the conditions for professional success; success can then generate money, recognition, and influence. The order matters.
          </p>
        </div>
      </section>

      <section className="you-final">
        <p className="you-section-label">Start with one conversation</p>
        <h2>Your future is not something<br />you have to guess correctly.</h2>
        <p>Let’s uncover what is already true about you—and identify the first experiments that can turn it into a lived professional direction.</p>
        <a className="you-primary-cta" href={BOOKING_URL} target="_blank" rel="noreferrer">
          Get a free 45-minute call <ArrowRight size={19} aria-hidden="true" />
        </a>
        <small>Five free calls per week, total.</small>
      </section>

      <footer className="you-footer">
        <img src={logo} alt="YOU — be original" />
        <p>Professional orientation for original lives.</p>
      </footer>
    </main>
  );
}
