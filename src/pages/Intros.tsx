import { ExternalLink, Heart, Brain, Target } from "lucide-react";

/**
 * /intros — Public page. Sasha's shortlist of aligned heavy-lifters
 * he's seeking intros to. Reason: the Knoware drop + FMF work + Golden
 * Age stewardship need people with resources, coherence, and clarity.
 * Open heart · higher mind · committed will.
 */

type Tier = "S" | "A";

interface Person {
  name: string;
  role: string;
  why: string;
  status?: "in-touch" | "one-step";
  link?: string;
}

interface TierGroup {
  tier: Tier;
  label: string;
  sublabel: string;
  people: Person[];
}

const TIERS: TierGroup[] = [
  {
    tier: "S",
    label: "First ring",
    sublabel: "Core alignment · highest leverage",
    people: [
      {
        name: "Ken Wilber",
        role: "Founder, Integral Theory",
        why: "My ontological stack descends directly from AQAL, quadrants, holons, lines. Endorsement = category-defining. One step away via mutual contact.",
        status: "one-step",
        link: "https://integrallife.com/",
      },
      {
        name: "Daniel Schmachtenberger",
        role: "Co-founder, The Consilience Project",
        why: "Meta-crisis, sensemaking, AI + civilization. Speaks to everyone worth speaking to. Knoware sits directly in his aperture.",
        link: "https://consilienceproject.org/",
      },
      {
        name: "Jamie Wheal",
        role: "Founder, Flow Genome Project · author, Recapture the Rapture",
        why: "Culture-architecture for the meta-crisis. Network runs deep across psychedelic, performance, integral, and conscious-founder circles.",
        link: "https://www.flowgenomeproject.com/",
      },
      {
        name: "Tomas Björkman",
        role: "Founder, Ekskäret Foundation · author, The Market Myth",
        why: "Swedish conscious-capital funder. Resources inner-development work quietly at scale. Direct match for resources + coherence + clarity.",
        link: "https://ekskaret.com/",
      },
      {
        name: "Peter Merry",
        role: "Co-founder, Ubiquity University · Center for Human Emergence",
        why: "European integral network. Noosphere work. Already in reference orbit.",
        status: "in-touch",
        link: "https://petermerry.org/",
      },
      {
        name: "Charles Eisenstein",
        role: "Author, Sacred Economics · The More Beautiful World Our Hearts Know Is Possible",
        why: "Gift-economy + interbeing. Millions of conscious readers. Philosophical match for open-blueprint / gravity-by-gift posture.",
        link: "https://charleseisenstein.org/",
      },
      {
        name: "Bayo Akomolafe",
        role: "Founder, The Emergence Network",
        why: "Post-activist philosopher. The exact frequency my tribe resonates with. Poetry + politics + ontology.",
        link: "https://www.bayoakomolafe.net/",
      },
      {
        name: "Otto Scharmer",
        role: "MIT · Presencing Institute · Theory U",
        why: "Institutional gravitas in conscious leadership. Field-sensing vocabulary aligns cleanly with the second-axis framing.",
        link: "https://www.presencing.org/",
      },
    ],
  },
  {
    tier: "A",
    label: "Second ring",
    sublabel: "Strong fit · specific leverage",
    people: [
      {
        name: "Iain McGilchrist",
        role: "Author, The Master and His Emissary · The Matter With Things",
        why: "Hemispheric theory. Scientifically grounds the masculine/feminine formulation of AI progress I arrived at.",
        link: "https://channelmcgilchrist.com/",
      },
      {
        name: "John Vervaeke",
        role: "Cognitive scientist, Toronto · Awakening from the Meaning Crisis",
        why: "AI + cognition + meaning bridge. Growing Weaving Community network of conscious researchers.",
        link: "https://johnvervaeke.com/",
      },
      {
        name: "Tyson Yunkaporta",
        role: "Author, Sand Talk",
        why: "Indigenous knowledge systems applied to modern sense-making. Matches the indigenous-cosmovision layer of my operating logic.",
        link: "https://www.deakin.edu.au/about-deakin/people/tyson-yunkaporta",
      },
      {
        name: "Nora Bateson",
        role: "Warm Data Lab · International Bateson Institute",
        why: "Systems thinking. Bridges many networks quietly. Transcontextual intelligence.",
        link: "https://batesoninstitute.org/",
      },
      {
        name: "Lynne Twist",
        role: "Soul of Money Institute · co-founder, Pachamama Alliance",
        why: "Four decades of philanthropic bridge-making. Indigenous wisdom + conscious capital.",
        link: "https://soulofmoney.org/",
      },
      {
        name: "Audrey Tang",
        role: "Former Digital Minister, Taiwan · co-author, Plurality",
        why: "Distributed-protocol politics. Perfect philosophical match for open-source Knoware as public infrastructure.",
        link: "https://audreyt.org/",
      },
      {
        name: "Zak Stein",
        role: "Education futures · Lectica · The Consilience Project",
        why: "Developmental psychology + AI + education. Direct Schmachtenberger orbit.",
        link: "https://www.zakstein.org/",
      },
      {
        name: "Alnoor Ladha",
        role: "Culture Hack Labs · post-capitalist memetic engineering",
        why: "Guerilla + spiritual + strategic. Match for the viral-vector half of fractal growth.",
        link: "https://alnoorladha.com/",
      },
      {
        name: "Foster Gamble",
        role: "Thrive Movement · Thrive I + II",
        why: "Audience of millions of conscious seekers. Large-scale reach into the solution-seeking tribe.",
        link: "https://www.thriveon.com/",
      },
      {
        name: "Emanuel Kuntzelman",
        role: "Greenheart International · Purpose Earth Foundation",
        why: "Consciousness evolution network with real distribution. Philanthropic + convening.",
        link: "https://www.emanuelkuntzelman.com/",
      },
      {
        name: "Robert Kirkpatrick",
        role: "Former Director, UN Global Pulse",
        why: "Data-for-humanity + institutional bridge. Different tier of network than most integralists — UN, multilaterals, policy-level.",
      },
      {
        name: "Glen Weyl",
        role: "Microsoft Research · RadicalxChange · co-author, Plurality",
        why: "Tech + distributed governance + conscious-founder tribe overlap. Bridges AI labs and public-infrastructure movements.",
        link: "https://www.glenweyl.com/",
      },
    ],
  },
];

