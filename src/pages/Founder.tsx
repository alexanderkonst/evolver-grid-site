import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import aleksandrPhoto from "@/assets/aleksandr-photo.jpeg";
import "./Founder.css";

const BOOKING_URL = "https://cal.com/aleksandrkonstantinov/exploration";

/**
 * /founder — the founder trust page (Domain 100: the Trust rung).
 * Design brief (Sasha, Day ~129): minimalist · ancient+futuristic ·
 * green/plants · wabi-sabi/Japanese · cosmic stardom with humility, fused.
 * One CTA kind on the whole page: the free Direction Call.
 * Copy assembled from captured artifacts (Message Bank + canvas); no em-dashes.
 */
export default function Founder() {
  return (
    <main className="fp">
      <Helmet>
        <title>Aleksandr Konstantinov · Founder of Find Your Top Talent</title>
        <meta
          name="description"
          content="I turn vague thoughts into exact words people can use to decide and act. MIT engineer, Silicon Valley venture builder, hundreds of business-clarity sessions."
        />
      </Helmet>

      <header className="fp-header">
        <span className="fp-name">Aleksandr Konstantinov</span>
        <a className="fp-header-link" href="https://findyourtoptalent.com" target="_blank" rel="noreferrer">
          Founder · Find Your Top Talent <ArrowUpRight size={14} />
        </a>
      </header>

      <section className="fp-hero">
        <p className="fp-label">01 · The work</p>
        <h1>
          I turn vague thoughts into <em>exact words</em> people can use to decide and act.
        </h1>
        <p className="fp-hero-sub">
          MIT engineer. Silicon Valley venture builder. Hundreds of business-clarity
          sessions with founders, executives, coaches, and leaders.
        </p>
        <div className="fp-enso" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <path
              d="M172 88 A76 76 0 1 0 168 132"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <a className="fp-scroll" href="#now" aria-label="Continue">
          <ArrowDown size={18} />
        </a>
      </section>

      <section className="fp-now" id="now">
        <p className="fp-label">02 · What I do now</p>
        <h2>
          I help people find the one direction that is truly theirs, and turn it into a
          running business.
        </h2>
        <div className="fp-now-body">
          <p>
            We start from who you are at your brightest. We name it in plain language you
            can carry in your own mouth without flinching. Then we build the simple
            structure that lets the world meet it: one offer, one page, one path a
            stranger can read and book from.
          </p>
          <div className="fp-cta-block">
            <a className="fp-cta" href={BOOKING_URL} target="_blank" rel="noreferrer">
              Book a Direction Call <ArrowUpRight size={16} />
            </a>
            <small>Free, 45 minutes. I hold five of these a week.</small>
          </div>
        </div>
      </section>

      <section className="fp-proof">
        <p className="fp-label">03 · What happens for people</p>
        <div className="fp-stories">
          <article>
            <h3>The founder</h3>
            <p>
              Arrived in March with a parked startup, a real team, and too many product
              directions tried hastily. We found his one direction and his people:
              executives adopting AI. He now has a paid advisory client, a consulting
              project on top of it, and more deals in motion.
            </p>
            <blockquote>
              "We set a strategic corridor for building a business which I never had
              before. I feel very big confidence."
            </blockquote>
          </article>
          <article>
            <h3>The leadership coach</h3>
            <p>
              A coach and healer with a running practice in feminine leadership. We have
              worked together for two years. Every conversation makes her ideal client
              clearer, and more business arrives exactly like that. Her practice is
              growing, and not through hustling more.
            </p>
            <p className="fp-story-note">
              That is the whole point: more professional opportunity opens up as more
              clarity opens up.
            </p>
          </article>
          <article>
            <h3>The community founder</h3>
            <p>
              A community platform founder who went through the full process. She is now
              launching a whole new phase of her platform built on what we uncovered
              together.
            </p>
            <p className="fp-story-note">
              The pattern holds: the work compounds after the sessions end.
            </p>
          </article>
        </div>
        <a
          className="fp-proof-more"
          href="https://findyourtoptalent.com/ignite"
          target="_blank"
          rel="noreferrer"
        >
          More in clients' own words, from real session transcripts <ArrowUpRight size={14} />
        </a>
      </section>

      <section className="fp-story">
        <div className="fp-photo">
          <img src={aleksandrPhoto} alt="Aleksandr Konstantinov" />
          <span>Mexico City, 2026</span>
        </div>
        <div className="fp-story-copy">
          <p className="fp-label">04 · The story</p>
          <h2>The short version</h2>
          <p>
            I studied at MIT and launched ventures in Silicon Valley. Somewhere along the
            way I found the work under the work: helping people see, in exact words, what
            they are irreplaceable for. After hundreds of these sessions I built the
            platform that makes the process repeatable, and I still deliver it personally,
            one person at a time.
          </p>
          <div className="fp-vow">
            <span>The working vow</span>
            <p>
              Nobody starts from scratch with me. Everybody arrives with something
              professional already going on: a business, a job, side work. We never
              dismantle it. We find which parts are truly yours, keep them, reinforce
              them, and grow from there. Whatever is not yours falls away on its own, as
              the aligned part starts feeding you.
            </p>
          </div>
        </div>
      </section>

      <section className="fp-night">
        <div className="fp-stars" aria-hidden="true" />
        <p className="fp-label fp-label-light">05 · The bigger thing</p>
        <p className="fp-night-copy">
          Everything above runs on an open coordination layer I build in public: an
          operating system that helps communities organize around who people actually
          are. Ecosystems nesting into one another like matryoshka dolls, losing no
          sovereignty, strengthening each other.
        </p>
        <a
          className="fp-night-link"
          href="https://github.com/alexanderkonst/evolver-grid-site"
          target="_blank"
          rel="noreferrer"
        >
          The code and the thesis are open <ArrowUpRight size={14} />
        </a>
        <h2 className="fp-creed">
          You don't need to fit in. <em>You need to find where you fit.</em>
        </h2>
        <div className="fp-cta-block fp-cta-center">
          <a className="fp-cta fp-cta-light" href={BOOKING_URL} target="_blank" rel="noreferrer">
            Book a Direction Call <ArrowUpRight size={16} />
          </a>
          <small>The conversation starts there.</small>
        </div>
      </section>

      <footer className="fp-footer">
        <span>© 2026 Aleksandr Konstantinov · Built in public, with love</span>
        <nav>
          <a href="https://findyourtoptalent.com" target="_blank" rel="noreferrer">
            findyourtoptalent.com
          </a>
          <a href="https://t.me/integralevolution" target="_blank" rel="noreferrer">
            Telegram
          </a>
        </nav>
      </footer>
    </main>
  );
}
