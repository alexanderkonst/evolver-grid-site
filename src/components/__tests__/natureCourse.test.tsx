import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { createInstance } from "i18next";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    functions: { invoke: vi.fn() },
  },
}));

import CourseSalesPage from "@/components/CourseSalesPage";
import CoursePage from "@/pages/CoursePage";
import { COURSE_SALES, courseLandingPath, courseSalesPath, getCourseSales } from "@/data/courseSales";
import { NATURE, NATURE_COURSE_MODULES, NATURE_COURSE_PATH } from "@/data/courses/nature";
import { getRegistryModule } from "@/data/modules";
import { flattenEpisodes, getPublishedModules, isEpisodeReady } from "@/lib/coursePlayer";
import { getPageTitle } from "@/lib/pageTitles";
import { pathUsesLayoutShell } from "@/lib/shellRoutes";
import en from "@/locales/en/common.json";
import ru from "@/locales/ru/common.json";
import es from "@/locales/es/common.json";

/** Nature mini-training v1.0 (issue #551): the course data, the player page, the landing and the routes. */

const source = (rel: string) => readFileSync(new URL(rel, import.meta.url), "utf8");

const i18n = createInstance();
void i18n.use(initReactI18next).init({ resources: { en: { translation: en } }, lng: "en", fallbackLng: "en", interpolation: { escapeValue: false } });

const render = (node: React.ReactNode, path: string) =>
  renderToStaticMarkup(
    <I18nextProvider i18n={i18n}>
      <HelmetProvider>
        <MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>
      </HelmetProvider>
    </I18nextProvider>,
  );

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

const anchors = (html: string) =>
  [...html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({
    href: m[1],
    text: m[2].replace(/<[^>]+>/g, "").trim(),
  }));

const lookup = (tree: unknown, key: string): unknown =>
  key.split(".").reduce<unknown>((node, k) => (node as Record<string, unknown> | undefined)?.[k], tree);

const EXPECTED: [string, string, string][] = [
  ["intro", "N01", "Nothing Is Wrong With You"],
  ["year", "Y01", "Your Year Starts on Your Birthday"],
  ["year", "Y02", "Two Years Turn at Once"],
  ["month", "M01", "The Moon Has Four Seasons"],
  ["month", "M02", "The Seed Half"],
  ["month", "M03", "The Harvest Half"],
  ["month", "M04", "The Cycle Starts After You Celebrate"],
  ["week", "W01", "Seven Lights Named Your Week"],
  ["week", "W02", "Don't Run the Week in One Mode"],
  ["day", "D01", "One Turn of the Earth"],
  ["day", "D02", "Waves Inside the Day"],
  ["outro", "O01", "Read Your Now"],
];

describe("Nature course data", () => {
  const episodes = flattenEpisodes(NATURE_COURSE_MODULES);

  it("is Nature, v1.0, Fundamental / General, with the first-version changelog", () => {
    expect(NATURE.slug).toBe("nature");
    expect(NATURE.title).toBe("Nature");
    expect(NATURE.version).toBe("1.0");
    expect(NATURE.level).toBe("Fundamental");
    expect(NATURE.category).toBe("General");
    expect(NATURE.changelog).toEqual([{ version: "1.0", date: NATURE.updatedAt, summary: "First public version" }]);
    expect(en.courseNature.tagline).toBe("Aligns You With Natural Rhythms");
    expect(NATURE.taglineKey).toBe("courseNature.tagline");
  });

  it("holds the 12 episodes of section 4, in order, in six modules", () => {
    expect(NATURE_COURSE_MODULES.map((m) => m.id)).toEqual(["intro", "year", "month", "week", "day", "outro"]);
    const flat = NATURE_COURSE_MODULES.flatMap((m) => m.episodes.map((e) => [m.id, e.code, e.title]));
    expect(flat).toEqual(EXPECTED);
    expect(new Set(episodes.map((e) => e.code)).size).toBe(12);
  });

  it("has a promise line in English, Russian and Spanish for every episode", () => {
    for (const e of episodes) {
      expect(e.promiseKey, e.code).toBe(`courseNature.promise.${e.code}`);
      for (const [lng, tree] of [["en", en], ["ru", ru], ["es", es]] as const) {
        const line = lookup(tree, e.promiseKey!);
        expect(typeof line, `${lng} ${e.code}`).toBe("string");
        expect((line as string).length, `${lng} ${e.code}`).toBeGreaterThan(0);
      }
    }
  });

  it("has every video empty and no infographic until they land", () => {
    for (const e of episodes) {
      expect(e.youtubeId, e.code).toBe("");
      expect(isEpisodeReady(e), e.code).toBe(false);
      expect(e.infographic, e.code).toBeUndefined();
    }
    // An empty id is listed, unlike a TBD id.
    expect(flattenEpisodes(getPublishedModules(NATURE_COURSE_MODULES))).toHaveLength(12);
  });

  it("ends at Equilibrium", () => {
    expect(NATURE.outro?.to).toBe("/build/equilibrium");
  });
});

