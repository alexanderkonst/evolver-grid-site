import { useState, useEffect, useCallback } from "react";
import { Check, ArrowLeft } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { supabase } from "@/integrations/supabase/client";

/**
 * /feedback — Post-session testimonial collection page.
 * 
 * Dark glass aesthetic. No auth required.
 * Submitted testimonials go to `session_testimonials` table (pending admin approval).
 * 
 * This is a RECEPTIVITY component — it enables the system to RECEIVE social proof
 * from encounters, advancing P6 (Data Signal) and P7 (Movement Formation).
 */

type FormState = "form" | "submitting" | "submitted";

const SESSION_TYPES = [
  { value: "ignition", label: "Ignition Session (90 min)" },
  { value: "build", label: "The Build (multi-session)" },
  { value: "group", label: "Group Build" },
  { value: "other", label: "Other" },
];

export default function FeedbackPage() {
  const [state, setState] = useState<FormState>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sessionType, setSessionType] = useState("ignition");
  const [shortQuote, setShortQuote] = useState("");
  const [fullQuote, setFullQuote] = useState("");
  const [beforeState, setBeforeState] = useState("");

  useEffect(() => {
    document.title = "Share Your Experience | Genius Business";
    return () => { document.title = "Genius Business"; };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !shortQuote.trim()) return;

    setState("submitting");

    try {
      const { error } = await (supabase as any)
        .from("session_testimonials")
        .insert({
          name: name.trim(),
          email: email.trim() || null,
          short_quote: shortQuote.trim(),
          full_quote: fullQuote.trim() || null,
          session_type: sessionType,
          before_state: beforeState.trim() || null,
          is_approved: false,
          is_featured: false,
        });

      if (error) {
        console.error("[Feedback] Submit error:", error);
        // Still show success — we don't want to burden the user with our DB issues
      }

      setState("submitted");
    } catch {
      // Graceful degradation
      setState("submitted");
    }
  }, [name, email, shortQuote, fullQuote, sessionType, beforeState]);

  // ─── Submitted state ─────────────────────────────────

  if (state === "submitted") {
    return (
      <GameShellV2 hideNavigation>
        <div className="fixed inset-0 z-0 bg-[#0a0a1a]">
          <img src="/gradient.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
          <div className="absolute inset-0 bg-[#0a0a1a]/65 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 min-h-dvh flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 animate-in zoom-in duration-500">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>

          <h1
            className="text-2xl sm:text-3xl font-display font-semibold text-white mb-4"
            style={{ textShadow: "0 0 30px rgba(255,255,255,0.15)" }}
          >
            Thank you, {name}.
          </h1>

          <p
            className="text-base text-white/50 max-w-md leading-relaxed mb-10"
            style={{ fontFamily: "'Source Serif 4', serif" }}
          >
            Your words will help someone else recognize their own genius.
            That's the real gift.
          </p>

          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </a>
        </div>
      </GameShellV2>
    );
  }

  // ─── Form state ───────────────────────────────────────

  return (
    <GameShellV2 hideNavigation>
      <div className="fixed inset-0 z-0 bg-[#0a0a1a]">
        <img src="/gradient.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-[#0a0a1a]/65 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 p-5 lg:p-10 pt-16 lg:pt-20 max-w-lg mx-auto min-h-dvh">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full overflow-hidden mb-5 ring-1 ring-white/10 breathing-card">
            <img src="/dodecahedron.png" alt="" className="w-full h-full object-cover" aria-hidden="true" />
          </div>

          <h1
            className="text-2xl sm:text-3xl font-display font-semibold text-white mb-3"
            style={{ textShadow: "0 0 30px rgba(255,255,255,0.15)" }}
          >
            What happened in your session?
          </h1>

          <p className="text-sm text-white/35 max-w-sm mx-auto leading-relaxed">
            Your honest experience — in a few sentences.
            <br />
            No polish needed. The raw truth is always the most powerful.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-1.5 block">
              Your name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name or full name"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] backdrop-blur-sm
                         border border-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/10
                         text-white/80 text-sm placeholder:text-white/15
                         transition-all duration-300 outline-none"
            />
          </div>

          {/* Email (optional) */}
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-1.5 block">
              Email <span className="text-white/15">(optional — if you'd like a copy)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] backdrop-blur-sm
                         border border-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/10
                         text-white/80 text-sm placeholder:text-white/15
                         transition-all duration-300 outline-none"
            />
          </div>

          {/* Session type */}
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-1.5 block">
              Session type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SESSION_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setSessionType(t.value)}
                  className={`px-3 py-2.5 rounded-xl text-xs transition-all duration-200 border
                    ${sessionType === t.value
                      ? "border-white/20 bg-white/[0.06] text-white/80"
                      : "border-white/5 bg-white/[0.02] text-white/30 hover:border-white/10 hover:text-white/50"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Before state */}
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-1.5 block">
              Before the session, I was... <span className="text-white/15">(optional)</span>
            </label>
            <input
              type="text"
              value={beforeState}
              onChange={(e) => setBeforeState(e.target.value)}
              placeholder="e.g., stuck, confused, overthinking, giving it away for free..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] backdrop-blur-sm
                         border border-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/10
                         text-white/80 text-sm placeholder:text-white/15
                         transition-all duration-300 outline-none"
            />
          </div>

          {/* Short quote (required) */}
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-1.5 block">
              The one thing you'd tell someone considering this *
            </label>
            <textarea
              value={shortQuote}
              onChange={(e) => setShortQuote(e.target.value)}
              placeholder="1-2 sentences. What changed? What did you walk away with?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] backdrop-blur-sm
                         border border-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/10
                         text-white/80 text-sm placeholder:text-white/15
                         transition-all duration-300 outline-none resize-none"
            />
          </div>

          {/* Full quote (optional) */}
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-1.5 block">
              The full story <span className="text-white/15">(optional — as much or as little as you want)</span>
            </label>
            <textarea
              value={fullQuote}
              onChange={(e) => setFullQuote(e.target.value)}
              placeholder="What was happening before? What shifted? What's different now?"
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] backdrop-blur-sm
                         border border-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/10
                         text-white/80 text-sm placeholder:text-white/15
                         transition-all duration-300 outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={state === "submitting" || !name.trim() || !shortQuote.trim()}
            className={`w-full liquid-glass-strong rounded-2xl px-8 py-5
                       text-white font-bold text-base tracking-wider uppercase
                       ring-1 ring-white/25
                       shadow-[0_0_40px_rgba(240,194,127,0.15),0_0_80px_rgba(132,96,234,0.1)]
                       hover:shadow-[0_0_60px_rgba(240,194,127,0.25),0_0_100px_rgba(132,96,234,0.2)]
                       hover:scale-[1.02] active:scale-95
                       transition-all duration-300 ease-out
                       disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none
                       ${name.trim() && shortQuote.trim() ? "alive-card" : ""}`}
            style={{ textShadow: "0 0 20px rgba(240,194,127,0.3)" }}
          >
            {state === "submitting" ? "Submitting..." : "Share your experience"}
          </button>

          {/* Privacy note */}
          <p className="text-[10px] text-white/15 text-center leading-relaxed">
            Your testimonial will be reviewed before being shared publicly.
            <br />
            We'll never share your email.
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-8 pb-10">
          <a
            href="/"
            className="text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </GameShellV2>
  );
}
