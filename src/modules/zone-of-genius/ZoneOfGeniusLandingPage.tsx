import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import AppleseedSummaryCard from "@/components/profile/AppleseedSummaryCard";
import ExcaliburSummaryCard from "@/components/profile/ExcaliburSummaryCard";
import { AppleseedData } from "./appleseedGenerator";
import { ExcaliburData } from "./excaliburGenerator";
import { loadSavedData } from "./saveToDatabase";

const ZoneOfGeniusLandingPage = () => {
  const navigate = useNavigate();
  const [appleseed, setAppleseed] = useState<AppleseedData | null>(null);
  const [excalibur, setExcalibur] = useState<ExcaliburData | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadSaved = async () => {
      const { appleseed: savedAppleseed, excalibur: savedExcalibur } = await loadSavedData();
      setAppleseed(savedAppleseed);
      setExcalibur(savedExcalibur);
    };
    loadSaved();
  }, []);

  const handleStartAssessment = () => {
    navigate("/zone-of-genius/entry");
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <Navigation />

      <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl space-y-20">

          {(appleseed || excalibur) && (
            <section className="max-w-3xl mx-auto space-y-4">
              <h2 className="text-xl font-semibold text-center text-primary">Your Saved Genius Outputs</h2>
              <div className="space-y-4">
                {appleseed && <AppleseedSummaryCard appleseed={appleseed} />}
                {excalibur && <ExcaliburSummaryCard excalibur={excalibur} />}
                {appleseed && !excalibur && (
                  <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200 text-center">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Your Unique Offer</h3>
                    <p className="text-slate-600 mb-4">
                      You know who you are. Now discover what you can offer.
                    </p>
                    <button
                      onClick={() => navigate("/zone-of-genius/entry")}
                      className="px-4 py-2 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700"
                    >
                      Create My Unique Offer →
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Hero Section */}
          <section className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary">
              Name what you love doing
            </h1>

            <p className="text-xl sm:text-2xl text-foreground/80 max-w-3xl mx-auto">
              Zone of Genius test that shows your core talents, where you thrive, and where you don't.
            </p>

            <button
              onClick={handleStartAssessment}
              className="mt-8 px-8 py-4 text-lg font-semibold rounded-full transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]"
              style={{
                backgroundColor: 'hsl(210, 70%, 15%)',
                color: 'white'
              }}
            >
              Start My Zone of Genius Snapshot
            </button>

            <p className="text-sm text-muted-foreground">
              Free · ~3-15 minutes · One page you'll actually use (not a 40-page report)
            </p>
          </section>

          {/* Real Problem Section */}
          <section className="space-y-6 max-w-3xl mx-auto">
            <p className="text-lg text-foreground/90 text-center">
              You might recognize yourself here:
            </p>

            <ul className="space-y-3">
              {[
                "You're good at many things, but nothing feels like the obvious center of gravity.",
                "Your role looks great on paper, yet a quiet part of you keeps saying, 'This isn't it.'",
                "When you try to explain what you really do, it comes out vague, fragmented, or overcomplicated.",
                "You sense a larger contribution, but can't see the concrete next move."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-lg text-foreground/80 text-center pt-4">
              This snapshot is built to give language to that.
            </p>
          </section>

          {/* What This Is Section */}
          <section className="space-y-8">
            <div className="text-center space-y-3">
              <p className="text-xs uppercase tracking-wider text-primary/70">
                What the Zone of Genius Snapshot is
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary">
                Not a personality test. A one-page 'this is me' card.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[
                {
                  title: "Puts a sharp name on your pattern",
                  description: "Distills your top talents into a short archetype and 3 core strengths you can speak out loud without cringing."
                },
                {
                  title: "Shows where that pattern belongs",
                  description: "Points to roles, environments, and types of work where your genius naturally creates value — and where it will slowly die."
                },
                {
                  title: "Shows your edge, not just your shine",
                  description: "Names your typical traps and overextensions, so you can design around them instead of fighting yourself."
                }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-border bg-card/60 hover:border-primary/50 transition-all shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* What You Leave With Section */}
          <section className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary">
              In one session you walk away with:
            </h2>

            <ul className="space-y-3">
              {[
                "A short archetype phrase that finally sounds like you, not a horoscope.",
                "Your Top 3 core talents, ordered and described in plain, concrete language.",
                "A readable 'How Your Genius Shows Up' section you can recognize in your day-to-day behavior.",
                "A kind but honest 'Where You Get Stuck (Your Edge)' section.",
                "A handful of Career & Contribution sweet spots and This-Week alignment ideas to test in real life."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-sm text-muted-foreground text-center pt-4">
              You get this both on-screen and as a clean PDF you can save, print, or bring into coaching/therapy/conversation.
            </p>

            <div className="text-center pt-6">
              <button
                onClick={handleStartAssessment}
                className="px-8 py-4 text-lg font-semibold rounded-full transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]"
                style={{
                  backgroundColor: 'hsl(210, 70%, 15%)',
                  color: 'white'
                }}
              >
                Get My Zone of Genius Snapshot
              </button>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="space-y-8">
            <div className="text-center space-y-3">
              <p className="text-xs uppercase tracking-wider text-primary/70">
                How it works
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary">
                Simple flow. Surprisingly deep output.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[
                {
                  title: "Choose your talents",
                  description: "You select from a curated list of talents and narrow down to your Top 3 in order of how naturally they show up."
                },
                {
                  title: "Let the AI connect the dots",
                  description: "A custom prompt, trained on 10+ years of pattern-spotting, turns your choices into a tight, human-sounding snapshot."
                },
                {
                  title: "Read, download, choose one move",
                  description: "You read your ZoG Snapshot, download the PDF, and pick one suggested action to try in the next 7–14 days."
                }
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-border bg-card/60 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center pt-4">
              You can redo the assessment any time to see how your expression evolves.
            </p>
          </section>

          {/* Social Proof Section */}
          <section className="space-y-8">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-primary/70 mb-4">
                What people say after seeing their snapshot
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  boldLine: "This is a miracle of miracles.",
                  rest: "I'm re-reading it—brilliant! Totally badass. Other tools come at this half-baked and shallow; they've got no depth. Your approach, though, I love it. A tool that just plain works!",
                  name: "Alexey"
                },
                {
                  boldLine: "I finally had language for something I'd felt my whole life.",
                  rest: "This is very valuable. I resonate with all of this. Inspires & informs BRILLIANTLY!!",
                  name: "Laura"
                },
                {
                  boldLine: "I got into my Zone of Genius and launched my blockchain wellness education project.",
                  rest: "I am also grateful for this training. Obrigado!",
                  name: "Simba"
                },
                {
                  boldLine: "It inspires and informs brilliantly.",
                  rest: "This was an outstanding training! I am so grateful to know my zone of genius now (and why!). Truly profound. I am taking my time to review suggestions from AI. I am so inspired to lean into my talents and share them globally.",
                  name: "Tshatiqua"
                }
              ].map((testimonial, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-border bg-card/60 shadow-sm"
                >
                  <p className="text-sm text-foreground mb-2">
                    <span className="font-semibold">"{testimonial.boldLine}"</span> {testimonial.rest}
                  </p>
                  <p className="text-xs font-semibold text-primary mt-4">
                    — {testimonial.name}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Why This Exists Section */}
          <section className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-3">
              <p className="text-xs uppercase tracking-wider text-primary/70">
                Why this exists
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary">
                Built by someone obsessed with 'what were you really made for?'
              </h2>
            </div>

            <p className="text-lg text-foreground/90 leading-relaxed">
              I'm Aleksandr. For the last decade I've helped founders, creators, and high-potential humans move from 'successful but misaligned' into work that actually fits.
              My background blends MIT-trained strategy, AI systems design, and deep integral / consciousness work.
              This tool compresses the patterns I've seen across hundreds of people into a single page you can get in under half an hour.
            </p>

            <ul className="space-y-2 pt-4">
              {[
                "10+ years guiding people through big career and life pivots",
                "250+ individuals mapped into their Zone of Genius",
                "AI used as a precision lens, not a gimmick"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary text-lg">•</span>
                  <span className="text-sm text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Who It's For / Not For Section */}
          <section className="space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary">
              This is for you if…
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "You're at or near a transition and refuse to 'just pick something' out of fear.",
                    "You're multi-talented and tired of calling yourself 'a generalist' because you don't have better words.",
                    "You care about impact and meaning as much as compensation.",
                    "You're ready to act on what you learn — not just consume another insight."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-primary text-xl">•</span>
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  This is not for you if…
                </h3>
                <ul className="space-y-3">
                  {[
                    "You only want a quick personality quiz for entertainment.",
                    "You expect a huge report instead of a sharp, one-page snapshot.",
                    "You're looking for therapy, diagnosis, or legal/financial advice. This isn't that."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-muted-foreground text-xl">•</span>
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Optional Session Section */}
          <section className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-3">
              <p className="text-xs uppercase tracking-wider text-primary/70">
                After your snapshot
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary">
                Want help turning this into your next concrete move?
              </h2>
            </div>

            <div className="space-y-4 text-foreground/90 leading-relaxed">
              <p>The free snapshot gives you clarity.</p>
              <p>If you want support turning that clarity into a specific decision or pivot, you can book a Career Re-Ignition Session with me.</p>
              <p>In 90 minutes we will:</p>
              <ul className="space-y-2 pl-6">
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>Look at your current role, options, and constraints through the lens of your Zone of Genius.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>Identify 1–2 promising directions that fit both your genius and your reality.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>Design a simple 3-step action plan for the next 30–60 days.</span>
                </li>
              </ul>
              <p className="pt-2">Many people use the snapshot on their own. Some choose to go deeper with a guide. Both are valid.</p>
            </div>

            <div className="text-center pt-6">
              <a
                href="https://www.calendly.com/konstantinov"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-full transition-all border-2 border-primary/30 bg-card/60 hover:bg-card hover:border-primary/50 text-primary shadow-sm"
              >
                Explore a Career Re-Ignition Session
                <ExternalLink size={18} />
              </a>
              <p className="text-sm text-muted-foreground mt-3">$297 · 90 minutes</p>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="text-center space-y-6 py-16 px-6 rounded-3xl border-2 border-primary/30 bg-primary/5">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary">
              Ready to see your Zone of Genius on one clean page?
            </h2>

            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              One focused assessment. One snapshot. A different way of making decisions from here.
            </p>

            <button
              onClick={handleStartAssessment}
              className="px-8 py-4 text-lg font-semibold rounded-full transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]"
              style={{
                backgroundColor: 'hsl(210, 70%, 15%)',
                color: 'white'
              }}
            >
              Start My Zone of Genius Snapshot
            </button>

            <p className="text-xs text-muted-foreground pt-2">
              Free assessment · No spam · You can redo it whenever your life evolves.
            </p>
          </section>

        </div>
      </main>

      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Sticky Mobile CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-3 pb-safe-4 shadow-lg z-50">
        <button
          onClick={handleStartAssessment}
          className="w-full py-3 rounded-full font-semibold transition-all text-sm shadow-[0_0_20px_rgba(26,54,93,0.5)]"
          style={{
            backgroundColor: 'hsl(210, 70%, 15%)',
            color: 'white'
          }}
        >
          Start Free Assessment
        </button>
      </div>
    </div>
  );
};

export default ZoneOfGeniusLandingPage;
