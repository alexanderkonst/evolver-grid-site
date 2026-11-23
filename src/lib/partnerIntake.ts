/**
 * Partner intake («Bring your module», /bring-your-module): pure helpers.
 * Short form v2 (issue #404): name, email, project link, optional note, social contract.
 * No React, no Supabase, so the row mapping and the referral id are testable on their own.
 *
 * The table `partner_submissions` is unchanged: the short form maps onto it
 * (`project_name` = hostname, one `modules` entry of kind "unread" for us to read the site).
 */

/** Field limits. The edge function `notify-partner-submission` enforces the same numbers. */
export const PARTNER_LIMITS = { name: 200, email: 320, projectUrl: 2000, note: 2000 } as const;

export const NOTE_PLACEHOLDER =
  "What you offer, who it's for, prices — or leave empty, we'll read your site.";

export const SOCIAL_CONTRACT_TEXT =
  "When the game brings me a buyer, 10% of that sale goes to the game as a gift. It keeps the game, its team and its players going. No contract, only my word. Once a month I'll say how many buyers came from the game.";

export const THANK_YOU_TEXT =
  "Thank you. Aleksandr sees your note right away. We'll read your site, draft your cards and email them to you to confirm. Nothing goes live without your yes.";

export const MODULE_SOURCE = "short-form-v2";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string): boolean => EMAIL_RE.test(value.trim());

/** Adds https:// when the partner typed a bare domain; null when it is not a usable web address. */
export function normalizeUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes(".") ? withScheme : null;
  } catch {
    return null;
  }
}

/** Hostname of a project link without `www.`; empty string when the link is not a usable address. */
export function hostnameOf(projectUrl: string): string {
  const normalized = normalizeUrl(projectUrl);
  if (!normalized) return "";
  return new URL(normalized).hostname.replace(/^www\./i, "").toLowerCase();
}

/** «My Project! v2» → «my-project-v2». Accents folded; empty when nothing usable is left. */
export function projectSlug(projectName: string): string {
  return projectName
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Referral id of a partner's modules: `fytt-<slug>`. Empty string when the name has no usable letters. */
export function referralId(projectName: string): string {
  const slug = projectSlug(projectName);
  return slug ? `fytt-${slug}` : "";
}

export type PartnerFormInput = {
  name: string;
  email: string;
  projectUrl: string;
  /** Optional free text; may be empty. */
  note: string;
  acceptedSocialContract: boolean;
  /** Hidden honeypot field; a human leaves it empty. */
  honeypot: string;
};

/** Row shape of `partner_submissions` (without id / created_at / status, which the table fills). */
export type PartnerSubmissionRow = {
  name: string;
  email: string;
  project_name: string;
  project_url: string;
  modules: {
    kind: "unread";
    note: string;
    source: typeof MODULE_SOURCE;
    referral_id: string;
  }[];
  accepted_social_contract: boolean;
};

/** Body of the `notify-partner-submission` edge function. */
export type PartnerNotifyBody = {
  name: string;
  email: string;
  project_url: string;
  note: string;
};

export function isHoneypotTripped(input: Pick<PartnerFormInput, "honeypot">): boolean {
  return input.honeypot.trim().length > 0;
}

export function toSubmissionRow(input: PartnerFormInput): PartnerSubmissionRow {
  const projectUrl = input.projectUrl.trim();
  const host = hostnameOf(projectUrl);
  return {
    name: input.name.trim(),
    email: input.email.trim(),
    project_name: host,
    project_url: projectUrl,
    modules: [
      {
        kind: "unread",
        note: input.note.trim(),
        source: MODULE_SOURCE,
        referral_id: referralId(host),
      },
    ],
    accepted_social_contract: input.acceptedSocialContract,
  };
}

export function toNotifyBody(row: PartnerSubmissionRow): PartnerNotifyBody {
  return {
    name: row.name,
    email: row.email,
    project_url: row.project_url,
    note: row.modules[0]?.note ?? "",
  };
}

/** Plain-text body of the fallback email: the four fields, so nothing is lost if the insert fails. */
export function submissionEmailBody(row: PartnerSubmissionRow): string {
  return [
    "Bring your module: new submission",
    "",
    `Name: ${row.name}`,
    `Email: ${row.email}`,
    `Project link: ${row.project_url}`,
    `Note: ${row.modules[0]?.note ?? ""}`,
    "",
    `Social contract accepted: ${row.accepted_social_contract ? "yes" : "no"}`,
  ].join("\n");
}

/** Fallback when the insert fails: a prefilled email to the site's contact address. */
export function submissionMailto(to: string, row: PartnerSubmissionRow): string {
  const subject = `Bring your module: ${row.project_name}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(submissionEmailBody(row))}`;
}
