import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  APP_ICON_IDS,
  APP_ICON_THEMES,
  appIconForCourse,
  appIconSrc,
  appIconTheme,
} from "@/lib/appIcons";
import { ACTIVATE_YOUR_DORMANT_POTENTIAL } from "@/data/courses/activateYourDormantPotential";
import { CONSCIOUSNESS_MEETS_SCIENCE } from "@/data/courses/consciousnessMeetsScience";
import { ACTIVATION_OF_INNER_VISION } from "@/data/courses/activationOfInnerVision";

describe("app icons v6 (issue #559)", () => {
  it("picks the icon theme by skin, lunar for any skin without its own", () => {
    expect(appIconTheme("lunar")).toBe("lunar");
    expect(appIconTheme("lapis")).toBe("lapis");
    expect(appIconTheme("aurum")).toBe("aurum");
    expect(appIconTheme("grayscale")).toBe("grayscale");
    expect(appIconTheme("network-school")).toBe("lunar");
    expect(appIconTheme(undefined)).toBe("lunar");
  });

  it("builds the 128 and 1024 URLs", () => {
    expect(appIconSrc("potential", "aurum", 128)).toBe("/apps/icons/potential-aurum@128.png");
    expect(appIconSrc("my-ai", "lapis", 1024)).toBe("/apps/icons/my-ai-lapis.png");
    expect(appIconSrc("vision", "dao", 1024)).toBe("/apps/icons/vision-lunar.png");
  });

  it("ships every app x theme x size under public/apps/icons", () => {
    for (const app of APP_ICON_IDS) {
      for (const theme of APP_ICON_THEMES) {
        for (const size of [128, 1024] as const) {
          const file = appIconSrc(app, theme, size);
          expect(existsSync(join(process.cwd(), "public", file)), file).toBe(true);
        }
      }
    }
  });

  it("maps the three courses that are apps, and no other course", () => {
    expect(appIconForCourse(ACTIVATE_YOUR_DORMANT_POTENTIAL.slug)).toBe("potential");
    expect(appIconForCourse(CONSCIOUSNESS_MEETS_SCIENCE.slug)).toBe("crossing");
    expect(appIconForCourse(ACTIVATION_OF_INNER_VISION.slug)).toBe("vision");
    expect(appIconForCourse("founder-academy")).toBeUndefined();
    expect(appIconForCourse(undefined)).toBeUndefined();
  });
});
