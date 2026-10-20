import { Link } from "react-router-dom";

const cockpitModules = [
  {
    title: "Dynamic daily brief",
    body: "Not a digest. Rebuilt every morning from what moved: deals, relationships, money, commitments, and the one move that matters today.",
  },
  {
    title: "Business cockpit",
    body: "Offers, pipeline, relationships, ledger, strategy. The whole business on one surface, readable by you and by AI.",
  },
  {
    title: "Founder as CEO",
    body: "Strategy, vision, final decisions. You own the signal. Nothing goes out without your yes.",
  },
  {
    title: "AI as COO",
    body: "Finds your ideal clients, drafts every message, tracks each one through your funnel. Built to run your inbox and outreach while you sleep, and hand you a recap in the morning.",
  },
  {
    title: "Founder-market fit first",
    body: "Most founders start from an idea. “Idea” covers everything from a full business plan to a hunch, so it tells you nothing. The Cockpit starts from you.",
  },
  {
    title: "Zone of Genius → the business",
    body: "Your Zone of Genius, read precisely. The market it fits. The business only you should build. A process you can steer, not a bet.",
  },
  {
    title: "The blind spot",
    body: "Top investors sense founder-market fit by intuition, after the fact. This method is built to read it before you build, and to reproduce it.",
  },
  {
    title: "Radically simpler",
    body: "Templates and blueprints instead of headcount. Radically simpler, so radically cheaper to run.",
  },
];

export default function CockpitLanding() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f1e6] text-[#111827]">
      <section className="relative min-h-screen px-5 py-8 sm:px-8">
        <div
          className="absolute inset-0 opacity-[0.23]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(21, 31, 52, 0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(21, 31, 52, 0.14) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="absolute inset-y-0 right-[-12%] w-[52%] bg-[#d99a2b]/70"
          style={{
            clipPath: "polygon(18% 8%, 100% 0, 100% 100%, 0 92%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-between">
          <header className="flex items-center justify-between gap-4 pr-20 sm:pr-0">
            <div
              className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#9a6a23]"
              style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
              YOU
            </div>
            <div
              className="text-[12px] uppercase tracking-[0.22em] text-[#1f2937]/55"
              style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
              Be Different
            </div>
          </header>

          <div className="grid items-end gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="max-w-3xl">
              <p
                className="mb-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#9a6a23]"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                Founder Cockpit
              </p>
              <h1
                className="max-w-4xl text-[clamp(52px,8.5vw,112px)] font-semibold leading-[0.9] text-[#111827]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Run the business only you should build.
              </h1>
              <p
                className="mt-7 max-w-2xl text-[clamp(22px,3vw,36px)] leading-[1.08] text-[#1f2937]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                An integral business management system: a dynamic daily brief and the cockpit of your whole business, on one surface.
              </p>
              <p
                className="mt-5 max-w-2xl text-[clamp(24px,3.2vw,42px)] italic leading-[1.08] text-[#1f2937]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                You lead. AI operates.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  to="/build/cockpit/dashboard"
                  className="inline-flex items-center justify-center rounded-full bg-[#111827] px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-white transition-transform duration-200 hover:translate-y-[-1px]"
                  style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
                >
                  Enter the cockpit
                </Link>
                <span
                  className="text-[13px] text-[#1f2937]/60"
                  style={{ fontFamily: "'Source Serif 4', serif" }}
                >
                  For founders who build from who they are.
                </span>
              </div>
            </section>

            <aside className="relative">
              <div className="rounded-[8px] border border-[#111827]/20 bg-[#fffaf0]/95 p-5 shadow-[0_24px_80px_rgba(17,24,39,0.12)] backdrop-blur">
                <p
                  className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#9a6a23]"
                  style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
                >
                  What changed
                </p>
                <p
                  className="mt-4 text-[clamp(24px,3vw,38px)] leading-[1.02] text-[#111827]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  A company used to need a team, assembled and aligned, before it could move. AI plus blueprints make it one founder&apos;s job.
                </p>
              </div>
            </aside>
          </div>

          <div className="grid gap-3 pb-4 md:grid-cols-2 lg:grid-cols-4">
            {cockpitModules.map((module) => (
              <article
                key={module.title}
                className="rounded-[8px] border border-[#111827]/12 bg-[#fffaf0]/95 p-4 backdrop-blur"
              >
                <h2
                  className="text-[20px] font-semibold leading-tight text-[#111827]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {module.title}
                </h2>
                <p
                  className="mt-2 text-[14px] leading-[1.45] text-[#1f2937]/76"
                  style={{ fontFamily: "'Source Serif 4', serif" }}
                >
                  {module.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