describe("Nature course page", () => {
  it("lives at the public GROW route inside the shell", () => {
    expect(NATURE_COURSE_PATH).toBe("/grow/nature");
    expect(pathUsesLayoutShell(NATURE_COURSE_PATH)).toBe(true);
    expect(getPageTitle(NATURE_COURSE_PATH)).toBe("Nature");
  });

  it.each(EXPECTED)("%s · %s renders its title, promise line, empty-video state and Ask AI card", (_module, code, title) => {
    const html = render(<CoursePage course={NATURE} />, `${NATURE_COURSE_PATH}?ep=${code}`);
    expect(html).toContain(escapeHtml(title));
    expect(html).toContain(escapeHtml(lookup(en, `courseNature.promise.${code}`) as string));
    // Calm empty state: a message, no embed.
    expect(html).toContain('data-testid="video-coming-soon"');
    expect(html).toContain("Video coming soon");
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("youtube-nocookie.com");
    // Video first, then the Ask AI button.
    expect(html).toContain(`data-testid="ask-ai-${code}"`);
    expect(html.indexOf("video-coming-soon")).toBeLessThan(html.indexOf(`ask-ai-${code}`));
  });

  it("fills the Ask AI prompt on the page (a guest gets the «ask me» wording)", () => {
    const html = render(<CoursePage course={NATURE} />, `${NATURE_COURSE_PATH}?ep=Y01`);
    expect(html).toContain("My birthday is (ask me). Today is ");
    expect(html).not.toMatch(/\{birthday\}|\{today\}/);
  });

  it("lists all 12 episodes in the contents", () => {
    const html = render(<CoursePage course={NATURE} />, NATURE_COURSE_PATH);
    for (const [, code, title] of EXPECTED) {
      expect(html).toContain(`>${code}<`);
      expect(html).toContain(escapeHtml(title));
    }
    expect(html).toContain("Episode 1 of 12");
    expect(html).toContain("Free mini-training");
  });

  it("shows the video when an id is set, and no empty state", () => {
    const [first, ...rest] = NATURE_COURSE_MODULES;
    const withId = {
      ...NATURE,
      modules: [{ ...first, episodes: [{ ...first.episodes[0], youtubeId: "abc123" }] }, ...rest],
    };
    const html = render(<CoursePage course={withId} />, `${NATURE_COURSE_PATH}?ep=N01`);
    expect(html).toContain("https://www.youtube-nocookie.com/embed/abc123");
    expect(html).not.toContain("video-coming-soon");
  });

  it("the last episode links to Equilibrium, not to Zone of Genius", () => {
    const html = render(<CoursePage course={NATURE} />, `${NATURE_COURSE_PATH}?ep=O01`);
    const hrefs = anchors(html).map((a) => a.href);
    expect(hrefs).toContain("/build/equilibrium");
    expect(anchors(html)).toContainEqual({ href: "/build/equilibrium", text: "Open Equilibrium" });
    expect(hrefs).not.toContain("/zone-of-genius/entry");
    // A middle episode shows no door yet.
    const early = render(<CoursePage course={NATURE} />, `${NATURE_COURSE_PATH}?ep=M01`);
    expect(early).not.toContain("Let the watch read it for you");
    expect(html).toContain("Let the watch read it for you");
  });
});

describe("Nature landing and registry", () => {
  const sales = getCourseSales("nature")!;
  const html = render(<CourseSalesPage course={sales} />, courseSalesPath("nature"));

  it("has a landing at /academy/nature that starts the mini-training at /grow/nature", () => {
    expect(sales).toBeDefined();
    expect(courseLandingPath("nature")).toBe("/academy/nature");
    expect(sales.cta).toEqual({ kind: "start", label: "Start the mini-training", to: "/grow/nature" });
    expect(anchors(html)).toContainEqual({ href: "/grow/nature", text: "Start the mini-training" });
    expect(sales.versioning?.version).toBe(NATURE.version);
  });

  it("lists every module and episode from the course data", () => {
    for (const m of NATURE_COURSE_MODULES) {
      expect(html).toContain(escapeHtml(m.title));
      for (const e of m.episodes) expect(html).toContain(escapeHtml(e.title));
    }
  });

  it("sits after Consciousness Meets Science in the landing order and is related from the others", () => {
    const slugs = COURSE_SALES.map((c) => c.slug);
    expect(slugs.indexOf("nature")).toBe(slugs.indexOf("consciousness-meets-science") + 1);
    const cms = render(<CourseSalesPage course={getCourseSales("consciousness-meets-science")!} />, "/academy/consciousness-meets-science");
    expect(anchors(cms).map((a) => a.href)).toContain("/academy/nature");
  });

  it("is in the module registry as a free Academy course", () => {
    const m = getRegistryModule("nature");
    expect(m?.title).toBe("Nature");
    expect(m?.price).toBe("Free");
    expect(m?.startRoute).toBe("/grow/nature");
    expect(m?.place).toBe("academy");
  });
});

describe("Nature routes and the Grow row", () => {
  it("routes /grow/nature and puts the row right after Consciousness Meets Science", () => {
    expect(source("../../App.tsx")).toContain('<Route path="/grow/nature" element={<Nature />} />');
    const panel = source("../game/SectionsPanel.tsx");
    expect(panel.indexOf("consciousnessMeetsScienceRow,\n        natureRow,")).toBeGreaterThan(-1);
    const shell = source("../game/GameShell.tsx");
    expect(shell.indexOf("consciousness-meets-science")).toBeLessThan(shell.indexOf('id: "nature"'));
    const rooms = source("../../data/placeRooms.ts");
    expect(rooms.indexOf('id: "consciousness-meets-science"')).toBeLessThan(rooms.indexOf('id: "nature"'));
  });

  it("the shell nav label exists in every locale", () => {
    for (const tree of [en, ru, es]) {
      expect(typeof lookup(tree, "gameShell.nav.transformation.modules.nature")).toBe("string");
    }
  });
});
