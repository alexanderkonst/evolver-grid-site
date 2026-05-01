/**
 * AiOsSpotlight — the headline section of /ai-os.
 *
 * Day 53 (Sasha 2026-04-27): the AI OS install prompt is THE thing. It used
 * to live as one card among many in the prompt grid; now it gets its own
 * spotlight section right under the hero, with:
 *
 *   1. An ultra-concise instruction (Sasha's framing problem: easy to install
 *      a permanent upgrade and then NORMALIZE it without noticing). The
 *      experiment protocol below is the antidote.
 *   2. A primary [Copy AI OS install] button (the actual paste).
 *   3. A self-experiment protocol (ask the test prompt before AND after
 *      install — feel the difference) with its own [Copy test prompt] button.
 *   4. A reveal-on-copy 1-10 rating section that writes to `resonance_events`
 *      so Sasha gets empirical replication data rather than vibes.
 *
 * Anonymous-friendly: anon visitors get a stable client_session_id from
 * localStorage; authenticated visitors get profile_id + user_id linkage.
 *
 * The everything-else (suite fusions, individual prompts) is reframed below
 * this section as "additional power-ups · select prompts for everyday craft".
 */

import { useEffect, useRef, useState } from "react";
import { Copy, Check, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { getAnonClientId } from "@/lib/anonClientId";

const TEST_PROMPT_EN =
  "Based on everything you know about me, what are the optimal actions you recommend for me in the short-, medium-, and long-term horizons? Answer with one sentence for each horizon.";

type Props = {
  /** The full AI OS install prompt content that gets copied to clipboard. */
  installPromptContent: string;
};

const ratingTier = (rating: number): "resonant" | "partial" | "off" => {
  if (rating >= 8) return "resonant";
  if (rating >= 5) return "partial";
  return "off";
};

export default function AiOsSpotlight({ installPromptContent }: Props) {
  const [installCopied, setInstallCopied] = useState(false);
  const [testCopied, setTestCopied] = useState(false);

  // Reveal-on-copy: rating section opens after the user copies the install.
  const [showRating, setShowRating] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [submittedRating, setSubmittedRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const ratingRef = useRef<HTMLDivElement>(null);

  // Smooth scroll the rating section into view when it first reveals so
  // people on smaller viewports notice the call to feedback.
  useEffect(() => {
    if (showRating && ratingRef.current) {
      ratingRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [showRating]);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for older Safari / iframe contexts where clipboard is
      // blocked. Use the legacy execCommand path.
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  };

  const onCopyInstall = async () => {
    // Reveal the rating section the moment the user CLICKS the button —
    // not only on copy-success. Clipboard can fail silently in iframes /
    // strict secure contexts, and the click itself is the real engagement
    // signal we want to honor. The copy-confirmation badge still flips
    // only on success so honest signaling stays intact.
    setShowRating(true);
    const ok = await copyToClipboard(installPromptContent);
    if (ok) {
      setInstallCopied(true);
      setTimeout(() => setInstallCopied(false), 2400);
    }
  };

  const onCopyTest = async () => {
    const ok = await copyToClipboard(TEST_PROMPT_EN);
    if (!ok) return;
    setTestCopied(true);
    setTimeout(() => setTestCopied(false), 2400);
  };

  const onSubmitRating = async (rating: number) => {
    if (submitting || submittedRating !== null) return;
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const profileId = user ? await getOrCreateGameProfileId() : null;

      const payload = {
        profile_id: profileId,
        user_id: user?.id ?? null,
        client_session_id: getAnonClientId(),
        artifact_kind: "ai_os_install",
        rating,
        tier: ratingTier(rating),
        message_seen: "AI OS self-experiment — before/after rating",
        matrix_source: "master",
        context_json: {
          page: "/ai-os",
          flow: "spotlight_self_experiment",
          authenticated: !!user,
        },
      };

      const { error } = await (supabase as any)
        .from("resonance_events")
        .insert(payload);

      if (error) {
        // Soft-fail: still mark submitted so the user gets thank-you UI.
        // The data point is lost but we don't punish them for it; the
        // event is fire-and-forget telemetry, not a blocker.
        console.error("[AiOsSpotlight] resonance_events insert failed:", error);
      }
      setSubmittedRating(rating);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="ai-os-spotlight-heading"
      // Day 55 (Sasha 2026-04-29): `liquid-glass-strong` retired here.
      // Its `backdrop-filter: blur(30px) saturate(200%)` was creating a
      // viewport-sized GPU compositing layer on the page's full
      // fixed-position background. On Chrome desktop, when the user
      // scrolled this section into view, the backdrop-filter's stacking
      // context caused the sibling sticky panes (rail + sections list,
      // z-30) to drop out of the render tree — Sasha saw "panes vanish
      // and page gets stuck on the spotlight." Replaced with an opaque
      // dark frosted background that gives the same editorial weight
      // without the backdrop-filter cost or the rendering bug.
      className="rounded-3xl px-6 py-8 sm:px-10 sm:py-12 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(20, 28, 56, 0.92) 0%, rgba(14, 22, 44, 0.96) 100%)",
        border: "0.5px solid hsla(0, 0%, 100%, 0.10)",
        // Day 55 (Sasha 2026-04-29): gold rim/glow box-shadow stack
        // retired. The 1px gold rim was rendering as an unexplained
        // "gold line" on mobile (and was a confounder during the panes-
        // vanish desktop bug hunt). Section now relies on its dark
        // gradient bg + subtle white border for definition; gold accents
        // moved into the section's content (eyebrow, ratings) where
        // they belong.
        boxShadow: "inset 0 1px 0 hsla(0, 0%, 100%, 0.10)",
      }}
    >
      {/* Soft gold luminous accent — signals "this is THE thing" without
          shouting. Sits beneath the content; pointer-events-none. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsla(40, 70%, 60%, 0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative space-y-6">
        {/* Eyebrow — explicitly says "read this" per Sasha */}
        <p
          className="text-[10px] sm:text-xs uppercase tracking-[0.32em] font-medium"
          style={{
            color: "hsl(40 70% 80% / 0.92)",
            textShadow: "0 0 14px rgba(244,212,114,0.35), 0 0 12px rgba(0,0,0,0.85)",
          }}
        >
          Read this · 30 seconds
        </p>

        {/* Headline */}
        <h2
          id="ai-os-spotlight-heading"
          className="font-display italic font-normal leading-[1.1] tracking-[-0.01em]"
          style={{
            fontSize: "clamp(1.7rem, 4.6vw, 2.6rem)",
            color: "hsl(0 0% 100%)",
            textShadow:
              "0 0 40px rgba(132,96,234,0.40), 0 0 80px rgba(180,140,255,0.18), 0 2px 8px rgba(0,0,0,0.9)",
          }}
        >
          One paste. Permanent AI upgrade.
        </h2>

        {/* Body — ultra concise per Sasha */}
        <p
          className="text-base sm:text-lg leading-relaxed max-w-2xl"
          style={{
            color: "hsl(0 0% 100% / 0.92)",
            textShadow: "0 0 14px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.7)",
          }}
        >
          Paste into a fresh AI chat. Same input you'd give — higher quality
          output. Faster on everyday tasks, deeper on complex ones. (Unless
          AI is new to you — build a baseline first.)
        </p>

        {/* Soft divider */}
        <div
          aria-hidden="true"
          className="h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, hsla(40, 70%, 65%, 0.30) 50%, transparent 100%)",
          }}
        />

        {/* EXPERIMENT — Day 54 (Sasha 2026-04-28): leads now. Install button
            lives inside Step 2 of the protocol so people can't grab the paste
            and skip the calibration. The whole flow IS the experiment. */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <p
              className="text-[10px] sm:text-xs uppercase tracking-[0.28em] font-medium"
              style={{
                color: "hsl(252 50% 85% / 0.85)",
                textShadow: "0 0 12px rgba(132,96,234,0.35), 0 0 12px rgba(0,0,0,0.85)",
              }}
            >
              You'll know in 60 seconds
            </p>
            <p
              className="text-sm sm:text-base leading-relaxed max-w-2xl"
              style={{ color: "hsl(0 0% 100% / 0.85)", textShadow: "0 0 12px rgba(0,0,0,0.7)" }}
            >
              One prompt. Run it now, install the system prompt, run it
              again. You'll feel the shift.
            </p>
          </div>

          {/* Step 1 — paste the test prompt in current AI */}
          <div className="space-y-3">
            <ExperimentStep n={1}>
              In your current AI, paste this prompt. Read the response.
            </ExperimentStep>
            <div
              className="rounded-2xl p-4 sm:p-5 space-y-3"
              style={{
                background: "hsla(0, 0%, 100%, 0.04)",
                border: "1px solid hsla(0, 0%, 100%, 0.10)",
              }}
            >
              <p
                className="font-display italic text-sm sm:text-base leading-relaxed"
                style={{ color: "hsl(0 0% 100% / 0.92)" }}
              >
                "{TEST_PROMPT_EN}"
              </p>
              <button
                type="button"
                onClick={onCopyTest}
                className="inline-flex items-center gap-2 text-xs font-medium tracking-wide px-4 py-2 rounded-full transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background: "hsla(0, 0%, 100%, 0.08)",
                  border: "1px solid hsla(0, 0%, 100%, 0.20)",
                  color: "hsl(0 0% 100% / 0.90)",
                }}
                aria-label="Copy the test prompt to clipboard"
              >
                {testCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {testCopied ? "Copied" : "Copy test prompt"}
              </button>
            </div>
          </div>

          {/* Step 2 — install AI OS in a new chat, run the same prompt */}
          <div className="space-y-3">
            <ExperimentStep n={2}>
              Open a <strong>new chat</strong>. Paste the system prompt.
              It's a fascinating read, if you like. Then run the same
              prompt again.
            </ExperimentStep>
            <div>
              <button
                type="button"
                onClick={onCopyInstall}
                className="inline-flex items-center gap-2.5 text-base font-medium tracking-wide px-7 py-3.5 rounded-full transition-all duration-300 hover:scale-[1.04] active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, hsla(40, 75%, 60%, 0.32) 0%, hsla(252, 70%, 70%, 0.28) 50%, hsla(40, 75%, 60%, 0.32) 100%)",
                  border: "1px solid hsla(40, 75%, 70%, 0.55)",
                  color: "hsl(0 0% 100%)",
                  textShadow: "0 0 14px rgba(244,212,114,0.5), 0 1px 4px rgba(0,0,0,0.5)",
                  boxShadow:
                    "0 0 0 1px hsla(40, 75%, 75%, 0.20), 0 10px 32px -8px rgba(244,212,114,0.5), 0 0 48px -12px rgba(244,212,114,0.4)",
                }}
                aria-label="Copy the AI OS system prompt v5.2 to clipboard"
              >
                {installCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {installCopied ? "Copied — paste into a new AI chat" : "Copy the AI OS system prompt v5.2"}
              </button>
            </div>
          </div>

          {/* Step 3 — compare */}
          <div>
            <ExperimentStep n={3}>
              Compare. Notice what's different.
            </ExperimentStep>
          </div>
        </div>

        {/* RATING — revealed only after the user copies the install.
            Reveals because (a) until they copy, they can't have an
            opinion, (b) progressive disclosure keeps the spotlight tight. */}
        {showRating && (
          <div
            ref={ratingRef}
            className="pt-2 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div
              aria-hidden="true"
              className="h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, hsla(252, 60%, 75%, 0.28) 50%, transparent 100%)",
              }}
            />
            <div className="space-y-1.5">
              <p
                className="text-[10px] sm:text-xs uppercase tracking-[0.28em] font-medium"
                style={{
                  color: "hsl(252 50% 85% / 0.85)",
                  textShadow: "0 0 12px rgba(132,96,234,0.35), 0 0 12px rgba(0,0,0,0.85)",
                }}
              >
                How did it go?
              </p>
              <p
                className="text-sm sm:text-base leading-relaxed max-w-2xl"
                style={{ color: "hsl(0 0% 100% / 0.78)", textShadow: "0 0 12px rgba(0,0,0,0.7)" }}
              >
                Compare the two responses. Rate the difference.
              </p>
            </div>

            {submittedRating !== null ? (
              <SubmittedThanks rating={submittedRating} />
            ) : (
              <RatingScale
                hovered={hoveredRating}
                onHover={setHoveredRating}
                onSelect={onSubmitRating}
                disabled={submitting}
              />
            )}

            <p
              className="text-[11px] sm:text-xs leading-relaxed"
              style={{ color: "hsl(0 0% 100% / 0.50)" }}
            >
              <strong style={{ color: "hsl(0 0% 100% / 0.70)" }}>10</strong> = significantly more useful response ·{" "}
              <strong style={{ color: "hsl(0 0% 100% / 0.70)" }}>1</strong> = no difference noticed
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ───── Sub-components ──────────────────────────────────────────

const ExperimentStep = ({
  n,
  children,
}: {
  n: number;
  children: React.ReactNode;
}) => (
  <li className="flex gap-3">
    <span
      className="flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center mt-0.5"
      style={{
        background:
          "linear-gradient(135deg, hsla(40, 75%, 60%, 0.32) 0%, hsla(40, 65%, 50%, 0.18) 100%)",
        border: "1px solid hsla(40, 70%, 65%, 0.45)",
        color: "hsl(40 80% 88%)",
        textShadow: "0 0 6px rgba(244,212,114,0.4)",
      }}
    >
      {n}
    </span>
    <span className="flex-1" style={{ textShadow: "0 0 12px rgba(0,0,0,0.7)" }}>
      {children}
    </span>
  </li>
);

const RatingScale = ({
  hovered,
  onHover,
  onSelect,
  disabled,
}: {
  hovered: number | null;
  onHover: (n: number | null) => void;
  onSelect: (n: number) => void;
  disabled: boolean;
}) => {
  const numbers = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <div
      className="flex flex-wrap gap-1.5 sm:gap-2"
      onMouseLeave={() => onHover(null)}
      role="radiogroup"
      aria-label="Rate the difference between before and after AI OS install, 1 to 10"
    >
      {numbers.map((n) => {
        const active = hovered !== null ? n <= hovered : false;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onMouseEnter={() => onHover(n)}
            onClick={() => onSelect(n)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed tabular-nums"
            style={{
              background: active
                ? "linear-gradient(135deg, hsla(252, 70%, 65%, 0.45) 0%, hsla(40, 75%, 60%, 0.35) 100%)"
                : "hsla(0, 0%, 100%, 0.06)",
              border: active
                ? "1px solid hsla(252, 70%, 80%, 0.55)"
                : "1px solid hsla(0, 0%, 100%, 0.18)",
              color: active ? "hsl(0 0% 100%)" : "hsl(0 0% 100% / 0.85)",
              boxShadow: active
                ? "0 0 14px -2px rgba(132,96,234,0.45), 0 0 24px -6px rgba(244,212,114,0.35)"
                : undefined,
            }}
            aria-label={`Rate ${n} out of 10`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
};

const SubmittedThanks = ({ rating }: { rating: number }) => (
  <div
    className="rounded-2xl p-4 sm:p-5 flex items-start gap-3"
    style={{
      background:
        "linear-gradient(135deg, hsla(252, 60%, 65%, 0.18) 0%, hsla(40, 70%, 55%, 0.12) 100%)",
      border: "1px solid hsla(252, 60%, 70%, 0.32)",
    }}
  >
    <Sparkles
      className="w-5 h-5 flex-shrink-0 mt-0.5"
      style={{ color: "hsl(252 60% 80%)" }}
      aria-hidden="true"
    />
    <div className="space-y-1">
      <p
        className="text-sm sm:text-base font-medium"
        style={{ color: "hsl(0 0% 100% / 0.95)" }}
      >
        Thank you. Logged as <strong>{rating} / 10</strong>.
      </p>
      <p
        className="text-xs sm:text-sm leading-relaxed"
        style={{ color: "hsl(0 0% 100% / 0.70)" }}
      >
        Your data point joins the open replication pool. The benchmark gets
        sharper every time someone runs this.
      </p>
    </div>
  </div>
);
