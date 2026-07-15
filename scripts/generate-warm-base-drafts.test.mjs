import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

import {
  buildDraftRows,
  isAllowedEmail,
  parseCsv,
  renderAppsScript,
  stringifyCsv,
} from "./generate-warm-base-drafts.mjs";

it("CSV parser round-trips multiline and quoted fields", () => {
  const rows = [{ email: "a@example.com", body: 'Hello,\n"friend"' }];
  expect(parseCsv(stringifyCsv(rows, ["email", "body"]))).toEqual(rows);
});

it("email filter rejects malformed, internal, admin, test, and alias addresses", () => {
  expect(isAllowedEmail("real@example.com")).toBe(true);
  expect(isAllowedEmail("not-an-email")).toBe(false);
  expect(isAllowedEmail("person+tag@example.com")).toBe(false);
  expect(isAllowedEmail("admin@example.com")).toBe(false);
  expect(isAllowedEmail("person@findyourtoptalent.com")).toBe(false);
  expect(isAllowedEmail("alexanderkonst@gmail.com")).toBe(false);
});

it("form headings and empty first slots do not become personalization", () => {
  const rows = buildDraftRows([], [
    {
      Email: "person@example.com",
      Name: "Person",
      Superpower:
        "MY ZONE OF GENIUS:\n\n1. \n\n2. Efficient Organizing: You thrive in organizing tasks efficiently.\n\n3. Leadership Taking.",
    },
  ]);
  expect(rows[0].body).toMatch(/Efficient Organizing/);
  expect(rows[0].subject).not.toMatch(/MY ZONE OF GENIUS/);
});

it("platform row wins while retaining form superpower words", () => {
  const rows = buildDraftRows(
    [
      {
        email: "person@example.com",
        display_name: "Fresh Name",
        talent_reveal_completed: "yes",
        top_talent: "Sense Patterns",
      },
    ],
    [
      {
        Email: "PERSON@example.com",
        Name: "Old Name",
        Superpower: "Your superpower is to:\n1. Bring order to complex situations.",
      },
    ],
  );
  expect(rows).toHaveLength(1);
  expect(rows[0].name).toBe("Fresh Name");
  expect(rows[0].subject).toBe("Your top talent: Sense Patterns");
  expect(rows[0].body).toMatch(/person behind FindYourTopTalent/);
  expect(rows[0].body).not.toMatch(/helping me get here/);
});

it("platform rows without a completed reveal use the professional fallback", () => {
  const [draft] = buildDraftRows(
    [
      {
        email: "person@example.com",
        display_name: "Person Example",
        talent_reveal_completed: "no",
        top_talent: "",
      },
    ],
    [],
  );
  expect(draft.subject).toBe("What's next, professionally");
  expect(draft.body).toContain(
    "Some time back you created your profile on the platform. I wonder where things stand for you now.",
  );
});

it("common Gmail domain typos are corrected before drafting", () => {
  const rows = buildDraftRows(
    [
      {
        email: "person@gmai.com",
        display_name: "Person",
        talent_reveal_completed: "yes",
        top_talent: "Listen",
      },
    ],
    [],
  );
  expect(rows[0].email).toBe("person@gmail.com");
});

it("generated drafts contain both requested links and no em dash", () => {
  const platform = parseCsv(readFileSync("docs/warm_base_platform_users.csv", "utf8"));
  const form = parseCsv(
    readFileSync("docs/02-strategy/warm-base/superpower_responses.csv", "utf8"),
  );
  const rows = buildDraftRows(platform, form);
  expect(new Set(rows.map((row) => row.email)).size).toBe(rows.length);
  for (const row of rows) {
    expect(row.body, row.email).toContain(
      "https://cal.com/aleksandrkonstantinov/direction-choice-call",
    );
    expect(row.body, row.email).toContain("findyourtoptalent.com");
    expect(row.body.includes("—"), row.email).toBe(false);
    expect(row.subject.includes("—"), row.email).toBe(false);
  }
});

it("Apps Script is idempotent per recipient", () => {
  const script = renderAppsScript([
    { email: "a@example.com", name: "A", language: "en", subject: "Hi", body: "Body" },
  ]);
  expect(script).toMatch(/GmailApp\.createDraft/);
  expect(script).toMatch(/PropertiesService\.getUserProperties/);
  expect(script).toMatch(/properties\.setProperty/);
});
