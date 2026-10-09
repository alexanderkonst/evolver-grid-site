import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

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
    expect(appSource).toContain(
      '<Route path="/aleksandr" element={<Navigate to="/sasha" replace />} />',
    );
    expect(appSource).toContain(
      '<Route path="/alexander" element={<Navigate to="/sasha" replace />} />',
    );
    expect(appSource).toContain(
      '<Route path="/integralevolution" element={<Navigate to="/sasha" replace />} />',
    );
  });

  it("applies the founder page shell and chrome behavior at /sasha", () => {
    expect(shellSource).toContain('location.pathname === "/sasha"');
    expect(logoSource).toContain('"/sasha"');
    expect(shellRoutesSource).toContain('"/sasha"');
  });
});
