import { describe, expect, it } from "vitest";
import {
  PARTICLE_MAX,
  PARTICLE_MIN,
  checkParticle,
  cleanFirstName,
  containsProfanity,
  stripContactDetails,
} from "@/lib/particleGuard";

describe("stripContactDetails", () => {
  it("removes links, emails and phone numbers", () => {
    expect(stripContactDetails("see https://example.com/me now")).toBe("see now");
    expect(stripContactDetails("write me: anna@mail.com ok")).toBe("write me: ok");
    expect(stripContactDetails("call +34 612 345 678 anytime")).toBe("call anytime");
    expect(stripContactDetails("www.mysite.io is mine")).toBe("is mine");
    expect(stripContactDetails("find me on mysite.com")).toBe("find me on");
    expect(stripContactDetails("follow @someone please")).toBe("follow please");
  });

  it("keeps ordinary text, short numbers and punctuation", () => {
    expect(stripContactDetails("Here I first heard myself, in 2024.")).toBe(
      "Here I first heard myself, in 2024.",
    );
  });

  it("collapses whitespace", () => {
    expect(stripContactDetails("  a   b \n c ")).toBe("a b c");
  });
});

describe("containsProfanity", () => {
  it("catches the list in English, Spanish and Russian", () => {
    expect(containsProfanity("what the fuck")).toBe(true);
    expect(containsProfanity("esto es una mierda")).toBe(true);
    expect(containsProfanity("какое говно")).toBe(true);
    expect(containsProfanity("ну ты и мудак")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(containsProfanity("SHIT")).toBe(true);
    expect(containsProfanity("Mierda")).toBe(true);
    expect(containsProfanity("ГОВНО")).toBe(true);
  });

  it("sees through leetspeak, repeats and separators", () => {
    expect(containsProfanity("sh!t")).toBe(true);
    expect(containsProfanity("$hit")).toBe(true);
    expect(containsProfanity("5h1t")).toBe(true);
    expect(containsProfanity("fvck")).toBe(true);
    expect(containsProfanity("fuuuuck")).toBe(true);
    expect(containsProfanity("f u c k")).toBe(true);
    expect(containsProfanity("f.u.c.k")).toBe(true);
    expect(containsProfanity("b1tch")).toBe(true);
    expect(containsProfanity("m13rd4")).toBe(true);
  });

  it("catches a Russian word typed with Latin lookalikes", () => {
    expect(containsProfanity("xуй")).toBe(true);
  });

  it("leaves ordinary words alone", () => {
    expect(containsProfanity("Here I first heard myself.")).toBe(false);
    expect(containsProfanity("Welcome, friend. Assume nothing, class!")).toBe(false);
    expect(containsProfanity("A great day to be alive!")).toBe(false);
    expect(containsProfanity("Scunthorpe, a cocktail and a classic")).toBe(false);
    expect(containsProfanity("Aquí escuché mi propia voz por primera vez")).toBe(false);
    expect(containsProfanity("Здесь я впервые услышал себя")).toBe(false);
    expect(containsProfanity("un cono de helado")).toBe(false);
  });
});

describe("checkParticle", () => {
  it("accepts a kind line and returns it cleaned", () => {
    const res = checkParticle("  Here I first heard myself.  ");
    expect(res).toEqual({ ok: true, text: "Here I first heard myself." });
  });

  it("strips contact details before storing", () => {
    const res = checkParticle("You are enough. Write to me at anna@mail.com");
    expect(res).toEqual({ ok: true, text: "You are enough. Write to me at" });
  });

  it("enforces the 3 to 140 length on the cleaned text", () => {
    expect(checkParticle("hi")).toMatchObject({ ok: false, reason: "too_short" });

    // only a link: nothing is left after cleaning
    expect(checkParticle("https://example.com")).toMatchObject({ ok: false, reason: "too_short" });

    expect(checkParticle("x".repeat(PARTICLE_MIN)).ok).toBe(true);
    expect(checkParticle("x".repeat(PARTICLE_MAX)).ok).toBe(true);
    expect(checkParticle("x".repeat(PARTICLE_MAX + 1))).toMatchObject({ ok: false, reason: "too_long" });
  });

  it("counts characters, not UTF-16 units", () => {
    expect(checkParticle("🌙".repeat(PARTICLE_MAX)).ok).toBe(true);
    expect(checkParticle("🌙".repeat(PARTICLE_MAX + 1)).ok).toBe(false);
  });

  it("kindly asks to rephrase on profanity", () => {
    const res = checkParticle("this place is shit");
    expect(res).toMatchObject({ ok: false, reason: "profanity" });
    expect(res).toMatchObject({ message: expect.stringMatching(/another way/i) });
  });
});

describe("cleanFirstName", () => {
  it("returns null when empty", () => {
    expect(cleanFirstName("   ")).toBeNull();
  });

  it("keeps a plain first name", () => {
    expect(cleanFirstName(" Анна ")).toBe("Анна");
    expect(cleanFirstName("María-José")).toBe("María-José");
  });

  it("drops links, digits and symbols", () => {
    expect(cleanFirstName("Sam 555 123 4567")).toBe("Sam");
    expect(cleanFirstName("Lu<script>")).toBe("Luscript");
  });

  it("drops a name that fails the profanity guard instead of blocking", () => {
    expect(cleanFirstName("fuck")).toBeNull();
  });

  it("caps the length", () => {
    expect(cleanFirstName("a".repeat(80))?.length).toBe(30);
  });
});
