/**
 * /bring-your-module: short partner intake form «Bring your module» (issues #383, #404).
 * Spec: docs/02-strategy/modular_collaboration/partner_intake.md; terms wording from partner_offer.md v2.1.
 *
 * Not linked from any screen: it becomes reachable when the public page goes live (Sasha's yes).
 * Submit inserts one row into `partner_submissions`, then pings the `notify-partner-submission`
 * edge function (fire-and-forget) so Sasha is emailed at once. If the insert fails, the form
 * falls back to a prefilled email so it never dead-ends.
 */
import { useState, type CSSProperties, type FormEvent } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  NOTE_PLACEHOLDER,
  PARTNER_LIMITS,
  SOCIAL_CONTRACT_TEXT,
  THANK_YOU_TEXT,
  isHoneypotTripped,
  isValidEmail,
  normalizeUrl,
  submissionMailto,
  toNotifyBody,
  toSubmissionRow,
  type PartnerFormInput,
  type PartnerSubmissionRow,
} from "@/lib/partnerIntake";

/** The address the site already notifies (waitlist and genius-offer edge functions). */
const CONTACT_EMAIL = "alexanderkonst@gmail.com";

/** `partner_submissions` is not in the generated types until its migration is deployed. */
type UntypedInsertClient = {
  from: (table: string) => { insert: (row: PartnerSubmissionRow) => PromiseLike<{ error: unknown }> };
};

const eyebrow: CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: "10.5px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#8a6508",
};
const title: CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 700,
  letterSpacing: "-0.005em",
  color: "#0b2a5a",
};
const body: CSSProperties = {
  fontFamily: "'Source Serif 4', serif",
  fontWeight: 500,
  color: "#0b2a5a",
  lineHeight: 1.65,
};
const card: CSSProperties = {
  background: "rgba(255, 252, 245, 0.96)",
  border: "0.5px solid rgba(212, 175, 55, 0.55)",
  boxShadow: "0 0 22px -8px rgba(212, 175, 55, 0.30), 0 16px 40px -20px rgba(10, 22, 40, 0.22)",
};

