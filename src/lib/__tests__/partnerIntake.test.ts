import { describe, expect, it } from "vitest";
import {
  MODULE_SOURCE,
  hostnameOf,
  isHoneypotTripped,
  isValidEmail,
  normalizeUrl,
  projectSlug,
  referralId,
  submissionMailto,
  toNotifyBody,
  toSubmissionRow,
  type PartnerFormInput,
} from "@/lib/partnerIntake";

const form = (over: Partial<PartnerFormInput> = {}): PartnerFormInput => ({
  name: " Ada ",
  email: "ada@example.com",
  projectUrl: "https://www.ada-studio.com/courses",
  note: " Courses, $300. ",
  acceptedSocialContract: true,
  honeypot: "",
  ...over,
});

describe("url helpers", () => {
  it("adds https:// to a bare domain and rejects non-addresses", () => {
    expect(normalizeUrl("ada.com")).toBe("https://ada.com");
    expect(normalizeUrl("http://ada.com/x")).toBe("http://ada.com/x");
    expect(normalizeUrl("  ")).toBeNull();
    expect(normalizeUrl("localhost")).toBeNull();
  });

  it("hostname strips www and lowercases", () => {
    expect(hostnameOf("https://www.Ada-Studio.com/courses")).toBe("ada-studio.com");
    expect(hostnameOf("ada.com")).toBe("ada.com");
    expect(hostnameOf("nonsense")).toBe("");
  });

  it("validates email", () => {
    expect(isValidEmail(" a@b.co ")).toBe(true);
    expect(isValidEmail("a@b")).toBe(false);
  });
});

describe("referral id", () => {
  it("slugs the name into fytt-<slug>", () => {
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
  it("maps the short form onto the existing table without a migration", () => {
    const row = toSubmissionRow(form());
    expect(row).toEqual({
      name: "Ada",
      email: "ada@example.com",
      project_name: "ada-studio.com",
      project_url: "https://www.ada-studio.com/courses",
      modules: [{ kind: "unread", note: "Courses, $300.", source: MODULE_SOURCE, referral_id: "fytt-ada-studio-com" }],
      accepted_social_contract: true,
    });
    expect(MODULE_SOURCE).toBe("short-form-v2");
  });

  it("an empty note stays an empty string", () => {
    expect(toSubmissionRow(form({ note: "  " })).modules[0].note).toBe("");
  });

  it("honeypot is tripped only by a non-empty value", () => {
    expect(isHoneypotTripped({ honeypot: "" })).toBe(false);
    expect(isHoneypotTripped({ honeypot: " " })).toBe(false);
    expect(isHoneypotTripped({ honeypot: "http://spam" })).toBe(true);
  });

  it("notify body carries the four fields", () => {
    expect(toNotifyBody(toSubmissionRow(form()))).toEqual({
      name: "Ada",
      email: "ada@example.com",
      project_url: "https://www.ada-studio.com/courses",
      note: "Courses, $300.",
    });
  });
});

describe("fallback mailto", () => {
  it("carries the four fields in the body", () => {
    const url = submissionMailto("to@example.com", toSubmissionRow(form()));
    expect(url.startsWith("mailto:to@example.com?subject=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Bring your module: ada-studio.com");
    const body = decodeURIComponent(url.split("&body=")[1]);
    for (const piece of ["Ada", "ada@example.com", "https://www.ada-studio.com/courses", "Courses, $300.", "Social contract accepted: yes"]) {
      expect(body).toContain(piece);
    }
  });
});
