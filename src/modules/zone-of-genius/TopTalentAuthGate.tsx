import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Mail, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { localizedOrigin } from "@/i18n/localeScope";

type TopTalentAuthGateProps = {
  resultPayload: Record<string, unknown>;
  assessmentVersion?: string;
};

const PENDING_CLAIM_EMAIL_KEY = "pending_claim_email";

const TopTalentAuthGate = ({
  resultPayload,
  assessmentVersion = "v1",
}: TopTalentAuthGateProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pendingEmail = window.sessionStorage.getItem(PENDING_CLAIM_EMAIL_KEY);
    if (pendingEmail) setEmail(pendingEmail);
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) return;

    setStatus("saving");
    setError(null);

    try {
      const { data, error: saveError } = await supabase.functions.invoke("save-anonymous-zog", {
        body: {
          email: normalizedEmail,
          result_payload: resultPayload,
          assessment_version: assessmentVersion,
        },
      });

      if (saveError || !(data as { ok?: boolean } | null)?.ok) {
        throw saveError ?? new Error("Could not save your Top Talent result.");
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(PENDING_CLAIM_EMAIL_KEY, normalizedEmail);
      }

      const emailRedirectTo = `${localizedOrigin()}/auth/callback?next=${encodeURIComponent("/zone-of-genius")}`;
      const { error: linkError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { emailRedirectTo },
      });
      if (linkError) throw linkError;

      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Please try again.");
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-5 py-12">
      <div
        className="w-full max-w-xl rounded-3xl px-6 py-8 sm:px-8 sm:py-10 text-center space-y-6"
        style={{
          background: "var(--skin-card-fill, rgba(255,255,255,0.88))",
          border: "1px solid var(--skin-rule-medium, rgba(122,81,8,0.18))",
          boxShadow: "0 22px 70px -38px rgba(10,22,40,0.65), 0 0 34px -18px rgba(212,175,55,0.85)",
          color: "var(--skin-text-primary, #0a1628)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(212,175,55,0.14)]">
          <Sparkles className="h-5 w-5 text-[#7a5108]" />
        </div>

        <div className="space-y-3">
          <p
            className="text-xs uppercase"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              letterSpacing: "0.18em",
              color: "rgba(122,81,8,0.88)",
            }}
          >
            Your result is ready
          </p>
          <h1
            className="text-3xl sm:text-4xl leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
            }}
          >
            Save it before we reveal it.
          </h1>
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: "var(--skin-text-muted, rgba(26,30,58,0.72))",
            }}
          >
            No charge for the result. We will send two very short follow-up emails
            inviting you to go deeper. If you do not react, we stop.
          </p>
        </div>

        {status === "sent" ? (
          <div
            className="rounded-2xl px-5 py-4 text-sm leading-relaxed"
            style={{
              background: "rgba(16,185,129,0.10)",
              border: "1px solid rgba(16,185,129,0.20)",
              color: "var(--skin-text-primary, #0a1628)",
            }}
          >
            Check your inbox at <strong>{email.trim()}</strong>. Open the magic link
            and your Top Talent will appear.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2.5"
              style={{
                background: "var(--skin-input-fill, rgba(255,255,255,0.72))",
                border: "1px solid var(--skin-hairline, rgba(26,30,58,0.14))",
              }}
            >
              <Mail className="h-4 w-4 shrink-0 text-[rgba(122,81,8,0.76)]" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your@email.com"
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
                {status === "saving" ? "Saving..." : "Reveal"}
              </button>
            </div>
            {status === "error" && (
              <p className="text-sm text-red-700">{error ?? "Please try again."}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default TopTalentAuthGate;