const BringYourModule = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [note, setNote] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const validate = (): string | null => {
    if (!name.trim()) return "Please add your name.";
    if (!isValidEmail(email)) return "Please add a valid email.";
    if (!normalizeUrl(projectUrl)) return "Please add a link to your project.";
    if (!accepted) return "Please accept the social contract to continue.";
    return null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const problem = validate();
    setError(problem);
    if (problem) return;

    // Honeypot: a bot filled the hidden field. Reject client-side; look the same as success.
    if (isHoneypotTripped({ honeypot })) {
      setDone(true);
      return;
    }

    const input: PartnerFormInput = {
      name,
      email,
      projectUrl: normalizeUrl(projectUrl) ?? projectUrl,
      note,
      acceptedSocialContract: accepted,
      honeypot,
    };
    const row = toSubmissionRow(input);

    setSubmitting(true);
    let saved = false;
    try {
      // Table is not in the generated types until the migration is deployed; no .select():
      // anon may insert but never read.
      const { error: insertError } = await (supabase as unknown as UntypedInsertClient).from("partner_submissions").insert(row);
      saved = !insertError;
    } catch {
      saved = false;
    }
    if (saved) {
      // Fire-and-forget: never block the thank-you screen, swallow every error.
      try {
        void Promise.resolve(supabase.functions.invoke("notify-partner-submission", { body: toNotifyBody(row) })).catch(() => {});
      } catch {
        /* ignore */
      }
    } else {
      // Insert failed: never dead-end. Open a prefilled email with every field.
      window.location.href = submissionMailto(CONTACT_EMAIL, row);
    }
    setSubmitting(false);
    setDone(true);
  };

  const shell = (children: React.ReactNode) => (
    <div
      className="min-h-dvh bym-page"
      style={{
        backgroundColor: "#f7f3ea",
        color: "#0b2a5a",
        // Fixed light page: pin the theme tokens so labels and inputs stay dark-on-light under any skin.
        ["--background" as string]: "0 0% 100%",
        ["--foreground" as string]: "217 78% 20%",
        ["--input" as string]: "40 35% 78%",
        ["--border" as string]: "40 35% 78%",
        ["--muted-foreground" as string]: "217 25% 38%",
        ["--skin-input-fill" as string]: "#ffffff",
        ["--skin-card-fill" as string]: "rgba(255, 252, 245, 0.96)",
        ["--skin-ink-muted" as string]: "#6b7690",
        ["--skin-text-primary" as string]: "#0b2a5a",
        ["--skin-text-muted" as string]: "#3d4a66",
        ["--skin-text-body" as string]: "#0b2a5a",
        backgroundImage:
          "linear-gradient(rgba(248, 245, 238, 0.08), rgba(248, 245, 238, 0.08)), url('/images/evolution-portal-atmosphere.png')",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <SEO
        title="Bring your module | Game of Being You"
        description="Bring your course, product or sessions into the Game of Being You."
        path="/bring-your-module"
        noIndex
      />
      <style>{`
        .bym-page label { color: #0b2a5a !important; opacity: 1 !important; text-shadow: none !important; }
        .bym-page input, .bym-page textarea { background: #ffffff !important; color: #0b2a5a !important; border-color: rgba(184, 134, 11, 0.45) !important; }
        .bym-page input::placeholder, .bym-page textarea::placeholder { color: #8a93a8 !important; opacity: 1; }
      `}</style>
      <div className="max-w-[680px] mx-auto px-5 py-14 sm:py-20">{children}</div>
    </div>
  );

  if (done) {
    return shell(
      <div className="rounded-2xl p-6 sm:p-8 text-center" style={card} role="status">
        <p className="text-lg sm:text-xl" style={{ ...body, ...title, fontWeight: 600 }}>
          {THANK_YOU_TEXT}
        </p>
      </div>,
    );
  }

  return shell(
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <header className="mb-4 space-y-3">
        <p style={eyebrow}>Partners</p>
        <h1 className="text-4xl sm:text-5xl mt-2" style={title}>
          Bring your module
        </h1>
        <p className="text-base sm:text-lg" style={body}>
          Bring your course, product or sessions into the Game of Being You. Players find your work inside the
          game's village and go to your own site to buy. You keep your site, your prices and your clients.
        </p>
        <p className="text-base sm:text-lg" style={body}>
          Leave three things. We read your site, draft one card per offer and email them to you to confirm.
          Nothing goes live without your yes.
        </p>
      </header>

      <section className="rounded-2xl p-6 sm:p-7 space-y-4" style={card}>
        <div className="space-y-1.5">
          <Label htmlFor="bym-name">Your name</Label>
          <Input id="bym-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={PARTNER_LIMITS.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bym-email">Email</Label>
          <Input id="bym-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={PARTNER_LIMITS.email} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bym-url">Link to your project</Label>
          <Input id="bym-url" inputMode="url" placeholder="https://" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} maxLength={PARTNER_LIMITS.projectUrl} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bym-note">Anything we should know?</Label>
          <Textarea
            id="bym-note"
            rows={4}
            placeholder={NOTE_PLACEHOLDER}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={PARTNER_LIMITS.note}
          />
        </div>
      </section>

      <section className="rounded-2xl p-6 sm:p-7" style={card}>
        <h2 className="text-xl mb-3" style={title}>
          Our social contract
        </h2>
        <div className="flex items-start gap-3">
          <Checkbox id="bym-contract" className="mt-1" checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} />
          <Label htmlFor="bym-contract" className="font-normal text-[15px] leading-relaxed" style={body}>
            {SOCIAL_CONTRACT_TEXT}
          </Label>
        </div>
      </section>

      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="bym-website">Leave this field empty</label>
        <input id="bym-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Sending…" : "Send"}
      </Button>
    </form>,
  );
};

export default BringYourModule;