const Intros = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf9f7] via-[#f5f3ef] to-[#ebe8e2] text-[#1a1a2e]">
      <div className="max-w-3xl mx-auto px-5 py-12 lg:py-20">
        {/* Hero */}
        <div className="mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8460ea] font-semibold mb-4">
            Aleksandr Konstantinov · /intros
          </p>
          <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight mb-6">
            Who will steward this?
          </h1>
          <p className="text-lg text-[#1a1a2e]/75 leading-relaxed mb-5">
            I'm building three threads that have converged this weekend: a
            Bitcoin-level discovery in AI (open-source from day zero), a
            founder-market-fit instrument guaranteed in 6–8 weeks, and the
            coherence core of a Golden Age.
          </p>
          <p className="text-lg text-[#1a1a2e]/75 leading-relaxed mb-5">
            This needs to be stewarded by heavy-lifters with resources,
            coherence, and clarity.
          </p>
          <div className="flex items-center gap-4 text-sm text-[#1a1a2e]/60 mb-6">
            <span className="inline-flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" /> open heart
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-amber-500" /> higher mind
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#8460ea]" /> committed will
            </span>
          </div>
          <p className="text-base text-[#1a1a2e]/70 leading-relaxed">
            There is enough abundance here for everyone involved. We'll need
            to act together. Below: a living shortlist of aligned
            heavy-lifters I've identified. If you can open a door to any of
            them — or know someone in their inner ring — reach out.
          </p>
        </div>

        {/* Context links */}
        <div className="mb-14 p-5 bg-white/70 rounded-2xl border border-[#1a1a2e]/8 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.15em] text-[#8460ea] font-semibold mb-3">
            Context
          </p>
          <ul className="space-y-2.5 text-[15px]">
            <li>
              <span className="font-semibold">1 · The AI discovery —</span>{" "}
              <a
                href="https://t.me/ARKHAZM/170"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8460ea] hover:underline inline-flex items-center gap-1"
              >
                Knoware · the second axis <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <span className="font-semibold">2 · FMF+PMF in 6–8 weeks —</span>{" "}
              <a
                href="https://FindYourTopTalent.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8460ea] hover:underline inline-flex items-center gap-1"
              >
                FindYourTopTalent.com <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <span className="font-semibold">3 · Golden Age coherence core —</span>{" "}
              <span className="text-[#1a1a2e]/60">
                publication forthcoming
              </span>
            </li>
          </ul>
        </div>

        {/* Tiers */}
        {TIERS.map((group) => (
          <section key={group.tier} className="mb-14">
            <div className="mb-6 pb-3 border-b border-[#1a1a2e]/10">
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-mono font-bold text-[#8460ea] uppercase tracking-widest">
                  Tier {group.tier}
                </span>
                <h2 className="text-xl font-display font-bold text-[#1a1a2e]">
                  {group.label}
                </h2>
              </div>
              <p className="text-sm text-[#1a1a2e]/55 mt-1">{group.sublabel}</p>
            </div>

            <div className="space-y-4">
              {group.people.map((p, i) => (
                <article
                  key={p.name}
                  className="p-5 lg:p-6 bg-white/70 rounded-2xl border border-[#1a1a2e]/8 hover:border-[#8460ea]/30 hover:bg-white/90 transition-all"
                >
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-xs font-mono text-[#1a1a2e]/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg font-bold text-[#1a1a2e]">
                        {p.link ? (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#8460ea] transition-colors inline-flex items-center gap-1.5"
                          >
                            {p.name}
                            <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                          </a>
                        ) : (
                          p.name
                        )}
                      </h3>
                      {p.status === "in-touch" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 uppercase tracking-wide">
                          in touch
                        </span>
                      )}
                      {p.status === "one-step" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 uppercase tracking-wide">
                          one step away
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[#8460ea] mb-2">{p.role}</p>
                  <p className="text-[15px] text-[#1a1a2e]/75 leading-relaxed">
                    {p.why}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* Open — add your name */}
        <section className="mb-14 p-6 bg-gradient-to-br from-[#8460ea]/5 to-[#c8b7d8]/10 rounded-2xl border border-[#8460ea]/15">
          <h2 className="text-lg font-display font-bold mb-2">
            This list is living.
          </h2>
          <p className="text-[15px] text-[#1a1a2e]/75 leading-relaxed">
            If you are one of these people — or if you think of someone who
            should be on it and isn't yet — the door is open. Sovereignty
            first, alignment next. No extraction. Every node on this list
            exists because the work serves a larger whole than any single
            venture.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center py-8 border-t border-[#1a1a2e]/10">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8460ea] font-semibold mb-4">
            Who can open a door
          </p>
          <p className="text-lg text-[#1a1a2e] mb-6 max-w-xl mx-auto leading-relaxed">
            If you can make a warm intro to anyone above — or to someone who
            knows them — I'd be grateful for the bridge.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="mailto:personalytics@gmail.com?subject=Intro%20%E2%80%94%20%2Fintros"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-[#1a1a2e] text-white hover:bg-[#8460ea] transition-all shadow-md"
            >
              Email Aleksandr
            </a>
            <a
              href="https://t.me/ARKHAZM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-white/80 text-[#1a1a2e] border border-[#1a1a2e]/15 hover:border-[#8460ea]/50 transition-all"
            >
              Telegram channel
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-[#1a1a2e]/45 mt-8">
            Updated April 2026 · aleksandrkonstantinov.com/intros
          </p>
        </section>
      </div>
    </div>
  );
};

export default Intros;
