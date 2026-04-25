import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getActivationBySlug } from "@/data/activations";

// Activation Access Page — post-purchase landing.
// Stripe Payment Link's success_url points here.
// No DB-level access gating: anyone with the URL can view. Friction =
// paying for the experience, not Fort Knox security. If abuse appears,
// switch YouTube videos to private and DM the link.

const ActivationAccessPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const activation = slug ? getActivationBySlug(slug) : undefined;

  useEffect(() => {
    if (!activation) return;
    const prev = document.title;
    document.title = `${activation.title} — Access`;
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
            Activation not found.
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

  return (
    <>
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(30,67,116,0.45) 0%, rgba(44,49,80,0.7) 50%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      <main className="relative z-10 min-h-screen w-full flex justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-4xl space-y-8">

          {/* Header */}
          <header className="text-center space-y-4">
            <p
              className="text-[10px] tracking-[0.3em] uppercase font-medium"
              style={{ color: "hsl(40 60% 75% / 0.7)" }}
            >
              ✓ Access granted · {activation.duration}
            </p>

            <h1
              className="font-display italic font-normal tracking-[-0.03em] leading-[1.05]"
              style={{
                fontSize: "clamp(1.8rem, 4.5vw, 3rem)",
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
                className="text-sm sm:text-base font-light"
                style={{ color: "hsl(0 0% 100% / 0.7)" }}
              >
                {activation.subtitle}
              </p>
            )}
          </header>

          {/* YouTube embed */}
          {activation.youtubeId ? (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                aspectRatio: "16 / 9",
                background: "#000",
                boxShadow: "0 16px 60px -12px rgba(0,0,0,0.6)",
                border: "1px solid hsl(0 0% 100% / 0.08)",
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${activation.youtubeId}?rel=0`}
                title={activation.title}
                className="w-full h-full"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div
              className="rounded-2xl p-10 text-center"
              style={{
                background: "hsl(0 0% 100% / 0.04)",
                border: "1px solid hsl(0 0% 100% / 0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p
                className="text-base font-light"
                style={{ color: "hsl(0 0% 100% / 0.7)" }}
              >
                Video uploading. Check back shortly — Aleksandr will DM you when ready.
              </p>
            </div>
          )}

          {/* Promise reminder */}
          {activation.promise && (
            <section
              className="rounded-2xl p-5 sm:p-6 text-center"
              style={{
                background: "hsl(0 0% 100% / 0.04)",
                border: "1px solid hsl(0 0% 100% / 0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-medium mb-2"
                style={{ color: "hsl(40 60% 75% / 0.7)" }}
              >
                What you'll walk away with
              </p>
              <p
                className="text-sm sm:text-base font-light italic leading-relaxed max-w-xl mx-auto"
                style={{ color: "hsl(0 0% 100% / 0.85)" }}
              >
                {activation.promise}
              </p>
            </section>
          )}

          {/* Next-step CTA — Telegram for questions */}
          <section className="text-center pt-4 space-y-3">
            <p
              className="text-xs font-light"
              style={{ color: "hsl(0 0% 100% / 0.55)" }}
            >
              Questions or insight to share?
            </p>
            <a
              href="https://t.me/integralevolution"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105"
              style={{
                background: "hsl(0 0% 100% / 0.06)",
                border: "1px solid hsl(0 0% 100% / 0.15)",
                color: "hsl(0 0% 100% / 0.85)",
              }}
            >
              Reach Aleksandr on Telegram
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </section>

          <footer className="text-center pt-6">
            <Link
              to="/activations"
              className="inline-flex items-center gap-1.5 text-xs font-light hover:underline"
              style={{ color: "hsl(0 0% 100% / 0.5)" }}
            >
              <ArrowLeft className="w-3 h-3" />
              All Activations
            </Link>
          </footer>

        </div>
      </main>
    </>
  );
};

export default ActivationAccessPage;
