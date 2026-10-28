import { describe, expect, it } from "vitest";
import {
  LEGACY_ZOG_ENTRY_PATHS,
  ZOG_ENTRY_PATH,
  pathUsesLayoutShell,
  zogEntryRedirectTarget,
} from "../shellRoutes";

describe("WP-7 route table: one public door into the Top Talent test", () => {
  it("keeps /zone-of-genius/entry as the one door, and it owns its own shell", () => {
    expect(ZOG_ENTRY_PATH).toBe("/zone-of-genius/entry");
    expect(zogEntryRedirectTarget(ZOG_ENTRY_PATH)).toBeNull();
    expect(pathUsesLayoutShell(ZOG_ENTRY_PATH)).toBe(false);
  });

  it.each(LEGACY_ZOG_ENTRY_PATHS)("redirects the old URL %s to the door", (path) => {
    expect(zogEntryRedirectTarget(path)).toBe(ZOG_ENTRY_PATH);
  });

  it("keeps the query and hash, so ?result=<token> and ?return= survive", () => {
    expect(zogEntryRedirectTarget("/zone-of-genius", "?result=abc123", "#top")).toBe(
      "/zone-of-genius/entry?result=abc123#top",
    );
    expect(zogEntryRedirectTarget("/game/journey/start", "?return=/start")).toBe(
      "/zone-of-genius/entry?return=/start",
    );
  });

  it("does not touch other routes, including the guided assessment", () => {
    expect(zogEntryRedirectTarget("/village")).toBeNull();
    expect(zogEntryRedirectTarget("/zone-of-genius/assessment")).toBeNull();
    expect(zogEntryRedirectTarget("/zone-of-genius/appleseed")).toBeNull();
  });
});
