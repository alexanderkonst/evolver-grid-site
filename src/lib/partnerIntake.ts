import type { VillagePlaceKey } from "@/data/villagePlaces";

/**
 * Partner intake («Bring your module», /bring-your-module): pure helpers.
 * Spec: docs/02-strategy/modular_collaboration/partner_intake.md (terms: partner_offer.md v2.1).
 * No React, no Supabase, so the placement rule and the referral id are testable on their own.
 */

export type PartnerModuleKind = "course" | "product" | "session" | "community" | "ecosystem";

export const PARTNER_MODULE_KINDS: readonly { kind: PartnerModuleKind; label: string }[] = [
  { kind: "course", label: "Course" },
  { kind: "product", label: "Product" },
  { kind: "session", label: "Session" },
  { kind: "community", label: "Community" },
  { kind: "ecosystem", label: "Whole ecosystem" },
];

/** Placement rule: course → Academy, product → Market, session / community → Mastermind. */
const PLACE_BY_KIND: Record<Exclude<PartnerModuleKind, "ecosystem">, VillagePlaceKey> = {
  course: "academy",
  product: "market",
  session: "fire-circle", // the Mastermind (see villagePlaces.ts)
  community: "fire-circle",
};

/** The village place for a kind. `null` = a whole ecosystem: its own building, by our decision. */
export function placeForKind(kind: PartnerModuleKind): VillagePlaceKey | null {
  return kind === "ecosystem" ? null : PLACE_BY_KIND[kind];
}

const PLACE_LABEL: Partial<Record<VillagePlaceKey, string>> = {
  academy: "Academy",
  market: "Market",
  "fire-circle": "Mastermind",
};

export const ECOSYSTEM_PLACE_LABEL = "Own building, by our decision";

/** What the form shows next to a module: the place name, or the ecosystem line. */
export function placeLabelForKind(kind: PartnerModuleKind): string {
  const place = placeForKind(kind);
  return place ? (PLACE_LABEL[place] ?? place) : ECOSYSTEM_PLACE_LABEL;
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

/** Referral id of a partner's modules: `fytt-<project-slug>`. Empty string when the name has no usable letters. */
export function referralId(projectName: string): string {
  const slug = projectSlug(projectName);
  return slug ? `fytt-${slug}` : "";
}

export const DEFAULT_REFERRAL_PARAM = "ref";

export const SOCIAL_CONTRACT_TEXT =
  "When the game brings me a buyer, 10% of that sale goes to the game as a gift. No contract, only our word. I'll report monthly how many buyers came from the game.";

export const THANK_YOU_TEXT =
  "Thank you. We'll draft your module cards and send them to you to confirm. Nothing goes live without your yes.";

export type PartnerModuleInput = {
  kind: PartnerModuleKind;
  title: string;
  result: string;
  price: string;
  link: string;
  /** Query parameter the partner's site reads; `null` = «my site can't read referral links yet». */
  referralParam: string | null;
};

export type PartnerFormInput = {
  name: string;
  email: string;
  projectName: string;
  projectUrl: string;
  modules: PartnerModuleInput[];
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
    kind: PartnerModuleKind;
    place: VillagePlaceKey | null;
    title: string;
    result: string;
    price: string;
    link: string;
    referral_param: string | null;
    referral_id: string;
  }[];
  accepted_social_contract: boolean;
};

export function isHoneypotTripped(input: Pick<PartnerFormInput, "honeypot">): boolean {
  return input.honeypot.trim().length > 0;
}

export function toSubmissionRow(input: PartnerFormInput): PartnerSubmissionRow {
  const refId = referralId(input.projectName);
  return {
    name: input.name.trim(),
    email: input.email.trim(),
    project_name: input.projectName.trim(),
    project_url: input.projectUrl.trim(),
    modules: input.modules.map((m) => ({
      kind: m.kind,
      place: placeForKind(m.kind),
      title: m.title.trim(),
      result: m.result.trim(),
      price: m.price.trim(),
      link: m.link.trim(),
      referral_param: m.referralParam ? m.referralParam.trim() || DEFAULT_REFERRAL_PARAM : null,
      referral_id: refId,
    })),
    accepted_social_contract: input.acceptedSocialContract,
  };
}

/** Plain-text body of the fallback email: every field, so nothing is lost while the table is missing. */
export function submissionEmailBody(row: PartnerSubmissionRow): string {
  const kindLabel = (kind: PartnerModuleKind) =>
    PARTNER_MODULE_KINDS.find((k) => k.kind === kind)?.label ?? kind;
  const lines = [
    "Bring your module: new submission",
    "",
    `Name: ${row.name}`,
    `Email: ${row.email}`,
    `Project: ${row.project_name}`,
    `Project link: ${row.project_url}`,
    `Referral id: ${row.modules[0]?.referral_id ?? ""}`,
  ];
  row.modules.forEach((m, i) => {
    lines.push(
      "",
      `Module ${i + 1}`,
      `  Kind: ${kindLabel(m.kind)} (${placeLabelForKind(m.kind)})`,
      `  Title: ${m.title}`,
      `  Result: ${m.result}`,
      `  Price: ${m.price}`,
      `  Buy / join link: ${m.link}`,
      `  Referral parameter: ${m.referral_param ?? "my site can't read referral links yet"}`,
    );
  });
  lines.push("", `Social contract accepted: ${row.accepted_social_contract ? "yes" : "no"}`);
  return lines.join("\n");
}

/** Fallback while `partner_submissions` is not deployed: a prefilled email to the site's contact address. */
export function submissionMailto(to: string, row: PartnerSubmissionRow): string {
  const subject = `Bring your module: ${row.project_name}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(submissionEmailBody(row))}`;
}
