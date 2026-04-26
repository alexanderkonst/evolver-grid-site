/**
 * RevealPage — public Top Talent reveal at /reveal/:slug
 *
 * Day 52 (Sasha 2026-04-26): the canonical shareable artifact for a
 * user's Top Talent reveal. Loads the snapshot via the public-safe
 * SECURITY DEFINER function `get_public_zog_snapshot(p_slug)` which
 * returns ONLY the Appleseed content + archetype fields — no AI raw
 * input, no resonance ratings, no profile linkage.
 *
 * Layout:
 *   • Above the fold — archetype name + bullseye + [Copy] + [Open my path →]
 *   • Below — progressive scroll: tagline · prime driver · three actions
 *     · life scene · mastery stages (+ "book a session" CTA) · roles ·
 *     complementary partner · [Download PDF]
 *
 * Removed from rendering vs. v1:
 *   ❌ Professional Activities, Monetization Avenues, Visual Codes,
 *      Elevator Pitch
 *
 * The PDF download here is a secondary action — the URL itself is the
 * primary shareable artifact (per Sasha's "Holonic Commons, free,
 * optional" framing).
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check, Download, ArrowRight, Loader2, ExternalLink, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateZogPdf } from "@/modules/zone-of-genius/generateZogPdf";
import type { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { toast } from "@/hooks/use-toast";

type PublicSnapshot = {
  share_slug: string;
  archetype_title: string;
  core_pattern: string;
  appleseed_data: AppleseedData | null;
  mastery_action: string | null;
  appleseed_generated_at: string | null;
  created_at: string;
};

const MASTERY_CTA_URL = "https://t.me/integralevolution";
const MASTERY_CTA_TEXT = "Accelerate your path of mastery — book a session with Aleksandr";

export default function RevealPage() {
  const { slug } = useParams<{ slug: string }>();
  const [snapshot, setSnapshot] = useState<PublicSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load via SECURITY DEFINER RPC — exposes only public-safe fields.
  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .rpc("get_public_zog_snapshot", { p_slug: slug });
      if (cancelled) return;
      if (error) {
        console.error("[RevealPage] load error:", error);
        setNotFound(true);
        setLoading(false);
        return;
      }
      const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (!row || !row.appleseed_data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setSnapshot(row as PublicSnapshot);
      setLoading(false);

      // Update document title for shareable previews
      const archetype = (row as PublicSnapshot).archetype_title;
      if (archetype) document.title = `${archetype} — Top Talent`;
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const onCopyBullseye = async () => {
    const apple = snapshot?.appleseed_data;
    const sentence = apple?.bullseyeSentence;
    if (!sentence) return;
    try {
      await navigator.clipboard.writeText(`I ${sentence}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast({ title: "Copied", description: "Bullseye sentence on your clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Select and copy manually.", variant: "destructive" });
    }
  };

  const onDownloadPdf = () => {
    if (!snapshot?.appleseed_data) return;
    try {
      generateZogPdf(snapshot.appleseed_data, null);
    } catch (e) {
      console.error("[RevealPage] PDF generation failed:", e);
      toast({ title: "PDF failed", description: "Try again or refresh the page.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0a1224] text-white/60">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading…
      </div>
    );
  }

  if (notFound || !snapshot?.appleseed_data) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0a1224] text-white px-4">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-2xl font-display">Reveal not found</h1>
          <p className="text-white/60 text-sm">
            This share link is invalid or has been removed.
          </p>
          <Button asChild variant="outline">
            <Link to="/">Back to Find Your Top Talent →</Link>
          </Button>
        </div>
      </div>
    );
  }

  const apple = snapshot.appleseed_data;
  const vk = apple.vibrationalKey;
  const lenses = apple.threeLenses;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#0a1224] via-[#10182f] to-[#070b18] text-white">
      <main className="mx-auto max-w-2xl px-5 py-12 sm:py-20 space-y-14">
        {/* ═══ Above the fold — recognition moment ═══ */}
        <header className="text-center space-y-6">
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/45">
            My Top Talent
          </p>
          <h1
            className="font-display italic font-normal tracking-[-0.02em] leading-[1.1]"
            style={{
              fontSize: "clamp(2rem, 7vw, 3.4rem)",
              background: "linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(242 40% 90%) 50%, hsl(290 30% 88%) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 40px rgba(132,96,234,0.45))",
            }}
          >
            {vk?.name || snapshot.archetype_title}
          </h1>

          {apple.bullseyeSentence && (
            <p
              className="font-display italic mx-auto max-w-[28ch] leading-snug"
              style={{
                fontSize: "clamp(1.05rem, 2.6vw, 1.4rem)",
                color: "hsl(0 0% 100% / 0.92)",
                textShadow: "0 0 18px rgba(132,96,234,0.35)",
              }}
            >
              I {apple.bullseyeSentence}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
            <button
              type="button"
              onClick={onCopyBullseye}
              className="inline-flex items-center gap-2 text-sm font-medium tracking-wide px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-[1.04]"
              style={{
                background: "linear-gradient(135deg, hsla(252, 70%, 70%, 0.30) 0%, hsla(242, 60%, 60%, 0.18) 100%)",
                border: "1px solid hsla(252, 60%, 80%, 0.42)",
                color: "hsl(0 0% 100%)",
                boxShadow: "0 6px 20px -8px rgba(132,96,234,0.5)",
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy bullseye"}
            </button>
            <Link
              to="/path"
              className="inline-flex items-center gap-2 text-sm font-medium tracking-wide px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-[1.04]"
              style={{
                background: "linear-gradient(135deg, hsla(40, 70%, 55%, 0.20) 0%, hsla(40, 60%, 45%, 0.10) 100%)",
                border: "1px solid hsla(40, 70%, 65%, 0.38)",
                color: "hsl(40 70% 92%)",
              }}
            >
              Open my path
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* ═══ Below the fold — progressive depth ═══ */}

        {/* Tagline (vibrational key) */}
        {(vk?.tagline || vk?.tagline_simple) && (
          <Card className="bg-white/[0.03] border-white/10 p-6 space-y-3">
            {vk?.tagline && (
              <p className="font-display italic text-lg leading-relaxed text-white/90">
                "{vk.tagline}"
              </p>
            )}
            {vk?.tagline_simple && (
              <p className="text-sm text-white/60 leading-relaxed">
                {vk.tagline_simple}
              </p>
            )}
          </Card>
        )}

        {/* Three lenses — actions, prime driver, archetype */}
        {lenses && (
          <div className="space-y-5">
            {lenses.actions?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/45 mb-3">
                  My actions
                </p>
                <div className="flex flex-wrap gap-2">
                  {lenses.actions.map((action, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 text-sm rounded-full bg-white/[0.06] border border-white/15 text-white/85"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {lenses.primeDriver && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/45 mb-2">
                  My prime driver
                </p>
                <p className="text-lg font-medium text-white/95">{lenses.primeDriver}</p>
                {lenses.primeDriver_meaning && (
                  <p className="mt-1 text-sm text-white/55 leading-relaxed">
                    {lenses.primeDriver_meaning}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Life Scene — italic narrative block */}
        {apple.lifeScene && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/45 mb-3">
              In the field
            </p>
            <blockquote
              className="font-display italic text-base sm:text-lg leading-relaxed text-white/85 border-l-2 border-white/20 pl-5"
            >
              {apple.lifeScene}
            </blockquote>
          </div>
        )}

        {/* Appreciated For — effect / scene / outcome blocks */}
        {apple.appreciatedFor && apple.appreciatedFor.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
              What I'm appreciated &amp; paid for
            </p>
            <div className="space-y-4">
              {apple.appreciatedFor.map((item, i) => (
                <Card key={i} className="bg-white/[0.03] border-white/10 p-5 space-y-1.5">
                  <p className="text-sm font-medium text-white/95">{item.effect}</p>
                  {item.scene && (
                    <p className="text-xs text-white/55 leading-relaxed">
                      <span className="uppercase tracking-wider text-white/35">Scene · </span>
                      {item.scene}
                    </p>
                  )}
                  {item.outcome && (
                    <p className="text-xs text-white/55 leading-relaxed">
                      <span className="uppercase tracking-wider text-white/35">Outcome · </span>
                      {item.outcome}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Mastery Stages — kept (Sasha: very powerful) + book-session CTA */}
        {apple.masteryStages && apple.masteryStages.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
              Path of mastery
            </p>
            <ol className="space-y-3">
              {apple.masteryStages.map((stage, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white/[0.08] border border-white/20 text-xs font-medium flex items-center justify-center text-white/80">
                    {stage.stage || i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/95">{stage.name}</p>
                    {stage.description && (
                      <p className="text-xs text-white/55 leading-relaxed mt-0.5">
                        {stage.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {/* Book-a-session CTA — direct path to Aleksandr's Telegram */}
            <a
              href={MASTERY_CTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 rounded-2xl px-5 py-4 transition-all hover:scale-[1.01]"
              style={{
                background: "linear-gradient(135deg, hsla(40, 70%, 55%, 0.18) 0%, hsla(40, 60%, 45%, 0.08) 100%)",
                border: "1px solid hsla(40, 70%, 65%, 0.40)",
              }}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-amber-300/85 flex-shrink-0" />
                <span className="flex-1 text-sm font-medium text-amber-100/95">
                  {MASTERY_CTA_TEXT}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-amber-300/70 flex-shrink-0" />
              </div>
            </a>
          </div>
        )}

        {/* Roles & Environments */}
        {apple.rolesEnvironments && (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
              Where I work best
            </p>
            <Card className="bg-white/[0.03] border-white/10 p-5 space-y-3 text-sm">
              {apple.rolesEnvironments.asCreator && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/45">As creator · </span>
                  <span className="text-white/85">{apple.rolesEnvironments.asCreator}</span>
                </div>
              )}
              {apple.rolesEnvironments.asContributor && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/45">As contributor · </span>
                  <span className="text-white/85">{apple.rolesEnvironments.asContributor}</span>
                </div>
              )}
              {apple.rolesEnvironments.asFounder && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/45">As founder · </span>
                  <span className="text-white/85">{apple.rolesEnvironments.asFounder}</span>
                </div>
              )}
              {apple.rolesEnvironments.environment && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/45">Ideal environment · </span>
                  <span className="text-white/85">{apple.rolesEnvironments.environment}</span>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Complementary Partner */}
        {apple.complementaryPartner && (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
              Best complementary partner
            </p>
            <Card className="bg-white/[0.03] border-white/10 p-5 space-y-3 text-sm">
              {apple.complementaryPartner.skillsWise && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/45">Skills · </span>
                  <span className="text-white/85">{apple.complementaryPartner.skillsWise}</span>
                </div>
              )}
              {apple.complementaryPartner.geniusWise && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/45">Genius · </span>
                  <span className="text-white/85">{apple.complementaryPartner.geniusWise}</span>
                </div>
              )}
              {apple.complementaryPartner.archetypeWise && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/45">Archetype · </span>
                  <span className="text-white/85">{apple.complementaryPartner.archetypeWise}</span>
                </div>
              )}
              {apple.complementaryPartner.synergy && (
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-white/45">Synergy · </span>
                  <span className="text-white/85 italic">{apple.complementaryPartner.synergy}</span>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Download PDF — secondary action */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={onDownloadPdf}
            className="inline-flex items-center gap-2 text-xs font-medium tracking-wide px-5 py-2.5 rounded-full text-white/70 hover:text-white border border-white/15 hover:border-white/30 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Download as PDF
          </button>
        </div>

        {/* Footer */}
        <footer className="pt-8 text-center text-xs text-white/35">
          <a
            href="https://aleksandrkonstantinov.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60 transition-colors"
          >
            aleksandrkonstantinov.com
          </a>
        </footer>
      </main>
    </div>
  );
}
