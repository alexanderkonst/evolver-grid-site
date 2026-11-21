import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BOOK_CARDS, BOOK_CHAPTERS } from "../infographicBook";

const root = resolve(__dirname, "../../..");
const bookMd = readFileSync(resolve(root, "docs/assets/infographics/BOOK.md"), "utf8");

describe("the Book of Infographics data (C4) follows BOOK.md", () => {
  it("lists every card BOOK.md lists, and every image is served from public/ and kept in docs/", () => {
    const listed = [...bookMd.matchAll(/\]\(book\/([^)]+\.png)\)/g)].map((m) => m[1]);
    const unique = [...new Set(listed)];
    const served = BOOK_CARDS.map((c) => c.image.replace("/infographics/book/", ""));
    expect([...served].sort()).toEqual([...unique].sort());
    for (const file of served) {
      expect(existsSync(resolve(root, "public/infographics/book", file)), `public/${file}`).toBe(true);
      expect(existsSync(resolve(root, "docs/assets/infographics/book", file)), `docs/${file}`).toBe(true);
    }
  });

  it("has unique card ids, chapter numbers and image paths", () => {
    for (const list of [BOOK_CARDS.map((c) => c.id), BOOK_CHAPTERS.map((c) => c.number), BOOK_CARDS.map((c) => c.image)]) {
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it("every card title appears in BOOK.md, and no card says 'psychoactive'", () => {
    for (const c of BOOK_CARDS) {
      expect(bookMd, c.title).toContain(c.title);
      expect(`${c.title} ${c.caption ?? ""}`).not.toMatch(/psychoactive/i);
    }
  });

  it("every chapter title appears in BOOK.md", () => {
    for (const ch of BOOK_CHAPTERS) expect(bookMd, ch.title).toContain(ch.title);
  });

  it("a chapter is a grid of cards, a quiet 'coming' row, or a part heading: never an empty grid", () => {
    for (const ch of BOOK_CHAPTERS) {
      if (ch.cards.length > 0) expect(ch.coming, ch.number).toBe(false);
    }
    // Every "(to make)" line in BOOK.md contents is a coming chapter.
    const toMake = bookMd.split("\n").filter((l) => /^\s*(\d|-)/.test(l) && l.includes("(to make)"));
    expect(toMake.length).toBe(BOOK_CHAPTERS.filter((c) => c.coming && c.number !== "4.2").length);
    expect(BOOK_CHAPTERS.filter((c) => c.coming && c.cards.length === 0).length).toBeGreaterThan(0);
  });

  it("keeps BOOK.md order: 1, 2, 2.1 … 5", () => {
    expect(BOOK_CHAPTERS.map((c) => c.number)).toEqual(["1", "2", "2.1", "2.2", "2.3", "2.4", "3", "3.1", "3.2", "3.3", "4", "4.1", "4.2", "5"]);
    expect(BOOK_CHAPTERS.find((c) => c.number === "3.1")?.cards).toHaveLength(19);
    expect(BOOK_CHAPTERS.find((c) => c.number === "5")?.cards).toHaveLength(4);
  });
});
