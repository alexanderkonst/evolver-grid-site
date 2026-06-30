import type { ReactNode } from "react";

const includedSetup = [
  "WeGoodOvaHere-branded experience using the community logo, colors, fonts, and background where available",
  "Entry page framing and copy",
  "High-precision uniqueness scanner modules",
  "On-screen member results",
  "Email delivery of member results",
  "Community leader dashboard",
  "Consent and privacy settings",
  "One-click export for Go High Level import",
  "Built-in email campaign tool",
  "Website button/link connection",
  "60-90 minute walkthrough and handoff",
];

const entryFrames = [
  "Finding collaborators / aligned conversations",
  "Productizing yourself from your top talent",
  "Thriving together through collaborative matchmaking within and across communities",
  "Another entry-page framing Oyi provides",
];

const modules = [
  "Top Talent Reveal",
  "Mission Discovery",
  "Asset Mapping",
  "Quality of Life Map",
  "Collaborative Matchmaking",
  "AI OS access as a bonus for individual personal use",
];

const timelineNeeds = [
  "Entry-page framing selected",
  "Logo, colors, fonts, and background provided, or approval to use the clean default version",
  "Whether Sasha provides the button/link destination or places it directly on the WeGoodOvaHere website",
];

export default function ProposalForWeGoodOvaHere() {
  const SectionTitle = ({ children }: { children: ReactNode }) => (
    <h2 className="mb-4 font-serif text-2xl font-semibold leading-tight text-[#192033]">
      {children}
    </h2>
  );

  const BulletList = ({ items }: { items: string[] }) => (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-base leading-7 text-[#192033]/78">
          <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#9b6729]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <main className="min-h-screen bg-[#f7f2e8] text-[#192033]">
      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-10 border-b border-[#192033]/15 pb-8">
          <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Proposal for WeGoodOvaHere
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#192033]/75">
            A high-precision uniqueness scanner, precision profile
            builder, deep data layer, and collaborative AI matchmaking layer for
            the WeGoodOvaHere community.
          </p>
        </div>

        <div className="space-y-10">
          <section className="rounded-lg border border-[#192033]/12 bg-white/55 p-6 shadow-sm">
            <SectionTitle>Summary</SectionTitle>
            <p className="leading-7 text-[#192033]/78">
              Members get a self-understanding experience that
              helps them discover their top talent, mission, assets,
              quality-of-life map, and access collaborative AI matchmaking
              within the community. As the community leader, you get a
              precision data layer for self-understanding, matchmaking, and
              community potential activation.
            </p>
          </section>

          <section>
            <SectionTitle>What's included</SectionTitle>
            <BulletList items={includedSetup} />
          </section>

          <section className="grid gap-8 md:grid-cols-2">
            <div>
              <SectionTitle>Branded Experience</SectionTitle>
              <p className="leading-7 text-[#192033]/78">
                Uses the WeGoodOvaHere logo, colors, fonts, and background if
                provided. Before all brand assets are ready, we will use a clean
                default version.
              </p>
            </div>

            <div>
              <SectionTitle>Website Connection</SectionTitle>
              <p className="leading-7 text-[#192033]/78">
                Sasha provides the exact destination for the website button or
                link. Oyi can place it on the WeGoodOvaHere website, or provide
                website access and Sasha can place it directly.
              </p>
            </div>
          </section>

          <section className="grid gap-8 md:grid-cols-2">
            <div>
              <SectionTitle>Entry Page Framing</SectionTitle>
              <BulletList items={entryFrames} />
            </div>

            <div>
              <SectionTitle>Included Modules</SectionTitle>
              <BulletList items={modules} />
            </div>
          </section>

          <section>
            <SectionTitle>Community Leader Dashboard</SectionTitle>
            <p className="leading-7 text-[#192033]/78">
              Oyi can view member results when members have shared them with
              the community, use the data for community design and matchmaking,
              export data for Go High Level import, and send simple email
              campaigns from the built-in campaign tool.
            </p>
          </section>

          <section>
            <SectionTitle>Consent And Data Privacy</SectionTitle>
            <p className="leading-7 text-[#192033]/78">
              By default, members share their data with the WeGoodOvaHere
              community leader for matchmaking, collaboration, and community
              intelligence. Members can adjust privacy settings if they want
              certain data kept private.
            </p>
          </section>

          <section>
            <SectionTitle>Pricing</SectionTitle>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-[#192033]/12 bg-white/60 p-6">
                <p className="text-sm uppercase tracking-[0.18em] text-[#8d5d26]">
                  Setup / Implementation
                </p>
                <p className="mt-3 text-4xl font-semibold">$1,500</p>
                <p className="mt-4 leading-7 text-[#192033]/75">
                  Covers the branded experience, scanner setup, module wiring,
                  result delivery, dashboard setup, data export, website
                  connection, and handoff.
                </p>
              </div>

              <div className="rounded-lg border border-[#192033]/12 bg-white/60 p-6">
                <p className="text-sm uppercase tracking-[0.18em] text-[#8d5d26]">
                  Ongoing Platform Access
                </p>
                <p className="mt-3 text-4xl font-semibold">$75/mo</p>
                <p className="mt-4 leading-7 text-[#192033]/75">
                  Includes hosting, maintenance, small fixes, access to the
                  included modules, dashboard access, campaign access, and
                  non-excessive community usage.
                </p>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>Usage</SectionTitle>
            <p className="leading-7 text-[#192033]/78">
              100 completed scans are included. After that, 10 new scans per
              month are included. If WeGoodOvaHere grows beyond that, we can add
              a scan pack or upgrade the usage plan.
            </p>
          </section>

          <section>
            <SectionTitle>Revenue Share</SectionTitle>
            <div className="space-y-4 leading-7 text-[#192033]/78">
              <p>
                Digital products sold through the WeGoodOvaHere node: Oyi keeps
                90%, and 10% goes back to the platform/network. Example: a $37
                deeper Top Talent Reveal.
              </p>
              <p>
                Human-led containers delivered by Sasha to people referred from
                WeGoodOvaHere: 33% referral share to Oyi.
              </p>
            </div>
          </section>

          <section>
            <SectionTitle>Timeline</SectionTitle>
            <p className="mb-4 leading-7 text-[#192033]/78">
              Estimated delivery: within 2 weeks after the following are clear:
            </p>
            <BulletList items={timelineNeeds} />
          </section>
        </div>
      </section>
    </main>
  );
}
