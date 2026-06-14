import { ExternalLink, Heart, Brain, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * /intros — Public page. Sasha's shortlist of aligned heavy-lifters
 * he's seeking intros to. Reason: the Knoware drop + FMF work + Golden
 * Age stewardship need people with resources, coherence, and clarity.
 * Open heart · higher mind · committed will.
 */

type Tier = "S" | "A";

interface Person {
  name: string;
  roleKey: string;
  whyKey: string;
  status?: "in-touch" | "one-step";
  link?: string;
}

interface TierGroup {
  tier: Tier;
  labelKey: string;
  sublabelKey: string;
  people: Person[];
}

const TIERS: TierGroup[] = [
  {
    tier: "S",
    labelKey: "intros.tierS.label",
    sublabelKey: "intros.tierS.sublabel",
    people: [
      {
        name: "Ken Wilber",
        roleKey: "intros.person.kenWilber.role",
        whyKey: "intros.person.kenWilber.why",
        status: "one-step",
        link: "https://integrallife.com/",
      },
      {
        name: "Daniel Schmachtenberger",
        roleKey: "intros.person.danielSchmachtenberger.role",
        whyKey: "intros.person.danielSchmachtenberger.why",
        link: "https://consilienceproject.org/",
      },
      {
        name: "Jamie Wheal",
        roleKey: "intros.person.jamieWheal.role",
        whyKey: "intros.person.jamieWheal.why",
        link: "https://www.flowgenomeproject.com/",
      },
      {
        name: "Tomas Björkman",
        roleKey: "intros.person.tomasBjorkman.role",
        whyKey: "intros.person.tomasBjorkman.why",
        link: "https://ekskaret.com/",
      },
      {
        name: "Peter Merry",
        roleKey: "intros.person.peterMerry.role",
        whyKey: "intros.person.peterMerry.why",
        status: "in-touch",
        link: "https://petermerry.org/",
      },
      {
        name: "Charles Eisenstein",
        roleKey: "intros.person.charlesEisenstein.role",
        whyKey: "intros.person.charlesEisenstein.why",
        link: "https://charleseisenstein.org/",
      },
      {
        name: "Bayo Akomolafe",
        roleKey: "intros.person.bayoAkomolafe.role",
        whyKey: "intros.person.bayoAkomolafe.why",
        link: "https://www.bayoakomolafe.net/",
      },
      {
        name: "Otto Scharmer",
        roleKey: "intros.person.ottoScharmer.role",
        whyKey: "intros.person.ottoScharmer.why",
        link: "https://www.presencing.org/",
      },
    ],
  },
  {
    tier: "A",
    labelKey: "intros.tierA.label",
    sublabelKey: "intros.tierA.sublabel",
    people: [
      {
        name: "Iain McGilchrist",
        roleKey: "intros.person.iainMcgilchrist.role",
        whyKey: "intros.person.iainMcgilchrist.why",
        link: "https://channelmcgilchrist.com/",
      },
      {
        name: "John Vervaeke",
        roleKey: "intros.person.johnVervaeke.role",
        whyKey: "intros.person.johnVervaeke.why",
        link: "https://johnvervaeke.com/",
      },
      {
        name: "Tyson Yunkaporta",
        roleKey: "intros.person.tysonYunkaporta.role",
        whyKey: "intros.person.tysonYunkaporta.why",
        link: "https://www.deakin.edu.au/about-deakin/people/tyson-yunkaporta",
      },
      {
        name: "Nora Bateson",
        roleKey: "intros.person.noraBateson.role",
        whyKey: "intros.person.noraBateson.why",
        link: "https://batesoninstitute.org/",
      },
      {
        name: "Lynne Twist",
        roleKey: "intros.person.lynneTwist.role",
        whyKey: "intros.person.lynneTwist.why",
        link: "https://soulofmoney.org/",
      },
      {
        name: "Audrey Tang",
        roleKey: "intros.person.audreyTang.role",
        whyKey: "intros.person.audreyTang.why",
        link: "https://audreyt.org/",
      },
      {
        name: "Zak Stein",
        roleKey: "intros.person.zakStein.role",
        whyKey: "intros.person.zakStein.why",
        link: "https://www.zakstein.org/",
      },
      {
        name: "Alnoor Ladha",
        roleKey: "intros.person.alnoorLadha.role",
        whyKey: "intros.person.alnoorLadha.why",
        link: "https://alnoorladha.com/",
      },
      {
        name: "Foster Gamble",
        roleKey: "intros.person.fosterGamble.role",
        whyKey: "intros.person.fosterGamble.why",
        link: "https://www.thriveon.com/",
      },
      {
        name: "Emanuel Kuntzelman",
        roleKey: "intros.person.emanuelKuntzelman.role",
        whyKey: "intros.person.emanuelKuntzelman.why",
        link: "https://www.emanuelkuntzelman.com/",
      },
      {
        name: "Robert Kirkpatrick",
        roleKey: "intros.person.robertKirkpatrick.role",
        whyKey: "intros.person.robertKirkpatrick.why",
      },
      {
        name: "Glen Weyl",
        roleKey: "intros.person.glenWeyl.role",
        whyKey: "intros.person.glenWeyl.why",
        link: "https://www.glenweyl.com/",
      },
    ],
  },
];

const Intros = () => {
  const { t } = useTranslation();
  // Day 91 (Sasha 2026-06-09): tokenized for Aurum — the page wash moved
  // from gradient utilities to --skin-page-wash (set only by the dark
  // skins) with the exact original cream gradient as fallback; ink reads
  // the skin text tokens. `.intros-page` is an inert scoping hook for
  // dark-skin CSS (hover:bg-white fills).
  return (
    <div
      className="intros-page min-h-screen text-[color:var(--skin-text-primary,#1a1a2e)]"
      style={{ background: "var(--skin-page-wash, linear-gradient(to bottom, #faf9f7 0%, #f5f3ef 50%, #ebe8e2 100%))" }}
    >
      <div className="max-w-3xl mx-auto px-5 py-12 lg:py-20">
        {/* Hero */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8460ea] font-semibold mb-4">
            {t("intros.hero.eyebrow")}
          </p>
          <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight mb-6">
            {t("intros.hero.heading")}
          </h1>
          <p className="text-lg text-[color:var(--skin-text-muted,rgba(26,26,46,0.75))] leading-relaxed mb-5">
            {t("intros.hero.intro")}
          </p>
          <div className="flex items-center gap-4 text-sm text-[color:var(--skin-text-muted,rgba(26,26,46,0.6))]">
            <span className="inline-flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" /> {t("intros.hero.openHeart")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-amber-500" /> {t("intros.hero.higherMind")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#8460ea]" /> {t("intros.hero.committedWill")}
            </span>
          </div>
        </div>

        {/* THE THREE VECTORS */}
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8460ea] font-semibold mb-6">
            {t("intros.vectors.eyebrow")}
          </p>
          <div className="space-y-4">
            {/* Vector 1 */}
            <a
              href="https://t.me/ARKHAZM/170"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 lg:p-7 bg-[var(--skin-card-fill,rgba(255,255,255,0.8))] rounded-2xl border border-[color:var(--skin-hairline,rgba(26,26,46,0.08))] hover:border-[#8460ea]/40 hover:bg-white transition-all group"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#8460ea] to-[#5b3fb0] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-[#8460ea]/30">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-display font-bold text-[color:var(--skin-text-primary,#1a1a2e)] mb-1 group-hover:text-[#8460ea] transition-colors">
                    {t("intros.vector1.title")}
                  </h3>
                  <p className="text-sm text-[#8460ea] font-semibold mb-3">
                    {t("intros.vector1.tagline")}
                  </p>
                  <p className="text-[15px] text-[color:var(--skin-text-muted,rgba(26,26,46,0.75))] leading-relaxed mb-3">
                    {t("intros.vector1.body")}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm text-[#8460ea] font-semibold group-hover:underline">
                    {t("intros.vector1.cta")}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </a>

            {/* Vector 2 */}
            <a
              href="https://FindYourTopTalent.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 lg:p-7 bg-[var(--skin-card-fill,rgba(255,255,255,0.8))] rounded-2xl border border-[color:var(--skin-hairline,rgba(26,26,46,0.08))] hover:border-[#8460ea]/40 hover:bg-white transition-all group"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#8460ea] to-[#5b3fb0] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-[#8460ea]/30">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-display font-bold text-[color:var(--skin-text-primary,#1a1a2e)] mb-1 group-hover:text-[#8460ea] transition-colors">
                    {t("intros.vector2.title")}
                  </h3>
                  <p className="text-sm text-[#8460ea] font-semibold mb-3">
                    {t("intros.vector2.tagline")}
                  </p>
                  <p className="text-[15px] text-[color:var(--skin-text-muted,rgba(26,26,46,0.75))] leading-relaxed mb-3">
                    {t("intros.vector2.body")}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm text-[#8460ea] font-semibold group-hover:underline">
                    FindYourTopTalent.com
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </a>

            {/* Vector 3 */}
            <div className="block p-6 lg:p-7 bg-[var(--skin-card-fill,rgba(255,255,255,0.8))] rounded-2xl border border-[color:var(--skin-hairline,rgba(26,26,46,0.08))]">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#8460ea] to-[#5b3fb0] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-[#8460ea]/30">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-display font-bold text-[color:var(--skin-text-primary,#1a1a2e)] mb-1">
                    {t("intros.vector3.title")}
                  </h3>
                  <p className="text-sm text-[#8460ea] font-semibold mb-3">
                    {t("intros.vector3.tagline")}
                  </p>
                  <p className="text-[15px] text-[color:var(--skin-text-muted,rgba(26,26,46,0.75))] leading-relaxed mb-3">
                    {t("intros.vector3.body")}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm text-[color:var(--skin-text-muted,rgba(26,26,46,0.5))] font-medium">
                    {t("intros.vector3.status")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transition to the list */}
        <div className="mb-10">
          <p className="text-[15px] text-[color:var(--skin-text-muted,rgba(26,26,46,0.75))] leading-relaxed">
            {t("intros.transition")}
          </p>
        </div>

        {/* Tiers */}
        {TIERS.map((group) => (
          <section key={group.tier} className="mb-14">
            <div className="mb-6 pb-3 border-b border-[color:var(--skin-hairline,rgba(26,26,46,0.10))]">
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-mono font-bold text-[#8460ea] uppercase tracking-widest">
                  {t("intros.tierLabel", { tier: group.tier })}
                </span>
                <h2 className="text-xl font-display font-bold text-[color:var(--skin-text-primary,#1a1a2e)]">
                  {t(group.labelKey)}
                </h2>
              </div>
              <p className="text-sm text-[color:var(--skin-text-muted,rgba(26,26,46,0.55))] mt-1">{t(group.sublabelKey)}</p>
            </div>

            <div className="space-y-4">
              {group.people.map((p, i) => (
                <article
                  key={p.name}
                  className="p-5 lg:p-6 bg-[var(--skin-card-fill,rgba(255,255,255,0.7))] rounded-2xl border border-[color:var(--skin-hairline,rgba(26,26,46,0.08))] hover:border-[#8460ea]/30 hover:bg-white/90 transition-all"
                >
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-xs font-mono text-[color:var(--skin-text-muted,rgba(26,26,46,0.4))]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg font-bold text-[color:var(--skin-text-primary,#1a1a2e)]">
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
                          {t("intros.status.inTouch")}
                        </span>
                      )}
                      {p.status === "one-step" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 uppercase tracking-wide">
                          {t("intros.status.oneStep")}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[#8460ea] mb-2">{t(p.roleKey)}</p>
                  <p className="text-[15px] text-[color:var(--skin-text-muted,rgba(26,26,46,0.75))] leading-relaxed">
                    {t(p.whyKey)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="text-center py-8 border-t border-[color:var(--skin-hairline,rgba(26,26,46,0.10))]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8460ea] font-semibold mb-4">
            {t("intros.cta.eyebrow")}
          </p>
          <p className="text-lg text-[color:var(--skin-text-primary,#1a1a2e)] mb-6 max-w-xl mx-auto leading-relaxed">
            {t("intros.cta.body")}
          </p>
          <div className="flex justify-center">
            <a
              href="https://t.me/integralevolution"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold bg-[#1a1a2e] text-white hover:bg-[#8460ea] transition-all shadow-md"
            >
              {t("intros.cta.button")}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-[color:var(--skin-text-muted,rgba(26,26,46,0.45))] mt-8">
            {t("intros.cta.footer")}
          </p>
        </section>
      </div>
    </div>
  );
};

export default Intros;
