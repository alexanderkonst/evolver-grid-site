/**
 * /bring-your-module: partner intake form «Bring your module» (issue #383).
 * Spec: docs/02-strategy/modular_collaboration/partner_intake.md; terms wording from partner_offer.md v2.1.
 *
 * Not linked from any screen: it becomes reachable when the public page goes live (Sasha's yes).
 * Submit inserts a row into `partner_submissions`. While that table is not deployed the insert
 * fails, and the form falls back to a prefilled email so it never dead-ends.
 */
import { useState, type CSSProperties, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_REFERRAL_PARAM,
  PARTNER_MODULE_KINDS,
  SOCIAL_CONTRACT_TEXT,
  THANK_YOU_TEXT,
  isHoneypotTripped,
  placeLabelForKind,
  referralId,
  submissionMailto,
  toSubmissionRow,
  type PartnerFormInput,
  type PartnerModuleKind,
  type PartnerSubmissionRow,
} from "@/lib/partnerIntake";

/** The address the site already notifies (waitlist and genius-offer edge functions). */
const CONTACT_EMAIL = "alexanderkonst@gmail.com";

/** `partner_submissions` is not in the generated types until its migration is deployed. */
type UntypedInsertClient = {
  from: (table: string) => { insert: (row: PartnerSubmissionRow) => PromiseLike<{ error: unknown }> };
};

type ModuleDraft = {
  uid: number;
  kind: PartnerModuleKind;
  title: string;
  result: string;
  price: string;
  link: string;
  referralParam: string;
  noReferral: boolean;
};

const emptyModule = (uid: number): ModuleDraft => ({
  uid,
  kind: "course",
  title: "",
  result: "",
  price: "",
  link: "",
  referralParam: DEFAULT_REFERRAL_PARAM,
  noReferral: false,
});

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Adds https:// when the partner typed a bare domain; null when it is not a usable web address. */
const normalizeUrl = (value: string): string | null => {
  const v = value.trim();
  if (!v) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes(".") ? withScheme : null;
  } catch {
    return null;
  }
};

