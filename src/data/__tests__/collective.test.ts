import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { COLLECTIVE_CIRCLES, formatCircleCount } from "@/data/collective";
import { COLLECTIVE_ADMIN, collectiveAdminText } from "@/data/collectiveAdminCopy";

describe("collective circles config (WP1)", () => {
  it("holds the five manual circles from the spec, in order, Orbit left out", () => {
    expect(COLLECTIVE_CIRCLES.map((c) => [c.key, c.count, c.isApproximate])).toEqual([
      ["fire_circle", 13, true],
      ["clients", 20, true],
      ["self_test", 80, true],
      ["containers", 33, false],
      ["transformational", 100, true],
    ]);
    expect(COLLECTIVE_CIRCLES.map((c) => c.key as string)).not.toContain("orbit");
  });

  it("keys are unique and every label exists in en, es and ru", () => {
    const keys = COLLECTIVE_CIRCLES.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const c of COLLECTIVE_CIRCLES) {
      for (const lang of ["en", "es", "ru"] as const) {
        expect(c.label[lang].trim(), `${c.key}.${lang}`).not.toBe("");
      }
    }
  });

  it("labels an approximate count with «~» and an exact one without", () => {
    const byKey = Object.fromEntries(COLLECTIVE_CIRCLES.map((c) => [c.key, formatCircleCount(c)]));
    expect(byKey.self_test).toBe("~80");
    expect(byKey.containers).toBe("33");
  });
});

describe("collective admin copy (WP1)", () => {
  it("every string exists in en, es and ru", () => {
    for (const [key, entry] of Object.entries(COLLECTIVE_ADMIN)) {
      for (const lang of ["en", "es", "ru"] as const) {
        expect(entry[lang].trim(), `${key}.${lang}`).not.toBe("");
      }
    }
  });

  it("falls back to English for an unknown language", () => {
    expect(collectiveAdminText("grant", "fr")).toBe("Grant");
    expect(collectiveAdminText("grant", "ru")).toBe("Выдать");
  });
});

describe("collective_public_counts() migration (WP1)", () => {
  const sql = readFileSync(
    join(process.cwd(), "supabase/migrations/20261125210200_collective_public_counts.sql"),
    "utf8",
  );

  it("is security definer, stable, with a pinned search_path", () => {
    expect(sql).toMatch(/SECURITY DEFINER/);
    expect(sql).toMatch(/\bSTABLE\b/);
    expect(sql).toMatch(/SET search_path = public/);
  });

  it("is callable by anon and returns exactly four integer columns", () => {
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.collective_public_counts\(\) TO anon, authenticated/);
    const returns = sql.match(/RETURNS TABLE \(([\s\S]*?)\)\s*LANGUAGE/)?.[1] ?? "";
    const cols = returns.split(",").map((c) => c.trim().split(/\s+/));
    expect(cols).toEqual([
      ["players_started", "integer"],
      ["top_talent_found", "integer"],
      ["mission_found", "integer"],
      ["core_members", "integer"],
    ]);
  });
});

describe("collective_members migration (WP1)", () => {
  const sql = readFileSync(
    join(process.cwd(), "supabase/migrations/20261125210100_collective_members.sql"),
    "utf8",
  );

  it("turns RLS on and gives anon nothing", () => {
    expect(sql).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(sql).toMatch(/REVOKE ALL ON public\.collective_members FROM PUBLIC, anon, authenticated/);
    expect(sql).not.toMatch(/TO anon/);
  });

  it("reads need a member or admin role; insert and delete need admin", () => {
    const policy = (name: string) => sql.match(new RegExp(`CREATE POLICY "${name}"[\\s\\S]*?;`))?.[0] ?? "";
    expect(policy("Members read all collective members")).toMatch(/has_role\(auth\.uid\(\), 'collective_member'/);
    expect(policy("Admins insert collective members")).toMatch(/has_role\(auth\.uid\(\), 'admin'/);
    expect(policy("Admins delete collective members")).toMatch(/has_role\(auth\.uid\(\), 'admin'/);
    expect(policy("Members update own collective row")).toMatch(/user_id = auth\.uid\(\)/);
  });
});
