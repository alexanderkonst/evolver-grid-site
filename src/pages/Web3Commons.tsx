import { ArrowUpRight, Braces, GitFork, Github, Network } from "lucide-react";
import { Helmet } from "react-helmet-async";
import "./Web3Commons.css";

const GITHUB_URL = "https://github.com/alexanderkonst/evolver-grid-site";

const modules = [
  ["Top Talent", "Reveals the repeatable pattern of value a person creates when they are most naturally themselves."],
  ["Quality of Life Map", "Maps the life areas asking for attention and turns imbalance into a practical growth direction."],
  ["Mission Discovery", "Connects personal capacities with a contribution meaningful enough to organize action."],
  ["Asset Mapping", "Makes a person's skills, relationships, experiences, and resources visible as deployable capital."],
  ["Personality Tests", "Integrates external assessments into one coherent profile without mistaking any test for the person."],
  ["Daily Loop", "Translates a living profile into the most coherent next move for today."],
  ["Library", "Holds reusable practices and phase-shift technologies as an evolving commons of human development."],
  ["Growth Paths", "Organizes development into traversable paths with practices, milestones, and evidence of change."],
  ["Skill Trees", "Shows how capabilities compound from foundations into increasingly complex forms of mastery."],
  ["Events", "Turns shared intention into gatherings where people can meet, practice, and build together."],
  ["Men's Circle", "Provides a structured relational container for honest reflection, brotherhood, and accountable growth."],
  ["Matchmaking", "Proposes high-resonance introductions based on who people are becoming and what they can create together."],
  ["Connections", "Preserves the relational context, consent, and next actions that let collaboration deepen over time."],
  ["Unique Business Builder", "Compiles one human signal into a coherent business whose offer, tribe, myth, and distribution all match."],
  ["Product Builder", "Turns a validated human transformation into a specific, testable product people can choose."],
  ["Business Incubator", "Supports ventures from original signal through proof, revenue, collaboration, and scale."],
  ["Marketplace", "Lets original products find the people and ecosystems capable of receiving their value."],
  ["Onboarding", "Introduces the system by creating immediate personal value rather than explaining the platform abstractly."],
  ["Guided Tour", "Reveals the operating system progressively, in the context of what the person is ready to do next."],
  ["Equilibrium", "Makes competing priorities visible so a person or team can choose a more coherent allocation of energy."],
  ["Art", "Gives symbolic and aesthetic expression a first-class place inside the operating system."],
  ["Transcriber", "Converts spoken intelligence into durable text that can re-enter the commons as knowledge."],
] as const;

export default function Web3Commons() {
  return (
    <main className="commons-page">
      <Helmet>
        <title>Holonic Code Commons Ledger</title>
        <meta name="description" content="Planetary OS modules plug in. Donate code to the commons on the conditions you choose." />
      </Helmet>

      <div className="commons-grid" aria-hidden="true" />

      <header className="commons-nav">
        <a href="/web3" className="commons-mark"><Network size={18} /> HCCL / 001</a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">Source registry <ArrowUpRight size={15} /></a>
      </header>

      <section className="commons-hero">
        <div className="commons-kicker"><span /> Open protocol · contribution ledger · living infrastructure</div>
        <h1>HOLONIC CODE<br />COMMONS LEDGER</h1>
        <p className="commons-plug"><em>planetary OS modules plug in</em></p>
        <div className="commons-hero-bottom">
          <p>Whatever code you want to donate to the commons—on whatever conditions.</p>
          <a className="commons-primary" href={GITHUB_URL} target="_blank" rel="noreferrer">
            <Github size={19} /> Enter the GitHub commons <ArrowUpRight size={17} />
          </a>
        </div>
      </section>

      <section className="commons-principle">
        <div className="commons-index">[ CORE / 00 ]</div>
        <div>
          <p className="commons-tagline">Sovereign code. Shared evolution.</p>
          <h2>Each module is whole enough to stand alone—and open enough to become part of something larger.</h2>
        </div>
      </section>

      <section className="commons-registry">
        <div className="commons-section-head">
          <div>
            <p>[ MODULE REGISTRY ]</p>
            <h2>Planetary OS,<br />available in parts.</h2>
          </div>
          <p className="commons-registry-intro">A growing collection of interoperable modules for human development, collaboration, and original enterprise.</p>
        </div>

        <div className="commons-modules">
          {modules.map(([name, description], index) => (
            <article className="commons-module" key={name}>
              <div className="commons-module-meta"><span>{String(index + 1).padStart(2, "0")}</span><Braces size={15} /></div>
              <h3>{name}</h3>
              <p>{description}</p>
              <div className="commons-module-status">MODULE · COMPOSABLE</div>
            </article>
          ))}
        </div>
      </section>

      <section className="commons-principle">
        <div className="commons-index">[ CORE / 01 ]</div>
        <div>
          <p className="commons-tagline">Terms-first openness</p>
          <h2>Conditions exist before anything is copied. That is the whole difference between a commons and an empire.</h2>
          <p className="commons-registry-intro">Licenses protect what the world can see. The generator, the corpus behind the derivations, is never part of the transfer. Everyone enters on their own published terms. If a structure cannot accept that, it is not a commons.</p>
        </div>
      </section>

      <section className="commons-contribute">
        <GitFork size={28} />
        <p>[ THE INVITATION ]</p>
        <h2>Bring a module.<br />Name your conditions.<br />Strengthen the commons.</h2>
        <p className="commons-contribute-copy">The ledger is designed to hold many forms of contribution—from permissive open source to purpose-bound licensing—without erasing the sovereignty of the contributor.</p>
        <a className="commons-primary" href={GITHUB_URL} target="_blank" rel="noreferrer">
          View the repository <ArrowUpRight size={17} />
        </a>
      </section>

      <footer className="commons-footer">
        <span>HOLONIC CODE COMMONS LEDGER</span>
        <span>WHOLES WITHIN WHOLES · CODE WITHIN CULTURE</span>
        <span>2026 / PLANETARY OS</span>
      </footer>
    </main>
  );
}
