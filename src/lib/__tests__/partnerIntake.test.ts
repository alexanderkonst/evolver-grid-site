import { describe, expect, it } from "vitest";
import {
  ECOSYSTEM_PLACE_LABEL,
  PARTNER_MODULE_KINDS,
  isHoneypotTripped,
  placeForKind,
  placeLabelForKind,
  projectSlug,
  referralId,
  submissionMailto,
  toSubmissionRow,
  type PartnerFormInput,
} from "@/lib/partnerIntake";
import { VILLAGE_PLACES } from "@/data/villagePlaces";

const form = (over: Partial<PartnerFormInput> = {}): PartnerFormInput => ({
  name: " Ada ",
  email: "ada@example.com",
  projectName: "Ada's Studio",
  projectUrl: "https://ada.example.com",
  modules: [
    { kind: "course", title: "Calm", result: "You sleep.", price: "$300", link: "https://ada.example.com/calm", referralParam: "ref" },
    { kind: "ecosystem", title: "All", result: "One home.", price: "free", link: "https://ada.example.com", referralParam: null },
  ],
  acceptedSocialContract: true,
  honeypot: "",
  ...over,
});

describe("placeForKind (placement rule)", () => {
  it("course → academy, product → market, session and community → the Mastermind", () => {
    expect(placeForKind("course")).toBe("academy");
    expect(placeForKind("product")).toBe("market");
    expect(placeForKind("session")).toBe("fire-circle");
    expect(placeForKind("community")).toBe("fire-circle");
  });

  it("a whole ecosystem has no place: own building, by our decision", () => {
    expect(placeForKind("ecosystem")).toBeNull();
    expect(placeLabelForKind("ecosystem")).toBe(ECOSYSTEM_PLACE_LABEL);
  });

  it("every mapped place is a real village place, and its label is the place's name", () => {
    for (const { kind } of PARTNER_MODULE_KINDS) {
      const key = placeForKind(kind);
      if (!key) continue;
      const place = VILLAGE_PLACES.find((p) => p.key === key);
      expect(place, kind).toBeDefined();
      expect(placeLabelForKind(kind)).toBe(place!.name);
    }
  });
});

describe("referral id", () => {
  it("slugs the project name into fytt-<slug>", () => {
    expect(referralId("Ada Studio")).toBe("fytt-ada-studio");
    expect(referralId("  My Project! v2 ")).toBe("fytt-my-project-v2");
    expect(referralId("Café Ñandú")).toBe("fytt-cafe-nandu");
  });

  it("is empty when the name has no usable letters", () => {
    expect(projectSlug("!!!")).toBe("");
    expect(referralId("")).toBe("");
  });
});

describe("submission row", () => {
  it("trims, adds place and referral id per module, null param when the site can't read links", () => {
    const row = toSubmissionRow(form());
    expect(row.name).toBe("Ada");
    expect(row.modules[0]).toMatchObject({ place: "academy", referral_param: "ref", referral_id: "fytt-ada-s-studio" });
    expect(row.modules[1]).toMatchObject({ place: null, referral_param: null });
    expect(row.accepted_social_contract).toBe(true);
  });

  it("an empty referral parameter falls back to ref", () => {
    const row = toSubmissionRow(form({ modules: [{ ...form().modules[0], referralParam: "  " }] }));
    expect(row.modules[0].referral_param).toBe("ref");
  });

  it("honeypot is tripped only by a non-empty value", () => {
    expect(isHoneypotTripped({ honeypot: "" })).toBe(false);
    expect(isHoneypotTripped({ honeypot: " " })).toBe(false);
    expect(isHoneypotTripped({ honeypot: "http://spam" })).toBe(true);
  });
});

describe("fallback mailto", () => {
  it("carries every field in the body", () => {
    const url = submissionMailto("to@example.com", toSubmissionRow(form()));
    expect(url.startsWith("mailto:to@example.com?subject=")).toBe(true);
    const body = decodeURIComponent(url.split("&body=")[1]);
    for (const piece of [
      "Ada", "ada@example.com", "Ada's Studio", "https://ada.example.com", "fytt-ada-s-studio",
      "Calm", "You sleep.", "$300", "https://ada.example.com/calm", "Academy",
      "my site can't read referral links yet", "Social contract accepted: yes",
    ]) {
      expect(body).toContain(piece);
    }
  });
});
