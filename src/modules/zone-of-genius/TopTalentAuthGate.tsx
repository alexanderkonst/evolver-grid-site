import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { localizedOrigin } from "@/i18n/localeScope";

type TopTalentAuthGateProps = {
  resultPayload: Record<string, unknown>;
  assessmentVersion?: string;
};

const PENDING_CLAIM_EMAIL_KEY = "pending_claim_email";
const PENDING_CLAIM_SAVED_EMAIL_KEY = "pending_claim_saved_email";

type SaveAnonymousZogResponse = {
  ok?: boolean;
  error?: string;
  retry_after_seconds?: number;
};

const parseRetryAfterSeconds = (message: string): number | null => {
  const match = message.match(/after\s+(\d+)\s+seconds?/i);
  if (!match?.[1]) return null;
  const seconds = Number.parseInt(match[1], 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
};

const readFunctionErrorPayload = async (
  error: unknown,
): Promise<SaveAnonymousZogResponse | null> => {
  const context =
    error && typeof error === "object" && "context" in error
      ? (error as { context?: unknown }).context
      : null;

  if (!(context instanceof Response)) return null;

  try {
    return (await context.clone().json()) as SaveAnonymousZogResponse;
  } catch {
    return null;
  }
};

const TopTalentAuthGate = ({
  resultPayload,
  assessmentVersion = "v1",
}: TopTalentAuthGateProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "sent" | "cooldown" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pendingEmail = window.sessionStorage.getItem(PENDING_CLAIM_EMAIL_KEY);
    if (pendingEmail) setEmail(pendingEmail);
  }, []);

  useEffect(() => {
    if (status !== "cooldown" || retryAfterSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      setRetryAfterSeconds((seconds) => {
        const next = Math.max(0, seconds - 1);
        if (next === 0) {
          setStatus("idle");
          setError(null);
        }
        return next;
      });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [retryAfterSeconds, status]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) return;

    setStatus("saving");
    setError(null);

    try {
      const alreadySavedForEmail =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(PENDING_CLAIM_SAVED_EMAIL_KEY) === normalizedEmail;

      if (!alreadySavedForEmail) {
        const { data, error: saveError } = await supabase.functions.invoke("save-anonymous-zog", {
          body: {
            email: normalizedEmail,
            result_payload: resultPayload,
            assessment_version: assessmentVersion,
          },
        });

        const errorPayload = saveError
          ? await readFunctionErrorPayload(saveError)
          : null;
        const saveResponse = (data ?? errorPayload) as SaveAnonymousZogResponse | null;

        if (
          saveResponse?.error === "rate_limited" &&
          typeof saveResponse.retry_after_seconds === "number"
        ) {
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(PENDING_CLAIM_EMAIL_KEY, normalizedEmail);
            window.sessionStorage.setItem(PENDING_CLAIM_SAVED_EMAIL_KEY, normalizedEmail);
          }
        } else if (saveError || !saveResponse?.ok) {
          throw new Error("Could not save your Top Talent result. Please try again.");
        }
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(PENDING_CLAIM_EMAIL_KEY, normalizedEmail);
        window.sessionStorage.setItem(PENDING_CLAIM_SAVED_EMAIL_KEY, normalizedEmail);
      }

      const emailRedirectTo = `${localizedOrigin()}/auth/callback?next=${encodeURIComponent("/zone-of-genius")}`;
      const { error: linkError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { emailRedirectTo },
      });
      if (linkError) {
        const retryAfter = parseRetryAfterSeconds(linkError.message);
        if (retryAfter) {
          setRetryAfterSeconds(retryAfter);
          setStatus("cooldown");
          setError(
            "Your result is saved. Email security allows one magic-link request per minute. Try Reveal again when the timer finishes.",
          );
          return;
        }
        throw linkError;
      }

      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error &&
          !err.message.includes("Edge Function returned a non-2xx status code")
          ? err.message
          : "Something went wrong saving your result. Please try again.",
      );
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
              className="flex items-center gap-3 rounded-full py-2.5 pl-5 pr-3"
              style={{
                background: "var(--skin-input-fill, rgba(255,255,255,0.72))",
                border: "1px solid var(--skin-hairline, rgba(26,30,58,0.14))",
              }}
            >
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
                disabled={status === "saving" || status === "cooldown" || !email.trim()}
                className="rounded-full px-4 py-2 text-xs font-semibold text-white transition-opacity disabled:opacity-50"
                style={{
                  backgroundImage: "linear-gradient(135deg, #a06d08 0%, #7a5108 100%)",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                {status === "saving"
                  ? "Saving..."
                  : status === "cooldown"
                    ? `Wait ${retryAfterSeconds}s`
                    : "Reveal"}
              </button>
            </div>
            {(status === "error" || status === "cooldown") && (
              <p
                className="text-sm"
                style={{
                  color: status === "cooldown" ? "#7a5108" : "#b91c1c",
                }}
              >
                {error ?? "Please try again."}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default TopTalentAuthGate;
