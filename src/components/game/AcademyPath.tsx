import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { ACADEMY_COURSES } from "@/lib/placeColor";
import { CMS_COURSE_PATH } from "@/data/courses/consciousnessMeetsScience";
import { COURSE_PATH } from "@/data/courses/activateYourDormantPotential";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { BODY_STYLE, EYEBROW_STYLE, TITLE_STYLE } from "@/pages/Library";

/**
 * AcademyPath — the Academy (/game/learn): the two courses we have, shown as one path
 * (Sasha, 2026-10-30). A player may start with either; each card opens the course's own
 * page (its existing link). Below them, the courses that open after these two, quiet and
 * closed: no links, no checkout (Stripe is not touched here).
 *
 * The Library rooms and their routes (/library, /game/learn/library/*) stay as they were;
 * they are only no longer listed here.
 */

const COURSE_LINKS: Record<string, string> = {
  "consciousness-meets-science": CMS_COURSE_PATH,
  "activate-your-dormant-potential": COURSE_PATH,
};

/** Courses after these two, opened one after another as paid upgrades (Sasha 2026-10-30 21:49).
 *  Copy is Sasha's (2026-10-30 21:01), English only. */
const NEXT_COURSES: { title: string; note: string }[] = [
  { title: "Founder Academy", note: "$111 · recorded" },
  { title: "Integral Mystery School", note: "$111 · recorded · after Founder Academy" },
  // The course made from the /27 article (working title "Activation of Inner Vision"): no price, no waitlist.
  { title: "Advanced micro-course", note: "unlocks after Integral Mystery School" },
];

const cardStyle = {
  boxShadow: "0 8px 24px -12px rgba(10, 22, 40, 0.18), 0 0 0 1px rgba(212, 175, 55, 0.22)",
};

const numberStyle = {
  background: "linear-gradient(135deg, rgba(244, 212, 114, 0.95) 0%, rgba(212, 175, 55, 0.85) 100%)",
  color: "#0a1628",
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontVariantNumeric: "tabular-nums lining-nums",
  border: "0.5px solid rgba(122, 81, 8, 0.45)",
} as const;

const AcademyPath = () => {
  const { t } = useTranslation();
  return (
    <div className="p-6 pb-24 lg:p-10 lg:pb-12 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-5xl sm:text-6xl font-semibold mb-4 tracking-tight leading-[1.05]" style={TITLE_STYLE}>
          <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
            Academy
          </span>
        </h1>
        <Ornament className="my-5" />
        <p className="text-base sm:text-lg italic max-w-xl mx-auto leading-relaxed" style={BODY_STYLE}>
          Two courses, one path. Start with either.
        </p>
      </div>

      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 list-none p-0 m-0">
        {ACADEMY_COURSES.map((course, i) => (
          <li key={course.slug}>
            <Link
              to={COURSE_LINKS[course.slug]}
              className="block h-full rounded-2xl p-5 text-left transition-all duration-300 liquid-glass-strong hover:scale-[1.012] hover:shadow-[0_12px_36px_-14px_rgba(10,22,40,0.25)] motion-reduce:transition-none motion-reduce:hover:scale-100"
              style={cardStyle}
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold"
                  style={numberStyle}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-semibold mb-1 leading-snug" style={{ ...TITLE_STYLE, fontWeight: 600 }}>
                    {course.title}
                  </div>
                  <div className="text-sm italic" style={BODY_STYLE}>
                    {t(course.taglineKey)}
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <section className="mt-10" aria-label="Courses after these two">
        <p className="text-[10.5px] text-center mb-3" style={EYEBROW_STYLE}>
          Unlocks after these two · one by one
        </p>
        <ul className="list-none p-0 m-0 divide-y divide-[rgba(212,175,55,0.16)] opacity-70">
          {NEXT_COURSES.map((c, i) => (
            <li key={c.title} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5" aria-disabled="true">
              <Lock className="w-3.5 h-3.5 flex-shrink-0 self-center" aria-hidden="true" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.6))" }} />
              <span className="text-xs tabular-nums self-center" style={BODY_STYLE} aria-label={`Step ${i + 1}`}>
                {i + 1}
              </span>
              <span className="text-base font-semibold" style={{ ...TITLE_STYLE, fontWeight: 600 }}>
                {c.title}
              </span>
              <span className="text-sm italic w-full pl-[26px] sm:w-auto sm:pl-0 sm:ml-auto sm:text-right" style={BODY_STYLE}>
                {c.note}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AcademyPath;
