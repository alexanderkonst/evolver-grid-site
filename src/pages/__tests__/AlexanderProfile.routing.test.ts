import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { founderRedirectTarget } from "../../components/FounderRedirect";

const redirectSource = readFileSync(
  new URL("../../components/FounderRedirect.tsx", import.meta.url),
  "utf8",
);
const profileSource = readFileSync(new URL("../AlexanderProfile.tsx", import.meta.url), "utf8");

const appSource = readFileSync(new URL("../../App.tsx", import.meta.url), "utf8");
const shellSource = readFileSync(
  new URL("../../components/game/GameShellV2.tsx", import.meta.url),
  "utf8",
);
const logoSource = readFileSync(
  new URL("../../components/SiteLogo.tsx", import.meta.url),
  "utf8",
);
const shellRoutesSource = readFileSync(
  new URL("../../lib/shellRoutes.ts", import.meta.url),
  "utf8",
);

describe("Sasha founder profile routing", () => {
  it("renders the designed founder profile before the generic username route", () => {
    const founderRoute = appSource.indexOf('<Route path="/sasha"');
    const genericRoute = appSource.indexOf('<Route path="/:username"');

    expect(founderRoute).toBeGreaterThan(-1);
    expect(genericRoute).toBeGreaterThan(founderRoute);
    expect(appSource.slice(founderRoute, genericRoute)).toContain(
      "<AlexanderProfile />",
    );
  });

  it("keeps legacy founder URLs pointed at the canonical profile", () => {
    for (const slug of ["aleksandr", "alexander", "integralevolution"]) {
      expect(appSource).toContain(`<Route path="/${slug}" element={<FounderRedirect />} />`);
    }
  });

  it("keeps the query string and hash through the founder redirect (QR attribution)", () => {
    expect(founderRedirectTarget("?utm_source=qr&utm_medium=share_card", "")).toBe(
      "/sasha?utm_source=qr&utm_medium=share_card",
    );
    expect(founderRedirectTarget("?a=1", "#top")).toBe("/sasha?a=1#top");
    expect(founderRedirectTarget("", "")).toBe("/sasha");
    expect(redirectSource).toContain("founderRedirectTarget(search, hash)");
    expect(redirectSource).toContain("replace");
  });

  it("leads /sasha with the same share card as every public profile", () => {
    expect(profileSource).toContain('<ShareCard variant="visitor"');
    expect(profileSource).toContain("<ShareCardAnswer");
    expect(profileSource.indexOf("<ShareCard variant")).toBeLessThan(profileSource.indexOf("<header"));
  });

  it("applies the founder page shell and chrome behavior at /sasha", () => {
    expect(shellSource).toContain('location.pathname === "/sasha"');
    expect(logoSource).toContain('"/sasha"');
    expect(shellRoutesSource).toContain('"/sasha"');
  });
});
