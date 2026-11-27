// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

let mockSkin = "lunar";
vi.mock("@/contexts/SkinContext", () => ({ useSkin: () => ({ skin: mockSkin, setSkin: () => {} }) }));

import AppIcon from "@/components/AppIcon";

describe("AppIcon", () => {
  it("shows the lunar icon by default and follows the skin", () => {
    mockSkin = "lunar";
    expect(renderToStaticMarkup(<AppIcon app="potential" size={56} />)).toContain("/apps/icons/potential-lunar@128.png");
    mockSkin = "aurum";
    const html = renderToStaticMarkup(<AppIcon app="potential" size={56} />);
    expect(html).toContain("/apps/icons/potential-aurum@128.png");
    expect(html).toContain("/apps/icons/potential-aurum.png 1024w");
  });

  it("falls back to lunar for a skin without an icon set, and takes the 1024 file above 64 px", () => {
    mockSkin = "karime";
    const html = renderToStaticMarkup(<AppIcon app="crossing" size={96} />);
    expect(html).toContain('src="/apps/icons/crossing-lunar.png"');
    expect(html).not.toContain("karime");
  });

  it("masks to a rounded square in CSS, with no frame", () => {
    mockSkin = "lapis";
    const html = renderToStaticMarkup(<AppIcon app="vision" size={28} />);
    expect(html).toContain("border-radius:22%");
    expect(html).not.toContain("border:");
    expect(html).toContain('data-app-icon="vision"');
  });
});
