import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { localizedOrigin } from "@/i18n/localeScope";

/**
 * GuestSaveCard — «Save your character», inline, for a guest who has just played a module.
 * Same pattern as the Reception reveal (WP-7b, TopTalentAuthGate `inline`): the result and the
 * badge come first, the account is asked for only here, in one card, with one field.
 *
 * It sends a magic link; the guest's progress waits in this browser (src/lib/guestModule.ts)
 * and is carried into the account when the link brings them back to `next`.
 */

type Props = {
  /** Where the magic link returns the player. */
  next?: string;
  className?: string;
};

type Status = "idle" | "saving" | "sent" | "error";

const GuestSaveCard = ({ next = "/game/learn", className }: Props) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes("@")) return;
    setStatus("saving");
    setError(null);
    try {
      const emailRedirectTo = `${localizedOrigin()}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: linkError } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: { emailRedirectTo },
      });
      if (linkError) throw linkError;
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("It did not go through just now. Check the address and try again.");
    }
  };

  return (
    <div className={`flex items-center justify-center px-4 py-6${className ? ` ${className}` : ""}`}>
      <section
        aria-label="Save your character"
        className="w-full max-w-xl rounded-3xl px-6 py-8 sm:px-8 sm:py-10 text-center space-y-5"
        style={{
          background: "var(--skin-card-fill, rgba(255,255,255,0.88))",
          border: "1px solid var(--skin-rule-medium, rgba(122,81,8,0.18))",
          boxShadow: "0 22px 70px -38px rgba(10,22,40,0.65), 0 0 34px -18px rgba(212,175,55,0.85)",
          color: "var(--skin-text-primary, #0a1628)",
        }}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(212,175,55,0.14)]">
          <Sparkles className="h-5 w-5 text-[#7a5108]" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
            Save your character
          </h2>
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Keep your badge and your choice, and go on from here. We send you a link; there is no password.
          </p>
        </div>

        {status === "sent" ? (
          <div
            role="status"
            className="rounded-2xl px-5 py-4 text-sm leading-relaxed"
            style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.20)" }}
          >
            Check your inbox at <strong>{email.trim()}</strong>. Open the link and your badge will be waiting.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div
              className="flex items-center gap-3 rounded-full py-2.5 pl-5 pr-3"
              style={{
                background: "var(--skin-input-fill, rgba(255,255,255,0.72))",
                border: "1px solid var(--skin-hairline, rgba(26,30,58,0.14))",
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Your email"
                autoComplete="email"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--skin-text-primary, #0a1628)" }}
                required
              />
              <button
                type="submit"
                disabled={status === "saving" || !email.trim()}
                className="rounded-full px-4 py-2 text-xs font-semibold text-white transition-opacity disabled:opacity-50"
                style={{
                  backgroundImage: "linear-gradient(135deg, #a06d08 0%, #7a5108 100%)",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                {status === "saving" ? "Saving..." : "Save"}
              </button>
            </div>
            {status === "error" ? (
              <p role="alert" className="text-sm" style={{ color: "#b91c1c" }}>
                {error}
              </p>
            ) : null}
          </form>
        )}

        <p>
          <Link
            to="/village"
            className="text-sm underline underline-offset-4 transition-opacity hover:opacity-100"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: "var(--skin-text-muted, rgba(26,30,58,0.72))",
              textDecorationColor: "rgba(26,30,58,0.3)",
              opacity: 0.9,
            }}
          >
            Not now, back to the village
          </Link>
        </p>
      </section>
    </div>
  );
};

export default GuestSaveCard;
