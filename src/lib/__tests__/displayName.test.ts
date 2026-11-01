import { describe, expect, it } from "vitest";
import { displayName, displayNameOrYou } from "../displayName";

describe("displayName: one player name (W2)", () => {
  it("a signed-in player reads their first name, from a first name or a full name", () => {
    expect(displayName({ signedIn: true, firstName: "Sasha" })).toBe("Sasha");
    expect(displayName({ signedIn: true, firstName: "  Aleksandr   Konstantinov " })).toBe("Aleksandr");
  });

  it("falls back to the name the player gave, then to none", () => {
    expect(displayName({ signedIn: true, firstName: null, givenName: "Mira" })).toBe("Mira");
    expect(displayName({ signedIn: true, firstName: "", givenName: "  " })).toBeNull();
    expect(displayName({ signedIn: true })).toBeNull();
  });

  it("the profile first name wins over the given name", () => {
    expect(displayName({ signedIn: true, firstName: "Sasha", givenName: "Mira" })).toBe("Sasha");
  });

  it("a guest never carries a name, even when a profile row is in memory", () => {
    expect(displayName({ signedIn: false, firstName: "Aleksandr", givenName: "Mira" })).toBeNull();
    expect(displayNameOrYou({ signedIn: false, firstName: "Aleksandr" })).toBe("you");
    expect(displayNameOrYou({ signedIn: false, firstName: "Aleksandr" }, "tú")).toBe("tú");
  });

  it("a signed-in player never reads «guest», an email or a placeholder", () => {
    for (const first of ["Guest", "guest", "GUEST", "Invitado", "Гость", "Player", "Anonymous"]) {
      expect(displayName({ signedIn: true, firstName: first }), first).toBeNull();
    }
    expect(displayName({ signedIn: true, firstName: "sasha@example.com" })).toBeNull();
    // A placeholder in the profile still lets the given name through.
    expect(displayName({ signedIn: true, firstName: "Guest", givenName: "Mira" })).toBe("Mira");
    expect(displayNameOrYou({ signedIn: true, firstName: "Guest" })).toBe("you");
  });

  it("strips control characters and caps the length", () => {
    expect(displayName({ signedIn: true, firstName: "Sa\u0000sha" })).toBe("Sa");
    expect(displayName({ signedIn: true, firstName: "x".repeat(200) })?.length).toBe(40);
  });

  it("works in Cyrillic and with accents", () => {
    expect(displayName({ signedIn: true, firstName: "Александр Константинов" })).toBe("Александр");
    expect(displayName({ signedIn: true, firstName: "José María" })).toBe("José");
  });
});
