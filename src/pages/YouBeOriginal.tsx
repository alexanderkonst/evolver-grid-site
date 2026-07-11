import { ArrowDown, ArrowUpRight, Asterisk, Orbit, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";
import logo from "@/assets/you-be-original-holo-transparent.png";
import aleksandrPhoto from "@/assets/aleksandr-photo.jpeg";
import "./YouBeOriginal.css";

const BOOKING_URL = "https://www.calendly.com/konstantinov";

const moves = [
  { n: "01", title: "See your pattern", body: "Name the capacities, fascinations, and ways of creating value that are already unmistakably yours." },
  { n: "02", title: "Open the future", body: "Imagine several viable professional lives—beyond the inherited menu of respectable, safe, or obvious choices." },
  { n: "03", title: "Test reality", body: "Turn possibility into small lived experiments, so experience—not anxiety—reveals your next direction." },
];

export default function YouBeOriginal() {
  return (
    <main className="you-page">
      <Helmet>
        <title>YOU — Be Original · Professional Orientation for Teenagers</title>
        <meta name="description" content="Meet who you are before the world decides for you. A free professional orientation conversation for teenagers." />
      </Helmet>

      <header className="you-header">
        <a className="you-brand" href="/you" aria-label="YOU — be original">
          <img src={logo} alt="YOU — be original" />
        </a>
        <p>Professional orientation<br />for teenagers</p>
        <a className="you-header-cta" href={BOOKING_URL} target="_blank" rel="noreferrer">
          Free 45-min call <ArrowUpRight size={16} />
        </a>
      </header>

      <section className="you-hero">
        <div className="you-orbit" aria-hidden="true"><div /><span>YOU</span><i /></div>
        <p className="you-hero-index">[ 01 · THE ORIGINAL ]</p>
        <h1>Meet who<br />you are <em>before</em><br />the world<br />decides for you.</h1>
        <div className="you-hero-aside">
          <p>Discover your unique configuration. Imagine several viable futures. Begin testing them through lived experience.</p>
          <a className="you-primary-cta" href={BOOKING_URL} target="_blank" rel="noreferrer">
            Begin with a free conversation <ArrowUpRight size={18} />
          </a>
          <small><span /> Five places each week</small>
        </div>
        <a className="you-scroll" href="#orientation" aria-label="Continue to the next section"><ArrowDown /></a>
      </section>

      <section className="you-statement" id="orientation">
        <div className="you-statement-label"><Asterisk /> A different orientation</div>
        <p>Teenagers are asked to choose a direction <strong>before they have been taught how to perceive their uniqueness.</strong></p>
        <p className="you-statement-answer">Professional orientation should reveal the person—not sort them into an occupation.</p>
      </section>

      <section className="you-initiation">
        <div className="you-initiation-title">
          <p>[ 02 · ORIGINAL ADULTHOOD ]</p>
          <h2>This is not<br />a career test.</h2>
          <div className="you-prism" aria-hidden="true"><Orbit /><span>possibility</span></div>
        </div>
        <div className="you-initiation-copy">
          <p className="you-large-copy">It is an initiation into original adulthood.</p>
          <p>Before societal conditioning hardens your professional life into a career you did not really choose—or into a competitive race for a better rank inside somebody else’s structure.</p>
          <p>You do not need to know what you will do forever. You need a better way to notice what is alive in you, discover where it creates value, and let reality teach you what comes next.</p>
        </div>
      </section>

      <section className="you-moves">
        <div className="you-moves-head">
          <p>[ THE ORIENTATION ]</p>
          <h2>From pressure<br />to possibility.</h2>
        </div>
        <div className="you-move-list">
          {moves.map((move) => (
            <article className="you-move" key={move.n}>
              <span>{move.n}</span><h3>{move.title}</h3><p>{move.body}</p><Sparkles size={18} />
            </article>
          ))}
        </div>
      </section>

      <aside className="you-neural">
        <p className="you-neural-label">Collective neural pathways</p>
        <blockquote>Inherited patterns of perception and choice that make culturally repeated possibilities feel natural—<em>and unrecognized possibilities feel impossible.</em></blockquote>
        <div className="you-neural-note">The work is not only to choose from the menu.<br />It is to become able to see what was never placed on it.</div>
      </aside>

      <section className="you-about">
        <div className="you-about-photo">
          <div className="you-photo-aura" aria-hidden="true" />
          <img src={aleksandrPhoto} alt="Aleksandr Konstantinov" />
          <span>MIT · STARTUPS · ORIGINAL WORK</span>
        </div>
        <div className="you-about-copy">
          <p className="you-kicker">[ YOUR INSTRUCTOR ]</p>
          <h2>Aleksandr<br />Konstantinov</h2>
          <p className="you-credentials">41 · MIT graduate · Silicon Valley startup builder</p>
          <p>Aleksandr works with people of all ages and is building <a href="https://findyourtoptalent.com" target="_blank" rel="noreferrer">FindYourTopTalent.com</a>. He chooses to work with teenagers because professional stuckness is not an abstract topic to him—it is one of the central stories of his life.</p>
          <p>After repeatedly learning how to get professionally unstuck, he now helps others save years: find clarity earlier, test direction more intelligently, and build success from what is actually theirs.</p>
          <div className="you-belief"><span>The order matters.</span> Professional clarity leads to professional success. Success can then create money, recognition, and influence.</div>
        </div>
      </section>

      <section className="you-final">
        <img src={logo} alt="YOU — be original" />
        <p>[ 03 · THE FIRST MOVE ]</p>
        <h2>Your future is not<br />something you have to<br /><em>guess correctly.</em></h2>
        <p className="you-final-copy">Start with one honest conversation about what is already true in you—and the experiments that could turn it into a lived professional direction.</p>
        <a className="you-primary-cta" href={BOOKING_URL} target="_blank" rel="noreferrer">
          Get a free 45-minute call <ArrowUpRight size={18} />
        </a>
        <small>Five free calls per week, total.</small>
      </section>

      <footer className="you-footer"><span>YOU · BE ORIGINAL</span><span>PROFESSIONAL ORIENTATION FOR ORIGINAL LIVES</span><span>© 2026</span></footer>
    </main>
  );
}
