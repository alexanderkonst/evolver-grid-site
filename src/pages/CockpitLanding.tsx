import { Link } from "react-router-dom";

const cockpitModules = [
  {
    title: "Project blueprint",
    body: "See how your product, offers, relationships, and strategy are trying to become one living system.",
  },
  {
    title: "Founder journey mirror",
    body: "Notice what the business is asking you to become before you mistake it for a marketing or product problem.",
  },
  {
    title: "Energy exchange ledger",
    body: "Track where money, trust, attention, silence, proposals, referrals, and commitments are actually moving.",
  },
  {
    title: "Strategic oracle",
    body: "Read the shape of the project for growth drivers, bottlenecks, timing, leverage, and the move that matters now.",
  },
  {
    title: "Readiness signal",
    body: "Know when clarity is still ripening and when the next move has energy now.",
  },
  {
    title: "Relationship radar",
    body: "See which loops are warm, stale, opening, closing, or ready for a clean follow-up.",
  },
  {
    title: "Attention surfaces",
    body: "Find the rooms, people, partners, and conversations where your life’s work can meet its field.",
  },
  {
    title: "Next-move synthesis",
    body: "Stop managing scattered pieces and start navigating one living system.",
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
                Founder Life&apos;s Work Navigation
              </p>
              <h1
                className="max-w-4xl text-[clamp(52px,8.5vw,112px)] font-semibold leading-[0.9] text-[#111827]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Your project has a life of its own.
              </h1>
              <p
                className="mt-7 max-w-2xl text-[clamp(22px,3vw,36px)] leading-[1.08] text-[#1f2937]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Does it speak to you?
              </p>
              <p
                className="mt-5 max-w-2xl text-[clamp(24px,3.2vw,42px)] italic leading-[1.08] text-[#1f2937]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Get a good cockpit for your life&apos;s work.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  to="/admin"
                  className="inline-flex items-center justify-center rounded-full bg-[#111827] px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-white transition-transform duration-200 hover:translate-y-[-1px]"
                  style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
                >
                  Enter the cockpit
                </Link>
                <span
                  className="text-[13px] text-[#1f2937]/60"
                  style={{ fontFamily: "'Source Serif 4', serif" }}
                >
                  For founders whose project has a life of its own.
                </span>
              </div>
            </section>

            <aside className="relative">
              <div className="rounded-[8px] border border-[#111827]/20 bg-[#fffaf0]/95 p-5 shadow-[0_24px_80px_rgba(17,24,39,0.12)] backdrop-blur">
                <p
                  className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#9a6a23]"
                  style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
                >
                  What changes
                </p>
                <p
                  className="mt-4 text-[clamp(24px,3vw,38px)] leading-[1.02] text-[#111827]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  You stop managing scattered pieces and start navigating one living system.
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
