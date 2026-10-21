import { describe, expect, it } from "vitest";
import { filterAdminOnlyRows } from "../adminOnlyRows";

const rows = [
  { id: "equilibrium-v2", label: "Equilibrium", path: "/build/equilibrium" },
  { id: "commercial-os", label: "Commercial OS", path: "/built-by-you/commercial-os" },
  { id: "founder-cockpit", label: "Founder Cockpit", path: "/build/cockpit" },
  { id: "founder-cockpit-dashboard", label: "Enter the Cockpit", path: "/build/cockpit/dashboard" },
];

describe("filterAdminOnlyRows", () => {
  it("hides Commercial OS and Enter the Cockpit from non-admins", () => {
    for (const email of [null, undefined, "someone@example.com"]) {
      expect(filterAdminOnlyRows(rows, email).map((r) => r.id)).toEqual([
        "equilibrium-v2",
        "founder-cockpit",
      ]);
    }
  });

  it("keeps every row for admins", () => {
    expect(filterAdminOnlyRows(rows, "alexanderkonst@gmail.com")).toEqual(rows);
  });
});
