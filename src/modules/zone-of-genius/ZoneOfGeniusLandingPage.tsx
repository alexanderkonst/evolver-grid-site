import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import BoldText from "@/components/BoldText";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import profilePhoto from "@/assets/profile-photo.png";

const ZoneOfGeniusLandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleStartAssessment = () => {
    navigate("/zone-of-genius/assessment");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl space-y-16">
          
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary uppercase">
              <BoldText>Get instant clarity on your core strengths and a clear path forward</BoldText>
            </h1>
            
            <p className="text-xl sm:text-2xl text-foreground/90 max-w-3xl mx-auto">
              <BoldText>Get Your Free Zone of Genius Snapshot in Minutes</BoldText>
            </p>
            
            <button
              onClick={handleStartAssessment}
              className="mt-8 px-8 py-4 text-lg font-bold rounded-full transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]"
              style={{ 
                backgroundColor: 'hsl(210, 70%, 15%)',
                color: 'white'
              }}
            >
              <BoldText>Reveal your Zone of Genius Now</BoldText>
            </button>
            
            <p className="text-sm text-muted-foreground">
              AI-Powered Clarity · Personalized PDF Report · Strategic Career Insights
            </p>
          </section>

          {/* About Section */}
          <section className="space-y-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="w-full lg:w-1/3">
                <img
                  src={profilePhoto}
                  alt="Aleksandr Konstantinov"
                  className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-primary/20"
                />
              </div>
              
              <div className="w-full lg:w-2/3 space-y-4">
                <h2 className="text-3xl font-bold text-primary">
                  Your Guide Through Career Transition: Aleksandr Konstantinov
                </h2>
                
                <p className="text-lg text-foreground/90">
                  As an MIT alum specializing in Zone of Genius activation and AI-enhanced career strategy, I am dedicated to helping professionals navigate transitions with confidence and clarity. My unique approach combines cutting-edge AI insights with deep human understanding.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-4 rounded-xl border border-border bg-card/40">
                    <p className="text-2xl font-bold text-primary">10+ Years</p>
                    <p className="text-sm text-muted-foreground">Career Transformation</p>
                  </div>
                  <div className="text-center p-4 rounded-xl border border-border bg-card/40">
                    <p className="text-2xl font-bold text-primary">250+ People</p>
                    <p className="text-sm text-muted-foreground">Got Their Zone</p>
                  </div>
                  <div className="text-center p-4 rounded-xl border border-border bg-card/40">
                    <p className="text-2xl font-bold text-primary">MIT Alum</p>
                    <p className="text-sm text-muted-foreground">AI & Human Potential</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Snapshot Features Section */}
          <section className="space-y-8">
            <div className="text-center">
              <p className="text-sm uppercase tracking-wider text-primary/70 mb-4">
                Zone of Genius Snapshot
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "AI-Powered Clarity",
                  description: "Get your personalized strengths analysis in 5 minutes."
                },
                {
                  title: "Personalized PDF Report",
                  description: "Receive a tailored Zone of Genius Snapshot PDF you can revisit anytime."
                },
                {
                  title: "Your Top 3 Core Talents",
                  description: "See the top talents that drive your best work."
                },
                {
                  title: "Expert-Backed Process",
                  description: "Developed by MIT alum & career transition specialist."
                },
                {
                  title: "Immediate Action Plan",
                  description: "Translate your insights into next steps for your career."
                },
                {
                  title: "Personalized ZoG Statement",
                  description: "Get a clear statement that captures your unique genius."
                },
                {
                  title: "Strategic Career Insights",
                  description: "Discover roles and paths aligned with your strengths."
                }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-border bg-card/60 hover:border-primary/50 transition-all"
                >
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Success Stories Section */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center text-primary">
              Success Stories
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  quote: "Getting unstuck. This is very valuable. I resonate with all of this. Inspires & informs BRILLIANTLY!!",
                  name: "Laura"
                },
                {
                  quote: "I am also grateful for this training. I got into my zone of genius and launched my blockchain wellness education project. Obrigado!",
                  name: "Simba"
                },
                {
                  quote: "This was an outstanding training! I am so grateful to know my zone of genius now (and why!). Truly profound. I am taking my time to review suggestions from AI. I am so inspired to lean into my talents and share them globally. Thank you, thank you, thank you.",
                  name: "Tshatiqua"
                },
                {
                  quote: "Sasha … this is a miracle of miracles. I'm re-reading it—brilliant! Totally badass. Other tools come at this half-baked and shallow; they've got no depth. Your approach, though, I love it. A tool that just plain works!",
                  name: "Alexey"
                }
              ].map((testimonial, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-border bg-card/60"
                >
                  <p className="text-sm text-foreground/90 italic mb-4">
                    "{testimonial.quote}"
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    — {testimonial.name}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-center text-lg text-muted-foreground">
              Ready to write your own success story? Your journey to renewed confidence and career clarity starts with your free ZoG Snapshot.
            </p>
          </section>

          {/* CTA: Start Free Assessment */}
          <section className="text-center space-y-6 py-12 px-6 rounded-3xl border-2 border-primary/30 bg-primary/5">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary uppercase">
              <BoldText>Start Your Free Assessment Now</BoldText>
            </h2>
            
            <button
              onClick={handleStartAssessment}
              className="px-8 py-4 text-lg font-bold rounded-full transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]"
              style={{ 
                backgroundColor: 'hsl(210, 70%, 15%)',
                color: 'white'
              }}
            >
              <BoldText>Start My Free ZoG Assessment</BoldText>
            </button>
          </section>

          {/* CTA: Book Career Re-Ignition Session */}
          <section className="space-y-6 py-12 px-6 sm:px-8 rounded-3xl border-2 border-border bg-card/60">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary">
              Your Next Step After Seeing Your Zone of Genius Could Be: The 'Zone of Genius Activation Session' with Aleksandr
            </h2>
            
            <p className="text-lg text-foreground/90 text-center max-w-3xl mx-auto">
              In one focused 90 minute live session, Aleksandr will personally guide you to transform your ZoG insights into a concrete strategic action plan to grow into your next level with confidence and speed.
            </p>
            
            <ul className="space-y-3 max-w-2xl mx-auto">
              {[
                "Understand your current situation through the lens of your ZoG",
                "Activate your ZoG",
                "Co-create a potent action plan tailored to your unique strengths"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary text-xl">•</span>
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-4">$297</p>
              
              <p className="text-foreground/80 mb-6 max-w-2xl mx-auto">
                Your Zone of Genius Snapshot sounds like something truly resonant and deep about you? This is just the beginning. Want to know how to activate your purpose and mission and know what you are truly meant to do for others?
              </p>
              
              <a
                href="https://www.calendly.com/konstantinov"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold rounded-full transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]"
                style={{ 
                  backgroundColor: 'hsl(210, 70%, 15%)',
                  color: 'white'
                }}
              >
                <BoldText>Book My $297 Career Re-Ignition Session</BoldText>
                <ExternalLink size={20} />
              </a>
            </div>
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
          className="w-full py-3 rounded-full font-bold transition-all text-sm shadow-[0_0_20px_rgba(26,54,93,0.5)]"
          style={{ 
            backgroundColor: 'hsl(210, 70%, 15%)',
            color: 'white'
          }}
        >
          <BoldText>START FREE ASSESSMENT</BoldText>
        </button>
      </div>
    </div>
  );
};

export default ZoneOfGeniusLandingPage;
