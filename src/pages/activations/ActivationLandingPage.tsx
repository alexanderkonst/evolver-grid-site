import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, ExternalLink, Sparkles } from "lucide-react";
import { getActivationBySlug } from "@/data/activations";

// Activation Landing Page — per-workshop sales/marketing surface.
// Public route. No auth gating. Stripe Payment Link handles checkout.
// Success URL on Stripe should redirect to /activations/<slug>/access.

const ActivationLandingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const activation = slug ? getActivationBySlug(slug) : undefined;

  useEffect(() => {
    if (!activation) return;
    const prev = document.title;
    document.title = `${activation.title} — Activation`;
    return () => { document.title = prev; };
  }, [activation]);

  if (!activation) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-4"
        style={{
          background:
            "linear-gradient(180deg, rgba(30,67,116,0.4) 0%, rgba(44,49,80,0.6) 50%, rgba(0,0,0,0.9) 100%)",
        }}
      >
        <div className="text-center space-y-4">
          <p className="text-base" style={{ color: "hsl(0 0% 100% / 0.7)" }}>
            Activation not found: <code>{slug}</code>
          </p>
          <Link
            to="/activations"
            className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full"
            style={{
              background: "hsl(0 0% 100% / 0.06)",
              border: "1px solid hsl(0 0% 100% / 0.12)",
              color: "hsl(0 0% 100% / 0.7)",
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Activations
          </Link>
        </div>
      </div>
    );
  }

  const isLive = activation.status === "live";
  const hasStripe = activation.stripeUrl.length > 0;

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
        <div className="w-full max-w-3xl space-y-12">

          {/* Header — back nav */}
          <header className="text-center">
            <button
              onClick={() => navigate("/activations")}
              className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
              style={{
                background: "hsl(0 0% 100% / 0.06)",
                border: "1px solid hsl(0 0% 100% / 0.1)",
                color: "hsl(0 0% 100% / 0.6)",
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Activations
            </button>
          </header>

          {/* Hero */}
          <section className="text-center space-y-5">
            <p
              className="text-[10px] tracking-[0.3em] uppercase font-medium"
              style={{ color: "hsl(40 60% 75% / 0.7)" }}
            >
              {activation.duration} · Recorded activation
            </p>

            <h1
              className="font-display italic font-normal tracking-[-0.03em] leading-[1.05]"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 4rem)",
                background:
                  "linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(40 50% 92%) 50%, hsl(40 70% 82%) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {activation.title}
            </h1>

            {activation.subtitle && (
              <p
                className="text-base sm:text-lg font-light"
                style={{ color: "hsl(0 0% 100% / 0.7)" }}
              >
                {activation.subtitle}
              </p>
            )}

            <p
              className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-medium"
              style={{ color: "hsl(0 0% 100% / 0.92)" }}
            >
              {activation.promise}
            </p>
          </section>

          {/* Who this is for */}
          {activation.whoFor && (
            <section
              className="rounded-2xl p-6 sm:p-7"
              style={{
                background: "hsl(0 0% 100% / 0.04)",
                border: "1px solid hsl(0 0% 100% / 0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-medium mb-2"
                style={{ color: "hsl(195 35% 75% / 0.7)" }}
              >
                Who this is for
              </p>
              <p
                className="text-sm sm:text-base font-light leading-relaxed"
                style={{ color: "hsl(0 0% 100% / 0.85)" }}
              >
                {activation.whoFor}
              </p>
            </section>
          )}

          {/* What you get */}
          {activation.outcomes.length > 0 && (
            <section
              className="rounded-2xl p-6 sm:p-7"
              style={{
                background: "hsl(0 0% 100% / 0.04)",
                border: "1px solid hsl(0 0% 100% / 0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-medium mb-4"
                style={{ color: "hsl(40 60% 75% / 0.7)" }}
              >
                What you get
              </p>
              <ul className="space-y-3">
                {activation.outcomes.map((outcome, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm sm:text-base font-light leading-relaxed"
                    style={{ color: "hsl(0 0% 100% / 0.85)" }}
                  >
                    <Check
                      className="flex-shrink-0 mt-1 w-4 h-4"
                      style={{ color: "hsl(40 70% 75%)" }}
                    />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* CTA — Stripe checkout */}
          <section
            className="rounded-2xl p-6 sm:p-8 text-center"
            style={{
              background:
                "linear-gradient(135deg, hsla(40, 50%, 50%, 0.14) 0%, hsla(40, 40%, 40%, 0.07) 100%)",
              border: "1px solid hsla(40, 60%, 60%, 0.32)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 32px -8px hsla(40, 60%, 50%, 0.25)",
            }}
          >
            <div className="flex items-baseline justify-center gap-2 mb-5">
              <span
                className="text-3xl sm:text-4xl font-display italic font-bold"
                style={{ color: "hsl(40 70% 88%)" }}
              >
                ${activation.price}
              </span>
              <span
                className="text-sm font-light"
                style={{ color: "hsl(0 0% 100% / 0.55)" }}
              >
                · one-time · lifetime access
              </span>
            </div>

            {hasStripe ? (
              <a
                href={activation.stripeUrl}
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(40 70% 55%) 0%, hsl(40 60% 42%) 100%)",
                  color: "hsl(40 30% 12%)",
                  boxShadow: "0 4px 16px -2px hsla(40, 70%, 50%, 0.5)",
                }}
              >
                Get {activation.title}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div className="space-y-3">
                <button
                  disabled
                  className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full opacity-50 cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(40 70% 55%) 0%, hsl(40 60% 42%) 100%)",
                    color: "hsl(40 30% 12%)",
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Coming soon
                </button>
                <p
                  className="text-[11px] italic"
                  style={{ color: "hsl(0 0% 100% / 0.45)" }}
                >
                  {isLive
                    ? "Stripe checkout being wired up — back shortly."
                    : "Activation in preparation. First batch ships soon."}
                </p>
              </div>
            )}
          </section>

          {/* Testimonials — only if present */}
          {activation.testimonials && activation.testimonials.length > 0 && (
            <section className="space-y-4">
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-medium text-center"
                style={{ color: "hsl(195 35% 75% / 0.7)" }}
              >
                What past participants say
              </p>
              <div className="space-y-3">
                {activation.testimonials.map((t, i) => (
                  <blockquote
                    key={i}
                    className="rounded-2xl p-5 sm:p-6"
                    style={{
                      background: "hsl(0 0% 100% / 0.04)",
                      border: "1px solid hsl(0 0% 100% / 0.1)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <p
                      className="text-sm sm:text-base font-light italic leading-relaxed mb-2"
                      style={{ color: "hsl(0 0% 100% / 0.88)" }}
                    >
                      "{t.quote}"
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "hsl(40 50% 75%)" }}
                    >
                      — {t.name}
                    </p>
                  </blockquote>
                ))}
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="text-center pt-4 space-y-2">
            <Link
              to="/activations"
              className="inline-flex items-center gap-1.5 text-xs font-light hover:underline"
              style={{ color: "hsl(0 0% 100% / 0.5)" }}
            >
              <ArrowLeft className="w-3 h-3" />
              All Activations
            </Link>
            <p
              className="text-[10px] font-light"
              style={{ color: "hsl(0 0% 100% / 0.35)" }}
            >
              by Aleksandr Konstantinov · FindYourTopTalent.Com
            </p>
          </footer>

        </div>
      </main>
    </>
  );
};

export default ActivationLandingPage;