const BringYourModule = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [modules, setModules] = useState<ModuleDraft[]>([emptyModule(1)]);
  const [nextUid, setNextUid] = useState(2);
  const [accepted, setAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const patchModule = (uid: number, patch: Partial<ModuleDraft>) =>
    setModules((list) => list.map((m) => (m.uid === uid ? { ...m, ...patch } : m)));

  const addModule = () => {
    setModules((list) => [...list, emptyModule(nextUid)]);
    setNextUid((n) => n + 1);
  };

  const validate = (): string | null => {
    if (!name.trim()) return "Please add your name.";
    if (!EMAIL_RE.test(email.trim())) return "Please add a valid email.";
    if (!projectName.trim()) return "Please add your project name.";
    if (!normalizeUrl(projectUrl)) return "Please add a link to your project.";
    for (const [i, m] of modules.entries()) {
      const label = `Module ${i + 1}`;
      if (!m.title.trim()) return `${label}: please add a title.`;
      if (!m.result.trim()) return `${label}: please add the one result it gives.`;
      if (!m.price.trim()) return `${label}: please add a price (for example "$300" or "free").`;
      if (!normalizeUrl(m.link)) return `${label}: please add the link where people buy or join it.`;
    }
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
      projectName,
      projectUrl: normalizeUrl(projectUrl) ?? projectUrl,
      modules: modules.map((m) => ({
        kind: m.kind,
        title: m.title,
        result: m.result,
        price: m.price,
        link: normalizeUrl(m.link) ?? m.link,
        referralParam: m.noReferral ? null : m.referralParam,
      })),
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
    if (!saved) {
      // Table missing (or any failure): never dead-end. Open a prefilled email with every field.
      window.location.href = submissionMailto(CONTACT_EMAIL, row);
    }
    setSubmitting(false);
    setDone(true);
  };

  const shell = (children: React.ReactNode) => (
    <div
      className="min-h-dvh"
      style={{
        backgroundColor: "#f7f3ea",
        color: "#0b2a5a",
        // Fixed light page: pin the theme tokens so labels and inputs stay dark-on-light under any skin.
        ["--background" as string]: "0 0% 100%",
        ["--foreground" as string]: "217 78% 20%",
        ["--input" as string]: "40 35% 78%",
        ["--border" as string]: "40 35% 78%",
        ["--muted-foreground" as string]: "217 25% 38%",
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
        description="Bring your project into the game as modules."
        path="/bring-your-module"
        noIndex
      />
      <div className="max-w-[680px] mx-auto px-5 py-14 sm:py-20">{children}</div>
    </div>
  );

  if (done) {
    return shell(
      <div className="rounded-2xl p-6 sm:p-8 text-center" style={card} role="status">
        <h1 className="text-3xl sm:text-4xl mb-4" style={title}>
          Thank you
        </h1>
        <p className="text-base sm:text-lg" style={body}>
          {THANK_YOU_TEXT}
        </p>
      </div>,
    );
  }

  const refId = referralId(projectName);

  return shell(
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <header className="mb-4">
        <p style={eyebrow}>Partners</p>
        <h1 className="text-4xl sm:text-5xl mt-2 mb-3" style={title}>
          Bring your module
        </h1>
        <p className="text-base sm:text-lg" style={body}>
          Tell us about your project and what you offer. We draft one card per thing, with one result and one
          button, and send them to you to confirm. Nothing goes live without your yes.
        </p>
      </header>

      <section className="rounded-2xl p-6 sm:p-7 space-y-4" style={card}>
        <h2 className="text-xl" style={title}>
          About you
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="bym-name">Your name</Label>
          <Input id="bym-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={200} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bym-email">Email</Label>
          <Input id="bym-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={320} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bym-project">Project name</Label>
          <Input id="bym-project" value={projectName} onChange={(e) => setProjectName(e.target.value)} maxLength={200} />
          {refId && (
            <p className="text-xs" style={{ ...body, opacity: 0.75 }}>
              Your referral id: <code>{refId}</code>
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bym-url">Project link</Label>
          <Input id="bym-url" inputMode="url" placeholder="https://" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} maxLength={2000} />
        </div>
      </section>

      {modules.map((m, i) => (
        <section key={m.uid} className="rounded-2xl p-6 sm:p-7 space-y-4" style={card}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl" style={title}>
              Module {i + 1}
            </h2>
            {modules.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setModules((list) => list.filter((x) => x.uid !== m.uid))}
                aria-label={`Remove module ${i + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`bym-kind-${m.uid}`}>What it is</Label>
            <Select value={m.kind} onValueChange={(v) => patchModule(m.uid, { kind: v as PartnerModuleKind })}>
              <SelectTrigger id={`bym-kind-${m.uid}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PARTNER_MODULE_KINDS.map((k) => (
                  <SelectItem key={k.kind} value={k.kind}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm" style={{ ...body, opacity: 0.85 }}>
              Place in the game: <strong>{placeLabelForKind(m.kind)}</strong>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`bym-title-${m.uid}`}>Title</Label>
            <Input id={`bym-title-${m.uid}`} value={m.title} onChange={(e) => patchModule(m.uid, { title: e.target.value })} maxLength={200} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`bym-result-${m.uid}`}>One result it gives, in one sentence</Label>
            <Input id={`bym-result-${m.uid}`} value={m.result} onChange={(e) => patchModule(m.uid, { result: e.target.value })} maxLength={400} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`bym-price-${m.uid}`}>Price</Label>
            <Input
              id={`bym-price-${m.uid}`}
              placeholder={'"$300", "free", "from $50/month"'}
              value={m.price}
              onChange={(e) => patchModule(m.uid, { price: e.target.value })}
              maxLength={100}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`bym-link-${m.uid}`}>Link where people buy or join it</Label>
            <Input id={`bym-link-${m.uid}`} inputMode="url" placeholder="https://" value={m.link} onChange={(e) => patchModule(m.uid, { link: e.target.value })} maxLength={2000} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`bym-ref-${m.uid}`}>Referral parameter your site reads</Label>
            <Input
              id={`bym-ref-${m.uid}`}
              value={m.referralParam}
              disabled={m.noReferral}
              onChange={(e) => patchModule(m.uid, { referralParam: e.target.value })}
              maxLength={50}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id={`bym-noref-${m.uid}`}
                checked={m.noReferral}
                onCheckedChange={(v) => patchModule(m.uid, { noReferral: v === true })}
              />
              <Label htmlFor={`bym-noref-${m.uid}`} className="font-normal">
                My site can't read referral links yet
              </Label>
            </div>
          </div>
        </section>
      ))}

      <Button type="button" variant="outline" onClick={addModule}>
        <Plus className="h-4 w-4 mr-1" /> Add another module
      </Button>

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
