import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { ACTIVATIONS, ACTIVATIONS_BUNDLE_PRICE, getLiveActivations } from "@/data/activations";

// Activations Index — public marketing entry for the educational-apps layer.
// Day 51 (Sasha 2026-04-25): scaffolding. Currently shows "live" entries
// from src/data/activations.ts. When Sasha fills in transcripts → copy →
// flips status to "live", entries surface here automatically.

const ActivationsIndex = () => {
  const navigate = useNavigate();
  const live = getLiveActivations();
  const totalCount = ACTIVATIONS.length;

  useEffect(() => {
    const prev = document.title;
    document.title = "Activations — Educational apps in the Planetary OS";
    return () => { document.title = prev; };
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(30,67,116,0.4) 0%, rgba(44,49,80,0.6) 50%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      <main className="relative z-10 min-h-screen w-full flex justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="w-full max-w-4xl space-y-12">

          {/* Header */}
          <header className="text-center space-y-5">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
              style={{
                background: "hsl(0 0% 100% / 0.06)",
                border: "1px solid hsl(0 0% 100% / 0.1)",
                color: "hsl(0 0% 100% / 0.6)",
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </button>

            <p
              className="text-[10px] tracking-[0.3em] uppercase font-medium"
              style={{ color: "hsl(40 60% 75% / 0.7)" }}
            >
              Educational apps · Planetary OS
            </p>

            <h1
              className="font-display italic font-normal tracking-[-0.04em] leading-[1.1]"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 4rem)",
                background:
                  "linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(40 50% 92%) 50%, hsl(40 70% 82%) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Activations
            </h1>

            <p
              className="text-base sm:text-lg font-light max-w-2xl mx-auto leading-relaxed"
              style={{ color: "hsl(0 0% 100% / 0.78)" }}
            >
              Two-hour transformative workshops. Each one a self-contained activation
              — synthesized from live sessions, packaged as standalone product.
            </p>

            {live.length > 0 && totalCount > live.length && (
              <p
                className="text-xs font-light"
                style={{ color: "hsl(0 0% 100% / 0.4)" }}
              >
                {live.length} live · {totalCount - live.length} more coming
              </p>
            )}
          </header>

          {/* Activations grid — only live entries */}
          {live.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center"
              style={{
                background: "hsl(0 0% 100% / 0.04)",
                border: "1px solid hsl(0 0% 100% / 0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Sparkles
                className="w-6 h-6 mx-auto mb-4"
                style={{ color: "hsl(40 60% 75% / 0.7)" }}
              />
              <p
                className="text-base font-light"
                style={{ color: "hsl(0 0% 100% / 0.7)" }}
              >
                Activations are being prepared. First batch ships soon.
              </p>
              <p
                className="text-xs font-light mt-3"
                style={{ color: "hsl(0 0% 100% / 0.4)" }}
              >
                In the meantime, the AI OS layer is fully open.
              </p>
              <Link
                to="/ai-os"
                className="inline-flex items-center gap-2 text-xs font-medium tracking-wide px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 mt-5"
                style={{
                  background: "hsla(195, 35%, 70%, 0.15)",
                  border: "1px solid hsla(195, 35%, 70%, 0.25)",
                  color: "hsl(195 50% 90%)",
                }}
              >
                Use AI OS
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {live.map((act) => (
                <Link
                  key={act.id}
                  to={`/activations/${act.slug}`}
                  className="group rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] block"
                  style={{
                    background: "hsl(0 0% 100% / 0.04)",
                    border: "1px solid hsl(0 0% 100% / 0.1)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <p
                    className="text-[10px] tracking-[0.25em] uppercase font-medium mb-3"
                    style={{ color: "hsl(40 60% 75% / 0.65)" }}
                  >
                    {act.duration} · ${act.price}
                  </p>
                  <h2
                    className="text-xl sm:text-2xl font-display italic font-normal mb-2 leading-tight"
                    style={{ color: "hsl(0 0% 100% / 0.95)" }}
                  >
                    {act.title}
                  </h2>
                  {act.subtitle && (
                    <p
                      className="text-sm font-light mb-3"
                      style={{ color: "hsl(0 0% 100% / 0.6)" }}
                    >
                      {act.subtitle}
                    </p>
                  )}
                  <p
                    className="text-sm font-light leading-relaxed"
                    style={{ color: "hsl(0 0% 100% / 0.75)" }}
                  >
                    {act.promise}
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium mt-4 transition-transform group-hover:translate-x-0.5"
                    style={{ color: "hsl(40 70% 80%)" }}
                  >
                    Open activation
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Bundle CTA — shows when at least 2 live activations exist */}
          {live.length >= 2 && (
            <div
              className="rounded-2xl p-6 sm:p-8 text-center"
              style={{
                background:
                  "linear-gradient(135deg, hsla(40, 50%, 50%, 0.12) 0%, hsla(40, 40%, 40%, 0.06) 100%)",
                border: "1px solid hsla(40, 60%, 60%, 0.3)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-medium mb-2"
                style={{ color: "hsl(40 60% 80% / 0.75)" }}
              >
                The bundle
              </p>
              <h3
                className="text-xl sm:text-2xl font-display italic font-normal mb-3"
                style={{ color: "hsl(0 0% 100% / 0.95)" }}
              >
                All Activations · ${ACTIVATIONS_BUNDLE_PRICE}
              </h3>
              <p
                className="text-sm font-light max-w-md mx-auto mb-5 leading-relaxed"
                style={{ color: "hsl(0 0% 100% / 0.7)" }}
              >
                Get every activation. Lifetime access. Save ${live.length * 39 - ACTIVATIONS_BUNDLE_PRICE} vs individual.
              </p>
              {/* Bundle Stripe URL — to be filled */}
              <p
                className="text-[11px] italic font-light"
                style={{ color: "hsl(0 0% 100% / 0.4)" }}
              >
                (Bundle Stripe link wires up once first 3 activations are live.)
              </p>
            </div>
          )}

          {/* Footer note */}
          <div className="text-center pt-4">
            <p
              className="text-[11px] font-light max-w-md mx-auto leading-relaxed"
              style={{ color: "hsl(0 0% 100% / 0.42)" }}
            >
              Activations are educational apps inside the Planetary OS. AI OS layer is free; activations bring depth-work that AI alone can't.
            </p>
          </div>

        </div>
      </main>
    </>
  );
};

export default ActivationsIndex;
