// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en/common.json";

const familiar = vi.hoisted(() => ({ state: { loading: false, version: "v2" } }));
vi.mock("../useFamiliar", () => ({ useFamiliar: () => familiar.state }));

import YourAiHouseLine from "../YourAiHouseLine";

void i18n.use(initReactI18next).init({ lng: "en", resources: { en: { translation: en } }, interpolation: { escapeValue: false } });

const render = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <YourAiHouseLine />
    </MemoryRouter>,
  );

// A small in-memory storage: the line reads «the version taken on this device» through it.
const store = new Map<string, string>();
const localStorageStub = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  clear: () => store.clear(),
};

describe("AI-08: the Your AI line in Home", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: localStorageStub });
    store.clear();
    familiar.state = { loading: false, version: "v2" };
  });

  it("is absent until the player has taken their AI", () => {
    expect(render()).toBe("");
  });

  it("after a take of the current prompt: the badge, one line, a link back to the place", () => {
    localStorageStub.setItem("familiar:copiedVersion", "v2");
    const html = render();
    expect(html).toContain("data-your-ai-house");
    expect(html).toContain("Your AI is in your chat.");
    expect(html).toContain('href="/game/your-ai"');
    expect(html).not.toContain("Update my AI");
  });

  it("when the prompt changed since the take: says so and offers «Update my AI»", () => {
    localStorageStub.setItem("familiar:copiedVersion", "v1");
    const html = render();
    expect(html).toContain("Your AI is behind");
    expect(html).toContain("Update my AI");
    expect(html).toContain('href="/game/your-ai"');
  });

  it("does not call it behind while the saves are still loading", () => {
    localStorageStub.setItem("familiar:copiedVersion", "v1");
    familiar.state = { loading: true, version: "guest" };
    const html = render();
    expect(html).not.toContain("Update my AI");
    expect(html).toContain("Your AI is in your chat.");
  });
});
