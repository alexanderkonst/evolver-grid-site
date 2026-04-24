/**
 * PublicLandingPage — world-readable Landing Page served at /ubl/:slugWithVersion.
 *
 * Fetches the row from unique_business_dossiers by slug and renders the
 * landing_page artifact content as a marketing surface.
 *
 * Public surfaces use the brandbook dark-surface aesthetic (per Phase 3 decision).
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type LandingPageContent = {
  headline?: string;
  subheadline?: string;
  pain_section?: string;
  promise_section?: string;
  proof_section?: string[];
  value_ladder_section?: string;
  cta?: { text?: string; mechanism?: string; url?: string };
  meta?: { slug?: string; og_image?: string };
};

type DossierRow = {
  id: string;
  slug: string;
  title: string;
  artifact_snapshot: Record<string, { version: number; content: unknown; specificity_score: number }>;
  landing_page_version: string | null;
  published_at: string;
  is_live: boolean;
};

export default function PublicLandingPage() {
  const { slugWithVersion } = useParams<{ slugWithVersion: string }>();
  const [dossier, setDossier] = useState<DossierRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      if (!slugWithVersion) return;
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("unique_business_dossiers")
        .select("*")
        .eq("slug", slugWithVersion)
        .eq("is_live", true)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
      } else {
        setDossier(data as DossierRow);
      }
      setLoading(false);
    })();
  }, [slugWithVersion]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-sm text-white/60">Loading…</div>
      </div>
    );
  }

  if (notFound || !dossier) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-medium">Page not found</h1>
          <p className="mt-2 text-sm text-white/60">
            This landing page may have been unpublished or never existed.
          </p>
        </div>
      </div>
    );
  }

  const landingEntry = dossier.artifact_snapshot?.landing_page;
  const landing = (landingEntry?.content || {}) as LandingPageContent;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white">
      <main className="mx-auto max-w-3xl px-6 py-20 space-y-12">
        {/* Hero */}
        {landing.headline && (
          <section className="space-y-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
              {landing.headline}
            </h1>
            {landing.subheadline && (
              <p className="mx-auto max-w-2xl text-lg text-white/70 leading-relaxed">
                {landing.subheadline}
              </p>
            )}
          </section>
        )}

        {/* Pain */}
        {landing.pain_section && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="whitespace-pre-wrap text-base leading-relaxed text-white/85">
              {landing.pain_section}
            </div>
          </section>
        )}

        {/* Promise */}
        {landing.promise_section && (
          <section className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
              What this makes possible
            </h2>
            <div className="whitespace-pre-wrap text-lg leading-relaxed">
              {landing.promise_section}
            </div>
          </section>
        )}

        {/* Proof */}
        {landing.proof_section && landing.proof_section.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
              Proof
            </h2>
            <div className="space-y-3">
              {landing.proof_section.map((p, i) => (
                <blockquote
                  key={i}
                  className="rounded-lg border-l-2 border-white/30 bg-white/5 px-5 py-3 text-base italic text-white/85"
                >
                  {p}
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* Value ladder */}
        {landing.value_ladder_section && (
          <section className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
              Options
            </h2>
            <div className="whitespace-pre-wrap text-base leading-relaxed text-white/85">
              {landing.value_ladder_section}
            </div>
          </section>
        )}

        {/* CTA */}
        {landing.cta && (
          <section className="pt-4 text-center">
            {landing.cta.url ? (
              <a
                href={landing.cta.url}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-base font-medium text-black transition-transform hover:scale-[1.02]"
              >
                {landing.cta.text || "Get started"}
              </a>
            ) : (
              <div className="rounded-full bg-white/10 px-7 py-3 text-base font-medium inline-block">
                {landing.cta.text || "Get started"}
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="pt-12 border-t border-white/10 text-xs text-white/40 text-center">
          Published {new Date(dossier.published_at).toLocaleDateString()} · {dossier.landing_page_version}
        </footer>
      </main>
    </div>
  );
}
